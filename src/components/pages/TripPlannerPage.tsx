'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { getSportEmoji } from '@/lib/sports-config';

interface DayItem {
  day: number;
  title: string;
  description: string;
  distance?: string;
  dplus?: string;
}

interface GeneratedTrip {
  title: string;
  destination: string;
  sport: string;
  days: number;
  itinerary: DayItem[];
  totalDistance: string;
  totalDplus: string;
}

// Template-based trip generation (no API cost)
function generateTrip(dest: string, sport: string, numDays: number, lang: string): GeneratedTrip {
  const fr = lang === 'fr';

  // Sport-specific templates
  const templates: Record<string, { dayTitles: string[]; distances: string[]; dplus: string[] }> = {
    'Vélo route': {
      dayTitles: ['Arrivée et première boucle', 'Col principal du séjour', 'Route panoramique', 'Vallée et villages', 'Cols enchaînés', 'Journée reine', 'Repos actif et visites', 'Dernière étape et célébration', 'Transfert retour', 'Boucle bonus'],
      distances: ['45 km', '82 km', '95 km', '68 km', '110 km', '120 km', '35 km', '75 km', '40 km', '60 km'],
      dplus: ['+350m', '+1200m', '+1500m', '+800m', '+2000m', '+2200m', '+200m', '+900m', '+300m', '+700m'],
    },
    'Trail': {
      dayTitles: ['Reconnaissance du terrain', 'Ascension du sommet principal', 'Crêtes et traversée', 'Vallée secrète', 'Ultra-distance', 'Technique et single-track', 'Repos et récupération', 'Ridge run final', 'Descente vers la vallée', 'Boucle de clôture'],
      distances: ['18 km', '24 km', '30 km', '22 km', '42 km', '28 km', '10 km', '35 km', '20 km', '15 km'],
      dplus: ['+800m', '+1400m', '+1800m', '+1000m', '+2500m', '+1600m', '+300m', '+2000m', '+600m', '+500m'],
    },
    'Randonnée': {
      dayTitles: ['Premiers pas dans la nature', 'Lac de montagne', 'Traversée de crêtes', 'Forêt et cascades', 'Sommet du voyage', 'Villages traditionnels', 'Repos au refuge', 'Panorama final', 'Descente et bilan', 'Balade de clôture'],
      distances: ['12 km', '16 km', '18 km', '14 km', '20 km', '10 km', '8 km', '15 km', '12 km', '10 km'],
      dplus: ['+500m', '+800m', '+1000m', '+600m', '+1200m', '+400m', '+200m', '+900m', '+300m', '+250m'],
    },
    'Kitesurf': {
      dayTitles: ['Découverte du spot', 'Session vent du matin', 'Downwind côtier', 'Freestyle et progression', 'Exploration nouveau spot', 'Big air day', 'Repos et culture locale', 'Session sunset', 'Wave riding', 'Dernière session et fête'],
      distances: ['15 km nav', '25 km nav', '35 km nav', '20 km nav', '30 km nav', '22 km nav', '0 km', '18 km nav', '12 km nav', '28 km nav'],
      dplus: ['', '', '', '', '', '', '', '', '', ''],
    },
    'Plongée': {
      dayTitles: ['Plongée d\'acclimatation', 'Tombant et vie marine', 'Épave historique', 'Plongée de nuit', 'Grotte sous-marine', 'Grand bleu — pélagiques', 'Surface et snorkeling', 'Plongée profonde', 'Récif corallien', 'Dernière immersion'],
      distances: ['-18m', '-25m', '-30m', '-15m', '-22m', '-35m', '-5m', '-40m', '-20m', '-28m'],
      dplus: ['', '', '', '', '', '', '', '', '', ''],
    },
  };

  // Find closest template or use generic
  const sportKey = Object.keys(templates).find(k => sport.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(sport.toLowerCase()));
  const tmpl = sportKey ? templates[sportKey] : templates['Randonnée'];

  const itinerary: DayItem[] = [];
  for (let i = 0; i < numDays; i++) {
    const idx = i % tmpl.dayTitles.length;
    itinerary.push({
      day: i + 1,
      title: `${tmpl.dayTitles[idx]}`,
      description: fr
        ? `Jour ${i + 1} à ${dest} — ${tmpl.dayTitles[idx].toLowerCase()}. Profitez des paysages et de l'aventure.`
        : `Day ${i + 1} in ${dest} — ${tmpl.dayTitles[idx].toLowerCase()}. Enjoy the scenery and adventure.`,
      distance: tmpl.distances[idx] || undefined,
      dplus: tmpl.dplus[idx] || undefined,
    });
  }

  // Calculate totals
  const totalDist = itinerary.reduce((sum, d) => {
    const num = d.distance ? parseFloat(d.distance.replace(/[^\d.]/g, '')) : 0;
    return sum + num;
  }, 0);

  const totalElev = itinerary.reduce((sum, d) => {
    const num = d.dplus ? parseFloat(d.dplus.replace(/[^\d.]/g, '')) : 0;
    return sum + num;
  }, 0);

  return {
    title: fr ? `${sport} à ${dest} — ${numDays} jours` : `${sport} in ${dest} — ${numDays} days`,
    destination: dest,
    sport,
    days: numDays,
    itinerary,
    totalDistance: `${Math.round(totalDist)} km`,
    totalDplus: totalElev > 0 ? `+${Math.round(totalElev)}m` : '',
  };
}

