/**
 * Supabase client configuration
 */

import { createClient } from '@supabase/supabase-js';
import { getEnvConfig } from '@/lib/utils/env-validation';

const env = getEnvConfig();

// Client-side Supabase client (uses anon key)
export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Server-side Supabase client (uses service role key for admin operations)
export const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
