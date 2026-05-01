/**
 * Onboarding email series — sent on signup.
 *
 * Plan d'envoi :
 *  - J+0 : Welcome (immédiat) — ce que fait l'app + 1er conseil
 *  - J+1 : Explore — trouver les meilleurs spots autour de soi
 *  - J+3 : Coach IA — comment générer un plan d'entraînement
 *  - J+5 : Quick Match — trouver des partenaires d'aventure
 *  - J+7 : Carnet d'aventure — logger sa 1ère sortie + badges
 *
 * On utilise le scheduling natif de Resend (champ `scheduled_at` ISO) :
 * https://resend.com/docs/api-reference/emails/send-email
 *
 * Si Resend ne supporte pas le scheduling pour ton plan, le fallback est de
 * stocker les jobs dans une table Supabase et un cron Vercel les envoie.
 */

import { Resend } from 'resend';
import { APP_ORIGIN } from '@/lib/supabase/auth-guard';

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM || 'Adventurer <adventurer.app.outdoor@gmail.com>';
const defaultReplyTo = 'adventurer.app.outdoor@gmail.com';

const resend = apiKey ? new Resend(apiKey) : null;

type Lang = 'fr' | 'en';

interface ScheduledEmail {
  to: string;
  subject: string;
  html: string;
  scheduled_at?: string; // ISO date string, e.g. "2026-05-08T09:00:00Z"
}

async function sendOrSchedule(args: ScheduledEmail) {
  if (!resend) {
    // eslint-disable-next-line no-console
    console.warn('[onboarding-emails] RESEND_API_KEY not set — skipping email to', args.to);
    return { skipped: true };
  }
  // Resend SDK v4 accepts `scheduledAt` (camelCase). Older versions used
  // `scheduled_at` (snake_case). On envoie les deux par sécurité.
  const payload: Record<string, unknown> = {
    from,
    to: args.to,
    subject: args.subject,
    html: args.html,
    replyTo: defaultReplyTo,
  };
  if (args.scheduled_at) {
    payload.scheduledAt = args.scheduled_at;
    payload.scheduled_at = args.scheduled_at;
  }
  return resend.emails.send(payload as unknown as Parameters<Resend['emails']['send']>[0]);
}

/* =============================================================================
   TEMPLATE COMMON STYLES
   ============================================================================= */

function emailShell(opts: {
  lang: Lang;
  preheader: string;
  body: string;
  ctaUrl?: string;
  ctaLabel?: string;
}) {
  const fr = opts.lang === 'fr';
  const footerLegal = fr
    ? 'Tu reçois cet email parce que tu t\'es inscrit·e sur Adventurer. Tu peux te désabonner à tout moment depuis ton profil.'
    : 'You\'re receiving this email because you signed up on Adventurer. You can unsubscribe anytime from your profile.';

  const cta = opts.ctaUrl && opts.ctaLabel
    ? `<div style="text-align:center;margin:32px 0">
         <a href="${opts.ctaUrl}" style="display:inline-block;padding:14px 28px;background:#2D6A4F;color:#ffffff;text-decoration:none;border-radius:999px;font-weight:600;font-size:15px">${opts.ctaLabel}</a>
       </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="${opts.lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title></title>
</head>
<body style="margin:0;padding:0;background:#FEFAE0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,system-ui,sans-serif;color:#1B4332">
  <span style="display:none;max-height:0;overflow:hidden">${opts.preheader}</span>
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;background:#ffffff;border-radius:16px;margin-top:24px;margin-bottom:24px">
    <div style="text-align:center;margin-bottom:24px">
      <span style="font-size:32px">🏔️</span>
      <div style="font-weight:800;font-size:18px;color:#1B4332;letter-spacing:1px;margin-top:4px">ADVENTURER</div>
    </div>
    ${opts.body}
    ${cta}
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0">
    <p style="color:#9ca3af;font-size:12px;line-height:1.5;text-align:center">${footerLegal}</p>
    <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:8px">
      <a href="${APP_ORIGIN}" style="color:#2D6A4F">adventurer.app</a> ·
      <a href="mailto:adventurer.app.outdoor@gmail.com" style="color:#2D6A4F">contact</a>
    </p>
  </div>
</body>
</html>`;
}

