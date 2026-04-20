'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const STATS = [
  { label: 'Inscriptions via ton code', value: '0', icon: '👥' },
  { label: 'Revenus cumul\u00e9s', value: '0,00\u00a0\u20ac', icon: '💸' },
  { label: 'Taux de conversion', value: '--', icon: '📊' },
  { label: 'Prochain versement', value: '50\u00a0\u20ac minimum', icon: '🏦' },
];

export default function AmbassadorDashboardPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || 'ADV-XXXX';
  const shareLink = `https://adventurer-outdoor.vercel.app?ref=${code}`;

  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      showToast('Lien copi\u00e9 !');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Impossible de copier le lien');
    }
  }

  async function handleShare() {
    const shareData = {
      title: 'Adventurer \u2014 Rejoins la communaut\u00e9 outdoor',
      text: `Rejoins Adventurer, l\u2019app outdoor de r\u00e9f\u00e9rence ! Utilise mon code ambassadeur ${code} pour t\u2019inscrire.`,
      url: shareLink,
    };
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or share failed, fallback to copy
        copyLink();
      }
    } else {
      copyLink();
    }
  }

  return (
    <main className="min-h-screen bg-[#FEFAE0] text-[#1B4332]" style={{ colorScheme: 'light' }}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#2D6A4F] text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="bg-[#1B4332] text-white px-6 py-5">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link href="/" className="font-bold text-xl">Adventurer</Link>
          <nav className="hidden md:flex gap-5 text-sm">
            <Link href="/explore" className="hover:underline">Explorer</Link>
            <Link href="/coach/ai" className="hover:underline">Coach IA</Link>
            <Link href="/ambassadors" className="hover:underline">Candidater</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Page title */}
        <div className="mb-8">
          <div className="inline-block bg-[#F77F00]/20 text-[#F77F00] text-xs px-3 py-1 rounded-full mb-3">
            Espace ambassadeur
          </div>
          <h1 className="text-3xl md:text-4xl font-black">Mon espace ambassadeur</h1>
        </div>

        {/* Referral code + link */}
        <section className="bg-white rounded-3xl p-6 border border-[#2D6A4F]/20 mb-6">
          <h2 className="text-lg font-bold mb-1">Ton code ambassadeur</h2>
          <p className="font-mono text-3xl font-black text-[#2D6A4F] tracking-widest mb-4">{code}</p>

          <label className="block text-sm font-semibold text-gray-600 mb-1">Ton lien de partage</label>
          <div className="flex gap-2">
            <input
              readOnly
              value={shareLink}
              className="flex-1 px-4 py-3 bg-[#FEFAE0] border border-gray-200 rounded-xl text-sm text-gray-800 font-mono select-all"
              onClick={e => (e.target as HTMLInputElement).select()}
            />
            <button
              type="button"
              onClick={copyLink}
              className={`px-5 py-3 rounded-xl font-bold text-sm transition-colors ${
                copied
                  ? 'bg-[#2D6A4F] text-white'
                  : 'bg-[#F77F00] text-white hover:bg-[#e06f00]'
              }`}
            >
              {copied ? '\u2713 Copi\u00e9' : 'Copier'}
            </button>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-4 mb-6">
          {STATS.map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-[#2D6A4F]/10">
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-[#1B4332] mt-1">{s.value}</p>
            </div>
          ))}
        </section>

        {/* Historique des paiements */}
        <section className="bg-white rounded-3xl p-6 border border-[#2D6A4F]/20 mb-6">
          <h2 className="text-lg font-bold mb-4">Historique des paiements</h2>
          <div className="text-center py-8">
            <div className="text-4xl mb-3">💳</div>
            <p className="text-gray-500 text-sm">Aucun paiement pour le moment</p>
            <p className="text-xs text-gray-400 mt-1">
              Les versements sont effectu\u00e9s via Stripe d\u00e8s 50\u00a0\u20ac cumul\u00e9s.
            </p>
          </div>
        </section>

        {/* Partager */}
        <section className="bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] rounded-3xl p-6 text-white mb-6">
          <h2 className="text-lg font-bold mb-2">Partager</h2>
          <p className="text-white/80 text-sm mb-4">
            Plus tu partages, plus tu gagnes. Chaque inscription via ton lien te rapporte 5\u00a0\u20ac.
          </p>
          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={copyLink}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-5 py-3 rounded-xl text-sm font-medium transition-colors"
            >
              <span>📋</span> Copier le lien
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-2 bg-[#F77F00] hover:bg-[#e06f00] px-5 py-3 rounded-xl text-sm font-bold transition-colors"
            >
              <span>📤</span> Partager
            </button>
          </div>
        </section>

        {/* Navigation links */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/ambassadors"
            className="flex-1 text-center bg-white border border-[#2D6A4F]/20 text-[#2D6A4F] font-semibold px-5 py-3 rounded-xl hover:bg-[#2D6A4F]/5 transition-colors text-sm"
          >
            Programme ambassadeur
          </Link>
          <Link
            href="/how-it-works"
            className="flex-1 text-center bg-white border border-[#2D6A4F]/20 text-[#2D6A4F] font-semibold px-5 py-3 rounded-xl hover:bg-[#2D6A4F]/5 transition-colors text-sm"
          >
            Comment \u00e7a marche
          </Link>
        </div>
      </div>

      <footer className="text-center text-xs text-gray-500 py-8 border-t border-gray-200 mt-4">
        Adventurer &middot;{' '}
        <Link href="/legal/privacy" className="underline">Confidentialit\u00e9</Link>{' \u00b7 '}
        <Link href="/legal/terms" className="underline">CGU</Link>{' \u00b7 '}
        <Link href="/legal/mentions" className="underline">Mentions</Link>
      </footer>
    </main>
  );
}
