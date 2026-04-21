/**
 * Stripe server-side client
 * Used only in API routes / server actions. NEVER import in client code.
 */

import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY;

if (!stripeSecret) {
  // eslint-disable-next-line no-console
  console.warn('[stripe] STRIPE_SECRET_KEY is not set — commerce features disabled');
}

export const stripe = stripeSecret
  ? new Stripe(stripeSecret, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
      appInfo: { name: 'Adventurer', version: '5.0.0' },
    })
  : (null as unknown as Stripe);

// Commission tiers (basis points, 10000 = 100%)
export const PLATFORM_FEES = {
  coachBookingBps: 1500,     // 15%
  marketplaceSaleBps: 500,   // 5%
  rentalBps: 800,            // 8% (future)
} as const;

export function computeSplit(grossCents: number, feeBps: number) {
  const platformFeeCents = Math.round((grossCents * feeBps) / 10000);
  const payoutCents = grossCents - platformFeeCents;
  return { platformFeeCents, payoutCents };
}

export function isStripeReady(): boolean {
  return !!stripeSecret;
}
