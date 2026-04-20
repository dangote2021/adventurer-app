/**
 * Activity Insights (I1)
 *
 * Analyse temporelle des sorties d'un utilisateur pour nourrir :
 *  - le dashboard du profil (temps fort, sport dominant, streak)
 *  - le Coach IA (contexte : volume actuel, jours de repos, surcharge)
 *  - les notifications (rappel check-in, streak qui va casser)
 *
 * Input agnostique : accepte aussi bien les activités Zustand (activityLog)
 * que les activités Strava synchronisées ou les lignes Supabase.
 */

export interface ActivityRecord {
  sport: string;
  title?: string;
  date?: string | Date;        // ISO ou Date
  createdAt?: string | Date;   // fallback si pas de `date`
  distance?: string | number;  // "12.5 km" | 12.5 (km)
  dplus?: string | number;     // "820m" | 820 (m)
  duration?: string | number;  // "1h30" | secondes
}

export interface ActivityInsights {
  totalSorties: number;
  last7days: number;
  last30days: number;
  totalDistanceKm: number;
  totalDPlus: number;
  totalDurationSec: number;
  dominantSport: string | null;
  streakDays: number;           // jours consécutifs avec >=1 sortie
  daysSinceLast: number | null; // null si aucune sortie
  restDaysLast7: number;        // 0..7
  volumeTrend: 'up' | 'flat' | 'down' | 'unknown';
  overtrainingAlert: boolean;
  suggestedRest: boolean;
  suggestion: string;           // phrase actionnable pour l'utilisateur
  coachPromptHint: string;      // contexte à injecter dans le prompt IA
}

/* --- Parsing helpers ---------------------------------------------------- */

function parseNumber(raw: unknown): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw !== 'string') return 0;
  const m = raw.replace(',', '.').match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : 0;
}

function parseDuration(raw: unknown): number {
  // Retourne en secondes
  if (typeof raw === 'number') return raw > 100000 ? Math.round(raw / 1000) : raw;
  if (typeof raw !== 'string') return 0;
  let total = 0;
  const h = raw.match(/(\d+)\s*h/i);
  const m = raw.match(/(\d+)\s*m(?!s)/i);
  const s = raw.match(/(\d+)\s*s$/i);
  const colon = raw.match(/^(\d+):(\d{2})(?::(\d{2}))?$/);
  if (colon) {
    total = parseInt(colon[1]) * 60 + parseInt(colon[2]);
    if (colon[3]) total = parseInt(colon[1]) * 3600 + parseInt(colon[2]) * 60 + parseInt(colon[3]);
    return total;
  }
  if (h) total += parseInt(h[1]) * 3600;
  if (m) total += parseInt(m[1]) * 60;
  if (s) total += parseInt(s[1]);
  return total;
}

