'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Adventurer] Unhandled error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6" aria-hidden="true">
          🌊
        </div>

        <h1 className="text-4xl font-extrabold text-white mb-3">
          Oups, imprévu sur le parcours
        </h1>

        <p className="text-white/60 text-lg mb-8">
          Une erreur s&apos;est produite. Ça arrive même aux meilleurs aventuriers.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#2D6A4F] text-white font-semibold hover:bg-[#1B4332] transition-colors"
          >
            <span>🔄</span>
            Réessayer
          </button>

          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors"
          >
            <span>🏠</span>
            Retour à l&apos;accueil
          </a>
        </div>

        {error.digest && (
          <p className="mt-6 text-white/30 text-xs font-mono">
            Réf: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
