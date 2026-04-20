'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { SPORTS } from '@/lib/sports-config';
import { t } from '@/lib/i18n';

interface CreateChallengeModalProps {
  onClose: () => void;
}

export default function CreateChallengeModal({ onClose }: CreateChallengeModalProps) {
  const { userName, selectedSports, language, createUserChallenge, showToast } = useStore();
  const fr = language === 'fr';

  const [title, setTitle] = useState('');
  const [sport, setSport] = useState(selectedSports[0] || '');
  const [distance, setDistance] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  // Get emoji for selected sport
  const sportData = SPORTS.find(s => s.name === sport);
  const emoji = sportData?.emoji || '🏁';

  // Show user's sports first, then all others
  const sortedSports = [
    ...SPORTS.filter(s => selectedSports.includes(s.name)),
    ...SPORTS.filter(s => !selectedSports.includes(s.name)),
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !sport || !date) return;

    createUserChallenge({
      authorName: userName || (fr ? 'Aventurier' : 'Adventurer'),
      title: title.trim(),
      sport,
      distance: distance.trim() || undefined,
      date,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
      emoji,
    });

    showToast(t('challenges.created', language), 'success', '🏁');
    onClose();
  };

  const inputClass = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition text-sm';
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1';

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-[var(--card)] rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[var(--card)] border-b border-white/5 p-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-white">{t('challenges.createTitle', language)}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Challenge name */}
          <div>
            <label className={labelClass}>{t('challenges.name', language)} *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t('challenges.namePlaceholder', language)}
              className={inputClass}
              required
              autoFocus
            />
          </div>

          {/* Sport selector */}
          <div>
            <label className={labelClass}>{t('challenges.sport', language)} *</label>
            <select
              value={sport}
              onChange={e => setSport(e.target.value)}
              className={`${inputClass} appearance-none`}
              required
            >
              <option value="" disabled>{fr ? 'Choisis un sport' : 'Pick a sport'}</option>
              {sortedSports.map(s => (
                <option key={s.name} value={s.name}>
                  {s.emoji} {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Distance + Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t('challenges.distance', language)}</label>
              <input
                type="text"
                value={distance}
                onChange={e => setDistance(e.target.value)}
                placeholder={t('challenges.distancePlaceholder', language)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('challenges.date', language)} *</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className={inputClass}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className={labelClass}>{t('challenges.location', language)}</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder={t('challenges.locationPlaceholder', language)}
              className={inputClass}
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>{t('challenges.description', language)}</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t('challenges.descriptionPlaceholder', language)}
              className={`${inputClass} resize-none h-20`}
            />
          </div>

          {/* Preview card */}
          {title && (
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-xs text-gray-500 mb-1">{fr ? 'Aperçu' : 'Preview'}</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{emoji}</span>
                <div>
                  <p className="text-sm font-bold text-white">{title}</p>
                  <p className="text-xs text-gray-400">
                    {sport}{distance ? ` · ${distance}` : ''}{location ? ` · ${location}` : ''}
                    {date ? ` · ${new Date(date).toLocaleDateString(fr ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-white/5 border border-white/10 text-gray-300 rounded-xl font-medium hover:bg-white/10 transition text-sm"
            >
              {t('challenges.cancel', language)}
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !sport || !date}
              className="flex-1 py-3 bg-[var(--accent)] text-white rounded-xl font-bold hover:opacity-90 transition text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t('challenges.publish', language)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
