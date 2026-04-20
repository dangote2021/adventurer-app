'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { getSportEmoji } from '@/lib/sports-config';

const CONFETTI_COLORS = ['#F77F00', '#FFB703', '#22c55e', '#3b82f6', '#a855f7', '#ef4444', '#06b6d4'];

function ConfettiPiece({ delay, left }: { delay: number; left: number }) {
  const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
  const size = 6 + Math.random() * 8;
  const rotation = Math.random() * 360;
  const duration = 1.5 + Math.random() * 1.5;

  return (
    <div
      className="absolute top-0 pointer-events-none"
      style={{
        left: `${left}%`,
        width: size,
        height: size * 0.6,
        backgroundColor: color,
        borderRadius: '2px',
        transform: `rotate(${rotation}deg)`,
        animation: `confetti-fall ${duration}s ease-in ${delay}s forwards`,
        opacity: 0,
      }}
    />
  );
}

export default function ActivityCelebration() {
  const { showCelebration, dismissCelebration, lastActivitySummary, language, streakWeeks, weeklyProgress, weeklyGoal, weeklyGoalWeek, showToast, earnedBadges } = useStore();
  const [isVisible, setIsVisible] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const fr = language === 'fr';

  useEffect(() => {
    if (showCelebration && lastActivitySummary) {
      setIsVisible(true);
      setTimeout(() => setShowShare(true), 1200);
    }
  }, [showCelebration, lastActivitySummary]);

  if (!showCelebration || !lastActivitySummary) return null;

  const handleClose = () => {
    setIsVisible(false);
    setShowShare(false);
    setTimeout(dismissCelebration, 300);
  };

  const handleShare = () => {
    const s = lastActivitySummary;
    const text = [
      `${getSportEmoji(s.sport)} ${s.title}`,
      [s.distance && `📏 ${s.distance}`, s.dplus && `⛰️ ${s.dplus}`, s.duration && `⏱️ ${s.duration}`].filter(Boolean).join(' · '),
      streakWeeks > 1 ? `🔥 ${streakWeeks} ${fr ? 'semaines de streak' : 'week streak'}` : '',
      '',
      `Sur Adventurer 🏔️ adventurer-outdoor.vercel.app`,
    ].filter(Boolean).join('\n');

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: s.title, text, url: 'https://adventurer-outdoor.vercel.app' }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => showToast(fr ? 'Copie !' : 'Copied!', 'success', '📋'));
    }
  };

  // Check current week match
  const currentWeek = (() => { const now = new Date(); const jan1 = new Date(now.getFullYear(), 0, 1); const wk = Math.ceil((((now.getTime() - jan1.getTime()) / 86400000) + jan1.getDay() + 1) / 7); return now.getFullYear() + '-W' + String(wk).padStart(2, '0'); })();
  const weekProgress = currentWeek === weeklyGoalWeek ? weeklyProgress : 0;
  const goalReached = weekProgress >= weeklyGoal;

  // New badge?
  const newestBadge = earnedBadges.length > 0 ? earnedBadges[0] : null;
  const isBadgeNew = newestBadge && (Date.now() - new Date(newestBadge.earnedAt).getTime()) < 5000;

  const s = lastActivitySummary;
  const mainStat = s.dplus || s.distance || s.duration || '';

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-black/90" />

      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <ConfettiPiece key={i} delay={Math.random() * 0.8} left={Math.random() * 100} />
        ))}
      </div>

      {/* Content */}
      <div
        className="relative z-10 max-w-sm w-full mx-6 text-center"
        onClick={e => e.stopPropagation()}
      >
        {/* Sport emoji big */}
        <div className="text-7xl mb-4 animate-bounce">
          {getSportEmoji(s.sport)}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-black text-white mb-2">
          {fr ? 'Bravo !' : 'Well done!'}
        </h1>
        <p className="text-lg text-white/80 mb-6">{s.title}</p>

        {/* Main stat */}
        {mainStat && (
          <div className="inline-block bg-gradient-to-r from-[#F77F00] to-[#FFB703] text-[#1B4332] text-4xl font-black px-8 py-4 rounded-2xl mb-6">
            {mainStat}
          </div>
        )}

        {/* Stats row */}
        <div className="flex justify-center gap-4 mb-6">
          {s.distance && (
            <div className="bg-white/10 rounded-xl px-4 py-2">
              <p className="text-xs text-gray-400">📏 Distance</p>
              <p className="text-lg font-bold text-white">{s.distance}</p>
            </div>
          )}
          {s.dplus && (
            <div className="bg-white/10 rounded-xl px-4 py-2">
              <p className="text-xs text-gray-400">⛰️ D+</p>
              <p className="text-lg font-bold text-white">{s.dplus}</p>
            </div>
          )}
          {s.duration && (
            <div className="bg-white/10 rounded-xl px-4 py-2">
              <p className="text-xs text-gray-400">⏱️ {fr ? 'Durée' : 'Duration'}</p>
              <p className="text-lg font-bold text-white">{s.duration}</p>
            </div>
          )}
        </div>

        {/* Streak */}
        {streakWeeks > 0 && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full text-sm font-bold text-orange-300">
              {streakWeeks >= 4 ? '🔥' : '✨'} {streakWeeks} {fr ? (streakWeeks > 1 ? 'semaines de streak' : 'semaine de streak') : (streakWeeks > 1 ? 'week streak' : 'week streak')}
            </span>
          </div>
        )}

        {/* Weekly goal progress */}
        {goalReached && (
          <div className="mb-4 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-xl">
            <p className="text-sm font-bold text-green-400">
              🎯 {fr ? 'Objectif de la semaine atteint !' : 'Weekly goal reached!'}
            </p>
          </div>
        )}

        {/* New badge */}
        {isBadgeNew && newestBadge && (
          <div className="mb-6 px-4 py-3 bg-purple-500/20 border border-purple-500/30 rounded-xl">
            <p className="text-xs text-purple-300 mb-1">{fr ? 'Nouveau badge débloqué !' : 'New badge unlocked!'}</p>
            <p className="text-lg font-bold text-white">
              {newestBadge.icon} {newestBadge.name}
            </p>
            <p className="text-xs text-gray-400">{newestBadge.description}</p>
          </div>
        )}

        {/* Share + Close buttons */}
        <div className={`space-y-3 transition-all duration-500 ${showShare ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            type="button"
            onClick={handleShare}
            className="w-full py-3.5 bg-gradient-to-r from-[#F77F00] to-[#FFB703] text-[#1B4332] font-bold rounded-xl hover:opacity-90 transition shadow-lg shadow-[#F77F00]/20"
          >
            📤 {fr ? 'Partager mon aventure' : 'Share my adventure'}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-2.5 text-gray-400 text-sm hover:text-white transition"
          >
            {fr ? 'Continuer' : 'Continue'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