/* =============================================================================
   J+0 — WELCOME
   ============================================================================= */

function welcomeBody(name: string, lang: Lang) {
  const fr = lang === 'fr';
  if (fr) {
    return `
      <h1 style="color:#1B4332;font-size:24px;margin:0 0 16px">Bienvenue${name ? ' ' + name : ''} 🌲</h1>
      <p style="font-size:16px;line-height:1.6;color:#374151">
        Tu viens de rejoindre Adventurer — l'app outdoor qui t'accompagne <strong>avant, pendant et après</strong> chaque aventure.
      </p>
      <div style="background:#F2F9F5;border-radius:12px;padding:20px;margin:24px 0">
        <p style="margin:0 0 12px;font-size:14px;color:#1B4332;font-weight:700">Ce que tu peux faire dès maintenant :</p>
        <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.7;color:#374151">
          <li><strong>Choisir tes sports</strong> (Terre / Mer / Air) pour personnaliser ton expérience</li>
          <li><strong>Explorer les spots</strong> autour de chez toi avec la météo en temps réel</li>
          <li><strong>Trouver des partenaires</strong> via Quick Match pour ta prochaine sortie</li>
          <li><strong>Construire ton plan</strong> d'entraînement avec le Coach IA</li>
        </ul>
      </div>
      <p style="font-size:14px;color:#6b7280;line-height:1.6">
        Pendant les prochains jours, on va t'envoyer 4 mini-tutos pour te montrer chaque feature en 2 minutes. Pas plus.
      </p>
      <p style="font-size:14px;color:#6b7280;line-height:1.6;margin-top:12px">
        En attendant, ouvre l'app et choisis tes sports — ça prend 30 secondes et c'est ce qui rend tout le reste utile.
      </p>
    `;
  }
  return `
    <h1 style="color:#1B4332;font-size:24px;margin:0 0 16px">Welcome${name ? ' ' + name : ''} 🌲</h1>
    <p style="font-size:16px;line-height:1.6;color:#374151">
      You just joined Adventurer — the outdoor app that supports you <strong>before, during and after</strong> every adventure.
    </p>
    <div style="background:#F2F9F5;border-radius:12px;padding:20px;margin:24px 0">
      <p style="margin:0 0 12px;font-size:14px;color:#1B4332;font-weight:700">What you can do right now:</p>
      <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.7;color:#374151">
        <li><strong>Pick your sports</strong> (Land / Water / Air) to personalize your feed</li>
        <li><strong>Explore spots</strong> near you with real-time weather</li>
        <li><strong>Find partners</strong> via Quick Match for your next outing</li>
        <li><strong>Build your training plan</strong> with the AI Coach</li>
      </ul>
    </div>
    <p style="font-size:14px;color:#6b7280;line-height:1.6">
      Over the next few days we'll send you 4 short tutorials covering each feature in 2 minutes. No more.
    </p>
    <p style="font-size:14px;color:#6b7280;line-height:1.6;margin-top:12px">
      In the meantime, open the app and pick your sports — takes 30 seconds and it's what makes everything else useful.
    </p>
  `;
}

/* =============================================================================
   J+1 — EXPLORE (trouver des spots)
   ============================================================================= */

