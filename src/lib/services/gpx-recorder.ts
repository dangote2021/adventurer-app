/**
 * GPX Recorder (B-prop5)
 * Enregistre les traces GPS pendant une sortie et exporte en GPX 1.1.
 * Utilise navigator.geolocation.watchPosition avec enableHighAccuracy.
 */

export interface TrackPoint {
  lat: number;
  lng: number;
  ele?: number;
  time: string; // ISO
  accuracy?: number;
  speed?: number; // m/s
}

export interface TrackMetrics {
  durationSec: number;
  distanceKm: number;
  elevationGain: number;
  avgSpeedKmh: number;
  maxSpeedKmh: number;
  points: number;
}

function haversineKm(a: TrackPoint, b: TrackPoint): number {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function computeMetrics(points: TrackPoint[]): TrackMetrics {
  if (points.length < 2) {
    return { durationSec: 0, distanceKm: 0, elevationGain: 0, avgSpeedKmh: 0, maxSpeedKmh: 0, points: points.length };
  }
  let distance = 0;
  let gain = 0;
  let maxSpeed = 0;
  for (let i = 1; i < points.length; i++) {
    const d = haversineKm(points[i - 1], points[i]);
    distance += d;
    if (points[i].ele != null && points[i - 1].ele != null) {
      const dEle = (points[i].ele as number) - (points[i - 1].ele as number);
      if (dEle > 0) gain += dEle;
    }
    if (points[i].speed != null) {
      const s = ((points[i].speed as number) * 3600) / 1000;
      if (s > maxSpeed) maxSpeed = s;
    }
  }
  const t0 = new Date(points[0].time).getTime();
  const t1 = new Date(points[points.length - 1].time).getTime();
  const durationSec = Math.max(1, Math.round((t1 - t0) / 1000));
  const avgSpeedKmh = (distance / (durationSec / 3600));
  return {
    durationSec,
    distanceKm: Math.round(distance * 100) / 100,
    elevationGain: Math.round(gain),
    avgSpeedKmh: Math.round(avgSpeedKmh * 10) / 10,
    maxSpeedKmh: Math.round(maxSpeed * 10) / 10,
    points: points.length,
  };
}

export function pointsToGpx(points: TrackPoint[], name: string, sport: string): string {
  const header = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Adventurer" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escape(name)}</name>
    <time>${new Date().toISOString()}</time>
    <keywords>${escape(sport)}</keywords>
  </metadata>
  <trk>
    <name>${escape(name)}</name>
    <type>${escape(sport)}</type>
    <trkseg>
`;
  const body = points
    .map(p => {
      const ele = p.ele != null ? `      <ele>${p.ele}</ele>\n` : '';
      return `    <trkpt lat="${p.lat}" lon="${p.lng}">\n${ele}      <time>${p.time}</time>\n    </trkpt>`;
    })
    .join('\n');
  const footer = `
    </trkseg>
  </trk>
</gpx>
`;
  return header + body + footer;
}

function escape(s: string): string {
  return s.replace(/[<>&"']/g, c =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c] as string),
  );
}

export function downloadGpx(points: TrackPoint[], name: string, sport: string): void {
  if (typeof window === 'undefined') return;
  const content = pointsToGpx(points, name, sport);
  const blob = new Blob([content], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.replace(/[^a-z0-9\-_]+/gi, '_')}.gpx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Crée un recorder GPS. onUpdate est rappelé à chaque nouveau point.
 */
export class GpsRecorder {
  private watchId: number | null = null;
  private points: TrackPoint[] = [];

  constructor(private onUpdate: (points: TrackPoint[]) => void) {}

  start(): boolean {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) return false;
    if (this.watchId != null) return true;
    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const pt: TrackPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          ele: pos.coords.altitude ?? undefined,
          time: new Date(pos.timestamp).toISOString(),
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed ?? undefined,
        };
        this.points.push(pt);
        this.onUpdate([...this.points]);
      },
      () => { /* silent */ },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 },
    );
    return true;
  }

  stop(): TrackPoint[] {
    if (this.watchId != null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    return [...this.points];
  }

  reset(): void {
    this.points = [];
    this.onUpdate([]);
  }

  getPoints(): TrackPoint[] {
    return [...this.points];
  }

  isActive(): boolean {
    return this.watchId != null;
  }
}
