'use client';
import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { t, type Language } from '@/lib/i18n';
import { GPX_ROUTES } from '@/lib/mock-data';
import { estimateWeather, isNauticalSport, buildGPX, downloadGPX } from '@/lib/weather';
import { QuickMatchModal, SafetyCheckInModal, RouteReportModal } from '@/components/modals/V2Modals';

interface TrailDetailPageProps {
  trailId?: string | number;
}

const DEFAULT_PARTICIPANTS = [
  { id: 'user-1', name: 'Sophie', avatar: '👩‍🎓' },
  { id: 'user-2', name: 'Thomas', avatar: '👨‍💼' },
  { id: 'user-3', name: 'Claire', avatar: '👩‍🔬' },
  { id: 'user-4', name: 'Marc', avatar: '👨‍⚕️' },
];

function ratingLabel(rating: string, lang: Language): string {
  if (rating === 'idéal') return t('rating.ideal', lang);
  if (rating === 'correct') return t('rating.correct', lang);
  if (rating === 'difficile') return t('rating.difficult', lang);
  return t('rating.no', lang);
}

function ElevationProfile({ data, ariaLabel }: { data: number[]; ariaLabel: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <svg viewBox="0 0 100 30" className="w-full h-24" aria-label={ariaLabel}>
      <defs>
        <linearGradient id="elevGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <polyline
        points={data.map((v, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 30 - ((v - min) / range) * 25;
          return `${x},${y}`;
        }).join(' ')}
        fill="none"
        stroke="rgb(59, 130, 246)"
        strokeWidth="0.8"
      />
      <polygon
        points={`0,30 ${data.map((v, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 30 - ((v - min) / range) * 25;
          return `${x},${y}`;
        }).join(' ')} 100,30`}
        fill="url(#elevGradient)"
      />
    </svg>
  );
}

