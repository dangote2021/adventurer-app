export const metadata = {
  title: 'Conditions Générales d’Utilisation — Adventurer',
  description: 'Conditions d’utilisation de l’application Adventurer.',
};

export default function TermsPage() {
  const lastUpdated = '19 avril 2026';
  return (
    <>
      <h1 className="text-3xl font-bold text-[#1B4332] mb-2">Conditions Générales d’Utilisation</h1>
      <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : {lastUpdated}</p>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#1B4332]">1. Objet</h2>
          <p>
            Les présentes CGU régissent l’utilisation de l’application Adventurer accessible sur adventurer-outdoor.vercel.app
            et ses sous-domaines. En utilisant le service, vous acceptez ces conditions sans réserve.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1B4332]">2. Service proposé</h2>
          <p>
            Adventurer met à disposition une plateforme outdoor multi-sports intégrant : inspiration, communauté, défis,
            cartographie, coaching IA, coaching humain, marketplace matériel d’occasion, programme ambassadeur.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1B4332]">3. Inscription et compte</h2>
          <p>
            L’utilisateur doit être âgé d’au moins 16 ans. Il s’engage à fournir des informations exactes et à maintenir
            la confidentialité de son compte. Tout usage frauduleux peut entraîner la suspension immédiate.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1B4332]">4. Sécurité outdoor — Avertissement</h2>
          <p>
            Les activités outdoor (montagne, mer, air) comportent des risques intrinsèques. Les informations fournies
            par Adventurer (conditions, tracés, conseils IA) sont indicatives et ne dispensent jamais de l’évaluation
            personnelle des risques, de la consultation de professionnels et du respect des règles de sécurité locales.
            Adventurer décline toute responsabilité en cas d’accident.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1B4332]">5. Paiements</h2>
          <p>
            Les paiements (coaching, marketplace) sont traités par Stripe. Adventurer perçoit une commission de service
            précisée avant chaque transaction. Conformément aux articles L.221-18 et suivants du Code de la consommation,
            vous disposez d'un délai de 14 jours à compter de la transaction pour exercer votre droit de rétractation,
            sauf si la prestation a été intégralement exécutée avec votre accord exprès. Les remboursements sont
            effectués dans un délai de 14 jours suivant la demande.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1B4332]">6. Programme ambassadeur</h2>
          <p>
            Les ambassadeurs sélectionnés perçoivent une commission sur les ventes générées par leur code de parrainage,
            payée via Stripe Connect. Le statut d’ambassadeur est attribué discrétionnairement par Adventurer et peut
            être révoqué en cas de non-respect des présentes CGU ou d’image préjudiciable.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1B4332]">7. Contenu utilisateur</h2>
          <p>
            L’utilisateur conserve la propriété du contenu qu’il publie (photos, récits, tracés) et accorde à Adventurer
            une licence mondiale, non exclusive et gratuite pour l’afficher dans le cadre du service. Tout contenu
            illicite, diffamatoire ou commercial non autorisé sera supprimé.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1B4332]">8. Propriété intellectuelle</h2>
          <p>
            Le nom Adventurer, le logo et l’ensemble des éléments de l’application sont protégés. Toute reproduction
            non autorisée est interdite.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1B4332]">9. Résiliation</h2>
          <p>
            L’utilisateur peut supprimer son compte à tout moment. Adventurer peut suspendre ou résilier tout compte
            en cas de violation des CGU, avec préavis raisonnable lorsque possible.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1B4332]">10. Droit applicable</h2>
          <p>
            Les présentes CGU sont soumises au droit français. Tout litige relève des tribunaux compétents du ressort
            du domicile du défendeur, après tentative préalable de résolution amiable.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1B4332]">11. Médiation</h2>
          <p>
            Conformément aux articles L.612-1 et suivants du Code de la consommation, en cas de litige non résolu
            directement avec Adventurer, vous pouvez recourir gratuitement à un médiateur de la consommation.
            Nous vous communiquerons les coordonnées du médiateur compétent sur simple demande à{' '}
            <a href="mailto:adventurer.app.outdoor@gmail.com" className="text-[#2D6A4F] underline">adventurer.app.outdoor@gmail.com</a>.
            Vous pouvez également déposer votre réclamation sur la plateforme européenne de règlement en ligne des litiges :{' '}
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer" className="text-[#2D6A4F] underline">ec.europa.eu/consumers/odr</a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1B4332]">12. Contact</h2>
          <p>
            Pour toute question : <a href="mailto:adventurer.app.outdoor@gmail.com" className="text-[#2D6A4F] underline">adventurer.app.outdoor@gmail.com</a>
          </p>
        </div>
      </section>
    </>
  );
}
