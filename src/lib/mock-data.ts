import { Achievement, AdventureToday, UpcomingEvent, TrainingPlan, GpxRoute, MarketItem, NearbyPerson, SpotItem, GearSuggestion, InspirationPost, UserProfile, Team, Conversation } from '@/types';

// ===== USER PROFILES (NEW V5) =====
export const USER_PROFILES: UserProfile[] = [
  {
    id: 'sophie-m',
    name: 'Sophie M.',
    avatar: '👩‍🦰',
    location: 'Chamonix, France',
    bio: 'Alpiniste et traileuse passionnée. 4 000m+ sous les pieds, toujours en quête du prochain sommet.',
    sports: ['Alpinisme', 'Trail', 'Ski de rando'],
    stats: { sorties: 342, hours: 1280, dplus: 485000, km: 8200 },
    badges: ['Sommet 4000m', 'Ultra finisher', '100 trails'],
    level: 'Expert',
    joinedDate: '2023-03-15',
    isOnline: true
  },
  {
    id: 'lucas-v',
    name: 'Lucas V.',
    avatar: '🧑‍🦱',
    location: 'Annecy, France',
    bio: 'Parapentiste et moniteur VTT. Le ciel est mon terrain de jeu.',
    sports: ['Parapente', 'VTT', 'Ski alpin'],
    stats: { sorties: 215, hours: 890, dplus: 210000, km: 5400 },
    badges: ['Vol 100km', 'Enduro pro'],
    level: 'Confirmé',
    joinedDate: '2023-06-20',
    isOnline: false
  },
  {
    id: 'maelle-r',
    name: 'Maëlle R.',
    avatar: '👩',
    location: 'Biarritz, France',
    bio: 'Surfeuse et kitesurfeuse. L\'océan est ma thérapie.',
    sports: ['Kitesurf', 'Surf', 'Paddle'],
    stats: { sorties: 280, hours: 960, dplus: 0, km: 3200 },
    badges: ['100 sessions', 'Kite addict'],
    level: 'Confirmé',
    joinedDate: '2023-01-10',
    isOnline: true
  },
  {
    id: 'thomas-r',
    name: 'Thomas R.',
    avatar: '🧔',
    location: 'Toulouse, France',
    bio: 'Ultra-traileur et grimpeur. La montagne, toujours la montagne.',
    sports: ['Trail', 'Ultra-trail', 'Escalade'],
    stats: { sorties: 198, hours: 750, dplus: 320000, km: 6100 },
    badges: ['UTMB finisher', '7a en tête'],
    level: 'Expert',
    joinedDate: '2022-11-05',
    isOnline: false
  },
  {
    id: 'anna-k',
    name: 'Anna K.',
    avatar: '👱‍♀️',
    location: 'Nice, France',
    bio: 'Plongeuse et apnéiste. Le monde du silence m\'appelle.',
    sports: ['Plongée', 'Apnée', 'Snorkeling'],
    stats: { sorties: 156, hours: 520, dplus: 0, km: 1200 },
    badges: ['PADI Advanced', '-40m apnée'],
    level: 'Confirmé',
    joinedDate: '2023-09-01',
    isOnline: true
  },
  {
    id: 'pierre-l',
    name: 'Pierre L.',
    avatar: '🧑‍🏫',
    location: 'Chamonix, France',
    bio: 'Moniteur parapente BEES. 15 ans de vol dans les Alpes.',
    sports: ['Parapente', 'Speedriding', 'Alpinisme'],
    stats: { sorties: 520, hours: 2100, dplus: 0, km: 12000 },
    badges: ['Coach certifié', '1000 vols'],
    level: 'Expert',
    joinedDate: '2022-01-15',
    isOnline: false
  },
  {
    id: 'julie-d',
    name: 'Julie D.',
    avatar: '🧑‍🏫',
    location: 'Tarifa, Espagne',
    bio: 'Monitrice kitesurf IKO Level 3. Le vent est mon métier.',
    sports: ['Kitesurf', 'Wing foil', 'Surf'],
    stats: { sorties: 480, hours: 1900, dplus: 0, km: 9500 },
    badges: ['IKO L3', 'Coach certifié'],
    level: 'Expert',
    joinedDate: '2022-05-20',
    isOnline: true
  },
  {
    id: 'marc-b',
    name: 'Marc B.',
    avatar: '🧑',
    location: 'Grenoble, France',
    bio: 'Grimpeur passionné, ouvreur de voies. 8a+ en objectif.',
    sports: ['Escalade', 'Bloc', 'Alpinisme'],
    stats: { sorties: 310, hours: 1100, dplus: 180000, km: 2800 },
    badges: ['7c réalisé', 'Ouvreur'],
    level: 'Expert',
    joinedDate: '2023-04-12',
    isOnline: false
  },
  {
    id: 'marco-v',
    name: 'Marco V.',
    avatar: '🧔‍♂️',
    location: 'Tarifa, Espagne',
    bio: 'Kitesurfeur toute l\'année entre Tarifa et Dakhla. Levante mon meilleur ami.',
    sports: ['Kitesurf', 'Wing foil', 'Surf'],
    stats: { sorties: 260, hours: 1050, dplus: 0, km: 4800 },
    badges: ['Strapless rider', '25 nds club'],
    level: 'Confirmé',
    joinedDate: '2023-03-10',
    isOnline: true
  },
  {
    id: 'paolo-v',
    name: 'Paolo V.',
    avatar: '🤿',
    location: 'Cassis, France',
    bio: 'Instructeur AIDA et freediver. Progression en profondeur, tables CO2/O2 et sécurité.',
    sports: ['Apnée', 'Plongée', 'Snorkeling'],
    stats: { sorties: 420, hours: 1500, dplus: 0, km: 900 },
    badges: ['AIDA Instructor', '-60m apnée'],
    level: 'Expert',
    joinedDate: '2022-08-01',
    isOnline: true
  },
];

export function getUserProfile(id: string): UserProfile | undefined {
  return USER_PROFILES.find(u => u.id === id);
}

