'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import {
  GpsRecorder,
  TrackPoint,
  computeMetrics,
  downloadGpx,
} from '@/lib/services/gpx-recorder';

type RecState = 'idle' | 'recording' | 'paused' | 'finished';

export default function TrackingPage() {
  const router = useRouter();
  const selectedSports = useStore(s => s.selectedSports);
  const logActivity = useStore(s => s.logActivity);
  const showToast = useStore(s => s.showToast);
  const language = useStore(s => s.language);

  const [state, setState] = useState<RecState>('idle');
  const [points, setPoints] = useState<TrackPoint[]>([]);
  const [sport, setSport] = useState<string>(selectedSports[0] || 'Trail');
  const [title, setTitle] = useState<string>('');
  const recorderRef = useRef<GpsRecorder | null>(null);
  const [elapsed, setElapsed] = useState<number>(0);
  const startTsRef = useRef<number>(0);
  const tickRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    recorderRef.current = new GpsRecorder(setPoints);
    return () => {
      recorderRef.current?.stop();
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  const metrics = useMemo(() => computeMetrics(points), [points]);

  const handleStart = () => {
    const ok = recorderRef.current?.start();
    if (!ok) {
      showToast(t('tracking.gpsUnavailable', language), 'warning', '📡');
      return;
    }
    startTsRef.current = Date.now();
    setElapsed(0);
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setElapsed(Math.round((Date.now() - startTsRef.current) / 1000));
    }, 1000);
    setState('recording');
    showToast(t('tracking.recordingStarted', language), 'success', '🟢');
  };

  const handlePause = () => {
    recorderRef.current?.stop();
    if (tickRef.current) clearInterval(tickRef.current);
    setState('paused');
  };

  const handleResume = () => {
    recorderRef.current?.start();
    if (tickRef.current) clearInterval(tickRef.current);
    const base = Date.now() - elapsed * 1000;
    startTsRef.current = base;
    tickRef.current = setInterval(() => {
      setElapsed(Math.round((Date.now() - startTsRef.current) / 1000));
    }, 1000);
    setState('recording');
  };

  const handleFinish = () => {
    recorderRef.current?.stop();
    if (tickRef.current) clearInterval(tickRef.current);
    setState('finished');
  };

  const handleExport = () => {
    if (points.length < 2) {
      showToast(t('tracking.notEnoughPoints', language), 'warning', '📍');
      return;
    }
    const name = title.trim() || `Adventurer-${sport}-${new Date().toISOString().slice(0, 10)}`;
    downloadGpx(points, name, sport);
    showToast(t('tracking.gpxExported', language), 'success', '📥');
  };

  const handleSaveToLog = () => {
    const locale = language === 'fr' ? 'fr-FR' : 'en-US';
    const name = title.trim() || `${sport} — ${new Date().toLocaleDateString(locale)}`;
    logActivity({
      sport,
      title: name,
      distance: `${metrics.distanceKm} km`,
      dplus: `${metrics.elevationGain}m`,
      duration: formatDuration(metrics.durationSec),
    });
    showToast(t('tracking.activityAdded', language), 'success', '📓');
  };

  const handleReset = () => {
    recorderRef.current?.reset();
    setPoints([]);
    setElapsed(0);
    setTitle('');
    setState('idle');
  };

  const sports = selectedSports.length > 0 ? selectedSports : ['Trail', 'Rando', 'Vélo', 'Kitesurf', 'Ski'];
  const lastPoint = points[points.length - 1];
  const accuracyLabel = lastPoint?.accuracy
    ? lastPoint.accuracy < 15 ? '🟢 Excellent' : lastPoint.accuracy < 40 ? '🟡 Bon' : '🔴 Faible'
    : 'En attente…';

  return (
    <div className="min-h-screen bg-[#FEFAE0] max-w-[500px] mx-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-[#FEFAE0] z-10 px-4 py-3 border-b border-[#DDA15E]/30 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-[#2D6A4F]/10 flex items-center justify-center hover:bg-[#2D6A4F]/20 transition"
          aria-label="Retour"
        >
          ←
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-[#1B4332]">📡 Tracker GPS</h1>
          <p className="text-xs text-gray-500">Enregistre ta trace, exporte en GPX</p>
        </div>
        <div className="text-xs text-gray-600">{accuracyLabel}</div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Chrono principal */}
        <div className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white rounded-3xl p-6 text-center shadow-lg">
          <div className="text-5xl font-black tabular-nums" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatDuration(elapsed)}
          </div>
          <div className="mt-2 text-xs opacity-80">
            {state === 'idle' && 'Prêt à partir'}
            {state === 'recording' && '🟢 Enregistrement en cours'}
            {state === 'paused' && '⏸️ En pause'}
            {state === 'finished' && '✅ Sortie terminée'}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <Metric label="Distance" value={`${metrics.distanceKm.toFixed(2)} km`} icon="🏃" />
          <Metric label="D+" value={`${metrics.elevationGain}m`} icon="⛰️" />
          <Metric label="Allure" value={`${metrics.avgSpeedKmh} km/h`} icon="💨" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Metric label="Vitesse max" value={`${metrics.maxSpeedKmh} km/h`} icon="⚡" small />
          <Metric label="Points GPS" value={`${metrics.points}`} icon="📍" small />
        </div>

        {/* Controls */}
        {state === 'idle' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Sport</label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                {sports.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button
              type="button"
              onClick={handleStart}
              className="w-full py-4 bg-[#F77F00] text-white rounded-2xl font-bold text-lg shadow hover:bg-[#D65A1A] transition"
            >
              🟢 Démarrer
            </button>
          </div>
        )}

        {state === 'recording' && (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handlePause}
              className="py-4 bg-amber-100 text-amber-800 border border-amber-300 rounded-2xl font-bold transition hover:bg-amber-200"
            >
              ⏸️ Pause
            </button>
            <button
              type="button"
              onClick={handleFinish}
              className="py-4 bg-red-100 text-red-700 border border-red-300 rounded-2xl font-bold transition hover:bg-red-200"
            >
              ⏹ Terminer
            </button>
          </div>
        )}

        {state === 'paused' && (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleResume}
              className="py-4 bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-2xl font-bold transition hover:bg-emerald-200"
            >
              ▶️ Reprendre
            </button>
            <button
              type="button"
              onClick={handleFinish}
              className="py-4 bg-red-100 text-red-700 border border-red-300 rounded-2xl font-bold transition hover:bg-red-200"
            >
              ⏹ Terminer
            </button>
          </div>
        )}

        {state === 'finished' && (
          <div className="space-y-3">
            <label className="block">
              <span className="block text-sm text-gray-700 mb-1">Nom de la sortie</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`${sport} — ${new Date().toLocaleDateString('fr-FR')}`}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExport}
                className="py-3 bg-[#2D6A4F] text-white rounded-xl font-medium transition hover:bg-[#1B4332]"
              >
                📥 Export GPX
              </button>
              <button
                type="button"
                onClick={handleSaveToLog}
                className="py-3 bg-[#F77F00] text-white rounded-xl font-medium transition hover:bg-[#D65A1A]"
              >
                📓 Ajouter au carnet
              </button>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-2 bg-gray-100 text-gray-600 rounded-xl text-sm transition hover:bg-gray-200"
            >
              🔄 Nouvelle sortie
            </button>
          </div>
        )}

        {/* Tips */}
        <div className="bg-[#FEFAE0] border border-[#DDA15E]/40 rounded-xl p-3 text-xs text-gray-600 space-y-1">
          <div className="font-medium text-gray-800">💡 Conseils terrain</div>
          <div>• Garde le téléphone écran allumé pour un tracking précis.</div>
          <div>• Altitude GPS = ±10m, corrige plus tard avec les données cartographiques.</div>
          <div>• En 4G/5G faible, les points s'enregistrent quand même (hors-ligne OK).</div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, icon, small }: { label: string; value: string; icon: string; small?: boolean }) {
  return (
    <div className={`bg-white rounded-xl p-3 text-center shadow-sm ${small ? 'py-2' : ''}`}>
      <div className="text-xs text-gray-500">{icon} {label}</div>
      <div className={`font-bold text-[#1B4332] ${small ? 'text-sm' : 'text-lg'} mt-0.5`}>{value}</div>
    </div>
  );
}

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
