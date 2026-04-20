/**
 * Referral helpers — server side only
 * Use these from any API route that converts a visitor (waitlist, ambassador apply,
 * future auth signup) to credit the originating ambassador.
 */

import { supabaseAdmin } from './supabase/admin';
import { sendReferralCredited } from './email/resend';

const REFERRAL_COOKIE = 'adv_referral_code';
const COMMISSION_PER_REFERRAL_CENTS = 500; // 5 € par filleul crédité

export function extractReferralCode(req: Request): string | null {
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`${REFERRAL_COOKIE}=([^;]+)`));
  if (match) return decodeURIComponent(match[1]);
  // Fallback: ?r= in referer URL
  try {
    const referer = req.headers.get('referer');
    if (referer) {
      const u = new URL(referer);
      const r = u.searchParams.get('r');
      if (r) return r;
    }
  } catch {}
  return null;
}

/**
 * Credits the ambassador owning the referral_code by incrementing total_referrals.
 * Silent no-op if code is invalid or ambassador doesn't exist.
 */
export async function creditReferral(code: string | null, kind: 'waitlist' | 'ambassador' | 'signup'): Promise<void> {
  if (!code) return;
  try {
    // Look up ambassador
    const { data: amb } = await supabaseAdmin
      .from('ambassadors')
      .select('id, email, display_name, total_referrals, total_commission_cents')
      .eq('referral_code', code)
      .maybeSingle();
    if (!amb) return;

    const newTotal = (amb.total_referrals || 0) + 1;
    const newCommission = (amb.total_commission_cents || 0) + COMMISSION_PER_REFERRAL_CENTS;

    // Increment counter + commission atomically (best-effort — we compute here)
    await supabaseAdmin
      .from('ambassadors')
      .update({
        total_referrals: newTotal,
        total_commission_cents: newCommission,
      })
      .eq('id', amb.id);

    // Log event (best-effort — table may not exist yet)
    await supabaseAdmin
      .from('referral_events')
      .insert({ ambassador_id: amb.id, code, kind })
      .then(() => {}, () => {}); // swallow — table is optional for MVP

    // Fire-and-forget email notification
    if (amb.email && amb.display_name) {
      sendReferralCredited(amb.email, {
        display_name: amb.display_name,
        referral_code: code,
        kind,
        total_referrals: newTotal,
        commission_cents: newCommission,
      }).catch(() => {});
    }
  } catch (e) {
    // Don't let referral errors break the main flow
    console.warn('[referral] credit failed', (e as Error).message);
  }
}
