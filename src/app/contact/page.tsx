import Link from 'next/link';

export const metadata = {
  title: 'Support & contact — Adventurer',
  description:
    "Besoin d'aide ? Une idée ? Un bug à signaler ? On lit tout et on répond toujours.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-[#0B1D0E]">
      <Link href="/" className="text-sm text-[#2D6A4F] hover:underline">
        ← Retour à l'accueil
      </Link>

      <h1 className="mt-6 text-4xl font-black tracking-tight">
        Support & contact
      </h1>
      <p className="mt-4 text-lg text-[#2D6A4F]">
        Derrière Adventurer, il y a une vraie équipe de passionnés. On lit
        tout. On répond toujours.
      </p>

      <div className="mt-10 space-y-6">
        <div className="rounded-2xl border border-[#2D6A4F]/20 bg-[#FEFAE0]/50 p-6">
          <h2 className="text-xl font-bold">Une question générale ?</h2>
          <p className="mt-2">
            Écris-nous à{' '}
            <a
              href="mailto:hello@adventurer-outdoor.app"
              className="font-semibold text-[#2D6A4F] underline"
            >
              hello@adventurer-outdoor.app
            </a>
            . Réponse sous 48 h ouvrées.
          </p>
        </div>

        <div className="rounded-2xl border border-[#2D6A4F]/20 bg-[#FEFAE0]/50 p-6">
          <h2 className="text-xl font-bold">Un bug, un crash ?</h2>
          <p className="mt-2">
            Envoie le détail à{' '}
            <a
              href="mailto:bugs@adventurer-outdoor.app"
              className="font-semibold text-[#2D6A4F] underline"
            >
              bugs@adventurer-outdoor.app
            </a>
            . Précise ton modèle de téléphone, la version de l'app, et si tu
            peux, une capture d'écran.
          </p>
        </div>

        <div className="rounded-2xl border border-[#2D6A4F]/20 bg-[#FEFAE0]/50 p-6">
          <h2 className="text-xl font-bold">Signaler un contenu</h2>
          <p className="mt-2">
            Un profil suspect, une annonce frauduleuse, un contenu
            inapproprié ?{' '}
            <a
              href="mailto:report@adventurer-outdoor.app"
              className="font-semibold text-[#2D6A4F] underline"
            >
              report@adventurer-outdoor.app
            </a>
            . On traite les signalements sous 24 h.
          </p>
        </div>

        <div className="rounded-2xl border border-[#2D6A4F]/20 bg-[#FEFAE0]/50 p-6">
          <h2 className="text-xl font-bold">Confidentialité & données</h2>
          <p className="mt-2">
            Pour toute demande RGPD (accès, correction, suppression) :{' '}
            <a
              href="mailto:privacy@adventurer-outdoor.app"
              className="font-semibold text-[#2D6A4F] underline"
            >
              privacy@adventurer-outdoor.app
            </a>
            . Réponse sous 30 jours max.
          </p>
        </div>

        <div className="rounded-2xl border border-[#2D6A4F]/20 bg-[#FEFAE0]/50 p-6">
          <h2 className="text-xl font-bold">Presse & partenariats</h2>
          <p className="mt-2">
            Journaliste, marque outdoor, organisateur d'événement ?{' '}
            <a
              href="mailto:press@adventurer-outdoor.app"
              className="font-semibold text-[#2D6A4F] underline"
            >
              press@adventurer-outdoor.app
            </a>
          </p>
        </div>
      </div>

      <div className="mt-12 rounded-2xl bg-[#1B4332] p-6 text-white">
        <h2 className="text-xl font-bold">Pendant que tu patientes…</h2>
        <p className="mt-2 text-white/80">
          Sors prendre l'air. La réponse arrivera.
        </p>
      </div>
    </main>
  );
}