function exploreBody(lang: Lang) {
  const fr = lang === 'fr';
  if (fr) {
    return `
      <h1 style="color:#1B4332;font-size:22px;margin:0 0 16px">Tuto 1/4 — Trouve les meilleurs spots autour de toi 🗺️</h1>
      <p style="font-size:16px;line-height:1.6;color:#374151">
        Tu pratiques en mode "je découvre" ou "je sais où je vais", peu importe — Adventurer te montre ce qui marche, en vrai, près de chez toi.
      </p>
      <div style="background:#F2F9F5;border-radius:12px;padding:20px;margin:20px 0">
        <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1B4332">Comment ça marche :</p>
        <ol style="margin:0;padding-left:20px;font-size:14px;line-height:1.8;color:#374151">
          <li>Onglet <strong>Explorer</strong> en bas → tu vois la carte ou la liste des spots</li>
          <li>Filtres par sport en haut — par défaut on n'affiche que tes activités</li>
          <li>Tape sur un spot pour voir : météo, conditions, qui y va, photos communauté</li>
          <li>Bouton "Quick Match" sur un spot pour signaler que tu y vas → d'autres pratiquants peuvent te rejoindre</li>
        </ol>
      </div>
      <p style="font-size:14px;color:#6b7280;line-height:1.6">
        💡 <strong>Tip terrain :</strong> active la géolocalisation pour avoir les conditions live exactes. La météo dans l'app utilise les sources les plus fiables (Météo France, NOAA, sources locales selon le sport).
      </p>
    `;
  }
  return `
    <h1 style="color:#1B4332;font-size:22px;margin:0 0 16px">Tutorial 1/4 — Find the best spots near you 🗺️</h1>
    <p style="font-size:16px;line-height:1.6;color:#374151">
      Whether you're discovering or you know exactly where you're going, Adventurer shows you what works, for real, near you.
    </p>
    <div style="background:#F2F9F5;border-radius:12px;padding:20px;margin:20px 0">
      <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1B4332">How it works:</p>
      <ol style="margin:0;padding-left:20px;font-size:14px;line-height:1.8;color:#374151">
        <li><strong>Explore</strong> tab at the bottom → map or list view</li>
        <li>Sport filters at the top — defaults to your selected sports only</li>
        <li>Tap a spot to see: weather, conditions, who's going, community photos</li>
        <li>"Quick Match" button on a spot lets you flag that you're going → others can join you</li>
      </ol>
    </div>
    <p style="font-size:14px;color:#6b7280;line-height:1.6">
      💡 <strong>Field tip:</strong> turn on geolocation for accurate live conditions. The in-app weather uses the most trusted sources (Météo France, NOAA, sport-specific).
    </p>
  `;
}

/* =============================================================================
   J+3 — COACH IA
   ============================================================================= */

function coachAIBody(lang: Lang) {
  const fr = lang === 'fr';
  if (fr) {
    return `
      <h1 style="color:#1B4332;font-size:22px;margin:0 0 16px">Tuto 2/4 — Un coach IA dans ta poche ✨</h1>
      <p style="font-size:16px;line-height:1.6;color:#374151">
        Tu te prépares pour un objectif (ultra-trail, traversée à kite, premier 4000…) ? Le Coach IA te génère un plan d'entraînement adapté à ton niveau, ton temps disponible et ton échéance.
      </p>
      <div style="background:#F2F9F5;border-radius:12px;padding:20px;margin:20px 0">
        <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1B4332">Comment lui parler :</p>
        <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#374151">
          Onglet <strong>Profil</strong> → "Coach IA" → décris ton objectif en une phrase :
        </p>
        <div style="background:#ffffff;border-left:3px solid #2D6A4F;padding:12px 16px;font-style:italic;color:#6b7280;font-size:13px">
          "Je veux finir un 50 km trail en septembre, je cours 30 km/sem en ce moment, j'ai 4 h dispos par semaine."
        </div>
        <p style="margin:12px 0 0;font-size:14px;line-height:1.7;color:#374151">
          → Plan semaine par semaine, conseils nutrition, recommandations matos. Sauvegardable et ajustable.
        </p>
      </div>
      <p style="font-size:14px;color:#6b7280;line-height:1.6">
        💡 <strong>Plus tu donnes de détails</strong> (volume actuel, niveau, contraintes type "je voyage 1 sem en mai"), <strong>plus le plan est pertinent</strong>. Pas besoin d'être parfait — l'IA te demande de préciser si nécessaire.
      </p>
    `;
  }
  return `
    <h1 style="color:#1B4332;font-size:22px;margin:0 0 16px">Tutorial 2/4 — An AI coach in your pocket ✨</h1>
    <p style="font-size:16px;line-height:1.6;color:#374151">
      Got a goal (ultra-trail, kite crossing, first 4000m peak...)? The AI Coach generates a training plan adapted to your level, available time, and deadline.
    </p>
    <div style="background:#F2F9F5;border-radius:12px;padding:20px;margin:20px 0">
      <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1B4332">How to talk to it:</p>
      <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#374151">
        <strong>Profile</strong> tab → "AI Coach" → describe your goal in one sentence:
      </p>
      <div style="background:#ffffff;border-left:3px solid #2D6A4F;padding:12px 16px;font-style:italic;color:#6b7280;font-size:13px">
        "I want to finish a 50K trail in September, currently running 30 km/week, 4 h available weekly."
      </div>
      <p style="margin:12px 0 0;font-size:14px;line-height:1.7;color:#374151">
        → Week-by-week plan, nutrition tips, gear recommendations. Saveable and adjustable.
      </p>
    </div>
    <p style="font-size:14px;color:#6b7280;line-height:1.6">
      💡 <strong>The more details you give</strong> (current volume, level, constraints like "I'm traveling for 1 week in May"), <strong>the more relevant the plan</strong>. No need to be perfect — the AI asks for clarifications when needed.
    </p>
  `;
}

