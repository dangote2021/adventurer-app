'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

interface Props {
  coach: {
    id: string;
    name: string;
    avatar: string;
    specialty: string;
    pricePerHour: number;
  };
  onClose: () => void;
}

const DURATIONS = [60, 90, 120];

function nextDays(count = 7, lang: 'fr' | 'en' = 'fr') {
  const out: Array<{ iso: string; label: string; day: string }> = [];
  const keys: Array<'booking.day.sun' | 'booking.day.mon' | 'booking.day.tue' | 'booking.day.wed' | 'booking.day.thu' | 'booking.day.fri' | 'booking.day.sat'> = [
    'booking.day.sun', 'booking.day.mon', 'booking.day.tue', 'booking.day.wed', 'booking.day.thu', 'booking.day.fri', 'booking.day.sat',
  ];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    out.push({
      iso: d.toISOString().split('T')[0],
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      day: t(keys[d.getDay()], lang),
    });
  }
  return out;
}

const SLOTS = ['08:00', '10:00', '14:00', '16:00', '18:00'];

export default function BookingModal({ coach, onClose }: Props) {
  const { language, bookCoach, setSubPage, showToast } = useStore();
  const days = nextDays(7, language);
  const [date, setDate] = useState(days[1].iso);
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const price = Math.round((coach.pricePerHour * duration) / 60);

  const handleConfirm = () => {
    bookCoach({
      coachId: coach.id,
      coachName: coach.name,
      sport: coach.specialty,
      date,
      time,
      duration,
      price,
      notes: notes.trim() || undefined,
    });
    showToast(t('booking.booked', language), 'success', '✅');
    onClose();
    setTimeout(() => setSubPage('my-bookings'), 400);
  };

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/70 flex items-end sm:items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('booking.title', language)}
    >
      <div
        className="bg-[var(--card)] w-full max-w-[430px] rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[var(--card)] px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{coach.avatar}</span>
            <div>
              <p className="font-bold text-sm">{coach.name}</p>
              <p className="text-gray-400 text-xs">{coach.specialty}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
            aria-label={t('common.close', language)}
          >✕</button>
        </div>

        <div className="p-5 space-y-5">
          <h3 className="font-bold text-lg">{t('booking.title', language)}</h3>

          {/* Date picker */}
          <div>
            <p className="text-sm text-gray-300 mb-2">{t('booking.selectDate', language)}</p>
            <div className="grid grid-cols-7 gap-1.5">
              {days.map(d => (
                <button
                  key={d.iso}
                  type="button"
                  onClick={() => setDate(d.iso)}
                  className={`py-2 rounded-lg text-xs font-medium transition ${
                    date === d.iso ? 'bg-[var(--accent)] text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <div className="text-[10px] opacity-70">{d.day}</div>
                  <div>{d.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Time slots */}
          <div>
            <p className="text-sm text-gray-300 mb-2">{t('booking.selectTime', language)}</p>
            <div className="grid grid-cols-3 gap-2">
              {SLOTS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTime(s)}
                  className={`py-2 rounded-lg text-sm font-medium transition ${
                    time === s ? 'bg-[var(--accent)] text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >{s}</button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <p className="text-sm text-gray-300 mb-2">{t('booking.duration', language)}</p>
            <div className="flex gap-2">
              {DURATIONS.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                    duration === d ? 'bg-[var(--accent)] text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >{d} min</button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="booking-notes" className="text-sm text-gray-300 mb-2 block">{t('booking.notes', language)}</label>
            <textarea
              id="booking-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={t('booking.notesPlaceholder', language)}
              rows={3}
              className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm resize-none focus:outline-2 focus:outline-[var(--accent)]"
            />
          </div>

          {/* Price summary */}
          <div className="bg-white/5 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">{t('booking.price', language)}</p>
              <p className="font-bold text-xl text-[var(--accent)]">{price}€</p>
            </div>
            <p className="text-[10px] text-gray-500 text-right max-w-[140px]">
              {t('booking.commissionInfo', language)}
            </p>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-3 bg-[var(--accent)] text-white rounded-xl font-bold hover:opacity-90 transition"
          >
            {t('booking.confirm', language)} — {price}€
          </button>
        </div>
      </div>
    </div>
  );
}
