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
    ? lastPoint.accuracy < 15 ? t('tracking.accuracyExcellent', language) : lastPoint.accuracy < 40 ? t('tracking.accuracyGood', language) : t('tracking.accuracyWeak', language)
    : t('tracking.waiting', language);

  return (
    <div className="min-h-screen bg-[#FEFAE0] max-w-[500px] mx-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-[#FEFAE0] z-10 px-4 py-3 border-b border-[#DDA15E]/30 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-[#2D6A4F]/10 flex items-center justify-center hover:bg-[#2D6A4F]/20 transition"
          aria-label={t('tracking.back', language)}
        >
          ←
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <h1 className="text-lg font-bold text-[#1B4332]">📡 {t('tracking.title', language)}</h1>
            <span className="text-[8px] font-black tracking-widest bg-gradient-to-r from-[#F77F00] to-[#FFB703] text-[#1B4332] px-1.5 py-0.5 rounded-full shadow-sm">BETA</span>
          </div>
          <p className="text-xs text-gray-500">{t('tracking.subtitle', language)}</p>
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
            {state === 'idle' && t('tracking.stateIdle', language)}
            {state === 'recording' && t('tracking.stateRecording', language)}
            {state === 'paused' && t('tracking.statePaused', language)}
            {state === 'finished' && t('tracking.stateFinished', language)}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <Metric label={t('tracking.distance', language)} value={`${metrics.distanceKm.toFixed(2)} km`} icon="🏃" />
          <Metric label={t('tracking.elevation', language)} value={`${metrics.elevationGain}m`} icon="⛰️" />
          <Metric label={t('tracking.pace', language)} value={`${metrics.avgSpeedKmh} km/h`} icon="💨" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Metric label={t('tracking.maxSpeed', language)} value={`${metrics.maxSpeedKmh} km/h`} icon="⚡" small />
          <Metric label={t('tracking.gpsPoints', language)} value={`${metrics.points}`} icon="📍" small />
        </div>

        {/* Controls */}
        {state === 'idle' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">{t('tracking.sport', language)}</label>
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
              {t('tracking.start', language)}
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
              {t('tracking.pause', language)}
            </button>
            <button
              type="button"
              onClick={handleFinish}
              className="py-4 bg-red-100 text-red-700 border border-red-300 rounded-2xl font-bold transition hover:bg-red-200"
            >
              {t('tracking.finish', language)}
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
              {t('tracking.resume', language)}
            </button>
            <button
              type="button"
              onClick={handleFinish}
              className="py-4 bg-red-100 text-red-700 border border-red-300 rounded-2xl font-bold transition hover:bg-red-200"
            >
              {t('tracking.finish', language)}
            </button>
          </div>
        )}

        {state === 'finished' && (
          <div className="space-y-3">
            <label className="block">
              <span className="block text-sm text-gray-700 mb-1">{t('tracking.outingName', language)}</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`${sport} — ${new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}`}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExport}
                className="py-3 bg-[#2D6A4F] text-white rounded-xl font-medium transition hover:bg-[#1B4332]"
              >
                {t('tracking.exportGpx', language)}
              </button>
              <button
                type="button"
                onClick={handleSaveToLog}
                className="py-3 bg-[#F77F00] text-white rounded-xl font-medium transition hover:bg-[#D65A1A]"
              >
                {t('tracking.addToLogbook', language)}
              </button>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-2 bg-gray-100 text-gray-600 rounded-xl text-sm transition hover:bg-gray-200"
            >
              {t('tracking.newOuting', language)}
            </button>
          </div>
        )}

        {/* Tips */}
        <div className="bg-[#FEFAE0] border border-[#DDA15E]/40 rounded-xl p-3 text-xs text-gray-600 space-y-1">
          <div className="font-medium text-gray-800">{t('tracking.tipsTitle', language)}</div>
          <div>{t('tracking.tip1', language)}</div>
          <div>{t('tracking.tip2', language)}</div>
          <div>{t('tracking.tip3', language)}</div>
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
