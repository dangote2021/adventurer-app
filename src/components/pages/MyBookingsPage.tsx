'use client';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

export default function MyBookingsPage() {
  const { closeSubPage, language, coachBookings, cancelBooking, showToast } = useStore();
  const active = coachBookings.filter(b => b.status !== 'cancelled');

  const handleCancel = (id: string) => {
    cancelBooking(id);
    showToast(t('booking.cancelled', language), 'info', '↩️');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] max-w-[430px] mx-auto pb-8">
      <div className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-white/5">
        <button
          type="button"
          onClick={closeSubPage}
          className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition"
          aria-label={t('common.back', language)}
        >←</button>
        <h2 className="font-semibold text-base">📅 {t('booking.myBookings', language)}</h2>
      </div>

      <div className="px-4 py-4 space-y-3">
        {active.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">📭</p>
            <p>{t('booking.noBookings', language)}</p>
          </div>
        )}

        {active.map(b => {
          const dateFr = new Date(b.date + 'T' + b.time).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
            weekday: 'long', day: 'numeric', month: 'long'
          });
          return (
            <div key={b.id} className="bg-[var(--card)] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🏆</div>
                  <div>
                    <p className="font-bold text-sm">{b.coachName}</p>
                    <p className="text-gray-400 text-xs">{b.sport}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-medium ${
                  b.status === 'confirmed' ? 'bg-green-900/40 text-green-300' :
                  b.status === 'completed' ? 'bg-blue-900/40 text-blue-300' :
                  'bg-amber-900/40 text-amber-300'
                }`}>
                  {t(`booking.status.${b.status}`, language)}
                </span>
              </div>

              <div className="bg-white/5 rounded-lg p-3 text-sm">
                <p className="font-medium">📆 {dateFr}</p>
                <p className="text-gray-400 text-xs mt-1">🕐 {b.time} · {b.duration} min · {b.price}€</p>
                {b.notes && <p className="text-gray-300 text-xs mt-2 italic">"{b.notes}"</p>}
              </div>

              {b.status === 'confirmed' && (
                <button
                  type="button"
                  onClick={() => handleCancel(b.id)}
                  className="w-full py-2 bg-white/5 text-gray-300 rounded-lg text-xs hover:bg-white/10 transition"
                >
                  {t('booking.cancel', language)}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