// ===== TEAMS (NEW V5) =====
export const TEAMS: Team[] = [
  {
    id: 'team-trail-chamonix',
    name: 'Trail Chamonix Crew',
    emoji: '🏃',
    description: 'Groupe de trail running autour de Chamonix. Sorties hebdo, prépa UTMB, convivialité.',
    sport: 'Trail',
    memberCount: 24,
    members: [
      { id: 'sophie-m', name: 'Sophie M.', avatar: '👩‍🦰', role: 'admin', joinedDate: '2023-03-15', sport: 'Trail' },
      { id: 'thomas-r', name: 'Thomas R.', avatar: '🧔', role: 'member', joinedDate: '2023-04-01', sport: 'Trail' },
      { id: 'marc-b', name: 'Marc B.', avatar: '🧑', role: 'member', joinedDate: '2023-06-10', sport: 'Escalade' },
    ],
    location: 'Chamonix, France',
    nextEvent: 'Sortie longue samedi 8h — Lac Blanc',
    isPublic: true,
    createdBy: 'sophie-m'
  },
  {
    id: 'team-kite-tarifa',
    name: 'Kite Tribe Tarifa',
    emoji: '🪁',
    description: 'Sessions kite à Tarifa et alentours. Tous niveaux bienvenus, ambiance chill.',
    sport: 'Kitesurf',
    memberCount: 18,
    members: [
      { id: 'julie-d', name: 'Julie D.', avatar: '🧑‍🏫', role: 'admin', joinedDate: '2022-05-20', sport: 'Kitesurf' },
      { id: 'maelle-r', name: 'Maëlle R.', avatar: '👩', role: 'member', joinedDate: '2023-02-14', sport: 'Kitesurf' },
    ],
    location: 'Tarifa, Espagne',
    nextEvent: 'Session Levante dimanche 10h',
    isPublic: true,
    createdBy: 'julie-d'
  },
  {
    id: 'team-grimpe-grenoble',
    name: 'Grenoble Grimpe',
    emoji: '🧗',
    description: 'Escalade en salle et falaise. Du 5c au 8a, tout le monde progresse ensemble.',
    sport: 'Escalade',
    memberCount: 31,
    members: [
      { id: 'marc-b', name: 'Marc B.', avatar: '🧑', role: 'admin', joinedDate: '2023-04-12', sport: 'Escalade' },
      { id: 'thomas-r', name: 'Thomas R.', avatar: '🧔', role: 'member', joinedDate: '2023-05-01', sport: 'Escalade' },
    ],
    location: 'Grenoble, France',
    nextEvent: 'Falaise des Gaillands mercredi 18h',
    isPublic: true,
    createdBy: 'marc-b'
  },
  {
    id: 'team-plongee-nice',
    name: 'Nice Dive Club',
    emoji: '🤿',
    description: 'Plongée et apnée en Méditerranée. Explorations d\'épaves, bio marine, formations.',
    sport: 'Plongée',
    memberCount: 15,
    members: [
      { id: 'anna-k', name: 'Anna K.', avatar: '👱‍♀️', role: 'admin', joinedDate: '2023-09-01', sport: 'Plongée' },
    ],
    location: 'Nice, France',
    nextEvent: 'Plongée épave Le Donator samedi',
    isPublic: true,
    createdBy: 'anna-k'
  },
  {
    id: 'team-apnee-cassis',
    name: 'Apnée Cassis',
    emoji: '🌊',
    description: 'Apnée profonde et statique en Méditerranée. Tables CO2/O2, progression douce, sécurité binôme obligatoire.',
    sport: 'Apnée',
    memberCount: 9,
    members: [
      { id: 'paolo-v', name: 'Paolo V.', avatar: '🤿', role: 'admin', joinedDate: '2022-08-01', sport: 'Apnée' },
      { id: 'anna-k', name: 'Anna K.', avatar: '👱‍♀️', role: 'member', joinedDate: '2023-09-15', sport: 'Apnée' },
    ],
    location: 'Cassis, France',
    nextEvent: 'Session profondeur dimanche 9h — Calanque d\'En-Vau',
    isPublic: true,
    createdBy: 'paolo-v'
  },
  {
    id: 'team-parapente-annecy',
    name: 'Vol Libre Annecy',
    emoji: '🪂',
    description: 'Parapente au-dessus du lac d\'Annecy. Cross, soaring, acro — tous styles.',
    sport: 'Parapente',
    memberCount: 12,
    members: [
      { id: 'lucas-v', name: 'Lucas V.', avatar: '🧑‍🦱', role: 'admin', joinedDate: '2023-06-20', sport: 'Parapente' },
      { id: 'pierre-l', name: 'Pierre L.', avatar: '🧑‍🏫', role: 'member', joinedDate: '2023-07-01', sport: 'Parapente' },
    ],
    location: 'Annecy, France',
    nextEvent: 'Vol cross jeudi 14h si conditions',
    isPublic: true,
    createdBy: 'lucas-v'
  },
];

export function getTeam(id: string): Team | undefined {
  return TEAMS.find(t => t.id === id);
}

// ===== CONVERSATIONS (NEW V5) =====
export const CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-sophie',
    participantId: 'sophie-m',
    participantName: 'Sophie M.',
    participantAvatar: '👩‍🦰',
    lastMessage: 'Super, on se retrouve au parking de la Flégère à 8h ?',
    lastMessageTime: 'Il y a 2h',
    unread: 2,
    isGroup: false
  },
  {
    id: 'conv-thomas',
    participantId: 'thomas-r',
    participantName: 'Thomas R.',
    participantAvatar: '🧔',
    lastMessage: 'Le sentier des Aiguilles Rouges était incroyable !',
    lastMessageTime: 'Il y a 5h',
    unread: 0,
    isGroup: false
  },
  {
    id: 'conv-maelle',
    participantId: 'maelle-r',
    participantName: 'Maëlle R.',
    participantAvatar: '👩',
    lastMessage: 'Levante annoncé dimanche, tu viens rider ?',
    lastMessageTime: 'Hier',
    unread: 1,
    isGroup: false
  },
  {
    id: 'conv-trail-crew',
    participantId: 'team-trail-chamonix',
    participantName: 'Trail Chamonix Crew',
    participantAvatar: '🏃',
    lastMessage: 'Sophie : RDV samedi 8h parking Flégère pour la longue',
    lastMessageTime: 'Il y a 1h',
    unread: 5,
    isGroup: true,
    groupName: 'Trail Chamonix Crew',
    groupEmoji: '🏃'
  },
  {
    id: 'conv-kite-tribe',
    participantId: 'team-kite-tarifa',
    participantName: 'Kite Tribe Tarifa',
    participantAvatar: '🪁',
    lastMessage: 'Julie : Vent parfait demain, qui est chaud ?',
    lastMessageTime: 'Il y a 3h',
    unread: 3,
    isGroup: true,
    groupName: 'Kite Tribe Tarifa',
    groupEmoji: '🪁'
  },
  {
    id: 'conv-anna',
    participantId: 'anna-k',
    participantName: 'Anna K.',
    participantAvatar: '👱‍♀️',
    lastMessage: 'La visibilité était folle ce matin, 25m+',
    lastMessageTime: 'Il y a 1j',
    unread: 0,
    isGroup: false
  },
  // ── Welcome & community conversations ──
  {
    id: 'conv-welcome',
    participantId: 'team-adventurer',
    participantName: 'Équipe Adventurer',
    participantAvatar: '🏔️',
    lastMessage: 'Bienvenue dans la communauté ! N\'hésite pas à contacter les coachs ou vendeurs. On est là si tu as des questions.',
    lastMessageTime: 'Bienvenue',
    unread: 1,
    isGroup: false
  },
  {
    id: 'conv-marie-coach',
    participantId: 'marie-coach',
    participantName: 'Marie D. (Coach Trail)',
    participantAvatar: '🏃‍♀️',
    lastMessage: 'Salut ! Je suis dispo pour une session...',
    lastMessageTime: 'Il y a 4h',
    unread: 1,
    isGroup: false
  },
  {
    id: 'conv-lucas-p',
    participantId: 'lucas-p',
    participantName: 'Lucas P.',
    participantAvatar: '👋',
    lastMessage: 'Hey, ton annonce de chaussures trail m\'intéresse !',
    lastMessageTime: 'Il y a 6h',
    unread: 1,
    isGroup: false
  },
];

export function getConversation(id: string): Conversation | undefined {
  return CONVERSATIONS.find(c => c.id === id);
}

