/**
 * POST /api/onboarding/resend-welcome
 * Renvoie le mail de bienvenue (welcome only, J+0) à l'utilisateur connecté.
 *
 * Utile quand l'utilisateur n'a pas reçu le mail (spam, mauvaise adresse, etc.)
 * ou veut juste le retrouver. Bouton dans le profil (S9 panel V6 — Marc).
 *
 * Limite : 2 renvois par heure et par utilisateur (anti-abus).
 * NE renvoie PAS la séquence complète (les tutos suivent leur scheduling
 * d'origine via Resend), uniquement le Welcome.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/supabase/auth-guard';
import { allow, getClientIp } from '@/lib/rate-limit';
import { sendWelcomeOnly } from '@/lib/email/onboarding-emails';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { user, error: authError } = await requireAuth(req);
  if (authError) return authError;
  if (!user || !user.email) {
    return NextResponse.json({ error: 'No email on user' }, { status: 400 });
  }

  // Rate limit : 2 renvois max par IP/heure ET par user/heure.
  const ip = getClientIp(req);
  if (!allow(`resend-welcome:ip:${ip}`, 2, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Trop de demandes' }, { status: 429 });
  }
  if (!allow(`resend-welcome:user:${user.id}`, 2, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Limite atteinte (2 renvois/heure)' }, { status: 429 });
  }

  const body = (await req.json().catch(() => ({}))) as { language?: string };
  const lang: 'fr' | 'en' = body.language === 'en' ? 'en' : 'fr';

  const name = user.email.split('@')[0] || null;

  try {
    await sendWelcomeOnly(user.email, name, lang);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[onboarding-resend-welcome] send failed', (e as Error).message);
    return NextResponse.json({ error: 'Email send failed' }, { status: 500 });
  }
}
