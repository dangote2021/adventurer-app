'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

// ------- shared modal shell -------
function ModalShell({ onClose, children, title, language }: { onClose: () => void; title: string; children: React.ReactNode; language: 'fr' | 'en' }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[200] bg-black/70 flex items-end sm:items-center justify-center" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-[var(--card)] w-full max-w-[430px] rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-[var(--card)] px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-bold text-base">{title}</h3>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center" aria-label={t('common.close', language)}>✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ------- Quick Match Modal -------
export function QuickMatchModal({ spotTitle, spotId, sport, onClose }: {
  spotTitle: string; spotId?: number; sport: string; onClose: () => void;
}) {
  const { language, addQuickMatch, userName, showToast } = useStore();
  const [date, setDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('09:00');
  const [level, setLevel] = useState<'debutant' | 'intermediaire' | 'confirme' | 'tous'>('tous');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    addQuickMatch({
      authorId: 'me',
      authorName: userName || t('common.me', language),
      sport,
      spotTitle,
      spotId,
      date,
      time,
      level,
      notes: notes.trim() || undefined,
    });
    showToast(t('qm.published', language), 'success', '📢');
    onClose();
  };

  return (
    <ModalShell title={`🤝 ${t('qm.title', language)}`} onClose={onClose} language={language}>
      <p className="text-sm text-gray-300 mb-4">{t('qm.description', language)}</p>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-400 block mb-1">{t('qm.date', language)}</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm" min={new Date().toISOString().split('T')[0]} />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">{t('qm.time', language)}</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)}
            className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">{t('qm.level', language)}</label>
          <div className="grid grid-cols-4 gap-1">
            {(['tous', 'debutant', 'intermediaire', 'confirme'] as const).map(l => (
              <button key={l} type="button" onClick={() => setLevel(l)}
                className={`py-2 rounded-lg text-xs font-medium ${level === l ? 'bg-[var(--accent)] text-white' : 'bg-white/5 text-gray-300'}`}>
                {l === 'tous' ? t('qm.allShort', language) : l.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">{t('qm.notes', language)}</label>
          <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
            placeholder={t('qm.notesPlaceholder', language)}
            className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm resize-none" />
        </div>
        <button type="button" onClick={handleSubmit} className="w-full py-3 bg-[var(--accent)] text-white rounded-xl font-bold">
          📢 {t('qm.publish', language)}
        </button>
      </div>
    </ModalShell>
  );
}

// ------- Safety Check-in Modal -------
export function SafetyCheckInModal({ routeTitle, sport, onClose }: {
  routeTitle: string; sport: string; onClose: () => void;
}) {
  const { language, addSafetyCheckIn, showToast, defaultEmergencyContact, defaultEmergencyPhone } = useStore();
  const [start, setStart] = useState(() => {
    const d = new Date(); d.setHours(d.getHours() + 1, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [end, setEnd] = useState(() => {
    const d = new Date(); d.setHours(d.getHours() + 5, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  // C2 — pré-remplir avec le contact sauvegardé pour le check-in en 1 tap
  const [contact, setContact] = useState(defaultEmergencyContact || '');
  const [phone, setPhone] = useState(defaultEmergencyPhone || '');

  const handleSubmit = () => {
    if (!contact.trim() || !phone.trim()) {
      showToast(t('safety.contactRequired', language), 'warning', '⚠️');
      return;
    }
    addSafetyCheckIn({
      routeTitle,
      sport,
      startAt: new Date(start).toISOString(),
      expectedReturnAt: new Date(end).toISOString(),
      emergencyContact: contact.trim(),
      emergencyPhone: phone.trim(),
    });
    showToast(t('safety.activated', language), 'success', '🛡️');
    onClose();
  };

  return (
    <ModalShell title={`🛡️ ${t('safety.title', language)}`} onClose={onClose} language={language}>
      <div className="bg-emerald-900/20 border border-emerald-800/30 rounded-xl p-3 mb-4 flex items-start gap-2">
        <span className="text-lg">🤍</span>
        <p className="text-xs text-emerald-300">{t('safety.freeForever', language)}</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-400 block mb-1">{t('safety.startAt', language)}</label>
          <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)}
            className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">{t('safety.returnAt', language)}</label>
          <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)}
            className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">{t('safety.contact', language)}</label>
          <input type="text" value={contact} onChange={e => setContact(e.target.value)}
            placeholder={t('safety.contactPlaceholder', language)}
            className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">{t('safety.contactPhone', language)}</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="+33 6 12 34 56 78"
            className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button type="button" onClick={handleSubmit} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold">
          🛡️ {t('safety.activate', language)}
        </button>
      </div>
    </ModalShell>
  );
}

// ------- Route Report Modal -------
export function RouteReportModal({ routeId, routeTitle, onClose }: {
  routeId: number; routeTitle: string; onClose: () => void;
}) {
  const { language, addRouteReport, userName, showToast } = useStore();
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [rating, setRating] = useState<'idéal' | 'correct' | 'difficile' | 'déconseillé'>('correct');
  const [conditions, setConditions] = useState('');
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!conditions.trim()) {
      showToast(t('report.conditionsRequired', language), 'warning', '⚠️');
      return;
    }
    addRouteReport({
      routeId,
      routeTitle,
      authorName: userName || (language === 'fr' ? 'Anonyme' : 'Anonymous'),
      conditions: conditions.trim(),
      rating,
      text: text.trim(),
      date,
    });
    showToast(t('report.submitted', language), 'success', '📝');
    onClose();
  };

  const RATINGS: Array<'idéal' | 'correct' | 'difficile' | 'déconseillé'> = ['idéal', 'correct', 'difficile', 'déconseillé'];

  return (
    <ModalShell title={`📝 ${t('report.title', language)}`} onClose={onClose} language={language}>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-400 block mb-1">{t('report.date', language)}</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">{t('report.rating', language)}</label>
          <div className="grid grid-cols-2 gap-1.5">
            {RATINGS.map(r => (
              <button key={r} type="button" onClick={() => setRating(r)}
                className={`py-2 rounded-lg text-xs font-medium ${rating === r ? 'bg-[var(--accent)] text-white' : 'bg-white/5 text-gray-300'}`}>
                {t(`report.rating.${r === 'idéal' ? 'ideal' : r === 'correct' ? 'correct' : r === 'difficile' ? 'difficult' : 'no'}`, language)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">{t('report.conditions', language)}</label>
          <input type="text" value={conditions} onChange={e => setConditions(e.target.value)}
            placeholder={t('report.conditionsPlaceholder', language)}
            className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">{t('report.text', language)}</label>
          <textarea rows={4} value={text} onChange={e => setText(e.target.value)}
            className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm resize-none" />
        </div>
        <button type="button" onClick={handleSubmit} className="w-full py-3 bg-[var(--accent)] text-white rounded-xl font-bold">
          📝 {t('report.submit', language)}
        </button>
      </div>
    </ModalShell>
  );
}