export function getConversationMessages(convId: string): Array<{id: string; from: string; content: string; time: string; isMe: boolean}> {
  // Return mock messages for each conversation
  const messages: Record<string, Array<{id: string; from: string; content: string; time: string; isMe: boolean}>> = {
    'conv-sophie': [
      { id: '1', from: 'Sophie M.', content: 'Salut ! Tu es dispo samedi pour la sortie longue ?', time: '10:30', isMe: false },
      { id: '2', from: 'Moi', content: 'Salut Sophie ! Oui carrément, quel parcours ?', time: '10:45', isMe: true },
      { id: '3', from: 'Sophie M.', content: 'Je pensais au Lac Blanc par la Flégère, 22km et 1200m D+', time: '11:00', isMe: false },
      { id: '4', from: 'Moi', content: 'Parfait, c\'est exactement ce qu\'il me faut pour la prépa UTMB', time: '11:15', isMe: true },
      { id: '5', from: 'Sophie M.', content: 'Super, on se retrouve au parking de la Flégère à 8h ?', time: '11:20', isMe: false },
    ],
    'conv-thomas': [
      { id: '1', from: 'Thomas R.', content: 'Tu as fait les Aiguilles Rouges récemment ?', time: '08:00', isMe: false },
      { id: '2', from: 'Moi', content: 'Oui la semaine dernière, conditions parfaites', time: '08:30', isMe: true },
      { id: '3', from: 'Thomas R.', content: 'Le sentier des Aiguilles Rouges était incroyable !', time: '09:00', isMe: false },
    ],
    'conv-maelle': [
      { id: '1', from: 'Maëlle R.', content: 'Hey ! Tu rides ce week-end ?', time: '14:00', isMe: false },
      { id: '2', from: 'Moi', content: 'Ça dépend du vent, qu\'est-ce qui est annoncé ?', time: '14:15', isMe: true },
      { id: '3', from: 'Maëlle R.', content: 'Levante annoncé dimanche, tu viens rider ?', time: '14:30', isMe: false },
    ],
    'conv-trail-crew': [
      { id: '1', from: 'Sophie M.', content: 'Sortie longue ce samedi, qui est partant ?', time: '09:00', isMe: false },
      { id: '2', from: 'Thomas R.', content: 'Moi ! Quel parcours ?', time: '09:15', isMe: false },
      { id: '3', from: 'Moi', content: 'Je suis aussi, let\'s go !', time: '09:30', isMe: true },
      { id: '4', from: 'Sophie M.', content: 'RDV samedi 8h parking Flégère pour la longue', time: '09:45', isMe: false },
    ],
    'conv-kite-tribe': [
      { id: '1', from: 'Julie D.', content: 'Prévisions Levante 25-30 nœuds demain', time: '16:00', isMe: false },
      { id: '2', from: 'Maëlle R.', content: 'Je prends ma 9m !', time: '16:10', isMe: false },
      { id: '3', from: 'Julie D.', content: 'Vent parfait demain, qui est chaud ?', time: '16:20', isMe: false },
    ],
    'conv-anna': [
      { id: '1', from: 'Anna K.', content: 'On a vu un mérou énorme ce matin à la Gabinière', time: '12:00', isMe: false },
      { id: '2', from: 'Moi', content: 'Trop bien ! La visi était bonne ?', time: '12:30', isMe: true },
      { id: '3', from: 'Anna K.', content: 'La visibilité était folle ce matin, 25m+', time: '12:45', isMe: false },
    ],
    'conv-welcome': [
      { id: '1', from: 'Équipe Adventurer', content: 'Bienvenue dans la communauté Adventurer ! 🏔️', time: '09:00', isMe: false },
      { id: '2', from: 'Équipe Adventurer', content: 'Ici tu peux trouver des partenaires, des coachs certifiés, du matériel d\'occasion et des défis pour te motiver.', time: '09:01', isMe: false },
      { id: '3', from: 'Équipe Adventurer', content: 'N\'hésite pas à contacter les coachs ou vendeurs. On est là si tu as des questions.', time: '09:02', isMe: false },
    ],
    'conv-marie-coach': [
      { id: '1', from: 'Marie D. (Coach Trail)', content: 'Salut ! Je suis Marie, coach trail certifiée ITRA.', time: '10:00', isMe: false },
      { id: '2', from: 'Marie D. (Coach Trail)', content: 'Je suis dispo pour une session découverte gratuite de 30 min si tu veux qu\'on parle de tes objectifs trail.', time: '10:01', isMe: false },
      { id: '3', from: 'Marie D. (Coach Trail)', content: 'J\'accompagne des coureurs du 20km au 100 miles. Dis-moi si ça t\'intéresse ! 💪', time: '10:02', isMe: false },
    ],
    'conv-lucas-p': [
      { id: '1', from: 'Lucas P.', content: 'Hey !', time: '14:00', isMe: false },
      { id: '2', from: 'Lucas P.', content: 'Hey, ton annonce de chaussures trail m\'intéresse ! Elles sont en quelle taille ?', time: '14:01', isMe: false },
      { id: '3', from: 'Lucas P.', content: 'Je fais du 43, si ça colle je peux passer les chercher ce week-end.', time: '14:02', isMe: false },
    ],
  };
  return messages[convId] || [];
}

// ===== ADVENTURES (V4 DATA) =====
export function getAdventuresForSwipe(sports: string[] = []): AdventureToday[] {
  const all: AdventureToday[] = [
    {
      id: 1,
      emoji: '🏃',
      title: 'Trail des Aiguilles Rouges',
      description: 'Sentier sec, météo grand beau. Vue imprenable sur le Mont-Blanc.',
      temp: '☀️ 15°C',
      dplus: '⛰️ +980m D+',
      distance: '📏 14 km',
      condition: '🟢 Sec',
      conditionLabel: 'Conditions idéales',
      ctaLabel: '→ Voir l\'itinéraire',
      socialProof: 'Sophie prévoit le même trail à 9h',
      sport: 'Trail'
    },
    {
      id: 2,
      emoji: '🥾',
      title: 'Lac Blanc par la Flégère',
      description: 'Panorama 360° sur le massif du Mont-Blanc. Sentier bien balisé.',
      temp: '☀️ 12°C',
      dplus: '⛰️ +940m D+',
      distance: '📏 10.8 km',
      condition: '',
      conditionLabel: 'Conditions idéales',
      ctaLabel: '→ Planifier',
      socialProof: '3 randonneurs y vont ce matin',
      sport: 'Randonnée'
    },
    {
      id: 3,
      emoji: '🧗',
      title: 'Falaise des Gaillands',
      description: 'Rocher sec, plein sud, pas de vent. Idéal pour tes projets 6c-7a.',
      temp: '☀️ Plein sud',
      dplus: '🌡 17°C',
      distance: '🪨 Sec',
      condition: '',
      conditionLabel: 'Conditions idéales',
      ctaLabel: '→ Trouver un partenaire',
      socialProof: 'Sophie grimpe là-bas ce matin',
      sport: 'Escalade'
    },
    {
      id: 4,
      emoji: '🪁',
      title: 'Session Kite — Tarifa',
      description: 'Levante 22 nœuds, houle modérée. Conditions parfaites pour le freestyle.',
      temp: '🌬️ 22 nds',
      dplus: '🌊 1.2m',
      distance: '☀️ 24°C',
      condition: '',
      conditionLabel: 'Vent idéal',
      ctaLabel: '→ Voir le spot',
      socialProof: '5 riders sur place',
      sport: 'Kitesurf'
    },
    {
      id: 5,
      emoji: '🤿',
      title: 'Plongée — Épave Le Donator',
      description: 'Visibilité 20m+, courant faible. Épave mythique à 50m.',
      temp: '🌡 18°C eau',
      dplus: '👁 20m visi',
      distance: '🌊 Calme',
      condition: '',
      conditionLabel: 'Conditions parfaites',
      ctaLabel: '→ Réserver',
      socialProof: 'Anna plonge demain matin',
      sport: 'Plongée'
    },
    {
      id: 6,
      emoji: '🪂',
      title: 'Vol parapente — Planfait',
      description: 'Thermiques doux, brise de vallée 10km/h. Décollage idéal.',
      temp: '☀️ 20°C',
      dplus: '🌬️ 10 km/h',
      distance: '☁️ Peu nuageux',
      condition: '',
      conditionLabel: 'Conditions idéales',
      ctaLabel: '→ Voir le site',
      socialProof: 'Lucas décolle à 14h',
      sport: 'Parapente'
    },
  ];
  if (!sports.length) return all;
  const filtered = all.filter(a => a.sport && sports.some(s => a.sport?.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(a.sport?.toLowerCase() || '')));
  return filtered.length ? filtered : all.slice(0, 3);
}

// ===== WEATHER CONDITIONS (V4 DATA) =====
export function getWeatherConditions(sports: string[] = []): Array<{sport: string; emoji: string; label: string; status: string}> {
  const all = [
    { sport: 'Trail / Rando', emoji: '☀️', label: 'Trail / Rando', status: 'Conditions idéales' },
    { sport: 'Escalade', emoji: '🪨', label: 'Escalade', status: 'Rocher sec' },
    { sport: 'Alpinisme', emoji: '🏔', label: 'Alpinisme', status: 'Gel nocturne ✓' },
    { sport: 'Kitesurf', emoji: '🪁', label: 'Kitesurf', status: '22 nds Levante' },
    { sport: 'Surf', emoji: '🏄', label: 'Surf', status: '1.5m — Offshore' },
    { sport: 'Plongée', emoji: '🤿', label: 'Plongée', status: 'Visi 20m+' },
    { sport: 'Parapente', emoji: '🪂', label: 'Parapente', status: 'Thermiques doux' },
    { sport: 'VTT', emoji: '🚵', label: 'VTT', status: 'Sentiers secs' },
    { sport: 'Ski de rando', emoji: '⛷️', label: 'Ski de rando', status: 'Risque 2/5' },
  ];
  if (!sports.length) return all.slice(0, 3);
  return all.filter(w => sports.some(s => w.sport.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(w.sport.toLowerCase()))).slice(0, 4) || all.slice(0, 3);
}

