/**
 * Supabase Admin client (service role — server-side ONLY)
 * Bypasses RLS. Use for webhooks and privileged operations.
 *
 * Lazy-initialized so that `next build` can collect page data
 * even when SUPABASE_SERVICE_ROLE_KEY is not set in the local env.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

function buildClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!url || !serviceRoleKey) {
    // Return a stub client that will fail only if actually used at runtime.
    // This avoids breaking `next build` when envs aren't set locally.
    // eslint-disable-next-line no-console
    console.warn('[supabase-admin] Missing env (SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL). Client will not work at runtime.');
    return createClient(url || 'https://placeholder.supabase.co', serviceRoleKey || 'placeholder-key', {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop: string | symbol) {
    if (!cached) cached = buildClient();
    const value = (cached as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === 'function' ? (value as Function).bind(cached) : value;
  },
});
