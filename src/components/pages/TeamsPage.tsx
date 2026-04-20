'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { TEAMS } from '@/lib/mock-data';
import { getSportEmoji } from '@/lib/sports-config';
import { t } from '@/lib/i18n';

interface TeamsPageProps {
  teamId?: string;
}

export default function TeamsPage({ teamId }: TeamsPageProps) {
  const { closeSubPage, setSubPage, showToast, language, selectedSports, joinedTeams, toggleTeamMembership } = useStore();
  const isJoined = (id: string) => joinedTeams.includes(id);
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(teamId || null);

  const team = detailId ? TEAMS.find((x) => x.id === detailId) : null;

  if (team) {
    return (
      <div className="min-h-screen bg-[var(--bg)] max-w-[430px] mx-auto pb-8">
        <div className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-white/5">
          <button
            type="button"
            onClick={() => (detailId === teamId ? closeSubPage() : setDetailId(null))}
            className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            aria-label={t('teams.back', language)}
          >
            ←
          </button>
          <h2 className="font-semibold text-base">
            {team.emoji} {team.name}
          </h2>
        </div>

        <div className="px-4 py-4 space-y-5">
          {/* Team Info */}
          <div className="bg-[var(--card)] rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center text-3xl">
                {team.emoji}
              </div>
              <div>
                <h3 className="font-bold text-lg">
                  {team.name}
                </h3>
                <p className="text-gray-400 text-sm">
                  📍 {team.location} · {getSportEmoji(team.sport)} {team.sport}
                </p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              {team.description}
            </p>
            <div className="flex gap-4 text-sm">
              <span className="text-gray-400">👥 {team.memberCount} {t('teams.membersLabel', language)}</span>
              {team.isPublic && (
                <span className="text-green-400">🔓 {t('teams.publicGroup', language)}</span>
              )}
            </div>
          </div>

          {/* Next Event */}
          {team.nextEvent && (
            <div className="bg-emerald-900/20 border border-emerald-800/30 rounded-xl p-4">
              <h4 className="font-semibold text-emerald-400 mb-1 text-sm">
                📅 {t('teams.nextEvent', language)}
              </h4>
              <p className="text-gray-200 text-sm">
                {team.nextEvent}
              </p>
            </div>
          )}

          {/* Members */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">
              {t('teams.members', language)} ({team.members.length})
            </h4>
            <div className="space-y-2">
              {team.members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="w-full flex items-center gap-3 bg-[var(--card)] rounded-xl p-3 hover:bg-white/5 transition text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  onClick={() =>
                    setSubPage({ type: 'user-profile', userId: m.id })
                  }
                  aria-label={`Voir le profil de ${m.name}`}
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">
                    {m.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {m.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {getSportEmoji(m.sport)} {m.sport} ·{' '}
                      {m.role === 'admin' ? '👑 Admin' : 'Membre'}
                    </p>
                  </div>
                  <span className="text-gray-500 text-sm">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              type="button"
              className={`w-full py-3 rounded-xl font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
                isJoined(team.id)
                  ? 'bg-white/10 text-white hover:bg-white/15'
                  : 'bg-[var(--accent)] text-white hover:opacity-90'
              }`}
              onClick={() => {
                const wasJoined = isJoined(team.id);
                toggleTeamMembership(team.id);
                showToast(
                  wasJoined ? t('teams.left', language) : t('teams.joined', language),
                  'success',
                  wasJoined ? '👋' : '✅'
                );
              }}
              aria-label={isJoined(team.id) ? t('teams.leave', language) : t('teams.join', language)}
            >
              {isJoined(team.id) ? `✓ ${t('teams.leave', language)}` : t('teams.join', language)}
            </button>
            <button
              type="button"
              className="w-full py-3 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              onClick={() =>
                setSubPage({
                  type: 'conversation',
                  conversationId: `conv-${team.id.replace('team-', '')}`,
                })
              }
              aria-label={t('teams.message', language)}
            >
              💬 {t('teams.message', language)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Team List
  const sports = [...new Set(TEAMS.map((x) => x.sport))];
  const filtered = TEAMS.filter((team) => {
    if (search && !team.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (sportFilter) {
      if (team.sport !== sportFilter) return false;
    } else if (selectedSports.length > 0) {
      // No explicit filter: prioritize teams matching user's sports
      if (!selectedSports.includes(team.sport)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[var(--bg)] max-w-[430px] mx-auto pb-8">
      <div className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-white/5">
        <button
          type="button"
          onClick={closeSubPage}
          className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          aria-label={t('teams.back', language)}
        >
          ←
        </button>
        <h2 className="font-semibold text-base">
          {t('teams.title', language)}
        </h2>
      </div>

      <div className="px-4 py-3 space-y-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`🔍 ${t('teams.search', language)}`}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[var(--accent)] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] text-sm"
          aria-label={t('teams.search', language)}
        />

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            className={`px-3 py-1.5 rounded-full whitespace-nowrap text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
              !sportFilter
                ? 'bg-[var(--accent)] text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
            onClick={() => setSportFilter(null)}
            aria-label={t('teams.all', language)}
          >
            {t('teams.all', language)}
          </button>
          {sports.map((s) => (
            <button
              key={s}
              type="button"
              className={`px-3 py-1.5 rounded-full whitespace-nowrap text-sm flex items-center gap-1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
                sportFilter === s
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
              onClick={() =>
                setSportFilter(sportFilter === s ? null : s)
              }
              aria-label={`Filtrer par ${s}`}
            >
              {getSportEmoji(s)} {s}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-400 font-medium">{t('teams.noResults', language)}</p>
              <p className="text-gray-500 text-sm mt-1">{t('teams.noResultsHint', language)}</p>
            </div>
          )}
          {filtered.map((team) => (
            <button
              key={team.id}
              type="button"
              className="w-full bg-[var(--card)] rounded-2xl p-4 hover:bg-white/5 transition text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              onClick={() => setDetailId(team.id)}
              aria-label={`${team.name}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center text-2xl">
                  {team.emoji}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    {team.name}
                    {isJoined(team.id) && (
                      <span className="text-xs px-2 py-0.5 bg-emerald-900/40 text-emerald-300 rounded-full">✓</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {getSportEmoji(team.sport)} {team.sport} · 📍 {team.location}
                  </p>
                </div>
                <span className="text-gray-500 text-sm">
                  →
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>👥 {team.memberCount} {t('teams.membersLabel', language)}</span>
                {team.nextEvent && (
                  <span className="text-emerald-400 text-sm">
                    📅 {team.nextEvent.substring(0, 30)}...
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
