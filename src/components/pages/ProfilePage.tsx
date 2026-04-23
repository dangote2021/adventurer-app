'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/supabase/auth-provider';
import { getAchievements, PROFILE_STATS, ACTIVITY_HEATMAP, TEAMS, getUserProfile as getMockUserProfile, getUpcomingEvents } from '@/lib/mock-data';
import { getSportEmoji } from '@/lib/sports-config';
import { t } from '@/lib/i18n';
import { getUserProfile, getUserSports, getUserStats } from '@/lib/supabase/queries';
import { supabase } from '@/lib/supabase/client';
import { apiUrl } from '@/lib/api-url';

// Weather lookup by rough geo region — more realistic than a pure formula
function estimateWeather(lat: number, lng: number): { temp: number; feels: number; wind: number; humidity: number; icon: string; region: string } {
  // Rough regions by lat/lng
  // Méditerranée Espagne (Tarifa, Andalousie)
  if (lat < 38 && lng > -7 && lng < 0) return { temp: 22, feels: 24, wind: 28, humidity: 62, icon: '🌤', region: 'Méditerranée (Espagne)' };
  // Méditerranée France (Nice, Cassis, Porquerolles)
  if (lat >= 42.5 && lat < 44 && lng >= 3 && lng < 8) return { temp: 20, feels: 20, wind: 12, humidity: 68, icon: '☀️', region: 'Méditerranée (France)' };
  // Alpes (Chamonix, Annecy, Grenoble)
  if (lat >= 44.5 && lat <= 46.5 && lng >= 5.5 && lng <= 7.5) return { temp: 11, feels: 9, wind: 14, humidity: 72, icon: '⛅', region: 'Alpes' };
  // Atlantique (Biarritz)
  if (lat >= 43 && lat <= 44 && lng < -1) return { temp: 17, feels: 17, wind: 20, humidity: 75, icon: '🌥', region: 'Atlantique' };
  // Pyrénées
  if (lat >= 42.5 && lat < 43.5 && lng >= -1 && lng <= 3) return { temp: 14, feels: 12, wind: 10, humidity: 70, icon: '⛅', region: 'Pyrénées' };
  // Corse
  if (lat >= 41 && lat <= 43 && lng >= 8 && lng <= 10) return { temp: 19, feels: 20, wind: 16, humidity: 66, icon: '☀️', region: 'Corse' };
  // Fallback Europe
  return { temp: 15, feels: 14, wind: 12, humidity: 70, icon: '⛅', region: '—' };
}

