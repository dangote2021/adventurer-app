/**
 * POST /api/coach/ai
 * Generates a personalized training plan via Anthropic Claude.
 * Falls back to a hand-crafted template if ANTHROPIC_API_KEY is not configured.
 *
 * Body: {
 *   sport: string,
 *   goal: string,
 *   weeks: number,
 *   current_level: 'beginner' | 'intermediate' | 'advanced',
 *   weekly_hours: number,
 *   constraints?: string
 * }
 */

import { NextResponse } from 'next/server';
import { allow, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Body = {
  sport?: string;
  goal?: string;
  weeks?: number;
  current_level?: string;
  weekly_hours?: number;
  constraints?: string;
  history_hint?: string;
};

const MODEL = 'claude-sonnet-4-6';

const systemPrompt = `Tu es le coach IA d'Adventurer, une app outdoor multi-sports française. Tu es un coach sportif expérimenté, bienveillant, précis et orienté terrain.

Ton rôle : concevoir un plan d'entraînement progressif, semaine par semaine, adapté au sport, à l'objectif, au niveau et au temps disponible de l'utilisateur.

Règles strictes :
- Réponds UNIQUEMENT en JSON valide, sans texte autour, sans markdown.
- Structure du JSON :
  {
    "summary": "3-4 phrases résumant la philosophie du plan",
    "warnings": ["précaution #1", "précaution #2"],
    "weeks": [
      {
        "week": 1,
        "focus": "intitulé clair du focus hebdo",
        "sessions": [
          { "day": "Lundi", "type": "Endurance", "duration_min": 60, "description": "détail concret et actionnable" }
        ],
        "nutrition_tips": ["conseil #1", "conseil #2"],
        "gear_tips": ["conseil matos optionnel"]
      }
    ],
    "next_steps": "ce qu'il faut faire après la fin du plan"
  }
- Tiens compte du niveau (débutant = progression douce, avancé = intensité + seuil).
- Sécurité d'abord : toujours inclure des warnings sport-spécifiques.
- Format pro, pas de tutoiement forcé, pas d'émojis.`;

function fallbackPlan(body: Body) {
  const weeks = Math.min(Math.max(body.weeks || 4, 2), 12);
  const hours = body.weekly_hours || 5;
  return {
    summary: `Plan ${weeks} semaines en autonomie pour ${body.sport || 'ton sport'}. Génération IA désactivée : ajoute ANTHROPIC_API_KEY dans Vercel pour obtenir un plan ultra-personnalisé.`,
    warnings: [
      'Consulte un médecin avant reprise après 1 mois d\'arrêt.',
      'Hydrate-toi et respecte tes signaux de fatigue.',
    ],
    weeks: Array.from({ length: weeks }, (_, i) => ({
      week: i + 1,
      focus: i === 0 ? 'Reprise progressive' : i === weeks - 1 ? 'Affûtage & objectif' : 'Progression linéaire',
      sessions: [
        { day: 'Lundi', type: 'Endurance fondamentale', duration_min: Math.round((hours * 60) / 4), description: 'Sortie longue à allure conversation.' },
        { day: 'Mercredi', type: 'Travail technique', duration_min: Math.round((hours * 60) / 5), description: `Exercices spécifiques ${body.sport || 'sport'}.` },
        { day: 'Vendredi', type: 'Intensité', duration_min: Math.round((hours * 60) / 5), description: 'Intervals ou montée progressive en intensité.' },
        { day: 'Dimanche', type: 'Sortie longue', duration_min: Math.round((hours * 60) / 3), description: 'Terrain varié, volume principal de la semaine.' },
      ],
      nutrition_tips: ['1.5 g/kg de protéines, 6-8 g/kg de glucides en phase charge.'],
      gear_tips: [],
    })),
    next_steps: 'Ajoute une semaine de récupération, puis enchaîne sur un cycle spécifique à ton prochain objectif.',
    generated_by: 'fallback',
  };
}

export async function POST(req: Request) {
  // Auth check — prevent anonymous users from burning API credits
  const { requireAuth } = await import('@/lib/supabase/auth-guard');
  const { error: authError } = await requireAuth(req as import('next/server').NextRequest);
  if (authError) return authError;

  // Rate limit : 5 plans par IP / heure — freine les users authentifiés qui tenteraient
  // de générer des plans en boucle (LLM payant).
  const ip = getClientIp(req);
  if (!allow(`coach-ai:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Trop de plans générés. Réessaie dans une heure.' },
      { status: 429 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as Body;

  const rawSport = body.sport;
  const rawGoal = body.goal;
  const rawWeeks = body.weeks;
  const rawLevel = body.current_level;
  const rawWeeklyHours = body.weekly_hours;
  const rawConstraints = body.constraints;
  const rawHistory = body.history_hint;

  if (typeof rawSport !== 'string' || typeof rawGoal !== 'string' || !rawSport.trim() || !rawGoal.trim()) {
    return NextResponse.json({ error: 'sport et goal sont requis.' }, { status: 400 });
  }

  // Contraintes strictes pour éviter l'abus de l'API LLM payante et la prompt injection.
  const sport = rawSport.trim().slice(0, 60);
  const goal = rawGoal.trim().slice(0, 300);
  const weeksNum = typeof rawWeeks === 'number' && Number.isFinite(rawWeeks) ? rawWeeks : 4;
  const weeks = Math.min(Math.max(Math.round(weeksNum), 2), 24);
  const allowedLevels = new Set(['beginner', 'intermediate', 'advanced', 'debutant', 'intermediaire', 'confirme']);
  const current_level = typeof rawLevel === 'string' && allowedLevels.has(rawLevel) ? rawLevel : 'intermediate';
  const hoursNum = typeof rawWeeklyHours === 'number' && Number.isFinite(rawWeeklyHours) ? rawWeeklyHours : 5;
  const weekly_hours = Math.min(Math.max(hoursNum, 1), 40);
  const constraints = typeof rawConstraints === 'string' ? rawConstraints.slice(0, 500) : undefined;
  const history_hint = typeof rawHistory === 'string' ? rawHistory.slice(0, 1000) : undefined;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(fallbackPlan(body));
  }

  const userPrompt = `Crée un plan d'entraînement pour :
- Sport : ${sport}
- Objectif : ${goal}
- Durée du plan : ${weeks} semaines
- Niveau actuel : ${current_level}
- Temps disponible par semaine : ${weekly_hours} h
- Contraintes / infos : ${constraints || 'aucune'}${history_hint ? `

Contexte historique de l'utilisateur (à utiliser pour calibrer la charge et éviter la surcharge) :
${history_hint}` : ''}`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      console.error('[coach-ai] anthropic error', r.status, text);
      return NextResponse.json(fallbackPlan(body));
    }

    const data = await r.json();
    const rawText =
      data?.content?.[0]?.text ||
      data?.completion ||
      '';

    // Extract JSON block (the model sometimes wraps it in ```json)
    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    let plan: unknown;
    try {
      plan = JSON.parse(cleaned);
    } catch {
      // Try to find the first JSON-looking block
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) plan = JSON.parse(match[0]);
      else plan = fallbackPlan(body);
    }

    return NextResponse.json({ ...(plan as object), generated_by: 'anthropic' });
  } catch (e: any) {
    console.error('[coach-ai] exception', e.message);
    return NextResponse.json(fallbackPlan(body));
  }
}
