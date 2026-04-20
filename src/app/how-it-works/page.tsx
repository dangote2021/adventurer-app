import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comment ça marche — Programme ambassadeur',
  description:
    'Le programme ambassadeur Adventurer en 5 étapes : candidature, approbation, code perso, partage, rémunération. Tout ce que tu dois savoir avant de postuler.',
};

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-[#FEFAE0] text-gray-900" style={{ colorScheme: 'light' }}>
      <header className="bg-[#1B4332] text-white px-6 py-5">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="font-bold text-xl">Adventurer</Link>
          <nav className="hidden md:flex gap-5 text-sm">
            <Link href="/explore" className="hover:underline">Explorer</Link>
            <Link href="/coach/ai" className="hover:underline">Coach IA</Link>
            <Link href="/coach/humain" className="hover:underline">Coachs humains</Link>
            <Link href="/ambassadors" className="hover:underline">Candidater</Link>
          </nav>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 py-10">
        <div className="inline-block bg-[#F77F00]/20 text-[#F77F00] text-xs px-3 py-1 rounded-full mb-3">
          Programme ambassadeur · Saison 1
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-[#1B4332]">Comment ça marche</h1>
        <p className="text-gray-700 mt-3 text-lg max-w-2xl">
          Adventurer recrute 20 ambassadeurs pour lancer la communauté outdoor la plus exigeante du web.
          Voici la mécanique, en transparence totale.
        </p>

        <div className="mt-10 space-y-6">
          <Step number={1} title="Tu candidates">
            <p>
              Depuis la page <Link className="text-[#2D6A4F] underline" href="/ambassadors">Ambassadeurs</Link>, tu remplis
              un formulaire court : ton sport principal, ton spot de prédilection, ton handle Instagram, la taille
              approximative de ton audience (même si elle est petite).
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Pas de minimum d&apos;abonnés — on valorise l&apos;engagement et la crédibilité terrain, pas les chiffres bruts.
            </p>
          </Step>

          <Step number={2} title="On te répond sous 72 h">
            <p>
              Le fondateur d&apos;Adventurer lit chaque candidature. Si c&apos;est un fit, tu reçois un email
              avec ton code de parrainage personnel et ton lien unique de partage.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Si on ne peut pas retenir tout le monde pour la saison 1, tu restes prioritaire pour la saison 2.
            </p>
          </Step>

          <Step number={3} title="Tu partages comme tu veux">
            <p>Ton code peut être glissé dans :</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-800">
              <li>Ta bio Instagram, Strava, YouTube, TikTok</li>
              <li>Tes stories quand tu es sur un spot</li>
              <li>Les descriptions de tes vidéos</li>
              <li>Les échanges privés avec des potes passionnés</li>
            </ul>
            <p className="mt-3 text-sm text-gray-600">
              Aucune obligation de volume, de fréquence ou de ton imposé. Tu restes toi — c&apos;est le deal.
            </p>
          </Step>

          <Step number={4} title="On te rémunère en transparence">
            <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-800">
              <li><strong>5 €</strong> par inscription confirmée via ton code</li>
              <li><strong>10 %</strong> de commission sur chaque vente coaching / marketplace tracée par ton code</li>
              <li>
                <strong>Matos Adventurer</strong> en avant-première (stickers, gourde, t-shirt) — envoyé gratuitement
                dès les premières conversions
              </li>
              <li>
                <strong>Ton spot / itinéraire / défi mis en vedette</strong> sur la carte et le feed — exposition directe
                à la communauté
              </li>
            </ul>
            <p className="mt-3 text-sm text-gray-600">
              Les paiements se font via Stripe Connect (un onboarding de 5 min). Versement dès 50 € cumulés.
            </p>
          </Step>

          <Step number={5} title="Tu gardes la main sur tes données">
            <p>
              Tu peux consulter tes conversions en temps réel depuis ton espace ambassadeur.
              Tu peux quitter le programme à tout moment — ton code est simplement désactivé, tes données restent privées.
            </p>
            <p className="mt-3">
              <Link
                href="/ambassador/dashboard"
                className="inline-flex items-center gap-1.5 bg-[#2D6A4F] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#1B4332] transition-colors"
              >
                📊 Accède à ton tableau de bord
              </Link>
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Conformité RGPD, hébergement EU, aucune revente de données. Voir la{' '}
              <Link className="text-[#2D6A4F] underline" href="/legal/privacy">politique de confidentialité</Link>.
            </p>
          </Step>
        </div>

        <section className="mt-12 bg-white rounded-3xl p-6 md:p-8 border border-[#2D6A4F]/20">
          <h2 className="text-2xl font-bold text-[#1B4332]">FAQ</h2>
          <div className="mt-4 space-y-3">
            <Faq q="Je ne suis pas influenceur, est-ce que je peux candidater ?">
              Oui. On préfère 10 ambassadeurs passionnés à 1 ambassadeur suivi par des followers fantômes.
              Ce qui compte : ta crédibilité dans ton sport et ta capacité à rassembler les gens sur le terrain.
            </Faq>
            <Faq q="Vais-je devoir publier selon un planning imposé ?">
              Non. Aucun planning, aucun ton imposé. On te demande juste de rester authentique.
            </Faq>
            <Faq q="Est-ce cumulable avec d'autres partenariats ?">
              Oui, tant qu&apos;il n&apos;y a pas de conflit direct (ex : app concurrente d&apos;Adventurer).
            </Faq>
            <Faq q="Comment savoir si mes inscriptions ont été tracées ?">
              Dès que ton code est validé, tu reçois un lien vers ton tableau de bord perso (conversions, revenus cumulés, paiements à venir).
            </Faq>
            <Faq q="Et si je veux arrêter ?">
              Un email et c&apos;est réglé. Pas de clause de sortie, pas d&apos;engagement de durée.
            </Faq>
          </div>
        </section>

        <section className="mt-10 bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] rounded-3xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold">Prêt à rejoindre la tribu ?</h2>
          <p className="text-white/80 mt-2 max-w-xl mx-auto">
            Les 20 premières candidatures sont traitées en priorité. La saison 1 ferme à 20 ambassadeurs.
          </p>
          <div className="mt-4 flex gap-3 justify-center flex-wrap">
            <Link href="/ambassadors" className="bg-white text-[#1B4332] font-bold px-6 py-3 rounded-full">
              Je candidate
            </Link>
            <Link href="/explore" className="border border-white/40 text-white px-6 py-3 rounded-full hover:bg-white/10">
              Explorer d&apos;abord
            </Link>
          </div>
        </section>
      </section>

      <footer className="text-center text-xs text-gray-500 py-8 border-t border-gray-200 mt-10">
        Adventurer ·{' '}
        <Link href="/legal/privacy" className="underline">Confidentialité</Link>{' · '}
        <Link href="/legal/terms" className="underline">CGU</Link>{' · '}
        <Link href="/legal/mentions" className="underline">Mentions</Link>
      </footer>
    </main>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 bg-white rounded-2xl p-5 border border-gray-100">
      <div className="flex-shrink-0 w-10 h-10 bg-[#1B4332] text-white rounded-full flex items-center justify-center font-bold">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-[#1B4332]">{title}</h3>
        <div className="mt-2 text-gray-800 text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="bg-[#FEFAE0] rounded-xl p-4 border border-[#DDA15E]/30">
      <summary className="cursor-pointer font-semibold text-[#1B4332]">{q}</summary>
      <div className="mt-2 text-sm text-gray-800">{children}</div>
    </details>
  );
}
