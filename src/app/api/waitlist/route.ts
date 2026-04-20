/**
 * POST /api/waitlist
 * Body: { email, feature, locale? }
 * Stores email in waitlist table and sends confirmation via Resend.
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendWaitlistConfirmation } from '@/lib/email/resend';
import { extractReferralCode, creditReferral } from '@/lib/referral';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { email, feature, locale, metadata } = body as {
    email?: string;
    feature?: string;
    locale?: string;
    metadata?: Record<string, unknown>;
  };

  if (!email || !feature) {
    return NextResponse.json({ error: 'Missing email or feature.' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('waitlist')
    .upsert({ email, feature, locale: locale || 'fr', metadata }, { onConflict: 'email,feature' });

  if (error && error.code !== '23505') {
    console.error('[waitlist] DB error:', error.message);
    return NextResponse.json({ error: 'Could not add to waitlist.' }, { status: 500 });
  }

  // Credit the referrer if this visitor came via an ambassador link
  const referralCode = extractReferralCode(req);
  creditReferral(referralCode, 'waitlist').catch(() => {});

  sendWaitlistConfirmation(email, feature).catch(() => {});
  return NextResponse.json({ ok: true, referred_by: referralCode });
}
