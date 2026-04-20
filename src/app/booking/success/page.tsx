'use client';

/**
 * /booking/success — Post-payment success page
 * Stripe redirects here after a successful coach booking checkout.
 * Reads the session_id from search params to display confirmation.
 */

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');

  return (
    <main className="min-h-screen bg-[#FEFAE0] flex items-center justify-center px-6" style={{ colorScheme: 'light' }}>
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6" aria-hidden="true">
          🎉
        </div>
        <h1 className="text-3xl font-extrabold text-[#1B4332] mb-3">
          Réservation confirmée !
        </h1>
        <p className="text-gray-700 text-lg mb-2">
          Ta session de coaching est réservée. Tu vas recevoir un email de confirmation avec tous les détails.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Ton coach te contactera avant la session pour organiser les derniers détails.
        </p>

        {sessionId && (
          <p className="text-xs text-gray-400 mb-6">
            Référence : {sessionId.slice(0, 20)}…
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-block bg-[#2D6A4F] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#1B4332] transition"
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/coach/humain"
            className="inline-block bg-white text-[#1B4332] font-semibold px-6 py-3 rounded-full border border-[#1B4332]/20 hover:border-[#1B4332] transition"
          >
            Voir les coachs
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FEFAE0] flex items-center justify-center">
          <div className="text-[#1B4332] text-lg">Chargement…</div>
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
