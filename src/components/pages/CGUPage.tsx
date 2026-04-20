'use client';
import { useStore } from '@/lib/store';

export default function CGUPage() {
  const { closeSubPage } = useStore();

  return (
    <div className="min-h-screen bg-[var(--bg)] max-w-[430px] mx-auto pb-8">
      {/* Header with back */}
      <div className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-white/5">
        <button
          type="button"
          onClick={closeSubPage}
          className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          aria-label="Retour"
        >
          ←
        </button>
        <h2 className="font-semibold text-base">
          Conditions Générales
        </h2>
      </div>

      <article className="px-4 py-6 space-y-6 text-gray-300">
        {/* Intro */}
        <section>
          <p className="text-sm">
            Bienvenue sur Adventurer. En utilisant notre application, vous acceptez les
            conditions générales d'utilisation ci-dessous. Si vous n'acceptez pas ces
            conditions, cessez d'utiliser l'application immédiatement.
          </p>
        </section>

        {/* Objet du service */}
        <section>
          <h3
            className="font-bold text-white mb-2 mt-4 text-base"
          >
            1. Objet du Service
          </h3>
          <p className="text-sm">
            Adventurer est une plateforme communautaire de partage d'activités outdoor
            (randonnée, escalade, ski, vélo, etc.). L'application permet de :
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-400 mt-2 text-sm">
            <li>Enregistrer et partager vos traces GPS</li>
            <li>Connecter avec d'autres aventuriers</li>
            <li>Rejoindre des groupes thématiques</li>
            <li>Consulter des événements et activités</li>
            <li>Accéder à une marketplace de services</li>
          </ul>
        </section>

        {/* Inscription et compte */}
        <section>
          <h3
            className="font-bold text-white mb-2 mt-4 text-base"
          >
            2. Inscription et Compte
          </h3>
          <div className="text-sm space-y-2">
            <p>
              <strong className="text-gray-200">Créer un compte</strong> : Vous êtes
              responsable de la confidentialité de votre mot de passe et de la sécurité
              de votre compte.
            </p>
            <p>
              <strong className="text-gray-200">Authenticité</strong> : Vous garantissez que
              les informations fournies sont exactes, actuelles et complètes.
            </p>
            <p>
              <strong className="text-gray-200">Âge minimum</strong> : Vous devez avoir au
              moins 13 ans (ou l'équivalent selon votre juridiction).
            </p>
            <p>
              <strong className="text-gray-200">Responsabilité</strong> : Vous êtes seul
              responsable de toute activité sous votre compte.
            </p>
          </div>
        </section>

        {/* Utilisation de l'app */}
        <section>
          <h3
            className="font-bold text-white mb-2 mt-4 text-base"
          >
            3. Utilisation de l'Application
          </h3>
          <p className="text-sm mb-2">
            <strong className="text-gray-200">Vous acceptez de :</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-400 text-sm">
            <li>Utiliser l'app uniquement à des fins légales et légitimes</li>
            <li>
              Ne pas divulguer ou partager votre compte avec d'autres personnes
            </li>
            <li>
              Respecter le droit d'auteur et la propriété intellectuelle d'autrui
            </li>
            <li>
              Ne pas utiliser l'app pour harcèlement, spam ou contenu nuisible
            </li>
            <li>Ne pas contourner les mesures de sécurité</li>
          </ul>
          <p className="text-sm mt-3">
            <strong className="text-gray-200">Nous nous réservons le droit de :</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-400 text-sm">
            <li>Suspendre ou désactiver des comptes violant ces conditions</li>
            <li>Modérer ou supprimer du contenu inapproprié</li>
            <li>Refuser l'accès à des utilisateurs</li>
          </ul>
        </section>

        {/* Contenu généré par les utilisateurs */}
        <section>
          <h3
            className="font-bold text-white mb-2 mt-4 text-base"
          >
            4. Contenu Généré par les Utilisateurs
          </h3>
          <div className="text-sm space-y-2">
            <p>
              <strong className="text-gray-200">Propriété</strong> : Vous conservez la
              propriété de vos contenus (traces, photos, messages).
            </p>
            <p>
              <strong className="text-gray-200">Licence</strong> : En publiant sur
              Adventurer, vous nous accordez une licence non-exclusive, mondiale pour
              utiliser ce contenu (affichage, partage, analyse).
            </p>
            <p>
              <strong className="text-gray-200">Responsabilité</strong> : Vous êtes seul
              responsable du contenu que vous publiez. Ne publiez pas :
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Contenu offensant, haineux ou discriminatoire</li>
              <li>Données personnelles d'autrui sans consentement</li>
              <li>Photos d'autres personnes sans permission</li>
              <li>Contenu sexuel ou violent</li>
              <li>Spam ou contenu publicitaire non autorisé</li>
            </ul>
          </div>
        </section>

        {/* Marketplace */}
        <section>
          <h3
            className="font-bold text-white mb-2 mt-4 text-base"
          >
            5. Marketplace & Prestataires
          </h3>
          <div className="text-sm space-y-2">
            <p>
              <strong className="text-gray-200">Responsabilité limitée</strong> : Adventurer
              agit comme plateforme reliant utilisateurs et prestataires. Nous ne sommes pas
              responsables :
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>De la qualité des services offerts par les prestataires</li>
              <li>De litiges entre utilisateurs et prestataires</li>
              <li>De remboursements ou échanges</li>
            </ul>
            <p className="mt-3">
              <strong className="text-gray-200">Contrats indépendants</strong> : Les
              transactions relèvent entre vous et le prestataire. Adventurer n'est pas partie
              au contrat.
            </p>
          </div>
        </section>

        {/* Propriété intellectuelle */}
        <section>
          <h3
            className="font-bold text-white mb-2 mt-4 text-base"
          >
            6. Propriété Intellectuelle
          </h3>
          <div className="text-sm space-y-2">
            <p>
              <strong className="text-gray-200">Code, design, logo</strong> : Tous les
              éléments d'Adventurer (code source, design, marque) sont protégés par droits
              d'auteur et brevets. Vous ne pouvez pas les reproduire ou utiliser sans
              permission.
            </p>
            <p>
              <strong className="text-gray-200">Conditions d'utilisation</strong> :
              L'application vous est accordée en licence, non cédée. Vous ne pouvez pas :
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Décompiler ou reverse-engineer l'app</li>
              <li>Vendre ou céder votre compte</li>
              <li>Créer des versions dérivées</li>
              <li>Accéder aux serveurs ou données en arrière-plan</li>
            </ul>
          </div>
        </section>

        {/* Limitation de responsabilité */}
        <section>
          <h3
            className="font-bold text-white mb-2 mt-4 text-base"
          >
            7. Limitation de Responsabilité
          </h3>
          <div className="text-sm space-y-2">
            <p>
              <strong className="text-gray-200">« Tel quel »</strong> : L'application est
              fournie « telle quelle » sans garanties. Nous ne garantissons pas :
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Disponibilité ininterrompue</li>
              <li>Absence de bugs ou erreurs</li>
              <li>Exactitude des données GPS</li>
              <li>Sécurité absolue contre les piratages</li>
            </ul>
            <p className="mt-3">
              <strong className="text-gray-200">Limitation</strong> : Sauf obligation légale,
              notre responsabilité envers vous est limitée aux frais payés pour le service
              au cours des 30 derniers jours.
            </p>
            <p>
              <strong className="text-gray-200">Activités outdoor</strong> : Les activités
              outdoor comportent des risques (chute, accident, décès). Adventurer ne peut
              pas être tenue responsable des blessures ou dégâts. Utilisez l'app à vos
              risques et périls.
            </p>
          </div>
        </section>

        {/* Loi applicable */}
        <section>
          <h3
            className="font-bold text-white mb-2 mt-4 text-base"
          >
            8. Loi Applicable & Juridiction
          </h3>
          <div className="text-sm space-y-2">
            <p>
              <strong className="text-gray-200">Loi française</strong> : Ces conditions
              sont régies par la loi française, sans application des principes de conflits
              de lois.
            </p>
            <p>
              <strong className="text-gray-200">Tribunaux</strong> : Tout litige sera soumis
              aux tribunaux compétents de Paris, France.
            </p>
            <p>
              <strong className="text-gray-200">Résolution amiable</strong> : En cas de
              désaccord, nous encourageons une résolution amiable. Contactez{' '}
              <strong>adventurer.app.outdoor@gmail.com</strong>.
            </p>
          </div>
        </section>

        {/* Modification des conditions */}
        <section>
          <h3
            className="font-bold text-white mb-2 mt-4 text-base"
          >
            9. Modifications des Conditions
          </h3>
          <p className="text-sm">
            Nous pouvons modifier ces conditions à tout moment. Les modifications
            importantes seront communiquées par email. Votre utilisation continue signifie
            acceptation des nouvelles conditions.
          </p>
        </section>

        {/* Cessation */}
        <section>
          <h3
            className="font-bold text-white mb-2 mt-4 text-base"
          >
            10. Cessation
          </h3>
          <p className="text-sm">
            Vous pouvez supprimer votre compte à tout moment via les paramètres.
            Adventurer peut résilier l'accès en cas de violation de ces conditions.
          </p>
        </section>

        {/* Contact */}
        <section className="bg-[var(--card)] rounded-xl p-4">
          <h3
            className="font-bold text-white mb-2 text-base"
          >
            📧 Questions ?
          </h3>
          <p className="text-sm">
            Aventurer SAS
            <br />
            Email : adventurer.app.outdoor@gmail.com
            <br />
            Siège : Paris, France
          </p>
        </section>

        <p className="text-center text-gray-600 text-sm">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </article>
    </div>
  );
}