// ===== UPCOMING EVENTS (V4 DATA) =====
export function getUpcomingEvents(): UpcomingEvent[] {
  return [
    {
      id: 1,
      date: '28 Août · Chamonix, France',
      location: 'Chamonix',
      emoji: '🏃',
      title: 'Ultra-Trail du Mont-Blanc',
      description: '171km · +10 000m D+ · Inscriptions ouvertes',
      tag: 'Ultra',
      price: '380€',
      spots: '2500 dossards',
      sport: 'Ultra-trail'
    },
    {
      id: 2,
      date: '30 Août · Chamonix, France',
      location: 'Chamonix',
      emoji: '🏔',
      title: 'Trail du Mont-Blanc 90km',
      description: '90km · +5 800m D+ · Places limitées',
      tag: 'Expert',
      price: '260€',
      sport: 'Trail'
    },
    {
      id: 3,
      date: '15 Juin · Les Gaillands',
      location: 'Les Gaillands',
      emoji: '🧗',
      title: 'Open Bloc Chamonix',
      description: 'Compétition bloc outdoor · Ambiance festival',
      tag: 'Tous niveaux',
      price: 'Gratuit',
      sport: 'Bloc'
    },
    {
      id: 4,
      date: '20 Juillet · Tarifa',
      location: 'Tarifa',
      emoji: '🪁',
      title: 'Tarifa Kite Festival',
      description: 'Compétition freestyle + freeride · 3 jours',
      tag: 'Open',
      price: '50€',
      sport: 'Kitesurf'
    },
    {
      id: 5,
      date: '10 Sept · Annecy',
      location: 'Annecy',
      emoji: '🪂',
      title: 'Coupe Icare',
      description: 'Festival de vol libre · Déguisements & performances',
      tag: 'Festival',
      price: 'Gratuit',
      sport: 'Parapente'
    },
    // ── Active community challenges ──
    {
      id: 101,
      date: 'Jusqu\'au 30 Avril · 47 participants',
      location: 'Partout',
      emoji: '⛰️',
      title: '10 000m D+ en avril',
      description: 'Cumule 10 000m de dénivelé positif avant la fin du mois. Trail, rando, tout compte !',
      tag: 'Challenge',
      price: 'Gratuit',
      spots: '47 inscrits',
      sport: 'Trail'
    },
    {
      id: 102,
      date: 'Jusqu\'au 31 Mai · 23 participants',
      location: 'Tous les spots',
      emoji: '🪁',
      title: '5 sessions kite en mai',
      description: 'Ride 5 sessions complètes en mai. Strapless, foil ou twintip — tout style accepté.',
      tag: 'Challenge',
      price: 'Gratuit',
      spots: '23 inscrits',
      sport: 'Kitesurf'
    },
    {
      id: 103,
      date: 'Jusqu\'au 30 Sept · 156 participants',
      location: 'Corse, GR20',
      emoji: '🥾',
      title: 'GR20 Summer Challenge',
      description: 'Boucle le GR20 cet été — nord, sud ou intégrale. Partage ta trace GPS !',
      tag: 'Challenge',
      price: 'Gratuit',
      spots: '156 inscrits',
      sport: 'Trekking'
    },
    {
      id: 104,
      date: 'Jusqu\'au 30 Juin · 18 participants',
      location: 'Mer ou piscine',
      emoji: '🌊',
      title: 'Apnée 3 minutes',
      description: 'Atteins 3 minutes en apnée statique avant fin juin. Progression, tables CO2/O2, sécurité.',
      tag: 'Challenge',
      price: 'Gratuit',
      spots: '18 inscrits',
      sport: 'Apnée'
    },
    {
      id: 105,
      date: 'Jusqu\'au 31 Août · 34 participants',
      location: 'Alpes, Tour du Mont-Blanc',
      emoji: '🚴',
      title: 'Tour du Mont-Blanc à vélo',
      description: 'Boucle le TMB en gravel ou route cet été. 330km · +8 000m D+ · 3 pays.',
      tag: 'Challenge',
      price: 'Gratuit',
      spots: '34 inscrits',
      sport: 'Gravel'
    },
  ];
}

// ===== TRAINING PLANS (V4 DATA) =====
export function getTrainingPlans(): TrainingPlan[] {
  return [
    {
      id: 1,
      title: 'Plan Ultra-Trail 12 semaines',
      subtitle: 'Objectif : 80km+',
      schedule: '3 sorties/sem · Progressif',
      sport: 'Ultra-trail'
    },
    {
      id: 2,
      title: 'Objectif 7a en tête',
      subtitle: 'Force, technique, mental',
      schedule: '10 semaines · 3x/sem',
      sport: 'Escalade'
    },
    {
      id: 3,
      title: 'Préparer le Mont-Blanc',
      subtitle: 'Physique & altitude',
      schedule: '12 semaines · Progressif',
      sport: 'Alpinisme'
    },
    {
      id: 4,
      title: 'Progression Kite Freestyle',
      subtitle: 'Du backroll au handle pass',
      schedule: '8 semaines · 2 sessions/sem',
      sport: 'Kitesurf'
    },
    {
      id: 5,
      title: 'Apnée — Objectif 3min',
      subtitle: 'Tables CO2/O2, technique',
      schedule: '6 semaines · 4x/sem',
      sport: 'Apnée'
    },
  ];
}

// ===== NEARBY PEOPLE (V4 DATA) =====
export const NEARBY_PEOPLE: NearbyPerson[] = [
  {
    id: 'sophie-m',
    name: 'Sophie M.',
    avatar: '👩‍🦰',
    sport: 'Alpinisme',
    isLive: true
  },
  {
    id: 'lucas-v',
    name: 'Lucas V.',
    avatar: '🧑‍🦱',
    sport: 'Parapente',
    isLive: false
  },
  {
    id: 'maelle-r',
    name: 'Maëlle R.',
    avatar: '👩',
    sport: 'VTT',
    isLive: true
  },
  {
    id: 'thomas-r',
    name: 'Thomas R.',
    avatar: '🧔',
    sport: 'Trail',
    isLive: false
  },
];

export const NEARBY_COACHES: Array<{id: string; name: string; avatar: string; specialty: string; certification: string; distance: string; rating: number; reviews: number; pricePerHour: number; availability: string; availableNow: boolean}> = [
  {
    id: 'julie-d',
    name: 'Julie D.',
    avatar: '🧑‍🏫',
    specialty: 'Kitesurf',
    certification: 'IKO Level 3',
    distance: 'À 2 km',
    rating: 4.9,
    reviews: 47,
    pricePerHour: 60,
    availability: 'Lun–Dim',
    availableNow: true,
  },
  {
    id: 'pierre-l',
    name: 'Pierre L.',
    avatar: '🧑‍🏫',
    specialty: 'Parapente',
    certification: 'BEES 1er degré',
    distance: 'À 5 km',
    rating: 4.8,
    reviews: 31,
    pricePerHour: 75,
    availability: 'Mer–Dim',
    availableNow: false,
  },
  {
    id: 'sophie-m',
    name: 'Sophie M.',
    avatar: '👩‍🦰',
    specialty: 'Trail & Alpinisme',
    certification: 'BAFA + Guide de montagne',
    distance: 'À 8 km',
    rating: 5.0,
    reviews: 62,
    pricePerHour: 85,
    availability: 'Sam–Dim',
    availableNow: true,
  },
  {
    id: 'paolo-v',
    name: 'Paolo V.',
    avatar: '🤿',
    specialty: 'Apnée / Freedive',
    certification: 'AIDA Instructor',
    distance: 'À 12 km',
    rating: 4.9,
    reviews: 33,
    pricePerHour: 70,
    availability: 'Mer–Dim',
    availableNow: false,
  },
];

