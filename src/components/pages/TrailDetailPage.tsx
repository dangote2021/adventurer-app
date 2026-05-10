'use client';
import { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { t, type Language } from '@/lib/i18n';
import { GPX_ROUTES } from '@/lib/mock-data';
import { estimateWeather, isNauticalSport, buildGPX, downloadGPX, fetchMarine, readMarine, type MarineForecast } from '@/lib/weather';
import { QuickMatchModal, RouteReportModal } from '@/components/modals/V2Modals';

interface TrailDetailPageProps {
  trailId?: string | number;
}

// DEFAULT_PARTICIPANTS supprimé — panel V3 / Marc UTMB.
// Avant : 4 avatars (Sophie 👩‍🎓, Thomas 👨‍💼, Claire 👩‍🔬, Marc 👨‍⚕️) affichés
// sur TOUS les trails comme "qui prévoit", quel que soit le sport ou la région.
// Maintenant : on lit les vrais quickMatches du store (ceux que les vrais users
// publient via le bouton "Quick Match" sur la fiche). Empty state honnête si
// personne n'a publié.

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
  const { closeSubPage, openUserProfile, showToast, language, routeReports, quickMatches } = useStore();
  const [joined, setJoined] = useState(false);
  const [showQuickMatch, setShowQuickMatch] = useState(false);
  // showSafety retiré : pas de canal SMS/email réel — voir RAPPORT-AUTONOME
  // décision 3. À remettre quand l'edge function Supabase sera en place.
  const [showReport, setShowReport] = useState(false);

  const trail = useMemo(() => {
    if (trailId) {
      // Match permissif (string vs number)
      const r = GPX_ROUTES.find(gr => String(gr.id) === String(trailId));
      if (r) return r;
    }
    return null;
  }, [trailId]);

  // Empty state si l'id ne correspond à aucun trail/spot (ex: clic sur spot
  // Supabase qui n'a pas de fiche dédiée encore — on évitait avant de tomber
  // silencieusement sur GPX_ROUTES[0], ce qui faisait croire à un mauvais spot).
  if (!trail) {
    return (
      <div className="min-h-screen bg-[var(--bg)] max-w-[430px] mx-auto pb-8 flex flex-col">
        <div className="p-4">
          <button type="button" onClick={closeSubPage}
            className="w-9 h-9 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center hover:bg-black/20 dark:hover:bg-white/20 transition"
            aria-label={t('common.back', language)}>←</button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-3">
          <div className="text-5xl">🗺️</div>
          <h2 className="text-lg font-bold text-[var(--text)]">
            {language === 'en' ? 'Spot not available yet' : 'Spot pas encore détaillé'}
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-xs">
            {language === 'en'
              ? "We don't have a full sheet for this spot yet. Head back to the map to find another."
              : "On n'a pas encore de fiche complète pour ce spot. Retour à la carte pour en trouver un autre."}
          </p>
          <button type="button" onClick={closeSubPage}
            className="mt-2 px-5 py-2.5 rounded-full bg-[var(--brand)] text-white text-sm font-semibold hover:opacity-90 transition">
            {language === 'en' ? 'Back to map' : 'Retour à la carte'}
          </button>
        </div>
      </div>
    );
  }

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

  // Profil d'altitude — INDICATIF (panel V3 / Marc UTMB).
  // Avant : Math.sin(x * Math.PI) qui dessinait un arc parfait identique sur
  // tous les trails — trompeur (un trail ondulé 1500m D+ et un trail à 1
  // sommet 1500m D+ ont des profils radicalement différents).
  // Maintenant : profil pseudo-aléatoire dérivé du hash du nom + distance,
  // pour qu'il soit *différent par trail* mais reste affiché comme INDICATIF.
  // À remplacer par les vraies altitudes GPX quand on aura des coords [lat,lng,ele].
  const elevSteps = 18;
  const peakElev = parseInt(trail.dplus.replace(/[^0-9]/g, '')) || 500;
  const baseElev = parseInt(trail.distance.replace(/[^0-9]/g, '')) > 50 ? 800 : 400;
  // Hash simple du nom pour seed reproductible
  const nameHash = trail.name.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
  const elevData = Array.from({ length: elevSteps }, (_, i) => {
    const x = i / (elevSteps - 1);
    // Combine 2 sinus à fréquences différentes + seed pour profils variés
    const wave1 = Math.sin(x * Math.PI * (1 + (Math.abs(nameHash) % 3)));
    const wave2 = Math.sin(x * Math.PI * 4 + (nameHash % 7)) * 0.3;
    return Math.round((wave1 + wave2) * peakElev * 0.5 + baseElev + peakElev * 0.5);
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
        {/* V2 Action buttons — bouton "Safety / Check-in" retiré tant qu'on n'a
            pas un vrai canal SMS/email côté backend (panel #82 décision 3). */}
        <div className="grid grid-cols-3 gap-2">
          <button type="button" onClick={() => setShowQuickMatch(true)}
            className="py-3 rounded-xl bg-[var(--accent)] text-white font-bold text-sm flex items-center justify-center gap-1.5">
            🤝 {t('trail.quickMatchBtn', language)}
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

        {/* S10 panel V6 (Yannick) — Conditions marines pour les sports nautiques.
            Affiche houle, période, température eau via Open-Meteo Marine API.
            Ces données existaient (fetchMarine + readMarine dans weather.ts)
            mais n'étaient pas branchées dans le widget météo.
            Pas de marées ici (S13 — API payante en attente budget). */}
        {nautical && <NauticalConditionsBlock lat={avgLat} lng={avgLng} sport={trail.sport} language={language} />}

        {/* Profil d'altitude — gating multi-règles (panel V4 / Léa + Aïcha).
            Léa : sur sport nautique (kite/surf/wing/voile/SUP/plongée…) un D+ et
            une courbe d'altitude n'ont aucun sens. Aïcha : sur sport engagé
            (Alpinisme, Ski-rando, Escalade glace, difficulté Expert) afficher
            un profil simulé même labellisé "(indicatif)" est dangereux car la
            personne peut planifier ses bivouacs / décisions en s'y fiant.
            Règle : on cache complètement le bloc dans ces 2 cas. */}
        {(() => {
          const isNautical = nautical;
          const dangerousSports = ['Alpinisme', 'Ski de rando', 'Escalade glace', 'Cascade de glace', 'Goulotte'];
          const isEngagedSport = dangerousSports.includes(trail.sport);
          const isExpert = trail.difficulty === 'Expert';
          if (isNautical || isEngagedSport || isExpert) {
            // Empty state honnête : on dit pourquoi on ne montre pas un faux profil
            return (
              <div className="bg-[var(--card)] rounded-2xl p-4 space-y-2">
                <h3 className="font-bold text-sm">📈 {t('trail.elevProfile', language)}</h3>
                <p className="text-xs text-gray-400">
                  {isNautical
                    ? (language === 'fr'
                        ? 'Sport nautique — pas de profil d\'altitude pertinent.'
                        : 'Nautical sport — no relevant elevation profile.')
                    : (language === 'fr'
                        ? 'Sortie engagée : pas d\'estimation simulée. Utilise IGN / camptocamp / skitour pour planifier précisément.'
                        : 'Committing route: no simulated estimate. Use IGN / camptocamp / skitour to plan accurately.')}
                </p>
              </div>
            );
          }
          return (
            <div className="bg-[var(--card)] rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">📈 {t('trail.elevProfile', language)}</h3>
                <span className="text-[10px] text-gray-500 italic">
                  {language === 'fr' ? '(indicatif)' : '(indicative)'}
                </span>
              </div>
              <ElevationProfile data={elevData} ariaLabel={t('trail.elevProfile', language)} />
              <p className="text-[10px] text-gray-500">
                {language === 'fr'
                  ? `Profil simulé d'après ${trail.dplus} de D+. Données précises bientôt via les traces GPX.`
                  : `Simulated profile from ${trail.dplus} elevation gain. Accurate data coming soon via GPX tracks.`}
              </p>
            </div>
          );
        })()}

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

        {/* Participants — vrais Quick Match utilisateurs sur ce trail */}
        {(() => {
          // Filtre par spotId (si dispo) sinon par titre du spot (compat ancien data)
          const trailMatches = quickMatches.filter(m =>
            (m.spotId !== undefined && m.spotId === trail.id) ||
            m.spotTitle === trail.name
          );
          // Aplatit auteur + participants en liste unique de noms
          const uniqueNames = Array.from(new Set(
            trailMatches.flatMap(m => [m.authorName, ...m.participants])
          ));
          return (
            <div className="bg-[var(--card)] rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-sm">👥 {t('trail.whoPlans', language)}</h3>
              {uniqueNames.length === 0 ? (
                <p className="text-xs text-gray-400">
                  {language === 'fr'
                    ? 'Personne n\'a encore publié de Quick Match sur ce spot. Sois le premier !'
                    : 'No one has posted a Quick Match here yet. Be the first!'}
                </p>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {uniqueNames.slice(0, 8).map((name, idx) => {
                    const initial = name.charAt(0).toUpperCase();
                    const userId = trailMatches.find(m => m.authorName === name)?.authorId || `qm-${idx}`;
                    return (
                      <button key={`${name}-${idx}`} type="button" onClick={() => openUserProfile(userId)}
                        title={name}
                        className="w-12 h-12 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/30 flex items-center justify-center text-sm font-bold text-[var(--accent)] hover:opacity-80 transition">
                        {initial}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

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
      {/* SafetyCheckInModal retiré (voir import + décision panel #82) */}
      {showReport && (
        <RouteReportModal routeId={trail.id} routeTitle={trail.name} onClose={() => setShowReport(false)} />
      )}
    </div>
  );
}

// =============================================================================
// S10 panel V6 (Yannick) — bloc conditions marines (houle, période, SST)
// Branché sur Open-Meteo Marine API. Pas de marées ici (S13 en attente budget).
// =============================================================================
function NauticalConditionsBlock({ lat, lng, sport, language }: { lat: number; lng: number; sport: string; language: Language }) {
  const [marine, setMarine] = useState<MarineForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const fr = language === "fr";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchMarine(lat, lng).then(m => {
      if (!cancelled) {
        setMarine(m);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [lat, lng]);

  if (loading) {
    return (
      <div className="bg-[var(--card)] rounded-2xl p-4">
        <h3 className="font-bold text-sm mb-2">🌊 {fr ? "Conditions mer" : "Sea conditions"}</h3>
        <p className="text-xs text-gray-500">{fr ? "Chargement…" : "Loading…"}</p>
      </div>
    );
  }

  if (!marine || (marine.wave_height_m === null && marine.sea_temp_c === null)) {
    return (
      <div className="bg-[var(--card)] rounded-2xl p-4">
        <h3 className="font-bold text-sm mb-2">🌊 {fr ? "Conditions mer" : "Sea conditions"}</h3>
        <p className="text-xs text-gray-400">
          {fr
            ? "Données marines non disponibles pour ce spot. Recoupe avec Windguru ou Surf-Forecast."
            : "Marine data unavailable for this spot. Cross-check with Windguru or Surf-Forecast."}
        </p>
      </div>
    );
  }

  const status = readMarine(sport, marine);
  const toneColor = status.tone === "good" ? "text-green-400"
    : status.tone === "warning" ? "text-orange-400" : "text-blue-400";

  return (
    <div className="bg-[var(--card)] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm">🌊 {fr ? "Conditions mer" : "Sea conditions"}</h3>
        <span className={`text-xs font-semibold ${toneColor}`}>{status.label}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="bg-white/5 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-blue-400">
            {marine.wave_height_m !== null ? `${marine.wave_height_m.toFixed(1)} m` : "—"}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">{fr ? "Hauteur" : "Height"}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-blue-400">
            {marine.wave_period_s !== null ? `${Math.round(marine.wave_period_s)} s` : "—"}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">{fr ? "Période" : "Period"}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2.5 text-center">
          <p className="text-lg font-bold text-blue-400">
            {marine.sea_temp_c !== null ? `${Math.round(marine.sea_temp_c)}°C` : "—"}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">{fr ? "Eau" : "Water"}</p>
        </div>
      </div>
      <p className="text-[11px] text-gray-500 leading-relaxed mt-2">
        {status.detail}
        {fr ? " · Source : Open-Meteo Marine — recoupe avec Windguru / Surf-Forecast pour les sorties engagées."
            : " · Source: Open-Meteo Marine — cross-check with Windguru / Surf-Forecast for engaged outings."}
      </p>
    </div>
  );
}