/* =============================================================================
   J+5 — QUICK MATCH
   ============================================================================= */

function quickMatchBody(lang: Lang) {
  const fr = lang === 'fr';
  if (fr) {
    return `
      <h1 style="color:#1B4332;font-size:22px;margin:0 0 16px">Tuto 3/4 — Trouve un binôme pour ta prochaine sortie 🤝</h1>
      <p style="font-size:16px;line-height:1.6;color:#374151">
        L'outdoor en solo c'est bien, mais à deux ou trois c'est souvent plus safe et plus fun. Quick Match te connecte avec d'autres pratiquants <em>autour d'une sortie concrète</em>, pas via un swipe.
      </p>
      <div style="background:#F2F9F5;border-radius:12px;padding:20px;margin:20px 0">
        <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1B4332">Deux façons de l'utiliser :</p>
        <ol style="margin:0;padding-left:20px;font-size:14px;line-height:1.8;color:#374151">
          <li><strong>Publier une annonce</strong> : "Je vais à La Clusaz samedi en ski de rando, niveau intermédiaire" → les autres voient et peuvent rejoindre</li>
          <li><strong>Rejoindre une annonce</strong> : sur n'importe quel spot, tu vois qui prévoit d'y aller cette semaine → tape "Je viens" pour te connecter</li>
        </ol>
      </div>
      <p style="font-size:14px;color:#6b7280;line-height:1.6">
        💡 <strong>Pas de pression</strong> : on n'affiche jamais "X aventuriers près de chez toi" tant qu'il n'y a personne réellement. Si c'est vide chez toi, tu es la première personne à publier — c'est exactement comme ça que la communauté démarre.
      </p>
    `;
  }
  return `
    <h1 style="color:#1B4332;font-size:22px;margin:0 0 16px">Tutorial 3/4 — Find a partner for your next outing 🤝</h1>
    <p style="font-size:16px;line-height:1.6;color:#374151">
      Solo outdoor is fine, but with two or three it's often safer and more fun. Quick Match connects you with other practitioners <em>around a concrete outing</em>, not through a swipe.
    </p>
    <div style="background:#F2F9F5;border-radius:12px;padding:20px;margin:20px 0">
      <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1B4332">Two ways to use it:</p>
      <ol style="margin:0;padding-left:20px;font-size:14px;line-height:1.8;color:#374151">
        <li><strong>Post a heads-up</strong>: "Going to La Clusaz Saturday for ski touring, intermediate level" → others can see and join</li>
        <li><strong>Join a heads-up</strong>: on any spot, see who plans to go there this week → tap "I'm in" to connect</li>
      </ol>
    </div>
    <p style="font-size:14px;color:#6b7280;line-height:1.6">
      💡 <strong>No pressure</strong>: we never show "X adventurers near you" while there's actually no one. If it's empty in your area, you're the first to post — that's exactly how communities start.
    </p>
  `;
}

/* =============================================================================
   J+7 — TRACKING & CARNET
   ============================================================================= */

