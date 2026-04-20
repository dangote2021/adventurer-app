'use client';

/**
 * /marketplace/cancelled — Post-payment cancellation page for marketplace purchases
 * Stripe redirects here when the user cancels the checkout flow.
 */

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CancelledContent() {
  const params = useSearchParams();
  const orderId = params.get('order_id');

  return (
    <main className="min-h-screen bg-[#FEFAE0] flex items-center justify-center px-6" style={{ colorScheme: 'light' }}>
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6" aria-hidden="true">
          🏔️
        </div>
        <h1 className="text-3xl font-extrabold text-[#1B4332] mb-3">
          Achat annulé
        </h1>
        <p className="text-gray-700 text-lg mb-2">
          Pas de souci — ton achat n&apos;a pas été finalisé et aucun paiement n&apos;a été prélevé.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          L&apos;article est toujours disponible si tu changes d&apos;avis.
        </p>

        {orderId && (
          <p className="text-xs text-gray-400 mb-6">
            Référence : {orderId.slice(0, 20)}…
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
            href="/explore"
            className="inline-block bg-white text-[#1B4332] font-semibold px-6 py-3 rounded-full border border-[#1B4332]/20 hover:border-[#1B4332] transition"
          >
            Continuer à explorer
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function MarketplaceCancelledPage() {
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
