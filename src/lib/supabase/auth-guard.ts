/**
 * API Route Auth Guard — Verifies Supabase JWT from Authorization header.
 * Use in every API route that requires authentication.
 *
 * Usage:
 *   const { user, error } = await requireAuth(req);
 *   if (error) return error; // Returns 401 NextResponse
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function requireAuth(req: NextRequest): Promise<{
  user: { id: string; email?: string } | null;
  error: NextResponse | null;
}> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.replace('Bearer ', '');

  // Create a per-request Supabase client with the user's token
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      ),
    };
  }

  return { user: { id: user.id, email: user.email }, error: null };
}

/** Allowed app origin for Stripe redirect URLs (never trust request headers) */
export const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'https://adventurer-outdoor.vercel.app';
