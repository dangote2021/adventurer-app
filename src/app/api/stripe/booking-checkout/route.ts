/**
 * POST /api/stripe/booking-checkout
 * Creates a Stripe Checkout session for a coach booking with 15% platform fee.
 * Uses Stripe Connect "destination charges" so funds land on Adventurer
 * and are transferred to the coach minus the commission.
 *
 * Body: { coachId, clientId, sport, sessionDate (ISO), durationMinutes, location?, clientNote? }
 * Returns: { url }
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe, isStripeReady, PLATFORM_FEES, computeSplit } from '@/lib/stripe/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAuth, APP_ORIGIN } from '@/lib/supabase/auth-guard';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // Auth check
  const { user, error: authError } = await requireAuth(req);
  if (authError) return authError;

  if (!isStripeReady()) {
    return NextResponse.json({ error: 'Stripe not configured.' }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const { coachId, sport, sessionDate, durationMinutes, location, clientNote } = body as {
    coachId?: string;
    sport?: string;
    sessionDate?: string;
    durationMinutes?: number;
    location?: string;
    clientNote?: string;
  };
  // Use authenticated user ID instead of trusting client-supplied clientId
  const clientId = user!.id;

  if (!coachId || !clientId || !sport || !sessionDate || !durationMinutes) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  const { data: coach, error: coachErr } = await supabaseAdmin
    .from('coaches')
    .select('id, display_name, hourly_rate_cents, currency, stripe_account_id, stripe_charges_enabled, is_published')
    .eq('id', coachId)
    .single();

  if (coachErr || !coach) {
    return NextResponse.json({ error: 'Coach not found.' }, { status: 404 });
  }
  if (!coach.is_published) {
    return NextResponse.json({ error: 'Coach not available for booking.' }, { status: 409 });
  }
  if (!coach.stripe_account_id || !coach.stripe_charges_enabled) {
    return NextResponse.json({ error: 'Coach has not finished Stripe onboarding.' }, { status: 409 });
  }

  const priceCents = Math.round((coach.hourly_rate_cents * durationMinutes) / 60);
  const { platformFeeCents, payoutCents } = computeSplit(priceCents, PLATFORM_FEES.coachBookingBps);

  // Pre-create booking record in 'pending' state
  const { data: booking, error: insErr } = await supabaseAdmin
    .from('coach_bookings')
    .insert({
      coach_id: coachId,
      client_id: clientId,
      sport,
      session_date: sessionDate,
      duration_minutes: durationMinutes,
      location,
      client_note: clientNote,
      price_cents: priceCents,
      platform_fee_cents: platformFeeCents,
      coach_payout_cents: payoutCents,
      currency: coach.currency,
      status: 'pending',
    })
    .select('id')
    .single();

  if (insErr || !booking) {
    return NextResponse.json({ error: 'Could not create booking.' }, { status: 500 });
  }

  // Never trust request origin header for redirect URLs (security: open redirect)
  const origin = APP_ORIGIN;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: coach.currency,
          unit_amount: priceCents,
          product_data: {
            name: `Session ${sport} avec ${coach.display_name}`,
            description: `${durationMinutes} min — ${location || 'Online'}`,
          },
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: platformFeeCents,
      transfer_data: { destination: coach.stripe_account_id },
      metadata: {
        booking_id: booking.id,
        kind: 'coach_booking',
      },
    },
    metadata: { booking_id: booking.id, kind: 'coach_booking' },
    success_url: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/booking/cancelled?booking_id=${booking.id}`,
    customer_email: undefined, // supabase user session handles identity
  });

  await supabaseAdmin
    .from('coach_bookings')
    .update({ stripe_checkout_session_id: session.id })
    .eq('id', booking.id);

  return NextResponse.json({ url: session.url, bookingId: booking.id });
}
