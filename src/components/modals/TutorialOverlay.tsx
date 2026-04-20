'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

const STEPS = [
  { emoji: '🗺️', key: 'step1' },
  { emoji: '🧠', key: 'step2' },
  { emoji: '🎯', key: 'step3' },
  { emoji: '👤', key: 'step4' },
] as const;

export default function TutorialOverlay() {
  const { hasSeenTutorial, markTutorialSeen, language } = useStore();
  const [step, setStep] = useState(0);

  if (hasSeenTutorial) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      markTutorialSeen();
    } else {
      setStep(step + 1);
    }
  };

  const handleSkip = () => markTutorialSeen();

  return (
    <div className="fixed inset-0 z-[300] bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      role="dialog" aria-modal="true" aria-labelledby="tuto-title">
      <div className="bg-[var(--card)] w-full max-w-[420px] rounded-3xl overflow-hidden shadow-2xl">
        <div className="relative h-32 bg-gradient-to-br from-[var(--accent)]/40 to-purple-900/30 flex items-center justify-center">
          <span className="text-7xl">{current.emoji}</span>
          <button type="button" onClick={handleSkip}
            className="absolute top-3 right-3 text-xs text-white/70 hover:text-white px-3 py-1.5 bg-black/30 rounded-full backdrop-blur-sm">
            {t('tuto.skip', language)}
          </button>
        </div>
        <div className="p-6 space-y-4">
          {step === 0 && (
            <p className="text-xs uppercase tracking-wide text-[var(--accent)] font-semibold">
              {t('tuto.welcome', language)}
            </p>
          )}
          <h2 id="tuto-title" className="text-xl font-bold">{t(`tuto.${current.key}.title`, language)}</h2>
          <p className="text-sm text-gray-300 leading-relaxed">{t(`tuto.${current.key}.body`, language)}</p>

          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <span key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === step ? 'bg-[var(--accent)] w-6' : 'bg-white/20'}`} />
              ))}
            </div>
            <button type="button" onClick={handleNext}
              className="px-5 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-bold hover:opacity-90">
              {isLast ? t('tuto.done', language) : t('tuto.next', language)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
