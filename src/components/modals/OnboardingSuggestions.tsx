'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

// Small curated set of suggestion templates keyed by sport (or universe as fallback).
// Shown ONCE after onboarding completion, before the tutorial.
const SUGGESTIONS: Record<string, Array<{ emoji: string; title: string; subtitle: string; sport: string }>> = {
  'Kitesurf': [
    { emoji: '🏄‍♂️', title: 'Tarifa — Levante', subtitle: '25 nds E · riders confirmés', sport: 'Kitesurf' },
    { emoji: '🌊', title: 'Dakhla Lagune', subtitle: 'Flat water · tous niveaux', sport: 'Kitesurf' },
    { emoji: '🏝️', title: 'Essaouira', subtitle: 'Vent régulier, crowd chill', sport: 'Kitesurf' },
  ],
  'Trail': [
    { emoji: '🏔️', title: 'Mercantour trail', subtitle: '2500m D+ · 42km', sport: 'Trail' },
    { emoji: '🌲', title: 'GR20 section Nord', subtitle: 'Corse sauvage · 3 jours', sport: 'Trail' },
    { emoji: '🌅', title: 'Sunrise 10km local', subtitle: 'Défi : 30 jours, 30 sorties', sport: 'Trail' },
  ],
  'Escalade': [
    { emoji: '🧗', title: 'Verdon — La Demande', subtitle: 'Grande voie 6a · classique', sport: 'Escalade' },
    { emoji: '🪨', title: 'Fontainebleau', subtitle: 'Bloc 6A+ · circuit bleu', sport: 'Escalade' },
    { emoji: '🏔️', title: 'Céüse — Biographie', subtitle: '8a · projet long terme', sport: 'Escalade' },
  ],
  'Alpinisme': [
    { emoji: '🏔️', title: 'Mont-Blanc 3 Monts', subtitle: 'Course AD · cherche binôme', sport: 'Alpinisme' },
    { emoji: '⛰️', title: 'Matterhorn Hörnli', subtitle: 'Arête classique · été', sport: 'Alpinisme' },
    { emoji: '❄️', title: 'Goulotte Gabarrou', subtitle: 'Mixte · sortie de saison', sport: 'Alpinisme' },
  ],
  'Parapente': [
    { emoji: '🪂', title: 'Annecy — Planfait', subtitle: 'Décollage iconique', sport: 'Parapente' },
    { emoji: '🌄', title: 'Saint-André-les-Alpes', subtitle: 'Thermiques longs', sport: 'Parapente' },
    { emoji: '☁️', title: 'Cross 100km', subtitle: 'Défi saison 2026', sport: 'Parapente' },
  ],
  'Surf': [
    { emoji: '🏄', title: 'Hossegor — La Gravière', subtitle: 'Beach break puissant', sport: 'Surf' },
    { emoji: '🌊', title: 'Mundaka', subtitle: 'Gauche mythique', sport: 'Surf' },
    { emoji: '🏝️', title: 'Ericeira', subtitle: 'Spots variés, tous niveaux', sport: 'Surf' },
  ],
  'Apnée': [
    { emoji: '🤿', title: 'Dahab — Blue Hole', subtitle: 'Profondeur progressive', sport: 'Apnée' },
    { emoji: '🐠', title: 'Calanques', subtitle: 'Poissons · -20m', sport: 'Apnée' },
    { emoji: '🌊', title: 'Défi -30m', subtitle: 'Plan CO2 sur 8 semaines', sport: 'Apnée' },
  ],
  'VTT': [
    { emoji: '🚵', title: 'Finale Ligure', subtitle: 'Enduro · trails sea view', sport: 'VTT' },
    { emoji: '🌲', title: 'Morzine — PDS', subtitle: 'Bike park · remontées', sport: 'VTT' },
    { emoji: '🏔️', title: 'Traversée Alpine', subtitle: 'Bikepacking · 7 jours', sport: 'VTT' },
  ],
  'Ski de rando': [
    { emoji: '🎿', title: 'Couloir du Col du Chardonnet', subtitle: 'Grande classique', sport: 'Ski de rando' },
    { emoji: '🏔️', title: 'Vanoise traversée', subtitle: '4 jours · refuges', sport: 'Ski de rando' },
    { emoji: '❄️', title: 'Formation neige & avalanches', subtitle: '2 jours · FFCAM', sport: 'Ski de rando' },
  ],
  'Plongée': [
    { emoji: '🤿', title: 'Medes — Espagne', subtitle: 'Réserve marine · -25m', sport: 'Plongée' },
    { emoji: '🐙', title: 'Port-Cros épaves', subtitle: 'Niveau 2 · biodiversité', sport: 'Plongée' },
    { emoji: '🏝️', title: 'Raja Ampat', subtitle: 'Expé 10 jours · 2027', sport: 'Plongée' },
  ],
};

