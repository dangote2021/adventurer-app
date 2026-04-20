'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';

export default function PremiumPage() {
  const { closeSubPage, showToast, submitPremiumInterest, language, userEmail: initialEmail, showPaywall } = useStore();

  const [email, setEmail] = useState(initialEmail || '');
  const [isLoading, setIsLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const fr = language === 'fr';

  const features = fr
    ? [
      { icon: '🗺️', label: 'Cartes hors-ligne HD' },
      { icon: '🏔️', label: 'Parcours exclusifs' },
      { icon: '📊', label: 'Stats avancées' },
      { icon: '🤖', label: 'AI Trip Planner illimité' },
      { icon: '🔔', label: 'Alertes météo personnalisées' },
      { icon: '👑', label: 'Badge Premium sur ton profil' },
    ]
    : [
      { icon: '🗺️', label: 'Offline HD maps' },
      { icon: '🏔️', label: 'Exclusive routes' },
      { icon: '📊', label: 'Advanced stats' },
      { icon: '🤖', label: 'Unlimited AI Trip Planner' },
      { icon: '🔔', label: 'Custom weather alerts' },
      { icon: '👑', label: 'Premium badge on profile' },
    ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast(fr ? 'Saisis ton email' : 'Enter your email', 'error');
      return;
    }
    setIsLoading(true);
    submitPremiumInterest(email);
    showPaywall(); // mark as seen
    setTimeout(() => {
      showToast(fr ? 'Merci ! On te notifiera au lancement.' : 'Thanks! We\'ll notify you at launch.', 'success', '⭐');
      setIsLoading(false);
      closeSubPage();
    }, 800);
  };

  const handleClose = () => {
    showPaywall(); // mark as seen even if they dismiss
    closeSubPage();
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] max-w-[430px] mx-auto">
      {/* Close button */}
      <div className="sticky top-0 z-40 flex justify-end p-4">
        <button
          type="button"
          onClick={handleClose}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition text-white"
        >
          ✕
        </button>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden pt-2 pb-8 px-6 text-center"
        style={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #F77F00 100%)' }}
      >
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <path d="M0,200 L80,120 L160,160 L240,80 L320,140 L400,100 L400,200 Z" fill="white" />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-4xl">⭐</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Adventurer Premium</h1>
          <p className="text-white/80 text-sm max-w-xs mx-auto">
            {fr ? 'Déverrouille le plein potentiel de tes aventures' : 'Unlock the full potential of your adventures'}
          </p>
        </div>
      </div>

      <div className="px-6 py-8">
        {/* Features */}
        <div className="space-y-3 mb-8">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-xl border border-white/5">
              <span className="text-xl">{f.icon}</span>
              <span className="text-sm font-medium text-white">{f.label}</span>
            </div>
          ))}
        </div>

        {/* Pricing toggle */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
              billingCycle === 'monthly' ? 'bg-[var(--accent)] text-white' : 'text-gray-400'
            }`}
          >
            {fr ? 'Mensuel' : 'Monthly'}
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
              billingCycle === 'yearly' ? 'bg-[var(--accent)] text-white' : 'text-gray-400'
            }`}
          >
            {fr ? 'Annuel' : 'Yearly'}
          </button>
        </div>

        {/* Price display */}
        <div className="text-center mb-8">
          <div className="text-4xl font-black text-white mb-1">
            {billingCycle === 'monthly' ? '4.99€' : '39.99€'}
          </div>
          <div className="text-sm text-gray-400">
            {billingCycle === 'monthly' ? (fr ? '/mois' : '/month') : (fr ? '/an' : '/year')}
          </div>
          {billingCycle === 'yearly' && (
            <span className="inline-block mt-2 px-3 py-1 bg-[var(--accent)] text-white text-xs font-bold rounded-full">
              {fr ? 'Économise 33%' : 'Save 33%'}
            </span>
          )}
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={fr ? 'Ton email' : 'Your email'}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 mb-4 focus:border-[var(--accent)] focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-[#F77F00] to-[#FFB703] text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-[#F77F00]/20"
          >
            {isLoading
              ? (fr ? 'Envoi...' : 'Sending...')
              : (fr ? 'M\'alerter quand c\'est disponible' : 'Notify me when available')}
          </button>
        </form>

        {/* Launch date */}
        <p className="text-center text-xs text-gray-500 mb-6">
          {fr ? 'Lancement prévu Q3 2026 — accès prioritaire garanti' : 'Launch planned Q3 2026 — guaranteed priority access'}
        </p>

        {/* Continue free */}
        <button
          type="button"
          onClick={handleClose}
          className="w-full text-center text-sm text-[var(--accent)] hover:underline py-2"
        >
          {fr ? 'Continuer gratuitement' : 'Continue freely'}
        </button>
      </div>
    </div>
  );
}
