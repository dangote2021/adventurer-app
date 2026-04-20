'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import Image from 'next/image';

interface Coach {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  certification: string;
  rating: number;
  reviews: number;
  pricePerHour: number;
  availability: string;
  bio: string;
}

const COACHES: Coach[] = [
  {
    id: 'coach-1',
    name: 'Marie Leblanc',
    avatar: '👩‍🏫',
    specialty: 'Trail Running',
    certification: 'IFMGA Guide',
    rating: 4.9,
    reviews: 47,
    pricePerHour: 65,
    availability: 'Lun-Sam',
    bio: 'Coach spécialisée en ultra-trail. 15 ans d\'expérience.',
  },
  {
    id: 'coach-2',
    name: 'Laurent Dupont',
    avatar: '👨‍🏫',
    specialty: 'Escalade',
    certification: 'CAF Moniteur',
    rating: 4.8,
    reviews: 35,
    pricePerHour: 55,
    availability: 'Mar-Dim',
    bio: 'Passionné par la grimpe technique. Spécialiste bloc et tête.',
  },
  {
    id: 'coach-3',
    name: 'Sophie Martin',
    avatar: '👩‍🦰',
    specialty: 'Kitesurf',
    certification: 'FFVL Pro',
    rating: 4.7,
    reviews: 28,
    pricePerHour: 75,
    availability: 'Mer-Dim',
    bio: 'Championne regionale. Spécialiste freestyle et progression.',
  },
  {
    id: 'coach-4',
    name: 'Thomas Bernard',
    avatar: '👨‍⚕️',
    specialty: 'Alpinisme',
    certification: 'Guide Montagne',
    rating: 5.0,
    reviews: 52,
    pricePerHour: 85,
    availability: 'Lun-Jeu',
    bio: 'Expert Mont-Blanc et hautes altitudes. Préparation physique incluse.',
  },
  {
    id: 'coach-5',
    name: 'Claire Rodriguez',
    avatar: '🧑‍🤝‍🧑',
    specialty: 'Outdoor Multisport',
    certification: 'Coach IRATA',
    rating: 4.6,
    reviews: 41,
    pricePerHour: 60,
    availability: 'Lun-Ven',
    bio: 'Approche holistique du training outdoor. Nutrition intégrée.',
  },
  {
    id: 'coach-6',
    name: 'Paolo Verdi',
    avatar: '🤿',
    specialty: 'Apnée / Freedive',
    certification: 'AIDA Instructor',
    rating: 4.9,
    reviews: 33,
    pricePerHour: 70,
    availability: 'Mer-Dim',
    bio: 'Instructeur AIDA certifié. Spécialiste tables CO2/O2 et progression profondeur.',
  },
];

import { t } from '@/lib/i18n';
import BookingModal from '@/components/modals/BookingModal';

