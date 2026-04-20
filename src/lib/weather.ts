export interface WeatherEstimate {
  temp: number;
  feels: number;
  wind: number;      // knots
  windDir: string;   // N, NE, E, SE, S, SW, W, NW
  humidity: number;
  icon: string;
  region: string;
}

/* =====================================================================
 * Open-Meteo client (A1) — appelle /api/weather côté serveur qui cache
 * la réponse 10 min. Utile pour les pages spot/trail/coach.
 * ===================================================================== */

export type WeatherTone = 'good' | 'neutral' | 'warning' | 'bad';

export interface WeatherStatus {
  tone: WeatherTone;
  label: string;
  detail: string;
}

export interface WeatherCurrent {
  temp_c: number;
  wind_kmh: number;
  wind_kt: number;
  gust_kmh: number;
  gust_kt: number;
  wind_direction_deg: number | null;
  precip_mm: number;
  weather_code: number | null;
}

export interface WeatherDaily {
  time?: string[];
  temperature_2m_max?: number[];
  temperature_2m_min?: number[];
  precipitation_sum?: number[];
  wind_speed_10m_max?: number[];
}

export interface WeatherResponse {
  current: WeatherCurrent;
  daily: WeatherDaily | null;
  status: WeatherStatus;
  source: 'open-meteo';
  fetched_at: string;
}

/**
 * Récupère la météo temps réel + prévisions 3 jours via notre API route
 * (qui proxifie Open-Meteo et applique la lecture qualitative par sport).
 * Retourne `null` si l'appel échoue — les composants doivent prévoir un fallback.
 */
export async function fetchWeather(lat: number, lng: number, sport: string): Promise<WeatherResponse | null> {
  try {
    const r = await fetch(`/api/weather?lat=${lat}&lng=${lng}&sport=${encodeURIComponent(sport)}`, {
      // Laisse le cache côté Vercel (revalidate 10min)
      cache: 'default',
    });
    if (!r.ok) return null;
    return (await r.json()) as WeatherResponse;
  } catch {
    return null;
  }
}

/**
 * Données marines (vagues, houle, température de l'eau) — utile pour
 * surf / kite / plongée / wing. Pas de clé API requise.
 */
export interface MarineForecast {
  wave_height_m: number | null;
  wave_period_s: number | null;
  wave_direction_deg: number | null;
  swell_height_m: number | null;
  sea_temp_c: number | null;
  fetched_at: string;
}

