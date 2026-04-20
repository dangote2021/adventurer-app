// ============================================================================
// UNIVERSE & SPORTS
// ============================================================================

export type Universe = 'TERRE' | 'MER' | 'AIR';

export interface Sport {
  name: string;
  emoji: string;
  universe: Universe;
}

// ============================================================================
// USER & PROFILE
// ============================================================================

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  location: string;
  bio: string;
  sports: string[];
  stats: {
    sorties: number;
    hours: number;
    dplus: number;
    km: number;
  };
  badges: string[];
  level: string;
  joinedDate: string;
  isOnline?: boolean;
}

// ============================================================================
// TEAMS & SOCIAL
// ============================================================================

export interface Team {
  id: string;
  name: string;
  emoji: string;
  description: string;
  sport: string;
  memberCount: number;
  members: TeamMember[];
  location: string;
  nextEvent?: string;
  isPublic: boolean;
  createdBy: string;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: 'admin' | 'member';
  joinedDate: string;
  sport: string;
}

// ============================================================================
// MESSAGING
// ============================================================================

export interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  isGroup: boolean;
  groupName?: string;
  groupEmoji?: string;
}

// ============================================================================
// ACHIEVEMENTS & GAMIFICATION
// ============================================================================

export interface Achievement {
  id: number;
  emoji: string;
  title: string;
  description: string;
  date: string;
  sport?: string;
}

// ============================================================================
// ADVENTURES & ACTIVITIES
// ============================================================================

export interface AdventureToday {
  id: number;
  emoji: string;
  title: string;
  description: string;
  temp: string;
  dplus: string;
  distance: string;
  condition: string;
  conditionLabel: string;
  ctaLabel: string;
  socialProof: string;
  sport?: string;
}

export interface UpcomingEvent {
  id: number;
  date: string;
  location: string;
  emoji: string;
  title: string;
  description: string;
  tag: string;
  price: string;
  spots?: string;
  sport?: string;
}

export interface TrainingPlan {
  id: number;
  title: string;
  subtitle: string;
  schedule: string;
  sport?: string;
}

// ============================================================================
// ROUTES & NAVIGATION
// ============================================================================

export interface GpxRoute {
  id: number;
  name: string;
  sport: string;
  distance: string;
  dplus: string;
  duration: string;
  difficulty: string;
  region: string;
  coordinates: [number, number][];
  color: string;
}

export interface SpotItem {
  id: number;
  emoji: string;
  name: string;
  type: string;
  rating: number;
  lat: number;
  lng: number;
  sport: string;
  description?: string;
  windSpeed?: number;
  windDirection?: string;
  windStatus?: string;
}

// ============================================================================
// MARKETPLACE
// ============================================================================

export interface MarketItem {
  id: number;
  emoji: string;
  title: string;
  price: string;
  originalPrice?: string;
  condition: string;
  seller: string;
  sellerId: string;
  description?: string;
  sport?: string;
  type?: 'sell' | 'rent';
  photoPlaceholder?: string; // gradient color for photo placeholder
  brand?: string;
}

export interface GearSuggestion {
  id: number;
  title: string;
  price: string;
  discount: string;
  seller: string;
  sellerId: string;
  sport?: string;
}

// ============================================================================
// NEARBY & COMMUNITY
// ============================================================================

export interface NearbyPerson {
  id: string;
  name: string;
  avatar: string;
  sport: string;
  distance?: string;
  isLive?: boolean;
}

export interface InspirationPost {
  id: number;
  user: string;
  userName: string;
  userId: string;
  avatar: string;
  sport: string;
  location: string;
  time: string;
  content: string;
  photos: number;
  photoCount: number;
  likes: number;
  comments: number;
  shares: number;
}

// ============================================================================
// LEADERBOARDS & RANKINGS
// ============================================================================

export interface RankingEntry {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  sport: string;
  score: number;
  badge?: string;
}

export interface SportLeaderboard {
  sport: string;
  entries: RankingEntry[];
  timeframe: 'week' | 'month' | 'year' | 'allTime';
}

// ============================================================================
// WEATHER & CONDITIONS
// ============================================================================

export interface WeatherCondition {
  code: string;
  label: string;
  emoji: string;
  temperature: number;
  windSpeed: number;
  humidity: number;
  uvIndex: number;
}

// ============================================================================
// PRIVACY & COMPLIANCE
// ============================================================================

export interface GDPRConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  consentDate: string;
  consentVersion: string;
}
