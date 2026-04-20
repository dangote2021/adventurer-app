'use client';

import { useState, useRef, TouchEvent, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { SPORTS, UNIVERSE_CONFIG, getSportsByUniverse } from '@/lib/sports-config';
import { Universe } from '@/types';
import { getAdventuresForSwipe } from '@/lib/mock-data';

type Step = 'sports' | 'level' | 'location' | 'discovery';
type Level = 'debutant' | 'intermediaire' | 'confirme';

const universes: Universe[] = ['TERRE', 'MER', 'AIR'];

export default function OnboardingScreen() {
  const { completeOnboarding, showToast, language, setLanguage, setUserLocation, setGeoPermission, setGlobalLevel, setSportLevel, setSubPage } = useStore();
  const [step, setStep] = useState<Step>('sports');
  const [currentUniverse, setCurrentUniverse] = useState<Universe>('TERRE');
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<Level>('intermediaire');
  // P11: Per-sport levels
  const [perSportLevels, setPerSportLevels] = useState<Record<string, Level>>({});
  const [geoLoading, setGeoLoading] = useState(false);
  const [discoveryReady, setDiscoveryReady] = useState(false);
  const touchStartX = useRef(0);

  const currentIndex = universes.indexOf(currentUniverse);
  const config = UNIVERSE_CONFIG[currentUniverse];
  const sports = getSportsByUniverse(currentUniverse);

  // Smooth background color transition per universe
  const universeBgColors: Record<Universe, string> = {
    TERRE: 'rgba(34,139,34,0.08)',
    MER: 'rgba(0,119,182,0.08)',
    AIR: 'rgba(30,144,255,0.08)',
  };

  const countByUniverse = (u: Universe) =>
    selected.filter(s => SPORTS.find(sp => sp.name === s)?.universe === u).length;

  const toggleSport = (name: string) => {
    setSelected(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < 2) setCurrentUniverse(universes[currentIndex + 1]);
      if (diff < 0 && currentIndex > 0) setCurrentUniverse(universes[currentIndex - 1]);
    }
  };

  const handleSkipOnboarding = () => {
    completeOnboarding([]);
  };

  const requestGeolocation = () => {
    setGeoLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation(pos.coords.latitude, pos.coords.longitude);
          setGeoPermission('granted');
          setGeoLoading(false);
          finishOnboarding();
        },
        () => {
          setGeoPermission('denied');
          setGeoLoading(false);
          finishOnboarding();
        },
        { timeout: 8000 }
      );
    } else {
      setGeoLoading(false);
      finishOnboarding();
    }
  };

  const finishOnboarding = () => {
    setGlobalLevel(selectedLevel);
    // P11: Save per-sport levels
    for (const sport of selected) {
      const level = perSportLevels[sport] || 'intermediaire';
      setSportLevel(sport, level);
    }
    completeOnboarding(selected.length > 0 ? selected : []);
    setStep('discovery');
    setTimeout(() => setDiscoveryReady(true), 600);
  };

  const personalizedAdventures = getAdventuresForSwipe(selected).slice(0, 3);

  // Step progress indicator
  const stepIndex = step === 'sports' ? 0 : step === 'level' ? 1 : step === 'location' ? 2 : 3;
  const ProgressBar = () => (
    <div className="flex gap-1.5 px-4 pt-4 pb-2">
      {[0, 1, 2].map(i => (
        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= stepIndex ? 'bg-[var(--accent)]' : 'bg-white/10'}`} />
      ))}
    </div>
  );

  // ==== STEP 4: DISCOVERY REVEAL (wow moment) ====
  if (step === 'discovery') {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col max-w-[430px] mx-auto">
        <div className={`flex-1 flex flex-col transition-all duration-700 ${discoveryReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Hero */}
          <div className="relative h-48 bg-gradient-to-b from-[#1B4332] to-[#2D6A4F] overflow-hidden flex items-center justify-center">
            <div className="text-center z-10 px-6">
              <span className="text-5xl block mb-3">🏔️</span>
              <h1 className="text-2xl font-black text-white mb-1">
                {language === 'fr' ? 'C\'est parti !' : 'Let\'s go!'}
              </h1>
              <p className="text-green-100 text-sm">
                {language === 'fr'
                  ? `${selected.length > 0 ? selected.length + ' sports' : 'Mode découverte'} · Niveau ${selectedLevel === 'debutant' ? 'débutant' : selectedLevel === 'intermediaire' ? 'intermédiaire' : 'confirmé'}`
                  : `${selected.length > 0 ? selected.length + ' sports' : 'Discovery mode'} · ${selectedLevel} level`}
              </p>
            </div>
          </div>

          {/* 3 Personalized Adventures */}
          <div className="px-4 pt-6 pb-4">
            <h2 className="text-lg font-bold text-white mb-1">
              {language === 'fr' ? 'Tes 3 aventures personnalisées' : 'Your 3 personalized adventures'}
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              {language === 'fr' ? 'Basées sur tes préférences' : 'Based on your preferences'}
            </p>
            <div className="space-y-3">
              {personalizedAdventures.map((adv, i) => (
                <div
                  key={adv.id}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--accent)]/40 transition"
                  style={{ animationDelay: `${i * 200}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] flex items-center justify-center text-2xl flex-shrink-0">
                      {adv.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-white">{adv.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{adv.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        {adv.distance && <span>{adv.distance}</span>}
                        {adv.dplus && <span>{adv.dplus}</span>}
                        <span className="text-green-400 font-medium">{adv.conditionLabel}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="px-4 pb-6 mt-auto space-y-3">
            <button
              type="button"
              onClick={() => setStep('discovery')} // already on home, this closes onboarding
              className="w-full py-4 bg-gradient-to-r from-[#F77F00] to-[#FFB703] text-[#1B4332] rounded-2xl font-black text-lg hover:opacity-90 transition shadow-lg shadow-[#F77F00]/20"
            >
              {language === 'fr' ? '🚀 Trouve-moi une aventure !' : '🚀 Find me an adventure!'}
            </button>
            <button
              type="button"
              onClick={() => setSubPage('trip-planner')}
              className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold text-sm hover:bg-white/10 transition"
            >
              {language === 'fr' ? '🗺️ Planifier un voyage multi-jours' : '🗺️ Plan a multi-day trip'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==== STEP 3: LOCATION ====
  if (step === 'location') {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col max-w-[430px] mx-auto">
        <ProgressBar />
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <span className="text-6xl mb-6">📍</span>
          <h2 className="text-2xl font-bold text-center mb-2">
            {language === 'fr' ? 'Où es-tu ?' : 'Where are you?'}
          </h2>
          <p className="text-center text-gray-400 text-sm mb-8 max-w-xs">
            {language === 'fr'
              ? 'Pour te montrer les spots, la météo et les aventuriers près de chez toi.'
              : 'To show you spots, weather and adventurers near you.'}
          </p>
          <button
            type="button"
            onClick={requestGeolocation}
            disabled={geoLoading}
            className="w-full py-3.5 bg-[var(--accent)] text-white rounded-xl font-bold text-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {geoLoading
              ? (language === 'fr' ? 'Localisation...' : 'Locating...')
              : (language === 'fr' ? '📍 Activer ma position' : '📍 Enable my location')}
          </button>
          <button
            type="button"
            className="w-full py-2 text-gray-500 hover:text-gray-300 text-sm mt-3 transition"
            onClick={() => finishOnboarding()}
          >
            {language === 'fr' ? 'Passer cette étape' : 'Skip this step'}
          </button>
        </div>
      </div>
    );
  }

  // ==== STEP 2: LEVEL (P11: per-sport) ====
  if (step === 'level') {
    const levelOptions: Array<{ key: Level; emoji: string; labelFr: string; labelEn: string }> = [
      { key: 'debutant', emoji: '🌱', labelFr: 'Débutant', labelEn: 'Beginner' },
      { key: 'intermediaire', emoji: '⚡', labelFr: 'Intermédiaire', labelEn: 'Intermediate' },
      { key: 'confirme', emoji: '🔥', labelFr: 'Confirmé', labelEn: 'Advanced' },
    ];

    const handleSportLevel = (sport: string, level: Level) => {
      setPerSportLevels(prev => ({ ...prev, [sport]: level }));
    };

    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col max-w-[430px] mx-auto">
        <ProgressBar />
        <div className="px-4 pt-6 pb-3 text-center">
          <h2 className="text-2xl font-bold">{language === 'fr' ? 'Ton niveau par sport' : 'Your level per sport'}</h2>
          <p className="text-gray-400 mt-1 text-sm">
            {language === 'fr' ? '3 taps par sport — c\'est rapide !' : '3 taps per sport — super quick!'}
          </p>
        </div>

        <div className="flex-1 px-4 space-y-3 pb-32 overflow-y-auto">
          {selected.map(sport => {
            const sp = SPORTS.find(s => s.name === sport);
            const currentLevel = perSportLevels[sport] || 'intermediaire';
            return (
              <div key={sport} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{sp?.emoji || '⛰️'}</span>
                  <p className="font-bold text-sm text-white">{sport}</p>
                </div>
                <div className="flex gap-2">
                  {levelOptions.map(l => (
                    <button key={l.key} type="button" onClick={() => handleSportLevel(sport, l.key)}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                        currentLevel === l.key
                          ? 'bg-[var(--accent)] text-white scale-[1.03]'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}>
                      {l.emoji} {language === 'fr' ? l.labelFr : l.labelEn}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-4 bg-[var(--bg)]/95 backdrop-blur-sm">
          <button
            type="button"
            className="w-full py-3.5 bg-[var(--accent)] text-white rounded-xl font-bold text-lg hover:opacity-90 transition"
            onClick={() => setStep('location')}
          >
            {language === 'fr' ? 'Continuer' : 'Continue'}
          </button>
          <button
            type="button"
            className="w-full py-2 text-gray-500 hover:text-gray-300 text-sm mt-2 transition"
            onClick={() => setStep('location')}
          >
            {language === 'fr' ? 'Passer' : 'Skip'}
          </button>
        </div>
      </div>
    );
  }

  // ==== STEP 1: SPORTS SELECTION ====
  return (
    <div className="min-h-screen flex flex-col max-w-[430px] mx-auto transition-colors duration-500" style={{ backgroundColor: universeBgColors[currentUniverse], background: `linear-gradient(180deg, ${universeBgColors[currentUniverse]} 0%, var(--bg) 30%)` }}>
      {/* Language Toggle */}
      <div className="px-4 pt-4 pb-2 flex gap-2">
        <button
          type="button"
          onClick={() => setLanguage('fr')}
          className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
            language === 'fr' ? 'bg-[var(--accent)] text-white' : 'text-gray-400 hover:text-gray-300 border border-[var(--card)]'
          }`}
          aria-pressed={language === 'fr'}
        >
          FR
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
            language === 'en' ? 'bg-[var(--accent)] text-white' : 'text-gray-400 hover:text-gray-300 border border-[var(--card)]'
          }`}
          aria-pressed={language === 'en'}
        >
          EN
        </button>
      </div>

      <ProgressBar />

      {/* Header */}
      <div className="px-4 pt-2 pb-3 text-center">
        <h2 className="text-2xl font-bold">{t('onboarding.chooseActivities', language)}</h2>
        <p className="text-gray-400 mt-1 text-sm">
          {language === 'fr' ? 'Coche tes sports, on personnalise tout pour toi' : 'Pick your sports, we personalize everything for you'}
        </p>
      </div>

      {/* Universe Tabs */}
      <div className="flex px-4 gap-2 mb-3" role="tablist">
        {universes.map(u => {
          const conf = UNIVERSE_CONFIG[u];
          const count = countByUniverse(u);
          return (
            <button
              key={u}
              type="button"
              role="tab"
              aria-selected={currentUniverse === u}
              className={`flex-1 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-1.5 transition ${
                currentUniverse === u
                  ? 'text-white ring-2 ring-white/20'
                  : 'text-gray-400 hover:text-white'
              }`}
              style={{
                backgroundColor: currentUniverse === u ? conf.color + '40' : 'rgba(255,255,255,0.05)',
              }}
              onClick={() => setCurrentUniverse(u)}
            >
              <span>{conf.emoji}</span> {conf.label}
              {count > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-[var(--accent)] text-white text-xs flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mb-3">
        {universes.map((u) => (
          <div
            key={u}
            className={`h-1.5 rounded-full transition-all ${
              currentUniverse === u ? 'w-6 bg-[var(--accent)]' : 'w-1.5 bg-gray-600'
            }`}
          />
        ))}
      </div>

      {/* Sports Grid */}
      <div
        className="flex-1 overflow-y-auto px-4 pb-32"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Arrow hints */}
        <div className="flex justify-between text-sm text-gray-500 mb-2 px-1">
          <span>{currentIndex > 0 ? `← ${UNIVERSE_CONFIG[universes[currentIndex - 1]].label}` : ''}</span>
          <span>{currentIndex < 2 ? `${UNIVERSE_CONFIG[universes[currentIndex + 1]].label} →` : ''}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {sports.map(sport => {
            const isSelected = selected.includes(sport.name);
            return (
              <button
                key={sport.name}
                type="button"
                className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'ring-2 ring-[var(--accent)] text-white scale-105'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
                style={{
                  backgroundColor: isSelected ? config.color + '30' : undefined,
                }}
                onClick={() => toggleSport(sport.name)}
                aria-pressed={isSelected}
              >
                <span>{sport.emoji}</span> {sport.name}
              </button>
            );
          })}
        </div>

        {/* Other universes summary — "Aussi selectionnes" */}
        {selected.filter(s => SPORTS.find(sp => sp.name === s)?.universe !== currentUniverse).length > 0 && (
          <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5">
            <p className="text-sm text-gray-400 mb-2 font-medium">{t('onboarding.alsoSelected', language)}</p>
            <div className="flex flex-wrap gap-1.5">
              {selected
                .filter(s => SPORTS.find(sp => sp.name === s)?.universe !== currentUniverse)
                .map(s => {
                  const sp = SPORTS.find(sport => sport.name === s);
                  const uConf = sp ? UNIVERSE_CONFIG[sp.universe] : null;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSport(s)}
                      className="px-2.5 py-1 rounded-full text-sm text-gray-300 flex items-center gap-1 hover:bg-white/10 transition"
                      style={{ backgroundColor: uConf ? uConf.color + '20' : 'rgba(255,255,255,0.05)' }}
                    >
                      {sp?.emoji} {s}
                      <span className="text-gray-500 ml-0.5 text-xs">x</span>
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-4 bg-[var(--bg)]/95 backdrop-blur-sm border-t border-white/5">
        <button
          type="button"
          disabled={selected.length === 0}
          className={`w-full py-3.5 rounded-xl font-bold text-lg transition shadow-lg ${
            selected.length > 0
              ? 'bg-gradient-to-r from-[#F77F00] to-[#FFB703] text-[#1B4332] hover:opacity-90 shadow-[#F77F00]/20'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed shadow-none'
          }`}
          onClick={() => selected.length > 0 ? setStep('level') : undefined}
        >
          {selected.length > 0
            ? `${t('onboarding.continue', language)} — ${selected.length} ${selected.length === 1 ? t('onboarding.activities', language) : t('onboarding.activitiesPlural', language)} ${language === 'fr' ? 'sélectionnées' : 'selected'}`
            : t('onboarding.selectAtLeast', language)}
        </button>
        <button
          type="button"
          className="w-full py-2 text-gray-500 hover:text-gray-300 text-sm mt-2 transition"
          onClick={handleSkipOnboarding}
        >
          {t('onboarding.skip', language)}
        </button>
      </div>
    </div>
  );
}
