/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { apiUrl } from '@/lib/api-url';

const PERKS = [
  { emoji: '💸', title: '5 € par inscription', desc: 'Commission sur chaque filleul actif, payée via Stripe.' },
  { emoji: '🎒', title: 'Matos early-access', desc: 'Accès aux nouveautés marketplace avant tout le monde.' },
  { emoji: '🎬', title: 'Contenu co-produit', desc: 'On t\'aide à produire des reels / vidéos sur tes spots favoris.' },
  { emoji: '🏔️', title: 'Ton spot en vedette', desc: 'Tes itinéraires et spots mis en avant sur Explorer.' },
];

const SPORTS = [
  'Kitesurf','Surf','Wing foil','Windsurf','Voile','Plongée','Apnée','Paddle',
  'Trail','Ultra-trail','Randonnée','Alpinisme','Escalade',
  'Parapente','Speedriding','Ski de rando','VTT','Gravel',
];

export default function AmbassadorsPage() {
  const [form, setForm] = useState({
    email: '',
    display_name: '',
    sport: 'Kitesurf',
    city: '',
    country: 'FR',
    instagram_handle: '',
    audience_size: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl('/api/ambassador/apply'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          audience_size: form.audience_size ? Number(form.audience_size) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Une erreur est survenue.');
      setSuccess(data.referral_code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1B4332] via-[#2D6A4F] to-[#081C15] text-white">
      <div className="max-w-[720px] mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="text-5xl mb-4">🏔️</div>
          <h1 className="text-4xl font-black tracking-tight">Rejoins les Ambassadeurs</h1>
          <p className="mt-3 text-white/80 max-w-md mx-auto">
            Adventurer cherche <strong>20 passionnés outdoor</strong> pour lancer la communauté
            dans leur sport et leur région. Tu en fais partie ?
          </p>
          <a href="/how-it-works" className="inline-block mt-4 text-sm text-[#F77F00] underline underline-offset-4 hover:text-white">
            Comment ça marche ? → voir le détail du programme
          </a>
        </div>

        <section className="grid grid-cols-2 gap-4 mb-12">
          {PERKS.map(p => (
            <div key={p.title} className="bg-white/10 backdrop-blur-md rounded-2xl p-5">
              <div className="text-3xl mb-2">{p.emoji}</div>
              <h3 className="font-bold">{p.title}</h3>
              <p className="text-sm text-white/70 mt-1">{p.desc}</p>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-3xl p-6 text-gray-800" style={{ colorScheme: 'light' }}>
          <h2 className="text-2xl font-black text-[#1B4332] mb-2">Candidate en 30 secondes</h2>
          <p className="text-gray-500 text-sm mb-6">On répond sous 48h.</p>

          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="font-bold text-[#1B4332] text-lg">Bienvenue !</h3>
              <p className="text-sm text-gray-600 mt-2">Ton code ambassadeur :</p>
              <p className="font-mono text-2xl font-bold text-[#2D6A4F] tracking-widest mt-2">{success}</p>
              <p className="text-xs text-gray-500 mt-4">
                Vérifie ta boîte mail, on vient de t'envoyer tout le kit de démarrage.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  placeholder="Prénom *"
                  value={form.display_name}
                  onChange={e => setForm({ ...form, display_name: e.target.value })}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:border-[#2D6A4F] outline-none bg-white text-gray-900 placeholder-gray-400"
                />
                <input
                  required
                  type="email"
                  placeholder="Email *"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:border-[#2D6A4F] outline-none bg-white text-gray-900 placeholder-gray-400"
                />
              </div>
              <select
                required
                value={form.sport}
                onChange={e => setForm({ ...form, sport: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#2D6A4F] outline-none bg-white text-gray-900 placeholder-gray-400"
              >
                {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  placeholder="Ville *"
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:border-[#2D6A4F] outline-none bg-white text-gray-900 placeholder-gray-400"
                />
                <select
                  required
                  value={form.country}
                  onChange={e => setForm({ ...form, country: e.target.value })}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:border-[#2D6A4F] outline-none bg-white text-gray-900 placeholder-gray-400"
                >
                  <option value="FR">France</option>
                  <option value="ES">Espagne</option>
                  <option value="PT">Portugal</option>
                  <option value="IT">Italie</option>
                  <option value="CH">Suisse</option>
                  <option value="BE">Belgique</option>
                  <option value="MA">Maroc</option>
                  <option value="DE">Allemagne</option>
                  <option value="AT">Autriche</option>
                  <option value="GR">Grèce</option>
                  <option value="HR">Croatie</option>
                  <option value="NO">Norvège</option>
                  <option value="OTHER">Autre</option>
                </select>
              </div>
              <input
                placeholder="@instagram (optionnel)"
                value={form.instagram_handle}
                onChange={e => setForm({ ...form, instagram_handle: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#2D6A4F] outline-none bg-white text-gray-900 placeholder-gray-400"
              />
              <input
                type="number"
                placeholder="Taille audience (abonnés) — optionnel"
                value={form.audience_size}
                onChange={e => setForm({ ...form, audience_size: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#2D6A4F] outline-none bg-white text-gray-900 placeholder-gray-400"
              />
              {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1B4332] text-white font-bold py-4 rounded-xl hover:bg-[#2D6A4F] transition-colors disabled:opacity-50"
              >
                {loading ? 'Envoi…' : 'Candidater'}
              </button>
            </form>
          )}
        </section>

        <p className="text-center text-white/50 text-xs mt-10">
          Adventurer · Communauté outdoor · <a href="/" className="underline">Retour à l'app</a>
          {' · '}<a href="/legal/privacy" className="underline">Confidentialité</a>
          {' · '}<a href="/legal/terms" className="underline">CGU</a>
          {' · '}<a href="/legal/mentions" className="underline">Mentions</a>
        </p>
      </div>
    </div>
  );
}
