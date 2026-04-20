export const metadata = {
  title: 'Politique de confidentialité — Adventurer',
  description: 'Comment Adventurer collecte, utilise et protège vos données personnelles.',
};

export default function PrivacyPage() {
  const lastUpdated = '19 avril 2026';
  return (
    <>
      <h1 className="text-3xl font-bold text-[#1B4332] mb-2">Politique de confidentialité</h1>
      <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : {lastUpdated}</p>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#1B4332]">1. Qui sommes-nous ?</h2>
          <p>
            Adventurer est une application outdoor qui aide les passionnés à préparer, vivre et partager leurs aventures.
            Cette politique décrit comment nous traitons vos données personnelles conformément au RGPD (Règlement UE 2016/679).
          </p>
          <p>
            Éditeur : Adventurer — Contact : <a href="mailto:adventurer.app.outdoor@gmail.com" className="text-[#2D6A4F] underline">adventurer.app.outdoor@gmail.com</a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1B4332]">2. Données collectées</h2>
          <p>Nous collectons uniquement les données nécessaires à la fourniture du service :</p>
          <ul className="list-disc pl-6">
            <li><strong>Identification :</strong> email, nom d’affichage.</li>
            <li><strong>Profil outdoor :</strong> sports pratiqués, niveau, ville/pays, handle Instagram (programme ambassadeur).</li>
            <li><strong>Usage :</strong> interactions avec les fonctionnalités, événements de paiement, données saisies dans le Coach IA (sport, objectif, niveau, contraintes).</li>
            <li><strong>Technique :</strong> adresse IP, user agent, logs serveur pour la sécurité.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1B4332]">3. Finalités</h2>
          <ul className="list-disc pl-6">
            <li>Fournir le service (compte, coaching, marketplace, communauté).</li>
            <li>Gérer le programme ambassadeur et verser les commissions.</li>
            <li>Vous envoyer des communications transactionnelles (confirmation inscription, réservation, paiement).</li>
            <li>Améliorer le service et prévenir la fraude.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1B4332]">4. Base légale</h2>
          <p>
            Exécution du contrat (article 6.1.b RGPD) pour la fourniture du service, intérêt légitime (6.1.f) pour la
            sécurité et l’amélioration, consentement (6.1.a) pour les communications marketing le cas échéant.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1B4332]">5. Sous-traitants</h2>
          <ul className="list-disc pl-6">
            <li><strong>Vercel</strong> (hébergement, USA — clauses contractuelles types).</li>
            <li><strong>Supabase</strong> (base de données, UE).</li>
            <li><strong>Stripe</strong> (paiements, Irlande / USA — PCI-DSS).</li>
            <li><strong>Resend</strong> (emails transactionnels, USA).</li>
            <li><strong>Anthropic</strong> (Coach IA — génération de plans d’entraînement, USA). Les données envoyées se limitent au sport, objectif, niveau et contraintes saisis par l’utilisateur. Aucune donnée personnelle identifiante n’est transmise.</li>
            <li><strong>Google</strong> (authentification OAuth, USA — Privacy Shield / clauses contractuelles types).</li>
          </ul>
          <p>Aucune donnée n’est vendue à des tiers.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1B4332]">6. Durée de conservation</h2>
          <p>
            Compte actif : pendant toute la durée d’utilisation. Après suppression : 30 jours de rétention technique,
            puis anonymisation. Données de facturation : 10 ans (obligation comptable).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1B4332]">7. Vos droits</h2>
          <p>
            Vous disposez d’un droit d’accès, de rectification, d’effacement, d’opposition, de limitation et de
            portabilité. Pour exercer ces droits, écrivez à{' '}
            <a href="mailto:adventurer.app.outdoor@gmail.com" className="text-[#2D6A4F] underline">adventurer.app.outdoor@gmail.com</a>.
          </p>
          <p>
            Vous pouvez introduire une réclamation auprès de la CNIL (
            <a href="https://www.cnil.fr" target="_blank" rel="noreferrer" className="text-[#2D6A4F] underline">cnil.fr</a>).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1B4332]">8. Cookies</h2>
          <p>
            Adventurer utilise uniquement des cookies strictement nécessaires au fonctionnement (authentification,
            sécurité). Vercel Analytics et Speed Insights collectent des métriques de performance anonymisées
            (temps de chargement, pages vues) sans cookie tiers ni identification personnelle. Aucun cookie
            publicitaire ou de tracking tiers n'est utilisé.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1B4332]">9. Modifications</h2>
          <p>
            Cette politique peut évoluer. La date de dernière mise à jour est indiquée en haut de la page.
          </p>
        </div>
      </section>
    </>
  );
}
