'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

export default function TopBar() {
  const { userName, userAvatar, setPage, closeSubPage, showToast, language } = useStore();
  const [notifsSeen, setNotifsSeen] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const handleSOSClose = () => setShowSOS(false);

  const handleSharePosition = () => {
    showToast(t('topbar.positionShared', language), 'success', '📍');
    handleSOSClose();
  };

  return (
    <>
      <header
        className="sticky top-0 z-50 bg-[var(--bg)]/95 backdrop-blur-sm border-b border-white/5 px-4 py-3 flex items-center justify-between"
        role="banner"
      >
        <button
          type="button"
          className="flex items-center gap-2 hover:opacity-80 transition"
          onClick={() => { closeSubPage(); setPage('home'); }}
          aria-label="Retour à l'accueil"
        >
          <img src="/logo-icon.svg" alt="Adventurer" className="w-10 h-10 rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <div className="text-left">
            <h1 className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
              Adventurer
            </h1>
            <p className="text-xs text-gray-500">{t('topbar.tagline', language)}</p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center hover:bg-red-800/40 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
            onClick={() => setShowSOS(true)}
            aria-label="SOS Urgence"
          >
            🆘
          </button>

          <button
            type="button"
            className="relative w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
            onClick={() => { setShowNotifs(!showNotifs); setNotifsSeen(true); }}
            aria-expanded={showNotifs}
          >
            🔔
            {!notifsSeen && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-orange-500 rounded-full" />}
          </button>

          <button
            type="button"
            className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center hover:bg-purple-800/40 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-500 overflow-hidden"
            onClick={() => setPage('profile')}
            aria-label={`Mon profil — ${userName || 'Utilisateur'}`}
          >
            {typeof userAvatar === 'string' && userAvatar.startsWith('http') ? (
              <img src={userAvatar} alt={userName || 'Profil'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (userAvatar || '👤')}
          </button>
        </div>
      </header>

      {/* SOS Modal */}
      {showSOS && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" role="dialog" aria-modal="true" onClick={handleSOSClose}>
          <div className="bg-[var(--card)] rounded-2xl p-6 max-w-sm w-full space-y-4 border border-white/10" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-red-400 text-center">🆘 {t('topbar.sos', language)}</h2>
            <p className="text-gray-300 text-center text-sm">{t('topbar.sosDesc', language)}</p>
            <div className="space-y-3">
              <a href="tel:112" className="block w-full py-3 bg-red-600 text-white text-center rounded-xl font-bold text-lg hover:bg-red-500 transition">📞 {t('topbar.call112', language)}</a>
              <a href="tel:15" className="block w-full py-3 bg-orange-600 text-white text-center rounded-xl font-bold hover:bg-orange-500 transition">🚑 {t('topbar.callSamu', language)}</a>
              <button type="button" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition" onClick={handleSharePosition}>📍 {t('topbar.sharePosition', language)}</button>
            </div>
            <button type="button" className="w-full py-2 text-gray-400 hover:text-white transition font-medium" onClick={handleSOSClose}>{t('topbar.close', language)}</button>
          </div>
        </div>
      )}

      {/* Notifications Dropdown */}
      {showNotifs && (
        <div className="fixed top-16 right-4 w-72 bg-[var(--card)] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-white/5 bg-white/5">
            <h3 className="font-semibold text-sm">{t('topbar.notifications', language)}</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {[
              { id: 1, icon: '🏃', text: t('notifications.trailPlanned', language), time: t('time.hours2', language) },
              { id: 2, icon: '🪁', text: t('notifications.windForecast', language), time: t('time.hours4', language) },
              { id: 3, icon: '🧗', text: t('notifications.newChallenge', language), time: t('time.yesterday', language) },
            ].map(n => (
              <button key={n.id} type="button" className="w-full p-3 border-b border-white/5 hover:bg-white/5 transition flex gap-3 text-left" onClick={() => setShowNotifs(false)}>
                <span className="text-xl flex-shrink-0">{n.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-200">{n.text}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.time}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="p-3 border-t border-white/5 bg-white/5 text-center">
            <button type="button" className="text-xs text-blue-400 hover:text-blue-300 transition" onClick={() => setShowNotifs(false)}>{t('topbar.allNotifications', language)}</button>
          </div>
        </div>
      )}
    </>
  );
}
