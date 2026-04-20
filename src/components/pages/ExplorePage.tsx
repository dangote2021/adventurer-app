'use client';
import { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { MAP_SPOTS, GPX_ROUTES, getUpcomingEvents, MARKET_SELL, TEAMS, INSPIRATION_POSTS, USER_PROFILES } from '@/lib/mock-data';
import { getSpots, getEvents, getMarketItems } from '@/lib/supabase/queries';
import type { Spot, EventItem, MarketItem as SupaMarketItem } from '@/lib/supabase/queries';
import { getSportEmoji, SPORTS } from '@/lib/sports-config';
import CreateChallengeModal from '@/components/ui/CreateChallengeModal';
import type { SpotItem, UpcomingEvent, MarketItem } from '@/types';

const WATER_SPORTS = ['Kitesurf', 'Surf', 'Windsurf', 'Wing foil', 'Voile', 'Paddle', 'Kayak', 'Kayak mer'];

function isWaterSport(sport: string): boolean {
  return WATER_SPORTS.some(ws => sport.toLowerCase().includes(ws.toLowerCase()) || ws.toLowerCase().includes(sport.toLowerCase()));
}

type CategoryFilter = 'spots' | 'defis' | 'communaute';

type RankingCriterion = 'sorties' | 'dplus' | 'km' | 'hours' | 'speed';

/** Map Supabase Spot to the SpotItem shape used by the UI */
function mapSpotToSpotItem(spot: Spot): SpotItem {
  return {
    id: typeof spot.id === 'string' ? parseInt(spot.id, 10) || Math.random() : spot.id as unknown as number,
    emoji: spot.emoji || '📍',
    name: spot.name,
    type: spot.type,
    rating: spot.rating ?? 4,
    lat: spot.lat,
    lng: spot.lng,
    sport: spot.sport,
    description: spot.description,
  };
}

/** Map Supabase EventItem to the UpcomingEvent shape used by the UI */
function mapEventToUpcoming(ev: EventItem): UpcomingEvent {
  return {
    id: typeof ev.id === 'string' ? parseInt(ev.id, 10) || Math.random() : ev.id as unknown as number,
    date: ev.date,
    location: ev.location || '',
    emoji: ev.emoji || '🏁',
    title: ev.title,
    description: ev.description,
    tag: ev.tag || '',
    price: ev.price != null ? `${ev.price}€` : 'Gratuit',
    spots: ev.spots_available ? `${ev.spots_available} places` : undefined,
    sport: ev.sport,
  };
}

/** Map Supabase MarketItem to the local MarketItem shape used by the UI */
function mapMarketItem(item: SupaMarketItem): MarketItem {
  return {
    id: typeof item.id === 'string' ? parseInt(item.id, 10) || Math.random() : item.id as unknown as number,
    emoji: item.emoji || '📦',
    title: item.title,
    price: item.price != null ? `${item.price}€` : '0€',
    condition: item.condition || '',
    seller: '',
    sellerId: '',
    description: item.description,
    sport: item.sport,
    type: item.type,
  };
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

export default function ExplorePage() {
  const { selectedSports, showToast, setPage, setSubPage, language, togglePlannedChallenge, isChallengePlanned, userLat, userLng, setUserLocation, geoPermission, setGeoPermission, userName, userChallenges, joinUserChallenge, leaveUserChallenge } = useStore();
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('spots');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [rankingCriterion, setRankingCriterion] = useState<RankingCriterion>('sorties');
  const [searchFocused, setSearchFocused] = useState(false);

  // City search state
  const [cityQuery, setCityQuery] = useState('');
  const [cityResults, setCityResults] = useState<NominatimResult[]>([]);
  const [citySearching, setCitySearching] = useState(false);
  const [showCitySearch, setShowCitySearch] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  // Live data states (with mock fallback)
  const [liveSpots, setLiveSpots] = useState<SpotItem[]>(MAP_SPOTS);
  const [liveEvents, setLiveEvents] = useState<UpcomingEvent[]>(getUpcomingEvents());
  const [liveMarket, setLiveMarket] = useState<MarketItem[]>(MARKET_SELL);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch live data from Supabase
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const sportsFilter = selectedSports.length > 0 ? selectedSports : undefined;

    try {
      const [spotsData, eventsData, marketData] = await Promise.all([
        getSpots(sportsFilter).catch((err) => { console.error('[ExplorePage] getSpots failed:', err); return []; }),
        getEvents(sportsFilter).catch((err) => { console.error('[ExplorePage] getEvents failed:', err); return []; }),
        getMarketItems(sportsFilter).catch((err) => { console.error('[ExplorePage] getMarketItems failed:', err); return []; }),
      ]);

      // Use Supabase data if non-empty, otherwise keep mock fallback
      if (spotsData.length > 0) {
        setLiveSpots(spotsData.map(mapSpotToSpotItem));
      } else {
        setLiveSpots(MAP_SPOTS);
      }

      if (eventsData.length > 0) {
        setLiveEvents(eventsData.map(mapEventToUpcoming));
      } else {
        setLiveEvents(getUpcomingEvents());
      }

      if (marketData.length > 0) {
        setLiveMarket(marketData.map(mapMarketItem));
      } else {
        setLiveMarket(MARKET_SELL);
      }
    } catch (err) {
      console.error('[ExplorePage] Fetch failed, using mock data:', err);
      // Keep mock defaults on total failure
    } finally {
      setIsLoading(false);
    }
  }, [selectedSports]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fr = language === 'fr';

  // Auto-geolocation on first load
  useEffect(() => {
    if (geoPermission === null || geoPermission === 'prompt') {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLocation(pos.coords.latitude, pos.coords.longitude);
            setGeoPermission('granted');
          },
          () => {
            setGeoPermission('denied');
          },
          { timeout: 8000 }
        );
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "Autour de moi" — re-center on user position
  const handleAroundMe = () => {
    if (userLat && userLng) {
      showToast(fr ? `Position : ${userLat.toFixed(4)}, ${userLng.toFixed(4)}` : `Location: ${userLat.toFixed(4)}, ${userLng.toFixed(4)}`, 'success', '📍');
      setPage('map');
    } else {
      setGeoLoading(true);
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLocation(pos.coords.latitude, pos.coords.longitude);
            setGeoPermission('granted');
            setGeoLoading(false);
            showToast(fr ? 'Position mise à jour' : 'Location updated', 'success', '📍');
            setPage('map');
          },
          () => {
            setGeoPermission('denied');
            setGeoLoading(false);
            showToast(fr ? 'Impossible d\'accéder à ta position' : 'Cannot access your location', 'warning', '⚠️');
          },
          { timeout: 8000 }
        );
      }
    }
  };

  // City search via Nominatim
  const searchCity = useCallback(async (query: string) => {
    if (query.length < 2) {
      setCityResults([]);
      return;
    }
    setCitySearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`);
      const data: NominatimResult[] = await res.json();
      setCityResults(data);
    } catch {
      setCityResults([]);
    } finally {
      setCitySearching(false);
    }
  }, []);

  // Debounce city search
  useEffect(() => {
    if (!showCitySearch) return;
    const timer = setTimeout(() => searchCity(cityQuery), 400);
    return () => clearTimeout(timer);
  }, [cityQuery, showCitySearch, searchCity]);

  const handleSelectCity = (result: NominatimResult) => {
    setUserLocation(parseFloat(result.lat), parseFloat(result.lon));
    setGeoPermission('granted');
    showToast(`📍 ${result.display_name.split(',')[0]}`, 'success');
    setShowCitySearch(false);
    setCityQuery('');
    setCityResults([]);
  };

  // P8: Autocomplete suggestions based on sport + location
  const autocompleteSuggestions = [
    { text: fr ? 'Kite Tarifa' : 'Kite Tarifa', icon: '🪁' },
    { text: fr ? 'Trail Chamonix' : 'Trail Chamonix', icon: '🏔️' },
    { text: fr ? 'Escalade Verdon' : 'Climbing Verdon', icon: '🧗' },
    { text: fr ? 'Surf Hossegor' : 'Surf Hossegor', icon: '🏄' },
    { text: fr ? 'Plongée Port-Cros' : 'Diving Port-Cros', icon: '🤿' },
    { text: fr ? 'VTT Finale Ligure' : 'MTB Finale Ligure', icon: '🚵' },
    { text: fr ? 'Parapente Annecy' : 'Paragliding Annecy', icon: '🪂' },
    { text: fr ? 'Rando GR20' : 'Hiking GR20', icon: '🥾' },
  ];

  const filteredSuggestions = searchQuery.length > 0
    ? autocompleteSuggestions.filter(s => s.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : autocompleteSuggestions;

  // P8: Reduced to 3 tabs (Spots, Défis, Communauté)
  const categories = [
    { id: 'spots' as const, label: fr ? 'Spots & Routes' : 'Spots & Routes', icon: '📍' },
    { id: 'defis' as const, label: fr ? 'Défis' : 'Challenges', icon: '🏁' },
    { id: 'communaute' as const, label: fr ? 'Communauté' : 'Community', icon: '👥' },
  ];

  // Filter routes by search, sports and difficulty (GPX_ROUTES has no Supabase equivalent yet)
  const filteredRoutes = GPX_ROUTES.filter((route) => {
    const matchesSearch = route.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSports.length === 0 || selectedSports.includes(route.sport);
    const matchesDifficulty = !difficultyFilter || route.difficulty === difficultyFilter;
    return matchesSearch && matchesSport && matchesDifficulty;
  });

  const availableDifficulties = Array.from(new Set(GPX_ROUTES.map(r => r.difficulty)));

  // Filter spots by search and sports (use live data)
  const filteredSpots = liveSpots.filter((spot) => {
    const matchesSearch = spot.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSports.length === 0 || selectedSports.includes(spot.sport);
    return matchesSearch && matchesSport;
  });

  // Filter défis (use live data)
  const filteredDefis = liveEvents.filter((event) => {
    return event.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Filter teams (no Supabase equivalent yet, keep mock)
  const filteredTeams = TEAMS.filter((team) => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSports.length === 0 || selectedSports.includes(team.sport);
    return matchesSearch && matchesSport;
  });

  // Filter market items (use live data)
  const filteredMarket = liveMarket.filter((item) => {
    return item.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Compute score per criterion (speed = km / hours)
  const getScore = (user: typeof USER_PROFILES[number]): number => {
    const s = user.stats as Record<string, number> | undefined;
    if (!s) return 0;
    if (rankingCriterion === 'sorties') return s.sorties || 0;
    if (rankingCriterion === 'dplus') return s.dplus || 0;
    if (rankingCriterion === 'km') return s.km || 0;
    if (rankingCriterion === 'hours') return s.hours || 0;
    if (rankingCriterion === 'speed') return s.km && s.hours ? Math.round((s.km / s.hours) * 10) / 10 : 0;
    return 0;
  };

  const leaderboard = [...USER_PROFILES].sort((a, b) => getScore(b) - getScore(a)).slice(0, 10);

  const rankingLabels: Record<RankingCriterion, string> = {
    sorties: t('explore.criteria.sorties', language),
    dplus: t('explore.criteria.dplus', language),
    km: t('explore.criteria.km', language),
    hours: language === 'fr' ? 'Heures de pratique' : 'Practice hours',
    speed: language === 'fr' ? 'Vitesse moyenne' : 'Average speed',
  };

  const formatRankingValue = (user: typeof USER_PROFILES[number]) => {
    const stats = user.stats as Record<string, number> | undefined;
    if (rankingCriterion === 'sorties') return `${stats?.sorties || 0} ${t('explore.activities', language)}`;
    if (rankingCriterion === 'dplus') return `${((stats?.dplus || 0) / 1000).toFixed(1)}k m D+`;
    if (rankingCriterion === 'km') return `${stats?.km || 0} km`;
    if (rankingCriterion === 'hours') return `${stats?.hours || 0}h`;
    if (rankingCriterion === 'speed') {
      const spd = stats?.km && stats?.hours ? (stats.km / stats.hours).toFixed(1) : '—';
      return `${spd} km/h`;
    }
    return '';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Facile': return 'bg-green-900/20 text-green-400';
      case 'Moyen': return 'bg-yellow-900/20 text-yellow-400';
      case 'Difficile': return 'bg-red-900/20 text-red-400';
      default: return 'bg-white/10 text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] max-w-[430px] mx-auto pb-24">
      {/* P8: Enhanced Search Bar with autocomplete */}
      <div className="sticky top-0 bg-[var(--bg)] z-20 p-4 border-b border-white/10">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">🔍</span>
          <input
            type="text"
            placeholder={fr ? 'Rechercher un spot, sport, lieu...' : 'Search spots, sports, places...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            aria-label={fr ? 'Barre de recherche' : 'Search bar'}
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/10 border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:bg-white/15 text-base text-white placeholder:text-gray-500 transition-all"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm">✕</button>
          )}
        </div>

        {/* Geolocation row: "Autour de moi" + city search toggle */}
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={handleAroundMe}
            disabled={geoLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-[var(--accent)]/15 text-[var(--accent)] rounded-xl text-sm font-semibold hover:bg-[var(--accent)]/25 transition disabled:opacity-50"
          >
            <span>📍</span> {geoLoading ? (fr ? 'Localisation...' : 'Locating...') : (fr ? 'Autour de moi' : 'Around me')}
          </button>
          <button
            type="button"
            onClick={() => setShowCitySearch(!showCitySearch)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition ${showCitySearch ? 'bg-white/15 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
          >
            <span>🏙️</span> {fr ? 'Chercher une ville' : 'Search city'}
          </button>
        </div>

        {/* City search input (Nominatim) */}
        {showCitySearch && (
          <div className="mt-2 relative">
            <input
              type="text"
              placeholder={fr ? 'Ex: Chamonix, Tarifa, Annecy...' : 'E.g. Chamonix, Tarifa, Annecy...'}
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm text-white placeholder:text-gray-500"
              aria-label={fr ? 'Recherche de ville' : 'City search'}
            />
            {citySearching && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs animate-pulse">{fr ? 'Recherche...' : 'Searching...'}</span>
            )}
            {cityResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden z-30">
                {cityResults.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectCity(r)}
                    className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 transition-colors border-b border-white/5 last:border-b-0"
                  >
                    <span className="text-lg">📍</span>
                    <span className="text-sm text-white truncate">{r.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Autocomplete dropdown */}
        {searchFocused && searchQuery.length < 3 && !showCitySearch && (
          <div className="absolute left-4 right-4 mt-2 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden z-30">
            <p className="px-4 pt-3 pb-1 text-xs text-gray-500 uppercase tracking-wide">{fr ? 'Suggestions' : 'Suggestions'}</p>
            {filteredSuggestions.slice(0, 5).map((s, i) => (
              <button key={i} type="button" onClick={() => { setSearchQuery(s.text); setSearchFocused(false); }}
                className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 transition-colors">
                <span className="text-lg">{s.icon}</span>
                <span className="text-sm text-white">{s.text}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="px-4 py-3 overflow-x-auto">
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              aria-label={`Filter by ${cat.label}`}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-white/10 text-gray-400 hover:bg-white/5'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sport Filter Chips */}
      {selectedSports.length > 0 && (
        <div className="px-4">
          <div className="flex gap-2 flex-wrap">
            {selectedSports.map((sport) => (
              <div key={sport} className="bg-[var(--accent)]/10 px-3 py-1 rounded-full text-sm text-[var(--accent)]">
                {getSportEmoji(sport)} {sport}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="px-4 py-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/10 rounded w-1/2" />
                  <div className="h-3 bg-white/10 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content Sections */}
      <div className="px-4 space-y-6" style={{ display: isLoading ? 'none' : undefined }}>
        {/* SPOTS & ROUTES TAB (merged P8) */}
        {activeCategory === 'spots' && (
          <>
          {/* Difficulty filters for routes */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
            <button type="button" onClick={() => setDifficultyFilter(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${!difficultyFilter ? 'bg-[var(--accent)] text-white' : 'bg-white/10 text-gray-400'}`}
              aria-pressed={!difficultyFilter}>
              {fr ? 'Tout' : 'All'}
            </button>
            {availableDifficulties.map((d) => (
              <button key={d} type="button" onClick={() => setDifficultyFilter(difficultyFilter === d ? null : d)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${difficultyFilter === d ? 'bg-[var(--accent)] text-white' : 'bg-white/10 text-gray-400'}`}
                aria-pressed={difficultyFilter === d}>
                {d}
              </button>
            ))}
          </div>

          {/* Spots */}
          <div className="space-y-4">
            {filteredSpots.length === 0 && filteredRoutes.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-6">{fr ? 'Aucun résultat' : 'No results'}</p>
            )}
            {filteredSpots.map((spot) => (
              <div key={spot.id} className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] hover:bg-white/5 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{spot.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-base text-white">{spot.name}</h3>
                    <p className="text-gray-400 text-sm">{spot.type}</p>
                    <div className="flex gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < spot.rating ? '⭐' : '☆'} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs bg-[var(--accent)]/20 text-[var(--accent)] px-2 py-1 rounded">
                    {getSportEmoji(spot.sport)} {spot.sport}
                  </span>
                </div>
                {isWaterSport(spot.sport) && spot.windSpeed != null && (
                  <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-blue-900/20 border border-blue-500/20 rounded-lg">
                    <span className="text-base">💨</span>
                    <span className="text-sm font-semibold text-white">{spot.windSpeed} kts {spot.windDirection}</span>
                    <span className="text-gray-500">·</span>
                    <span className="text-sm text-blue-300">{spot.windStatus}</span>
                  </div>
                )}
                <div className="border-t border-[var(--border)] pt-3">
                  <p className="text-sm font-semibold text-gray-300 mb-2">{t('explore.whoGoesWeekend', language)}</p>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((idx) => (
                      <button key={idx} onClick={() => setSubPage({ type: 'user-profile', userId: `user-${idx}` })}
                        aria-label={`View user profile ${idx}`}
                        className="w-10 h-10 bg-[var(--accent)]/30 rounded-full flex items-center justify-center cursor-pointer hover:bg-[var(--accent)]/40 transition-colors font-semibold text-white">
                        {idx}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Routes within same tab */}
          {filteredRoutes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">{fr ? 'Itinéraires' : 'Routes'}</h3>
              {filteredRoutes.map((route) => (
                <div key={route.id} className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] hover:bg-white/5 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getSportEmoji(route.sport)}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base mb-1 text-white">{route.name}</h3>
                      <p className="text-gray-400 text-sm mb-2">{route.region}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-sm bg-white/10 px-2 py-1 rounded text-gray-300">{route.distance}km</span>
                        <span className="text-sm bg-white/10 px-2 py-1 rounded text-gray-300">D+{route.dplus}</span>
                        <span className="text-sm bg-white/10 px-2 py-1 rounded text-gray-300">{route.duration}</span>
                        <span className={`text-sm px-2 py-1 rounded font-semibold ${getDifficultyColor(route.difficulty)}`}>{route.difficulty}</span>
                      </div>
                      <button onClick={() => setPage('map')} className="text-[var(--accent)] font-semibold text-sm hover:underline">
                        {t('explore.viewOnMap', language)}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </>
        )}

        {/* MARKETPLACE (accessible via search in spots) */}
        {activeCategory === 'spots' && filteredMarket.length > 0 && searchQuery.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">{fr ? 'Matériel' : 'Gear'}</h3>
            {filteredMarket.slice(0, 3).map((item) => (
              <div key={item.id} className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] hover:bg-white/5 transition-colors">
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-base text-white">{item.title}</h3>
                    <p className="text-gray-300 font-semibold text-base">{item.price}</p>
                    <p className="text-gray-500 text-sm">{item.condition}</p>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => setSubPage('marketplace')} className="text-[var(--accent)] font-semibold text-sm hover:underline">
              {fr ? 'Voir tout le matériel →' : 'View all gear →'}
            </button>
          </div>
        )}

        {/* OLD SPOTS TAB — removed, merged above */}
        {false && (
          <div className="space-y-4">
            {filteredSpots.map((spot) => (
              <div key={spot.id} className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] hover:bg-white/5 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{spot.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-base text-white">{spot.name}</h3>
                    <p className="text-gray-400 text-sm">{spot.type}</p>
                    <div className="flex gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < spot.rating ? '⭐' : '☆'} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs bg-[var(--accent)]/20 text-[var(--accent)] px-2 py-1 rounded">
                    {getSportEmoji(spot.sport)} {spot.sport}
                  </span>
                </div>
                <div className="border-t border-[var(--border)] pt-3">
                  <p className="text-sm font-semibold text-gray-300 mb-2">{t('explore.whoGoesWeekend', language)}</p>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((idx) => (
                      <button
                        key={idx}
                        onClick={() => setSubPage({ type: 'user-profile', userId: `user-${idx}` })}
                        aria-label={`View user profile ${idx}`}
                        className="w-10 h-10 bg-[var(--accent)]/30 rounded-full flex items-center justify-center cursor-pointer hover:bg-[var(--accent)]/40 transition-colors font-semibold text-white"
                      >
                        {idx}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DEFIS TAB */}
        {activeCategory === 'defis' && (
          <div className="space-y-4">
            {/* Create challenge button */}
            <button
              onClick={() => setShowCreateChallenge(true)}
              className="w-full py-3 bg-emerald-600 text-white rounded-lg font-semibold text-base hover:bg-emerald-700 transition-colors"
            >
              {t('challenges.createBtn', language)}
            </button>

            {/* User-created challenges */}
            {userChallenges.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">{t('challenges.communityTitle', language)}</h3>
                {userChallenges.map((uc) => {
                  const isParticipant = uc.participants.includes(userName || '');
                  return (
                    <div key={uc.id} className="border border-emerald-500/20 rounded-lg p-4 bg-[var(--card)] hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{uc.emoji}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(uc.date).toLocaleDateString(fr ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="font-bold text-base mb-0.5 text-white">{uc.title}</h3>
                      <p className="text-xs text-gray-400 mb-1">
                        {uc.sport}{uc.distance ? ` · ${uc.distance}` : ''}{uc.location ? ` · ${uc.location}` : ''}
                      </p>
                      {uc.description && <p className="text-sm text-gray-500 mb-2">{uc.description}</p>}
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-emerald-400">
                          {uc.participants.length} {t('challenges.participants', language)} · {t('challenges.by', language)} {uc.authorName}
                        </p>
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
                          className={`px-4 py-2 rounded font-semibold text-sm transition-colors ${
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

            {/* Existing/official challenges */}
            <div className="space-y-3">
              {filteredDefis.map((event) => (
                <div key={event.id} className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] hover:bg-white/5 transition-colors">
                  <p className="text-gray-400 text-sm mb-1">{event.date}</p>
                  <h3 className="font-bold text-base mb-2 text-white">{event.title}</h3>
                  <p className="text-gray-400 text-sm mb-3">{event.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {event.tag && <span className="text-xs bg-[var(--accent)]/20 text-[var(--accent)] px-2 py-1 rounded">{event.tag}</span>}
                      <span className="text-sm font-semibold text-gray-300">{event.price}</span>
                    </div>
                    <button
                      onClick={() => {
                        togglePlannedChallenge(event.id);
                        showToast(
                          isChallengePlanned(event.id)
                            ? `${t('explore.leftChallenge', language)}: ${event.title}`
                            : `${t('explore.joinedChallenge', language)}: ${event.title}`,
                          isChallengePlanned(event.id) ? 'info' : 'success'
                        );
                      }}
                      aria-label={`${isChallengePlanned(event.id) ? 'Leave' : 'Join'} challenge: ${event.title}`}
                      className={`px-4 py-2 rounded font-semibold text-sm transition-colors ${isChallengePlanned(event.id) ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90'}`}
                    >
                      {isChallengePlanned(event.id) ? t('explore.joined', language) : t('explore.join', language)}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Create Challenge Modal */}
            {showCreateChallenge && <CreateChallengeModal onClose={() => setShowCreateChallenge(false)} />}
          </div>
        )}

        {/* COMMUNAUTÉ TAB (P8: merged Equipes + Classement + Marketplace) */}
        {activeCategory === 'communaute' && (
          <div className="space-y-6">
            {/* Teams section */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">{fr ? 'Équipes' : 'Teams'}</h3>
              <button onClick={() => showToast(fr ? 'Création de groupe bientôt disponible' : 'Group creation coming soon', 'info')}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold text-base hover:bg-emerald-700 transition-colors">
                {fr ? '+ Créer une équipe' : '+ Create a team'}
              </button>
              {filteredTeams.map((team) => (
                <button key={team.id} onClick={() => setSubPage({ type: 'team-detail', teamId: team.id })}
                  className="w-full border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] hover:bg-white/5 transition-colors text-left">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{team.emoji}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-base text-white">{team.name}</h3>
                      <p className="text-gray-400 text-sm">{getSportEmoji(team.sport)} {team.sport}</p>
                      <p className="text-gray-500 text-sm mt-1">{team.memberCount} {fr ? 'membres' : 'members'} • {fr ? 'Prochain' : 'Next'}: {team.nextEvent}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Ranking section */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">{fr ? 'Classement' : 'Ranking'}</h3>
              <div className="flex items-center gap-2">
                <select id="ranking-criterion" value={rankingCriterion}
                  onChange={(e) => setRankingCriterion(e.target.value as RankingCriterion)}
                  className="bg-white/5 border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
                  <option value="sorties">{rankingLabels.sorties}</option>
                  <option value="dplus">{rankingLabels.dplus}</option>
                  <option value="km">{rankingLabels.km}</option>
                  <option value="hours">{rankingLabels.hours}</option>
                  <option value="speed">{rankingLabels.speed}</option>
                </select>
              </div>
              {leaderboard.slice(0, 5).map((user, index) => (
                <button key={user.id} onClick={() => setSubPage({ type: 'user-profile', userId: user.id })}
                  className="w-full border border-[var(--border)] rounded-lg p-4 bg-[var(--card)] hover:bg-white/5 transition-colors text-left flex items-center gap-3">
                  <div className="text-2xl font-bold text-[var(--accent)] w-8">{index + 1}</div>
                  <div className="w-10 h-10 bg-[var(--accent)]/30 rounded-full flex items-center justify-center font-semibold text-white">{user.name.charAt(0)}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base text-white">{user.name}</h3>
                    <p className="text-gray-400 text-sm">{formatRankingValue(user)}</p>
                  </div>
                  <span className="text-yellow-500 text-xl">⭐</span>
                </button>
              ))}
            </div>

            {/* Coach Hub CTA */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">{fr ? 'Coaching' : 'Coaching'}</h3>
              <button onClick={() => setSubPage('coach-hub')}
                className="w-full bg-gradient-to-r from-[#023E8A]/20 to-[#2D6A4F]/20 border border-[#023E8A]/30 rounded-xl p-4 text-left hover:border-[var(--accent)]/40 transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🏋️</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-white">{fr ? 'Coachs & Préparation' : 'Coaches & Training'}</p>
                    <p className="text-xs text-gray-400">{fr ? '12 coachs certifiés · Plans personnalisés' : '12 certified coaches · Personalized plans'}</p>
                  </div>
                  <span className="text-gray-500">→</span>
                </div>
              </button>
              <button onClick={() => setSubPage('coach-ai')}
                className="w-full bg-gradient-to-r from-purple-900/20 to-violet-900/10 border border-purple-500/20 rounded-xl p-4 text-left hover:border-purple-400/40 transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🤖</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-white">{fr ? 'Coach IA' : 'AI Coach'}</p>
                    <p className="text-xs text-gray-400">{fr ? 'Plan d\'entraînement en 30 sec — gratuit' : 'Training plan in 30 sec — free'}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-bold rounded-full">{fr ? 'Essayer' : 'Try it'}</span>
                </div>
              </button>
            </div>

            {/* Marketplace preview */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">{fr ? 'Matériel d\'occasion' : 'Used Gear'}</h3>
              {filteredMarket.slice(0, 3).map((item) => (
                <div key={item.id} className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--card)] hover:bg-white/5 transition-colors">
                  <div className="h-20 bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center relative">
                    <span className="text-4xl opacity-80">{item.emoji}</span>
                    {item.originalPrice && (
                      <div className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        -{Math.round((1 - parseInt(item.price) / parseInt(item.originalPrice)) * 100)}%
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm text-white truncate">{item.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[var(--accent)] font-bold text-sm">{item.price}</p>
                      {item.originalPrice && <p className="text-xs text-gray-500 line-through">{item.originalPrice}</p>}
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5">{item.condition} • {item.seller}</p>
                  </div>
                </div>
              ))}
              <button onClick={() => setSubPage('marketplace')} className="w-full py-2.5 bg-[var(--accent)]/10 text-[var(--accent)] font-semibold text-sm rounded-xl hover:bg-[var(--accent)]/20 transition">
                {fr ? 'Voir tout le matériel →' : 'View all gear →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
