'use client';
import { useStore } from '@/lib/store';

export default function PrivacyPage() {
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
          Politique de Confidentialité
        </h2>
      </div>

      <article className="px-4 py-6 space-y-6 text-gray-300">
        {/* Intro */}
        <section>
          <p className="text-sm">
            Adventurer valorise votre vie privée. Cette politique explique comment nous
            collectons, utilisons et protégeons vos données personnelles conformément au
            Règlement Général sur la Protection des Données (RGPD).
          </p>
        </section>

        {/* Responsable du traitement */}
        <section>
          <h3
            className="font-bold text-white mb-2 mt-4 text-base"
          >
            1. Responsable du Traitement
          </h3>
          <p className="text-sm">
            <strong>Adventurer</strong>
            <br />
            Contact : <a href="mailto:adventurer.app.outdoor@gmail.com" className="text-[#2D6A4F] underline">adventurer.app.outdoor@gmail.com</a>
          </p>
        </section>

        {/* Données collectées */}
        <section>
          <h3
            className="font-bold text-white mb-2 mt-4 text-base"
          >
            2. Données Collectées
          </h3>
          <div className="text-sm space-y-2">
            <p>Nous collectons les catégories suivantes :</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>
                <strong className="text-gray-200">Profil</strong> : nom, email, photo,
                bio, localisation
              </li>
              <li>
                <strong className="text-gray-200">Sports</strong> : disciplines
                pratiquées, niveaux, objectifs
              </li>
              <li>
                <strong className="text-gray-200">Géolocalisation</strong> : position
                GPS en temps réel pour les activités
              </li>
              <li>
                <strong className="text-gray-200">Activités</strong> : traces GPX,
                durée, dénivelé, distance
              </li>
              <li>
                <strong className="text-gray-200">Interaction</strong> : messages,
                commentaires, photos partagées
              </li>
              <li>
                <strong className="text-gray-200">Technique</strong> : adresse IP, type
                d'appareil, version OS
              </li>
            </ul>
          </div>
        </section>

        {/* Base légale */}
        <section>
          <h3
            className="font-bold text-white mb-2 mt-4 text-base"
          >
            3. Base Légale du Traitement
          </h3>
          <div className="text-sm space-y-2">
            <p>Nos traitements s'appuient sur :</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>
                <strong className="text-gray-200">Consentement explicite</strong> pour
                le partage de géolocalisation et photos
              </li>
              <li>
                <strong className="text-gray-200">Intérêt légitime</strong> pour améliorer
                le service et la sécurité
              </li>
              <li>
                <strong className="text-gray-200">Exécution du contrat</strong> pour
                fournir les services demandés
              </li>
              <li>
                <strong className="text-gray-200">Obligation légale</strong> pour les
                statistiques d'utilisation (CNIL)
              </li>
            </ul>
          </div>
        </section>

        {/* Durée de conservation */}
        <section>
          <h3
            className="font-bold text-white mb-2 mt-4 text-base"
          >
            4. Durée de Conservation
          </h3>
          <div className="text-sm space-y-2">
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>
                Profil actif : <strong className="text-gray-200">conservé pendant toute la durée du compte</strong>
              </li>
              <li>
                Activités : <strong className="text-gray-200">conservées 2 ans minimum</strong> pour les statistiques
              </li>
              <li>
                Géolocalisation en direct : <strong className="text-gray-200">supprimée après 48h</strong>
              </li>
              <li>
                Messages supprimés : <strong className="text-gray-200">purgés après 30 jours</strong>
              </li>
              <li>
                Données après suppression de compte : <strong className="text-gray-200">effacées sous 30 jours</strong>
              </li>
            </ul>
          </div>
        </section>

        {/* Droits des utilisateurs */}
        <section>
          <h3
            className="font-bold text-white mb-2 mt-4 text-base"
          >
            5. Vos Droits (RGPD)
          </h3>
          <div className="text-sm space-y-2">
            <p>Vous avez le droit de :</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>
                <strong className="text-gray-200">Accès</strong> : obtenir une copie de
                vos données
              </li>
              <li>
                <strong className="text-gray-200">Rectification</strong> : corriger vos
                données inexactes
              </li>
              <li>
                <strong className="text-gray-200">Suppression</strong> : demander l'effacement
                (« droit à l'oubli »)
              </li>
              <li>
                <strong className="text-gray-200">Limitation</strong> : restreindre le
                traitement
              </li>
              <li>
                <strong className="text-gray-200">Portabilité</strong> : exporter vos
                données en format standard
              </li>
              <li>
                <strong className="text-gray-200">Opposition</strong> : refuser un
                traitement particulier
              </li>
              <li>
                <strong className="text-gray-200">Non-consentement</strong> : retirer votre
                consentement à tout moment
              </li>
            </ul>
            <p className="mt-3 text-gray-400">
              Pour exercer ces droits, contactez :
              <strong className="text-gray-200"> adventurer.app.outdoor@gmail.com</strong>
            </p>
          </div>
        </section>

        {/* Cookies */}
        <section>
          <h3
            className="font-bold text-white mb-2 mt-4 text-base"
          >
            6. Cookies & Traceurs
          </h3>
          <div className="text-sm space-y-2">
            <p>Nous utilisons :</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>
                <strong className="text-gray-200">Cookies essentiels</strong> pour
                authentification et session
              </li>
              <li>
                <strong className="text-gray-200">Analytics</strong> (Sentry, Mixpanel)
                pour comprendre l'usage
              </li>
              <li>
                <strong className="text-gray-200">Publicités personnalisées</strong> via
                partenaires tiers
              </li>
            </ul>
            <p className="mt-3 text-gray-400">
              Vous pouvez désactiver les cookies non-essentiels dans vos paramètres.
            </p>
          </div>
        </section>

        {/* Partage des données */}
        <section>
          <h3
            className="font-bold text-white mb-2 mt-4 text-base"
          >
            7. Partage des Données
          </h3>
          <div className="text-sm space-y-2">
            <p>Vos données sont partagées avec :</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>
                <strong className="text-gray-200">Autres utilisateurs</strong> : seulement
                les données que vous rendez publiques
              </li>
              <li>
                <strong className="text-gray-200">Prestataires</strong> : hébergement
                (AWS), analytics, paiement
              </li>
              <li>
                <strong className="text-gray-200">Autorités</strong> : seulement si
                légalement requis
              </li>
            </ul>
          </div>
        </section>

        {/* Sécurité */}
        <section>
          <h3
            className="font-bold text-white mb-2 mt-4 text-base"
          >
            8. Sécurité
          </h3>
          <p className="text-sm">
            Nous protégeons vos données avec chiffrement TLS/SSL, authentification
            multi-facteurs et audits réguliers. Malgré nos efforts, aucune sécurité
            n'est absolue. Signalez toute violation à{' '}
            <strong>adventurer.app.outdoor@gmail.com</strong>.
          </p>
        </section>

        {/* Transferts internationaux */}
        <section>
          <h3
            className="font-bold text-white mb-2 mt-4 text-base"
          >
            9. Transferts Internationaux
          </h3>
          <p className="text-sm">
            Vos données peuvent être transférées hors UE pour hébergement cloud. Nous
            utilisons des mécanismes RGPD compatibles (clauses contractuelles standards).
          </p>
        </section>

        {/* Responsable données */}
        <section>
          <h3
            className="font-bold text-white mb-2 mt-4 text-base"
          >
            10. Délégué à la Protection des Données (DPO)
          </h3>
          <p className="text-sm">
            Pour toute question sur la confidentialité :
            <br />
            <strong>DPO Adventurer</strong>
            <br />
            Email : <strong>adventurer.app.outdoor@gmail.com</strong>
            <br />
            Ou déposez plainte auprès de votre autorité locale de protection des données.
          </p>
        </section>

        {/* Modifications */}
        <section>
          <h3
            className="font-bold text-white mb-2 mt-4 text-base"
          >
            11. Modifications de Cette Politique
          </h3>
          <p className="text-sm">
            Nous pouvons mettre à jour cette politique. Les changements seront notifiés
            par email pour les modifications importantes. Votre utilisation continue
            signifie acceptation.
          </p>
        </section>

        {/* Contact */}
        <section className="bg-[var(--card)] rounded-xl p-4">
          <h3
            className="font-bold text-white mb-2 text-base"
          >
            📧 Contactez-Nous
          </h3>
          <p className="text-sm">
            Aventurer SAS
            <br />
            Privacy Team : adventurer.app.outdoor@gmail.com
            <br />
            DPO : adventurer.app.outdoor@gmail.com
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
