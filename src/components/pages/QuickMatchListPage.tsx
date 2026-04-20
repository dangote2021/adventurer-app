'use client';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

export default function QuickMatchListPage() {
  const { closeSubPage, language, quickMatches, joinQuickMatch, userName, showToast, selectedSports, removeQuickMatch } = useStore();

  const myName = userName || t('common.me', language);
  // Filter: future matches only, in user's sports
  const now = Date.now();
  const active = quickMatches.filter(m => {
    const when = new Date(m.date + 'T' + m.time).getTime();
    return when + 3 * 3600000 > now; // keep if within 3h past (still relevant)
  });
  const mine = selectedSports.length === 0 ? active : active.filter(m => selectedSports.includes(m.sport));
  const others = active.filter(m => !mine.includes(m));

  const MatchCard = ({ m }: { m: (typeof quickMatches)[number] }) => {
    const isAuthor = m.authorName === myName;
    const joined = m.participants.includes(myName);
    const dateFr = new Date(m.date + 'T' + m.time).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    return (
      <div className="bg-[var(--card)] rounded-2xl p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-sm">{m.spotTitle}</p>
            <p className="text-xs text-gray-400 mt-0.5">📅 {dateFr} · 🕐 {m.time}</p>
          </div>
          <span className="px-2 py-1 rounded bg-white/5 text-xs">{m.sport}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">{t('qm.byAuthor', language)}</span>
          <span className="font-medium">{m.authorName}</span>
          <span className="px-1.5 py-0.5 bg-blue-900/30 text-blue-300 rounded">
            {m.level === 'tous' ? t('qm.tous', language) : m.level}
          </span>
        </div>
        {m.notes && <p className="text-xs text-gray-300 italic">&quot;{m.notes}&quot;</p>}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">👥 {m.participants.length} {t('qm.participants', language)}</span>
          {isAuthor ? (
            <button type="button" onClick={() => { removeQuickMatch(m.id); showToast(t('qm.removed', language), 'info', '🗑️'); }} className="text-xs px-3 py-1 bg-red-900/20 text-red-300 rounded-lg">{t('qm.remove', language)}</button>
          ) : joined ? (
            <span className="text-xs px-3 py-1 bg-green-900/30 text-green-300 rounded-lg">✓ {t('qm.joinedBadge', language)}</span>
          ) : (
            <button type="button" onClick={() => { joinQuickMatch(m.id, myName); showToast(t('qm.joined', language), 'success', '✓'); }} className="text-xs px-3 py-1 bg-[var(--accent)] text-white rounded-lg font-medium">
              {t('qm.joinMatch', language)}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] max-w-[430px] mx-auto pb-8">
      <div className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-white/5">
        <button type="button" onClick={closeSubPage} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition" aria-label={t('common.back', language)}>←</button>
        <h2 className="font-semibold text-base">🤝 {t('qm.allMatches', language)}</h2>
      </div>
      <div className="px-4 py-4 space-y-3">
        {active.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">🤝</p>
            <p className="text-sm">{t('qm.noMatches', language)}</p>
          </div>
        )}
        {mine.length > 0 && (
          <>
            <p className="text-[11px] uppercase text-gray-400 tracking-wide">{t('qm.inYourSports', language)}</p>
            {mine.map(m => <MatchCard key={m.id} m={m} />)}
          </>
        )}
        {others.length > 0 && (
          <>
            <p className="text-[11px] uppercase text-gray-400 tracking-wide mt-4">{t('qm.otherSports', language)}</p>
            {others.map(m => <MatchCard key={m.id} m={m} />)}
          </>
        )}
      </div>
    </div>
  );
}
