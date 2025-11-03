/**
 * Supabase client configuration
 */

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '@/config/constants';

// Client-side Supabase client (uses anon key)
export const supabase = createClient(
  SUPABASE_CONFIG.url || 'https://placeholder.supabase.co',
  SUPABASE_CONFIG.anonKey || 'placeholder-key'
);

// Server-side Supabase client (uses service role key for admin operations)
export const supabaseAdmin = createClient(
  SUPABASE_CONFIG.url || 'https://placeholder.supabase.co',
  SUPABASE_CONFIG.serviceRoleKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
