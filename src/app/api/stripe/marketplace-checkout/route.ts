/**
 * POST /api/stripe/marketplace-checkout
 * Creates a Stripe Checkout session for a marketplace purchase with 5% platform fee.
 *
 * Body: { itemId, buyerId, shippingAddress? }
 * Returns: { url, orderId }
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
  const { itemId, shippingAddress, buyerNote } = body as {
    itemId?: string;
    shippingAddress?: Record<string, unknown>;
    buyerNote?: string;
  };
  // Use authenticated user ID instead of trusting client-supplied buyerId
  const buyerId = user!.id;

  if (!itemId) {
    return NextResponse.json({ error: 'Missing itemId.' }, { status: 400 });
  }

  const { data: item, error: itemErr } = await supabaseAdmin
    .from('market_items')
    .select('id, seller_id, title, price, shipping_cost_cents, is_available, type')
    .eq('id', itemId)
    .single();

  if (itemErr || !item) return NextResponse.json({ error: 'Item not found.' }, { status: 404 });
  if (!item.is_available) return NextResponse.json({ error: 'Item already sold.' }, { status: 409 });
  if (item.type !== 'sell') return NextResponse.json({ error: 'Item not for sale.' }, { status: 409 });

  const { data: seller } = await supabaseAdmin
    .from('seller_accounts')
    .select('stripe_account_id, stripe_charges_enabled')
    .eq('id', item.seller_id)
    .maybeSingle();

  if (!seller?.stripe_account_id || !seller.stripe_charges_enabled) {
    return NextResponse.json(
      { error: 'Seller has not completed Stripe onboarding.' },
      { status: 409 }
    );
  }

  const priceCents = Math.round(Number(item.price) * 100);
  const shippingCents = item.shipping_cost_cents || 0;
  const grossCents = priceCents + shippingCents;
  const { platformFeeCents, payoutCents } = computeSplit(grossCents, PLATFORM_FEES.marketplaceSaleBps);

  const { data: order, error: orderErr } = await supabaseAdmin
    .from('marketplace_orders')
    .insert({
      item_id: itemId,
      seller_id: item.seller_id,
      buyer_id: buyerId,
      price_cents: priceCents,
      shipping_cents: shippingCents,
      platform_fee_cents: platformFeeCents,
      seller_payout_cents: payoutCents,
      currency: 'eur',
      status: 'pending',
      shipping_address: shippingAddress,
      buyer_note: buyerNote,
    })
    .select('id')
    .single();

  if (orderErr || !order) {
    return NextResponse.json({ error: 'Could not create order.' }, { status: 500 });
  }

  const origin = APP_ORIGIN;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          unit_amount: grossCents,
          product_data: {
            name: item.title,
            description: shippingCents > 0 ? `Incluant ${(shippingCents / 100).toFixed(2)}€ de livraison` : undefined,
          },
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: platformFeeCents,
      transfer_data: { destination: seller.stripe_account_id },
      metadata: { order_id: order.id, kind: 'marketplace_order' },
    },
    metadata: { order_id: order.id, kind: 'marketplace_order' },
    success_url: `${origin}/marketplace/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/marketplace/cancelled?order_id=${order.id}`,
  });

  await supabaseAdmin
    .from('marketplace_orders')
    .update({ stripe_checkout_session_id: session.id })
    .eq('id', order.id);

  return NextResponse.json({ url: session.url, orderId: order.id });
}