// ===== GEAR SUGGESTIONS (V4 DATA) =====
export const GEAR_SUGGESTIONS: GearSuggestion[] = [
  {
    id: 1,
    title: 'Hoka Speedgoat 5',
    price: '95 €',
    discount: '-35% vs neuf',
    seller: 'Lucas V.',
    sellerId: 'lucas-v',
    sport: 'Trail'
  },
  {
    id: 2,
    title: 'Sac Salomon ADV Skin 12',
    price: '65 €',
    discount: 'Comme neuf',
    seller: 'Sophie M.',
    sellerId: 'sophie-m',
    sport: 'Trail'
  },
  {
    id: 3,
    title: 'Chaussons Scarpa Drago',
    price: '70 €',
    discount: '-40%',
    seller: 'Anna K.',
    sellerId: 'anna-k',
    sport: 'Escalade'
  },
  {
    id: 4,
    title: 'Barre Duotone Trust',
    price: '180 €',
    discount: 'Bon état',
    seller: 'Pierre L.',
    sellerId: 'pierre-l',
    sport: 'Kitesurf'
  },
  {
    id: 5,
    title: 'Masque Cressi',
    price: '45 €',
    discount: '-30%',
    seller: 'Anna K.',
    sellerId: 'anna-k',
    sport: 'Plongée'
  },
];

// ===== RANKINGS (V4 DATA) =====
export const MY_RANKINGS = [
  { label: 'm D+ ce mois', value: '2 100', trend: '↑ +3', percentile: 'Top 5%' },
  { label: 'km ce mois', value: '847', trend: '↑ +2', percentile: 'Top 12%' },
  { label: 'sorties ce mois', value: '14', trend: '—', percentile: 'Top 20%' },
];

// ===== INSPIRATION POSTS (V4 DATA) =====
export const INSPIRATION_POSTS: InspirationPost[] = [
  {
    id: 1,
    user: 'Sophie M.',
    userName: 'Sophie M.',
    userId: 'sophie-m',
    avatar: '👩‍🦰',
    sport: 'Alpinisme',
    location: '📍 Mont-Blanc, Chamonix',
    time: 'Il y a 3h',
    content: 'Sommet atteint ce matin à 6h12. Lever de soleil depuis le toit des Alpes. Conditions parfaites, neige dure, pas de vent. Un moment suspendu.',
    photos: 3,
    photoCount: 3,
    likes: 47,
    comments: 12,
    shares: 5
  },
  {
    id: 2,
    user: 'Thomas R.',
    userName: 'Thomas R.',
    userId: 'thomas-r',
    avatar: '🧔',
    sport: 'Trail',
    location: '📍 Cirque de Gavarnie, Pyrénées',
    time: 'Il y a 5h',
    content: 'Première reconnaissance du parcours de l\'Ultra-Trail des Pyrénées. Le cirque de Gavarnie au lever du soleil, ça vaut tous les réveils à 4h.',
    photos: 5,
    photoCount: 5,
    likes: 34,
    comments: 8,
    shares: 3
  },
  {
    id: 3,
    user: 'Maëlle R.',
    userName: 'Maëlle R.',
    userId: 'maelle-r',
    avatar: '👩',
    sport: 'Kitesurf',
    location: '📍 Tarifa, Espagne',
    time: 'Il y a 1j',
    content: 'Session parfaite ! Levante 25 nœuds, eau turquoise, personne sur le spot. 3 heures de ride pur bonheur.',
    photos: 4,
    photoCount: 4,
    likes: 62,
    comments: 15,
    shares: 8
  },
  {
    id: 4,
    user: 'Anna K.',
    userName: 'Anna K.',
    userId: 'anna-k',
    avatar: '👱‍♀️',
    sport: 'Plongée',
    location: '📍 Porquerolles, Méditerranée',
    time: 'Il y a 2j',
    content: 'Plongée sur l\'épave du Donator. 50m de fond, visibilité cristalline. Mérous, barracudas, et un silence absolu.',
    photos: 2,
    photoCount: 2,
    likes: 29,
    comments: 6,
    shares: 2
  },
];

