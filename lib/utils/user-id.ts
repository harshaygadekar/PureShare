import { validate as isUuid, v5 as uuidv5 } from 'uuid';

const DEFAULT_NAMESPACE = '2b64cc32-8f0f-4f90-9e17-972f4f8ef36e';
const USER_ID_NAMESPACE = process.env.CLERK_USER_ID_NAMESPACE || DEFAULT_NAMESPACE;

/**
 * Normalizes external auth user IDs (e.g. Clerk user_*) into a UUID shape expected by DB columns.
 * UUID inputs are preserved as-is. Non-UUID inputs are deterministically UUIDv5-hashed.
 */
export function toDatabaseUserId(userId: string | null | undefined): string | null {
  if (!userId) {
    return null;
  }

  if (isUuid(userId)) {
    return userId;
  }

  return uuidv5(userId, USER_ID_NAMESPACE);
}
