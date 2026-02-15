import { hashPassword } from "@/lib/security/password";
import { supabaseAdmin } from "@/lib/db/supabase";
import { toDatabaseUserId } from "@/lib/utils/user-id";

interface ResolveDatabaseUserOptions {
  allowProvision?: boolean;
  email?: string | null;
  name?: string | null;
}

interface PostgrestErrorLike {
  code?: string;
  message?: string;
  details?: string;
}

function asPostgrestError(error: unknown): PostgrestErrorLike {
  return (error || {}) as PostgrestErrorLike;
}

function isMissingColumnError(error: unknown): boolean {
  return asPostgrestError(error).code === "42703";
}

function isUniqueViolation(error: unknown): boolean {
  return asPostgrestError(error).code === "23505";
}

function normalizeEmail(email?: string | null): string | null {
  if (!email) {
    return null;
  }

  return email.trim().toLowerCase();
}

function normalizeName(
  name: string | null | undefined,
  normalizedEmail: string | null,
  clerkUserId: string,
): string {
  const trimmed = name?.trim();
  if (trimmed) {
    return trimmed;
  }

  if (normalizedEmail) {
    return normalizedEmail.split("@")[0];
  }

  return `user_${clerkUserId.slice(-8)}`;
}

async function lookupUserIdByEmail(email: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    if (!isMissingColumnError(error)) {
      console.error("Error looking up user by email:", error);
    }
    return null;
  }

  return data?.id ?? null;
}

async function lookupUserIdByClerkId(clerkUserId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();

  if (error) {
    if (!isMissingColumnError(error)) {
      console.error("Error looking up user by clerk_user_id:", error);
    }
    return null;
  }

  return data?.id ?? null;
}

async function attachClerkIdToUser(
  userId: string,
  clerkUserId: string,
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("users")
    .update({ clerk_user_id: clerkUserId })
    .eq("id", userId);

  if (error && !isMissingColumnError(error) && !isUniqueViolation(error)) {
    console.error("Error attaching clerk_user_id to user:", error);
  }
}

/**
 * Resolves the canonical users.id for a Clerk-authenticated identity.
 * If allowProvision is true, it will attempt to create a compatible users row
 * for first-time authenticated users to satisfy shares.user_id FK constraints.
 */
export async function resolveDatabaseUserId(
  clerkUserId: string | null | undefined,
  options: ResolveDatabaseUserOptions = {},
): Promise<string | null> {
  const dbUserId = toDatabaseUserId(clerkUserId);
  if (!clerkUserId || !dbUserId) {
    return null;
  }

  const normalizedEmail = normalizeEmail(options.email);
  const displayName = normalizeName(options.name, normalizedEmail, clerkUserId);

  const { data: existingById, error: lookupByIdError } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("id", dbUserId)
    .maybeSingle();

  if (lookupByIdError) {
    console.error("Error looking up user by id:", lookupByIdError);
  } else if (existingById?.id) {
    return existingById.id;
  }

  const existingByClerkId = await lookupUserIdByClerkId(clerkUserId);
  if (existingByClerkId) {
    return existingByClerkId;
  }

  if (normalizedEmail) {
    const existingByEmail = await lookupUserIdByEmail(normalizedEmail);
    if (existingByEmail) {
      await attachClerkIdToUser(existingByEmail, clerkUserId);
      return existingByEmail;
    }
  }

  if (!options.allowProvision) {
    return null;
  }

  const fallbackEmail = normalizedEmail ?? `${dbUserId}@clerk.local`;
  const placeholderPasswordHash = await hashPassword(
    `${clerkUserId}:${dbUserId}:pureshare`,
  );

  const insertCandidates: Record<string, unknown>[] = [
    {
      id: dbUserId,
      clerk_user_id: clerkUserId,
      email: fallbackEmail,
      name: displayName,
      password_hash: placeholderPasswordHash,
      email_verified: true,
    },
    {
      id: dbUserId,
      email: fallbackEmail,
      name: displayName,
      password_hash: placeholderPasswordHash,
      email_verified: true,
    },
    {
      id: dbUserId,
      email: fallbackEmail,
      name: displayName,
      password_hash: placeholderPasswordHash,
    },
    {
      id: dbUserId,
      email: fallbackEmail,
      name: displayName,
    },
    {
      id: dbUserId,
      email: fallbackEmail,
    },
    {
      id: dbUserId,
    },
  ];

  for (const payload of insertCandidates) {
    const { data: insertedUser, error: insertError } = await supabaseAdmin
      .from("users")
      .insert(payload)
      .select("id")
      .single();

    if (!insertError && insertedUser?.id) {
      return insertedUser.id;
    }

    if (insertError && isUniqueViolation(insertError)) {
      const { data: existingIdRow } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("id", dbUserId)
        .maybeSingle();
      if (existingIdRow?.id) {
        return existingIdRow.id;
      }

      if (normalizedEmail) {
        const existingByEmail = await lookupUserIdByEmail(normalizedEmail);
        if (existingByEmail) {
          await attachClerkIdToUser(existingByEmail, clerkUserId);
          return existingByEmail;
        }
      }
    }
  }

  console.error("Unable to resolve or provision database user for Clerk user", {
    clerkUserId,
    dbUserId,
  });
  return null;
}
