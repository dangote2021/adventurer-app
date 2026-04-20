import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Coaching outdoor — IA + humain',
  description:
    'Deux façons de progresser sur Adventurer. Le coach IA génère ton plan d\u2019entraînement en 30 secondes. Les coachs humains te font passer les caps en session 1:1.',
};

export default function CoachHubPage() {
  return (
    <main className="min-h-screen bg-[#FEFAE0]" style={{ colorScheme: 'light' }}>
      <section className="bg-[#1B4332] text-white px-6 py-14">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-white/70 text-sm hover:text-white">← Accueil</Link>
          <h1 className="text-4xl md:text-5xl font-black mt-4 mb-3">Progresse à ton rythme</h1>
          <p className="text-lg text-white/85 max-w-2xl">
            Deux types de coaching sur Adventurer. L'IA pour structurer ta prépa, les humains pour passer les caps.
          </p>
        </div>
      </section>

      <section className="px-6 py-10 max-w-4xl mx-auto grid md:grid-cols-2 gap-5">
        <Link
          href="/coach/ai"
          className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition"
        >
          <div className="bg-gradient-to-br from-[#2D6A4F] to-[#023E8A] px-6 py-5 text-white">
            <div className="text-4xl mb-2">🤖</div>
            <h2 className="text-2xl font-black">Coach IA</h2>
            <p className="text-sm opacity-90 mt-1">Gratuit · 30 secondes</p>
          </div>
          <div className="p-6 space-y-3">
            <p className="text-gray-800">
              Tu dis ton objectif, l'app génère un plan semaine par semaine avec sessions, nutrition, matos.
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ 17 sports couverts (trail, kite, apnée, alpi, escalade…)</li>
              <li>✓ Adapté à ton niveau actuel et ta dispo</li>
              <li>✓ Exporté en un clic</li>
            </ul>
            <div className="pt-2 text-[#1B4332] font-semibold group-hover:underline">
              Générer mon plan →
            </div>
          </div>
        </Link>

        <Link
          href="/coach/humain"
          className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition"
        >
          <div className="bg-gradient-to-br from-[#F77F00] to-[#DDA15E] px-6 py-5 text-white">
            <div className="text-4xl mb-2">🏆</div>
            <h2 className="text-2xl font-black">Coachs humains</h2>
            <p className="text-sm opacity-90 mt-1">Session à partir de 65 €</p>
          </div>
          <div className="p-6 space-y-3">
            <p className="text-gray-800">
              Guides UIAGM, instructeurs AIDA, moniteurs IKO, coachs trail diplômés. Vérifiés et assurés.
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ Visio + session terrain</li>
              <li>✓ Paiement Stripe sécurisé</li>
              <li>✓ Satisfait ou remboursé sur la 1<sup>re</sup> session</li>
            </ul>
            <div className="pt-2 text-[#1B4332] font-semibold group-hover:underline">
              Voir les coachs →
            </div>
          </div>
        </Link>
      </section>

      <section className="px-6 py-10 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-6 border border-[#2D6A4F]/20">
          <h3 className="font-bold text-[#1B4332] mb-2">💡 L'approche Adventurer</h3>
          <p className="text-gray-800 leading-relaxed">
            L'IA te donne la structure, les humains te font franchir les caps. Beaucoup d'athlètes combinent les deux : plan IA sur 12 semaines, puis 2-3 sessions humaines pour corriger les détails que l'IA ne voit pas (posture en foil, lecture de paroi, technique d'apnée).
          </p>
        </div>
      </section>
    </main>
  );
}
