'use client';

import { useState } from 'react';
import { apiUrl } from '@/lib/api-url';

type Props = { coachId: string; coachName: string; sport: string };

export function BookingForm({ coachId, coachName, sport }: Props) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [level, setLevel] = useState('intermediaire');
  const [goal, setGoal] = useState('');
  const [preferred_dates, setPreferredDates] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setMessage('');
    try {
      const res = await fetch(apiUrl('/api/waitlist'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email,
          feature: `coach-booking-${coachId}`,
          locale: 'fr',
          metadata: {
            coach_id: coachId,
            coach_name: coachName,
            sport,
            client_name: name,
            level,
            goal,
            preferred_dates,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setStatus('done');
      setMessage(`${coachName} a reçu ta demande et te recontacte sous 48h.`);
    } catch (err: unknown) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  }

  if (status === 'done') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6">
        <div className="text-2xl mb-2">✅ Demande envoyée</div>
        <p className="text-[#1B4332]">{message}</p>
        <p className="text-sm text-gray-600 mt-3">
          En attendant, tu peux aussi tester le <a href="/coach/ai" className="text-[#1B4332] underline">coach IA</a> pour prépa l'entraînement.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <input
          required
          type="text"
          placeholder="Ton prénom"
          value={name}
          onChange={e => setName(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-200 outline-none focus:ring-2 focus:ring-[#2D6A4F] w-full"
        />
        <input
          required
          type="email"
          placeholder="Ton email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-200 outline-none focus:ring-2 focus:ring-[#2D6A4F] w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1B4332] mb-2">Ton niveau en {sport}</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'debutant', label: 'Débutant' },
            { id: 'intermediaire', label: 'Intermédiaire' },
            { id: 'confirme', label: 'Confirmé' },
          ].map(l => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLevel(l.id)}
              className={`px-3 py-2 rounded-xl border text-sm font-medium transition ${
                level === l.id
                  ? 'bg-[#1B4332] border-[#1B4332] text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-[#1B4332]'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <textarea
        required
        rows={3}
        placeholder="Ton objectif (ex: passer 20m en apnée, préparer l'UTMB 2026, maîtriser le bottom-turn...)"
        value={goal}
        onChange={e => setGoal(e.target.value)}
        className="px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-200 outline-none focus:ring-2 focus:ring-[#2D6A4F] w-full resize-none"
      />

      <input
        type="text"
        placeholder="Dates ou créneaux préférés (optionnel)"
        value={preferred_dates}
        onChange={e => setPreferredDates(e.target.value)}
        className="px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-200 outline-none focus:ring-2 focus:ring-[#2D6A4F] w-full"
      />

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition"
      >
        {status === 'sending' ? 'Envoi…' : `Envoyer la demande à ${coachName}`}
      </button>
      {status === 'error' && <p className="text-red-600 text-sm">{message}</p>}
      <p className="text-xs text-gray-500 text-center">
        Aucun paiement à cette étape. {coachName} te propose 2-3 créneaux en retour.
      </p>
    </form>
  );
}
