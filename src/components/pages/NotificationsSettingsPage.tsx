'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import {
  CHANNEL_LABELS,
  loadPrefs,
  savePrefs,
  requestPermission,
  isNotificationSupported,
  notify,
  NotifPrefs,
  NotifChannel,
} from '@/lib/services/notifications-service';

export default function NotificationsSettingsPage() {
  const router = useRouter();
  const showToast = useStore(s => s.showToast);
  const [prefs, setPrefs] = useState<NotifPrefs | null>(null);
  const supported = isNotificationSupported();

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  if (!prefs) return null;

  const update = (patch: Partial<NotifPrefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    savePrefs(next);
  };

  const toggleChannel = (ch: NotifChannel) => {
    const next = { ...prefs, channels: { ...prefs.channels, [ch]: !prefs.channels[ch] } };
    setPrefs(next);
    savePrefs(next);
  };

  const handleEnable = async () => {
    if (!supported) {
      showToast('Ton navigateur ne supporte pas les notifications', 'warning', '⚠️');
      return;
    }
    if (prefs.permission !== 'granted') {
      const p = await requestPermission();
      if (p === 'granted') {
        update({ permission: p, enabled: true });
        showToast('Notifications activées ✓', 'success', '🔔');
      } else if (p === 'denied') {
        update({ permission: p, enabled: false });
        showToast('Permission refusée — va dans les réglages du navigateur', 'error', '🚫');
      } else {
        update({ permission: p });
      }
    } else {
      update({ enabled: !prefs.enabled });
      showToast(!prefs.enabled ? 'Notifications activées ✓' : 'Notifications pausées', 'info', '🔔');
    }
  };

  const handleTest = () => {
    const ok = notify(
      'weatherWindow',
      '🌞 Test Adventurer',
      'Si tu vois ça, les notifs fonctionnent — prêt à partir !',
    );
    if (!ok) {
      showToast('Test impossible — vérifie permission / canal actif', 'warning', '⚠️');
    } else {
      showToast('Notif test envoyée ✓', 'success', '🔔');
    }
  };

  const permLabel =
    prefs.permission === 'unsupported' ? 'Non supporté' :
    prefs.permission === 'granted' ? 'Autorisé' :
    prefs.permission === 'denied' ? 'Refusé' : 'À demander';

  const permColor =
    prefs.permission === 'granted' ? 'text-emerald-600' :
    prefs.permission === 'denied' ? 'text-red-500' :
    'text-amber-500';

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
        <div>
          <h1 className="text-lg font-bold text-[#1B4332]">🔔 Notifications</h1>
          <p className="text-xs text-gray-500">Alertes outdoor-smart</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Master switch */}
        <div className="bg-white rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-[#1B4332] text-sm">Activer les notifications</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Permission : <span className={permColor}>{permLabel}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleEnable}
              disabled={prefs.permission === 'unsupported'}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${
                prefs.enabled && prefs.permission === 'granted'
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : 'bg-[#F77F00] text-white hover:bg-[#D65A1A]'
              }`}
            >
              {prefs.enabled && prefs.permission === 'granted' ? '✓ Actives' : 'Activer'}
            </button>
          </div>
          {prefs.permission === 'granted' && prefs.enabled && (
            <button
              type="button"
              onClick={handleTest}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition"
            >
              🧪 Envoyer une notif de test
            </button>
          )}
          {prefs.permission === 'denied' && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">
              Les notifications ont été bloquées. Pour les réactiver, va dans les paramètres du navigateur → Site → Notifications → Autoriser pour ce site.
            </p>
          )}
          {!supported && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
              Ton navigateur ne supporte pas les notifications web. Essaie Chrome, Firefox ou Safari récent.
            </p>
          )}
        </div>

        {/* Channels */}
        <div className="bg-white rounded-2xl p-4 space-y-3 shadow-sm">
          <h2 className="font-bold text-[#1B4332] text-sm">🎯 Canaux</h2>
          <p className="text-xs text-gray-500 -mt-1">
            Choisis ce qui mérite de t'interrompre.
          </p>
          <div className="space-y-2">
            {(Object.keys(CHANNEL_LABELS) as NotifChannel[]).map((ch) => {
              const info = CHANNEL_LABELS[ch];
              const active = prefs.channels[ch];
              return (
                <button
                  key={ch}
                  type="button"
                  onClick={() => toggleChannel(ch)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border transition text-left ${
                    active
                      ? 'bg-emerald-50 border-emerald-300'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-2xl flex-shrink-0" aria-hidden="true">{info.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-[#1B4332]">{info.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{info.desc}</div>
                  </div>
                  <div
                    className={`flex-shrink-0 w-10 h-6 rounded-full relative transition ${
                      active ? 'bg-[#F77F00]' : 'bg-gray-300'
                    }`}
                    aria-hidden="true"
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition ${
                        active ? 'left-[18px]' : 'left-0.5'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Seuils */}
        <div className="bg-white rounded-2xl p-4 space-y-3 shadow-sm">
          <h2 className="font-bold text-[#1B4332] text-sm">⚙️ Seuils d'alerte</h2>

          <label className="block">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-700">Vent minimum alerté</span>
              <span className="text-sm font-bold text-[#F77F00]">{prefs.minWindKnots} nds</span>
            </div>
            <input
              type="range"
              min="8"
              max="35"
              step="1"
              value={prefs.minWindKnots ?? 15}
              onChange={(e) => update({ minWindKnots: Number(e.target.value) })}
              className="w-full accent-[#F77F00]"
            />
            <p className="text-xs text-gray-500 mt-0.5">En-dessous, pas d'alerte fenêtre météo</p>
          </label>

          <label className="block">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-700">Risque avalanche max toléré</span>
              <span className="text-sm font-bold text-[#F77F00]">{prefs.maxAvalancheRisk}/5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={prefs.maxAvalancheRisk ?? 3}
              onChange={(e) => update({ maxAvalancheRisk: Number(e.target.value) })}
              className="w-full accent-[#F77F00]"
            />
            <p className="text-xs text-gray-500 mt-0.5">Au-dessus, tu reçois une alerte BRA</p>
          </label>
        </div>

        {/* Quiet hours */}
        <div className="bg-white rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#1B4332] text-sm">🌙 Ne pas déranger</h2>
            <button
              type="button"
              onClick={() =>
                update({ quietHours: prefs.quietHours ? null : { start: 22, end: 7 } })
              }
              className={`w-10 h-6 rounded-full relative transition ${
                prefs.quietHours ? 'bg-[#F77F00]' : 'bg-gray-300'
              }`}
              aria-label={prefs.quietHours ? 'Désactiver plage calme' : 'Activer plage calme'}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition ${
                  prefs.quietHours ? 'left-[18px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>
          {prefs.quietHours && (
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs text-gray-500">Début</span>
                <select
                  value={prefs.quietHours.start}
                  onChange={(e) =>
                    update({
                      quietHours: {
                        start: Number(e.target.value),
                        end: prefs.quietHours!.end,
                      },
                    })
                  }
                  className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{i.toString().padStart(2, '0')}h00</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-gray-500">Fin</span>
                <select
                  value={prefs.quietHours.end}
                  onChange={(e) =>
                    update({
                      quietHours: {
                        start: prefs.quietHours!.start,
                        end: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{i.toString().padStart(2, '0')}h00</option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-500 text-center px-4 pt-2">
          Les notifications sont locales à cet appareil. Les alertes temps réel (push serveur) arrivent bientôt — tes préférences sont déjà sauvegardées.
        </p>
      </div>
    </div>
  );
}
