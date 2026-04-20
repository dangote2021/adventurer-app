'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

export default function CookieBanner() {
  const { setGDPRConsent, setSubPage, language } = useStore();
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const handleAcceptAll = () => {
    setGDPRConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      consentDate: new Date().toISOString(),
      consentVersion: '1.0',
    });
  };

  const handleAcceptSelected = () => {
    setGDPRConsent({
      necessary: true,
      analytics,
      marketing,
      consentDate: new Date().toISOString(),
      consentVersion: '1.0',
    });
  };

  const handleRejectAll = () => {
    setGDPRConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      consentDate: new Date().toISOString(),
      consentVersion: '1.0',
    });
  };

  const handleNavigateToPrivacy = () => {
    setSubPage('privacy');
  };

  const handleNavigateToCGU = () => {
    setSubPage('cgu');
  };

  const toggleAnalytics = () => {
    setAnalytics(!analytics);
  };

  const toggleMarketing = () => {
    setMarketing(!marketing);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[200] bg-[var(--card)] border-t border-white/10 p-4 shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="Dialogue de consentement aux cookies - Gestion de la vie privée"
      aria-describedby="cookie-description"
    >
      <div className="max-w-[430px] mx-auto space-y-3">
        {/* Title */}
        <h3
          className="font-bold text-lg"
        >
          🍪 {t('cookie.title', language)}
        </h3>

        {/* Description */}
        <p
          className="text-sm text-gray-300"
          id="cookie-description"
        >
          {t('cookie.description', language)}
        </p>

        {/* Details Section */}
        {showDetails && (
          <div
            className="space-y-3 bg-white/5 rounded-xl p-3 border border-white/10"
            role="region"
            aria-label="Paramètres détaillés des cookies"
          >
            {/* Necessary Cookies (Always Active) */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p
                  className="font-medium text-sm"
                >
                  {t('cookie.necessary', language)}
                </p>
                <p
                  className="text-sm text-gray-400"
                >
                  {t('cookie.necessaryDesc', language)}
                </p>
              </div>
              <div
                className="w-10 h-5 bg-green-600 rounded-full flex items-center justify-end px-0.5 flex-shrink-0"
                aria-label="Cookies nécessaires toujours activés"
                role="img"
              >
                <div className="w-4 h-4 bg-white rounded-full" />
              </div>
            </div>

            {/* Analytics Cookies Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p
                  className="font-medium text-sm"
                >
                  {t('cookie.analytics', language)}
                </p>
                <p
                  className="text-sm text-gray-400"
                >
                  {t('cookie.analyticsDesc', language)}
                </p>
              </div>
              <button
                type="button"
                className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-all duration-200 flex-shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${
                  analytics ? 'bg-green-600 justify-end' : 'bg-gray-600 justify-start'
                }`}
                onClick={toggleAnalytics}
                aria-label={`Cookies analytiques: ${analytics ? 'activés' : 'désactivés'}`}
                aria-pressed={analytics}
                role="switch"
              >
                <div className="w-4 h-4 bg-white rounded-full transition-transform duration-200" />
              </button>
            </div>

            {/* Marketing Cookies Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p
                  className="font-medium text-sm"
                >
                  {t('cookie.marketing', language)}
                </p>
                <p
                  className="text-sm text-gray-400"
                >
                  {t('cookie.marketingDesc', language)}
                </p>
              </div>
              <button
                type="button"
                className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-all duration-200 flex-shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${
                  marketing ? 'bg-green-600 justify-end' : 'bg-gray-600 justify-start'
                }`}
                onClick={toggleMarketing}
                aria-label={`Cookies marketing: ${marketing ? 'activés' : 'désactivés'}`}
                aria-pressed={marketing}
                role="switch"
              >
                <div className="w-4 h-4 bg-white rounded-full transition-transform duration-200" />
              </button>
            </div>
          </div>
        )}

        {/* Buttons Section */}
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Actions de consentement">
          {!showDetails ? (
            <>
              {/* Customize Button */}
              <button
                type="button"
                className="flex-1 min-w-[100px] py-2.5 bg-white/10 text-white rounded-xl font-medium text-sm hover:bg-white/15 active:bg-white/20 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                onClick={() => setShowDetails(true)}
                aria-label="Afficher les paramètres détaillés des cookies"
              >
                {t('cookie.customize', language)}
              </button>

              {/* Reject Button */}
              <button
                type="button"
                className="flex-1 min-w-[100px] py-2.5 bg-white/10 text-white rounded-xl font-medium text-sm hover:bg-white/15 active:bg-white/20 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
                onClick={handleRejectAll}
                aria-label="Refuser tous les cookies optionnels - Seuls les cookies nécessaires seront utilisés"
              >
                {t('cookie.reject', language)}
              </button>

              {/* Accept All Button */}
              <button
                type="button"
                className="flex-1 min-w-[100px] py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-500 active:bg-green-700 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400"
                onClick={handleAcceptAll}
                aria-label="Accepter tous les cookies - Cookies nécessaires, analytiques et marketing"
              >
                {t('cookie.accept', language)}
              </button>
            </>
          ) : (
            <>
              {/* Reject All Button (Details View) */}
              <button
                type="button"
                className="flex-1 min-w-[100px] py-2.5 bg-white/10 text-white rounded-xl font-medium text-sm hover:bg-white/15 active:bg-white/20 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
                onClick={handleRejectAll}
                aria-label="Refuser tous les cookies optionnels"
              >
                {t('cookie.rejectAll', language)}
              </button>

              {/* Confirm Choices Button */}
              <button
                type="button"
                className="flex-1 min-w-[100px] py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-500 active:bg-green-700 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400"
                onClick={handleAcceptSelected}
                aria-label={`Confirmer mes choix - Cookies nécessaires${analytics ? ', analytiques' : ''}${marketing ? ', marketing' : ''}`}
              >
                {t('cookie.confirm', language)}
              </button>
            </>
          )}
        </div>

        {/* Footer Links */}
        <div
          className="flex justify-center gap-4 flex-wrap pt-2 border-t border-white/10"
          role="contentinfo"
        >
          <button
            type="button"
            className="text-xs text-gray-500 hover:text-gray-300 active:text-gray-200 transition underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
            onClick={handleNavigateToPrivacy}
            aria-label="Lire la politique de confidentialité"
          >
            {t('cookie.privacy', language)}
          </button>

          <button
            type="button"
            className="text-xs text-gray-500 hover:text-gray-300 active:text-gray-200 transition underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
            onClick={handleNavigateToCGU}
            aria-label="Lire les conditions d'utilisation générale"
          >
            {t('cookie.cgu', language)}
          </button>
        </div>
      </div>
    </div>
  );
}
