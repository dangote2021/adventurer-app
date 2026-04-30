'use client';
import { useStore } from '@/lib/store';

export default function AboutPage() {
  const { closeSubPage, language } = useStore();
  const fr = language === 'fr';

  return (
    <div className="min-h-screen bg-[var(--bg)] max-w-[430px] mx-auto pb-8">
      {/* Header with back */}
      <div className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-white/5">
        <button
          type="button"
          onClick={closeSubPage}
          className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          aria-label={fr ? 'Retour' : 'Back'}
        >
          ←
        </button>
        <h2 className="font-semibold text-base">
          {fr ? 'À propos' : 'About'}
        </h2>
      </div>

      <article className="px-4 py-6 space-y-6 text-gray-300">
        <section className="text-center pb-4">
          <div className="text-5xl mb-3">🏔️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Adventurer</h1>
          <p className="text-xs text-gray-500">
            {fr ? 'L\'app outdoor multi-sports' : 'The multi-sport outdoor app'}
          </p>
        </section>

        <section>
          <h3 className="font-bold text-white mb-2 text-base">
            {fr ? 'Notre raison d\'être' : 'Why we exist'}
          </h3>
          <p className="text-sm leading-relaxed">
            {fr
              ? 'Adventurer rassemble en un seul endroit ce qui était jusque-là éclaté entre dix apps : la préparation d\'aventure, la cartographie terrain, la communauté de pratiquants, et le partage de ce qu\'on a vécu. Une app pensée par des passionnés outdoor, pour des passionnés outdoor.'
              : 'Adventurer brings together in one place what used to be scattered across ten apps: trip planning, field mapping, an outdoor community, and sharing what you\'ve experienced. An app designed by outdoor enthusiasts, for outdoor enthusiasts.'}
          </p>
        </section>

        <section>
          <h3 className="font-bold text-white mb-2 text-base">
            {fr ? 'Ce qu\'on couvre' : 'What we cover'}
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
            <li>{fr ? 'Trail, randonnée, alpinisme, ski de rando, escalade' : 'Trail, hiking, alpinism, ski touring, climbing'}</li>
            <li>{fr ? 'Kitesurf, surf, wing foil, voile, plongée, apnée' : 'Kitesurfing, surfing, wing foil, sailing, diving, freediving'}</li>
            <li>{fr ? 'Vélo route, gravel, VTT, bikepacking' : 'Road cycling, gravel, MTB, bikepacking'}</li>
            <li>{fr ? 'Parapente, vol libre' : 'Paragliding, free flight'}</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-white mb-2 text-base">
            {fr ? 'Nos engagements' : 'Our commitments'}
          </h3>
          <div className="text-sm space-y-2 leading-relaxed">
            <p>
              <strong className="text-white">
                {fr ? '· Pas de faux contenu.' : '· No fake content.'}
              </strong>{' '}
              {fr
                ? 'On préfère afficher un écran vide honnête plutôt qu\'inventer une fausse communauté.'
                : 'We\'d rather show an honest empty screen than fake a community.'}
            </p>
            <p>
              <strong className="text-white">
                {fr ? '· Pas de gamification gratuite.' : '· No empty gamification.'}
              </strong>{' '}
              {fr
                ? 'Quelques badges qui ont du sens, pas cinquante distribués à tort et à travers.'
                : 'A few badges that mean something, not fifty handed out for nothing.'}
            </p>
            <p>
              <strong className="text-white">
                {fr ? '· Tes données t\'appartiennent.' : '· Your data is yours.'}
              </strong>{' '}
              {fr
                ? 'On respecte le RGPD. Tu peux exporter, supprimer, contrôler ce que tu partages.'
                : 'We respect GDPR. You can export, delete, and control what you share.'}
            </p>
            <p>
              <strong className="text-white">
                {fr ? '· Pas de publicité.' : '· No ads.'}
              </strong>{' '}
              {fr
                ? 'L\'app est gratuite à l\'utilisation, financée par des fonctionnalités premium optionnelles.'
                : 'The app is free to use, funded by optional premium features.'}
            </p>
          </div>
        </section>

        <section>
          <h3 className="font-bold text-white mb-2 text-base">
            {fr ? 'Contact' : 'Contact'}
          </h3>
          <p className="text-sm">
            <a href="mailto:adventurer.app.outdoor@gmail.com" className="text-[#2D6A4F] underline">
              adventurer.app.outdoor@gmail.com
            </a>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {fr
              ? 'Une question, un retour, un bug ? Écris-nous, on répond.'
              : 'A question, feedback, a bug? Write to us, we answer.'}
          </p>
        </section>

        <section className="pt-4 text-center text-xs text-gray-500 border-t border-white/5">
          <p>Adventurer · v5.0.1</p>
          <p className="mt-1">
            {fr ? 'Fait avec passion entre les Alpes et l\'océan.' : 'Made with passion between the Alps and the ocean.'}
          </p>
        </section>
      </article>
    </div>
  );
}
