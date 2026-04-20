import Link from 'next/link';

export const metadata = {
  title: 'Page introuvable',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Mountain emoji as visual */}
        <div className="text-8xl mb-6" aria-hidden="true">
          🏔️
        </div>

        <h1 className="text-4xl font-extrabold text-white mb-3">
          Sentier introuvable
        </h1>

        <p className="text-white/60 text-lg mb-8">
          Cette page n&apos;existe pas ou a été déplacée.
          Pas de panique, il y a plein d&apos;autres aventures à explorer.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#2D6A4F] text-white font-semibold hover:bg-[#1B4332] transition-colors"
          >
            <span>🏠</span>
            Retour à l&apos;accueil
          </Link>

          <Link
            href="/explore"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors"
          >
            <span>🗺️</span>
            Explorer
          </Link>
        </div>
      </div>
    </div>
  );
}
