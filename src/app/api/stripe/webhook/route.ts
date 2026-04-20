/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events for bookings, marketplace orders and Connect account updates.
 *
 * Events handled:
 *  - checkout.session.completed       → mark booking/order as paid, send confirmation email
 *  - payment_intent.payment_failed    → mark as cancelled
 *  - charge.refunded                  → mark as refunded
 *  - account.updated                  → update stripe_charges_enabled / stripe_payouts_enabled
 *
 * Setup: STRIPE_WEBHOOK_SECRET env var, and point Stripe dashboard to
 *        https://adventurer-outdoor.vercel.app/api/stripe/webhook
 */

import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe, isStripeReady } from '@/lib/stripe/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendBookingConfirmation, sendMarketplaceConfirmation } from '@/lib/email/resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!isStripeReady()) {
    return NextResponse.json({ error: 'Stripe not configured.' }, { status: 503 });
  }

  const sig = req.headers.get('stripe-signature');
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !whSecret) {
    return NextResponse.json({ error: 'Missing signature or webhook secret.' }, { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, whSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Invalid signature: ${msg}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const kind = session.metadata?.kind;
        if (kind === 'coach_booking') {
          const bookingId = session.metadata?.booking_id;
          if (bookingId) {
            await supabaseAdmin
              .from('coach_bookings')
              .update({
                status: 'paid',
                stripe_payment_intent_id: session.payment_intent as string,
              })
              .eq('id', bookingId);
            const { data: b } = await supabaseAdmin
              .from('coach_bookings')
              .select('*, coach:coaches(display_name), client:profiles!coach_bookings_client_id_fkey(name)')
              .eq('id', bookingId)
              .single();
            if (b && session.customer_details?.email) {
              await sendBookingConfirmation(session.customer_details.email, b);
            }
          }
        } else if (kind === 'marketplace_order') {
          const orderId = session.metadata?.order_id;
          if (orderId) {
            await supabaseAdmin
              .from('marketplace_orders')
              .update({
                status: 'paid',
                stripe_payment_intent_id: session.payment_intent as string,
              })
              .eq('id', orderId);
            const { data: o } = await supabaseAdmin
              .from('marketplace_orders')
              .select('*, item:market_items(title)')
              .eq('id', orderId)
              .single();
            if (o) {
              await supabaseAdmin
                .from('market_items')
                .update({ is_available: false, sold_at: new Date().toISOString() })
                .eq('id', o.item_id);
              if (session.customer_details?.email) {
                await sendMarketplaceConfirmation(session.customer_details.email, o);
              }
            }
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const kind = pi.metadata?.kind;
        if (kind === 'coach_booking' && pi.metadata?.booking_id) {
          await supabaseAdmin
            .from('coach_bookings')
            .update({ status: 'cancelled' })
            .eq('id', pi.metadata.booking_id);
        } else if (kind === 'marketplace_order' && pi.metadata?.order_id) {
          await supabaseAdmin
            .from('marketplace_orders')
            .update({ status: 'cancelled' })
            .eq('id', pi.metadata.order_id);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const kind = charge.metadata?.kind;
        if (kind === 'coach_booking' && charge.metadata?.booking_id) {
          await supabaseAdmin
            .from('coach_bookings')
            .update({ status: 'refunded' })
            .eq('id', charge.metadata.booking_id);
        } else if (kind === 'marketplace_order' && charge.metadata?.order_id) {
          await supabaseAdmin
            .from('marketplace_orders')
            .update({ status: 'refunded' })
            .eq('id', charge.metadata.order_id);
        }
        break;
      }

      case 'account.updated': {
        const acc = event.data.object as Stripe.Account;
        const charges = !!acc.charges_enabled;
        const payouts = !!acc.payouts_enabled;
        const onboarding = !!acc.details_submitted;
        // Try coach then seller
        await supabaseAdmin
          .from('coaches')
          .update({
            stripe_charges_enabled: charges,
            stripe_payouts_enabled: payouts,
            stripe_onboarding_complete: onboarding,
          })
          .eq('stripe_account_id', acc.id);
        await supabaseAdmin
          .from('seller_accounts')
          .update({
            stripe_charges_enabled: charges,
            stripe_payouts_enabled: payouts,
            stripe_onboarding_complete: onboarding,
          })
          .eq('stripe_account_id', acc.id);
        break;
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[stripe webhook] handler error', err);
    // Still return 200 so Stripe doesn't retry indefinitely on transient errors
  }

  return NextResponse.json({ received: true });
}
