'use client';

/**
 * Coach IA — générateur de plans d'entraînement multi-sports
 * Le différenciateur Adventurer : aucun concurrent ne l'a de manière intégrée.
 */

import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useStore } from '@/lib/store';
import { apiUrl } from '@/lib/api-url';
import { computeInsights, insightsBanner, type ActivityRecord } from '@/lib/services/activity-insights';

type Session = { day: string; type: string; duration_min: number; description: string };
type Week = { week: number; focus: string; sessions: Session[]; nutrition_tips?: string[]; gear_tips?: string[] };
type Plan = {
  summary: string;
  warnings: string[];
  weeks: Week[];
  next_steps: string;
  generated_by?: string;
};

const SPORTS = [
  'Trail', 'Ultra-trail', 'Marathon', 'Randonnée longue',
  'Alpinisme', 'Escalade', 'Ski de rando',
  'Kitesurf', 'Surf', 'Wing foil', 'Apnée', 'Plongée',
  'Vélo route', 'Gravel', 'Bikepacking',
  'Parapente', 'Speedriding',
];

export default function CoachAIPage() {
  const [form, setForm] = useState({
    sport: 'Trail',
    goal: 'Terminer un 50 km en montagne',
    weeks: 8,
    current_level: 'intermediate',
    weekly_hours: 6,
    constraints: '',
  });
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // I1 — Insights temporels depuis les sorties enregistrées (local + Strava).
  const activityLog = useStore(s => s.activityLog);
  const stravaActivities = useStore(s => s.stravaActivities);
  const insights = useMemo(() => {
    const local: ActivityRecord[] = (activityLog || []).map(a => ({
      sport: a.sport,
      title: a.title,
      date: a.date,
      distance: a.distance,
      dplus: a.dplus,
      duration: a.duration,
    }));
    const strava: ActivityRecord[] = (stravaActivities || []).map(a => ({
      sport: a.sport || a.type,
      title: a.name,
      date: a.start_date_local,
      distance: a.distance ? a.distance / 1000 : 0, // Strava renvoie en mètres
      dplus: a.elevation_gain,
      duration: a.moving_time,
    }));
    return computeInsights([...local, ...strava]);
  }, [activityLog, stravaActivities]);
  const banner = useMemo(() => insightsBanner(insights), [insights]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleSharePlan = useCallback(async () => {
    if (!plan) return;
    const planText = [
      `🏔️ Mon plan Adventurer : ${plan.summary}`,
      '',
      ...plan.weeks.map(w => `Semaine ${w.week} — ${w.focus}: ${w.sessions.map(s => s.description).join(', ')}`),
      '',
      'Génère le tien gratuitement sur adventurer-outdoor.vercel.app/coach/ai',
    ].join('\n');

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Mon plan Coach IA — Adventurer',
          text: planText,
          url: 'https://adventurer-outdoor.vercel.app/coach/ai',
        });
        return;
      } catch {
        // User cancelled or share failed, fall through to clipboard
      }
    }
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(planText);
        showToast('Plan copié !');
      } catch {
        showToast('Impossible de copier le plan');
      }
    }
  }, [plan, showToast]);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Tu dois être connecté pour utiliser le Coach IA.');
      const r = await fetch(apiUrl('/api/coach/ai'), {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          // I1 — Contexte d'historique injecté dans le prompt IA (s'il y en a)
          history_hint: insights.totalSorties > 0 ? insights.coachPromptHint : undefined,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
      setPlan(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen bg-gradient-to-b from-[#1B4332] via-[#2D6A4F] to-[#0B1D0E] text-white relative"
      style={{ colorScheme: 'light' }}
    >
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white text-[#1B4332] px-5 py-2.5 rounded-full text-sm font-medium shadow-lg">
          {toast}
        </div>
      )}
      <div className="max-w-3xl mx-auto p-6">
        <a href="/" className="text-sm text-white/70 hover:text-white">← Retour</a>
        <header className="text-center py-8">
          <div className="inline-block bg-[#F77F00]/20 text-[#F77F00] text-xs px-3 py-1 rounded-full mb-3">
            NOUVEAU · Bêta
          </div>
          <h1 className="text-4xl md:text-5xl font-black">Coach IA</h1>
          <p className="text-white/70 mt-2 max-w-xl mx-auto">
            Plan d&apos;entraînement personnalisé, semaine par semaine, généré pour ton sport et ton objectif.
          </p>
        </header>

        {/* I1 — Insights temporels (streak, sport dominant, surcharge…) */}
        {!plan && insights.totalSorties > 0 && (
          <section
            className={`rounded-2xl p-4 mb-4 flex items-start gap-3 shadow-md border ${
              banner.tone === 'warning'
                ? 'bg-amber-50 border-amber-300'
                : banner.tone === 'good'
                  ? 'bg-emerald-50 border-emerald-300'
                  : 'bg-white/10 border-white/20'
            }`}
          >
            <span className="text-2xl flex-shrink-0 mt-0.5">{banner.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm leading-snug ${
                banner.tone === 'warning' ? 'text-amber-900' :
                banner.tone === 'good' ? 'text-emerald-900' :
                'text-white'
              }`}>
                {banner.title}
              </p>
              <p className={`text-xs mt-1 leading-relaxed ${
                banner.tone === 'warning' ? 'text-amber-800' :
                banner.tone === 'good' ? 'text-emerald-800' :
                'text-white/70'
              }`}>
                {banner.subtitle}
              </p>
              <div className={`mt-2 flex flex-wrap gap-2 text-[11px] ${
                banner.tone === 'warning' || banner.tone === 'good' ? 'text-gray-600' : 'text-white/60'
              }`}>
                <span>📅 {insights.last7days} sortie{insights.last7days !== 1 ? 's' : ''} / 7j</span>
                {insights.dominantSport && <span>🎯 {insights.dominantSport}</span>}
                {insights.streakDays > 0 && <span>🔥 {insights.streakDays}j streak</span>}
                <span>🛌 {insights.restDaysLast7}j repos / 7j</span>
              </div>
            </div>
          </section>
        )}

        {/* Auth banner — visible before login */}
        {!plan && (
          <section className="bg-[#FEFAE0] border border-[#DDA15E]/40 rounded-2xl p-4 mb-4 flex items-start gap-3 shadow-md">
            <span className="text-2xl flex-shrink-0 mt-0.5">🔐</span>
            <div className="flex-1 min-w-0">
              <p className="text-[#1B4332] font-semibold text-sm leading-snug">
                Connecte-toi avec Google pour g&eacute;n&eacute;rer ton plan personnalis&eacute; (gratuit)
              </p>
              <p className="text-[#2D6A4F]/70 text-xs mt-1">
                Un compte permet de sauvegarder tes plans et suivre ta progression.
              </p>
            </div>
            <a
              href="/auth"
              className="flex-shrink-0 px-4 py-2 bg-[#1B4332] text-white font-bold text-sm rounded-xl hover:bg-[#2D6A4F] transition whitespace-nowrap"
            >
              Connexion
            </a>
          </section>
        )}

        <section className="bg-white rounded-3xl p-6 md:p-8 text-gray-800 shadow-2xl">
          <form onSubmit={generate} className="grid gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#1B4332] mb-1">Ton sport</label>
              <select
                value={form.sport}
                onChange={e => setForm({ ...form, sport: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#2D6A4F] outline-none bg-white text-gray-900"
              >
                {SPORTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1B4332] mb-1">Ton objectif</label>
              <input
                type="text"
                required
                value={form.goal}
                onChange={e => setForm({ ...form, goal: e.target.value })}
                placeholder="Ex: Terminer un 50 km en montagne, passer à 3 min d'apnée…"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#2D6A4F] outline-none bg-white text-gray-900 placeholder-gray-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-[#1B4332] mb-1">Durée (semaines)</label>
                <input
                  type="number"
                  min={2}
                  max={12}
                  value={form.weeks}
                  onChange={e => setForm({ ...form, weeks: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1B4332] mb-1">Heures / semaine</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={form.weekly_hours}
                  onChange={e => setForm({ ...form, weekly_hours: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1B4332] mb-1">Niveau actuel</label>
              <select
                value={form.current_level}
                onChange={e => setForm({ ...form, current_level: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900"
              >
                <option value="beginner">Débutant</option>
                <option value="intermediate">Intermédiaire</option>
                <option value="advanced">Confirmé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1B4332] mb-1">
                Contraintes (optionnel)
              </label>
              <textarea
                rows={2}
                value={form.constraints}
                onChange={e => setForm({ ...form, constraints: e.target.value })}
                placeholder="Ex: genou fragile, pas de dénivelé près de chez moi, weekend complet libre…"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400"
              />
            </div>

            {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Génération du plan…' : 'Générer mon plan'}
            </button>
          </form>
        </section>

        {plan && (
          <section className="mt-8 bg-white rounded-3xl p-6 md:p-8 text-gray-800 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-[#1B4332]">Ton plan sur mesure</h2>
              {plan.generated_by === 'fallback' && (
                <span className="text-xs text-[#F77F00] bg-[#F77F00]/10 px-2 py-1 rounded-full">
                  Mode fallback (IA désactivée)
                </span>
              )}
            </div>

            <p className="text-gray-700 mb-4">{plan.summary}</p>

            {plan.warnings && plan.warnings.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-bold text-amber-800 mb-2">⚠️ Précautions</h3>
                <ul className="list-disc pl-5 text-sm text-amber-900 space-y-1">
                  {plan.warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}

            <div className="space-y-4">
              {plan.weeks.map(w => (
                <details key={w.week} className="bg-[#FEFAE0] rounded-2xl p-4 border border-[#DDA15E]/30" open={w.week === 1}>
                  <summary className="cursor-pointer font-semibold text-[#1B4332] flex justify-between">
                    <span>Semaine {w.week} — {w.focus}</span>
                    <span className="text-sm text-gray-500">{w.sessions.length} séances</span>
                  </summary>
                  <div className="mt-3 space-y-2">
                    {w.sessions.map((s, i) => (
                      <div key={i} className="bg-white rounded-xl p-3 border border-gray-100">
                        <div className="flex justify-between text-sm">
                          <strong className="text-[#2D6A4F]">{s.day}</strong>
                          <span className="text-gray-500">{s.duration_min} min</span>
                        </div>
                        <div className="text-sm text-gray-800 mt-1"><strong>{s.type}</strong> — {s.description}</div>
                      </div>
                    ))}
                    {(w.nutrition_tips?.length || 0) > 0 && (
                      <div className="text-xs text-gray-600 mt-2">
                        <strong>Nutrition :</strong> {w.nutrition_tips!.join(' · ')}
                      </div>
                    )}
                    {(w.gear_tips?.length || 0) > 0 && (
                      <div className="text-xs text-gray-600">
                        <strong>Matos :</strong> {w.gear_tips!.join(' · ')}
                      </div>
                    )}
                  </div>
                </details>
              ))}
            </div>

            <div className="mt-6 p-4 bg-[#2D6A4F]/10 rounded-xl">
              <h3 className="text-sm font-bold text-[#1B4332] mb-1">Après ce plan</h3>
              <p className="text-sm text-gray-800">{plan.next_steps}</p>
            </div>

            <button
              type="button"
              onClick={handleSharePlan}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-[#F77F00] hover:bg-[#e06f00] text-white font-bold py-3.5 rounded-xl transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              Partager mon plan
            </button>

            <p className="text-xs text-gray-500 mt-6 text-center">
              Le coach IA est une aide, pas un substitut à un suivi médical ou à un entraîneur certifié pour des objectifs ambitieux.
            </p>
          </section>
        )}

        <footer className="text-center text-white/40 text-xs py-8">
          Adventurer · Coach IA bêta ·{' '}
          <a href="/legal/privacy" className="underline hover:text-white/70">Confidentialité</a>
          {' · '}
          <a href="/legal/terms" className="underline hover:text-white/70">CGU</a>
        </footer>
      </div>
    </main>
  );
}