function toDate(raw: unknown): Date | null {
  if (!raw) return null;
  if (raw instanceof Date) return Number.isNaN(raw.getTime()) ? null : raw;
  const d = new Date(raw as string);
  return Number.isNaN(d.getTime()) ? null : d;
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/* --- Main --------------------------------------------------------------- */

export function computeInsights(raw: ActivityRecord[]): ActivityInsights {
  const empty: ActivityInsights = {
    totalSorties: 0,
    last7days: 0,
    last30days: 0,
    totalDistanceKm: 0,
    totalDPlus: 0,
    totalDurationSec: 0,
    dominantSport: null,
    streakDays: 0,
    daysSinceLast: null,
    restDaysLast7: 7,
    volumeTrend: 'unknown',
    overtrainingAlert: false,
    suggestedRest: false,
    suggestion: 'Aucune sortie pour le moment — ta prochaine aventure attend.',
    coachPromptHint: 'Utilisateur sans historique connu — pars sur un plan débutant doux.',
  };

  if (!Array.isArray(raw) || raw.length === 0) return empty;

  // Normalise + filtre
  const now = new Date();
  const nowMs = now.getTime();
  const acts = raw
    .map(a => ({
      sport: (a.sport || 'Autre').trim(),
      date: toDate(a.date) || toDate(a.createdAt) || new Date(),
      distanceKm: parseNumber(a.distance),
      dplus: parseNumber(a.dplus),
      durationSec: parseDuration(a.duration),
    }))
    .filter(a => a.date.getTime() <= nowMs + 60_000)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  if (acts.length === 0) return empty;

  // Totaux
  const totalDistanceKm = Math.round(acts.reduce((s, a) => s + a.distanceKm, 0) * 10) / 10;
  const totalDPlus = Math.round(acts.reduce((s, a) => s + a.dplus, 0));
  const totalDurationSec = acts.reduce((s, a) => s + a.durationSec, 0);

  // Fenêtres temporelles
  const in7 = acts.filter(a => nowMs - a.date.getTime() <= 7 * 86400_000);
  const in30 = acts.filter(a => nowMs - a.date.getTime() <= 30 * 86400_000);
  const in14_to_7 = acts.filter(a => {
    const diff = nowMs - a.date.getTime();
    return diff > 7 * 86400_000 && diff <= 14 * 86400_000;
  });

  // Sport dominant (par volume = durée ou, à défaut, nombre d'occurrences)
  const sportVolume = new Map<string, number>();
  for (const a of acts) {
    const v = a.durationSec > 0 ? a.durationSec : 3600; // fallback 1h
    sportVolume.set(a.sport, (sportVolume.get(a.sport) || 0) + v);
  }
  const dominantSport = [...sportVolume.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Streak (jours consécutifs depuis aujourd'hui/hier avec >=1 sortie)
  const daysWithActivity = new Set(acts.map(a => dayKey(a.date)));
  let streak = 0;
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);
  // Tolère un premier gap d'1 jour si pas d'activité aujourd'hui
  if (!daysWithActivity.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (daysWithActivity.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Jours depuis la dernière sortie
  const lastDate = acts[0].date;
  const daysSinceLast = Math.floor((nowMs - lastDate.getTime()) / 86400_000);
  const restDaysLast7 = Math.max(0, 7 - new Set(in7.map(a => dayKey(a.date))).size);

  // Tendance de volume : 7 derniers jours vs 7 précédents (durée)
  const volume7 = in7.reduce((s, a) => s + a.durationSec, 0);
  const volume7_14 = in14_to_7.reduce((s, a) => s + a.durationSec, 0);
  let volumeTrend: ActivityInsights['volumeTrend'] = 'unknown';
  if (volume7_14 === 0 && volume7 > 0) volumeTrend = 'up';
  else if (volume7 === 0 && volume7_14 > 0) volumeTrend = 'down';
  else if (volume7_14 > 0) {
    const ratio = volume7 / volume7_14;
    if (ratio > 1.2) volumeTrend = 'up';
    else if (ratio < 0.8) volumeTrend = 'down';
    else volumeTrend = 'flat';
  }

  // Alerte surentraînement : >6 sorties ET 0 jour de repos sur 7j
  // OU volume en hausse >50% + pas de repos
  const overtrainingAlert =
    (in7.length >= 6 && restDaysLast7 === 0) ||
    (volume7_14 > 0 && volume7 / volume7_14 > 1.5 && restDaysLast7 <= 1);

  const suggestedRest = overtrainingAlert || (in7.length >= 5 && restDaysLast7 <= 1);

  // Suggestion terrain
  let suggestion: string;
  if (overtrainingAlert) {
    suggestion = `Tu as enchaîné ${in7.length} sorties en 7 jours sans repos — prévois une journée off pour récupérer, tes progrès se construisent au repos.`;
  } else if (daysSinceLast !== null && daysSinceLast >= 14) {
    suggestion = `${daysSinceLast} jours sans sortir — reprends en douceur, une séance courte suffit à relancer la machine.`;
  } else if (volumeTrend === 'up' && in7.length >= 3) {
    suggestion = `Belle progression : ${in7.length} sorties cette semaine, ${in14_to_7.length} la précédente. Continue sans brusquer.`;
  } else if (streak >= 5) {
    suggestion = `Streak de ${streak} jours consécutifs — superbe. Pense à intégrer une sortie facile pour durer.`;
  } else if (dominantSport) {
    suggestion = `Ton sport dominant : ${dominantSport}. Prêt pour un plan ciblé ?`;
  } else {
    suggestion = `${acts.length} sortie${acts.length > 1 ? 's' : ''} enregistrée${acts.length > 1 ? 's' : ''} — construis ta routine.`;
  }

  // Contexte à injecter dans le prompt Coach IA
  const coachPromptHint = [
    `Historique utilisateur (${acts.length} sorties) :`,
    `- 7 derniers jours : ${in7.length} sorties (${Math.round(volume7 / 3600)}h)`,
    `- 30 derniers jours : ${in30.length} sorties`,
    `- Sport dominant : ${dominantSport ?? 'mixte'}`,
    `- Streak actuel : ${streak} jour${streak > 1 ? 's' : ''}`,
    `- Tendance volume : ${volumeTrend}`,
    overtrainingAlert ? `- ⚠️ Signes de surcharge (${in7.length} sorties en 7j, ${restDaysLast7}j de repos) — intégrer au moins 1 jour off par semaine` : '',
    daysSinceLast !== null ? `- Dernière sortie il y a ${daysSinceLast} jour${daysSinceLast > 1 ? 's' : ''}` : '',
  ].filter(Boolean).join('\n');

  return {
    totalSorties: acts.length,
    last7days: in7.length,
    last30days: in30.length,
    totalDistanceKm,
    totalDPlus,
    totalDurationSec,
    dominantSport,
    streakDays: streak,
    daysSinceLast,
    restDaysLast7,
    volumeTrend,
    overtrainingAlert,
    suggestedRest,
    suggestion,
    coachPromptHint,
  };
}

/**
 * Format lisible pour un bandeau "insight" dans l'UI.
 * Retourne {tone, icon, title, subtitle} — pas de score, juste du qualitatif.
 */
export function insightsBanner(i: ActivityInsights): { tone: 'good' | 'neutral' | 'warning'; icon: string; title: string; subtitle: string } {
  if (i.totalSorties === 0) {
    return { tone: 'neutral', icon: '🌱', title: 'Prêt à démarrer', subtitle: 'Ta première sortie inscrira le début de ton histoire.' };
  }
  if (i.overtrainingAlert) {
    return { tone: 'warning', icon: '⚠️', title: 'Signes de surcharge', subtitle: i.suggestion };
  }
  if (i.daysSinceLast !== null && i.daysSinceLast >= 14) {
    return { tone: 'warning', icon: '🛌', title: 'Longue pause', subtitle: i.suggestion };
  }
  if (i.volumeTrend === 'up' && i.last7days >= 3) {
    return { tone: 'good', icon: '📈', title: 'Montée en charge', subtitle: i.suggestion };
  }
  if (i.streakDays >= 5) {
    return { tone: 'good', icon: '🔥', title: `Streak ${i.streakDays} jours`, subtitle: i.suggestion };
  }
  return { tone: 'neutral', icon: '🎯', title: i.dominantSport ? `${i.dominantSport} dominant` : 'Ton rythme', subtitle: i.suggestion };
}
