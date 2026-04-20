/**
 * GET /api/admin/stats?token=XXX
 * Returns ambassadors + waitlist + monetization stats.
 * Protected by a simple shared token (ADMIN_TOKEN env var).
 * This is an MVP admin endpoint — replace with proper Supabase RBAC when scaling.
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  const expected = process.env.ADMIN_TOKEN;

  if (!expected) {
    return NextResponse.json({ error: 'ADMIN_TOKEN not configured on the server.' }, { status: 503 });
  }
  if (!token || token !== expected) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  // Ambassadors
  const { data: ambassadors, error: aErr } = await supabaseAdmin
    .from('ambassadors')
    .select('id, email, display_name, sport, city, country, instagram_handle, audience_size, referral_code, status, total_referrals, total_commission_cents, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  // Waitlist
  const { data: waitlist, error: wErr } = await supabaseAdmin
    .from('waitlist')
    .select('id, email, feature, locale, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  // Coach bookings aggregate
  const { data: bookings } = await supabaseAdmin
    .from('coach_bookings')
    .select('id, status, price_cents, platform_fee_cents, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  // Marketplace orders aggregate
  const { data: orders } = await supabaseAdmin
    .from('marketplace_orders')
    .select('id, status, price_cents, platform_fee_cents, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  const error = aErr || wErr;
  if (error) {
    console.error('[admin/stats] DB error:', error.message);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }

  // Aggregate stats
  const ambassadorsByStatus = (ambassadors || []).reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});
  const waitlistByFeature = (waitlist || []).reduce<Record<string, number>>((acc, w) => {
    acc[w.feature] = (acc[w.feature] || 0) + 1;
    return acc;
  }, {});

  const totalRevenueCents =
    (bookings || []).filter(b => b.status === 'paid' || b.status === 'completed')
      .reduce((s, b) => s + (b.platform_fee_cents || 0), 0) +
    (orders || []).filter(o => o.status === 'paid' || o.status === 'delivered')
      .reduce((s, o) => s + (o.platform_fee_cents || 0), 0);

  return NextResponse.json({
    ambassadors: ambassadors || [],
    waitlist: waitlist || [],
    bookings: bookings || [],
    orders: orders || [],
    stats: {
      ambassadorsCount: (ambassadors || []).length,
      ambassadorsByStatus,
      waitlistCount: (waitlist || []).length,
      waitlistByFeature,
      bookingsCount: (bookings || []).length,
      ordersCount: (orders || []).length,
      platformRevenueCents: totalRevenueCents,
    },
  });
}
