'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

interface AIPlan {
  title: string;
  overview: string;
  phases: Array<{ name: string; duration: string; description: string; sessions: string[] }>;
  tips: string[];
  detected?: PromptMeta;
}

type Level = 'debutant' | 'intermediaire' | 'confirme';

// B3 — Parsing du prompt pour extraire les paramètres clés (durée, volume, objectif).
// Ça permet à l'IA de montrer qu'elle a lu et compris ce que l'utilisateur a écrit,
// et d'adapter le plan (nombre de semaines, intensité, distance cible).
interface PromptMeta {
  weeks?: number;          // durée totale du plan
  hoursPerWeek?: number;   // volume horaire
  kmPerWeek?: number;      // volume kilométrique actuel ou visé
  targetKm?: number;       // distance de la course/objectif
  targetDepth?: number;    // profondeur visée (plongée/apnée)
  targetMinutes?: number;  // durée d'apnée visée en min
  goal?: string;           // mot-clé objectif (trail, kite, apnee, …)
  when?: string;           // mois ou échéance détectée ("septembre", "dans 3 mois")
}

function parsePrompt(prompt: string): PromptMeta {
  const lower = prompt.toLowerCase();
  const meta: PromptMeta = {};

  // Durée : "12 semaines", "en 3 mois", "dans 4 mois"
  const weeksMatch = lower.match(/(\d{1,3})\s*(semaines?|sem\.|sem\b|weeks?)/);
  if (weeksMatch) meta.weeks = parseInt(weeksMatch[1], 10);
  const monthsMatch = lower.match(/(\d{1,2})\s*(mois|months?)/);
  if (monthsMatch && !meta.weeks) meta.weeks = parseInt(monthsMatch[1], 10) * 4;

  // Volume horaire : "4h/sem", "5 heures par semaine", "3h semaine"
  const hoursMatch = lower.match(/(\d{1,2})\s*(?:h|heures?|hrs?)\s*(?:\/|par|\s)?\s*(?:sem|semaines?|week)/);
  if (hoursMatch) meta.hoursPerWeek = parseInt(hoursMatch[1], 10);

  // Volume kilométrique : "30 km/sem", "50 km par semaine"
  const kmWeekMatch = lower.match(/(\d{1,3})\s*km\s*(?:\/|par|\s)?\s*(?:sem|semaines?|week)/);
  if (kmWeekMatch) meta.kmPerWeek = parseInt(kmWeekMatch[1], 10);

  // Distance cible : "ultra-trail de 80km", "un 50 km", "un 100km"
  const targetKmMatch = lower.match(/(?:de|d'un|un|course de|trail de|course)\s+(\d{1,3})\s*km/);
  if (targetKmMatch) meta.targetKm = parseInt(targetKmMatch[1], 10);

  // Profondeur visée (plongée/apnée) : "atteindre -30m", "plonger à 25m"
  const depthMatch = lower.match(/[-−]?(\d{1,3})\s*m(?:ètres?)?\b/);
  if (depthMatch && (lower.includes('profondeur') || lower.includes('plongée') || lower.includes('plonger') || lower.includes('apnée') && lower.includes('prof'))) {
    meta.targetDepth = parseInt(depthMatch[1], 10);
  }

  // Apnée statique : "3min30", "3 min 30", "passer à 3min"
  const minSecMatch = lower.match(/(\d{1,2})\s*min\s*(\d{1,2})?/);
  if (minSecMatch && (lower.includes('apnée') || lower.includes('apnee') || lower.includes('statique') || lower.includes('freedive'))) {
    const min = parseInt(minSecMatch[1], 10);
    const sec = minSecMatch[2] ? parseInt(minSecMatch[2], 10) : 0;
    meta.targetMinutes = Math.round((min + sec / 60) * 10) / 10;
  }

  // Échéance : mois ("en septembre", "en mai")
  const monthKeywords = ['janvier', 'février', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'aout', 'septembre', 'octobre', 'novembre', 'décembre', 'decembre', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  for (const m of monthKeywords) {
    if (lower.includes(m)) { meta.when = m; break; }
  }

  // Objectif
  if (lower.includes('ultra') || lower.includes('utmb')) meta.goal = 'ultra-trail';
  else if (lower.includes('trail')) meta.goal = 'trail';
  else if (lower.includes('marathon')) meta.goal = 'marathon';
  else if (lower.includes('kite') || lower.includes('foil') || lower.includes('wing')) meta.goal = 'kitesurf';
  else if (lower.includes('surf') && !lower.includes('kitesurf')) meta.goal = 'surf';
  else if (lower.includes('apnée') || lower.includes('apnee') || lower.includes('freedive')) meta.goal = 'apnée';
  else if (lower.includes('plongée') || lower.includes('plongee') || lower.includes('diving')) meta.goal = 'plongée';
  else if (lower.includes('escalade') || lower.includes('grimpe') || lower.includes('bloc')) meta.goal = 'escalade';
  else if (lower.includes('alpinisme') || lower.includes('mont-blanc') || lower.includes('mont blanc')) meta.goal = 'alpinisme';
  else if (lower.includes('parapente') || lower.includes('cross')) meta.goal = 'parapente';
  else if (lower.includes('ski de rando') || lower.includes('ski de randonnée')) meta.goal = 'ski-rando';
  else if (lower.includes('vélo') || lower.includes('velo') || lower.includes('cyclisme') || lower.includes('bike')) meta.goal = 'vélo';
  else if (lower.includes('rando') || lower.includes('trek') || lower.includes('hike')) meta.goal = 'randonnée';

  return meta;
}

function generateAIResponse(prompt: string, sports: string[], sportLevels: Record<string, Level>): AIPlan {
  const lower = prompt.toLowerCase();
  const detected = parsePrompt(prompt);
  // Detect user's main level for this sport family (fallback = intermediaire)
  const pickLevel = (candidates: string[]): Level => {
    for (const s of candidates) {
      if (sportLevels[s]) return sportLevels[s];
    }
    return 'intermediaire';
  };
  // B3 : phrase qui récapitule ce que l'IA a compris du prompt
  const echoPrompt = (): string => {
    const parts: string[] = [];
    if (detected.weeks) parts.push(`${detected.weeks} sem`);
    if (detected.hoursPerWeek) parts.push(`${detected.hoursPerWeek}h/sem`);
    if (detected.kmPerWeek) parts.push(`${detected.kmPerWeek}km/sem actuel`);
    if (detected.targetKm) parts.push(`objectif ${detected.targetKm}km`);
    if (detected.targetMinutes) parts.push(`viser ${detected.targetMinutes}min`);
    if (detected.targetDepth) parts.push(`profondeur ${detected.targetDepth}m`);
    if (detected.when) parts.push(`échéance ${detected.when}`);
    return parts.length > 0 ? ` · J'ai noté : ${parts.join(' · ')}.` : '';
  };

  // ===== APNÉE / FREEDIVE =====
  if (lower.includes('apnée') || lower.includes('apnee') || lower.includes('freedive') || lower.includes('statique')) {
    const level = pickLevel(['Apnée', 'Plongée']);
    if (level === 'debutant') {
      return {
        detected,
        title: detected.targetMinutes
          ? `Apnée — Atteindre ${detected.targetMinutes}min en statique`
          : 'Apnée — Démarrer en douceur (de 0 à 2min)',
        overview: `Programme de ${detected.weeks || 6} semaines pour débuter. ${detected.hoursPerWeek ? detected.hoursPerWeek + 'h/sem' : '2 séances/sem'} à sec + 1 à l\'eau si possible. Sécurité binôme obligatoire.${echoPrompt()}`,
        phases: [
          { name: '🟢 Respiration (S1-S2)', duration: '2 semaines', description: 'Apprendre la respiration diaphragmatique et la ventilation finale', sessions: ['Respi abdominale 10min/j', 'Souplesse cage thoracique', 'Marche apnée expiratoire 30m', 'Étirements du dos'] },
          { name: '🟡 Tables CO2 douces (S3-S4)', duration: '2 semaines', description: 'Accoutumance au CO2 sans tension', sessions: ['Table CO2 : 1:30 / 2:00 repos → 1:00', 'Apnée statique sur canapé 1\'30 max', 'Sensations "envie de respirer"', 'Relaxation / cohérence cardiaque'] },
          { name: '🔴 Premières tables O2 (S5-S6)', duration: '2 semaines', description: 'Allonger l\'apnée en sécurité (binôme)', sessions: ['Table O2 : 1:30 apnée / 2\' repos', 'Statique guidée jusqu\'à 2\'', 'Jamais seul à l\'eau', 'Récupération 48h entre grosses séances'] },
        ],
        tips: ['Jamais en apnée seul', 'Pas d\'hyperventilation (risque syncope)', 'Hydratation + sommeil avant séance', 'Écoute les premiers signaux (contractions diaphragme)'],
      };
    }
    return {
      detected,
      title: detected.targetMinutes
        ? `Apnée — Atteindre ${detected.targetMinutes}min en statique (${detected.weeks || 8} sem)`
        : `Apnée — De 2min à 3min30 en ${detected.weeks || 8} semaines`,
      overview: `Progression ciblée tables CO2 puis O2, travail profondeur en parallèle. ${detected.hoursPerWeek ? detected.hoursPerWeek + 'h/sem' : '3 séances/sem'} dont 1 à l\'eau, toujours en binôme.${echoPrompt()}`,
      phases: [
        { name: '🟢 Base CO2 (S1-S2)', duration: '2 semaines', description: 'Tolérance au CO2 par tables progressives', sessions: ['Table CO2 : 2:00 / 2:00 repos → 1:15', 'Statique 2\'15 x 5 reps', 'Marche apnée 40m × 8', 'Stretching diaphragme'] },
        { name: '🟡 Tables O2 (S3-S5)', duration: '3 semaines', description: 'Allongement progressif de l\'apnée', sessions: ['Table O2 : 2:30 / 2\' repos', 'Statique max 1x/sem (3\'00 visé)', 'Dynamique 25m en piscine', 'Récupération yoga 1x/sem'] },
        { name: '🔴 Pic de forme (S6-S8)', duration: '3 semaines', description: 'Consolider 3\'30 statique', sessions: ['Statique 3\'15 → 3\'30 (binôme)', 'Pranayama kapalabhati 10min', 'Profondeur 15-20m si formé', 'Affûtage dernière semaine'] },
      ],
      tips: ['Sécurité binôme NON négociable', 'Pas d\'hyperventilation avant apnée', 'Nutrition : repas léger 3h avant', 'Alternance travail / repos 48h'],
    };
  }

  if (lower.includes('trail') || lower.includes('ultra') || lower.includes('course')) {
    const weeks = detected.weeks || 12;
    const distance = detected.targetKm || 80;
    return {
      detected,
      title: detected.targetKm
        ? `Plan ${detected.goal === 'ultra-trail' ? 'Ultra-Trail' : 'Trail'} ${distance}km — ${weeks} sem`
        : 'Plan Trail / Ultra-Trail personnalisé',
      overview: `Programme de ${weeks} semaines pour préparer un ${detected.goal === 'ultra-trail' ? 'ultra-trail' : 'trail'} de ${distance}km+. Basé sur ${detected.hoursPerWeek ? detected.hoursPerWeek + 'h/sem' : '3-4 sorties/semaine'} avec montée en charge progressive${detected.kmPerWeek ? ' depuis ton volume actuel (' + detected.kmPerWeek + 'km/sem)' : ''}.${echoPrompt()}`,
      phases: [
        { name: '🟢 Phase Base (S1-S4)', duration: '4 semaines', description: 'Construction de l\'endurance fondamentale', sessions: ['Sortie longue 2h en Z2', 'Fartlek 45min en nature', 'Rando-course 1h30 en montagne', 'Renforcement musculaire 30min'] },
        { name: '🟡 Phase Volume (S5-S8)', duration: '4 semaines', description: 'Augmentation du volume et du dénivelé', sessions: ['Sortie longue 3h avec 1000m D+', 'Intervalles côtes 1h', 'Enchaînement J+J 2x1h30', 'Yoga / Mobilité 45min'] },
        { name: '🔴 Phase Spécifique (S9-S11)', duration: '3 semaines', description: 'Simulation des conditions de course', sessions: ['Sortie Ultra-simulation 4-5h', 'Travail en fatigue D+/D-', 'Gestion nutrition effort long', 'Récup active 1h'] },
        { name: '⚪ Affûtage (S12)', duration: '1 semaine', description: 'Réduction du volume, maintien de l\'intensité', sessions: ['30min facile', '20min avec quelques accélérations', 'Repos complet J-2', 'Jour de course !'] },
      ],
      tips: ['Hydratation : 500ml/h minimum', 'Nutrition : tester en entraînement', 'Sommeil : 8h minimum', 'Écouter son corps : ne pas forcer sur la fatigue'],
    };
  }

  if (lower.includes('kite') || lower.includes('vent') || lower.includes('foil')) {
    const weeks = detected.weeks || 8;
    return {
      detected,
      title: `Progression Kitesurf / Kite Foil — ${weeks} sem`,
      overview: `Programme de ${weeks} semaines pour progresser du niveau intermédiaire au freestyle. ${detected.hoursPerWeek ? detected.hoursPerWeek + 'h/sem' : '2-3 sessions/semaine'} selon le vent.${echoPrompt()}`,
      phases: [
        { name: '🟢 Fondamentaux (S1-S2)', duration: '2 semaines', description: 'Maîtrise du contrôle de l\'aile et du board', sessions: ['Session technique : transitions', 'Travail du body drag upwind', 'Session waterstart des deux côtés'] },
        { name: '🟡 Sauts (S3-S5)', duration: '3 semaines', description: 'Premiers sauts et contrôle aérien', sessions: ['Pop et timing de saut', 'Backroll progressif', 'Grab en l\'air (indy, melon)'] },
        { name: '🔴 Freestyle (S6-S8)', duration: '3 semaines', description: 'Figures avancées et style', sessions: ['Front roll', 'Raley / S-bend', 'Handle pass (au trapèze d\'abord)'] },
      ],
      tips: ['Toujours rider avec un buddy', 'Vérifier la météo 2h avant', 'Filmer tes sessions pour analyser', 'Échauffement épaules indispensable'],
    };
  }

  if (lower.includes('escalade') || lower.includes('grimpe') || lower.includes('bloc')) {
    const weeks = detected.weeks || 10;
    return {
      detected,
      title: `Objectif 7a en tête — ${weeks} sem`,
      overview: `Programme de ${weeks} semaines combinant force, technique et mental pour passer le cap du 7a. ${detected.hoursPerWeek ? detected.hoursPerWeek + 'h/sem' : '3 séances/sem'}.${echoPrompt()}`,
      phases: [
        { name: '🟢 Force de base (S1-S3)', duration: '3 semaines', description: 'Renforcement des doigts et du haut du corps', sessions: ['Pan Güllich 3x/sem 30min', 'Bloc technique : dalles et dévers', 'Gainage et tractions', 'Étirements 20min'] },
        { name: '🟡 Volume (S4-S7)', duration: '4 semaines', description: 'Grimpe en quantité pour développer l\'endurance', sessions: ['Séance longue : 15-20 voies en 6b-6c', 'Travail conti : 4x traversées 5min', 'Bloc : essais en 6c-7a', 'Récup active (yoga)'] },
        { name: '🔴 Projet (S8-S10)', duration: '3 semaines', description: 'Travail du projet en 7a', sessions: ['Repérage de la voie en moulinette', 'Travail des sections clés', 'Tentative en tête avec repos entre essais', 'Mental : visualisation avant l\'essai'] },
      ],
      tips: ['Échauffer les doigts 15min avant chaque séance', 'Repos 48h entre séances de force', 'Peau : crème réparatrice le soir', 'Grimper avec des gens meilleurs que toi'],
    };
  }

  return {
    detected,
    title: detected.weeks ? `Plan d'entraînement personnalisé — ${detected.weeks} sem` : 'Plan d\'entraînement personnalisé',
    overview: `Programme adapté à votre objectif. Basé sur une progression douce avec écoute du corps.${echoPrompt()}`,
    phases: [
      { name: '🟢 Phase d\'adaptation (S1-S3)', duration: '3 semaines', description: 'Reprise progressive, construction des habitudes', sessions: ['3 sorties/sem de 45min à 1h', 'Intensité modérée (conversation possible)', 'Renforcement général 2x/sem'] },
      { name: '🟡 Phase de développement (S4-S8)', duration: '5 semaines', description: 'Montée en charge progressive', sessions: ['4 sorties/sem avec 1 sortie longue', '1 séance d\'intensité/sem', 'Renforcement spécifique'] },
      { name: '🔴 Phase de performance (S9-S12)', duration: '4 semaines', description: 'Pic de forme et maintien', sessions: ['Sortie longue simulant l\'objectif', 'Travail spécifique terrain', 'Récupération active', 'Affûtage dernière semaine'] },
    ],
    tips: ['Progresser de 10% max par semaine', 'Dormir suffisamment', 'S\'hydrater régulièrement', 'Tenir un carnet d\'entraînement'],
  };
}

function getSuggestions(sports: string[], sportLevels: Record<string, Level>): Array<{emoji: string; text: string}> {
  const suggestions: Array<{emoji: string; text: string}> = [];
  const levelOf = (s: string): Level => sportLevels[s] || 'intermediaire';

  if (sports.some(s => ['Trail', 'Ultra-trail', 'Course à pied'].includes(s))) {
    const lvl = levelOf(sports.find(s => ['Trail', 'Ultra-trail', 'Course à pied'].includes(s)) || 'Trail');
    suggestions.push(lvl === 'debutant'
      ? { emoji: '🏃', text: 'Courir mon premier 10 km trail (8 semaines)' }
      : { emoji: '🏃', text: 'Préparer un ultra-trail de 80km en 12 semaines' });
  }
  if (sports.some(s => ['Kitesurf', 'Wing foil'].includes(s))) {
    const lvl = levelOf(sports.find(s => ['Kitesurf', 'Wing foil'].includes(s)) || 'Kitesurf');
    suggestions.push(lvl === 'debutant'
      ? { emoji: '🪁', text: 'Premier waterstart et remontée au vent' }
      : { emoji: '🪁', text: 'Progresser en kite : du backroll au handle pass' });
  }
  if (sports.some(s => ['Escalade', 'Bloc'].includes(s))) {
    const lvl = levelOf(sports.find(s => ['Escalade', 'Bloc'].includes(s)) || 'Escalade');
    suggestions.push(lvl === 'debutant'
      ? { emoji: '🧗', text: 'Enchaîner mon premier 6a en tête (10 semaines)' }
      : { emoji: '🧗', text: 'Atteindre le 7a en tête en 10 semaines' });
  }
  if (sports.some(s => ['Plongée', 'Apnée'].includes(s))) {
    const lvl = levelOf(sports.find(s => ['Plongée', 'Apnée'].includes(s)) || 'Apnée');
    suggestions.push(lvl === 'debutant'
      ? { emoji: '🤿', text: 'Débuter l\'apnée : atteindre 2min en statique' }
      : { emoji: '🤿', text: 'Passer de 2min à 3min30 en apnée statique' });
  }
  if (sports.some(s => ['Alpinisme', 'Ski de rando'].includes(s))) suggestions.push({ emoji: '🏔', text: 'Préparer l\'ascension du Mont-Blanc' });
  if (sports.some(s => ['Parapente'].includes(s))) suggestions.push({ emoji: '🪂', text: 'Premier vol cross de 30km en parapente' });
  if (suggestions.length === 0) {
    suggestions.push({ emoji: '🏃', text: 'Préparer un trail de 50km' }, { emoji: '💪', text: 'Programme renforcement outdoor 8 semaines' });
  }
  return suggestions.slice(0, 4);
}

export default function CoachAIPage() {
  const { closeSubPage, selectedSports, sportLevels, showToast, language, savePlan, setSubPage } = useStore();
  const [input, setInput] = useState('');
  const [plan, setPlan] = useState<AIPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSavePlan = () => {
    if (!plan) return;
    savePlan({
      title: plan.title,
      sport: selectedSports[0] || 'Général',
      weeks: plan.phases.flatMap((p, idx) =>
        p.sessions.map((s, i) => ({ week: idx + 1, focus: p.name, sessions: [s] }))
      ).reduce((acc, curr) => {
        const existing = acc.find(a => a.week === curr.week);
        if (existing) existing.sessions.push(...curr.sessions);
        else acc.push({ week: curr.week, focus: curr.focus, sessions: [...curr.sessions] });
        return acc;
      }, [] as Array<{ week: number; focus: string; sessions: string[] }>),
      notes: plan.overview,
    });
    setSaved(true);
    showToast(t('plan.saved', language), 'success', '✅');
  };

  const suggestions = getSuggestions(selectedSports, sportLevels);

  const generate = (prompt: string) => {
    if (!prompt.trim()) return;
    setLoading(true);
    setPlan(null);
    setTimeout(() => {
      setPlan(generateAIResponse(prompt, selectedSports, sportLevels));
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] max-w-[430px] mx-auto pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-white/5">
        <button
          type="button"
          onClick={closeSubPage}
          className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          aria-label={t('coachAI.back', language)}
        >
          ←
        </button>
        <h2 className="font-semibold text-base">🤖 {t('coachAI.title', language)}</h2>
      </div>

      <div className="px-4 py-4 space-y-4">
        {!plan && !loading && (
          <>
            {/* Welcome */}
            <div className="text-center py-4">
              <p className="text-4xl mb-3">🧠</p>
              <h3 className="font-bold text-lg">{t('coachAI.welcome', language)}</h3>
              <p className="text-gray-400 text-sm mt-1">{t('coachAI.welcomeDesc', language)}</p>
            </div>

            {/* Quick prompts */}
            <div className="space-y-2">
              <p className="text-gray-400 font-medium text-sm">{t('coachAI.suggestions', language)}</p>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  className="w-full p-3 bg-[var(--card)] rounded-xl text-left hover:bg-white/5 transition flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
                  onClick={() => {
                    setInput(s.text);
                    generate(s.text);
                  }}
                  aria-label={`Suggestion : ${s.text}`}
                >
                  <span className="text-xl flex-shrink-0">{s.emoji}</span>
                  <span className="text-sm">{s.text}</span>
                </button>
              ))}
            </div>

            {/* Custom input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && input && generate(input)}
                placeholder={t('coachAI.inputPlaceholder', language)}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[var(--accent)] focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 text-sm"
                aria-label={t('coachAI.inputLabel', language)}
              />
              <button
                type="button"
                disabled={!input}
                className={`px-4 py-3 rounded-xl font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 ${input ? 'bg-[var(--accent)] text-white hover:opacity-90 focus-visible:outline-[var(--accent)]' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                onClick={() => generate(input)}
                aria-label={t('coachAI.adopt', language)}
              >
                →
              </button>
            </div>
          </>
        )}

        {/* Loading state */}
        {loading && (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[var(--accent)]/20 flex items-center justify-center animate-pulse">
              <span className="text-3xl">🧠</span>
            </div>
            <p className="text-gray-400 text-sm">{t('coachAI.generating', language)}</p>
            <div className="space-y-2 max-w-xs mx-auto">
              {[1,2,3].map(i => <div key={i} className="h-4 bg-white/5 rounded animate-pulse" />)}
            </div>
          </div>
        )}

        {/* Plan display */}
        {plan && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-[var(--card)] rounded-2xl p-4 space-y-2">
              <h3 className="text-lg font-bold text-[var(--accent)]">{plan.title}</h3>
              <p className="text-gray-300 text-sm">{plan.overview}</p>
              {plan.detected && Object.keys(plan.detected).length > 0 && (
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {plan.detected.weeks && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-medium">📅 {plan.detected.weeks} sem</span>
                  )}
                  {plan.detected.hoursPerWeek && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-medium">⏱ {plan.detected.hoursPerWeek}h/sem</span>
                  )}
                  {plan.detected.kmPerWeek && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-medium">🏃 {plan.detected.kmPerWeek} km/sem</span>
                  )}
                  {plan.detected.targetKm && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-medium">🎯 {plan.detected.targetKm} km</span>
                  )}
                  {plan.detected.targetMinutes && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-medium">🎯 {plan.detected.targetMinutes} min</span>
                  )}
                  {plan.detected.targetDepth && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-medium">🎯 -{plan.detected.targetDepth} m</span>
                  )}
                  {plan.detected.when && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-medium capitalize">📆 {plan.detected.when}</span>
                  )}
                  {plan.detected.goal && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-medium capitalize">🏷 {plan.detected.goal}</span>
                  )}
                </div>
              )}
            </div>

            {plan.phases.map((phase, i) => (
              <div key={i} className="bg-[var(--card)] rounded-2xl p-4 space-y-2">
                <h4 className="font-bold text-sm">{phase.name}</h4>
                <p className="text-gray-400 text-[13px]">{phase.duration} — {phase.description}</p>
                <ul className="space-y-1">
                  {phase.sessions.map((s, j) => (
                    <li key={j} className="flex items-start gap-2 text-gray-300 text-sm">
                      <span className="text-[var(--accent)] mt-0.5 flex-shrink-0">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="bg-emerald-900/20 border border-emerald-800/30 rounded-2xl p-4">
              <h4 className="font-bold text-emerald-400 mb-2 text-sm">💡 {t('coachAI.tips', language)}</h4>
              {plan.tips.map((t, i) => (
                <p key={i} className="text-gray-300 mb-1 text-sm">• {t}</p>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={saved}
                className={`flex-1 py-3 rounded-xl font-bold transition text-sm ${saved ? 'bg-green-700/30 text-green-300' : 'bg-[var(--accent)] text-white hover:opacity-90'}`}
                onClick={handleSavePlan}
                aria-label={t('plan.save', language)}
              >
                {saved ? '✓ ' + t('plan.saved', language) : '💾 ' + t('plan.save', language)}
              </button>
              <button
                type="button"
                className="py-3 px-4 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition text-sm"
                onClick={() => {
                  const planText = `🏔️ Mon plan Adventurer : ${plan.title}\n\n${plan.overview}\n\nGénère le tien gratuitement sur adventurer-outdoor.vercel.app`;
                  if (navigator.share) {
                    navigator.share({ title: plan.title, text: planText, url: 'https://adventurer-outdoor.vercel.app/coach/ai' }).catch(() => {});
                  } else if (navigator.clipboard) {
                    navigator.clipboard.writeText(planText).then(() => showToast(language === 'fr' ? 'Plan copié !' : 'Plan copied!', 'success', '📋')).catch(() => {});
                  }
                }}
                aria-label={language === 'fr' ? 'Partager le plan' : 'Share plan'}
              >
                📤
              </button>
              <button
                type="button"
                className="py-3 px-4 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition text-sm"
                onClick={() => {
                  setPlan(null);
                  setInput('');
                  setSaved(false);
                }}
                aria-label={t('coachAI.newGoal', language)}
              >
                🔄
              </button>
            </div>
            {saved && (
              <button
                type="button"
                onClick={() => setSubPage('my-plans')}
                className="w-full py-2 bg-white/5 text-gray-300 rounded-lg text-xs hover:bg-white/10 transition"
              >
                → {t('plan.myPlans', language)}
              </button>
            )}

            {/* UPSELL: Coach humain payant — monetisation */}
            <div className="bg-gradient-to-br from-[#F77F00]/20 to-[#DDA15E]/10 border border-[#F77F00]/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <h4 className="font-bold text-white text-sm">
                  {language === 'fr' ? 'Envie d\'aller plus loin ?' : 'Want to go further?'}
                </h4>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {language === 'fr'
                  ? 'L\'IA te donne la structure. Un coach humain certifié corrige les détails que l\'IA ne voit pas : posture, technique, mental. Sessions terrain ou visio.'
                  : 'AI gives you the structure. A certified human coach fixes the details AI can\'t see: posture, technique, mental game. In-person or video sessions.'}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSubPage('coach-hub')}
                  className="flex-1 py-2.5 bg-[#F77F00] text-[#1B4332] font-bold rounded-xl text-sm hover:bg-[#FFB703] transition"
                >
                  {language === 'fr' ? 'Voir les coachs →' : 'See coaches →'}
                </button>
                <span className="flex items-center text-xs text-gray-400 px-2">
                  {language === 'fr' ? 'Dès 55€/h' : 'From €55/h'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
