export const metadata = {
  title: 'Mentions légales — Adventurer',
  description: 'Mentions légales de l’application Adventurer.',
};

export default function MentionsPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-[#1B4332] mb-8">Mentions légales</h1>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#1B4332]">Éditeur</h2>
          <p>Adventurer</p>
          <p>Email : <a href="mailto:adventurer.app.outdoor@gmail.com" className="text-[#2D6A4F] underline">adventurer.app.outdoor@gmail.com</a></p>
          <p>Directeur de la publication : Adventurer</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1B4332]">Hébergement</h2>
          <p>
            Vercel Inc. — 440 N Barranca Ave #4133, Covina, CA 91723, USA —{' '}
            <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-[#2D6A4F] underline">vercel.com</a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1B4332]">Base de données</h2>
          <p>
            Supabase — hébergée au sein de l’Union européenne —{' '}
            <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#2D6A4F] underline">supabase.com</a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1B4332]">Paiements</h2>
          <p>
            Stripe Payments Europe, Ltd — 1 Grand Canal Street Lower, Dublin, Irlande —{' '}
            <a href="https://stripe.com" target="_blank" rel="noreferrer" className="text-[#2D6A4F] underline">stripe.com</a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1B4332]">Propriété intellectuelle</h2>
          <p>
            L’ensemble du contenu du site (textes, graphismes, logo, icônes, images) est la propriété exclusive
            d’Adventurer, sauf mention contraire. Toute reproduction, distribution, modification ou publication sans
            autorisation écrite préalable est strictement interdite.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1B4332]">Signalement d’un contenu</h2>
          <p>
            Pour signaler un contenu illicite ou contraire aux CGU, contactez{' '}
            <a href="mailto:adventurer.app.outdoor@gmail.com" className="text-[#2D6A4F] underline">adventurer.app.outdoor@gmail.com</a>.
          </p>
        </div>
      </section>
    </>
  );
}
