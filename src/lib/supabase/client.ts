/**
 * Supabase Client Configuration
 *
 * Real Supabase client for Adventurer.
 * Project: adventurer (avldyvgvouzpeprygvyw)
 * Region: West EU (Paris) eu-west-3
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://avldyvgvouzpeprygvyw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2bGR5dmd2b3V6cGVwcnlndnl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDQxMDksImV4cCI6MjA5MTMyMDEwOX0.-DyevMIdDTMZKadOL4nCsZA-7hGnMkGQLUWtt8glod8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export { supabaseUrl, supabaseAnonKey };