export default function ProfilePage() {
  const { userName, userEmail, userAvatar, userBio, setUserName, setUserAvatar, setUserBio, selectedSports, activityLog, fontSize, setFontSize, setSubPage, showToast, logout, theme, toggleTheme, language, setLanguage, getFriendList, reopenSportSelector, userLat, userLng, plannedChallenges, togglePlannedChallenge, setUserLocation, setGeoPermission, geoPermission, referralCode, streakWeeks, logActivity, pushNotificationsEnabled, setPushNotificationsEnabled, stravaConnected, stravaAthleteName, stravaAthleteId, stravaActivities, stravaLastSync, connectStrava, disconnectStrava, setStravaActivities } = useStore();
  const { user: authUser, signOut } = useAuth();
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [editBio, setEditBio] = useState(userBio);
  const [editAvatar, setEditAvatar] = useState(userAvatar);

  // Real Supabase data state
  const [dbProfile, setDbProfile] = useState<Record<string, unknown> | null>(null);
  const [dbSports, setDbSports] = useState<string[] | null>(null);
  const [dbStats, setDbStats] = useState<Record<string, unknown> | null>(null);

  // Fetch real user data from Supabase on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchUserData() {
      // Use authUser from context, or fall back to direct getUser call
      let userId: string | null = authUser?.id ?? null;
      if (!userId) {
        const { data } = await supabase.auth.getUser();
        userId = data.user?.id ?? null;
      }
      if (!userId || cancelled) return;

      const [profile, sports, stats] = await Promise.all([
        getUserProfile(userId),
        getUserSports(userId),
        getUserStats(userId),
      ]);

      if (cancelled) return;

      if (profile) {
        setDbProfile(profile as Record<string, unknown>);
        // Sync to store if store values are empty
        if (!userName && typeof profile.display_name === 'string') {
          setUserName(profile.display_name);
        }
        if (!userBio && typeof profile.bio === 'string') {
          setUserBio(profile.bio);
        }
        if (typeof profile.avatar === 'string' && profile.avatar && userAvatar === '👤') {
          setUserAvatar(profile.avatar);
        }
      }
      if (sports && sports.length > 0) {
        setDbSports(sports);
      }
      if (stats) {
        setDbStats(stats as Record<string, unknown>);
      }
    }

    fetchUserData();
    return () => { cancelled = true; };
  }, [authUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Derived display values: prefer store data, fall back to Supabase data, then mock
  const displayName = userName || (dbProfile?.display_name as string) || '';
  const displayEmail = userEmail || authUser?.email || '';
  const displayBio = userBio || (dbProfile?.bio as string) || '';
  const displayAvatar = userAvatar !== '👤' ? userAvatar : (dbProfile?.avatar as string) || userAvatar;
  const displaySports = selectedSports.length > 0 ? selectedSports : (dbSports ?? []);
  const displayLevel = (dbProfile?.level as string) || (dbProfile?.experience_level as string) || '';

  const avatarOptions = ['👤', '🧗', '🏄', '🚴', '🏔️', '🪁', '🤿', '🏃', '🎿', '🪂', '🧘', '🏋️'];

  // P9: Profile completion percentage
  const profileFields = [!!displayName, !!displayBio, displayAvatar !== '👤', displaySports.length > 0, activityLog.length > 0];
  const profileCompletion = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

  const requestGeo = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      showToast(language === 'fr' ? 'Géolocalisation indisponible' : 'Geolocation unavailable', 'warning', '⚠️');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation(pos.coords.latitude, pos.coords.longitude);
        setGeoPermission('granted');
        showToast(language === 'fr' ? 'Position mise à jour !' : 'Location updated!', 'success', '📍');
      },
      () => {
        setGeoPermission('denied');
        showToast(language === 'fr' ? 'Permission refusée' : 'Permission denied', 'error', '❌');
      },
      { timeout: 10000 }
    );
  };
  // Reverse geocode for profile location
  const [profileCity, setProfileCity] = useState('Chamonix, France');
  useEffect(() => {
    if (!userLat || !userLng) return;
    const ctl = new AbortController();
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${userLat}&lon=${userLng}&format=json&zoom=10&accept-language=fr`, { signal: ctl.signal })
      .then(r => r.json())
      .then(d => {
        const city = d.address?.city || d.address?.town || d.address?.village || d.address?.state || '';
        const country = d.address?.country || '';
        if (city) setProfileCity(country && country !== city ? `${city}, ${country}` : city);
      })
      .catch(() => {});
    return () => ctl.abort();
  }, [userLat, userLng]);

  const [showGpxImport, setShowGpxImport] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>('default');

  // Check notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    } else {
      setNotifPermission('unsupported');
    }
  }, []);

  const [stravaLoading, setStravaLoading] = useState(false);
  const [stravaSyncing, setStravaSyncing] = useState(false);

  // Check for Strava connection on mount (from callback redirect)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('adventurer-strava');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.connected && data.athleteId && !stravaConnected) {
          connectStrava({
            athleteName: data.athleteName,
            athleteId: data.athleteId,
            profilePic: data.profilePic || '',
          });
          // Auto-sync activities on first connection
          fetchStravaActivities();
        }
      }
    } catch { /* ignore parse errors */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStravaActivities = async () => {
    setStravaSyncing(true);
    try {
      const res = await fetch(apiUrl('/api/strava/activities'));
      if (res.ok) {
        const data = await res.json();
        if (data.activities && Array.isArray(data.activities)) {
          setStravaActivities(data.activities);
          showToast(
            language === 'fr'
              ? `${data.activities.length} activites Strava synchronisees !`
              : `${data.activities.length} Strava activities synced!`,
            'success',
            '🔄'
          );
        }
      } else {
        const err = await res.json().catch(() => ({}));
        if (err.code === 'not_connected' || err.code === 'refresh_failed') {
          disconnectStrava();
          showToast(language === 'fr' ? 'Session Strava expiree, reconnecte-toi' : 'Strava session expired, reconnect', 'warning', '⚠️');
        } else {
          showToast(language === 'fr' ? 'Erreur de synchronisation Strava' : 'Strava sync error', 'error', '❌');
        }
      }
    } catch {
      showToast(language === 'fr' ? 'Erreur reseau' : 'Network error', 'error', '❌');
    } finally {
      setStravaSyncing(false);
    }
  };

  const handleStravaConnect = () => {
    setStravaLoading(true);
    window.location.href = '/api/strava/auth';
  };

  const handleStravaDisconnect = () => {
    disconnectStrava();
    showToast(language === 'fr' ? 'Strava deconnecte' : 'Strava disconnected', 'info', '🔗');
  };

  // Format seconds to human readable
  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h${m.toString().padStart(2, '0')}`;
    return `${m}min`;
  };

  // GPX parsing helper
  const handleGpxFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');

        // Extract name
        const nameEl = xml.querySelector('trk > name') || xml.querySelector('metadata > name');
        const name = nameEl?.textContent || file.name.replace('.gpx', '');

        // Extract track points
        const trkpts = xml.querySelectorAll('trkpt');
        let totalDistance = 0;
        let totalElevGain = 0;
        let prevLat: number | null = null;
        let prevLng: number | null = null;
        let prevEle: number | null = null;

        trkpts.forEach((pt) => {
          const lat = parseFloat(pt.getAttribute('lat') || '0');
          const lng = parseFloat(pt.getAttribute('lon') || '0');
          const eleEl = pt.querySelector('ele');
          const ele = eleEl ? parseFloat(eleEl.textContent || '0') : null;

          if (prevLat !== null && prevLng !== null) {
            // Haversine distance
            const R = 6371;
            const dLat = (lat - prevLat) * Math.PI / 180;
            const dLon = (lng - prevLng) * Math.PI / 180;
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(prevLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
            totalDistance += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          }

          if (ele !== null && prevEle !== null && ele > prevEle) {
            totalElevGain += ele - prevEle;
          }

          prevLat = lat;
          prevLng = lng;
          prevEle = ele;
        });

        logActivity({
          sport: 'Trail',
          title: name,
          distance: `${totalDistance.toFixed(1)} km`,
          dplus: `+${Math.round(totalElevGain)}m`,
        });

        showToast(
          language === 'fr'
            ? `Activite importee : ${name} (${totalDistance.toFixed(1)} km, +${Math.round(totalElevGain)}m)`
            : `Activity imported: ${name} (${totalDistance.toFixed(1)} km, +${Math.round(totalElevGain)}m)`,
          'success',
          '📥'
        );
        setShowGpxImport(false);
      } catch {
        showToast(language === 'fr' ? 'Erreur lors du parsing GPX' : 'Error parsing GPX file', 'error', '❌');
      }
    };
    reader.readAsText(file);
  };

  const handleTogglePushNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      showToast(language === 'fr' ? 'Notifications non supportees' : 'Notifications not supported', 'warning', '⚠️');
      return;
    }
    if (!pushNotificationsEnabled) {
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
      if (permission === 'granted') {
        setPushNotificationsEnabled(true);
        showToast(language === 'fr' ? 'Notifications activees !' : 'Notifications enabled!', 'success', '🔔');
      } else {
        setPushNotificationsEnabled(false);
      }
    } else {
      setPushNotificationsEnabled(false);
      showToast(language === 'fr' ? 'Notifications desactivees' : 'Notifications disabled', 'info', '🔕');
    }
  };

  const [tab, setTab] = useState<'overview' | 'activity' | 'teams' | 'settings'>('overview');
  const achievements = getAchievements();
  const friendIds = getFriendList();
  const userTeams = TEAMS.filter(t => t.members.some(m => m.role === 'admin')).slice(0, 3);

  return (
    <div className="min-h-screen bg-[var(--bg)] max-w-[430px] mx-auto pb-24">
      {/* Cover with Mountain SVG */}
      <div className="relative h-44 bg-gradient-to-b from-[#1B4332] to-[#0D2818] overflow-hidden">
        {/* Mountain SVG Background */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 430 176" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          {/* Far mountains - darkest */}
          <path d="M 0 176 L 80 80 L 160 140 L 200 60 L 280 120 L 350 70 L 430 130 L 430 176 Z" fill="#1B4332" opacity="0.7" />
          {/* Mid mountains - medium blue */}
          <path d="M 0 176 L 60 110 L 140 160 L 180 90 L 260 150 L 340 100 L 430 160 L 430 176 Z" fill="#2D6A4F" opacity="0.8" />
          {/* Close mountains - lighter blue */}
          <path d="M 0 176 L 50 120 L 120 170 L 160 100 L 240 165 L 320 110 L 430 170 L 430 176 Z" fill="#40916C" opacity="0.9" />
        </svg>

        {/* Name and location overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">{displayName || (language === 'fr' ? 'Aventurier' : 'Adventurer')}</h1>
          {displayLevel && <p className="text-white/90 text-xs drop-shadow mt-0.5 font-medium">{displayLevel}</p>}
          <p className="text-white/80 text-sm drop-shadow mt-1">📍 {profileCity}</p>
          {displayBio && <p className="text-white/60 text-xs drop-shadow mt-0.5 max-w-[280px]">{displayBio}</p>}
        </div>

        {/* Avatar circle below cover */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center z-20">
          <button type="button" onClick={() => { setEditingProfile(true); setEditName(userName); setEditBio(userBio); setEditAvatar(userAvatar); }}
            className="relative group">
            <div className="w-24 h-24 rounded-full bg-[var(--card)] border-4 border-[var(--bg)] flex items-center justify-center text-5xl mx-auto overflow-hidden">
              {typeof displayAvatar === 'string' && displayAvatar.startsWith('http') ? (
                <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : displayAvatar}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="text-white text-sm font-semibold">✏️</span>
            </div>
          </button>
        </div>
      </div>

      {/* P9: Profile Edit Modal */}
      {editingProfile && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditingProfile(false)}>
          <div className="bg-[var(--card)] w-full max-w-[400px] rounded-2xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{language === 'fr' ? 'Modifier mon profil' : 'Edit my profile'}</h2>
              <button type="button" onClick={() => setEditingProfile(false)} className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded bg-white/5">✕</button>
            </div>

            {/* Avatar picker */}
            <div>
              <p className="text-xs text-gray-400 mb-2">{language === 'fr' ? 'Avatar' : 'Avatar'}</p>
              <div className="flex flex-wrap gap-2">
                {avatarOptions.map(a => (
                  <button key={a} type="button" onClick={() => setEditAvatar(a)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${editAvatar === a ? 'bg-[var(--accent)]/30 ring-2 ring-[var(--accent)] scale-110' : 'bg-white/5 hover:bg-white/10'}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">{language === 'fr' ? 'Nom d\'aventurier' : 'Adventurer name'}</label>
              <input type="text" value={editName} onChange={e => setEditName(e.target.value)} maxLength={30}
                className="w-full px-4 py-2.5 bg-white/5 border border-[var(--border)] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder={language === 'fr' ? 'Ton pseudo...' : 'Your username...'} />
            </div>

            {/* Bio */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">{language === 'fr' ? 'Bio' : 'Bio'}</label>
              <textarea value={editBio} onChange={e => setEditBio(e.target.value)} maxLength={120} rows={2}
                className="w-full px-4 py-2.5 bg-white/5 border border-[var(--border)] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
                placeholder={language === 'fr' ? 'Passionné de trail et kite...' : 'Trail and kite enthusiast...'} />
              <p className="text-xs text-gray-500 text-right mt-1">{editBio.length}/120</p>
            </div>

            {/* Save */}
            <button type="button" onClick={() => {
              setUserName(editName);
              setUserBio(editBio);
              setUserAvatar(editAvatar);
              setEditingProfile(false);
              showToast(language === 'fr' ? 'Profil mis à jour !' : 'Profile updated!', 'success', '✅');
            }} className="w-full py-3 bg-[var(--accent)] text-white rounded-xl font-bold text-sm hover:opacity-90 transition">
              {language === 'fr' ? 'Enregistrer' : 'Save'}
            </button>
          </div>
        </div>
      )}

      <div className="pt-16 px-4">
        {/* P9: Profile completion bar — masqué dès 80 %, la checklist n'a pas à rester en header permanent */}
        {profileCompletion < 80 && (
          <div className="mb-4 bg-[var(--card)] rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-semibold text-gray-400">{language === 'fr' ? 'Profil complété' : 'Profile completed'}</p>
              <p className="text-xs font-bold text-[var(--accent)]">{profileCompletion}%</p>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[var(--accent)] rounded-full transition-all duration-500" style={{ width: `${profileCompletion}%` }} />
            </div>
          </div>
        )}

        {/* Sports Tags */}
        <div className="text-center mb-4">
          <div className="flex flex-wrap justify-center gap-1.5">
            {displaySports.slice(0, 5).map(s => (
              <span key={s} className="px-2 py-1 bg-white/5 rounded-full text-sm flex items-center gap-1">
                {getSportEmoji(s)} {s}
              </span>
            ))}
            {displaySports.length > 5 && (
              <span className="px-2 py-1 bg-white/5 rounded-full text-sm text-gray-400">
                +{displaySports.length - 5}
              </span>
            )}
          </div>
        </div>

        {/* Weather Section - based on user geolocation */}
        <div className="mb-4 bg-[var(--card)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-white">{t('weather.title', language)}</h3>
            <button
              type="button"
              onClick={requestGeo}
              className="text-xs text-[var(--accent)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded px-2 py-1"
              aria-label={language === 'fr' ? 'Actualiser ma position' : 'Refresh my location'}
            >
              📍 {userLat && userLng ? (language === 'fr' ? 'Actualiser' : 'Refresh') : (language === 'fr' ? 'Activer' : 'Enable')}
            </button>
          </div>
          {userLat && userLng ? (() => {
            const w = estimateWeather(userLat, userLng);
            return (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <p className="text-3xl mb-1">{w.icon}</p>
                    <p className="text-2xl font-bold text-[var(--accent)]">{w.temp}°C</p>
                    <p className="text-xs text-gray-400 mt-1">{t('weather.feelsLike', language)}: {w.feels}°C</p>
                  </div>
                  <div className="space-y-2 flex flex-col justify-center">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">💨 {t('weather.wind', language)}</span>
                      <span className="text-white font-medium">{w.wind} km/h</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">💧 {t('weather.humidity', language)}</span>
                      <span className="text-white font-medium">{w.humidity}%</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">📍 {w.region} · {userLat.toFixed(2)}, {userLng.toFixed(2)}</p>
              </>
            );
          })() : (
            <div className="text-center py-3 space-y-2">
              <p className="text-gray-400 text-sm">{language === 'fr' ? 'Active la géolocalisation pour voir la météo locale' : 'Enable geolocation to see local weather'}</p>
              {geoPermission === 'denied' && (
                <p className="text-amber-400 text-xs">{language === 'fr' ? '⚠️ Permission refusée. Autorise dans les réglages du navigateur.' : '⚠️ Permission denied. Allow in browser settings.'}</p>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex bg-white/5 rounded-xl p-1 mb-4" role="tablist" aria-label="Onglets du profil">
          {(['overview', 'activity', 'teams', 'settings'] as const).map(tabName => (
            <button
              key={tabName}
              type="button"
              role="tab"
              aria-selected={tab === tabName}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${tab === tabName ? 'bg-[var(--accent)] text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setTab(tabName)}
            >
              {t(`profile.${tabName}`, language)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="space-y-5">
            {/* Stats Grid — real data from activityLog */}
            {activityLog.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {[
                  { emoji: '🏃', value: (dbStats?.total_sessions as number) ?? activityLog.length, label: t('common.sorties', language) },
                  { emoji: '⏱', value: ((dbStats?.total_hours as number) ?? PROFILE_STATS.hours) + 'h', label: t('common.hours', language) },
                  { emoji: '⛰️', value: (((dbStats?.total_dplus as number) ?? PROFILE_STATS.dplus)/1000).toFixed(0) + 'k', label: t('common.dplus', language) },
                  { emoji: '📏', value: (((dbStats?.total_km as number) ?? PROFILE_STATS.km)/1000).toFixed(1) + 'k', label: t('common.km', language) },
                ].map(s => (
                  <div key={s.label} className="bg-[var(--card)] rounded-xl p-3 text-center">
                    <p className="text-sm text-gray-500 mb-1">{s.emoji}</p>
                    <p className="text-lg font-bold text-[var(--accent)]">{s.value}</p>
                    <p className="text-sm text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty state for new users — push toward Coach IA */
              <div className="bg-gradient-to-br from-[#023E8A]/30 to-[#2D6A4F]/30 border border-white/10 rounded-2xl p-5 text-center space-y-3">
                <p className="text-3xl">🚀</p>
                <h3 className="font-bold text-white">
                  {language === 'fr' ? 'Prêt pour ta première aventure ?' : 'Ready for your first adventure?'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {language === 'fr'
                    ? 'Génère un plan d\'entraînement personnalisé avec le Coach IA, c\'est gratuit et ça prend 30 secondes.'
                    : 'Generate a personalized training plan with AI Coach, it\'s free and takes 30 seconds.'}
                </p>
                <button
                  type="button"
                  onClick={() => setSubPage('coach-ai')}
                  className="bg-[var(--accent)] text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:opacity-90 transition"
                >
                  {language === 'fr' ? '🤖 Mon premier plan IA →' : '🤖 My first AI plan →'}
                </button>
              </div>
            )}

            {/* Heatmap — only show if user has activity */}
            {activityLog.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 text-sm">{t('profile.activityThisMonth', language)}</h3>
              <div className="grid grid-cols-10 gap-1">
                {ACTIVITY_HEATMAP.map((v, i) => (
                  <div
                    key={i}
                    className="w-full aspect-square rounded-sm"
                    style={{
                      backgroundColor: v === 0 ? 'rgba(255,255,255,0.05)' : `rgba(124,58,237,${0.2 + v * 0.2})`
                    }}
                    aria-label={`Day ${i+1}: ${v} ${v === 1 ? 'activity' : 'activities'}`}
                  />
                ))}
              </div>
            </div>
            )}

            {/* Achievements */}
            <div>
              <h3 className="font-semibold mb-2 text-sm">{t('profile.badges', language)}</h3>
              <div className="space-y-2">
                {achievements.slice(0, 3).map(a => (
                  <div key={a.id} className="flex items-center gap-3 bg-[var(--card)] rounded-xl p-3">
                    <span className="text-2xl">{a.emoji}</span>
                    <div>
                      <p className="font-medium text-sm">{a.title}</p>
                      <p className="text-sm text-gray-500">{a.description} · {a.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Friend List */}
            <div>
              <h3 className="font-semibold mb-2 text-sm">{t('profile.friendList', language)}</h3>
              {friendIds.length === 0 ? (
                <div className="bg-[var(--card)] rounded-xl p-4 text-center">
                  <p className="text-gray-400 text-sm">{t('profile.noFriends', language)}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {friendIds.map(friendId => {
                    const friend = getMockUserProfile(friendId);
                    if (!friend) return null;
                    return (
                      <div key={friendId} className="flex items-center gap-3 bg-[var(--card)] rounded-xl p-3">
                        <div className="text-2xl">{friend.avatar || '👤'}</div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{friend.name}</p>
                          <p className="text-sm text-gray-500">{friend.sports.join(', ')}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mes Défis Section */}
            <div>
              <h3 className="font-semibold mb-2 text-sm">{t('profile.myChallenges', language)}</h3>
              {plannedChallenges.length === 0 ? (
                <div className="bg-[var(--card)] rounded-xl p-4 text-center">
                  <p className="text-gray-400 text-sm">{t('profile.noChallenges', language)}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {getUpcomingEvents()
                    .filter(event => plannedChallenges.includes(event.id))
                    .map(event => (
                      <div key={event.id} className="flex items-center gap-3 bg-[var(--card)] rounded-xl p-3">
                        <span className="text-2xl">{event.emoji}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-sm text-gray-500">{event.date}</p>
                          {event.tag && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-[var(--accent)]/20 text-[var(--accent)] rounded-full text-xs">{event.tag}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => togglePlannedChallenge(event.id)}
                          className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-900/20 transition"
                          aria-label={t('profile.removeChallenge', language)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {tab === 'activity' && (
          <div className="space-y-2">
            {/* Strava Connection */}
            <div className="bg-[var(--card)] rounded-xl p-4 space-y-3">
              {stravaConnected ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FC4C02">
                        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                      </svg>
                      <span className="text-sm font-semibold text-white">{stravaAthleteName}</span>
                      <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Connecte</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleStravaDisconnect}
                      className="text-xs text-gray-500 hover:text-red-400 transition"
                    >
                      Deconnecter
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={fetchStravaActivities}
                      disabled={stravaSyncing}
                      className="flex-1 py-2 bg-[#FC4C02]/20 text-[#FC4C02] rounded-xl font-semibold text-sm hover:bg-[#FC4C02]/30 transition disabled:opacity-50"
                    >
                      {stravaSyncing ? '🔄 Synchronisation...' : `🔄 ${language === 'fr' ? 'Synchroniser' : 'Sync'}`}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowGpxImport(true)}
                      className="px-4 py-2 bg-[var(--accent)]/20 text-[var(--accent)] rounded-xl font-semibold text-sm hover:bg-[var(--accent)]/30 transition"
                    >
                      📥 GPX
                    </button>
                  </div>
                  {stravaLastSync && (
                    <p className="text-xs text-gray-500">
                      {language === 'fr' ? 'Derniere sync' : 'Last sync'}: {new Date(stravaLastSync).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-sm text-white">{language === 'fr' ? 'Importer tes activites' : 'Import your activities'}</h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleStravaConnect}
                      disabled={stravaLoading}
                      className="flex-1 py-2.5 bg-[#FC4C02] text-white rounded-xl font-semibold text-sm hover:bg-[#e04400] transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="white">
                        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                      </svg>
                      {stravaLoading ? 'Connexion...' : 'Connecter Strava'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowGpxImport(true)}
                      className="px-4 py-2.5 bg-[var(--accent)]/20 text-[var(--accent)] rounded-xl font-semibold text-sm hover:bg-[var(--accent)]/30 transition"
                    >
                      📥 GPX
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">{language === 'fr' ? 'Connecte Strava pour importer automatiquement tes sorties' : 'Connect Strava to auto-import your activities'}</p>
                </>
              )}
              {showGpxImport && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <input
                    type="file"
                    accept=".gpx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleGpxFile(file);
                    }}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--accent)] file:text-white hover:file:opacity-90"
                  />
                  <p className="text-xs text-gray-500">{language === 'fr' ? 'Selectionne un fichier .gpx pour extraire le parcours' : 'Select a .gpx file to extract the route'}</p>
                  <button type="button" onClick={() => setShowGpxImport(false)} className="text-xs text-gray-500 hover:text-white">
                    {language === 'fr' ? 'Annuler' : 'Cancel'}
                  </button>
                </div>
              )}
            </div>

            {/* Strava Activities */}
            {stravaConnected && stravaActivities.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-white px-1 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#FC4C02">
                    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                  </svg>
                  {language === 'fr' ? `Activites Strava (${stravaActivities.length})` : `Strava Activities (${stravaActivities.length})`}
                </h3>
                {stravaActivities.slice(0, 10).map(a => (
                  <div key={a.id} className="bg-[var(--card)] rounded-xl p-3 flex items-center gap-3">
                    <span className="text-xl">{getSportEmoji(a.sport)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{a.name}</p>
                      <p className="text-xs text-gray-500">
                        {a.sport} · {new Date(a.start_date_local).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <div className="text-right text-xs space-y-0.5 shrink-0">
                      {a.distance > 0 && <p className="text-gray-300">{a.distance} km</p>}
                      {a.elevation_gain > 0 && <p className="text-green-400">+{a.elevation_gain}m</p>}
                      {a.moving_time > 0 && <p className="text-gray-500">{formatDuration(a.moving_time)}</p>}
                    </div>
                  </div>
                ))}
                {stravaActivities.length > 10 && (
                  <p className="text-xs text-gray-500 text-center py-1">
                    +{stravaActivities.length - 10} {language === 'fr' ? 'autres activites' : 'more activities'}
                  </p>
                )}
              </div>
            )}

            {activityLog.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">🏔</p>
                <p className="text-gray-400 text-sm">{t('profile.noActivity', language)}</p>
                <p className="text-gray-500 text-sm mt-1">{t('profile.startFirst', language)}</p>
              </div>
            ) : (
              activityLog.map(a => (
                <div key={a.id} className="bg-[var(--card)] rounded-xl p-3 flex items-center gap-3">
                  <span className="text-xl">{getSportEmoji(a.sport)}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{a.title}</p>
                    <p className="text-sm text-gray-500">{a.sport} · {new Date(a.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                  {a.distance && <span className="text-sm text-gray-400">{a.distance}</span>}
                </div>
              ))
            )}
          </div>
        )}

        {/* Teams Tab */}
        {tab === 'teams' && (
          <div className="space-y-3">
            {TEAMS.slice(0, 3).map(teamItem => (
              <button
                key={teamItem.id}
                type="button"
                className="w-full bg-[var(--card)] rounded-xl p-4 text-left hover:bg-white/5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                onClick={() => setSubPage({ type: 'team-detail', teamId: teamItem.id })}
                aria-label={`Group ${teamItem.name}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{teamItem.emoji}</span>
                  <div>
                    <p className="font-bold text-sm">{teamItem.name}</p>
                    <p className="text-sm text-gray-400">{getSportEmoji(teamItem.sport)} {teamItem.sport} · 👥 {teamItem.memberCount}</p>
                  </div>
                </div>
              </button>
            ))}
            <button
              type="button"
              className="w-full py-3 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              onClick={() => setSubPage('teams')}
              aria-label="See all groups"
            >
              {t('profile.seeAllGroups', language)}
            </button>
          </div>
        )}

        {/* Settings Tab */}
        {tab === 'settings' && (
          <div className="space-y-2">
            {/* Font Size */}
            <div className="bg-[var(--card)] rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{t('profile.textSize', language)}</p>
                <p className="text-sm text-gray-500">{t('profile.textSizeDesc', language)}</p>
              </div>
              <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
                <button
                  type="button"
                  className={`px-3 py-1 rounded text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${fontSize === 'normal' ? 'bg-[var(--accent)] text-white' : 'text-gray-400 hover:bg-white/10'}`}
                  onClick={() => setFontSize('normal')}
                  aria-label="Normal size"
                >
                  A
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${fontSize === 'large' ? 'bg-[var(--accent)] text-white' : 'text-gray-400 hover:bg-white/10'}`}
                  onClick={() => setFontSize('large')}
                  aria-label="Large size"
                >
                  A+
                </button>
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="bg-[var(--card)] rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{t('profile.theme', language)}</p>
                <p className="text-sm text-gray-500">{t('profile.themeDesc', language)}</p>
              </div>
              <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
                <button
                  type="button"
                  className={`px-3 py-1 rounded text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${theme === 'dark' ? 'bg-[var(--accent)] text-white' : 'text-gray-400 hover:bg-white/10'}`}
                  onClick={() => theme !== 'dark' && toggleTheme()}
                  aria-label="Dark mode"
                >
                  🌙
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${theme === 'light' ? 'bg-[var(--accent)] text-white' : 'text-gray-400 hover:bg-white/10'}`}
                  onClick={() => theme !== 'light' && toggleTheme()}
                  aria-label="Light mode"
                >
                  ☀️
                </button>
              </div>
            </div>

            {/* Language Setting */}
            <div className="bg-[var(--card)] rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{t('profile.language', language)}</p>
                <p className="text-sm text-gray-500">{t('profile.languageDesc', language)}</p>
              </div>
              <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
                <button
                  type="button"
                  className={`min-w-[44px] min-h-[44px] px-3 rounded text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white flex items-center justify-center ${language === 'fr' ? 'bg-[var(--accent)] text-white' : 'text-gray-400 hover:bg-white/10'}`}
                  onClick={() => language !== 'fr' && setLanguage('fr')}
                  aria-label="Français"
                >
                  FR
                </button>
                <button
                  type="button"
                  className={`min-w-[44px] min-h-[44px] px-3 rounded text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white flex items-center justify-center ${language === 'en' ? 'bg-[var(--accent)] text-white' : 'text-gray-400 hover:bg-white/10'}`}
                  onClick={() => language !== 'en' && setLanguage('en')}
                  aria-label="English"
                >
                  EN
                </button>
              </div>
            </div>

            {/* Push Notifications Toggle */}
            <div className="bg-[var(--card)] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{language === 'fr' ? 'Notifications push' : 'Push notifications'}</p>
                  <p className="text-sm text-gray-500">
                    {notifPermission === 'unsupported'
                      ? (language === 'fr' ? 'Non supporte par ce navigateur' : 'Not supported by this browser')
                      : notifPermission === 'denied'
                        ? (language === 'fr' ? 'Notifications bloquees (modifie dans les parametres du navigateur)' : 'Notifications blocked (change in browser settings)')
                        : pushNotificationsEnabled
                          ? (language === 'fr' ? 'Notifications activees' : 'Notifications enabled')
                          : (language === 'fr' ? 'Recevoir des alertes meteo et rappels' : 'Receive weather alerts and reminders')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTogglePushNotifications}
                  disabled={notifPermission === 'unsupported' || notifPermission === 'denied'}
                  className={`relative w-12 h-7 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                    pushNotificationsEnabled ? 'bg-[var(--accent)]' : 'bg-white/20'
                  } ${(notifPermission === 'unsupported' || notifPermission === 'denied') ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label={language === 'fr' ? 'Activer les notifications push' : 'Toggle push notifications'}
                >
                  <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${pushNotificationsEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
              {/* Lien vers réglages avancés (G5 — canaux, seuils, plage calme) */}
              <a
                href="/settings/notifications"
                className="mt-3 flex items-center justify-between text-xs text-[var(--accent)] hover:underline"
              >
                <span>⚙️ {language === 'fr' ? 'Réglages avancés (canaux, seuils, ne pas déranger)' : 'Advanced settings (channels, thresholds, do not disturb)'}</span>
                <span>→</span>
              </a>
            </div>

            {/* Tracker GPS — B-prop5 */}
            <a
              href="/tracker"
              className="block w-full bg-[var(--card)] rounded-xl p-4 hover:bg-white/5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📡</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{language === 'fr' ? 'Tracker GPS' : 'GPS Tracker'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {language === 'fr' ? 'Enregistre ta trace, exporte en GPX, ajoute à ton carnet.' : 'Record your track, export GPX, save to your logbook.'}
                  </p>
                </div>
                <span className="text-gray-500">→</span>
              </div>
            </a>

            {/* Offline Mode Placeholder */}
            <div className="bg-[var(--card)] rounded-xl p-4 space-y-3">
              <div>
                <p className="font-medium text-sm">{language === 'fr' ? 'Mode hors-ligne' : 'Offline mode'}</p>
                <p className="text-xs text-gray-500 mt-1">{language === 'fr' ? 'Les cartes telechargees sont disponibles sans reseau' : 'Downloaded maps are available without network'}</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{language === 'fr' ? 'Cache : 0 Mo utilises' : 'Cache: 0 MB used'}</span>
                <span className="text-xs px-2 py-0.5 bg-white/10 text-gray-400 rounded-full">{language === 'fr' ? 'Aucune carte' : 'No maps'}</span>
              </div>
              <button
                type="button"
                onClick={() => showToast(language === 'fr' ? 'Telechargement des cartes bientot disponible' : 'Map download coming soon', 'info', '🗺️')}
                className="w-full py-2.5 bg-white/10 text-white rounded-xl font-semibold text-sm hover:bg-white/15 transition"
              >
                📥 {language === 'fr' ? 'Telecharger les cartes' : 'Download maps'}
              </button>
            </div>

            {/* Inviter un ami — referral */}
            <div className="w-full bg-gradient-to-r from-[#023E8A]/20 to-[#2D6A4F]/20 border border-[#023E8A]/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎁</span>
                <div className="flex-1">
                  <p className="font-bold text-sm text-white">
                    {language === 'fr' ? 'Inviter un ami' : 'Invite a friend'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {language === 'fr' ? `Ton code : ${referralCode}` : `Your code: ${referralCode}`}
                  </p>
                </div>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-[var(--accent)] text-white text-xs font-bold rounded-lg hover:opacity-90 transition"
                  onClick={() => {
                    const shareText = language === 'fr'
                      ? `Rejoins-moi sur Adventurer, l'app outdoor ! Utilise mon code ${referralCode} pour t'inscrire. https://adventurer-outdoor.vercel.app/?r=${referralCode}`
                      : `Join me on Adventurer, the outdoor app! Use my code ${referralCode} to sign up. https://adventurer-outdoor.vercel.app/?r=${referralCode}`;
                    if (typeof navigator !== 'undefined' && navigator.share) {
                      navigator.share({ title: 'Adventurer', text: shareText, url: `https://adventurer-outdoor.vercel.app/?r=${referralCode}` }).catch(() => {});
                    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(shareText).then(() => showToast(language === 'fr' ? 'Lien copié !' : 'Link copied!', 'success', '📋'));
                    }
                  }}
                >
                  {language === 'fr' ? 'Partager' : 'Share'}
                </button>
              </div>
            </div>

            {/* Ambassador CTA — monetisation referral */}
            <a
              href="/ambassadors"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-gradient-to-r from-[#F77F00]/20 to-[#DDA15E]/20 border border-[#F77F00]/30 rounded-xl p-4 hover:opacity-90 transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏔️</span>
                <div className="flex-1">
                  <p className="font-bold text-sm text-white">
                    {language === 'fr' ? 'Deviens ambassadeur' : 'Become an ambassador'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {language === 'fr' ? 'Gagne 5€ par inscription + 10% de commission' : 'Earn €5 per signup + 10% commission'}
                  </p>
                </div>
                <span className="text-[#F77F00] font-bold text-sm">→</span>
              </div>
            </a>

            {/* Sell gear CTA — monetisation marketplace */}
            <button
              type="button"
              onClick={() => setSubPage('marketplace')}
              className="w-full bg-[var(--card)] rounded-xl p-4 text-left hover:bg-white/5 transition flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🛒</span>
                <div>
                  <p className="font-medium text-sm">{language === 'fr' ? 'Vendre mon matériel' : 'Sell my gear'}</p>
                  <p className="text-xs text-gray-500">{language === 'fr' ? 'Touche des passionnés directement' : 'Reach outdoor enthusiasts directly'}</p>
                </div>
              </div>
              <span className="text-gray-500">→</span>
            </button>

            {/* Legal Links */}
            {[
              { label: 'profile.privacy', emoji: '🔒', action: () => setSubPage('privacy') },
              { label: 'profile.terms', emoji: '📜', action: () => setSubPage('cgu') },
              { label: 'profile.cookies', emoji: '🍪', action: () => showToast('Cookie settings reset', 'info', '🍪') },
            ].map(item => (
              <button
                key={item.label}
                type="button"
                className="w-full bg-[var(--card)] rounded-xl p-4 text-left hover:bg-white/5 transition flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                onClick={item.action}
                aria-label={t(item.label, language)}
              >
                <span className="text-sm">{item.emoji} {t(item.label, language)}</span>
                <span className="text-gray-500">→</span>
              </button>
            ))}

            {/* Sports Selection */}
            <button
              type="button"
              className="w-full bg-[var(--card)] rounded-xl p-4 text-left hover:bg-white/5 transition flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              onClick={() => reopenSportSelector()}
              aria-label={t('profile.editSports', language)}
            >
              <span className="text-sm">⛰️ {t('profile.editSports', language)}</span>
              <span className="text-gray-500">→</span>
            </button>

            {/* Danger Zone */}
            <div className="pt-4 space-y-2">
              <button
                type="button"
                className="w-full py-3 bg-red-900/20 text-red-400 rounded-xl font-medium hover:bg-red-900/30 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                onClick={() => showToast('To delete your account, contact adventurer.app.outdoor@gmail.com', 'warning', '⚠️')}
                aria-label={t('profile.deleteAccount', language)}
              >
                {t('profile.deleteAccount', language)}
              </button>
              <button
                type="button"
                className="w-full py-3 bg-white/5 text-gray-400 rounded-xl font-medium hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                onClick={async () => { await signOut(); logout(); }}
                aria-label={t('profile.logout', language)}
              >
                {t('profile.logout', language)}
              </button>
            </div>

            {/* Made with love */}
            <div className="text-center pt-6 pb-2 space-y-2">
              <p className="text-sm text-gray-400">
                {language === 'fr'
                  ? '🏔️ Adventurer est fait avec amour par des passionnés de sports outdoor.'
                  : '🏔️ Adventurer is made with love by outdoor sports enthusiasts.'}
              </p>
              <p className="text-sm text-gray-500">
                {language === 'fr'
                  ? 'Aidez-nous à améliorer Adventurer !'
                  : 'Help us improve Adventurer!'}
              </p>
              <a
                href="mailto:adventurer.app.outdoor@gmail.com?subject=Feedback%20Adventurer"
                className="inline-block text-xs text-[var(--accent)] hover:underline transition"
              >
                adventurer.app.outdoor@gmail.com
              </a>
            </div>

            <p className="text-center text-sm text-gray-600 pt-2">{language === 'fr' ? 'Adventurer V5.0 · Tes données sont protégées (RGPD)' : 'Adventurer V5.0 · Your data is protected (GDPR)'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