// ===== MARKETPLACE ITEMS (V4 DATA) =====
export const MARKET_SELL: MarketItem[] = [
  {
    id: 1,
    emoji: '👟',
    title: 'Hoka Speedgoat 5',
    price: '95€',
    originalPrice: '160€',
    brand: 'Hoka',
    condition: 'Bon état — 400km',
    seller: 'Lucas V.',
    sellerId: 'lucas-v',
    sport: 'Trail',
    type: 'sell',
    photoPlaceholder: 'from-orange-900/40 to-amber-900/20',
  },
  {
    id: 2,
    emoji: '🎒',
    title: 'Sac Salomon ADV Skin 12',
    price: '65€',
    originalPrice: '130€',
    brand: 'Salomon',
    condition: 'Comme neuf',
    seller: 'Sophie M.',
    sellerId: 'sophie-m',
    sport: 'Trail',
    type: 'sell',
    photoPlaceholder: 'from-red-900/40 to-red-800/20',
  },
  {
    id: 3,
    emoji: '🧗',
    title: 'Chaussons Scarpa Drago',
    price: '70€',
    originalPrice: '145€',
    brand: 'Scarpa',
    condition: 'Très bon état',
    seller: 'Anna K.',
    sellerId: 'anna-k',
    sport: 'Escalade',
    type: 'sell',
    photoPlaceholder: 'from-yellow-900/40 to-yellow-800/20',
  },
  {
    id: 4,
    emoji: '🪁',
    title: 'Barre Duotone Trust 2024',
    price: '180€',
    originalPrice: '450€',
    brand: 'Duotone',
    condition: 'Bon état',
    seller: 'Pierre L.',
    sellerId: 'pierre-l',
    sport: 'Kitesurf',
    type: 'sell',
    photoPlaceholder: 'from-cyan-900/40 to-blue-900/20',
  },
  {
    id: 5,
    emoji: '🤿',
    title: 'Ordinateur Suunto D5',
    price: '320€',
    originalPrice: '599€',
    brand: 'Suunto',
    condition: 'Comme neuf',
    seller: 'Anna K.',
    sellerId: 'anna-k',
    sport: 'Plongée',
    type: 'sell',
    photoPlaceholder: 'from-blue-900/40 to-indigo-900/20',
  },
  {
    id: 6,
    emoji: '🚵',
    title: 'VTT Specialized Stumpjumper',
    price: '1800€',
    originalPrice: '3500€',
    brand: 'Specialized',
    condition: '2023, révisé',
    seller: 'Lucas V.',
    sellerId: 'lucas-v',
    sport: 'VTT',
    type: 'sell',
    photoPlaceholder: 'from-green-900/40 to-emerald-900/20',
  },
  {
    id: 7,
    emoji: '🪂',
    title: 'Voile Advance Epsilon 9',
    price: '1200€',
    condition: '120h de vol',
    seller: 'Pierre L.',
    sellerId: 'pierre-l',
    sport: 'Parapente',
    type: 'sell'
  },
  {
    id: 8,
    emoji: '🏄',
    title: 'Planche surf 6\'2 DHD',
    price: '280€',
    condition: 'Quelques traces',
    seller: 'Maëlle R.',
    sellerId: 'maelle-r',
    sport: 'Surf',
    type: 'sell'
  },
  {
    id: 9,
    emoji: '🤿',
    title: 'Combinaison apnée Beuchat Mundial 5mm',
    price: '180€',
    condition: 'Très bon état — 20 sessions',
    seller: 'Anna K.',
    sellerId: 'anna-k',
    sport: 'Apnée',
    type: 'sell'
  },
  {
    id: 10,
    emoji: '🥽',
    title: 'Palmes longues C4 Falcon carbone',
    price: '220€',
    condition: 'Comme neuves',
    seller: 'Paolo V.',
    sellerId: 'paolo-v',
    sport: 'Apnée',
    type: 'sell'
  },
  {
    id: 11,
    emoji: '⌚',
    title: 'Garmin Descent Mk2i (plongée)',
    price: '650€',
    condition: 'Servie 18 mois, boîte + chargeur',
    seller: 'Anna K.',
    sellerId: 'anna-k',
    sport: 'Plongée',
    type: 'sell'
  },
  // ── Kitesurf gear ──
  {
    id: 12,
    emoji: '🪁',
    title: 'Aile Duotone Rebel 9m² 2024',
    price: '680€',
    originalPrice: '1 400€',
    brand: 'Duotone',
    condition: 'Excellent — 30 sessions',
    seller: 'Julie D.',
    sellerId: 'julie-d',
    sport: 'Kitesurf',
    type: 'sell',
    description: 'Aile polyvalente, parfaite pour le freeride et les premières vagues.',
  },
  {
    id: 13,
    emoji: '🦺',
    title: 'Harnais Mystic Majestic 2023',
    price: '95€',
    originalPrice: '230€',
    brand: 'Mystic',
    condition: 'Bon état',
    seller: 'Marco V.',
    sellerId: 'marco-v',
    sport: 'Kitesurf',
    type: 'sell',
    description: 'Harnais coque, taille M, très bon maintien lombaire.',
  },
  {
    id: 14,
    emoji: '🩱',
    title: 'Combinaison ION Seek Core 4/3mm',
    price: '120€',
    originalPrice: '280€',
    brand: 'ION',
    condition: 'Bon état — taille L',
    seller: 'Maëlle R.',
    sellerId: 'maelle-r',
    sport: 'Kitesurf',
    type: 'sell',
    description: 'Combi 4/3, idéale Atlantique printemps/automne.',
  },
  // ── Plongée / Apnée ──
  {
    id: 15,
    emoji: '🤿',
    title: 'Masque Cressi Nano (apnée)',
    price: '35€',
    originalPrice: '65€',
    brand: 'Cressi',
    condition: 'Excellent',
    seller: 'Paolo V.',
    sellerId: 'paolo-v',
    sport: 'Apnée',
    type: 'sell',
    description: 'Petit volume, verres trempés, noir mat.',
  },
  {
    id: 16,
    emoji: '💻',
    title: 'Ordinateur Shearwater Peregrine',
    price: '280€',
    originalPrice: '450€',
    brand: 'Shearwater',
    condition: 'Excellent — 40 plongées',
    seller: 'Anna K.',
    sellerId: 'anna-k',
    sport: 'Plongée',
    type: 'sell',
    description: 'Écran couleur, multi-gaz, Bluetooth. Avec bracelet silicone.',
  },
  // ── Escalade ──
  {
    id: 17,
    emoji: '👟',
    title: 'Chaussons La Sportiva Solution',
    price: '85€',
    originalPrice: '185€',
    brand: 'La Sportiva',
    condition: 'Bon état — ressemelés',
    seller: 'Marc B.',
    sellerId: 'marc-b',
    sport: 'Escalade',
    type: 'sell',
    description: 'Chaussons précision, idéal dévers et bloc. Taille 42.',
  },
  {
    id: 18,
    emoji: '🪢',
    title: 'Corde Beal Stinger 9.4mm 70m',
    price: '110€',
    originalPrice: '220€',
    brand: 'Beal',
    condition: 'Correct — 80 longueurs',
    seller: 'Thomas R.',
    sellerId: 'thomas-r',
    sport: 'Escalade',
    type: 'sell',
    description: 'Corde à simple, dry cover, marquage milieu.',
  },
  {
    id: 19,
    emoji: '🪨',
    title: 'Crashpad Moon Warrior',
    price: '140€',
    originalPrice: '260€',
    brand: 'Moon Climbing',
    condition: 'Bon état',
    seller: 'Marc B.',
    sellerId: 'marc-b',
    sport: 'Escalade',
    type: 'sell',
    description: 'Crashpad taco, 110x90cm, mousse ferme. Parfait pour Bleau.',
  },
  {
    id: 20,
    emoji: '🧲',
    title: 'Baudrier Petzl Adjama',
    price: '55€',
    originalPrice: '90€',
    brand: 'Petzl',
    condition: 'Excellent',
    seller: 'Thomas R.',
    sellerId: 'thomas-r',
    sport: 'Escalade',
    type: 'sell',
    description: 'Baudrier confort, 4 porte-matériels, taille M.',
  },
  // ── Trail ──
  {
    id: 21,
    emoji: '👟',
    title: 'Chaussures Salomon S/Lab Ultra 3',
    price: '110€',
    originalPrice: '200€',
    brand: 'Salomon',
    condition: 'Bon état — 350km',
    seller: 'Sophie M.',
    sellerId: 'sophie-m',
    sport: 'Trail',
    type: 'sell',
    description: 'Chaussures ultra-trail, drop 6mm, grip Contagrip MA.',
  },
  {
    id: 22,
    emoji: '🥢',
    title: 'Bâtons Black Diamond Distance Carbon Z',
    price: '65€',
    originalPrice: '140€',
    brand: 'Black Diamond',
    condition: 'Excellent',
    seller: 'Thomas R.',
    sellerId: 'thomas-r',
    sport: 'Trail',
    type: 'sell',
    description: 'Bâtons pliants carbone 120cm, ultra-légers (310g la paire).',
  },
  {
    id: 23,
    emoji: '🔦',
    title: 'Lampe frontale Petzl Nao RL',
    price: '75€',
    originalPrice: '150€',
    brand: 'Petzl',
    condition: 'Excellent',
    seller: 'Sophie M.',
    sellerId: 'sophie-m',
    sport: 'Trail',
    type: 'sell',
    description: '1 500 lumens, Reactive Lighting, rechargeable USB-C.',
  },
  // ── Ski de rando ──
  {
    id: 24,
    emoji: '⛷️',
    title: 'Skis Dynafit Radical 88 + peaux',
    price: '480€',
    originalPrice: '950€',
    brand: 'Dynafit',
    condition: 'Bon état — 2 saisons',
    seller: 'Lucas V.',
    sellerId: 'lucas-v',
    sport: 'Ski de rando',
    type: 'sell',
    description: '170cm, fix Dynafit Rotation 10. Peaux Pomoca incluses.',
  },
  {
    id: 25,
    emoji: '📡',
    title: 'DVA Mammut Barryvox S',
    price: '220€',
    originalPrice: '400€',
    brand: 'Mammut',
    condition: 'Excellent',
    seller: 'Sophie M.',
    sellerId: 'sophie-m',
    sport: 'Ski de rando',
    type: 'sell',
    description: 'DVA 3 antennes, portée 70m, mode groupe. Révisé 2024.',
  },
  {
    id: 26,
    emoji: '🎒',
    title: 'Sac airbag Scott Patrol E1 30L',
    price: '350€',
    originalPrice: '700€',
    brand: 'Scott',
    condition: 'Bon état',
    seller: 'Lucas V.',
    sellerId: 'lucas-v',
    sport: 'Ski de rando',
    type: 'sell',
    description: 'Airbag électronique rechargeable, 30L, porte-ski diagonal.',
  },
  // ── Parapente ──
  {
    id: 27,
    emoji: '🪂',
    title: 'Sellette Advance Lightness 3',
    price: '450€',
    originalPrice: '900€',
    brand: 'Advance',
    condition: 'Bon état — 150h',
    seller: 'Pierre L.',
    sellerId: 'pierre-l',
    sport: 'Parapente',
    type: 'sell',
    description: 'Sellette légère, airbag intégré, taille M.',
  },
  {
    id: 28,
    emoji: '🆘',
    title: 'Parachute de secours Gin Yeti UL',
    price: '380€',
    originalPrice: '650€',
    brand: 'Gin',
    condition: 'Excellent — plié 2024',
    seller: 'Lucas V.',
    sellerId: 'lucas-v',
    sport: 'Parapente',
    type: 'sell',
    description: 'Secours léger 1.3kg, dernier pliage mars 2024.',
  },
  // ── VTT ──
  {
    id: 29,
    emoji: '⛑️',
    title: 'Casque Fox Proframe RS MIPS',
    price: '95€',
    originalPrice: '250€',
    brand: 'Fox',
    condition: 'Bon état — taille L',
    seller: 'Lucas V.',
    sellerId: 'lucas-v',
    sport: 'VTT',
    type: 'sell',
    description: 'Casque intégral ouvert, MIPS, ventilation max.',
  },
  {
    id: 30,
    emoji: '🦾',
    title: 'Protections genoux/coudes Fox Enduro',
    price: '45€',
    originalPrice: '120€',
    brand: 'Fox',
    condition: 'Correct',
    seller: 'Lucas V.',
    sellerId: 'lucas-v',
    sport: 'VTT',
    type: 'sell',
    description: 'Pack genouillères + coudières D3O, taille L.',
  },
  // ── Paddle / Kayak ──
  {
    id: 31,
    emoji: '🏄',
    title: 'Paddle Starboard Touring 12\'6',
    price: '520€',
    originalPrice: '1 100€',
    brand: 'Starboard',
    condition: 'Bon état',
    seller: 'Maëlle R.',
    sellerId: 'maelle-r',
    sport: 'Paddle',
    type: 'sell',
    description: 'Planche rigide touring, idéale balade et longue distance.',
  },
  {
    id: 32,
    emoji: '🛶',
    title: 'Pagaie Werner Camano carbone',
    price: '85€',
    originalPrice: '200€',
    brand: 'Werner',
    condition: 'Excellent',
    seller: 'Maëlle R.',
    sellerId: 'maelle-r',
    sport: 'Kayak',
    type: 'sell',
    description: 'Pagaie kayak 2 pièces carbone, 220cm, légère (680g).',
  },
  {
    id: 33,
    emoji: '🦺',
    title: 'Gilet de flottaison NRS Ninja PFD',
    price: '55€',
    originalPrice: '120€',
    brand: 'NRS',
    condition: 'Bon état — taille L',
    seller: 'Thomas R.',
    sellerId: 'thomas-r',
    sport: 'Kayak',
    type: 'sell',
    description: 'Gilet bas profil, poches zippées, confort grande amplitude.',
  },
];

