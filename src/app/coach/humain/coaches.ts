// Source of truth for coach profiles shown on /coach/humain and /coach/humain/[id].
// These are curated pilot profiles — will be replaced by Supabase-backed profiles
// once Stripe Connect onboarding flow is live.

export type Coach = {
  id: string;
  name: string;
  sport: string;
  universe: 'Terre' | 'Mer' | 'Air';
  location: string;
  bio: string;
  specialties: string[];
  years_experience: number;
  certifications: string[];
  price_per_session_cents: number;
  session_format: string;
  availability: string;
  photo_emoji: string;
  background_color: string;
  long_description?: string;
  languages?: string[];
};

export const COACHES: Coach[] = [
  {
    id: 'elena-apnee',
    name: 'Elena M.',
    sport: 'Apnée',
    universe: 'Mer',
    location: 'Villefranche-sur-Mer',
    bio: "Instructrice AIDA 3 étoiles, PB 78m en poids constant. Elena t'accompagne pour passer les 20m en confiance, avec travail de CO2, relaxation et sécurité.",
    long_description:
      "Je pratique l'apnée depuis 14 ans et j'enseigne depuis 9. Ma philosophie : la profondeur vient toujours de la détente, jamais de la force. On commence par un briefing théorie en visio pour travailler les tables CO2/O2 et la technique de mouthfill, puis on enchaîne en eau à Villefranche où les conditions sont idéales quasi toute l'année. Je filme chaque plongée pour un debrief image par image — tu verras en 3 sessions des choses que seuls les compétiteurs voient sur eux-mêmes.",
    specialties: ['Tables CO2/O2', 'Respiration', 'Passage 20m', 'Free Immersion'],
    years_experience: 9,
    certifications: ['AIDA Instructor 3★', 'Secouriste CFPS'],
    price_per_session_cents: 9500,
    session_format: 'Visio (théorie) + session eau à Villefranche',
    availability: 'Mar-sam, réservation 72h à l\u2019avance',
    photo_emoji: '🌊',
    background_color: '#023E8A',
    languages: ['Français', 'Italien', 'Anglais'],
  },
  {
    id: 'julien-kite',
    name: 'Julien P.',
    sport: 'Kitesurf',
    universe: 'Mer',
    location: 'Tarifa',
    bio: "10 ans à Tarifa, ex-compétiteur Red Bull King of the Air. Spécialiste du passage de strapless à foil, et du big air pour les riders qui veulent envoyer.",
    long_description:
      "Basé à Tarifa toute l'année, je coache des riders intermédiaires à avancés. Mon truc : te faire comprendre pourquoi tu rates un move, pas juste te répéter comment le faire. Session type : 30 min de lecture du spot (vent, marée, trafic), 2h sur l'eau avec radio, 30 min de debrief vidéo. Les plus grosses progressions se font sur 3-5 sessions en mode stage.",
    specialties: ['Foil', 'Strapless', 'Big Air', 'Safety / self-rescue'],
    years_experience: 12,
    certifications: ['IKO Level 3', 'Surf Life Saving Spain'],
    price_per_session_cents: 11000,
    session_format: '2h30 eau + debrief vidéo',
    availability: 'Toute l\u2019année selon Levante/Poniente',
    photo_emoji: '💨',
    background_color: '#F77F00',
    languages: ['Français', 'Espagnol', 'Anglais'],
  },
  {
    id: 'marie-trail',
    name: 'Marie D.',
    sport: 'Ultra-trail',
    universe: 'Terre',
    location: 'Chamonix',
    bio: "Finisheuse UTMB 2023, coach diplômée d'État. Construit ton plan sur 16-24 semaines en fonction de ton job, ta famille, ta course cible.",
    long_description:
      "Je prépare chaque athlète en fonction de sa vie, pas d'un template. On part de ta course cible (UTMB, CCC, TDS, 80km du Mont-Blanc, Diagonale des Fous...), on remonte à l'envers : quels pics de charge, quelles semaines allégées, quelle prépa côtes, quel travail seuil, quand intégrer les tests. Je suis aussi formée en nutrition sportive INSEP — on travaille aussi l'alimentation d'entraînement, de course et de récup.",
    specialties: ['Plan UTMB', 'Dénivelé', 'Fractionné côtes', 'Nutrition course'],
    years_experience: 7,
    certifications: ['BPJEPS AF', 'Nutrition sportive INSEP'],
    price_per_session_cents: 7500,
    session_format: 'Suivi mensuel (plan écrit + 2 visios)',
    availability: 'Démarrages toutes les 2 semaines',
    photo_emoji: '⛰️',
    background_color: '#2D6A4F',
    languages: ['Français', 'Anglais'],
  },
  {
    id: 'thomas-alpi',
    name: 'Thomas R.',
    sport: 'Alpinisme',
    universe: 'Terre',
    location: 'Chamonix',
    bio: 'Guide de haute montagne UIAGM. Mont-Blanc, Cervin, grandes voies Mont-Blanc du Tacul. Aussi prépa physique spécifique alpinisme en intersaison.',
    long_description:
      "Diplômé UIAGM depuis 2014, je guide principalement sur le massif du Mont-Blanc. J'accompagne tous les niveaux, du premier 4000m au Cervin en arête Lion. En intersaison (mai et octobre-novembre), je propose une prépa physique spécifique alpinisme — pas une salle de muscu, mais de vraies sorties qui construisent la caisse dont tu as besoin en altitude.",
    specialties: ['Mont-Blanc 4810', 'Cascade de glace', 'Crevasse rescue', 'Prépa physique'],
    years_experience: 15,
    certifications: ['Guide UIAGM', 'Secouriste montagne'],
    price_per_session_cents: 42000,
    session_format: 'Course guidée journée ou stage 3-5j',
    availability: 'Saison juin-septembre (alpi été)',
    photo_emoji: '🏔️',
    background_color: '#1B4332',
    languages: ['Français', 'Anglais', 'Italien'],
  },
  {
    id: 'sarah-parapente',
    name: 'Sarah L.',
    sport: 'Parapente',
    universe: 'Air',
    location: 'Saint-Hilaire du Touvet',
    bio: "Brevet pro vol libre, cross-country 150km+. Passage du brevet de pilote, cross-country et vol de distance. Débriefings vidéo ultra-détaillés.",
    long_description:
      "Installée à Saint-Hilaire, je coache le passage du brevet pilote jusqu'au cross-country longue distance. Ma spécialité : décoder les thermiques à l'oeil et à la radio, pour que tu arrêtes de zigzaguer et que tu commences à voler en distance. J'analyse chaque vol sur les traces IGC et on décortique vidéo à l'appui.",
    specialties: ['Cross-country', 'Thermique', 'SIV', 'Vol d\u2019onde'],
    years_experience: 11,
    certifications: ['Brevet Pro FFVL', 'SIV instructor'],
    price_per_session_cents: 8500,
    session_format: 'Vol accompagné + debrief GPS',
    availability: 'Mar-dim si conditions',
    photo_emoji: '🪂',
    background_color: '#DDA15E',
    languages: ['Français', 'Anglais'],
  },
  {
    id: 'karim-escalade',
    name: 'Karim B.',
    sport: 'Escalade',
    universe: 'Terre',
    location: 'Fontainebleau',
    bio: "Ouvreur Fontainebleau et falaise. Si tu plafonnes à 6b, il t'emmène à 7a+ en 3 mois — travail de lecture, pose de pieds, mental.",
    long_description:
      "Ouvreur de voies depuis 8 ans sur Bleau et falaises alentour. Mes sessions : on ne touche pas à la paroi avant 15 min, on lit. Lecture de voie, placement du corps, option droite/option gauche. La plupart des plateaux viennent de là, pas de la force. Je travaille aussi le mental — la chute, la respiration, l'engagement.",
    specialties: ['Bloc', 'Falaise couenne', 'Lecture de voie', 'Gestion chute'],
    years_experience: 8,
    certifications: ['DEJEPS Escalade'],
    price_per_session_cents: 6500,
    session_format: 'Session 3h falaise ou bloc',
    availability: 'Week-ends principalement',
    photo_emoji: '🧗',
    background_color: '#8B4513',
    languages: ['Français', 'Anglais'],
  },
  {
    id: 'leo-surf',
    name: 'Léo V.',
    sport: 'Surf',
    universe: 'Mer',
    location: 'Hossegor',
    bio: "Ancien circuit WQS, coach à La Gravière depuis 2018. Spécialiste de la progression du take-off au tube, avec lecture de houle personnalisée.",
    long_description:
      "Ex-compétiteur WQS, j'ai bouclé ma carrière en 2018 pour coacher sur Hossegor. Ma philosophie : tu n'as pas besoin de 4h à l'eau, tu as besoin de 90 min bien placées au bon endroit du banc de sable. Je lis la houle avec toi, on rentre au bon moment, et on filme les vagues clés pour le debrief.",
    specialties: ['Take-off', 'Bottom turn', 'Tube', 'Lecture de houle'],
    years_experience: 10,
    certifications: ['BPJEPS Surf', 'Sauveteur côtier SNSM'],
    price_per_session_cents: 7000,
    session_format: 'Session 2h + video coaching',
    availability: 'Toute l\u2019année, beachbreak',
    photo_emoji: '🏄',
    background_color: '#0077B6',
    languages: ['Français', 'Anglais'],
  },
  {
    id: 'anais-ski-rando',
    name: 'Anaïs C.',
    sport: 'Ski de rando',
    universe: 'Terre',
    location: 'La Grave',
    bio: "Aspirante guide, spécialiste ski freerando et nivologie. Courses engagées en Oisans, sorties nivologie pour comprendre vraiment le manteau neigeux.",
    long_description:
      "Aspirante guide, je termine ma formation UIAGM l'an prochain. Je me concentre sur le ski de rando engagé et la nivologie. Une sortie typique : départ nuit, lecture de pente et de manteau en montant, couloir choisi sur place selon ce qu'on voit, descente adaptée au niveau du groupe. Je prends max 3 personnes pour garder la sécurité au top.",
    specialties: ['Ski hors-piste', 'Nivologie', 'Recherche DVA', 'Courses Oisans'],
    years_experience: 6,
    certifications: ['Aspirant Guide UIAGM', 'Brevet nivologie'],
    price_per_session_cents: 28000,
    session_format: 'Course journée en petit groupe',
    availability: 'Décembre-mai',
    photo_emoji: '⛷️',
    background_color: '#CBD5E1',
    languages: ['Français', 'Anglais'],
  },
];

export function findCoach(id: string): Coach | undefined {
  return COACHES.find(c => c.id === id);
}
