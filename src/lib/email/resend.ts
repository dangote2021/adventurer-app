/**
 * Resend transactional emails (server-side only)
 * Graceful no-op if RESEND_API_KEY is not set (useful during local dev).
 */

import { Resend } from 'resend';
import { APP_ORIGIN } from '@/lib/supabase/auth-guard';

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM || 'Adventurer <adventurer.app.outdoor@gmail.com>';
const defaultReplyTo = 'adventurer.app.outdoor@gmail.com';

const resend = apiKey ? new Resend(apiKey) : null;

function euros(cents: number) {
  return (cents / 100).toFixed(2) + ' €';
}

function safeSend(args: { to: string; subject: string; html: string; replyTo?: string }) {
  if (!resend) {
    // eslint-disable-next-line no-console
    console.warn('[resend] RESEND_API_KEY not set — skipping email to', args.to);
    return Promise.resolve({ skipped: true });
  }
  return resend.emails.send({
    from,
    to: args.to,
    subject: args.subject,
    html: args.html,
    replyTo: args.replyTo || defaultReplyTo,
  });
}

export async function sendBookingConfirmation(
  to: string,
  booking: {
    id: string;
    sport: string;
    session_date: string;
    duration_minutes: number;
    location?: string | null;
    price_cents: number;
    coach?: { display_name?: string } | null;
  }
) {
  const coachName = booking.coach?.display_name || 'ton coach';
  const when = new Date(booking.session_date).toLocaleString('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
  });
  return safeSend({
    to,
    subject: `Réservation confirmée — ${booking.sport} avec ${coachName}`,
    html: `
      <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1B4332">
        <h1 style="color:#1B4332">C'est confirmé !</h1>
        <p>Ta session de <strong>${booking.sport}</strong> avec <strong>${coachName}</strong> est réservée.</p>
        <table style="border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:6px 12px 6px 0"><strong>Date</strong></td><td>${when}</td></tr>
          <tr><td style="padding:6px 12px 6px 0"><strong>Durée</strong></td><td>${booking.duration_minutes} min</td></tr>
          <tr><td style="padding:6px 12px 6px 0"><strong>Lieu</strong></td><td>${booking.location || 'Online'}</td></tr>
          <tr><td style="padding:6px 12px 6px 0"><strong>Montant</strong></td><td>${euros(booking.price_cents)}</td></tr>
        </table>
        <p>Ton coach te contactera avant la session via la messagerie de l'app.</p>
        <p style="color:#888;font-size:12px;margin-top:32px">Tu reçois cet email parce que tu as réservé une session sur Adventurer. Référence : ${booking.id}</p>
      </div>
    `,
  });
}

export async function sendMarketplaceConfirmation(
  to: string,
  order: {
    id: string;
    price_cents: number;
    shipping_cents: number;
    item?: { title?: string } | null;
  }
) {
  const title = order.item?.title || 'ton article';
  const total = (order.price_cents + order.shipping_cents) / 100;
  return safeSend({
    to,
    subject: `Achat confirmé — ${title}`,
    html: `
      <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1B4332">
        <h1 style="color:#1B4332">Achat confirmé !</h1>
        <p>Merci pour ton achat de <strong>${title}</strong>.</p>
        <p>Montant total : <strong>${total.toFixed(2)} €</strong></p>
        <p>Le vendeur sera notifié et te contactera via la messagerie de l'app pour l'expédition.</p>
        <p style="color:#888;font-size:12px;margin-top:32px">Référence commande : ${order.id}</p>
      </div>
    `,
  });
}

export async function sendAmbassadorWelcome(
  to: string,
  ambassador: { display_name: string; referral_code: string; sport: string }
) {
  return safeSend({
    to,
    subject: `Bienvenue chez les ambassadeurs Adventurer 🏔️`,
    html: `
      <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1B4332">
        <h1 style="color:#1B4332">Salut ${ambassador.display_name},</h1>
        <p>Tu fais désormais partie des ambassadeurs Adventurer pour la communauté <strong>${ambassador.sport}</strong>.</p>
        <p>Ton code de parrainage personnel :</p>
        <p style="font-size:24px;font-weight:bold;background:#F2F9F5;padding:16px;border-radius:12px;text-align:center;letter-spacing:2px">${ambassador.referral_code}</p>
        <p>Chaque inscription qui utilise ce code te crédite <strong>5 €</strong> (payés via Stripe dès 50 € cumulés).</p>
        <h3>Comment l'utiliser ?</h3>
        <ul>
          <li>Lien direct : ${APP_ORIGIN}/?r=${ambassador.referral_code}</li>
          <li>Partage en story Instagram avec le hashtag #AdventurerTribe</li>
          <li>Glisse-le dans ta bio Strava ou YouTube</li>
        </ul>
        <p>On reste en contact sur <a href="mailto:ambassadors@adventurer-outdoor.com">ambassadors@adventurer-outdoor.com</a>.</p>
      </div>
    `,
  });
}

export async function sendReferralCredited(
  to: string,
  args: {
    display_name: string;
    referral_code: string;
    kind: 'waitlist' | 'ambassador' | 'signup';
    total_referrals: number;
    commission_cents: number;
  }
) {
  const kindLabel = {
    waitlist: 'une inscription à la waitlist',
    ambassador: 'une nouvelle candidature ambassadeur',
    signup: 'une inscription',
  }[args.kind];
  return safeSend({
    to,
    subject: `+1 filleul ${args.referral_code} — merci ${args.display_name} !`,
    html: `
      <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1B4332">
        <h1 style="color:#1B4332">🎉 Nouveau filleul !</h1>
        <p>Salut ${args.display_name},</p>
        <p>Quelqu'un vient d'utiliser ton code <strong style="font-family:monospace;background:#F2F9F5;padding:4px 8px;border-radius:6px">${args.referral_code}</strong> pour ${kindLabel}.</p>
        <table style="border-collapse:collapse;margin:20px 0;width:100%">
          <tr>
            <td style="padding:12px;background:#F2F9F5;border-radius:12px 0 0 12px;width:50%">
              <div style="color:#888;font-size:12px;text-transform:uppercase">Filleuls cumulés</div>
              <div style="color:#2D6A4F;font-size:24px;font-weight:bold">${args.total_referrals}</div>
            </td>
            <td style="padding:12px;background:#FFF3E0;border-radius:0 12px 12px 0;width:50%">
              <div style="color:#888;font-size:12px;text-transform:uppercase">Commissions dues</div>
              <div style="color:#F77F00;font-size:24px;font-weight:bold">${(args.commission_cents / 100).toFixed(2)} €</div>
            </td>
          </tr>
        </table>
        <p>On paye les commissions via Stripe dès 50 € cumulés. Continue comme ça !</p>
        <p style="color:#888;font-size:12px;margin-top:32px">Tu reçois cet email parce que tu es ambassadeur Adventurer. Lien de partage : ${APP_ORIGIN}/?r=${args.referral_code}</p>
      </div>
    `,
  });
}

export async function sendWaitlistConfirmation(to: string, feature: string) {
  return safeSend({
    to,
    subject: `Tu es sur la liste d'attente Adventurer`,
    html: `
      <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1B4332">
        <h1 style="color:#1B4332">C'est noté !</h1>
        <p>On te préviendra dès que <strong>${feature}</strong> sera disponible sur Adventurer.</p>
        <p>En attendant, tu peux déjà explorer la plateforme : <a href="${APP_ORIGIN}">ouvrir l'app</a></p>
      </div>
    `,
  });
}
