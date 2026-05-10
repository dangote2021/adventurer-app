import { Universe, Sport } from '@/types';

export const SPORTS: Sport[] = [
  // TERRE (26)
  { name: 'Randonnée', emoji: '🥾', universe: 'TERRE' },
  { name: 'Trail', emoji: '🏃', universe: 'TERRE' },
  { name: 'Ultra-trail', emoji: '🏃‍♂️', universe: 'TERRE' },
  { name: 'Alpinisme', emoji: '🏔', universe: 'TERRE' },
  { name: 'Escalade', emoji: '🧗', universe: 'TERRE' },
  { name: 'Bloc', emoji: '🪨', universe: 'TERRE' },
  { name: 'Via ferrata', emoji: '⛓️', universe: 'TERRE' },
  { name: 'VTT', emoji: '🚵', universe: 'TERRE' },
  { name: 'Vélo route', emoji: '🚴', universe: 'TERRE' },
  { name: 'Gravel', emoji: '🚴‍♂️', universe: 'TERRE' },
  { name: 'Bikepacking', emoji: '🎒', universe: 'TERRE' },
  { name: 'Ski de rando', emoji: '⛷️', universe: 'TERRE' },
  { name: 'Ski de fond', emoji: '🎿', universe: 'TERRE' },
  { name: 'Ski alpin', emoji: '⛷', universe: 'TERRE' },
  { name: 'Snowboard freeride', emoji: '🏂', universe: 'TERRE' },
  { name: 'Raquettes', emoji: '❄️', universe: 'TERRE' },
  { name: 'Course à pied', emoji: '👟', universe: 'TERRE' },
  { name: 'Canicross', emoji: '🐕', universe: 'TERRE' },
  { name: 'Canyoning', emoji: '🏞️', universe: 'TERRE' },
  { name: 'Marche nordique', emoji: '🏃‍♀️', universe: 'TERRE' },
  { name: 'Trekking', emoji: '🗻', universe: 'TERRE' },
  { name: 'Orientation', emoji: '🧭', universe: 'TERRE' },
  { name: 'Spéléologie', emoji: '🕳️', universe: 'TERRE' },
  { name: 'Rando équestre', emoji: '🐎', universe: 'TERRE' },
  { name: 'Slackline', emoji: '🤸', universe: 'TERRE' },
  { name: 'Escalade glace', emoji: '🧊', universe: 'TERRE' },

  // MER (23)
  { name: 'Kitesurf', emoji: '🪁', universe: 'MER' },
  { name: 'Surf', emoji: '🏄', universe: 'MER' },
  { name: 'Bodyboard', emoji: '🏄‍♂️', universe: 'MER' },
  { name: 'Windsurf', emoji: '🌊', universe: 'MER' },
  { name: 'Wing foil', emoji: '🦅', universe: 'MER' },
  { name: 'Plongée', emoji: '🤿', universe: 'MER' },
  { name: 'Apnée', emoji: '🫁', universe: 'MER' },
  { name: 'Snorkeling', emoji: '🐠', universe: 'MER' },
  { name: 'Kayak mer', emoji: '🛶', universe: 'MER' },
  { name: 'Kayak rivière', emoji: '🚣', universe: 'MER' },
  { name: 'Canoë', emoji: '🛶', universe: 'MER' },
  { name: 'Paddle', emoji: '🏄‍♀️', universe: 'MER' },
  { name: 'Voile', emoji: '⛵', universe: 'MER' },
  { name: 'Catamaran', emoji: '🚢', universe: 'MER' },
  { name: 'Nage eau libre', emoji: '🏊', universe: 'MER' },
  { name: 'Longe-côte', emoji: '🚶‍♂️', universe: 'MER' },
  { name: 'Pêche sportive', emoji: '🎣', universe: 'MER' },
  { name: 'Rafting', emoji: '🚣‍♂️', universe: 'MER' },
  { name: 'Hydrospeed', emoji: '💧', universe: 'MER' },
  { name: 'Wakeboard', emoji: '🏄‍♂️', universe: 'MER' },
  { name: 'Ski nautique', emoji: '🎿', universe: 'MER' },
  { name: 'Coasteering', emoji: '🏖️', universe: 'MER' },
  { name: 'Jet-ski', emoji: '🚤', universe: 'MER' },

  // AIR (10)
  { name: 'Parapente', emoji: '🪂', universe: 'AIR' },
  { name: 'Deltaplane', emoji: '🪁', universe: 'AIR' },
  { name: 'Wingsuit', emoji: '🦇', universe: 'AIR' },
  { name: 'Base jump', emoji: '🏗️', universe: 'AIR' },
  { name: 'Vol à voile', emoji: '✈️', universe: 'AIR' },
  { name: 'Speed riding', emoji: '🎿', universe: 'AIR' },
  { name: 'Speed flying', emoji: '💨', universe: 'AIR' },
  { name: 'ULM', emoji: '🛩️', universe: 'AIR' },
  { name: 'Saut en parachute', emoji: '🪂', universe: 'AIR' },
  { name: 'Tyrolienne', emoji: '🧗‍♂️', universe: 'AIR' },
];

export const UNIVERSE_CONFIG: Record<Universe, { label: string; emoji: string; gradient: string; color: string; bgColor: string }> = {
  TERRE: { label: 'Terre', emoji: '🌍', gradient: 'from-green-900 to-green-700', color: '#228b22', bgColor: 'rgba(34,139,34,0.15)' },
  MER: { label: 'Mer', emoji: '🌊', gradient: 'from-blue-900 to-blue-600', color: '#0077B6', bgColor: 'rgba(0,119,182,0.15)' },
  AIR: { label: 'Air', emoji: '🌤️', gradient: 'from-sky-800 to-orange-500', color: '#1e90ff', bgColor: 'rgba(30,144,255,0.15)' },
};

export function getSportsByUniverse(universe: Universe): Sport[] {
  return SPORTS.filter(s => s.universe === universe);
}

export function getSportEmoji(name: string): string {
  return SPORTS.find(s => s.name === name)?.emoji || '🏅';
}

export function getSportUniverse(name: string): Universe | undefined {
  return SPORTS.find(s => s.name === name)?.universe;
}