export default function TrailDetailPage({ trailId }: TrailDetailPageProps) {
  const { closeSubPage, openUserProfile, showToast, language, routeReports } = useStore();
  const [joined, setJoined] = useState(false);
  const [showQuickMatch, setShowQuickMatch] = useState(false);
  const [showSafety, setShowSafety] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const trail = useMemo(() => {
    if (trailId) {
      const r = GPX_ROUTES.find(gr => gr.id === trailId);
      if (r) return r;
    }
    return GPX_ROUTES[0];
  }, [trailId]);

  const nautical = isNauticalSport(trail.sport);
  const avgLat = trail.coordinates.reduce((s, c) => s + c[0], 0) / trail.coordinates.length;
  const avgLng = trail.coordinates.reduce((s, c) => s + c[1], 0) / trail.coordinates.length;
  const weather = estimateWeather(avgLat, avgLng);

  const myReports = routeReports.filter(r => r.routeId === trail.id).slice(0, 5);

  const difficultyBadge = trail.difficulty === 'Expert'
    ? 'bg-red-600/50 text-white'
    : trail.difficulty === 'Difficile' || trail.difficulty === 'Confirmé'
    ? 'bg-orange-600/50 text-white'
    : 'bg-green-600/50 text-white';

  const handleGPX = () => {
    const points = trail.coordinates.map(([lat, lng], i) => ({ lat, lng, name: `Pt ${i + 1}` }));
    const xml = buildGPX({
      name: trail.name,
      description: `${trail.sport} · ${trail.distance} · ${trail.dplus} · ${trail.duration}`,
      points,
    });
    downloadGPX(trail.name.replace(/\s+/g, '-').toLowerCase(), xml);
    showToast(t('gpx.exported', language), 'success', '📥');
  };

  // Synthetic elevation for display (based on dplus + distance)
  const elevSteps = 18;
  const peakElev = parseInt(trail.dplus.replace(/[^0-9]/g, '')) || 500;
  const elevData = Array.from({ length: elevSteps }, (_, i) => {
    const x = i / (elevSteps - 1);
    return Math.round(Math.sin(x * Math.PI) * peakElev + 500);
  });

  return (
    <div className="min-h-screen bg-[var(--bg)] max-w-[430px] mx-auto pb-8">
      <div className="relative h-48 flex flex-col items-end justify-between p-4 text-white"
        style={{ background: `linear-gradient(135deg, ${trail.color}, #1B4332)` }}>
        <button type="button" onClick={closeSubPage}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition"
          aria-label={t('common.back', language)}>←</button>
        <div className="self-start">
          <h1 className="font-bold text-[26px] leading-tight">{trail.name}</h1>
          <p className="text-white/90 mt-1 text-sm">📍 {trail.region} · {trail.sport}</p>
        </div>
        <span className={`px-3 py-1 rounded-full font-bold backdrop-blur-sm ${difficultyBadge} text-[13px]`}>
          {trail.difficulty}
        </span>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-3 gap-2 px-4 py-4 bg-[var(--card)] mx-4 -mt-6 relative z-10 rounded-2xl mb-4">
        <div className="text-center">
          <p className="font-bold text-[var(--accent)] text-lg">{trail.distance}</p>
          <p className="text-gray-400 text-xs">{t('trail.distance', language)}</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-[var(--accent)] text-lg">{trail.dplus}</p>
          <p className="text-gray-400 text-xs">D+</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-[var(--accent)] text-lg">{trail.duration}</p>
          <p className="text-gray-400 text-xs">{t('trail.duration', language)}</p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* V2 Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setShowQuickMatch(true)}
            className="py-3 rounded-xl bg-[var(--accent)] text-white font-bold text-sm flex items-center justify-center gap-1.5">
            🤝 {t('trail.quickMatchBtn', language)}
          </button>
          <button type="button" onClick={() => setShowSafety(true)}
            className="py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-1.5">
            🛡️ {t('trail.safetyBtn', language)}
          </button>
          <button type="button" onClick={handleGPX}
            className="py-3 rounded-xl bg-white/5 text-white font-semibold text-sm flex items-center justify-center gap-1.5">
            📥 GPX
          </button>
          <button type="button" onClick={() => setShowReport(true)}
            className="py-3 rounded-xl bg-white/5 text-white font-semibold text-sm flex items-center justify-center gap-1.5">
            📝 {t('trail.reportBtn', language)}
          </button>
        </div>

        {/* Weather widget — nautical sports show wind prominently */}
        <div className="bg-[var(--card)] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm">🌤️ {weather.region || t('trail.meteoLabel', language)}</h3>
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">{t('weather.now', language)}</span>
          </div>
          {nautical ? (
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-[var(--accent)]">{weather.wind}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{t('weather.windSpeed', language)} · {weather.windDir}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-400">{weather.temp}°</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{t('weather.temp', language)}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <p className="text-2xl">{weather.icon}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{weather.humidity}% {t('trail.humidityShort', language)}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">{weather.icon} {weather.windDir} · {weather.wind} {t('weather.windSpeed', language)}</p>
                <p className="text-gray-400 text-[13px]">{t('weather.humidity', language)} : {weather.humidity}%</p>
              </div>
              <p className="text-3xl font-bold text-blue-400">{weather.temp}°</p>
            </div>
          )}
        </div>

        {/* Elevation profile */}
        <div className="bg-[var(--card)] rounded-2xl p-4 space-y-2">
          <h3 className="font-bold text-sm">📈 {t('trail.elevProfile', language)}</h3>
          <ElevationProfile data={elevData} ariaLabel={t('trail.elevProfile', language)} />
        </div>

        {/* Route reports from store + default seed */}
        <div className="bg-[var(--card)] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">📋 {t('trail.reports', language)}</h3>
            <button type="button" onClick={() => setShowReport(true)}
              className="text-[11px] text-[var(--accent)] font-medium">+ {t('trail.addReport', language)}</button>
          </div>
          {myReports.length === 0 && (
            <p className="text-xs text-gray-500 italic">
              {t('trail.noReports', language)}
            </p>
          )}
          {myReports.map(r => (
            <div key={r.id} className="border-t border-white/5 pt-3 first:border-0 first:pt-0">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-sm">{r.authorName}</p>
                <span className={`px-2 py-0.5 rounded font-medium text-[11px] ${
                  r.rating === 'idéal' ? 'bg-green-900/30 text-green-300'
                  : r.rating === 'correct' ? 'bg-blue-900/30 text-blue-300'
                  : r.rating === 'difficile' ? 'bg-orange-900/30 text-orange-300'
                  : 'bg-red-900/30 text-red-300'
                }`}>{ratingLabel(r.rating, language)}</span>
              </div>
              <p className="text-gray-400 mb-1 text-xs">{new Date(r.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}</p>
              <p className="text-gray-300 text-[13px]">{r.conditions}</p>
              {r.text && <p className="text-gray-400 text-xs mt-1 italic">&quot;{r.text}&quot;</p>}
            </div>
          ))}
        </div>

        {/* Participants */}
        <div className="bg-[var(--card)] rounded-2xl p-4 space-y-3">
          <h3 className="font-bold text-sm">👥 {t('trail.whoPlans', language)}</h3>
          <div className="flex gap-2">
            {DEFAULT_PARTICIPANTS.map(p => (
              <button key={p.id} type="button" onClick={() => openUserProfile(p.id)}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-lg hover:opacity-80 transition">
                {p.avatar}
              </button>
            ))}
          </div>
        </div>

        {/* Spot Check-in */}
        <div className="bg-[var(--card)] rounded-2xl p-4 space-y-3">
          <h3 className="font-bold text-sm">📍 {language === 'fr' ? 'Check-in conditions' : 'Conditions Check-in'}</h3>
          {(() => {
            const { spotCheckIns, addSpotCheckIn } = useStore.getState();
            const recentCheckIns = spotCheckIns.filter(c => c.spotId === trail.id).slice(0, 3);
            const fr = language === 'fr';
            const quickConditions = [
              { emoji: '☀️', label: fr ? 'Parfait' : 'Perfect' },
              { emoji: '⛅', label: fr ? 'Correct' : 'OK' },
              { emoji: '🌧️', label: fr ? 'Humide' : 'Wet' },
              { emoji: '💨', label: fr ? 'Venteux' : 'Windy' },
              { emoji: '❄️', label: fr ? 'Enneigé' : 'Snowy' },
            ];
            return (
              <>
                <div className="flex gap-2 flex-wrap">
                  {quickConditions.map(c => (
                    <button key={c.label} type="button"
                      onClick={() => {
                        addSpotCheckIn({ spotId: trail.id, spotName: trail.name, conditions: c.label, emoji: c.emoji });
                        showToast(fr ? 'Check-in envoyé !' : 'Check-in sent!', 'success', c.emoji);
                      }}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-xs font-medium text-white transition">
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
                {recentCheckIns.length > 0 && (
                  <div className="space-y-1.5 mt-2">
                    {recentCheckIns.map(ci => (
                      <div key={ci.id} className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{ci.emoji}</span>
                        <span className="font-medium text-white">{ci.userName}</span>
                        <span>{ci.conditions}</span>
                        <span className="ml-auto">{new Date(ci.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </div>

        <div className="flex gap-2">
          <button type="button"
            onClick={() => {
              setJoined(!joined);
              showToast(joined ? t('trail.leftPlan', language) : t('trail.joinedPlan', language), joined ? 'info' : 'success', joined ? '❌' : '✅');
            }}
            className={`flex-1 py-3 rounded-xl font-bold text-sm ${joined ? 'bg-white/10 text-white' : 'bg-[var(--accent)] text-white'}`}>
            {joined ? `✓ ${t('trail.youGo', language)}` : t('trail.iGo', language)}
          </button>
          <button type="button"
            onClick={() => showToast(`${t('trail.shareCopied', language)} 📋`, 'success', '✅')}
            className="flex-1 py-3 bg-white/5 text-white rounded-xl font-medium text-sm">
            {t('common.share', language)}
          </button>
        </div>
      </div>

      {/* V2 Modals */}
      {showQuickMatch && (
        <QuickMatchModal spotTitle={trail.name} spotId={trail.id} sport={trail.sport} onClose={() => setShowQuickMatch(false)} />
      )}
      {showSafety && (
        <SafetyCheckInModal routeTitle={trail.name} sport={trail.sport} onClose={() => setShowSafety(false)} />
      )}
      {showReport && (
        <RouteReportModal routeId={trail.id} routeTitle={trail.name} onClose={() => setShowReport(false)} />
      )}
    </div>
  );
}
