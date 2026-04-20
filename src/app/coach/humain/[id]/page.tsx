import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { COACHES, findCoach } from '../coaches';
import { BookingForm } from './BookingForm';

type Props = { params: { id: string } };

export async function generateStaticParams() {
  return COACHES.map(c => ({ id: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const coach = findCoach(params.id);
  if (!coach) return { title: 'Coach non trouvé — Adventurer' };
  return {
    title: `${coach.name} — Coach ${coach.sport} à ${coach.location}`,
    description: coach.bio,
    openGraph: {
      title: `${coach.name} — Coach ${coach.sport}`,
      description: coach.bio,
      url: `https://adventurer-outdoor.vercel.app/coach/humain/${coach.id}`,
    },
  };
}

function euros(cents: number) {
  return (cents / 100).toFixed(0) + ' €';
}

export default function CoachProfilePage({ params }: Props) {
  const coach = findCoach(params.id);
  if (!coach) notFound();

  return (
    <main className="min-h-screen bg-[#FEFAE0]" style={{ colorScheme: 'light' }}>
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/coach/humain" className="text-[#1B4332] hover:underline text-sm">
            ← Tous les coachs
          </Link>
          <Link href="/coach/ai" className="text-[#1B4332] hover:underline text-sm">
            Coach IA →
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section
        className="px-6 py-16 text-white"
        style={{ backgroundColor: coach.background_color }}
      >
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start gap-8">
          <div className="text-8xl">{coach.photo_emoji}</div>
          <div className="flex-1">
            <div className="inline-block bg-white/20 rounded-full px-3 py-1 text-xs font-semibold mb-3">
              {coach.sport} · {coach.universe}
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-2">{coach.name}</h1>
            <p className="text-lg opacity-90 mb-4">📍 {coach.location}</p>
            <p className="text-lg leading-relaxed max-w-2xl">{coach.bio}</p>
          </div>
        </div>
      </section>

      {/* Key facts */}
      <section className="px-6 py-8 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-4 gap-4">
          <Fact label="Expérience" value={`${coach.years_experience} ans`} />
          <Fact label="À partir de" value={euros(coach.price_per_session_cents)} />
          <Fact label="Disponibilités" value={coach.availability} />
          <Fact label="Langues" value={coach.languages?.join(', ') || 'Français'} />
        </div>
      </section>

      {/* Long description */}
      {coach.long_description && (
        <section className="px-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-[#1B4332] mb-3">La méthode</h2>
            <p className="text-gray-800 leading-relaxed whitespace-pre-line">{coach.long_description}</p>
          </div>
        </section>
      )}

      {/* Credentials + format */}
      <section className="px-6 py-8 max-w-4xl mx-auto grid md:grid-cols-2 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-gray-100">
          <h3 className="font-bold text-[#1B4332] mb-3">🏅 Certifications</h3>
          <ul className="space-y-2">
            {coach.certifications.map(cert => (
              <li key={cert} className="text-sm text-gray-800 flex items-start gap-2">
                <span className="text-emerald-600 mt-0.5">✓</span>
                <span>{cert}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100">
          <h3 className="font-bold text-[#1B4332] mb-3">🎯 Spécialités</h3>
          <div className="flex flex-wrap gap-2">
            {coach.specialties.map(s => (
              <span key={s} className="bg-[#F2F9F5] text-[#1B4332] px-3 py-1 rounded-full text-sm">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 md:col-span-2">
          <h3 className="font-bold text-[#1B4332] mb-3">📋 Format de la session</h3>
          <p className="text-gray-800">{coach.session_format}</p>
        </div>
      </section>

      {/* Booking */}
      <section className="px-6 py-10 bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-[#1B4332] mb-2">
            Réserver une session avec {coach.name}
          </h2>
          <p className="text-gray-700 mb-6">
            Les réservations Stripe Connect sont en phase pilote : dépose ta demande, {coach.name} te recontacte sous 48h pour valider la date et les créneaux. Aucun paiement à cette étape.
          </p>
          <BookingForm coachId={coach.id} coachName={coach.name} sport={coach.sport} />
        </div>
      </section>
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100">
      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">{label}</div>
      <div className="font-bold text-[#1B4332]">{value}</div>
    </div>
  );
}