export default function TripPlannerPage() {
  const { closeSubPage, showToast, addTripPlan, tripPlans, selectedSports, language, canUseTrip, incrementTripsUsed, premiumTripsUsed, isPremium, setSubPage } = useStore();
  const fr = language === 'fr';

  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(5);
  const [sport, setSport] = useState(selectedSports[0] || 'Randonnée');
  const [isGenerating, setIsGenerating] = useState(false);
  const [trip, setTrip] = useState<GeneratedTrip | null>(null);

  const tripsLeft = isPremium ? Infinity : Math.max(0, 3 - premiumTripsUsed);

  const handleGenerate = async () => {
    if (!destination.trim()) {
      showToast(fr ? 'Indique une destination' : 'Enter a destination', 'error', '📍');
      return;
    }
    if (!canUseTrip()) {
      showToast(fr ? 'Limite atteinte — passe en Premium pour des voyages illimités' : 'Limit reached — go Premium for unlimited trips', 'warning', '⭐');
      setSubPage('premium');
      return;
    }
    setIsGenerating(true);
    incrementTripsUsed();
    await new Promise(r => setTimeout(r, 1500));
    const result = generateTrip(destination.trim(), sport, days, language);
    setTrip(result);
    setIsGenerating(false);
  };

  const handleSave = () => {
    if (!trip) return;
    addTripPlan({
      title: trip.title,
      destination: trip.destination,
      days: trip.days,
      sport: trip.sport,
      itinerary: trip.itinerary,
    });
    showToast(fr ? 'Voyage sauvegardé !' : 'Trip saved!', 'success', '💾');
  };

  const handleShare = () => {
    if (!trip) return;
    const text = `🗺️ ${trip.title}\n${trip.totalDistance}${trip.totalDplus ? ' · ' + trip.totalDplus : ''}\n\nPlanifié sur adventurer-outdoor.vercel.app`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: trip.title, text, url: 'https://adventurer-outdoor.vercel.app' }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => showToast(fr ? 'Copié !' : 'Copied!', 'success', '📋'));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] max-w-[430px] mx-auto pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-white/5">
        <button type="button" onClick={closeSubPage} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition">
          ←
        </button>
        <div>
          <h1 className="font-bold text-base">🗺️ AI Trip Planner</h1>
          <p className="text-xs text-gray-500">{fr ? 'Génère ton itinéraire multi-jours' : 'Generate your multi-day itinerary'}</p>
        </div>
      </div>

      {!trip ? (
        /* FORM */
        <div className="px-4 py-6 space-y-6">
          {/* Destination */}
          <div>
            <label className="text-sm font-semibold text-white block mb-2">📍 {fr ? 'Destination' : 'Destination'}</label>
            <input
              type="text"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder={fr ? 'ex: Arménie, Dolomites, Sardaigne...' : 'e.g., Armenia, Dolomites, Sardinia...'}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          {/* Days */}
          <div>
            <label className="text-sm font-semibold text-white block mb-2">📅 {fr ? 'Durée' : 'Duration'}</label>
            <div className="flex gap-2">
              {[3, 5, 7, 10, 14].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDays(d)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${
                    days === d ? 'bg-[var(--accent)] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {d} {fr ? 'j' : 'd'}
                </button>
              ))}
            </div>
          </div>

          {/* Sport */}
          <div>
            <label className="text-sm font-semibold text-white block mb-2">{getSportEmoji(sport)} {fr ? 'Activité' : 'Activity'}</label>
            <div className="flex flex-wrap gap-2">
              {(selectedSports.length > 0 ? selectedSports : ['Randonnée', 'Trail', 'Vélo route', 'Kitesurf', 'Plongée']).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSport(s)}
                  className={`px-3 py-2 rounded-full text-xs font-medium transition ${
                    sport === s ? 'bg-[var(--accent)]/20 text-[var(--accent)] ring-1 ring-[var(--accent)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {getSportEmoji(s)} {s}
                </button>
              ))}
            </div>
          </div>

          {/* Free trips remaining */}
          {!isPremium && (
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl">
              <span className="text-sm">🗺️</span>
              <p className="text-xs text-gray-400 flex-1">
                {tripsLeft > 0
                  ? (fr ? `${tripsLeft} voyage${tripsLeft > 1 ? 's' : ''} gratuit${tripsLeft > 1 ? 's' : ''} restant${tripsLeft > 1 ? 's' : ''}` : `${tripsLeft} free trip${tripsLeft > 1 ? 's' : ''} remaining`)
                  : (fr ? 'Limite atteinte — Premium = illimité' : 'Limit reached — Premium = unlimited')}
              </p>
              {tripsLeft === 0 && (
                <button type="button" onClick={() => setSubPage('premium')} className="text-[10px] font-bold text-[var(--accent)]">
                  ⭐ Premium
                </button>
              )}
            </div>
          )}

          {/* Generate CTA */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !destination.trim()}
            className={`w-full py-4 rounded-2xl font-black text-lg transition ${
              isGenerating || !destination.trim()
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#F77F00] to-[#FFB703] text-[#1B4332] hover:opacity-90 shadow-lg shadow-[#F77F00]/20'
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">🌀</span>
                {fr ? 'Génération en cours...' : 'Generating...'}
              </span>
            ) : (
              fr ? '🚀 Générer mon itinéraire' : '🚀 Generate my itinerary'
            )}
          </button>

          {/* Saved trips */}
          {tripPlans.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-white mb-3">{fr ? 'Mes voyages' : 'My trips'}</h3>
              <div className="space-y-2">
                {tripPlans.slice(0, 5).map(t => (
                  <div key={t.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 flex items-center gap-3">
                    <span className="text-xl">{getSportEmoji(t.sport)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-white truncate">{t.title}</p>
                      <p className="text-xs text-gray-500">{t.days} {fr ? 'jours' : 'days'} · {t.destination}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* GENERATED TRIP VIEW */
        <div className="px-4 py-6">
          {/* Trip header */}
          <div className="bg-gradient-to-br from-[#023E8A] to-[#2D6A4F] rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{getSportEmoji(trip.sport)}</span>
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">{trip.days} {fr ? 'jours' : 'days'}</span>
            </div>
            <h2 className="text-xl font-black text-white mb-1">{trip.title}</h2>
            <div className="flex items-center gap-4 text-sm text-white/70 mt-2">
              <span>📏 {trip.totalDistance}</span>
              {trip.totalDplus && <span>⛰️ {trip.totalDplus}</span>}
            </div>
          </div>

          {/* Day-by-day timeline */}
          <div className="space-y-4 mb-8">
            {trip.itinerary.map((day, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {day.day}
                  </div>
                  {i < trip.itinerary.length - 1 && <div className="w-0.5 flex-1 bg-white/10 mt-1" />}
                </div>
                <div className="flex-1 pb-4">
                  <h4 className="font-bold text-sm text-white">{day.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">{day.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    {day.distance && <span>📏 {day.distance}</span>}
                    {day.dplus && <span>⛰️ {day.dplus}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <button type="button" onClick={handleSave} className="flex-1 py-3 bg-[var(--accent)] text-white rounded-xl font-bold text-sm hover:opacity-90 transition">
                💾 {fr ? 'Sauvegarder' : 'Save'}
              </button>
              <button type="button" onClick={handleShare} className="flex-1 py-3 bg-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/15 transition">
                📤 {fr ? 'Partager' : 'Share'}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setTrip(null)}
              className="w-full py-2.5 text-gray-400 text-sm hover:text-white transition"
            >
              {fr ? '🔄 Nouveau voyage' : '🔄 New trip'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