const GENERIC: Array<{ emoji: string; title: string; subtitle: string; sport: string }> = [
  { emoji: '🗺️', title: 'Explore autour de toi', subtitle: 'Spots, trails, sessions live', sport: '' },
  { emoji: '🧠', title: 'Génère un plan IA', subtitle: '30 secondes · ton objectif', sport: '' },
  { emoji: '🎯', title: 'Rejoins un défi', subtitle: 'Communauté, motivation, progrès', sport: '' },
];

export default function OnboardingSuggestions() {
  const { hasCompletedOnboarding, selectedSports, language, setPage, showToast } = useStore();
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  // One-shot per browser using localStorage (intentionally outside zustand persist)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = window.localStorage.getItem('adventurer-onb-suggestions-seen');
    setDismissed(seen === '1');
  }, []);

  if (!hasCompletedOnboarding) return null;
  if (dismissed !== false) return null;

  const markSeen = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('adventurer-onb-suggestions-seen', '1');
    }
    setDismissed(true);
  };

  // Pick up to 3 suggestions from user's sports, fallback to generic
  let picks: Array<{ emoji: string; title: string; subtitle: string; sport: string }> = [];
  for (const s of selectedSports) {
    if (SUGGESTIONS[s]) picks.push(...SUGGESTIONS[s].slice(0, 1));
    if (picks.length >= 3) break;
  }
  if (picks.length < 3) {
    for (const s of selectedSports) {
      if (picks.length >= 3) break;
      const rest = SUGGESTIONS[s]?.slice(1) || [];
      for (const r of rest) {
        if (picks.length >= 3) break;
        picks.push(r);
      }
    }
  }
  while (picks.length < 3) picks.push(GENERIC[picks.length]);

  const handlePick = (card: { sport: string; title: string }) => {
    showToast(language === 'fr' ? `C'est parti : ${card.title}` : `Let's go: ${card.title}`, 'success', '🚀');
    markSeen();
    setPage('explore');
  };

  return (
    <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      role="dialog" aria-modal="true">
      <div className="bg-[var(--card)] w-full max-w-[430px] rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-6 pt-6 pb-2 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--accent)] font-semibold">
              {t('onb.suggest.subtitle', language)}
            </p>
            <h2 className="text-xl font-bold mt-1">{t('onb.suggest.title', language)}</h2>
          </div>
          <button type="button" onClick={markSeen}
            className="text-xs text-gray-400 hover:text-white px-3 py-1.5 bg-white/5 rounded-full shrink-0">
            ✕
          </button>
        </div>
        <div className="p-6 pt-4 space-y-3">
          {picks.map((card, i) => (
            <button key={i} type="button" onClick={() => handlePick(card)}
              className="w-full text-left bg-white/5 hover:bg-white/10 rounded-2xl p-4 flex items-center gap-3 transition">
              <span className="text-3xl shrink-0">{card.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{card.title}</p>
                <p className="text-xs text-gray-400">{card.subtitle}</p>
              </div>
              <span className="text-gray-500">→</span>
            </button>
          ))}
          <button type="button" onClick={() => { markSeen(); setPage('explore'); }}
            className="w-full py-3 mt-2 bg-[var(--accent)] text-white rounded-xl font-bold text-sm">
            🗺️ {t('onb.suggest.start', language)}
          </button>
        </div>
      </div>
    </div>
  );
}
