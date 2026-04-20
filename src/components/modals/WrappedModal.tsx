'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { getSportEmoji } from '@/lib/sports-config';

export default function WrappedModal() {
  const { showWrapped, dismissWrapped, activityLog, language, userName, streakWeeks, earnedBadges, showToast } = useStore();
  const [slide, setSlide] = useState(0);
  const fr = language === 'fr';

  if (!showWrapped) return null;

  // Calculate stats for previous month
  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthStr = prevMonth.toISOString().slice(0, 7);
  const monthName = prevMonth.toLocaleDateString(fr ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' });

  const monthActivities = activityLog.filter(a => a.date.slice(0, 7) === prevMonthStr);
  const totalActivities = monthActivities.length;

  const totalDistance = monthActivities.reduce((sum, a) => {
    const d = a.distance ? parseFloat(a.distance.replace(/[^\d.]/g, '')) : 0;
    return sum + d;
  }, 0);

  const totalDplus = monthActivities.reduce((sum, a) => {
    const d = a.dplus ? parseFloat(a.dplus.replace(/[^\d.]/g, '')) : 0;
    return sum + d;
  }, 0);

  const sportCounts: Record<string, number> = {};
  monthActivities.forEach(a => { sportCounts[a.sport] = (sportCounts[a.sport] || 0) + 1; });
  const topSport = Object.entries(sportCounts).sort((a, b) => b[1] - a[1])[0];

  const newBadgesThisMonth = earnedBadges.filter(b => b.earnedAt.slice(0, 7) === prevMonthStr);

  // Previous month for comparison
  const prev2Month = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const prev2MonthStr = prev2Month.toISOString().slice(0, 7);
  const prev2Activities = activityLog.filter(a => a.date.slice(0, 7) === prev2MonthStr).length;
  const progressPercent = prev2Activities > 0 ? Math.round(((totalActivities - prev2Activities) / prev2Activities) * 100) : 100;

  const handleShare = () => {
    const text = [
      `🏔️ ${fr ? 'Mon mois' : 'My month'} ${monthName} sur Adventurer`,
      `📊 ${totalActivities} ${fr ? 'sorties' : 'outings'}`,
      totalDistance > 0 ? `📏 ${Math.round(totalDistance)} km` : '',
      totalDplus > 0 ? `⛰️ +${Math.round(totalDplus)}m D+` : '',
      topSport ? `${getSportEmoji(topSport[0])} ${fr ? 'Sport favori' : 'Favorite sport'}: ${topSport[0]}` : '',
      '',
      `adventurer-outdoor.vercel.app`,
    ].filter(Boolean).join('\n');

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: `Adventurer Wrapped — ${monthName}`, text, url: 'https://adventurer-outdoor.vercel.app' }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => showToast(fr ? 'Copié !' : 'Copied!', 'success', '📋'));
    }
  };

  const slides = [
    // Slide 0: Intro
    <div key="intro" className="text-center">
      <div className="text-6xl mb-6">🏔️</div>
      <p className="text-sm uppercase tracking-widest text-[var(--accent)] font-bold mb-2">Adventurer Wrapped</p>
      <h2 className="text-3xl font-black text-white mb-2">{monthName}</h2>
      <p className="text-white/60 text-sm">{fr ? `Voici ton récap, ${userName}` : `Here's your recap, ${userName}`}</p>
    </div>,

    // Slide 1: Activities
    <div key="activities" className="text-center">
      <div className="text-7xl font-black text-white mb-2">{totalActivities}</div>
      <p className="text-lg text-white/80 mb-4">{fr ? 'sorties ce mois' : 'outings this month'}</p>
      {progressPercent !== 0 && prev2Activities > 0 && (
        <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${progressPercent >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {progressPercent >= 0 ? '📈' : '📉'} {progressPercent >= 0 ? '+' : ''}{progressPercent}% {fr ? 'vs mois précédent' : 'vs prev month'}
        </span>
      )}
    </div>,

    // Slide 2: Distance + D+
    <div key="stats" className="text-center space-y-6">
      {totalDistance > 0 && (
        <div>
          <div className="text-5xl font-black text-white">{Math.round(totalDistance)} km</div>
          <p className="text-sm text-white/60">{fr ? 'parcourus' : 'traveled'}</p>
        </div>
      )}
      {totalDplus > 0 && (
        <div>
          <div className="text-5xl font-black text-white">+{Math.round(totalDplus)}m</div>
          <p className="text-sm text-white/60">{fr ? 'de dénivelé positif' : 'elevation gain'}</p>
        </div>
      )}
      {totalDistance === 0 && totalDplus === 0 && (
        <p className="text-white/60">{fr ? 'Pas encore de stats distance ce mois' : 'No distance stats yet this month'}</p>
      )}
    </div>,

    // Slide 3: Top sport + streak
    <div key="sport" className="text-center space-y-6">
      {topSport && (
        <div>
          <div className="text-6xl mb-2">{getSportEmoji(topSport[0])}</div>
          <p className="text-2xl font-black text-white">{topSport[0]}</p>
          <p className="text-sm text-white/60">{fr ? 'ton sport favori ce mois' : 'your favorite sport this month'}</p>
          <p className="text-lg font-bold text-[var(--accent)] mt-1">{topSport[1]} {fr ? 'sorties' : 'outings'}</p>
        </div>
      )}
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 rounded-full">
        <span className="text-lg">{streakWeeks >= 4 ? '🔥' : '✨'}</span>
        <span className="text-sm font-bold text-orange-300">{streakWeeks} {fr ? 'semaines de streak' : 'week streak'}</span>
      </div>
    </div>,

    // Slide 4: Badges + Share
    <div key="badges" className="text-center">
      {newBadgesThisMonth.length > 0 ? (
        <>
          <p className="text-sm uppercase tracking-widest text-purple-400 font-bold mb-4">{fr ? 'Badges débloqués' : 'Badges unlocked'}</p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {newBadgesThisMonth.map(b => (
              <div key={b.id} className="bg-purple-500/20 border border-purple-500/30 rounded-xl px-4 py-3">
                <span className="text-2xl">{b.icon}</span>
                <p className="text-xs font-bold text-white mt-1">{b.name}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="mb-6">
          <div className="text-6xl mb-4">⭐</div>
          <p className="text-lg font-bold text-white">{fr ? 'Continue comme ça !' : 'Keep it up!'}</p>
          <p className="text-sm text-white/60">{fr ? 'Les badges arrivent avec la régularité' : 'Badges come with consistency'}</p>
        </div>
      )}
      <button
        type="button"
        onClick={handleShare}
        className="w-full py-3.5 bg-gradient-to-r from-[#F77F00] to-[#FFB703] text-[#1B4332] font-bold rounded-xl hover:opacity-90 transition shadow-lg"
      >
        📤 {fr ? 'Partager mon Wrapped' : 'Share my Wrapped'}
      </button>
    </div>,
  ];

  const totalSlides = slides.length;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-b from-[#1B4332] via-[#0B1D0E] to-black" />

      {/* Decorative circles */}
      <div className="absolute top-20 -left-16 w-64 h-64 rounded-full bg-[var(--accent)]/5" />
      <div className="absolute bottom-32 -right-20 w-48 h-48 rounded-full bg-[#023E8A]/10" />

      <div className="relative z-10 max-w-sm w-full mx-6">
        {/* Close */}
        <button type="button" onClick={dismissWrapped} className="absolute -top-12 right-0 text-white/40 hover:text-white text-sm">
          ✕ {fr ? 'Fermer' : 'Close'}
        </button>

        {/* Slide content */}
        <div className="min-h-[320px] flex items-center justify-center px-4">
          {slides[slide]}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8 mb-6">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSlide(i)}
              className={`h-2 rounded-full transition-all ${i === slide ? 'bg-[var(--accent)] w-8' : 'bg-white/20 w-2'}`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {slide > 0 && (
            <button
              type="button"
              onClick={() => setSlide(s => s - 1)}
              className="flex-1 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/15 transition"
            >
              ←
            </button>
          )}
          {slide < totalSlides - 1 ? (
            <button
              type="button"
              onClick={() => setSlide(s => s + 1)}
              className="flex-1 py-3 bg-[var(--accent)] text-white font-bold rounded-xl hover:opacity-90 transition"
            >
              {fr ? 'Suivant' : 'Next'} →
            </button>
          ) : (
            <button
              type="button"
              onClick={dismissWrapped}
              className="flex-1 py-3 bg-[var(--accent)] text-white font-bold rounded-xl hover:opacity-90 transition"
            >
              {fr ? 'Terminer' : 'Done'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
