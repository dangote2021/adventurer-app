'use client';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

export default function MyPlansPage() {
  const { closeSubPage, setSubPage, language, savedPlans, deletePlan, showToast } = useStore();

  const handleDelete = (id: string) => {
    deletePlan(id);
    showToast(t('plan.deleted', language), 'info', '🗑️');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] max-w-[430px] mx-auto pb-8">
      <div className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-white/5">
        <button type="button" onClick={closeSubPage} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition" aria-label={t('common.back', language)}>←</button>
        <h2 className="font-semibold text-base">🧠 {t('plan.myPlans', language)}</h2>
      </div>

      <div className="px-4 py-4 space-y-3">
        {savedPlans.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">🧠</p>
            <p className="text-sm mb-4">{t('plan.noPlans', language)}</p>
            <button
              type="button"
              onClick={() => setSubPage('coach-ai')}
              className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm font-medium"
            >{t('plan.goToCoach', language)}</button>
          </div>
        )}

        {savedPlans.map(plan => {
          const created = new Date(plan.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US');
          return (
            <details key={plan.id} className="bg-[var(--card)] rounded-2xl overflow-hidden">
              <summary className="p-4 cursor-pointer list-none flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{plan.title}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{plan.sport} · {plan.weeks.length} {t('plan.weeks', language)} · {created}</p>
                </div>
                <span className="text-gray-400 text-xs flex-shrink-0">▾</span>
              </summary>
              <div className="px-4 pb-4 space-y-2">
                {plan.weeks.map(w => (
                  <div key={w.week} className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs font-bold text-[var(--accent)] mb-1">{t('plan.weekLabel', language)} {w.week} — {w.focus}</p>
                    <ul className="space-y-1">
                      {w.sessions.map((s, i) => (
                        <li key={i} className="text-xs text-gray-300 flex gap-2">
                          <span className="text-gray-500">•</span><span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {plan.notes && <p className="text-xs italic text-gray-400 mt-2">{plan.notes}</p>}
                <button
                  type="button"
                  onClick={() => handleDelete(plan.id)}
                  className="w-full py-2 bg-red-900/20 text-red-300 rounded-lg text-xs hover:bg-red-900/30 transition mt-2"
                >
                  🗑️ {t('plan.delete', language)}
                </button>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