function trackingBody(lang: Lang) {
  const fr = lang === 'fr';
  if (fr) {
    return `
      <h1 style="color:#1B4332;font-size:22px;margin:0 0 16px">Tuto 4/4 — Logge ta première sortie 📒</h1>
      <p style="font-size:16px;line-height:1.6;color:#374151">
        Adventurer garde une trace de ce que tu vis dehors — pas pour les chiffres, mais pour le carnet d'aventure que tu pourras revisiter dans 10 ans.
      </p>
      <div style="background:#F2F9F5;border-radius:12px;padding:20px;margin:20px 0">
        <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1B4332">Comment logger :</p>
        <ol style="margin:0;padding-left:20px;font-size:14px;line-height:1.8;color:#374151">
          <li>Onglet <strong>Profil</strong> → "Tracking" → "Nouvelle sortie"</li>
          <li>Soit tu enregistres en live (GPS), soit tu importes a posteriori (GPX, manuel)</li>
          <li>Photos, notes, conditions du jour, ressenti — tout est optionnel mais ça vaut le coup</li>
          <li>Tu peux partager avec tes proches OU garder pour toi</li>
        </ol>
      </div>
      <p style="font-size:14px;color:#6b7280;line-height:1.6">
        💡 <strong>Sur les badges</strong> : on n'en distribue pas 50 pour rien. Quelques uns ont du sens (premier 4000, traversée des Pyrénées, 100 km cumulés sur un mois) — quand tu en obtiens un, c'est qu'il en valait la peine.
      </p>
      <p style="font-size:14px;color:#374151;line-height:1.6;margin-top:24px">
        Bonne aventure ! Si tu as des retours ou des bugs, réponds simplement à cet email — on lit tout.
      </p>
    `;
  }
  return `
    <h1 style="color:#1B4332;font-size:22px;margin:0 0 16px">Tutorial 4/4 — Log your first outing 📒</h1>
    <p style="font-size:16px;line-height:1.6;color:#374151">
      Adventurer keeps a record of what you experience outdoors — not for the numbers, but for the adventure journal you'll revisit in 10 years.
    </p>
    <div style="background:#F2F9F5;border-radius:12px;padding:20px;margin:20px 0">
      <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1B4332">How to log:</p>
      <ol style="margin:0;padding-left:20px;font-size:14px;line-height:1.8;color:#374151">
        <li><strong>Profile</strong> tab → "Tracking" → "New outing"</li>
        <li>Either record live (GPS) or import after (GPX, manual)</li>
        <li>Photos, notes, conditions, feelings — all optional but worth it</li>
        <li>Share with friends OR keep private</li>
      </ol>
    </div>
    <p style="font-size:14px;color:#6b7280;line-height:1.6">
      💡 <strong>About badges</strong>: we don't hand out 50 for nothing. A few mean something (first 4000m, Pyrenees crossing, 100 km in a month) — when you earn one, it's worth it.
    </p>
    <p style="font-size:14px;color:#374151;line-height:1.6;margin-top:24px">
      Have a great adventure! If you have feedback or bugs, just reply to this email — we read everything.
    </p>
  `;
}

/* =============================================================================
   PUBLIC API
   ============================================================================= */

/**
 * Sends the full onboarding email series at signup.
 * Welcome is sent immediately, the 4 tutorials are scheduled at J+1, J+3, J+5, J+7.
 *
 * If Resend doesn't honor `scheduled_at` on your plan, you'll need to either:
 *  - Send all 5 immediately (not recommended)
 *  - Use a Vercel cron + Supabase table to queue them yourself
 */
