import Link from 'next/link';

export const metadata = {
  title: "Conditions d'utilisation — Adventurer",
  description:
    "Les règles du jeu pour utiliser Adventurer : ce qu'on propose, ce qu'on attend de toi, et comment on gère les litiges.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-[#0B1D0E]">
      <Link href="/" className="text-sm text-[#2D6A4F] hover:underline">
        ← Retour à l'accueil
      </Link>

      <h1 className="mt-6 text-4xl font-black tracking-tight">
        Conditions générales d'utilisation
      </h1>
      <p className="mt-2 text-sm text-[#2D6A4F]">
        Dernière mise à jour : 21 avril 2026
      </p>

      <section className="prose prose-neutral mt-10 max-w-none">
        <h2 className="mt-8 text-2xl font-bold">
          1. Acceptation
        </h2>
        <p>
          En créant un compte ou en utilisant Adventurer, tu acceptes ces
          conditions. Si tu n'es pas d'accord, n'utilise pas l'application.
        </p>

        <h2 className="mt-8 text-2xl font-bold">2. Qui on est</h2>
        <p>
          Adventurer est édité par Guillaume Coulon, micro-entreprise basée en
          France. Contact :{' '}
          <a
            href="mailto:hello@adventurer-outdoor.app"
            className="text-[#2D6A4F] underline"
          >
            hello@adventurer-outdoor.app
          </a>
          .
        </p>

        <h2 className="mt-8 text-2xl font-bold">
          3. Le service qu'on propose
        </h2>
        <p>
          Adventurer est une application de préparation, suivi et partage
          d'aventures outdoor multi-sports (trail, kitesurf, alpinisme,
          parapente, plongée, etc.). Tu y trouveras : cartes de spots,
          communauté de pratiquants, défis, coaching (IA et humain),
          marketplace de matériel d'occasion.
        </p>

        <h2 className="mt-8 text-2xl font-bold">4. Ton compte</h2>
        <ul>
          <li>Tu dois avoir au moins 13 ans (16 en UE) pour créer un compte.</li>
          <li>
            Tu es responsable de garder tes identifiants confidentiels.
          </li>
          <li>Un seul compte par personne.</li>
          <li>
            On peut suspendre ou supprimer ton compte en cas de violation de
            ces conditions.
          </li>
        </ul>

        <h2 className="mt-8 text-2xl font-bold">
          5. Contenus que tu publies
        </h2>
        <p>
          Tu restes propriétaire de tout ce que tu postes (photos, avis,
          traces GPS, annonces). En publiant, tu nous donnes une licence
          mondiale, non-exclusive et gratuite pour afficher, stocker et
          distribuer ce contenu dans le cadre du service.
        </p>
        <p>Tu t'engages à ne pas publier :</p>
        <ul>
          <li>Du contenu illégal, haineux, discriminatoire ou violent.</li>
          <li>
            Du spam, de la publicité non sollicitée ou des liens malveillants.
          </li>
          <li>
            Des photos de personnes identifiables sans leur accord.
          </li>
          <li>Des informations fausses de sécurité (fausses conditions de
            neige, de vent, de vagues — ça peut tuer).</li>
          <li>Du contenu qui viole des droits tiers (marque, copyright).</li>
        </ul>

        <h2 className="mt-8 text-2xl font-bold">6. Sécurité sur le terrain</h2>
        <p>
          <strong>Adventurer est un outil d'aide, pas un substitut au
          jugement.</strong> Les informations terrain (météo, conditions,
          difficulté, avis communauté) sont fournies à titre indicatif.
          Tu restes <strong>entièrement responsable</strong> de tes décisions :
        </p>
        <ul>
          <li>Vérifier les prévisions météo officielles avant de sortir.</li>
          <li>
            Évaluer ton niveau réel vs la difficulté d'un itinéraire ou d'un
            spot.
          </li>
          <li>T'équiper correctement (casque, baudrier, VFI, balise…).</li>
          <li>
            Respecter les consignes des autorités locales (préfectures,
            PGHM, SNSM…).
          </li>
          <li>
            Ne jamais pratiquer seul une activité à risque sans plan de
            secours.
          </li>
        </ul>
        <p>
          Adventurer ne pourra pas être tenu responsable des accidents,
          blessures ou dommages survenus lors d'activités outdoor.
        </p>

        <h2 className="mt-8 text-2xl font-bold">
          7. Marketplace (matériel d'occasion)
        </h2>
        <p>
          Adventurer met en relation acheteurs et vendeurs. On n'intervient
          pas dans la transaction ni dans la livraison. Tu es responsable de
          la véracité de ton annonce et du paiement. On ne peut pas être
          tenus responsables en cas de litige entre utilisateurs. Signale
          tout comportement suspect à{' '}
          <a
            href="mailto:report@adventurer-outdoor.app"
            className="text-[#2D6A4F] underline"
          >
            report@adventurer-outdoor.app
          </a>
          .
        </p>

        <h2 className="mt-8 text-2xl font-bold">8. Coaching</h2>
        <p>
          Les programmes générés par le Coach IA sont des suggestions
          d'entraînement génériques. Ils ne remplacent pas un avis médical.
          Consulte ton médecin avant de démarrer un programme intensif,
          surtout si tu as des antécédents cardiaques ou articulaires.
        </p>
        <p>
          Les coachs humains référencés sur Adventurer sont des praticiens
          indépendants. On vérifie leurs qualifications mais on n'est pas
          responsable de la qualité de leur prestation.
        </p>

        <h2 className="mt-8 text-2xl font-bold">9. Abonnements et paiements</h2>
        <p>
          Adventurer est gratuit à télécharger. Certaines fonctionnalités
          premium sont payantes (abonnement mensuel ou annuel). Les paiements
          se font via Stripe (web) ou les paiements in-app d'Apple/Google
          (mobile). Tu peux annuler à tout moment depuis tes réglages —
          l'accès reste actif jusqu'à la fin de la période payée.
        </p>
        <p>
          Conformément au droit français de la consommation, tu disposes de
          14 jours pour te rétracter après souscription (sauf si tu as déjà
          consommé le service).
        </p>

        <h2 className="mt-8 text-2xl font-bold">10. Propriété intellectuelle</h2>
        <p>
          Le nom Adventurer, son logo, son design et son code source sont
          notre propriété. Tu ne peux pas les copier, les modifier, les
          distribuer ou créer des œuvres dérivées sans notre accord écrit.
        </p>

        <h2 className="mt-8 text-2xl font-bold">11. Suspension et résiliation</h2>
        <p>
          On peut suspendre ou supprimer ton compte si tu violes ces
          conditions. Tu peux supprimer ton compte à tout moment depuis
          Réglages → Compte → Supprimer mon compte.
        </p>

        <h2 className="mt-8 text-2xl font-bold">12. Responsabilité</h2>
        <p>
          On fait de notre mieux pour que le service fonctionne, mais on ne
          garantit pas l'absence de bug ou d'interruption. Notre
          responsabilité est limitée à ce que la loi française permet —
          notamment en cas de négligence lourde.
        </p>

        <h2 className="mt-8 text-2xl font-bold">13. Modifications</h2>
        <p>
          Si on change ces conditions, on te prévient dans l'app au moins
          30 jours avant. Continuer à utiliser Adventurer après cette date
          vaut acceptation.
        </p>

        <h2 className="mt-8 text-2xl font-bold">14. Droit applicable</h2>
        <p>
          Ces conditions sont régies par le droit français. En cas de litige,
          on essaie d'abord de régler à l'amiable. Si ça ne marche pas, les
          tribunaux français compétents sont seuls compétents.
        </p>

        <h2 className="mt-8 text-2xl font-bold">Contact</h2>
        <p>
          Une question ?{' '}
          <a
            href="mailto:hello@adventurer-outdoor.app"
            className="text-[#2D6A4F] underline"
          >
            hello@adventurer-outdoor.app
          </a>
        </p>
      </section>
    </main>
  );
}
