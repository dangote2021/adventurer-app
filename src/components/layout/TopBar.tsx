'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

export default function TopBar() {
  const {
    userName,
    userAvatar,
    setPage,
    closeSubPage,
    language,
    inAppNotifications,
    markNotificationRead,
  } = useStore();
  const [showNotifs, setShowNotifs] = useState(false);

  const unreadCount = inAppNotifications.filter(n => !n.read).length;

  // Format relatif simple ("il y a 2 h", "hier") sans dépendre d'une lib date.
  const relTime = (iso: string): string => {
    try {
      const d = new Date(iso).getTime();
      const diffMin = Math.max(0, Math.round((Date.now() - d) / 60000));
      if (diffMin < 60) {
        return language === 'en'
          ? `${diffMin} min ago`
          : `il y a ${diffMin} min`;
      }
      const h = Math.round(diffMin / 60);
      if (h < 24) {
        return language === 'en' ? `${h}h ago` : `il y a ${h} h`;
      }
      const days = Math.round(h / 24);
      if (days === 1) return language === 'en' ? 'yesterday' : 'hier';
      return language === 'en' ? `${days}d ago` : `il y a ${days} j`;
    } catch {
      return '';
    }
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
          aria-label={language === 'en' ? 'Back to home' : "Retour à l'accueil"}
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
          {/* SOS retiré : tant qu'on n'a pas un vrai canal de partage de
              position (SMS/email), on ne veut pas faire la promesse. Voir
              décision panel #82. Le 112 reste accessible directement depuis
              le téléphone et — quand on aura un backend dédié — on remettra
              un bouton qui *fait vraiment quelque chose*. */}

          <button
            type="button"
            className="relative w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
            onClick={() => setShowNotifs(v => !v)}
            aria-expanded={showNotifs}
            aria-label={t('topbar.notifications', language)}
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-[10px] text-white font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center hover:bg-purple-800/40 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-500 overflow-hidden"
            onClick={() => setPage('profile')}
            aria-label={`${language === 'en' ? 'My profile' : 'Mon profil'} — ${userName || (language === 'en' ? 'User' : 'Utilisateur')}`}
          >
            {typeof userAvatar === 'string' && userAvatar.startsWith('http') ? (
              <img src={userAvatar} alt={userName || 'Profil'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (userAvatar || '👤')}
          </button>
        </div>
      </header>

      {/* Notifications Dropdown — vraies notifs uniquement. Empty state propre
          si aucune notif (au lieu des 3 hardcodées qui ignoraient les sports
          cochés). */}
      {showNotifs && (
        <div className="fixed top-16 right-4 w-72 bg-[var(--card)] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-white/5 bg-white/5">
            <h3 className="font-semibold text-sm">{t('topbar.notifications', language)}</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {inAppNotifications.length === 0 ? (
              <div className="p-6 text-center">
                <div className="text-3xl mb-2">🌬️</div>
                <p className="text-sm text-gray-300 font-medium mb-1">
                  {language === 'en' ? 'All quiet for now' : 'Tout est calme pour le moment'}
                </p>
                <p className="text-xs text-gray-500">
                  {language === 'en'
                    ? "We'll ping you when there's wind, weather or a challenge for you."
                    : "On te ping dès qu'y a du vent, de la météo ou un défi pour toi."}
                </p>
              </div>
            ) : (
              inAppNotifications.slice(0, 10).map(n => (
                <button
                  key={n.id}
                  type="button"
                  className={`w-full p-3 border-b border-white/5 hover:bg-white/5 transition flex gap-3 text-left ${n.read ? '' : 'bg-blue-500/5'}`}
                  onClick={() => { markNotificationRead(n.id); setShowNotifs(false); }}
                >
                  <span className="text-xl flex-shrink-0">{n.icon || '🔔'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-200">{n.message}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{relTime(n.createdAt)}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 mt-1.5 rounded-full bg-orange-500 flex-shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