export default function CoachHubPage() {
  const { closeSubPage, openUserProfile, showToast, language, setSubPage, coachBookings } = useStore();
  const [tab, setTab] = useState<'find' | 'become'>('find');
  const [bookingCoach, setBookingCoach] = useState<Coach | null>(null);

  return (
    <div className="min-h-screen bg-[var(--bg)] max-w-[430px] mx-auto pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-white/5">
        <button
          type="button"
          onClick={closeSubPage}
          className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          aria-label={t('common.backAria', language)}
        >
          ←
        </button>
        <h2 className="font-semibold text-base">🏆 {t('coachHub.title', language)}</h2>
      </div>

      {/* Tabs */}
      <div className="sticky top-12 z-30 bg-[var(--bg)]/95 backdrop-blur-sm px-4 py-3 border-b border-white/5 flex gap-4">
        <button
          type="button"
          onClick={() => setTab('find')}
          className={`flex-1 py-2 font-medium transition rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 text-sm ${
            tab === 'find'
              ? 'bg-[var(--accent)] text-white focus-visible:outline-[var(--accent)]'
              : 'text-gray-400 hover:text-white focus-visible:outline-white/20'
          }`}
          aria-label={t('coachHub.findTab', language)}
          aria-selected={tab === 'find'}
        >
          🔍 {t('coachHub.findTab', language)}
        </button>
        <button
          type="button"
          onClick={() => setTab('become')}
          className={`flex-1 py-2 font-medium transition rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 text-sm ${
            tab === 'become'
              ? 'bg-[var(--accent)] text-white focus-visible:outline-[var(--accent)]'
              : 'text-gray-400 hover:text-white focus-visible:outline-white/20'
          }`}
          aria-label={t('coachHub.becomeTab', language)}
          aria-selected={tab === 'become'}
        >
          📢 {t('coachHub.becomeTab', language)}
        </button>
      </div>

      <div className="px-4 py-4">
        {tab === 'find' && (
          <div className="space-y-4">
            {/* My bookings shortcut */}
            {coachBookings.filter(b => b.status !== 'cancelled').length > 0 && (
              <button
                type="button"
                onClick={() => setSubPage('my-bookings')}
                className="w-full bg-gradient-to-r from-[var(--accent)]/20 to-blue-500/20 border border-[var(--accent)]/30 rounded-xl p-3 flex items-center justify-between hover:opacity-90 transition"
              >
                <span className="text-sm font-medium">📅 {t('booking.myBookings', language)} ({coachBookings.filter(b => b.status !== 'cancelled').length})</span>
                <span className="text-sm">→</span>
              </button>
            )}
            {/* Coach cards */}
            {COACHES.map(coach => (
              <div key={coach.id} className="bg-[var(--card)] rounded-2xl p-4 space-y-3">
                {/* Coach header */}
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => openUserProfile(coach.id)}
                    className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 rounded-lg"
                    aria-label={`Profil de ${coach.name}`}
                  >
                    <div className="text-4xl flex-shrink-0">{coach.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate text-sm">{coach.name}</p>
                      <p className="text-gray-400 truncate text-[13px]">{coach.specialty}</p>
                    </div>
                  </button>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <p className="font-bold text-sm">{coach.rating}</p>
                    <p className="text-gray-400 text-xs">({coach.reviews})</p>
                  </div>
                </div>

                {/* Certification & availability */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-xs" aria-label={`Certification: ${coach.certification}`}>
                    ✓ {coach.certification}
                  </span>
                  <span className="px-2 py-1 bg-green-900/30 text-green-300 rounded text-xs" aria-label={`Disponibilité: ${coach.availability}`}>
                    📅 {coach.availability}
                  </span>
                </div>

                {/* Bio */}
                <p className="text-gray-300 text-sm">{coach.bio}</p>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-2">
                  <span className="font-bold text-[var(--accent)] text-sm">{coach.pricePerHour}€/h</span>
                  <button
                    type="button"
                    onClick={() => setBookingCoach(coach)}
                    className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] text-sm"
                    aria-label={`Réserver une session avec ${coach.name}`}
                  >
                    📅 {t('booking.book', language)}
                  </button>
                </div>
              </div>
            ))}

            {/* View all button */}
            <button
              type="button"
              onClick={() => showToast(t('coachHub.viewAllToast', language), 'info', '📋')}
              className="w-full py-3 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/20 text-sm"
              aria-label={t('coachHub.viewAll', language)}
            >
              {t('coachHub.viewAll', language)}
            </button>
          </div>
        )}

        {tab === 'become' && (
          <div className="space-y-4 py-8">
            <div className="text-center space-y-4">
              <p className="text-5xl">🎯</p>
              <h3 className="font-bold text-lg">{t('coachHub.becomeTitle', language)}</h3>
              <p className="text-gray-400 text-sm">{t('coachHub.becomeDesc', language)}</p>
            </div>

            <div className="space-y-3">
              <div className="bg-[var(--card)] rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-sm">✓ {t('coachHub.advantages', language)}</h4>
                <ul className="space-y-1">
                  {[
                    t('coachHub.adv1', language),
                    t('coachHub.adv2', language),
                    t('coachHub.adv3', language),
                    t('coachHub.adv4', language),
                  ].map((item, i) => (
                    <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-[var(--accent)] mt-0.5 flex-shrink-0">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[var(--card)] rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-sm">📋 {t('coachHub.requirements', language)}</h4>
                <ul className="space-y-1">
                  {[
                    t('coachHub.req1', language),
                    t('coachHub.req2', language),
                    t('coachHub.req3', language),
                    t('coachHub.req4', language),
                  ].map((item, i) => (
                    <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => showToast(t('coachHub.submittedToast', language), 'success', '✅')}
              className="w-full py-3 bg-[var(--accent)] text-white rounded-xl font-bold hover:opacity-90 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] text-sm"
              aria-label={t('coachHub.submitApp', language)}
            >
              {t('coachHub.submitApp', language)}
            </button>

            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  navigator.clipboard.writeText('adventurer.app.outdoor@gmail.com').catch(() => {});
                }
                showToast(t('coachHub.emailCopied', language), 'success', '📋');
              }}
              className="w-full text-center text-gray-400 text-xs hover:text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/20 rounded py-1"
              aria-label="Copier l'email de support"
            >
              {t('common.questions', language)} {t('coachHub.contactSupport', language)} adventurer.app.outdoor@gmail.com
            </button>
          </div>
        )}
      </div>

      {bookingCoach && (
        <BookingModal
          coach={bookingCoach}
          onClose={() => setBookingCoach(null)}
        />
      )}
    </div>
  );
}
