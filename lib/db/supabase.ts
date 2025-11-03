/**
 * Supabase client configuration
 */

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '@/config/constants';

// Client-side Supabase client (uses anon key)
export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey
);

// Server-side Supabase client (uses service role key for admin operations)
export const supabaseAdmin = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
