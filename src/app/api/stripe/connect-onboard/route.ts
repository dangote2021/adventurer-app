/**
 * POST /api/stripe/connect-onboard
 * Creates a Stripe Connect Express account for a coach or seller
 * and returns an onboarding link. Called from the CoachHub "Devenir coach"
 * form and from the marketplace "Vendre" flow when first publishing.
 *
 * Body: { userId: string, email: string, kind: 'coach' | 'seller' }
 * Returns: { url: string, accountId: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe, isStripeReady } from '@/lib/stripe/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAuth, APP_ORIGIN } from '@/lib/supabase/auth-guard';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // Auth check
  const { user, error: authError } = await requireAuth(req);
  if (authError) return authError;

  if (!isStripeReady()) {
    return NextResponse.json(
      { error: 'Stripe is not configured on the server.' },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const { kind } = body as {
    kind?: 'coach' | 'seller';
  };
  // Use authenticated user instead of trusting client-supplied userId/email
  const userId = user!.id;
  const email = user!.email || '';

  if (!kind) {
    return NextResponse.json({ error: 'Missing kind (coach or seller).' }, { status: 400 });
  }

  const table = kind === 'coach' ? 'coaches' : 'seller_accounts';

  // Re-use existing Connect account if present
  const { data: existing } = await supabaseAdmin
    .from(table)
    .select('stripe_account_id')
    .eq('id', userId)
    .maybeSingle();

  let accountId = existing?.stripe_account_id as string | undefined;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: { userId, kind },
    });
    accountId = account.id;

    if (kind === 'coach') {
      await supabaseAdmin
        .from('coaches')
        .upsert(
          {
            id: userId,
            display_name: email.split('@')[0],
            sports: [],
            stripe_account_id: accountId,
          },
          { onConflict: 'id' }
        );
    } else {
      await supabaseAdmin
        .from('seller_accounts')
        .upsert({ id: userId, stripe_account_id: accountId }, { onConflict: 'id' });
    }
  }

  const origin = APP_ORIGIN;

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/stripe/refresh?kind=${kind}`,
    return_url: `${origin}/stripe/return?kind=${kind}`,
    type: 'account_onboarding',
  });

  return NextResponse.json({ url: link.url, accountId });
}
