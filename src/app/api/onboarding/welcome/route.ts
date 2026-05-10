/**
 * POST /api/onboarding/welcome
 * Triggers the 5-email onboarding series for a freshly signed-up user.
 *
 * Idempotent : on stocke un flag `onboarding_email_sent_at` dans user_metadata
 * (côté Supabase Auth). Si déjà envoyé, on no-op pour ne pas spammer.
 *
 * Body : { language?: 'fr' | 'en' }
 *
 * Auth : requires Bearer token (the user themselves trigger this from AuthBridge
 * just after signup).
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/supabase/auth-guard';
import { allow, getClientIp } from '@/lib/rate-limit';
import { sendOnboardingSeries } from '@/lib/email/onboarding-emails';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(req: NextRequest) {
  const { user, error: authError } = await requireAuth(req);
  if (authError) return authError;
  if (!user || !user.email) {
    return NextResponse.json({ error: 'No email on user' }, { status: 400 });
  }

  // Rate limit : 3 envois max par IP/heure (en dev on peut signer up plusieurs fois).
  const ip = getClientIp(req);
  if (!allow(`onboarding-welcome:${ip}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Trop de demandes' }, { status: 429 });
  }

  // Vérifie s'il a déjà été envoyé (idempotency).
  if (serviceRoleKey) {
    try {
      const admin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data: u } = await admin.auth.admin.getUserById(user.id);
      const meta = (u?.user?.user_metadata || {}) as Record<string, unknown>;
      if (meta.onboarding_email_sent_at) {
        return NextResponse.json({ skipped: 'already-sent' });
      }
    } catch (e) {
      // Si la lecture admin échoue, on continue quand même — meilleur effort.
      console.error('[onboarding-welcome] admin read failed', (e as Error).message);
    }
  }

  // Détermine la langue (du body, défaut fr).
  const body = (await req.json().catch(() => ({}))) as { language?: string };
  const lang: 'fr' | 'en' = body.language === 'en' ? 'en' : 'fr';

  // Récupère le nom préféré : user_metadata.name, sinon l'email avant @.
  let name: string | null = null;
  if (serviceRoleKey) {
    try {
      const admin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data: u } = await admin.auth.admin.getUserById(user.id);
      const meta = (u?.user?.user_metadata || {}) as Record<string, unknown>;
      name = (meta.name as string) || (user.email.split('@')[0] || null);
    } catch {
      name = user.email.split('@')[0] || null;
    }
  } else {
    name = user.email.split('@')[0] || null;
  }

  // IMPORTANT (Marc panel V6) : on pose le flag AVANT l'envoi pour éviter
  // qu'un crash en plein milieu de la série conduise à renvoyer les 5 emails
  // depuis zéro à la prochaine reconnexion. Mieux vaut un email manqué qu'un
  // double Welcome dans la boîte d'un user.
  if (serviceRoleKey) {
    try {
      const admin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      await admin.auth.admin.updateUserById(user.id, {
        user_metadata: { onboarding_email_sent_at: new Date().toISOString() },
      });
    } catch (e) {
      console.error('[onboarding-welcome] admin update (pre-send) failed', (e as Error).message);
      // Si l'écriture du flag échoue, on n'envoie PAS — on préfère manquer que dupliquer.
      return NextResponse.json({ error: 'Idempotency flag write failed' }, { status: 500 });
    }
  }

  try {
    await sendOnboardingSeries(user.email, name, lang);
    return NextResponse.json({ ok: true, scheduled: 4 });
  } catch (e) {
    console.error('[onboarding-welcome] send failed', (e as Error).message);
    // Le flag est déjà posé : pas de retry automatique au prochain login.
    // L'utilisateur pourra demander un renvoi manuel via un bouton dédié si besoin.
    return NextResponse.json({ error: 'Email send failed' }, { status: 500 });
  }
}