export async function fetchMarine(lat: number, lng: number): Promise<MarineForecast | null> {
  try {
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}`
      + `&current=wave_height,wave_period,wave_direction,swell_wave_height,sea_surface_temperature`
      + `&timezone=auto`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const data = await r.json();
    const cur = data.current || {};
    return {
      wave_height_m: typeof cur.wave_height === 'number' ? cur.wave_height : null,
      wave_period_s: typeof cur.wave_period === 'number' ? cur.wave_period : null,
      wave_direction_deg: typeof cur.wave_direction === 'number' ? cur.wave_direction : null,
      swell_height_m: typeof cur.swell_wave_height === 'number' ? cur.swell_wave_height : null,
      sea_temp_c: typeof cur.sea_surface_temperature === 'number' ? cur.sea_surface_temperature : null,
      fetched_at: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * Interprète les conditions marines pour un sport donné.
 * Pas de score numérique : statut qualitatif terrain.
 */
export function readMarine(sport: string, m: MarineForecast): WeatherStatus {
  const s = sport.toLowerCase();
  const h = m.wave_height_m ?? 0;
  const per = m.wave_period_s ?? 0;

  if (s.includes('surf') || s.includes('bodyboard')) {
    if (h >= 1 && h <= 2 && per >= 8) return { tone: 'good', label: 'Vagues propres', detail: `${h.toFixed(1)} m / ${Math.round(per)}s — session idéale` };
    if (h < 0.5) return { tone: 'neutral', label: 'Mer plate', detail: `${h.toFixed(1)} m — trop petit` };
    if (h > 3) return { tone: 'warning', label: 'Grosse houle', detail: `${h.toFixed(1)} m — réservé aux confirmés` };
    return { tone: 'neutral', label: 'À évaluer sur site', detail: `${h.toFixed(1)} m / ${Math.round(per)}s` };
  }
  if (s.includes('kite') || s.includes('wing')) {
    if (h < 0.8) return { tone: 'good', label: 'Plan d\'eau flat', detail: `${h.toFixed(1)} m — idéal freestyle` };
    if (h >= 0.8 && h < 1.5) return { tone: 'neutral', label: 'Petit clapot', detail: `${h.toFixed(1)} m — session énergique` };
    return { tone: 'warning', label: 'Mer formée', detail: `${h.toFixed(1)} m — pour confirmés` };
  }
  if (s.includes('plong') || s.includes('apn') || s.includes('snorkel')) {
    if (h < 0.5) return { tone: 'good', label: 'Eau calme', detail: `${h.toFixed(1)} m — visibilité probable excellente` };
    if (h > 1.5) return { tone: 'warning', label: 'Mer agitée', detail: `${h.toFixed(1)} m — visi dégradée` };
    return { tone: 'neutral', label: 'Conditions correctes', detail: `${h.toFixed(1)} m` };
  }
  if (s.includes('voile') || s.includes('catamaran') || s.includes('paddle') || s.includes('kayak')) {
    if (h < 1) return { tone: 'good', label: 'Mer maniable', detail: `${h.toFixed(1)} m` };
    if (h > 2) return { tone: 'warning', label: 'Mer formée', detail: `${h.toFixed(1)} m — niveau confirmé` };
    return { tone: 'neutral', label: 'Ça bouge', detail: `${h.toFixed(1)} m` };
  }
  return { tone: 'neutral', label: 'Mer', detail: `${h.toFixed(1)} m` };
}

/**
 * Trouve une fenêtre météo favorable dans les 3 jours à venir
 * à partir des données daily d'Open-Meteo.
 * Retourne l'index du jour (0 = aujourd'hui) ou null.
 */
export function findWeatherWindow(sport: string, daily: WeatherDaily | null): { dayIndex: number; label: string } | null {
  if (!daily || !daily.time || daily.time.length === 0) return null;
  const s = sport.toLowerCase();
  const days = daily.time.length;

  for (let i = 0; i < days; i++) {
    const wind = daily.wind_speed_10m_max?.[i] ?? 0;
    const wind_kt = wind / 1.852;
    const precip = daily.precipitation_sum?.[i] ?? 0;
    const tmax = daily.temperature_2m_max?.[i] ?? 0;

    if ((s.includes('kite') || s.includes('wing')) && wind_kt >= 14 && wind_kt <= 28) {
      return { dayIndex: i, label: `${Math.round(wind_kt)} kt — fenêtre kite` };
    }
    if ((s.includes('parapente') || s.includes('deltaplane')) && wind < 20 && precip < 1) {
      return { dayIndex: i, label: 'Aérologie calme' };
    }
    if ((s.includes('trail') || s.includes('rando') || s.includes('course')) && precip < 1 && tmax > 8 && tmax < 28) {
      return { dayIndex: i, label: `${Math.round(tmax)}°C sans pluie` };
    }
    if ((s.includes('escalade') || s.includes('bloc')) && precip < 0.5 && tmax >= 5 && tmax <= 25) {
      return { dayIndex: i, label: `${Math.round(tmax)}°C — friction au top` };
    }
    if (s.includes('ski') && tmax < 2 && precip > 2) {
      return { dayIndex: i, label: 'Chute de neige' };
    }
  }
  return null;
}


/**
 * Lightweight deterministic weather estimator by coordinates.
 * Not a real meteorological source — placeholder in V2 before Open-Meteo integration.
 */
export function estimateWeather(lat: number, lng: number): WeatherEstimate {
  // Méditerranée Espagne (Tarifa, Andalousie — zone kite)
  if (lat < 38 && lng > -7 && lng < 0) return { temp: 22, feels: 24, wind: 28, windDir: 'E', humidity: 62, icon: '🌤', region: 'Méditerranée (Espagne)' };
  // Méditerranée France (Nice, Cassis, Porquerolles)
  if (lat >= 42.5 && lat < 44 && lng >= 3 && lng < 8) return { temp: 20, feels: 20, wind: 12, windDir: 'SE', humidity: 68, icon: '☀️', region: 'Méditerranée (France)' };
  // Alpes
  if (lat >= 44.5 && lat <= 46.5 && lng >= 5.5 && lng <= 7.5) return { temp: 11, feels: 9, wind: 14, windDir: 'W', humidity: 72, icon: '⛅', region: 'Alpes' };
  // Atlantique (Biarritz, Hossegor)
  if (lat >= 43 && lat <= 44 && lng < -1) return { temp: 17, feels: 17, wind: 20, windDir: 'W', humidity: 75, icon: '🌥', region: 'Atlantique' };
  // Pyrénées
  if (lat >= 42.5 && lat < 43.5 && lng >= -1 && lng <= 3) return { temp: 14, feels: 12, wind: 10, windDir: 'NW', humidity: 70, icon: '⛅', region: 'Pyrénées' };
  // Corse
  if (lat >= 41 && lat <= 43 && lng >= 8 && lng <= 10) return { temp: 19, feels: 20, wind: 16, windDir: 'SW', humidity: 66, icon: '☀️', region: 'Corse' };
  // Dolomites / Nord Italie (alpinisme)
  if (lat >= 46 && lat <= 47.5 && lng >= 10 && lng <= 13) return { temp: 9, feels: 7, wind: 10, windDir: 'N', humidity: 68, icon: '🌨', region: 'Dolomites' };
  return { temp: 15, feels: 14, wind: 12, windDir: 'W', humidity: 70, icon: '⛅', region: '—' };
}

export function isNauticalSport(sport: string): boolean {
  return ['Kitesurf', 'Surf', 'Bodyboard', 'Windsurf', 'Wing foil', 'Plongée', 'Apnée', 'Snorkeling',
    'Kayak de mer', 'Voile', 'Paddle (SUP)', 'Catamaran', 'Nage en eau libre', 'Pêche sportive',
    'Wakeboard', 'Ski nautique', 'Coasteering', 'Jet-ski'].includes(sport);
}

/**
 * Build a minimal valid GPX file from a single waypoint or route.
 */
export function buildGPX(params: { name: string; description?: string; points: Array<{ lat: number; lng: number; ele?: number; name?: string }> }): string {
  const now = new Date().toISOString();
  const pts = params.points.map(p => `    <rtept lat="${p.lat}" lon="${p.lng}">${p.ele ? `<ele>${p.ele}</ele>` : ''}${p.name ? `<name>${escapeXml(p.name)}</name>` : ''}</rtept>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Adventurer" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escapeXml(params.name)}</name>
    ${params.description ? `<desc>${escapeXml(params.description)}</desc>` : ''}
    <time>${now}</time>
  </metadata>
  <rte>
    <name>${escapeXml(params.name)}</name>
${pts}
  </rte>
</gpx>`;
}

function escapeXml(str: string) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export function downloadGPX(filename: string, content: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.gpx') ? filename : filename + '.gpx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