export const MARKET_RENT: MarketItem[] = [
  {
    id: 101,
    emoji: '🪁',
    title: 'Kite North Orbit 12m²',
    price: '35€/jour',
    condition: '2024, parfait état',
    seller: 'Julie D.',
    sellerId: 'julie-d',
    sport: 'Kitesurf',
    type: 'rent'
  },
  {
    id: 102,
    emoji: '🏄',
    title: 'Paddle gonflable Red Paddle',
    price: '20€/jour',
    condition: 'Neuf',
    seller: 'Maëlle R.',
    sellerId: 'maelle-r',
    sport: 'Paddle',
    type: 'rent'
  },
  {
    id: 103,
    emoji: '🤿',
    title: 'Équipement complet plongée',
    price: '40€/jour',
    condition: 'Révisé',
    seller: 'Anna K.',
    sellerId: 'anna-k',
    sport: 'Plongée',
    type: 'rent'
  },
  {
    id: 104,
    emoji: '🚵',
    title: 'VTT électrique Specialized',
    price: '55€/jour',
    condition: 'Batterie neuve',
    seller: 'Lucas V.',
    sellerId: 'lucas-v',
    sport: 'VTT',
    type: 'rent'
  },
  {
    id: 105,
    emoji: '⛺',
    title: 'Tente MSR Hubba Hubba',
    price: '15€/nuit',
    condition: 'Ultra-light',
    seller: 'Thomas R.',
    sellerId: 'thomas-r',
    sport: 'Trekking',
    type: 'rent'
  },
];

// ===== MAP SPOTS (V4 DATA) =====
export const MAP_SPOTS: SpotItem[] = [
  {
    id: 1,
    emoji: '🏃',
    name: 'Aiguilles Rouges',
    type: 'Trail',
    rating: 4.8,
    lat: 45.97,
    lng: 6.87,
    sport: 'Trail',
    description: 'Sentier panoramique, vue Mont-Blanc'
  },
  {
    id: 2,
    emoji: '🧗',
    name: 'Les Gaillands',
    type: 'Falaise',
    rating: 4.7,
    lat: 45.91,
    lng: 6.85,
    sport: 'Escalade',
    description: 'Falaise école, 100+ voies'
  },
  {
    id: 3,
    emoji: '🥾',
    name: 'Lac Blanc',
    type: 'Randonnée',
    rating: 4.9,
    lat: 45.98,
    lng: 6.88,
    sport: 'Randonnée',
    description: 'Vue iconique sur le massif'
  },
  {
    id: 4,
    emoji: '🏔',
    name: 'Aiguille du Midi',
    type: 'Alpinisme',
    rating: 4.9,
    lat: 45.88,
    lng: 6.89,
    sport: 'Alpinisme',
    description: 'Point de départ mythique'
  },
  {
    id: 5,
    emoji: '🪁',
    name: 'Tarifa — Los Lances',
    type: 'Spot kite',
    rating: 4.8,
    lat: 36.01,
    lng: -5.60,
    sport: 'Kitesurf',
    description: 'Levante/Poniente, spot world class',
    windSpeed: 22,
    windDirection: 'E',
    windStatus: 'Conditions idéales'
  },
  {
    id: 6,
    emoji: '🏄',
    name: 'Hossegor — La Gravière',
    type: 'Spot surf',
    rating: 4.7,
    lat: 43.66,
    lng: -1.44,
    sport: 'Surf',
    description: 'Beach break puissant',
    windSpeed: 12,
    windDirection: 'NO',
    windStatus: 'Offshore léger'
  },
  {
    id: 7,
    emoji: '🤿',
    name: 'Porquerolles — Le Donator',
    type: 'Plongée',
    rating: 4.9,
    lat: 42.99,
    lng: 6.22,
    sport: 'Plongée',
    description: 'Épave mythique, 50m'
  },
  {
    id: 8,
    emoji: '🪂',
    name: 'Planfait — Annecy',
    type: 'Parapente',
    rating: 4.8,
    lat: 45.83,
    lng: 6.17,
    sport: 'Parapente',
    description: 'Déco face au lac'
  },
  {
    id: 9,
    emoji: '🚵',
    name: 'Les Gets — Bike Park',
    type: 'VTT',
    rating: 4.6,
    lat: 46.16,
    lng: 6.67,
    sport: 'VTT',
    description: 'Bike park XL'
  },
  {
    id: 10,
    emoji: '⛷️',
    name: 'Col du Galibier',
    type: 'Ski rando',
    rating: 4.5,
    lat: 45.06,
    lng: 6.40,
    sport: 'Ski de rando',
    description: 'Itinéraire classique'
  },
  {
    id: 11,
    emoji: '🏄',
    name: 'Biarritz — Grande Plage',
    type: 'Surf',
    rating: 4.5,
    lat: 43.48,
    lng: -1.56,
    sport: 'Surf',
    description: 'Beach break emblématique',
    windSpeed: 8,
    windDirection: 'S',
    windStatus: 'Vent faible'
  },
  {
    id: 12,
    emoji: '🧗',
    name: 'Calanques — En Vau',
    type: 'Escalade',
    rating: 4.8,
    lat: 43.21,
    lng: 5.50,
    sport: 'Escalade',
    description: 'Falaise marine mythique'
  },
  {
    id: 13,
    emoji: '🏃',
    name: 'GR20 — Bavella',
    type: 'Trail',
    rating: 4.9,
    lat: 41.80,
    lng: 9.22,
    sport: 'Trail',
    description: 'Trekking Corse exceptionnel'
  },
  {
    id: 14,
    emoji: '🪁',
    name: 'Dakhla — Lassarga',
    type: 'Kite',
    rating: 4.9,
    lat: 23.75,
    lng: -15.95,
    sport: 'Kitesurf',
    description: 'Spot de légende, conditions consistency',
    windSpeed: 18,
    windDirection: 'NE',
    windStatus: 'Conditions idéales'
  },
  {
    id: 15,
    emoji: '🛶',
    name: 'Gorges du Verdon',
    type: 'Kayak',
    rating: 4.7,
    lat: 43.74,
    lng: 6.32,
    sport: 'Kayak mer',
    description: 'Canyon spectaculaire',
    windSpeed: 5,
    windDirection: 'O',
    windStatus: 'Calme'
  },
  {
    id: 16,
    emoji: '🏔',
    name: 'Mont-Blanc — Goûter',
    type: 'Alpinisme',
    rating: 4.9,
    lat: 45.83,
    lng: 6.86,
    sport: 'Alpinisme',
    description: 'Voie normale la plus populaire'
  },
  {
    id: 17,
    emoji: '🏊',
    name: 'Lac d\'Annecy',
    type: 'Nage',
    rating: 4.6,
    lat: 45.86,
    lng: 6.17,
    sport: 'Nage eau libre',
    description: 'Eau cristalline et froide'
  },
  {
    id: 18,
    emoji: '🪨',
    name: 'Fontainebleau',
    type: 'Bloc',
    rating: 4.9,
    lat: 48.40,
    lng: 2.70,
    sport: 'Bloc',
    description: 'Forêt de blocs emblématique'
  },
  {
    id: 19,
    emoji: '🌊',
    name: 'Almanarre — Hyères',
    type: 'Windsurf',
    rating: 4.5,
    lat: 43.06,
    lng: 6.15,
    sport: 'Windsurf',
    description: 'Spot français historique',
    windSpeed: 25,
    windDirection: 'NO',
    windStatus: 'Vent fort'
  },
  {
    id: 20,
    emoji: '🏞️',
    name: 'Sierra de Guara',
    type: 'Canyoning',
    rating: 4.7,
    lat: 42.25,
    lng: -0.13,
    sport: 'Canyoning',
    description: 'Canyons de rêve en Aragon'
  },
];

