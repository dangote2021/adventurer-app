import type { Metadata } from 'next';
import Link from 'next/link';
import { JoinAsCoachForm } from './JoinAsCoachForm';
import { COACHES } from './coaches';

export const metadata: Metadata = {
  title: 'Coachs humains certifiés',
  description:
    'Progresse en apnée, kite, trail, alpinisme avec les meilleurs coachs outdoor. Session 1:1 ou programme sur plusieurs semaines, paiement sécurisé via Stripe.',
  openGraph: {
    title: 'Coachs humains certifiés',
    description: 'Trouve ton coach outdoor : apnée, kite, trail, alpi, parapente, surf. Sessions à distance ou sur le terrain.',
    url: 'https://adventurer-outdoor.vercel.app/coach/humain',
  },
};

function euros(cents: number) {
  return (cents / 100).toFixed(0) + ' €';
}

export default function CoachHumainPage() {
  return (
    <main className="min-h-screen bg-[#FEFAE0]" style={{ colorScheme: 'light' }}>
      {/* Hero */}
      <section className="bg-[#1B4332] text-white px-6 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <Link href="/" className="text-white/70 text-sm hover:text-white">← Retour à l'accueil</Link>
          <h1 className="text-4xl md:text-5xl font-black mt-4 mb-4">
            Coachs humains certifiés
          </h1>
          <p className="text-lg text-white/85 max-w-2xl">
            L'IA te fait progresser à ton rythme. Pour passer un cap, rien ne remplace un humain qui t'observe, te corrige, te pousse. Choisis parmi nos coachs vérifiés — paiement sécurisé Stripe, satisfait ou remboursé sur la première session.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <span className="bg-white/10 rounded-full px-3 py-1 text-sm">✅ Certifications vérifiées</span>
            <span className="bg-white/10 rounded-full px-3 py-1 text-sm">✅ Paiement Stripe sécurisé</span>
            <span className="bg-white/10 rounded-full px-3 py-1 text-sm">✅ Messagerie intégrée</span>
            <span className="bg-white/10 rounded-full px-3 py-1 text-sm">✅ Satisfaction garantie</span>
          </div>
        </div>
      </section>

      {/* Filter info */}
      <section className="px-6 py-6 max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-[#2D6A4F]/20 text-sm text-gray-700">
          <span className="text-2xl">🌱</span>
          <span>
            <strong>Phase pilote :</strong> {COACHES.length} coachs triés sur le volet. Nouveaux coachs acceptés chaque mois après vérification des certifications et d'un appel de 30 min.
          </span>
        </div>
      </section>

      {/* Coach grid */}
      <section className="px-6 pb-12 max-w-5xl mx-auto">
        <div className="grid gap-5 md:grid-cols-2">
          {COACHES.map(c => (
            <article
              key={c.id}
              className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div
                className="px-6 py-5 flex items-center gap-4 text-white"
                style={{ backgroundColor: c.background_color }}
              >
                <div className="text-5xl">{c.photo_emoji}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{c.name}</h3>
                  <p className="text-sm opacity-90">
                    {c.sport} · {c.universe} · {c.location}
                  </p>
                </div>
                <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs font-semibold">
                  {c.years_experience} ans
                </span>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-gray-800 text-sm leading-relaxed">{c.bio}</p>

                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Spécialités</div>
                  <div className="flex flex-wrap gap-1.5">
                    {c.specialties.map(s => (
                      <span key={s} className="bg-[#F2F9F5] text-[#1B4332] px-2 py-0.5 rounded-full text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Certifications</div>
                  <p className="text-sm text-gray-700">{c.certifications.join(' · ')}</p>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Format</div>
                  <p className="text-sm text-gray-700">{c.session_format}</p>
                </div>

                <div className="flex items-end justify-between pt-3 border-t border-gray-100">
                  <div>
                    <div className="text-xs text-gray-500">À partir de</div>
                    <div className="text-2xl font-bold text-[#1B4332]">
                      {euros(c.price_per_session_cents)}
                      <span className="text-sm font-normal text-gray-500"> / session</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{c.availability}</div>
                  </div>
                  <Link
                    href={`/coach/humain/${c.id}`}
                    className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition"
                  >
                    Réserver →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Become a coach */}
      <section className="bg-[#1B4332] text-white px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🎯</span>
            <h2 className="text-2xl md:text-3xl font-black">Tu es coach ? Rejoins Adventurer</h2>
          </div>
          <p className="text-white/85 mb-8 max-w-2xl">
            Guide UIAGM, moniteur IKO, instructeur AIDA, entraîneur trail diplômé — on crée la première marketplace outdoor où les coachs gardent <strong>85%</strong> de chaque session (commission plateforme 15%). Paiement automatique via Stripe Connect, outils de planning intégrés, assurance RC pro incluse.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: '💰', title: '85% pour toi', desc: 'Commission 15% seulement. Paiement hebdo automatique via Stripe.' },
              { icon: '📅', title: 'Planning simple', desc: 'Définis tes créneaux, l\u2019app bloque, les clients réservent en 1 tap.' },
              { icon: '🛡️', title: 'RC Pro incluse', desc: 'Pas de paperasse — on prend l\u2019assurance pour toi dès la première session.' },
            ].map(f => (
              <div key={f.title} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="font-bold mb-1">{f.title}</div>
                <div className="text-sm text-white/75">{f.desc}</div>
              </div>
            ))}
          </div>

          <JoinAsCoachForm />
        </div>
      </section>

      {/* Footer nav */}
      <footer className="bg-white px-6 py-10 border-t border-gray-200">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-6 text-sm">
          <Link href="/coach/ai" className="text-[#1B4332] hover:underline">Coach IA</Link>
          <Link href="/explore" className="text-[#1B4332] hover:underline">Explorer les spots</Link>
          <Link href="/ambassadors" className="text-[#1B4332] hover:underline">Programme ambassadeurs</Link>
          <Link href="/legal/privacy" className="text-gray-500 hover:underline">Confidentialité</Link>
          <Link href="/legal/terms" className="text-gray-500 hover:underline">CGU</Link>
        </div>
      </footer>
    </main>
  );
}
