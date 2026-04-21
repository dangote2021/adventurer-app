'use client';

/**
 * /explore — Public discovery page
 * Leaflet map + curated spots across Terre / Mer / Air.
 * SEO-indexable (links from sitemap), funnels visitors towards sign-up.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { apiUrl } from '@/lib/api-url';

type Spot = {
  id: string;
  title: string;
  sport: string;
  universe: 'Terre' | 'Mer' | 'Air';
  lat: number;
  lng: number;
  region: string;
  teaser: string;
};

const SPOTS: Spot[] = [
  { id: 'mont-blanc', title: 'Tour du Mont-Blanc', sport: 'Trail', universe: 'Terre', lat: 45.8325, lng: 6.8649, region: 'Chamonix, France', teaser: '170 km, 10 000 m de D+ — le GR le plus mythique des Alpes.' },
  { id: 'tarifa', title: 'Playa de Los Lances', sport: 'Kitesurf', universe: 'Mer', lat: 36.0132, lng: -5.6039, region: 'Tarifa, Espagne', teaser: 'Levante / Poniente, 300 jours ventés/an — capitale mondiale du kite.' },
  { id: 'annecy', title: 'Planfait — Lac d\'Annecy', sport: 'Parapente', universe: 'Air', lat: 45.7865, lng: 6.2190, region: 'Haute-Savoie', teaser: 'Décollage mythique, thermiques réguliers, atterrissage au Doussard.' },
  { id: 'fontainebleau', title: 'Bas Cuvier', sport: 'Bloc', universe: 'Terre', lat: 48.4392, lng: 2.6398, region: 'Fontainebleau', teaser: 'Forêt légendaire — du 3 au 8c, problèmes historiques du bloc.' },
  { id: 'dakhla', title: 'Lagune de Dakhla', sport: 'Wing foil', universe: 'Mer', lat: 23.7136, lng: -15.9357, region: 'Maroc', teaser: 'Eau plate turquoise, vent thermique constant, désert à perte de vue.' },
  { id: 'saint-hilaire', title: 'Saint-Hilaire-du-Touvet', sport: 'Parapente', universe: 'Air', lat: 45.3103, lng: 5.8772, region: 'Isère, France', teaser: 'Site emblématique de la Coupe Icare, décollage en balcon du Grésivaudan.' },
  { id: 'gr20', title: 'GR20 — Étape du Monte Cinto', sport: 'Trekking', universe: 'Terre', lat: 42.3810, lng: 8.9400, region: 'Corse', teaser: 'Le GR le plus difficile d\'Europe. Granite, lacs d\'altitude, cirques.' },
  { id: 'porquerolles', title: 'Épave du Donator', sport: 'Plongée', universe: 'Mer', lat: 43.0020, lng: 6.1870, region: 'Porquerolles, Var', teaser: 'Cargo de 78 m par 50 m de fond. Mérous, dentis, visi 20 m+.' },
  { id: 'chamonix-ski', title: 'Vallée Blanche', sport: 'Ski hors-piste', universe: 'Terre', lat: 45.8797, lng: 6.8877, region: 'Chamonix', teaser: '22 km de glacier, 2800 m de descente — hors-piste de classe mondiale.' },
  { id: 'hossegor', title: 'La Gravière', sport: 'Surf', universe: 'Mer', lat: 43.6700, lng: -1.4400, region: 'Landes', teaser: 'Beachbreak réputé, tubes puissants — spot pro de l\'automne atlantique.' },
  { id: 'verdon', title: 'Couloir Samson', sport: 'Escalade', universe: 'Terre', lat: 43.7830, lng: 6.3640, region: 'Gorges du Verdon', teaser: 'Grandes voies calcaires, de la TA classique au 8a engagé.' },
  { id: 'la-torche', title: 'La Torche', sport: 'Wing foil', universe: 'Mer', lat: 47.8390, lng: -4.3510, region: 'Bretagne sud', teaser: 'Plage exposée ouest, vagues propres, spot hivernal de référence.' },
];

const UNIVERSES: Array<'Tous' | 'Terre' | 'Mer' | 'Air'> = ['Tous', 'Terre', 'Mer', 'Air'];

const UNIVERSE_EMOJI: Record<string, string> = { Terre: '🏔️', Mer: '🌊', Air: '🪂' };

const UNIVERSE_COLOR: Record<string, string> = {
  Terre: '#2D6A4F',
  Mer: '#023E8A',
  Air: '#F77F00',
};

type WeatherData = {
  current?: { temp_c: number; wind_kmh: number; wind_kt: number; gust_kt: number; precip_mm: number };
  status?: { tone: 'good' | 'neutral' | 'warning' | 'bad'; label: string; detail: string };
  error?: string;
};

const TONE_STYLE: Record<string, string> = {
  good: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  neutral: 'bg-amber-50 border-amber-200 text-amber-800',
  warning: 'bg-orange-50 border-orange-200 text-orange-900',
  bad: 'bg-red-50 border-red-200 text-red-800',
};
const TONE_DOT: Record<string, string> = {
  good: 'bg-emerald-500',
  neutral: 'bg-amber-500',
  warning: 'bg-orange-500',
  bad: 'bg-red-500',
};

export default function ExplorePage() {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [filter, setFilter] = useState<'Tous' | 'Terre' | 'Mer' | 'Air'>('Tous');
  const [selected, setSelected] = useState<Spot | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

  // Fetch weather on selection change + auto-scroll
  useEffect(() => {
    if (!selected) { setWeather(null); return; }
    setWeatherLoading(true);
    setWeather(null);
    // Scroll detail card into view
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    const ctl = new AbortController();
    fetch(apiUrl(`/api/weather?lat=${selected.lat}&lng=${selected.lng}&sport=${encodeURIComponent(selected.sport)}`), { signal: ctl.signal })
      .then(r => r.json())
      .then(d => setWeather(d))
      .catch(() => { /* ignore aborts */ })
      .finally(() => setWeatherLoading(false));
    return () => ctl.abort();
  }, [selected]);

  const filtered = filter === 'Tous' ? SPOTS : SPOTS.filter(s => s.universe === filter);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapEl.current) return;

    let cancelled = false;

    (async () => {
      const L = (await import('leaflet')).default;
      // Inject CSS once
      if (!document.querySelector('link[data-leaflet]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.setAttribute('data-leaflet', 'true');
        document.head.appendChild(link);
      }
      if (cancelled || !mapEl.current) return;

      if (!mapRef.current) {
        mapRef.current = L.map(mapEl.current, {
          center: [45, 5],
          zoom: 4,
          zoomControl: true,
          scrollWheelZoom: false,
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 18,
        }).addTo(mapRef.current);
      }
      setMapReady(true);
    })();

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const L = require('leaflet');

    // Clear existing markers
    markersRef.current.forEach(m => mapRef.current.removeLayer(m));
    markersRef.current = [];

    filtered.forEach(spot => {
      const icon = L.divIcon({
        className: 'adv-marker',
        html: `<div style="background:${UNIVERSE_COLOR[spot.universe]};width:32px;height:32px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer">${UNIVERSE_EMOJI[spot.universe]}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      const m = L.marker([spot.lat, spot.lng], { icon }).addTo(mapRef.current);
      m.on('click', () => setSelected(spot));
      markersRef.current.push(m);
    });

    if (filtered.length > 0) {
      const bounds = L.latLngBounds(filtered.map(s => [s.lat, s.lng]));
      mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 });
    }
  }, [filter, mapReady, filtered]);

  return (
    <main className="min-h-screen bg-[#FEFAE0] text-gray-900" style={{ colorScheme: 'light' }}>
      <header className="bg-[#1B4332] text-white px-6 py-5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="font-bold text-xl">Adventurer</Link>
          <nav className="hidden md:flex gap-5 text-sm">
            <Link href="/explore" className="text-white underline underline-offset-4">Explorer</Link>
            <Link href="/coach/ai" className="hover:underline">Coach IA</Link>
            <Link href="/coach/humain" className="hover:underline">Coachs humains</Link>
            <Link href="/ambassadors" className="hover:underline">Ambassadeurs</Link>
          </nav>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl md:text-4xl font-black text-[#1B4332]">Spots d&apos;aventure</h1>
        <p className="text-gray-700 mt-2 max-w-2xl">
          Une sélection de spots multi-sports en Terre, Mer et Air. Clique sur un marqueur pour en savoir plus.
          La carte complète (cross-filter, météo temps réel, itinéraires) arrive dans l&apos;app.
        </p>

        <div className="flex gap-2 mt-5 flex-wrap">
          {UNIVERSES.map(u => (
            <button
              key={u}
              onClick={() => setFilter(u)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === u
                  ? 'bg-[#1B4332] text-white'
                  : 'bg-white text-[#1B4332] border border-[#1B4332]/20 hover:border-[#1B4332]'
              }`}
            >
              {u === 'Tous' ? 'Tous' : `${UNIVERSE_EMOJI[u]} ${u}`}
              {u !== 'Tous' && ` (${SPOTS.filter(s => s.universe === u).length})`}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-[1fr_380px] gap-4 mt-6">
          <div
            ref={mapEl}
            className="rounded-2xl h-[500px] border border-gray-200 bg-gray-100 z-0"
          />

          <aside className="bg-white rounded-2xl border border-gray-200 p-4 max-h-[500px] overflow-auto">
            <h2 className="text-sm font-bold text-[#1B4332] mb-3">
              {filtered.length} spot{filtered.length > 1 ? 's' : ''}
            </h2>
            <div className="space-y-2">
              {filtered.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelected(s);
                    if (mapRef.current) mapRef.current.setView([s.lat, s.lng], 8);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition ${
                    selected?.id === s.id
                      ? 'border-[#2D6A4F] bg-[#2D6A4F]/5'
                      : 'border-gray-100 hover:border-[#2D6A4F]/40'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-semibold text-[#1B4332]">{s.title}</div>
                      <div className="text-xs text-gray-500">{s.region}</div>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: `${UNIVERSE_COLOR[s.universe]}15`, color: UNIVERSE_COLOR[s.universe] }}
                    >
                      {s.sport}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </aside>
        </div>

        {selected && (
          <div ref={detailRef} className="mt-4 bg-white rounded-2xl p-5 border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-[#1B4332]">{selected.title}</h3>
                <p className="text-sm text-gray-500">{selected.region} · {selected.sport}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-800 text-xl leading-none"
                aria-label="Fermer"
              >×</button>
            </div>
            <p className="mt-3 text-gray-800">{selected.teaser}</p>

            {(weatherLoading || weather?.status || weather?.error) && (
              <div className={`mt-4 p-4 rounded-xl border ${weather?.status ? TONE_STYLE[weather.status.tone] : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                {weatherLoading && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                    Lecture des conditions en direct…
                  </div>
                )}
                {!weatherLoading && weather?.status && weather.current && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${TONE_DOT[weather.status.tone]}`} />
                      <strong className="text-sm">{weather.status.label}</strong>
                    </div>
                    <p className="text-sm mt-1">{weather.status.detail}</p>
                    <div className="flex gap-4 mt-2 text-xs opacity-80">
                      <span>🌡 {Math.round(weather.current.temp_c)}°C</span>
                      <span>💨 {weather.current.wind_kt} kt ({Math.round(weather.current.wind_kmh)} km/h)</span>
                      {weather.current.precip_mm > 0 && <span>🌧 {weather.current.precip_mm.toFixed(1)} mm</span>}
                    </div>
                  </>
                )}
                {!weatherLoading && weather?.error && (
                  <p className="text-sm">Météo temporairement indisponible.</p>
                )}
              </div>
            )}

            <div className="flex gap-2 mt-4 flex-wrap">
              <Link
                href={`/coach/ai?sport=${encodeURIComponent(selected.sport)}`}
                className="bg-[#1B4332] text-white px-4 py-2 rounded-full text-sm hover:bg-[#2D6A4F]"
              >
                Préparer mon aventure
              </Link>
              <Link
                href="/coach/humain"
                className="bg-[#F77F00] text-white px-4 py-2 rounded-full text-sm hover:bg-[#E66F00]"
              >
                Trouver un coach
              </Link>
              <Link
                href="/ambassadors"
                className="bg-white border border-[#1B4332]/30 text-[#1B4332] px-4 py-2 rounded-full text-sm hover:border-[#1B4332]"
              >
                Rejoindre la tribu
              </Link>
            </div>
          </div>
        )}

        <section className="mt-10 bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] rounded-3xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold">Prépare, vis, partage ton aventure</h2>
          <p className="mt-2 text-white/80 max-w-xl mx-auto">
            Adventurer réunit les trois temps de l&apos;outdoor dans une seule app multi-sports.
          </p>
          <div className="mt-4 flex gap-3 justify-center flex-wrap">
            <Link href="/coach/ai" className="bg-white text-[#1B4332] font-bold px-5 py-2.5 rounded-full">
              Essayer le Coach IA
            </Link>
            <Link href="/ambassadors" className="bg-[#F77F00] text-white font-bold px-5 py-2.5 rounded-full">
              Devenir ambassadeur
            </Link>
          </div>
        </section>
      </section>

      <footer className="text-center text-xs text-gray-500 py-8 border-t border-gray-200 mt-10">
        Adventurer ·{' '}
        <Link href="/legal/privacy" className="underline">Confidentialité</Link>{' · '}
        <Link href="/legal/terms" className="underline">CGU</Link>{' · '}
        <Link href="/legal/mentions" className="underline">Mentions</Link>
      </footer>
    </main>
  );
}
