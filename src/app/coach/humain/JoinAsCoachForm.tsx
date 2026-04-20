'use client';

import { useState } from 'react';

export function JoinAsCoachForm() {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [sport, setSport] = useState('');
  const [certifications, setCertifications] = useState('');
  const [yearsExp, setYearsExp] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setMessage('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email,
          feature: 'coach-humain-onboarding',
          locale: 'fr',
          metadata: {
            display_name: displayName,
            sport,
            certifications,
            years_experience: yearsExp,
            city: locationCity,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setStatus('done');
      setMessage("Candidature reçue ! On te rappelle dans les 72h pour l'appel de vérification.");
    } catch (err: unknown) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  }

  if (status === 'done') {
    return (
      <div className="bg-emerald-500/15 border border-emerald-400/40 rounded-2xl p-6 text-white">
        <div className="text-2xl mb-2">✅ C'est noté</div>
        <p>{message}</p>
        <p className="text-sm text-white/70 mt-2">
          Tu vas recevoir un email de confirmation. Si tu as des photos/vidéos à partager, réponds directement à cet email.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-3" style={{ colorScheme: 'light' }}>
      <div className="grid md:grid-cols-2 gap-3">
        <input
          required
          type="text"
          placeholder="Ton nom / pseudo"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white text-gray-900 outline-none focus:ring-2 focus:ring-[#F77F00] w-full"
        />
        <input
          required
          type="email"
          placeholder="Ton email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white text-gray-900 outline-none focus:ring-2 focus:ring-[#F77F00] w-full"
        />
        <input
          required
          type="text"
          placeholder="Ton sport principal (ex: Kitesurf)"
          value={sport}
          onChange={e => setSport(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white text-gray-900 outline-none focus:ring-2 focus:ring-[#F77F00] w-full"
        />
        <input
          required
          type="text"
          placeholder="Ta ville"
          value={locationCity}
          onChange={e => setLocationCity(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white text-gray-900 outline-none focus:ring-2 focus:ring-[#F77F00] w-full"
        />
        <input
          required
          type="text"
          placeholder="Tes certifications (ex: UIAGM, IKO L3, BPJEPS)"
          value={certifications}
          onChange={e => setCertifications(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white text-gray-900 outline-none focus:ring-2 focus:ring-[#F77F00] w-full md:col-span-2"
        />
        <input
          required
          type="number"
          min="1"
          max="50"
          placeholder="Années d'expérience en coaching"
          value={yearsExp}
          onChange={e => setYearsExp(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white text-gray-900 outline-none focus:ring-2 focus:ring-[#F77F00] w-full md:col-span-2"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full bg-[#F77F00] hover:bg-[#E66F00] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition"
      >
        {status === 'sending' ? 'Envoi…' : 'Postuler — Appel de vérification 72h'}
      </button>
      {status === 'error' && <p className="text-red-300 text-sm">{message}</p>}
      <p className="text-xs text-white/60 text-center">
        Tu gardes la main sur tes tarifs et ton planning. Aucune exclusivité demandée.
      </p>
    </form>
  );
}
