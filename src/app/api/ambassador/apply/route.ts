/**
 * POST /api/ambassador/apply
 * Public endpoint used by the "Ambassadors" landing page form.
 * Creates a prospect in the ambassadors table and triggers a welcome email.
 *
 * Body: {
 *   email, display_name, sport, city, country,
 *   instagram_handle?, strava_link?, youtube_link?, audience_size?
 * }
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendAmbassadorWelcome } from '@/lib/email/resend';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 20);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const {
    email,
    display_name,
    sport,
    city,
    country,
    instagram_handle,
    strava_link,
    youtube_link,
    audience_size,
  } = body as Record<string, string | number | undefined>;

  if (!email || !display_name || !sport || !city || !country) {
    return NextResponse.json(
      { error: 'Missing required fields: email, display_name, sport, city, country.' },
      { status: 400 }
    );
  }

  const base = `${slugify(String(display_name))}-${slugify(String(sport)).slice(0, 6)}`;
  let referral_code = base;
  // Dedupe
  const { data: existing } = await supabaseAdmin
    .from('ambassadors')
    .select('id')
    .eq('referral_code', referral_code)
    .maybeSingle();
  if (existing) {
    referral_code = `${base}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
  }

  const { data, error } = await supabaseAdmin
    .from('ambassadors')
    .insert({
      email: String(email),
      display_name: String(display_name),
      sport: String(sport),
      city: String(city),
      country: String(country),
      instagram_handle: instagram_handle ? String(instagram_handle) : null,
      strava_link: strava_link ? String(strava_link) : null,
      youtube_link: youtube_link ? String(youtube_link) : null,
      audience_size: audience_size ? Number(audience_size) : null,
      referral_code,
      status: 'prospect',
    })
    .select('id, display_name, sport, referral_code, email')
    .single();

  if (error) {
    console.error('[ambassador] DB error:', error.message);
    return NextResponse.json({ error: 'Could not process application.' }, { status: 500 });
  }

  sendAmbassadorWelcome(data.email, {
    display_name: data.display_name,
    referral_code: data.referral_code,
    sport: data.sport,
  }).catch(() => {});

  return NextResponse.json({ ok: true, referral_code });
}