// ===== GPX ROUTES (V4 DATA) =====
export const GPX_ROUTES: GpxRoute[] = [
  {
    id: 1,
    name: 'Trail des Aiguilles Rouges',
    sport: 'Trail',
    distance: '14 km',
    dplus: '+980m',
    duration: '3h30',
    difficulty: 'Intermédiaire',
    region: 'Alpes',
    coordinates: [[45.97,6.87],[45.975,6.875],[45.98,6.88],[45.985,6.885],[45.99,6.89]],
    color: '#228b22'
  },
  {
    id: 2,
    name: 'Tour du Lac Blanc',
    sport: 'Randonnée',
    distance: '10.8 km',
    dplus: '+940m',
    duration: '4h',
    difficulty: 'Modéré',
    region: 'Alpes',
    coordinates: [[45.98,6.88],[45.985,6.885],[45.99,6.89],[45.985,6.895],[45.98,6.89]],
    color: '#2d6a4f'
  },
  {
    id: 3,
    name: 'GR20 Étape Bavella',
    sport: 'Trail',
    distance: '22 km',
    dplus: '+1450m',
    duration: '8h',
    difficulty: 'Difficile',
    region: 'Corse',
    coordinates: [[41.80,9.22],[41.81,9.23],[41.82,9.24],[41.83,9.235],[41.84,9.24]],
    color: '#f97316'
  },
  {
    id: 4,
    name: 'Mont-Blanc par le Goûter',
    sport: 'Alpinisme',
    distance: '16 km',
    dplus: '+2800m',
    duration: '2 jours',
    difficulty: 'Expert',
    region: 'Alpes',
    coordinates: [[45.83,6.86],[45.84,6.865],[45.85,6.87],[45.86,6.865],[45.83,6.86]],
    color: '#7c3aed'
  },
  {
    id: 5,
    name: 'Col du Galibier à ski',
    sport: 'Ski de rando',
    distance: '12 km',
    dplus: '+1100m',
    duration: '5h',
    difficulty: 'Confirmé',
    region: 'Alpes',
    coordinates: [[45.06,6.40],[45.065,6.405],[45.07,6.41],[45.065,6.415],[45.06,6.41]],
    color: '#06b6d4'
  },
  {
    id: 6,
    name: 'Gorges du Verdon en kayak',
    sport: 'Kayak mer',
    distance: '24 km',
    dplus: '0m',
    duration: '6h',
    difficulty: 'Intermédiaire',
    region: 'Provence',
    coordinates: [[43.74,6.32],[43.75,6.33],[43.76,6.34],[43.77,6.35],[43.78,6.36]],
    color: '#0077B6'
  },
  {
    id: 7,
    name: 'Tarifa — Valdevaqueros (Levante)',
    sport: 'Kitesurf',
    distance: '6 km de plage',
    dplus: '0m',
    duration: 'session',
    difficulty: 'Intermédiaire',
    region: 'Andalousie',
    coordinates: [[36.071,-5.70],[36.073,-5.705],[36.076,-5.71],[36.079,-5.715],[36.08,-5.72]],
    color: '#0077B6'
  },
  {
    id: 8,
    name: 'Tarifa — Los Lances (débutants)',
    sport: 'Kitesurf',
    distance: '3 km de plage',
    dplus: '0m',
    duration: 'session',
    difficulty: 'Débutant',
    region: 'Andalousie',
    coordinates: [[36.012,-5.606],[36.015,-5.610],[36.018,-5.614],[36.020,-5.620]],
    color: '#00B4D8'
  },
  {
    id: 9,
    name: 'Calanques de Cassis — Parcours apnée',
    sport: 'Apnée',
    distance: '1.5 km',
    dplus: '-25m',
    duration: '2h',
    difficulty: 'Confirmé',
    region: 'Méditerranée',
    coordinates: [[43.205,5.539],[43.207,5.542],[43.209,5.545],[43.211,5.548]],
    color: '#023E8A'
  },
  {
    id: 10,
    name: 'Île de Porquerolles — Snorkel',
    sport: 'Snorkeling',
    distance: '2 km',
    dplus: '0m',
    duration: '1h30',
    difficulty: 'Débutant',
    region: 'Méditerranée',
    coordinates: [[43.001,6.204],[43.003,6.208],[43.005,6.211],[43.007,6.215]],
    color: '#48CAE4'
  },
  {
    id: 11,
    name: 'Épave du Donator — Plongée',
    sport: 'Plongée',
    distance: 'Site',
    dplus: '-52m',
    duration: '1 plongée',
    difficulty: 'Expert',
    region: 'Méditerranée',
    coordinates: [[43.15,6.26],[43.151,6.262],[43.152,6.263]],
    color: '#03045E'
  },
];

// ===== PROFILE STATS (V4 DATA) =====
export const PROFILE_STATS = {
  sorties: 127,
  hours: 489,
  dplus: 78500,
  km: 2340,
  sports: 5,
  altitude: 4810,
  depth: 42,
  countries: 4
};

// ===== ACTIVITY HEATMAP (V4 DATA) =====
export const ACTIVITY_HEATMAP = [3,0,1,2,0,4,1,0,2,3,1,0,0,2,3,4,1,0,2,1,0,3,2,1,4,0,1,2,3,0];

// ===== ACHIEVEMENTS (V4 DATA) =====
export function getAchievements(): Achievement[] {
  return [
    {
      id: 1,
      emoji: '🏔',
      title: 'Sommet du Mont-Blanc',
      description: '4 810m · Voie normale',
      date: 'Août 2024',
      sport: 'Alpinisme'
    },
    {
      id: 2,
      emoji: '🏃',
      title: 'UTMB Finisher',
      description: '171km · 46h12',
      date: 'Août 2024',
      sport: 'Ultra-trail'
    },
    {
      id: 3,
      emoji: '🧗',
      title: '7a en tête',
      description: 'Verdon · Escalade trad',
      date: 'Juin 2024',
      sport: 'Escalade'
    },
    {
      id: 4,
      emoji: '🪁',
      title: '100 sessions kite',
      description: 'Cap franchi à Tarifa',
      date: 'Mai 2024',
      sport: 'Kitesurf'
    },
    {
      id: 5,
      emoji: '🤿',
      title: '-42m apnée',
      description: 'Record perso · Nice',
      date: 'Avril 2024',
      sport: 'Apnée'
    },
  ];
}
