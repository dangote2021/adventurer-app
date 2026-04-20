'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import {
  getAdventuresForSwipe,
  getWeatherConditions,
  getUpcomingEvents,
  getTrainingPlans,
  NEARBY_PEOPLE,
  NEARBY_COACHES,
  GEAR_SUGGESTIONS,
  INSPIRATION_POSTS,
  MAP_SPOTS
} from '@/lib/mock-data';
import { getSportEmoji } from '@/lib/sports-config';
import CreateChallengeModal from '@/components/ui/CreateChallengeModal';
import {
  getSpots,
  getEvents,
  getCoaches,
  getMarketItems,
  type Spot,
  type EventItem,
  type Coach,
  type MarketItem,
} from '@/lib/supabase/queries';

export default function HomePage() {
  const { userName, selectedSports, setSubPage, showToast, language, dismissedAdventures, dismissedEvents, dismissAdventure, dismissEvent, togglePlannedAdventure, isAdventurePlanned, togglePlannedChallenge, isChallengePlanned, userLat, userLng, streakWeeks, tickStreak, monthlyGoal, monthlyProgress, monthlyGoalMonth, bumpMonthlyProgress, setMonthlyGoal, weeklyGoal, weeklyProgress, weeklyGoalWeek, inAppNotifications, lastActivitySummary, setLastActivitySummary, socialFeedLikes, toggleSocialLike, leagueLevel, leagueRank, leagueXP, streakFreezes, earnedBadges, isPremium, sponsoredChallengesJoined, joinSponsoredChallenge, isSponsoredChallengeJoined, userChallenges, joinUserChallenge, leaveUserChallenge } = useStore();

  const [showCreateChallenge, setShowCreateChallenge] = useState(false);

  // Tick streak on page load (once per week)
  useEffect(() => { tickStreak(); }, []);

  // ── Supabase live data state ──
  const [supabaseSpots, setSupabaseSpots] = useState<Spot[]>([]);
  const [supabaseEvents, setSupabaseEvents] = useState<EventItem[]>([]);
  const [supabaseCoaches, setSupabaseCoaches] = useState<Coach[]>([]);
  const [supabaseMarketItems, setSupabaseMarketItems] = useState<MarketItem[]>([]);
  const [supabaseLoaded, setSupabaseLoaded] = useState(false);

  // Fetch real data from Supabase on mount / when sports change
  useEffect(() => {
    let cancelled = false;

    async function fetchSupabaseData() {
      const sports = selectedSports.length > 0 ? selectedSports : undefined;
      try {
        const [spots, events, coaches, marketItems] = await Promise.all([
          getSpots(sports),
          getEvents(sports),
          getCoaches(sports?.[0]),
          getMarketItems(sports),
        ]);
        if (cancelled) return;
        if (spots.length > 0) setSupabaseSpots(spots);
        if (events.length > 0) setSupabaseEvents(events);
        if (coaches.length > 0) setSupabaseCoaches(coaches);
        if (marketItems.length > 0) setSupabaseMarketItems(marketItems);
        setSupabaseLoaded(true);
      } catch (err) {
        console.error('[HomePage] Supabase fetch error, using mock data:', err);
        setSupabaseLoaded(true);
      }
    }

    fetchSupabaseData();
    return () => { cancelled = true; };
  }, [selectedSports]);

  // Spot de la semaine — rotate based on ISO week number
  const weekNum = Math.ceil((((new Date()).getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000 + new Date(new Date().getFullYear(), 0, 1).getDay() + 1) / 7);
  // Prefer Supabase spots, fallback to mock MAP_SPOTS
  const spotsPool = supabaseSpots.length > 0 ? supabaseSpots : MAP_SPOTS;
  const userSpots = spotsPool.filter(s => selectedSports.includes(s.sport));
  const spotOfWeek = userSpots.length > 0 ? userSpots[weekNum % userSpots.length] : spotsPool[weekNum % spotsPool.length];

  // Weekly goal
  const currentWeekStr = (() => { const now = new Date(); const jan1 = new Date(now.getFullYear(), 0, 1); const wk = Math.ceil((((now.getTime() - jan1.getTime()) / 86400000) + jan1.getDay() + 1) / 7); return now.getFullYear() + '-W' + String(wk).padStart(2, '0'); })();
  const weekProgress = currentWeekStr === weeklyGoalWeek ? weeklyProgress : 0;
  const weekPercent = Math.min(100, Math.round((weekProgress / weeklyGoal) * 100));

  // Monthly goal — auto-reset if month changed
  const currentMonth = new Date().toISOString().slice(0, 7);
  const goalProgress = currentMonth === monthlyGoalMonth ? monthlyProgress : 0;
  const goalPercent = Math.min(100, Math.round((goalProgress / monthlyGoal) * 100));

  // Unread notifications count
  const unreadCount = inAppNotifications.filter(n => !n.read).length;

  // Dynamic weather based on geolocation
  const heroTemp = userLat ? Math.round(20 - Math.abs(userLat - 35) * 0.3) : 17;
  const heroWeatherIcon = userLat && userLat > 40 ? '⛅' : '☀️';

  // Reverse geocode: show city name instead of raw coordinates
  const [heroCity, setHeroCity] = useState('Chamonix');
  useEffect(() => {
    if (!userLat || !userLng) return;
    const ctl = new AbortController();
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${userLat}&lon=${userLng}&format=json&zoom=10&accept-language=fr`, { signal: ctl.signal })
      .then(r => r.json())
      .then(d => {
        const city = d.address?.city || d.address?.town || d.address?.village || d.address?.state || '';
        const country = d.address?.country || '';
        if (city) setHeroCity(country && country !== city ? `${city}, ${country}` : city);
      })
      .catch(() => {});
    return () => ctl.abort();
  }, [userLat, userLng]);

  const [activeAdventureIndex, setActiveAdventureIndex] = useState(0);
  const [fabMenuOpen, setFabMenuOpen] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    weather: true,
    adventures: true,
    events: true,
    people: true,
    plans: true,
    gear: true,
    rankings: true,
    posts: true,
  });

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const adventureSectionRef = useRef<HTMLElement>(null);

  // Simulate data loading with skeleton loader delays
  useEffect(() => {
    const timers = [
      setTimeout(() => setLoadingStates(prev => ({ ...prev, weather: false })), 400),
      setTimeout(() => setLoadingStates(prev => ({ ...prev, adventures: false })), 600),
      setTimeout(() => setLoadingStates(prev => ({ ...prev, events: false })), 800),
      setTimeout(() => setLoadingStates(prev => ({ ...prev, people: false })), 1000),
      setTimeout(() => setLoadingStates(prev => ({ ...prev, plans: false })), 1200),
      setTimeout(() => setLoadingStates(prev => ({ ...prev, gear: false })), 1400),
      setTimeout(() => setLoadingStates(prev => ({ ...prev, posts: false })), 1600),
    ];
    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  const getTimeGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return t('greeting.morning', language);
    if (hour < 18) return t('greeting.afternoon', language);
    return t('greeting.evening', language);
  };

  const getAnimatedIcon = (): React.ReactNode => {
    const hour = new Date().getHours();
    if (hour < 6 || hour >= 20) {
      return <span className="animate-pulse text-2xl">🌙</span>;
    }
    return <span className="animate-pulse text-2xl">☀️</span>;
  };

  // Get adventures, filter out dismissed ones
  const allAdventures = getAdventuresForSwipe(selectedSports);
  const visibleAdventures = allAdventures.filter(a => !dismissedAdventures.includes(a.id));

  // If all adventures dismissed, show all again (rotate)
  const adventures = visibleAdventures.length > 0 ? visibleAdventures : allAdventures;

  // Get events — prefer Supabase data, fallback to mock
  const mockEvents = getUpcomingEvents();
  const allEvents = supabaseEvents.length > 0
    ? supabaseEvents.map(e => ({
        id: e.id as string | number,
        date: e.date,
        location: e.location,
        emoji: e.emoji,
        title: e.title,
        description: e.description,
        tag: e.tag,
        price: typeof e.price === 'number' ? `${e.price}€` : String(e.price),
        spots: e.spots_available != null ? `${e.spots_available} places` : '',
        sport: e.sport,
      }))
    : mockEvents;
  const visibleEvents = allEvents.filter(e => !dismissedEvents.includes(e.id));

  const weatherConditions = getWeatherConditions(selectedSports);
  const plans = getTrainingPlans();
  const currentAdventure = adventures[activeAdventureIndex % adventures.length];

  // Handle swipe left/right on adventure cards
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swiped left, go to next
        handleAdventureNext();
      } else {
        // Swiped right, go to previous
        handleAdventurePrev();
      }
    }
  };

  const handleAdventureNext = () => {
    setActiveAdventureIndex((prev) => (prev + 1) % adventures.length);
  };

  const handleAdventurePrev = () => {
    setActiveAdventureIndex((prev) => (prev - 1 + adventures.length) % adventures.length);
  };

  const handleAddChallenge = (event: typeof allEvents[0]) => {
    const wasPlanned = isChallengePlanned(event.id);
    togglePlannedChallenge(event.id);
    if (!wasPlanned) {
      showToast(t('adventure.challengeAdded', language), 'success', '✅');
    }
  };

  const handleAddPlan = (_planTitle: string) => {
    setSubPage('coach-ai');
  };

  const handleSocialAction = (action: string, _postId: string) => {
    if (action === 'like') {
      showToast(t('social.liked', language), 'success');
    } else if (action === 'comment') {
      showToast(t('social.commentOpened', language), 'info');
    } else if (action === 'share') {
      showToast(t('social.shared', language), 'success');
    }
  };

  // Mountain background SVG
  const MountainBackground = () => (
    <svg
      className="absolute inset-0 w-full h-full opacity-40"
      viewBox="0 0 1000 400"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* Background peaks */}
      <path d="M0,250 L150,150 L300,200 L450,100 L600,180 L750,120 L900,200 L1000,150 L1000,400 L0,400 Z" fill="#1B4332" opacity="0.3" />

      {/* Mid peaks */}
      <path d="M0,280 L120,200 L250,240 L400,160 L550,220 L700,170 L850,250 L1000,200 L1000,400 L0,400 Z" fill="#2D6A4F" opacity="0.4" />

      {/* Foreground peaks */}
      <path d="M0,300 L100,220 L200,260 L350,180 L500,250 L650,200 L800,280 L1000,240 L1000,400 L0,400 Z" fill="#40916C" opacity="0.5" />

      {/* Sun */}
      <circle cx="850" cy="80" r="45" fill="#F77F00" opacity="0.6" />
      <circle cx="850" cy="80" r="35" fill="#FFB703" opacity="0.4" />
    </svg>
  );

  return (
    <main className="min-h-screen bg-[var(--bg)] text-white pb-28 max-w-[430px] mx-auto">
      {/* 1. HERO BANNER */}
      <section className="relative h-64 bg-gradient-to-b from-[#1B4332] to-[#2D6A4F] overflow-hidden">
        <MountainBackground />

        <div className="relative z-10 h-full flex flex-col justify-center px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-2">
            {getAnimatedIcon()}
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              {getTimeGreeting()}, {userName}
            </h1>
          </div>
          <p className="text-base sm:text-lg text-green-100">
            {heroTemp}°C · {heroWeatherIcon} {t('hero.weather', language)} · {heroCity}
          </p>
          {/* Streak badge */}
          {streakWeeks > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full text-sm font-bold text-orange-300">
                <span className="text-lg">{streakWeeks >= 4 ? '🔥' : '✨'}</span>
                {streakWeeks} {language === 'fr' ? (streakWeeks > 1 ? 'semaines actives' : 'semaine active') : (streakWeeks > 1 ? 'active weeks' : 'active week')}
                {streakWeeks >= 4 && ' 🔥'}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* 2. WEATHER CONDITIONS CHIPS */}
      <section className="px-4 sm:px-6 py-6">
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="flex gap-3 pb-2 w-max sm:w-full">
            {loadingStates.weather ? (
              Array(4).fill(0).map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-32 bg-[var(--card)] rounded-full animate-pulse flex-shrink-0"
                  role="status"
                  aria-label="Loading conditions"
                />
              ))
            ) : (
              weatherConditions.map((condition) => (
                <button
                  key={condition.sport}
                  onClick={() => setSubPage('coach-ai')}
                  className="flex-shrink-0 px-4 py-2 rounded-full bg-[var(--card)] border border-[var(--border)] hover:border-[#F77F00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F77F00] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] transition-all"
                  aria-label={`${condition.sport}: ${condition.status} — voir le coach IA`}
                >
                  <span className="text-lg">{condition.emoji}</span>
                  <span className="ml-2 text-sm font-medium text-white">{condition.sport}</span>
                  <span className="ml-2 text-sm font-semibold text-green-400">{condition.status}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA PRINCIPAL — Trouve-moi une aventure */}
      <section className="px-4 sm:px-6 pb-4">
        <button
          type="button"
          onClick={() => setSubPage('trip-planner')}
          className="w-full py-4 bg-gradient-to-r from-[#F77F00] to-[#FFB703] text-[#1B4332] rounded-2xl font-black text-lg hover:opacity-90 transition shadow-lg shadow-[#F77F00]/20 flex items-center justify-center gap-2"
        >
          <span className="text-xl">🚀</span>
          {language === 'fr' ? 'Trouve-moi une aventure !' : 'Find me an adventure!'}
        </button>
      </section>

      {/* OBJECTIF HEBDO */}
      <section className="px-4 sm:px-6 pb-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              🎯 {language === 'fr' ? 'Objectif de la semaine' : 'Weekly goal'}
            </h3>
            <span className="text-xs font-semibold text-[var(--accent)]">{weekProgress}/{weeklyGoal} {language === 'fr' ? 'sorties' : 'outings'}</span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${weekPercent}%`, background: weekPercent >= 100 ? '#22c55e' : 'linear-gradient(90deg, #F77F00, #FFB703)' }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {weekPercent >= 100
              ? (language === 'fr' ? 'Objectif atteint cette semaine ! 💪' : 'Weekly goal reached! 💪')
              : (language === 'fr' ? `Plus que ${weeklyGoal - weekProgress} sortie${weeklyGoal - weekProgress > 1 ? 's' : ''} cette semaine` : `${weeklyGoal - weekProgress} more outing${weeklyGoal - weekProgress > 1 ? 's' : ''} this week`)}
          </p>
        </div>
      </section>

      {/* P3: CTA LOG FIRST ACTIVITY — only show if no activities yet */}
      {useStore.getState().activityLog.length === 0 && (
        <section className="px-4 sm:px-6 pb-4">
          <div className="bg-gradient-to-r from-[#F77F00]/20 to-[#FFB703]/10 border border-[#F77F00]/30 rounded-2xl p-5 text-center">
            <span className="text-4xl block mb-2">🏔️</span>
            <h3 className="font-bold text-white text-base mb-1">
              {language === 'fr' ? 'Prêt pour l\'aventure ?' : 'Ready for adventure?'}
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              {language === 'fr' ? 'Log ta première sortie en 30 secondes et débloques tes stats, badges et streak' : 'Log your first outing in 30 seconds to unlock stats, badges & streak'}
            </p>
            <button
              type="button"
              onClick={() => setFabMenuOpen(true)}
              className="w-full py-3 bg-gradient-to-r from-[#F77F00] to-[#FFB703] text-[#1B4332] font-bold rounded-xl text-sm hover:opacity-90 transition shadow-lg shadow-[#F77F00]/20"
            >
              ⚡ {language === 'fr' ? 'Logger ma première sortie' : 'Log my first outing'}
            </button>
          </div>
        </section>
      )}

      {/* POST-ACTIVITY SUMMARY */}
      {lastActivitySummary && (
        <section className="px-4 sm:px-6 pb-4">
          <div className="bg-gradient-to-r from-[#2D6A4F]/40 to-[#1B4332]/40 border border-green-500/20 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white">
                {language === 'fr' ? '🎉 Dernière aventure' : '🎉 Last adventure'}
              </h3>
              <button type="button" onClick={() => setLastActivitySummary(null)} className="text-xs text-gray-500 hover:text-gray-300">✕</button>
            </div>
            <p className="font-semibold text-white text-sm">{lastActivitySummary.title}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              {lastActivitySummary.distance && <span>📏 {lastActivitySummary.distance}</span>}
              {lastActivitySummary.dplus && <span>⛰️ {lastActivitySummary.dplus}</span>}
              {lastActivitySummary.duration && <span>⏱️ {lastActivitySummary.duration}</span>}
            </div>
            <button
              type="button"
              onClick={() => {
                const text = `🏔️ ${lastActivitySummary.title}${lastActivitySummary.distance ? ' · ' + lastActivitySummary.distance : ''}${lastActivitySummary.dplus ? ' · ' + lastActivitySummary.dplus : ''}\n\nSur Adventurer: adventurer-outdoor.vercel.app`;
                if (typeof navigator !== 'undefined' && navigator.share) {
                  navigator.share({ title: lastActivitySummary.title, text, url: 'https://adventurer-outdoor.vercel.app' }).catch(() => {});
                } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  navigator.clipboard.writeText(text).then(() => showToast(language === 'fr' ? 'Copié !' : 'Copied!', 'success', '📋'));
                }
              }}
              className="mt-3 w-full py-2 bg-white/10 text-white text-xs font-semibold rounded-lg hover:bg-white/15 transition"
            >
              📤 {language === 'fr' ? 'Partager mon aventure' : 'Share my adventure'}
            </button>
          </div>
        </section>
      )}

      {/* SPOT DE LA SEMAINE */}
      {spotOfWeek && (
        <section className="px-4 sm:px-6 pb-4">
          <button
            type="button"
            onClick={() => setSubPage({ type: 'trail-detail', trailId: spotOfWeek.id })}
            className="w-full bg-gradient-to-r from-[#2D6A4F]/40 to-[#1B4332]/40 border border-[#2D6A4F]/30 rounded-2xl p-4 text-left hover:border-[var(--accent)]/40 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">{spotOfWeek.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-[var(--accent)] font-bold mb-0.5">
                  {language === 'fr' ? '⭐ Spot de la semaine' : '⭐ Spot of the week'}
                </p>
                <p className="font-bold text-sm text-white truncate">{spotOfWeek.name}</p>
                <p className="text-xs text-gray-400 truncate">{spotOfWeek.description} · ⭐ {spotOfWeek.rating}</p>
              </div>
              <span className="text-gray-500 text-lg">→</span>
            </div>
          </button>
        </section>
      )}

      {/* SHORTCUTS — lean row: Plans, RDV, Quick Match */}
      <section className="px-4 sm:px-6 pt-2 pb-1">
        <div className="grid grid-cols-3 gap-2">
          <button type="button" onClick={() => setSubPage('my-plans')}
            className="flex flex-col items-center gap-1 py-3 px-2 rounded-2xl bg-[var(--card)] hover:bg-white/10 transition">
            <span className="text-2xl">📋</span>
            <span className="text-[11px] font-semibold text-center leading-tight">{language === 'fr' ? 'Mes plans' : 'My plans'}</span>
          </button>
          <button type="button" onClick={() => setSubPage('my-bookings')}
            className="flex flex-col items-center gap-1 py-3 px-2 rounded-2xl bg-[var(--card)] hover:bg-white/10 transition">
            <span className="text-2xl">🗓️</span>
            <span className="text-[11px] font-semibold text-center leading-tight">{language === 'fr' ? 'Mes RDV' : 'Bookings'}</span>
          </button>
          <button type="button" onClick={() => setSubPage('quick-match-list')}
            className="flex flex-col items-center gap-1 py-3 px-2 rounded-2xl bg-[var(--card)] hover:bg-white/10 transition">
            <span className="text-2xl">🤝</span>
            <span className="text-[11px] font-semibold text-center leading-tight">Quick Match</span>
          </button>
        </div>
      </section>

      {/* ═══ MONETIZATION SHOWCASE — Coach Hub + Marketplace + Coach IA ═══ */}
      <section className="px-4 sm:px-6 py-3 space-y-3">

        {/* COACH HUB — Premium card with social proof */}
        <button type="button" onClick={() => setSubPage('coach-hub')}
          className="w-full bg-gradient-to-r from-[#023E8A]/30 to-[#2D6A4F]/30 border border-[#023E8A]/30 rounded-2xl p-4 text-left hover:border-[var(--accent)]/50 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/30 to-cyan-500/20 flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform">
              🏋️
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-bold text-sm text-white">{language === 'fr' ? 'Coachs & Préparation' : 'Coaches & Training'}</h3>
                <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[9px] font-bold rounded-full uppercase">{language === 'fr' ? 'Nouveau' : 'New'}</span>
              </div>
              <p className="text-xs text-gray-400 leading-snug">
                {language === 'fr'
                  ? 'Plans personnalisés, coachs certifiés trail · kite · plongée'
                  : 'Personalized plans, certified coaches for trail · kite · diving'}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] text-blue-300 font-semibold">👨‍🏫 {supabaseCoaches.length > 0 ? supabaseCoaches.length : 12} {language === 'fr' ? 'coachs disponibles' : 'coaches available'}</span>
                <span className="text-[10px] text-gray-500">·</span>
                <span className="text-[10px] text-green-400 font-semibold">⭐ {supabaseCoaches.length > 0 ? (supabaseCoaches.reduce((s, c) => s + (c.rating_avg || 0), 0) / supabaseCoaches.length).toFixed(1) : '4.8'}/5</span>
              </div>
            </div>
            <span className="text-gray-500 group-hover:text-[var(--accent)] transition-colors text-lg">→</span>
          </div>
        </button>

        {/* MARKETPLACE — Premium card with deal highlight */}
        <button type="button" onClick={() => setSubPage('marketplace')}
          className="w-full bg-gradient-to-r from-[#F77F00]/15 to-[#DDA15E]/10 border border-[#F77F00]/20 rounded-2xl p-4 text-left hover:border-[#F77F00]/50 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/30 to-amber-500/20 flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform">
              🛒
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-bold text-sm text-white">{language === 'fr' ? 'Matériel d\'occasion' : 'Used Gear Market'}</h3>
                <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[9px] font-bold rounded-full">-60%</span>
              </div>
              <p className="text-xs text-gray-400 leading-snug">
                {language === 'fr'
                  ? 'Achète et vends du matos vérifié entre passionnés'
                  : 'Buy and sell verified gear between enthusiasts'}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] text-orange-300 font-semibold">🔥 {supabaseMarketItems.length > 0 ? (language === 'fr' ? `${supabaseMarketItems.length} articles` : `${supabaseMarketItems.length} items`) : (language === 'fr' ? '8 nouveaux articles' : '8 new items')}</span>
                <span className="text-[10px] text-gray-500">·</span>
                <span className="text-[10px] text-amber-400 font-semibold">{language === 'fr' ? 'Hoka, Salomon, Duotone...' : 'Hoka, Salomon, Duotone...'}</span>
              </div>
            </div>
            <span className="text-gray-500 group-hover:text-[#F77F00] transition-colors text-lg">→</span>
          </div>
        </button>

        {/* COACH IA — Compact entry point */}
        <button type="button" onClick={() => setSubPage('coach-ai')}
          className="w-full bg-gradient-to-r from-purple-900/20 to-violet-900/10 border border-purple-500/20 rounded-2xl p-3.5 text-left hover:border-purple-400/40 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/30 to-violet-500/20 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
              🤖
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-white">{language === 'fr' ? 'Coach IA' : 'AI Coach'}</h3>
              <p className="text-[11px] text-gray-400">
                {language === 'fr'
                  ? 'Génère un plan d\'entraînement en 30 sec — gratuit'
                  : 'Generate a training plan in 30 sec — free'}
              </p>
            </div>
            <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 text-[10px] font-bold rounded-full group-hover:bg-purple-500/30 transition">{language === 'fr' ? 'Essayer' : 'Try it'}</span>
          </div>
        </button>

      </section>

      {/* P2/P6: MINI-LIGUE HEBDO — moved up for retention */}
      <section className="px-4 sm:px-6 py-4">
        <div className="bg-gradient-to-br from-[#023E8A]/40 to-[#2D6A4F]/30 border border-blue-500/20 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              🏆 {language === 'fr' ? 'Mini-Ligue' : 'Mini-League'}
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${leagueLevel === 'diamond' ? 'bg-cyan-500/20 text-cyan-300' : leagueLevel === 'gold' ? 'bg-yellow-500/20 text-yellow-300' : leagueLevel === 'silver' ? 'bg-gray-300/20 text-gray-300' : 'bg-orange-800/30 text-orange-400'}`}>
                {leagueLevel === 'diamond' ? '💎 Diamond' : leagueLevel === 'gold' ? '🥇 Gold' : leagueLevel === 'silver' ? '🥈 Silver' : '🥉 Bronze'}
              </span>
            </h3>
            <span className="text-xs text-gray-400">#{leagueRank}</span>
          </div>
          <div className="space-y-1.5 mb-3">
            {[
              { rank: 1, name: 'Julien P.', xp: leagueXP + 45, premium: true },
              { rank: 2, name: 'Camille D.', xp: leagueXP + 22, premium: false },
              { rank: 3, name: 'Luca M.', xp: leagueXP + 10, premium: false },
              { rank: Math.max(4, leagueRank), name: userName || 'Toi', xp: leagueXP, me: true, premium: isPremium },
              { rank: Math.max(5, leagueRank + 1), name: 'Sarah B.', xp: Math.max(0, leagueXP - 8), premium: false },
            ].map((entry, idx) => (
              <div key={idx} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${'me' in entry && entry.me ? 'bg-[var(--accent)]/20 border border-[var(--accent)]/30' : 'bg-white/5'}`}>
                <span className={`w-5 font-bold ${entry.rank <= 3 ? 'text-yellow-400' : 'text-gray-500'}`}>{entry.rank}</span>
                <span className={`flex-1 font-medium ${'me' in entry && entry.me ? 'text-[var(--accent)]' : 'text-white'}`}>
                  {'me' in entry && entry.me ? (language === 'fr' ? '→ Toi' : '→ You') : entry.name}
                  {entry.premium && <span className="ml-1 text-yellow-400">👑</span>}
                </span>
                <span className="text-gray-400">{entry.xp} XP</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-500 text-center">
            {language === 'fr' ? 'Top 3 → promotion · Reset chaque lundi' : 'Top 3 → promoted · Resets every Monday'}
          </p>
        </div>
      </section>

      {/* STREAK FREEZE INDICATOR — moved up */}
      {streakWeeks >= 2 && (
        <section className="px-4 sm:px-6 py-2">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white/5 rounded-xl">
            <span className="text-lg">🛡️</span>
            <div className="flex-1">
              <p className="text-xs font-semibold text-white">{language === 'fr' ? 'Joker Aventure' : 'Adventure Joker'}</p>
              <p className="text-[10px] text-gray-500">
                {streakFreezes > 0
                  ? (language === 'fr' ? `${streakFreezes} joker dispo — protège ta streak` : `${streakFreezes} joker available — protect your streak`)
                  : (language === 'fr' ? 'Plus de joker — Premium = 2/mois' : 'No jokers left — Premium = 2/month')}
              </p>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: isPremium ? 2 : 1 }).map((_, i) => (
                <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${i < streakFreezes ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-600'}`}>🛡️</div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* P6: SPONSORED CHALLENGE — moved up */}
      <section className="px-4 sm:px-6 py-4">
        {(() => {
          const fr = language === 'fr';
          const trailKm = Math.round(useStore.getState().activityLog.filter(a => a.sport.toLowerCase().includes('trail')).reduce((sum, a) => { const d = a.distance ? parseFloat(a.distance.replace(/[^\d.]/g, '')) : 0; return sum + d; }, 0));
          const progress = Math.min(100, Math.round((trailKm / 100) * 100));
          const joined = isSponsoredChallengeJoined('sc-salomon');
          return (
            <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🏔️</span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{fr ? 'Challenge Sponsorisé' : 'Sponsored Challenge'}</span>
                <span className="ml-auto text-xs text-gray-500">847 {fr ? 'inscrits' : 'joined'}</span>
              </div>
              <h3 className="font-bold text-sm text-white mb-1">{fr ? 'Défi Salomon — 100km de trail ce mois' : 'Salomon Challenge — 100km trail this month'}</h3>
              <p className="text-xs text-gray-400 mb-3">{fr ? 'Cumule 100km de trail → code -30% salomon.com' : 'Accumulate 100km trail → 30% off salomon.com'}</p>
              <span className="inline-block px-2.5 py-1 bg-white/10 text-white text-xs font-bold rounded-full mb-3">🎁 -30% Salomon</span>
              {joined && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">{trailKm}/100 km</span>
                    <span className="text-white font-bold">{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => { if (!joined) { joinSponsoredChallenge('sc-salomon'); showToast(fr ? 'Défi rejoint !' : 'Challenge joined!', 'success', '🏆'); } }}
                className={`w-full py-2.5 rounded-xl text-sm font-bold transition ${joined ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'bg-white/10 text-white hover:bg-white/15'}`}
              >
                {joined ? (fr ? '✅ Inscrit' : '✅ Joined') : (fr ? 'Rejoindre le défi' : 'Join challenge')}
              </button>
            </div>
          );
        })()}
      </section>

      {/* 3. AVENTURE DU JOUR */}
      <section ref={adventureSectionRef} className="px-4 sm:px-6 py-6">
        <h2 className="text-2xl font-bold text-white mb-4">{t('adventure.title', language)}</h2>

        {loadingStates.adventures ? (
          <div className="h-80 bg-[var(--card)] rounded-xl animate-pulse" role="status" aria-label="Loading adventure" />
        ) : currentAdventure ? (
          <div>
            <div
              className="relative bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] rounded-xl p-6 text-white min-h-80 cursor-grab active:cursor-grabbing transition-all"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              role="region"
              aria-label={`Adventure: ${currentAdventure.title}`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                  {currentAdventure.conditionLabel}
                </span>
                <span className="text-2xl">{currentAdventure.emoji}</span>
              </div>

              <h3 className="text-2xl font-bold mb-2">{currentAdventure.title}</h3>
              <p className="text-green-100 text-base mb-6">{currentAdventure.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-green-100 text-xs">{t('adventure.temperature', language)}</p>
                  <p className="text-xl font-bold">{currentAdventure.temp}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-green-100 text-xs">{t('adventure.elevation', language)}</p>
                  <p className="text-xl font-bold">{currentAdventure.dplus}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-green-100 text-xs">{t('adventure.distance', language)}</p>
                  <p className="text-xl font-bold">{currentAdventure.distance}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-green-100 text-xs">{t('adventure.condition', language)}</p>
                  <p className="text-xl font-bold">{currentAdventure.condition}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  const wasPlanned = isAdventurePlanned(currentAdventure.id);
                  togglePlannedAdventure(currentAdventure.id);
                  if (!wasPlanned) {
                    showToast(t('adventure.added', language), 'success', '✅');
                  }
                }}
                className={`w-full py-3 font-bold rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B4332] transition-colors ${
                  isAdventurePlanned(currentAdventure.id)
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-[#1B4332] hover:bg-green-50'
                }`}
                aria-label={`Add ${currentAdventure.title} to your planning`}
              >
                {isAdventurePlanned(currentAdventure.id) ? `✅ ${t('adventure.addedLabel', language)}` : t('adventure.addToPlanning', language)}
              </button>

              <p className="mt-4 text-sm text-green-100">
                {currentAdventure.socialProof}
              </p>
            </div>

            {/* Carousel dots */}
            <div className="flex justify-center gap-2 mt-4">
              {adventures.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveAdventureIndex(index)}
                  className={`h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F77F00] ${
                    index === activeAdventureIndex ? 'bg-[#F77F00] w-8' : 'bg-[var(--border)] w-2'
                  }`}
                  aria-label={`Go to adventure ${index + 1} of ${adventures.length}`}
                  aria-current={index === activeAdventureIndex}
                />
              ))}
            </div>

            {/* Navigation button */}
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleAdventureNext}
                className="px-6 py-2 text-sm font-semibold text-[#F77F00] hover:bg-[var(--card)] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F77F00] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] transition-colors"
                aria-label={t('adventure.next', language)}
              >
                {t('adventure.next', language)} →
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {/* 4. PROCHAINS DÉFIS */}
      <section className="px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">{t('challenges.title', language)}</h2>
          <button
            onClick={() => setShowCreateChallenge(true)}
            className="px-3 py-2 bg-[var(--accent)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition"
          >
            {t('challenges.createBtn', language)}
          </button>
        </div>

        {/* User-created community challenges */}
        {userChallenges.length > 0 && (
          <div className="mb-4 space-y-3">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">{t('challenges.communityTitle', language)}</h3>
            {userChallenges.map((uc) => {
              const isParticipant = uc.participants.includes(userName || '');
              const fr = language === 'fr';
              return (
                <div key={uc.id} className="bg-[var(--card)] border border-emerald-500/20 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{uc.emoji}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(uc.date).toLocaleDateString(fr ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mb-0.5">{uc.title}</h3>
                      <p className="text-xs text-gray-400">
                        {uc.sport}{uc.distance ? ` · ${uc.distance}` : ''}{uc.location ? ` · ${uc.location}` : ''}
                      </p>
                      {uc.description && <p className="text-sm text-gray-500 mt-1">{uc.description}</p>}
                      <p className="text-xs text-emerald-400 mt-2">
                        {uc.participants.length} {t('challenges.participants', language)} · {t('challenges.by', language)} {uc.authorName}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (isParticipant) {
                          leaveUserChallenge(uc.id, userName || '');
                          showToast(t('challenges.left', language), 'info', '👋');
                        } else {
                          joinUserChallenge(uc.id, userName || '');
                          showToast(t('challenges.joined', language), 'success', '🏁');
                        }
                      }}
                      className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                        isParticipant
                          ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                          : 'bg-emerald-600 text-white hover:bg-emerald-500'
                      }`}
                    >
                      {isParticipant ? t('challenges.joinedBtn', language) : t('challenges.joinBtn', language)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {loadingStates.events ? (
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-[var(--card)] rounded-lg animate-pulse" role="status" aria-label="Loading challenge" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {visibleEvents.length > 0 ? (
              visibleEvents.map((event) => (
                <div key={event.id} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-[var(--text-secondary)]">{event.date}</span>
                        <span className="text-lg">{event.emoji}</span>
                        <span className="inline-block px-2 py-1 bg-[#F77F00]/20 text-[#F77F00] text-xs font-semibold rounded">
                          {event.tag}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mb-1">{event.title}</h3>
                      <p className="text-sm text-[var(--text-secondary)] mb-2">{event.description}</p>
                      <p className="text-sm font-semibold text-white">
                        {event.price} · {event.spots} {t('challenges.spotsLeft', language)}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleAddChallenge(event)}
                        className={`px-3 py-2 text-sm font-semibold rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F77F00] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] transition-colors whitespace-nowrap ${
                          isChallengePlanned(event.id)
                            ? 'bg-green-600 text-white'
                            : 'bg-[#F77F00] text-[#1B4332] hover:bg-[#FFB703]'
                        }`}
                        aria-label={`Add ${event.title}`}
                      >
                        {isChallengePlanned(event.id) ? `✅ ${t('challenges.addedLabel', language)}` : t('challenges.add', language)}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[var(--text-secondary)] text-center py-8">{t('challenges.noChallenges', language)}</p>
            )}
          </div>
        )}
      </section>

      {/* Create Challenge Modal */}
      {showCreateChallenge && <CreateChallengeModal onClose={() => setShowCreateChallenge(false)} />}

      {/* P2: Coaches, Plans, Gear moved to Explorer page — feed is now focused on retention */}

      {/* 8. AI TRIP PLANNER CTA */}
      <section className="px-4 sm:px-6 py-6">
        <div
          className="relative bg-gradient-to-br from-[#023E8A] to-[#2D6A4F] rounded-2xl p-6 overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => setSubPage('trip-planner')}
          role="button"
          tabIndex={0}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">🗺️</span>
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                {language === 'fr' ? 'NOUVEAU' : 'NEW'}
              </span>
            </div>
            <h2 className="text-xl font-black text-white mb-1">
              {language === 'fr' ? 'AI Trip Planner' : 'AI Trip Planner'}
            </h2>
            <p className="text-white/80 text-sm mb-4">
              {language === 'fr'
                ? 'Dis-nous ta destination et on crée ton itinéraire multi-jours. Vélo en Arménie, trek au Népal, kite en Grèce...'
                : 'Tell us your destination and we create your multi-day itinerary. Cycling in Armenia, trekking in Nepal, kiting in Greece...'}
            </p>
            <div className="flex items-center gap-3">
              <span className="bg-white text-[#023E8A] font-bold px-5 py-2.5 rounded-xl text-sm">
                {language === 'fr' ? 'Planifier un voyage →' : 'Plan a trip →'}
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setSubPage('coach-ai'); }}
                className="text-white/70 text-xs underline hover:text-white"
              >
                {language === 'fr' ? 'ou Coach IA' : 'or AI Coach'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL ACTIVITY FEED */}
      <section className="px-4 sm:px-6 py-6">
        <h2 className="text-2xl font-bold text-white mb-4">
          {language === 'fr' ? '👥 Fil d\'activités' : '👥 Activity Feed'}
        </h2>
        <div className="space-y-3">
          {(() => {
            const fr = language === 'fr';
            // P12: Rotating pool of 12 profiles — show 4 based on day rotation
            const allFeedProfiles = [
              { id: 'sf-1', user: 'Léa M.', avatar: '🧗', sport: 'Trail', title: fr ? 'Aiguilles Rouges — Boucle du Brévent' : 'Aiguilles Rouges — Brévent Loop', distance: '24 km', dplus: '+1 450m', time: fr ? 'Il y a 2h' : '2h ago', likes: 14, hasPhoto: true, premium: false },
              { id: 'sf-2', user: 'Thomas K.', avatar: '🪁', sport: 'Kitesurf', title: fr ? 'Session Dakhla — 22 nœuds' : 'Dakhla Session — 22 knots', distance: '35 km nav', dplus: '', time: fr ? 'Il y a 5h' : '5h ago', likes: 23, hasPhoto: true, premium: true },
              { id: 'sf-3', user: 'Marie L.', avatar: '🏔️', sport: 'Randonnée', title: fr ? 'Lac Blanc depuis La Flégère' : 'Lac Blanc from La Flégère', distance: '14 km', dplus: '+850m', time: fr ? 'Hier' : 'Yesterday', likes: 8, hasPhoto: false, premium: false },
              { id: 'sf-4', user: 'Antoine R.', avatar: '🚴', sport: 'Vélo route', title: fr ? 'Col du Galibier par le sud' : 'Col du Galibier south', distance: '86 km', dplus: '+2 120m', time: fr ? 'Hier' : 'Yesterday', likes: 31, hasPhoto: true, premium: false },
              { id: 'sf-5', user: 'Emma D.', avatar: '🏄', sport: 'Surf', title: fr ? 'Session Hossegor — 1.8m offshore' : 'Hossegor Session — 1.8m offshore', distance: '', dplus: '', time: fr ? 'Il y a 3h' : '3h ago', likes: 19, hasPhoto: true, premium: true },
              { id: 'sf-6', user: 'Lucas P.', avatar: '🪂', sport: 'Parapente', title: fr ? 'Vol Annecy — Planfait → atterro' : 'Annecy Flight — Planfait', distance: '18 km', dplus: '+1 200m', time: fr ? 'Il y a 6h' : '6h ago', likes: 42, hasPhoto: true, premium: false },
              { id: 'sf-7', user: 'Chloé B.', avatar: '🤿', sport: 'Plongée', title: fr ? 'Épave du Donator — Port-Cros' : 'Donator Wreck — Port-Cros', distance: '-34m', dplus: '', time: fr ? 'Hier' : 'Yesterday', likes: 16, hasPhoto: true, premium: false },
              { id: 'sf-8', user: 'Maxime V.', avatar: '🚵', sport: 'VTT', title: fr ? 'Enduro Finale Ligure — 3 spéciales' : 'Enduro Finale Ligure — 3 stages', distance: '28 km', dplus: '+1 800m', time: fr ? 'Il y a 4h' : '4h ago', likes: 27, hasPhoto: true, premium: false },
              { id: 'sf-9', user: 'Julie R.', avatar: '🏔️', sport: 'Alpinisme', title: fr ? 'Arête des Cosmiques — Mont-Blanc' : 'Cosmiques Ridge — Mont-Blanc', distance: '8 km', dplus: '+800m', time: fr ? 'Avant-hier' : '2 days ago', likes: 55, hasPhoto: true, premium: true },
              { id: 'sf-10', user: 'Romain G.', avatar: '🎿', sport: 'Ski de rando', title: fr ? 'Couloir N du Chardonnet' : 'N Couloir Chardonnet', distance: '12 km', dplus: '+1 400m', time: fr ? 'Hier' : 'Yesterday', likes: 38, hasPhoto: true, premium: false },
              { id: 'sf-11', user: 'Sarah M.', avatar: '🧗', sport: 'Escalade', title: fr ? 'Céüse — Biographie 8a+' : 'Céüse — Biographie 8a+', distance: '', dplus: '', time: fr ? 'Il y a 8h' : '8h ago', likes: 67, hasPhoto: true, premium: false },
              { id: 'sf-12', user: 'Nico T.', avatar: '🚴', sport: 'Gravel', title: fr ? 'Traversée Luberon — gravel 200km' : 'Luberon Crossing — gravel 200km', distance: '204 km', dplus: '+3 200m', time: fr ? 'Avant-hier' : '2 days ago', likes: 44, hasPhoto: true, premium: true },
            ];
            const dayOffset = new Date().getDate() % (allFeedProfiles.length - 3);
            const allRotated = allFeedProfiles.slice(dayOffset).concat(allFeedProfiles.slice(0, dayOffset));

            // Personalized feed: prioritize user's selectedSports
            const matchingSports = selectedSports.length > 0
              ? allRotated.filter(p => selectedSports.some(s => p.sport.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(p.sport.toLowerCase())))
              : [];
            const otherSports = selectedSports.length > 0
              ? allRotated.filter(p => !selectedSports.some(s => p.sport.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(p.sport.toLowerCase())))
              : [];

            const fakeFeed = selectedSports.length > 0
              ? matchingSports.slice(0, 4)
              : allRotated.slice(0, 4);
            const discoverFeed = selectedSports.length > 0
              ? otherSports.slice(0, 3)
              : [];

            const renderPost = (post: typeof allFeedProfiles[0]) => {
              const liked = socialFeedLikes[post.id] || false;
              return (
                <div key={post.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] flex items-center justify-center text-lg">{post.avatar}</div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">{post.user}{post.premium && <span className="ml-1 text-yellow-400 text-xs" title="Premium">👑</span>}</p>
                        <p className="text-xs text-gray-500">{post.time} · {getSportEmoji(post.sport)} {post.sport}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-sm text-white mb-2">{post.title}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {post.distance && <span>📏 {post.distance}</span>}
                      {post.dplus && <span>⛰️ {post.dplus}</span>}
                      {post.hasPhoto && <span>📷</span>}
                    </div>
                  </div>
                  <div className="px-4 py-2.5 bg-white/[0.02] border-t border-white/5 flex gap-2">
                    <button type="button" onClick={() => toggleSocialLike(post.id)} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${liked ? 'bg-orange-500/20 text-orange-400 scale-105' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                      <span className={liked ? 'inline-block animate-bounce' : ''}>{liked ? '🔥' : '🔥'}</span> {post.likes + (liked ? 1 : 0)}
                    </button>
                    <button type="button" onClick={() => showToast(fr ? 'Commentaires bientôt' : 'Comments soon', 'info', '💬')} className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-white hover:bg-white/5 transition">
                      💬
                    </button>
                    <button type="button" onClick={() => { if (typeof navigator !== 'undefined' && navigator.clipboard) navigator.clipboard.writeText(`${post.user}: ${post.title}\nSur Adventurer 🏔️`).then(() => showToast(fr ? 'Copié !' : 'Copied!', 'success', '📋')); }} className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-white hover:bg-white/5 transition">
                      📤
                    </button>
                  </div>
                </div>
              );
            };

            return (
              <>
                {fakeFeed.map(renderPost)}
                {discoverFeed.length > 0 && (
                  <>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide pt-4">
                      {fr ? 'Decouvrir aussi' : 'Discover also'}
                    </h3>
                    {discoverFeed.map(renderPost)}
                  </>
                )}
              </>
            );
          })()}
        </div>
      </section>

      {/* Badges moved to profile — mini-ligue, streak freeze and challenge moved up */}

      {/* INSPIRATION */}
      <section className="px-4 sm:px-6 py-6">
        <h2 className="text-2xl font-bold text-white mb-4">{t('inspiration.title', language)}</h2>

        {loadingStates.posts ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-40 bg-[var(--card)] rounded-lg animate-pulse" role="status" aria-label="Loading post" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {(() => {
              // Personalize: show posts matching user sports first
              const matchingPosts = selectedSports.length > 0
                ? INSPIRATION_POSTS.filter(p => selectedSports.some(s => p.sport.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(p.sport.toLowerCase())))
                : [];
              const otherPosts = selectedSports.length > 0
                ? INSPIRATION_POSTS.filter(p => !selectedSports.some(s => p.sport.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(p.sport.toLowerCase())))
                : [];
              const sortedPosts = selectedSports.length > 0 ? [...matchingPosts, ...otherPosts] : INSPIRATION_POSTS;
              return sortedPosts;
            })().slice(0, 3).map((post) => (
              <div key={post.id} className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4 border-b border-[var(--border)]">
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      onClick={() => setSubPage({ type: 'user-profile', userId: post.userId })}
                      className="flex items-center gap-3 flex-1 hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F77F00] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] rounded px-2 py-1"
                      aria-label={`Profile of ${post.userName}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] flex items-center justify-center text-white font-bold">
                        {post.userName.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-white">{post.userName}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{post.time}</p>
                      </div>
                    </button>
                    <span className="text-lg">{getSportEmoji(post.sport)}</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mb-2">{post.location}</p>
                  <p className="text-base text-white">{post.content}</p>
                  {post.photoCount > 0 && (
                    <p className="text-xs text-[var(--text-secondary)] mt-2">📷 {post.photoCount} {t('inspiration.photos', language)}</p>
                  )}
                </div>

                <div className="px-4 py-3 bg-[var(--bg)] flex gap-4 text-sm font-semibold text-[var(--text-secondary)]">
                  <button
                    onClick={() => handleSocialAction('like', String(post.id))}
                    className="flex-1 hover:text-[#F77F00] py-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F77F00] transition-colors"
                    aria-label={`Like ${post.userName}'s post`}
                  >
                    👍 {post.likes}
                  </button>
                  <button
                    onClick={() => handleSocialAction('comment', String(post.id))}
                    className="flex-1 hover:text-[#F77F00] py-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F77F00] transition-colors"
                    aria-label={`Comment on ${post.userName}'s post`}
                  >
                    💬 {post.comments}
                  </button>
                  <button
                    onClick={() => handleSocialAction('share', String(post.id))}
                    className="flex-1 hover:text-[#F77F00] py-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F77F00] transition-colors"
                    aria-label={`Share ${post.userName}'s post`}
                  >
                    📤 {post.shares}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 10. FAB BUTTON */}
      <div className="fixed bottom-24 right-6 z-50">
        {fabMenuOpen && (
          <div
            className="absolute bottom-20 right-0 space-y-2 mb-2 animate-in fade-in slide-in-from-bottom-2"
            role="menu"
            aria-label="Quick actions menu"
          >
            <button
              onClick={() => {
                setSubPage('quick-match-list');
                setFabMenuOpen(false);
              }}
              className="block w-full text-right mb-2 px-4 py-2 bg-[var(--card)] shadow-lg rounded-lg text-sm font-semibold text-white hover:bg-[var(--bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F77F00] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] transition-colors"
              role="menuitem"
            >
              📸 {t('fab.publishActivity', language)}
            </button>
            <button
              onClick={() => {
                setSubPage('coach-ai');
                setFabMenuOpen(false);
              }}
              className="block w-full text-right mb-2 px-4 py-2 bg-[var(--card)] shadow-lg rounded-lg text-sm font-semibold text-white hover:bg-[var(--bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F77F00] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] transition-colors"
              role="menuitem"
            >
              🏆 {t('fab.createChallenge', language)}
            </button>
            <button
              onClick={() => {
                setSubPage('marketplace');
                setFabMenuOpen(false);
              }}
              className="block w-full text-right mb-2 px-4 py-2 bg-[var(--card)] shadow-lg rounded-lg text-sm font-semibold text-white hover:bg-[var(--bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F77F00] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] transition-colors"
              role="menuitem"
            >
              🛒 {t('fab.sellGear', language)}
            </button>
          </div>
        )}

        <button
          onClick={() => setFabMenuOpen(!fabMenuOpen)}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F77F00] to-[#FFB703] text-[#1B4332] shadow-2xl flex items-center justify-center text-3xl font-bold hover:from-[#FFB703] hover:to-[#FFC933] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F77F00] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] transition-all"
          aria-label={fabMenuOpen ? 'Close quick actions menu' : 'Open quick actions menu'}
          aria-expanded={fabMenuOpen}
          aria-haspopup="menu"
        >
          {fabMenuOpen ? '✕' : '+'}
        </button>
      </div>
    </main>
  );
}
