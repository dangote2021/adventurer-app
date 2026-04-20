'use client';

import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

export default function WelcomeModal() {
  const { hasSeenWelcome, markWelcomeSeen, language } = useStore();

  if (hasSeenWelcome) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes welcomeFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes welcomeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        style={{ animation: 'welcomeFadeIn 0.3s ease-in-out' }}
      >
        <div
          className="bg-[var(--card)] rounded-3xl p-6 sm:p-8 max-w-[430px] w-full shadow-2xl overflow-y-auto max-h-[90vh]"
          style={{ animation: 'welcomeSlideUp 0.4s ease-out' }}
        >
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {t('welcome.title', language)}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-gray-300 mb-6">
            {t('welcome.subtitle', language)}
          </p>

          {/* Adventure of the Day Card */}
          <div className="bg-[var(--bg)] rounded-2xl p-4 sm:p-5 mb-6 border border-[var(--accent)]/20">
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--accent)] mb-2">
              {t('welcome.adventureOfDay', language)}
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              {t('welcome.adventureDesc', language)}
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-3 mb-8">
            {(['welcome.features1', 'welcome.features2', 'welcome.features3', 'welcome.features4'] as const).map((key) => {
              const text = t(key, language);
              const emoji = text.split(' ')[0];
              const rest = text.split(' ').slice(1).join(' ');
              return (
                <div key={key} className="flex items-start gap-3 bg-[var(--bg)]/50 rounded-xl p-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">{emoji}</span>
                  <p className="text-sm text-gray-300 flex-1">{rest}</p>
                </div>
              );
            })}
          </div>

          {/* CTA Button */}
          <button
            onClick={() => markWelcomeSeen()}
            className="w-full bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200"
          >
            {t('welcome.gotIt', language)}
          </button>
        </div>
      </div>
    </>
  );
}
