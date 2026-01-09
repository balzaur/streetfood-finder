import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "../config/env.js";

/**
 * Anon client for public safe reads
 * Uses the publishable anon key with RLS enabled
 */
export const supabaseAnon: SupabaseClient = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

/**
 * Service role client for server-side writes
 * Bypasses RLS - use with caution and proper authorization checks
 */
export const supabaseAdmin: SupabaseClient = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
