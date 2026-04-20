'use client';

/**
 * /booking/cancelled — Post-payment cancellation page
 * Stripe redirects here when the user cancels the checkout flow.
 */

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CancelledContent() {
  const params = useSearchParams();
  const bookingId = params.get('booking_id');

  return (
    <main className="min-h-screen bg-[#FEFAE0] flex items-center justify-center px-6" style={{ colorScheme: 'light' }}>
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6" aria-hidden="true">
          🏔️
        </div>
        <h1 className="text-3xl font-extrabold text-[#1B4332] mb-3">
          Réservation annulée
        </h1>
        <p className="text-gray-700 text-lg mb-2">
          Pas de souci — ta réservation n&apos;a pas été finalisée et aucun paiement n&apos;a été prélevé.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Tu peux reprendre ta réservation à tout moment ou explorer d&apos;autres coachs.
        </p>

        {bookingId && (
          <p className="text-xs text-gray-400 mb-6">
            Référence : {bookingId.slice(0, 20)}…
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/coach/humain"
            className="inline-block bg-[#2D6A4F] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#1B4332] transition"
          >
            Revoir les coachs
          </Link>
          <Link
            href="/"
            className="inline-block bg-white text-[#1B4332] font-semibold px-6 py-3 rounded-full border border-[#1B4332]/20 hover:border-[#1B4332] transition"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function BookingCancelledPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FEFAE0] flex items-center justify-center">
          <div className="text-[#1B4332] text-lg">Chargement…</div>
        </main>
      }
    >
      <CancelledContent />
    </Suspense>
  );
}
