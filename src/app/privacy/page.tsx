import Link from 'next/link';

export const metadata = {
  title: 'Politique de confidentialité — Adventurer',
  description:
    "Comment Adventurer collecte, utilise et protège tes données personnelles. Transparence totale sur la géolocalisation, les photos et les données sportives.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-[#0B1D0E]">
      <Link href="/" className="text-sm text-[#2D6A4F] hover:underline">
        ← Retour à l'accueil
      </Link>

      <h1 className="mt-6 text-4xl font-black tracking-tight">
        Politique de confidentialité
      </h1>
      <p className="mt-2 text-sm text-[#2D6A4F]">
        Dernière mise à jour : 21 avril 2026
      </p>

      <section className="prose prose-neutral mt-10 max-w-none">
        <h2 className="mt-8 text-2xl font-bold">En deux mots</h2>
        <p>
          Adventurer est une application outdoor conçue pour les passionnés de
          montagne, mer et ciel. On collecte le strict minimum pour que l'app
          fonctionne, on ne revend jamais tes données, et tu peux tout
          supprimer quand tu veux.
        </p>

        <h2 className="mt-8 text-2xl font-bold">1. Qui sommes-nous</h2>
        <p>
          Adventurer est édité par Guillaume Coulon, en France. Pour toute
          question :{' '}
          <a
            href="mailto:privacy@adventurer-outdoor.app"
            className="text-[#2D6A4F] underline"
          >
            privacy@adventurer-outdoor.app
          </a>
          .
        </p>

        <h2 className="mt-8 text-2xl font-bold">2. Ce qu'on collecte</h2>
        <p>
          On collecte uniquement les données nécessaires au fonctionnement
          d'Adventurer :
        </p>
        <ul>
          <li>
            <strong>Compte</strong> : ton email et un identifiant unique (géré
            par Supabase Auth). Pas de mot de passe stocké en clair, jamais.
          </li>
          <li>
            <strong>Préférences sport</strong> : les univers (Terre/Mer/Air) et
            sports que tu coches à l'onboarding, pour personnaliser ton feed.
          </li>
          <li>
            <strong>Géolocalisation</strong> : uniquement si tu l'autorises
            (pour la carte et les spots à proximité). Jamais en arrière-plan.
            Tu peux la désactiver à tout moment dans les réglages du
            téléphone.
          </li>
          <li>
            <strong>Activités sportives</strong> : si tu connectes Strava, on
            récupère tes activités récentes pour te proposer des défis
            pertinents. Tu peux déconnecter Strava quand tu veux.
          </li>
          <li>
            <strong>Contenus que tu publies</strong> : aventures, photos,
            signalements de conditions terrain, annonces marketplace.
          </li>
          <li>
            <strong>Logs techniques</strong> : adresse IP, type d'appareil,
            version OS (pour corriger les bugs). Conservés 30 jours maximum.
          </li>
        </ul>

        <h2 className="mt-8 text-2xl font-bold">
          3. Ce qu'on ne collecte pas
        </h2>
        <ul>
          <li>Pas de suivi cross-app via identifiants publicitaires.</li>
          <li>Pas de revente de tes données à des tiers.</li>
          <li>Pas de profiling pour vendre ton attention.</li>
          <li>Pas de micro ou caméra sans ton action explicite.</li>
        </ul>

        <h2 className="mt-8 text-2xl font-bold">4. Pourquoi on collecte</h2>
        <ul>
          <li>
            <strong>Faire fonctionner l'app</strong> : afficher les spots
            autour de toi, te connecter à ton compte, te proposer des défis
            adaptés.
          </li>
          <li>
            <strong>Personnaliser ton expérience</strong> : un kitesurfeur voit
            des spots de kite, pas des voies d'escalade.
          </li>
          <li>
            <strong>Communauté</strong> : partager des conditions terrain en
            temps réel avec d'autres pratiquants.
          </li>
          <li>
            <strong>Améliorer l'app</strong> : comprendre ce qui marche, ce
            qui bug.
          </li>
        </ul>

        <h2 className="mt-8 text-2xl font-bold">5. Qui voit tes données</h2>
        <p>
          Personne d'autre que toi et les sous-traitants techniques
          strictement nécessaires :
        </p>
        <ul>
          <li>
            <strong>Supabase</strong> (base de données, authentification,
            stockage) — hébergement en UE.
          </li>
          <li>
            <strong>Vercel</strong> (hébergement de l'application) — serveurs
            en Europe quand dispo.
          </li>
          <li>
            <strong>Strava</strong> (uniquement si tu connectes ton compte
            Strava) — selon leur propre politique.
          </li>
          <li>
            <strong>Resend</strong> (emails transactionnels : confirmation,
            reset mot de passe).
          </li>
        </ul>
        <p>
          On ne communique jamais tes données à des annonceurs ou des
          courtiers de données.
        </p>

        <h2 className="mt-8 text-2xl font-bold">6. Combien de temps</h2>
        <ul>
          <li>
            <strong>Compte actif</strong> : tant que tu utilises Adventurer.
          </li>
          <li>
            <strong>Compte supprimé</strong> : toutes les données sont
            effacées sous 30 jours, sauf obligations légales (facturation).
          </li>
          <li>
            <strong>Logs techniques</strong> : 30 jours.
          </li>
          <li>
            <strong>Sauvegardes chiffrées</strong> : 90 jours puis purge
            automatique.
          </li>
        </ul>

        <h2 className="mt-8 text-2xl font-bold">7. Tes droits (RGPD)</h2>
        <p>Tu peux à tout moment :</p>
        <ul>
          <li>Consulter les données qu'on a sur toi.</li>
          <li>Les corriger ou les mettre à jour.</li>
          <li>Les exporter dans un format standard (JSON).</li>
          <li>Supprimer ton compte et toutes tes données.</li>
          <li>
            T'opposer au traitement ou le limiter (pour ce qui n'est pas
            indispensable au fonctionnement).
          </li>
        </ul>
        <p>
          Pour exercer ces droits, écris à{' '}
          <a
            href="mailto:privacy@adventurer-outdoor.app"
            className="text-[#2D6A4F] underline"
          >
            privacy@adventurer-outdoor.app
          </a>
          . Réponse sous 30 jours maximum. Si la réponse ne te convient pas,
          tu peux saisir la{' '}
          <a
            href="https://www.cnil.fr"
            target="_blank"
            rel="noreferrer"
            className="text-[#2D6A4F] underline"
          >
            CNIL
          </a>
          .
        </p>

        <h2 className="mt-8 text-2xl font-bold">
          8. Sécurité
        </h2>
        <p>
          Chiffrement en transit (TLS 1.3) et au repos. Mots de passe hachés
          avec Argon2. Accès aux données de prod limité aux personnes qui en
          ont strictement besoin et loggé. En cas de violation de données, on
          te prévient dans les 72 h.
        </p>

        <h2 className="mt-8 text-2xl font-bold">9. Enfants</h2>
        <p>
          Adventurer n'est pas destiné aux moins de 13 ans. Entre 13 et 16 ans,
          l'accord d'un parent est requis selon la loi française.
        </p>

        <h2 className="mt-8 text-2xl font-bold">10. Modifications</h2>
        <p>
          Si on change cette politique, on te prévient par email et dans
          l'app au moins 30 jours avant l'entrée en vigueur.
        </p>

        <h2 className="mt-8 text-2xl font-bold">Contact</h2>
        <p>
          Une question, une demande, un doute ?{' '}
          <a
            href="mailto:privacy@adventurer-outdoor.app"
            className="text-[#2D6A4F] underline"
          >
            privacy@adventurer-outdoor.app
          </a>
          . On répond toujours.
        </p>
      </section>
    </main>
  );
}
