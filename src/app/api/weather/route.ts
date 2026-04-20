/**
 * GET /api/weather?lat=X&lng=Y&sport=Kitesurf
 * Returns current + forecast conditions from Open-Meteo (free, no key).
 * Returns qualitative terrain statuses — not abstract scores.
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 600; // cache 10 min

type Universe = 'Terre' | 'Mer' | 'Air';

type QualitativeStatus = {
  tone: 'good' | 'neutral' | 'warning' | 'bad';
  label: string;
  detail: string;
};

function judge(sport: string, wind_kmh: number, gust_kmh: number, temp_c: number, precip_mm: number): QualitativeStatus {
  const wind_kt = wind_kmh / 1.852;
  const gust_kt = gust_kmh / 1.852;
  const s = sport.toLowerCase();

  // Wind-hungry sports
  if (s.includes('kite') || s.includes('wing')) {
    if (wind_kt >= 14 && wind_kt <= 28 && gust_kt < 35) {
      return { tone: 'good', label: 'Conditions idéales', detail: `${Math.round(wind_kt)} kt — fenêtre parfaite pour rider` };
    }
    if (wind_kt < 14) {
      return { tone: 'neutral', label: 'Vent faible', detail: `${Math.round(wind_kt)} kt — sous-toilé, prépare ta plus grande aile` };
    }
    if (wind_kt > 28 || gust_kt > 35) {
      return { tone: 'warning', label: 'Vent costaud', detail: `${Math.round(wind_kt)} kt (rafales ${Math.round(gust_kt)} kt) — pour riders confirmés uniquement` };
    }
  }
  if (s.includes('windsurf') || s.includes('voile')) {
    if (wind_kt >= 12 && wind_kt <= 25) return { tone: 'good', label: 'Belle brise', detail: `${Math.round(wind_kt)} kt — session au top` };
    if (wind_kt < 8) return { tone: 'neutral', label: 'Pétole', detail: `${Math.round(wind_kt)} kt — trop peu pour planer` };
    if (wind_kt > 30) return { tone: 'warning', label: 'Tempête annoncée', detail: `rafales ${Math.round(gust_kt)} kt — reste au chaud` };
  }
  if (s.includes('parapente') || s.includes('deltaplane') || s.includes('speedriding') || s.includes('speedflying')) {
    if (wind_kmh <= 15 && gust_kmh <= 20) return { tone: 'good', label: 'Aérologie calme', detail: `${Math.round(wind_kmh)} km/h au sol — parfait pour voler` };
    if (wind_kmh > 25 || gust_kmh > 30) return { tone: 'bad', label: 'Pas volable', detail: `vent ${Math.round(wind_kmh)} km/h, rafales ${Math.round(gust_kmh)} — on range la voile` };
    return { tone: 'warning', label: 'Vent limite', detail: `${Math.round(wind_kmh)} km/h — évaluer sur site` };
  }

  // Sea sports
  if (s.includes('surf') || s.includes('bodyboard')) {
    if (wind_kmh < 15 && precip_mm < 1) return { tone: 'good', label: 'Vent léger', detail: `${Math.round(wind_kmh)} km/h — conditions propres` };
    if (wind_kmh > 30) return { tone: 'warning', label: 'Mer agitée', detail: `${Math.round(wind_kmh)} km/h — vagues désordonnées` };
    return { tone: 'neutral', label: 'À surveiller', detail: `${Math.round(wind_kmh)} km/h de vent` };
  }
  if (s.includes('plong') || s.includes('apn') || s.includes('snorkel') || s.includes('nage')) {
    if (wind_kmh < 20 && temp_c > 12) return { tone: 'good', label: 'Mer praticable', detail: `${Math.round(wind_kmh)} km/h vent, ${Math.round(temp_c)}°C air — visi probable correcte` };
    if (wind_kmh > 30) return { tone: 'warning', label: 'Houle probable', detail: `vent ${Math.round(wind_kmh)} km/h — visibilité sous-marine dégradée` };
    return { tone: 'neutral', label: 'Conditions moyennes', detail: `${Math.round(wind_kmh)} km/h de vent` };
  }

  // Land sports
  if (s.includes('trail') || s.includes('rando') || s.includes('course') || s.includes('marche') || s.includes('trek')) {
    if (precip_mm > 5) return { tone: 'warning', label: 'Pluie soutenue', detail: `${precip_mm.toFixed(1)} mm prévus — chemins gras` };
    if (temp_c > 30) return { tone: 'warning', label: 'Canicule', detail: `${Math.round(temp_c)}°C — hydratation max, pars tôt` };
    if (temp_c < -5) return { tone: 'warning', label: 'Froid mordant', detail: `${Math.round(temp_c)}°C — couches techniques obligatoires` };
    return { tone: 'good', label: 'Bonne fenêtre', detail: `${Math.round(temp_c)}°C, ${precip_mm < 0.5 ? 'sec' : `${precip_mm.toFixed(1)}mm`}` };
  }
  if (s.includes('escalade') || s.includes('bloc') || s.includes('alpi') || s.includes('via ferrata')) {
    if (precip_mm > 1) return { tone: 'bad', label: 'Rocher mouillé', detail: `${precip_mm.toFixed(1)} mm — annule la sortie` };
    if (wind_kmh > 40) return { tone: 'warning', label: 'Vent fort en paroi', detail: `${Math.round(wind_kmh)} km/h — sécurité à réévaluer` };
    if (temp_c >= 5 && temp_c <= 25) return { tone: 'good', label: 'Friction au top', detail: `${Math.round(temp_c)}°C — pattes sèches` };
    return { tone: 'neutral', label: 'Praticable', detail: `${Math.round(temp_c)}°C, ${Math.round(wind_kmh)} km/h` };
  }
  if (s.includes('ski') || s.includes('snowboard') || s.includes('raquette')) {
    if (temp_c < -2 && precip_mm > 2) return { tone: 'good', label: 'Neige fraîche !', detail: `${precip_mm.toFixed(1)} mm à ${Math.round(temp_c)}°C — jackpot poudreuse` };
    if (wind_kmh > 50) return { tone: 'warning', label: 'Vent tempétueux', detail: `${Math.round(wind_kmh)} km/h — risque de plaques à vent` };
    if (temp_c > 5) return { tone: 'warning', label: 'Neige lourde', detail: `${Math.round(temp_c)}°C — manteau transformé` };
    return { tone: 'neutral', label: 'Conditions hivernales', detail: `${Math.round(temp_c)}°C, vent ${Math.round(wind_kmh)} km/h` };
  }
  if (s.includes('vtt') || s.includes('gravel') || s.includes('velo') || s.includes('bike')) {
    if (precip_mm > 3) return { tone: 'warning', label: 'Sentiers boueux', detail: `${precip_mm.toFixed(1)} mm — privilégie le bitume` };
    if (wind_kmh > 35) return { tone: 'warning', label: 'Vent soutenu', detail: `${Math.round(wind_kmh)} km/h — prévois les retours face au vent` };
    return { tone: 'good', label: 'Roule-moi ça', detail: `${Math.round(temp_c)}°C, ${Math.round(wind_kmh)} km/h` };
  }

  // Fallback
  return {
    tone: precip_mm > 5 || wind_kmh > 40 ? 'warning' : 'good',
    label: precip_mm > 5 ? 'Pluie' : wind_kmh > 40 ? 'Venté' : 'Conditions clémentes',
    detail: `${Math.round(temp_c)}°C, vent ${Math.round(wind_kmh)} km/h`,
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = Number(url.searchParams.get('lat'));
  const lng = Number(url.searchParams.get('lng'));
  const sport = url.searchParams.get('sport') || '';

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: 'lat/lng invalides' }, { status: 400 });
  }

  try {
    const api = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}`
      + `&current=temperature_2m,wind_speed_10m,wind_gusts_10m,wind_direction_10m,precipitation,weather_code`
      + `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max`
      + `&forecast_days=3&timezone=auto&wind_speed_unit=kmh`;

    const r = await fetch(api, { next: { revalidate: 600 } });
    if (!r.ok) throw new Error(`Open-Meteo ${r.status}`);
    const data = await r.json();

    const cur = data.current || {};
    const wind_kmh = Number(cur.wind_speed_10m) || 0;
    const gust_kmh = Number(cur.wind_gusts_10m) || wind_kmh;
    const temp_c = Number(cur.temperature_2m) || 0;
    const precip_mm = Number(cur.precipitation) || 0;

    const status = judge(sport, wind_kmh, gust_kmh, temp_c, precip_mm);

    return NextResponse.json({
      current: {
        temp_c,
        wind_kmh,
        wind_kt: Math.round(wind_kmh / 1.852),
        gust_kmh,
        gust_kt: Math.round(gust_kmh / 1.852),
        wind_direction_deg: Number(cur.wind_direction_10m) || null,
        precip_mm,
        weather_code: cur.weather_code ?? null,
      },
      daily: data.daily || null,
      status,
      source: 'open-meteo',
      fetched_at: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Erreur météo',
      status: { tone: 'neutral', label: 'Météo indisponible', detail: 'Réessaie dans quelques instants' },
    }, { status: 502 });
  }
}