export async function sendOnboardingSeries(
  to: string,
  name: string | null,
  lang: Lang = 'fr'
) {
  const safeName = (name || '').split(' ')[0].slice(0, 30);
  const now = new Date();
  const dayOffset = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    // Send tutorials at 9am local Paris time for better open rates
    d.setHours(9, 0, 0, 0);
    return d.toISOString();
  };

  const subjects = lang === 'fr'
    ? {
        welcome: `Bienvenue sur Adventurer 🏔️`,
        explore: `Tuto 1/4 — Tes premiers spots`,
        coach: `Tuto 2/4 — Le Coach IA, comment t'en servir`,
        match: `Tuto 3/4 — Trouve un binôme outdoor`,
        tracking: `Tuto 4/4 — Logge ta 1ère sortie`,
      }
    : {
        welcome: `Welcome to Adventurer 🏔️`,
        explore: `Tutorial 1/4 — Your first spots`,
        coach: `Tutorial 2/4 — How to use the AI Coach`,
        match: `Tutorial 3/4 — Find an outdoor partner`,
        tracking: `Tutorial 4/4 — Log your first outing`,
      };

  const preheaders = lang === 'fr'
    ? {
        welcome: `Ce que tu peux faire dès maintenant + 4 tutos à venir`,
        explore: `Carte, filtres par sport, conditions live`,
        coach: `Un plan d'entraînement adapté à ton objectif`,
        match: `Trouve qui pratique près de chez toi`,
        tracking: `Carnet d'aventure et badges qui ont du sens`,
      }
    : {
        welcome: `What you can do now + 4 tutorials coming`,
        explore: `Map, sport filters, live conditions`,
        coach: `A training plan adapted to your goal`,
        match: `Find who practices near you`,
        tracking: `Adventure journal and badges that mean something`,
      };

  const ctaLabel = lang === 'fr' ? 'Ouvrir Adventurer' : 'Open Adventurer';

  // J+0 — Welcome (immediate, no scheduled_at)
  await sendOrSchedule({
    to,
    subject: subjects.welcome,
    html: emailShell({
      lang,
      preheader: preheaders.welcome,
      body: welcomeBody(safeName, lang),
      ctaUrl: APP_ORIGIN,
      ctaLabel,
    }),
  });

  // J+1 — Explore
  await sendOrSchedule({
    to,
    subject: subjects.explore,
    html: emailShell({
      lang,
      preheader: preheaders.explore,
      body: exploreBody(lang),
      ctaUrl: `${APP_ORIGIN}/?openTab=explore`,
      ctaLabel,
    }),
    scheduled_at: dayOffset(1),
  });

  // J+3 — Coach IA
  await sendOrSchedule({
    to,
    subject: subjects.coach,
    html: emailShell({
      lang,
      preheader: preheaders.coach,
      body: coachAIBody(lang),
      ctaUrl: `${APP_ORIGIN}/?openSubPage=coach-ai`,
      ctaLabel,
    }),
    scheduled_at: dayOffset(3),
  });

  // J+5 — Quick Match
  await sendOrSchedule({
    to,
    subject: subjects.match,
    html: emailShell({
      lang,
      preheader: preheaders.match,
      body: quickMatchBody(lang),
      ctaUrl: `${APP_ORIGIN}/?openSubPage=quick-match-list`,
      ctaLabel,
    }),
    scheduled_at: dayOffset(5),
  });

  // J+7 — Tracking
  await sendOrSchedule({
    to,
    subject: subjects.tracking,
    html: emailShell({
      lang,
      preheader: preheaders.tracking,
      body: trackingBody(lang),
      ctaUrl: `${APP_ORIGIN}/?openTab=profile`,
      ctaLabel,
    }),
    scheduled_at: dayOffset(7),
  });

  return { sent: true, scheduled: 4 };
}

/**
 * Sends just the welcome email (immediate).
 * Useful for testing or for re-sending only the welcome.
 */
export async function sendWelcomeOnly(to: string, name: string | null, lang: Lang = 'fr') {
  const safeName = (name || '').split(' ')[0].slice(0, 30);
  const subject = lang === 'fr' ? 'Bienvenue sur Adventurer 🏔️' : 'Welcome to Adventurer 🏔️';
  const preheader = lang === 'fr'
    ? 'Ce que tu peux faire dès maintenant + 4 tutos à venir'
    : 'What you can do now + 4 tutorials coming';
  return sendOrSchedule({
    to,
    subject,
    html: emailShell({
      lang,
      preheader,
      body: welcomeBody(safeName, lang),
      ctaUrl: APP_ORIGIN,
      ctaLabel: lang === 'fr' ? 'Ouvrir Adventurer' : 'Open Adventurer',
    }),
  });
}
