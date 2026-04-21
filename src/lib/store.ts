'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GDPRConsent } from '@/types';
import { SPORTS } from '@/lib/sports-config';
import { Language } from '@/lib/i18n';

export type Page = 'home' | 'map' | 'explore' | 'messages' | 'profile';
export type SubPage = 'coach-ai' | 'coach-hub' | 'marketplace' | 'teams' | 'privacy' | 'cgu' | 'edit-sports' | 'my-plans' | 'my-bookings' | 'quick-match-list' | 'trip-planner' | 'premium' |
  { type: 'marketplace' } |
  { type: 'rankings' } |
  { type: 'teams' } |
  { type: 'trail-detail'; trailId: string | number } |
  { type: 'user-profile'; userId: string } |
  { type: 'team-detail'; teamId: string } |
  { type: 'conversation'; conversationId: string } |
  { type: 'friendsList'; userId: string } |
  { type: 'coach-profile'; coachId: string } |
  { type: 'marketplace-item'; itemId: string } |
  { type: 'marketplace-thread'; threadId: string };

export interface SavedPlan {
  id: string;
  title: string;
  sport: string;
  createdAt: string;
  weeks: Array<{ week: number; focus: string; sessions: string[] }>;
  notes?: string;
}

export interface QuickMatch {
  id: string;
  authorId: string;
  authorName: string;
  sport: string;
  spotTitle: string;
  spotId?: number;
  date: string;      // ISO
  time: string;      // HH:MM
  level: 'debutant' | 'intermediaire' | 'confirme' | 'tous';
  notes?: string;
  participants: string[];
  createdAt: string;
}

export interface SafetyCheckIn {
  id: string;
  routeTitle: string;
  sport: string;
  startAt: string;          // ISO
  expectedReturnAt: string; // ISO
  emergencyContact: string;
  emergencyPhone: string;
  status: 'active' | 'returned' | 'alert-sent';
  createdAt: string;
}

export interface CoachBooking {
  id: string;
  coachId: string;
  coachName: string;
  sport: string;
  date: string;      // ISO
  time: string;      // HH:MM
  duration: number;  // minutes
  price: number;     // EUR
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface MarketplaceMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export interface MarketplaceThread {
  id: string;
  itemId: string;
  itemTitle: string;
  itemPrice: number;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  messages: MarketplaceMessage[];
  createdAt: string;
}

export interface UserChallenge {
  id: string;
  authorName: string;
  title: string;
  sport: string;
  distance?: string;
  date: string;       // ISO date "2026-11-28"
  location?: string;
  description?: string;
  emoji: string;
  participants: string[];  // user names who joined
  createdAt: string;
}

export interface RouteReport {
  id: string;
  routeId: number;
  routeTitle: string;
  authorName: string;
  conditions: string;   // e.g. "Sec, rimaye franchissable"
  rating: 'idéal' | 'correct' | 'difficile' | 'déconseillé';
  text: string;
  date: string;         // ISO date of the outing
  createdAt: string;
}

interface ToastData {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  icon?: string;
}

type FriendStatus = 'none' | 'pending-sent' | 'pending-received' | 'accepted';

interface AppState {
  isLoggedIn: boolean;
  authMethod: 'google' | 'email' | null;
  userName: string;
  userEmail: string;
  userAvatar: string;
  userBio: string;
  hasCompletedOnboarding: boolean;
  selectedSports: string[];
  sportLevels: Record<string, 'debutant' | 'intermediaire' | 'confirme'>;
  currentPage: Page;
  subPage: SubPage | null;
  gdprConsent: GDPRConsent | null;
  showCookieBanner: boolean;
  toast: ToastData | null;
  fontSize: 'normal' | 'large';
  theme: 'dark' | 'light';
  language: Language;
  activityLog: Array<{ id: string; sport: string; date: string; title: string; distance?: string; dplus?: string; duration?: string }>;
  spotGoers: Record<number, string[]>;
  friends: Record<string, FriendStatus>;
  userLat: number | null;
  userLng: number | null;
  geoPermission: 'granted' | 'denied' | 'prompt' | null;
  dismissedAdventures: (string | number)[];
  dismissedEvents: (string | number)[];
  plannedAdventures: (string | number)[];
  plannedChallenges: (string | number)[];
  joinedTeams: string[];
  hasSeenWelcome: boolean;
  hasSeenTutorial: boolean;
  savedPlans: SavedPlan[];
  quickMatches: QuickMatch[];
  safetyCheckIns: SafetyCheckIn[];
  coachBookings: CoachBooking[];
  marketplaceThreads: MarketplaceThread[];
  routeReports: RouteReport[];

  // Retention features
  streakWeeks: number;
  lastActiveWeek: string; // ISO week "2026-W16"
  monthlyGoal: number;           // target number of actions this month
  monthlyProgress: number;       // current count
  monthlyGoalMonth: string;      // "2026-04"
  milestonesShown: string[];     // IDs of milestones already shown
  referralCode: string;          // user's referral code for sharing

  // Weekly goals
  weeklyGoal: number;            // target sorties this week
  weeklyProgress: number;        // current count
  weeklyGoalWeek: string;        // ISO week "2026-W16"

  // Smart notifications
  lastActiveDate: string;        // ISO date "2026-04-15"
  inAppNotifications: Array<{ id: string; type: 'inactivity' | 'goal' | 'weather' | 'streak'; message: string; icon: string; createdAt: string; read: boolean }>;

  // Paywall
  hasSeenPaywall: boolean;
  premiumInterestEmail: string;  // email if user expressed interest
  isPremium: boolean;

  // Trip planner
  tripPlans: Array<{ id: string; title: string; destination: string; days: number; sport: string; itinerary: Array<{ day: number; title: string; description: string; distance?: string; dplus?: string }>; createdAt: string }>;

  // Global level (simplified)
  globalLevel: 'debutant' | 'intermediaire' | 'confirme';

  // Post-activity
  lastActivitySummary: { id: string; sport: string; title: string; distance?: string; dplus?: string; duration?: string; date: string } | null;

  // Celebration
  showCelebration: boolean;

  // Streak Freeze
  streakFreezes: number;
  streakFreezeUsedMonth: string; // "2026-04" — tracks monthly reset

  // Badges
  earnedBadges: Array<{ id: string; name: string; icon: string; earnedAt: string; description: string }>;

  // Social Feed
  socialFeedLikes: Record<string, boolean>;

  // Mini-ligues
  leagueLevel: 'bronze' | 'silver' | 'gold' | 'diamond';
  leagueRank: number;
  leagueWeek: string;
  leagueXP: number;

  // Wrapped
  lastWrappedMonth: string;
  showWrapped: boolean;

  // Spot Check-in
  spotCheckIns: Array<{ id: string; spotId: number; spotName: string; conditions: string; emoji: string; createdAt: string; userName: string }>;

  // Premium gate
  premiumTripsUsed: number;

  // Sponsored challenges
  sponsoredChallengesJoined: string[];

  // User-created challenges (community défis)
  userChallenges: UserChallenge[];

  // Push notifications
  pushNotificationsEnabled: boolean;

  // Strava integration
  stravaConnected: boolean;
  stravaAthleteName: string;
  stravaAthleteId: string;
  stravaProfilePic: string;
  stravaActivities: Array<{
    id: string;
    stravaId: number;
    name: string;
    sport: string;
    type: string;
    distance: number;
    elevation_gain: number;
    moving_time: number;
    start_date_local: string;
    average_heartrate?: number;
    kudos_count?: number;
  }>;
  stravaLastSync: string;

  // Actions
  setUserName: (name: string) => void;
  setUserAvatar: (avatar: string) => void;
  setUserBio: (bio: string) => void;
  login: (method: 'google' | 'email', name: string, email: string) => void;
  logout: () => void;
  completeOnboarding: (sports: string[]) => void;
  toggleSport: (sport: string) => void;
  setSportLevel: (sport: string, level: 'debutant' | 'intermediaire' | 'confirme') => void;
  setPage: (page: Page) => void;
  setSubPage: (sub: SubPage | null) => void;
  closeSubPage: () => void;
  openUserProfile: (userId: string) => void;
  setGDPRConsent: (consent: GDPRConsent) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error', icon?: string) => void;
  addToast: (opts: { message: string; type?: 'success' | 'info' | 'warning' | 'error'; icon?: string }) => void;
  hideToast: () => void;
  setFontSize: (size: 'normal' | 'large') => void;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  addSpotGoer: (spotId: number, userName: string) => void;
  logActivity: (activity: { sport: string; title: string; distance?: string; dplus?: string; duration?: string }) => void;
  sendFriendRequest: (userId: string) => void;
  acceptFriend: (userId: string) => void;
  declineFriend: (userId: string) => void;
  removeFriend: (userId: string) => void;
  getFriendStatus: (userId: string) => FriendStatus;
  getFriendList: () => string[];
  setUserLocation: (lat: number, lng: number) => void;
  setGeoPermission: (perm: 'granted' | 'denied' | 'prompt') => void;
  dismissAdventure: (id: string | number) => void;
  dismissEvent: (id: string | number) => void;
  togglePlannedAdventure: (id: string | number) => void;
  togglePlannedChallenge: (id: string | number) => void;
  toggleTeamMembership: (teamId: string) => void;
  isTeamJoined: (teamId: string) => boolean;
  isAdventurePlanned: (id: string | number) => boolean;
  isChallengePlanned: (id: string | number) => boolean;
  markWelcomeSeen: () => void;
  markTutorialSeen: () => void;
  hasSport: (name: string) => boolean;
  hasUniverse: (u: string) => boolean;
  reopenSportSelector: () => void;
  // New actions
  savePlan: (plan: Omit<SavedPlan, 'id' | 'createdAt'>) => string;
  deletePlan: (id: string) => void;
  addQuickMatch: (m: Omit<QuickMatch, 'id' | 'createdAt' | 'participants'>) => string;
  joinQuickMatch: (id: string, userName: string) => void;
  removeQuickMatch: (id: string) => void;
  addSafetyCheckIn: (c: Omit<SafetyCheckIn, 'id' | 'createdAt' | 'status'>) => string;
  completeSafetyCheckIn: (id: string) => void;
  bookCoach: (b: Omit<CoachBooking, 'id' | 'createdAt' | 'status'>) => string;
  cancelBooking: (id: string) => void;
  openMarketplaceThread: (params: { itemId: string; itemTitle: string; itemPrice: number; sellerId: string; sellerName: string; buyerName: string; firstMessage: string }) => string;
  sendMarketplaceMessage: (threadId: string, senderName: string, text: string) => void;
  addRouteReport: (r: Omit<RouteReport, 'id' | 'createdAt'>) => void;
  // Retention actions
  tickStreak: () => void;
  bumpMonthlyProgress: () => void;
  setMonthlyGoal: (goal: number) => void;
  markMilestoneShown: (id: string) => void;
  isMilestoneShown: (id: string) => boolean;
  // Weekly goals
  bumpWeeklyProgress: () => void;
  setWeeklyGoal: (goal: number) => void;
  // Notifications
  addNotification: (notif: { type: 'inactivity' | 'goal' | 'weather' | 'streak'; message: string; icon: string }) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  updateLastActive: () => void;
  // Paywall
  showPaywall: () => void;
  submitPremiumInterest: (email: string) => void;
  // Trip planner
  addTripPlan: (trip: { title: string; destination: string; days: number; sport: string; itinerary: Array<{ day: number; title: string; description: string; distance?: string; dplus?: string }> }) => string;
  deleteTripPlan: (id: string) => void;
  // Level
  setGlobalLevel: (level: 'debutant' | 'intermediaire' | 'confirme') => void;
  // Post-activity
  setLastActivitySummary: (summary: { id: string; sport: string; title: string; distance?: string; dplus?: string; duration?: string; date: string } | null) => void;
  // Celebration
  dismissCelebration: () => void;
  // Streak Freeze
  useStreakFreeze: () => boolean;
  resetMonthlyFreezes: () => void;
  // Badges
  checkAndAwardBadges: () => void;
  // Social Feed
  toggleSocialLike: (postId: string) => void;
  // Mini-ligues
  getLeagueData: () => { level: string; rank: number; xp: number; week: string };
  updateLeagueXP: (xp: number) => void;
  // Wrapped
  triggerWrapped: () => void;
  dismissWrapped: () => void;
  // Spot Check-in
  addSpotCheckIn: (checkIn: { spotId: number; spotName: string; conditions: string; emoji: string }) => void;
  // Premium gate
  incrementTripsUsed: () => void;
  canUseTrip: () => boolean;
  // User-created challenges
  createUserChallenge: (challenge: Omit<UserChallenge, 'id' | 'createdAt' | 'participants'>) => string;
  joinUserChallenge: (challengeId: string, userName: string) => void;
  leaveUserChallenge: (challengeId: string, userName: string) => void;
  deleteUserChallenge: (challengeId: string) => void;

  // Sponsored challenges
  joinSponsoredChallenge: (id: string) => void;
  leaveSponsoredChallenge: (id: string) => void;
  isSponsoredChallengeJoined: (id: string) => boolean;
  setPushNotificationsEnabled: (enabled: boolean) => void;
  // Strava
  connectStrava: (data: { athleteName: string; athleteId: string; profilePic: string }) => void;
  disconnectStrava: () => void;
  setStravaActivities: (activities: AppState['stravaActivities']) => void;
  syncStrava: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      authMethod: null,
      userName: '',
      userEmail: '',
      userAvatar: '👤',
      userBio: '',
      hasCompletedOnboarding: false,
      selectedSports: [],
      sportLevels: {},
      currentPage: 'home' as Page,
      subPage: null,
      gdprConsent: null,
      showCookieBanner: true,
      toast: null,
      fontSize: 'normal' as const,
      theme: 'dark' as const,
      language: 'fr' as Language,
      activityLog: [],
      spotGoers: {},
      friends: {},
      userLat: null,
      userLng: null,
      geoPermission: null,
      dismissedAdventures: [],
      dismissedEvents: [],
      plannedAdventures: [],
      plannedChallenges: [],
      joinedTeams: [],
      hasSeenWelcome: false,
      hasSeenTutorial: false,
      savedPlans: [],
      quickMatches: [],
      safetyCheckIns: [],
      coachBookings: [],
      marketplaceThreads: [],
      routeReports: [],

      // Weekly goals
      weeklyGoal: 2,
      weeklyProgress: 0,
      weeklyGoalWeek: (() => { const now = new Date(); const jan1 = new Date(now.getFullYear(), 0, 1); const wk = Math.ceil((((now.getTime() - jan1.getTime()) / 86400000) + jan1.getDay() + 1) / 7); return now.getFullYear() + '-W' + String(wk).padStart(2, '0'); })(),
      // Smart notifications
      lastActiveDate: new Date().toISOString().slice(0, 10),
      inAppNotifications: [],
      // Paywall
      hasSeenPaywall: false,
      premiumInterestEmail: '',
      isPremium: false,
      // Trip planner
      tripPlans: [],
      // Global level
      globalLevel: 'debutant' as const,
      // Post-activity
      lastActivitySummary: null,
      // Celebration
      showCelebration: false,
      // Streak Freeze
      streakFreezes: 1,
      streakFreezeUsedMonth: '',
      // Badges
      earnedBadges: [],
      // Social Feed
      socialFeedLikes: {},
      // Mini-ligues
      leagueLevel: 'bronze' as const,
      leagueRank: 12,
      leagueWeek: (() => { const now = new Date(); const jan1 = new Date(now.getFullYear(), 0, 1); const wk = Math.ceil((((now.getTime() - jan1.getTime()) / 86400000) + jan1.getDay() + 1) / 7); return now.getFullYear() + '-W' + String(wk).padStart(2, '0'); })(),
      leagueXP: 0,
      // Wrapped
      lastWrappedMonth: '',
      showWrapped: false,
      // Spot Check-in
      spotCheckIns: [],
      // Premium gate
      premiumTripsUsed: 0,
      // Sponsored challenges
      sponsoredChallengesJoined: [],

      // User-created challenges
      userChallenges: [],

      // Push notifications
      pushNotificationsEnabled: false,

      // Strava
      stravaConnected: false,
      stravaAthleteName: '',
      stravaAthleteId: '',
      stravaProfilePic: '',
      stravaActivities: [],
      stravaLastSync: '',

      // Retention features
      streakWeeks: 1,
      lastActiveWeek: (() => { const now = new Date(); const jan1 = new Date(now.getFullYear(), 0, 1); const wk = Math.ceil((((now.getTime() - jan1.getTime()) / 86400000) + jan1.getDay() + 1) / 7); return now.getFullYear() + '-W' + String(wk).padStart(2, '0'); })(),
      monthlyGoal: 5,
      monthlyProgress: 0,
      monthlyGoalMonth: new Date().toISOString().slice(0, 7),
      milestonesShown: [],
      referralCode: '',

      setUserName: (name) => set({ userName: name }),
      setUserAvatar: (avatar) => set({ userAvatar: avatar }),
      setUserBio: (bio) => set({ userBio: bio }),
      login: (method, name, email) => {
        const existingCode = get().referralCode;
        const code = existingCode || ('ADV-' + name.slice(0, 3).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase());
        set({ isLoggedIn: true, authMethod: method, userName: name, userEmail: email, referralCode: code });
      },
      logout: () => set({ isLoggedIn: false, authMethod: null, userName: '', userEmail: '', hasCompletedOnboarding: false, selectedSports: [], currentPage: 'home', subPage: null }),
      completeOnboarding: (sports) => set({ hasCompletedOnboarding: true, selectedSports: sports }),
      toggleSport: (sport) => {
        const current = get().selectedSports;
        const updated = current.includes(sport) ? current.filter(s => s !== sport) : [...current, sport];
        set({ selectedSports: updated });
      },
      setSportLevel: (sport, level) => set({ sportLevels: { ...get().sportLevels, [sport]: level } }),
      setPage: (page) => set({ currentPage: page, subPage: null }),
      setSubPage: (sub) => set({ subPage: sub }),
      closeSubPage: () => set({ subPage: null }),
      openUserProfile: (userId) => set({ subPage: { type: 'user-profile', userId } }),
      setGDPRConsent: (consent) => set({ gdprConsent: consent, showCookieBanner: false }),
      showToast: (message, type = 'success', icon) => {
        set({ toast: { message, type, icon } });
        setTimeout(() => set({ toast: null }), 3500);
      },
      addToast: (opts) => {
        set({ toast: { message: opts.message, type: opts.type || 'success', icon: opts.icon } });
        setTimeout(() => set({ toast: null }), 3500);
      },
      hideToast: () => set({ toast: null }),
      setFontSize: (size) => set({ fontSize: size }),
      toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
      setLanguage: (lang) => set({ language: lang }),
      addSpotGoer: (spotId, userName) => {
        const current = get().spotGoers[spotId] || [];
        if (!current.includes(userName)) {
          set({ spotGoers: { ...get().spotGoers, [spotId]: [...current, userName] } });
        }
      },
      logActivity: (activity) => {
        const entry = { ...activity, id: Date.now().toString(), date: new Date().toISOString() };
        set({
          activityLog: [entry, ...get().activityLog],
          lastActivitySummary: { ...entry, ...activity },
          showCelebration: true,
        });
        get().bumpMonthlyProgress();
        get().bumpWeeklyProgress();
        get().updateLastActive();
        get().updateLeagueXP(10);
        setTimeout(() => get().checkAndAwardBadges(), 500);
      },
      sendFriendRequest: (userId) => set({ friends: { ...get().friends, [userId]: 'pending-sent' } }),
      acceptFriend: (userId) => set({ friends: { ...get().friends, [userId]: 'accepted' } }),
      declineFriend: (userId) => {
        const updated = { ...get().friends };
        delete updated[userId];
        set({ friends: updated });
      },
      removeFriend: (userId) => {
        const updated = { ...get().friends };
        delete updated[userId];
        set({ friends: updated });
      },
      getFriendStatus: (userId) => get().friends[userId] || 'none',
      getFriendList: () => Object.entries(get().friends).filter(([_, status]) => status === 'accepted').map(([id]) => id),
      setUserLocation: (lat, lng) => set({ userLat: lat, userLng: lng }),
      setGeoPermission: (perm) => set({ geoPermission: perm }),
      dismissAdventure: (id) => set({ dismissedAdventures: [...get().dismissedAdventures, id] }),
      dismissEvent: (id) => set({ dismissedEvents: [...get().dismissedEvents, id] }),
      togglePlannedAdventure: (id) => {
        const current = get().plannedAdventures;
        if (current.includes(id)) {
          set({ plannedAdventures: current.filter(a => a !== id) });
        } else {
          set({ plannedAdventures: [...current, id] });
        }
      },
      togglePlannedChallenge: (id) => {
        const current = get().plannedChallenges;
        if (current.includes(id)) {
          set({ plannedChallenges: current.filter(c => c !== id) });
        } else {
          set({ plannedChallenges: [...current, id] });
        }
      },
      toggleTeamMembership: (teamId) => {
        const current = get().joinedTeams;
        if (current.includes(teamId)) {
          set({ joinedTeams: current.filter(t => t !== teamId) });
        } else {
          set({ joinedTeams: [...current, teamId] });
        }
      },
      isTeamJoined: (teamId) => get().joinedTeams.includes(teamId),
      isAdventurePlanned: (id) => get().plannedAdventures.includes(id),
      isChallengePlanned: (id) => get().plannedChallenges.includes(id),
      markWelcomeSeen: () => set({ hasSeenWelcome: true }),
      markTutorialSeen: () => set({ hasSeenTutorial: true }),
      hasSport: (name) => get().selectedSports.includes(name),
      hasUniverse: (u) => get().selectedSports.some(s => SPORTS.find(sp => sp.name === s)?.universe === u),
      reopenSportSelector: () => set({ hasCompletedOnboarding: false }),

      savePlan: (plan) => {
        const id = 'plan-' + Date.now();
        const newPlan: SavedPlan = { ...plan, id, createdAt: new Date().toISOString() };
        set({ savedPlans: [newPlan, ...get().savedPlans] });
        get().bumpMonthlyProgress();
        return id;
      },
      deletePlan: (id) => set({ savedPlans: get().savedPlans.filter(p => p.id !== id) }),

      addQuickMatch: (m) => {
        const id = 'qm-' + Date.now();
        const newMatch: QuickMatch = { ...m, id, createdAt: new Date().toISOString(), participants: [m.authorName] };
        set({ quickMatches: [newMatch, ...get().quickMatches] });
        return id;
      },
      joinQuickMatch: (id, userName) => {
        const list = get().quickMatches.map(m => {
          if (m.id !== id) return m;
          if (m.participants.includes(userName)) return m;
          return { ...m, participants: [...m.participants, userName] };
        });
        set({ quickMatches: list });
      },
      removeQuickMatch: (id) => set({ quickMatches: get().quickMatches.filter(m => m.id !== id) }),

      addSafetyCheckIn: (c) => {
        const id = 'safe-' + Date.now();
        const entry: SafetyCheckIn = { ...c, id, createdAt: new Date().toISOString(), status: 'active' };
        set({ safetyCheckIns: [entry, ...get().safetyCheckIns] });
        return id;
      },
      completeSafetyCheckIn: (id) => {
        const list = get().safetyCheckIns.map(c => c.id === id ? { ...c, status: 'returned' as const } : c);
        set({ safetyCheckIns: list });
      },

      bookCoach: (b) => {
        const id = 'bk-' + Date.now();
        const entry: CoachBooking = { ...b, id, createdAt: new Date().toISOString(), status: 'confirmed' };
        set({ coachBookings: [entry, ...get().coachBookings] });
        return id;
      },
      cancelBooking: (id) => {
        const list = get().coachBookings.map(b => b.id === id ? { ...b, status: 'cancelled' as const } : b);
        set({ coachBookings: list });
      },

      openMarketplaceThread: ({ itemId, itemTitle, itemPrice, sellerId, sellerName, buyerName, firstMessage }) => {
        const existing = get().marketplaceThreads.find(t => t.itemId === itemId && t.buyerName === buyerName);
        if (existing) {
          // Reuse existing thread, append message
          const updated = get().marketplaceThreads.map(t => {
            if (t.id !== existing.id) return t;
            return {
              ...t,
              messages: [...t.messages, { id: 'm-' + Date.now(), senderId: 'me', senderName: buyerName, text: firstMessage, createdAt: new Date().toISOString() }],
            };
          });
          set({ marketplaceThreads: updated });
          return existing.id;
        }
        const id = 'mt-' + Date.now();
        const thread: MarketplaceThread = {
          id,
          itemId,
          itemTitle,
          itemPrice,
          sellerId,
          sellerName,
          buyerId: 'me',
          buyerName,
          messages: [{ id: 'm-' + Date.now(), senderId: 'me', senderName: buyerName, text: firstMessage, createdAt: new Date().toISOString() }],
          createdAt: new Date().toISOString(),
        };
        set({ marketplaceThreads: [thread, ...get().marketplaceThreads] });
        return id;
      },
      sendMarketplaceMessage: (threadId, senderName, text) => {
        const updated = get().marketplaceThreads.map(t => {
          if (t.id !== threadId) return t;
          return {
            ...t,
            messages: [...t.messages, { id: 'm-' + Date.now(), senderId: 'me', senderName, text, createdAt: new Date().toISOString() }],
          };
        });
        set({ marketplaceThreads: updated });
      },

      addRouteReport: (r) => {
        const entry: RouteReport = { ...r, id: 'rr-' + Date.now(), createdAt: new Date().toISOString() };
        set({ routeReports: [entry, ...get().routeReports] });
      },

      // Retention action implementations
      tickStreak: () => {
        const now = new Date();
        const jan1 = new Date(now.getFullYear(), 0, 1);
        const weekNum = Math.ceil((((now.getTime() - jan1.getTime()) / 86400000) + jan1.getDay() + 1) / 7);
        const currentWeek = now.getFullYear() + '-W' + String(weekNum).padStart(2, '0');
        const { lastActiveWeek, streakWeeks } = get();
        if (currentWeek === lastActiveWeek) return; // already ticked this week

        // Parse previous week
        const prevParts = lastActiveWeek.match(/^(\d{4})-W(\d{2})$/);
        if (prevParts) {
          const prevYear = parseInt(prevParts[1]);
          const prevWeekNum = parseInt(prevParts[2]);
          const expectedWeek = prevWeekNum + 1;
          // Simple consecutive check (same year, next week)
          if (prevYear === now.getFullYear() && weekNum === expectedWeek) {
            set({ streakWeeks: streakWeeks + 1, lastActiveWeek: currentWeek });
          } else if (prevYear === now.getFullYear() - 1 && prevWeekNum >= 52 && weekNum === 1) {
            // Year boundary
            set({ streakWeeks: streakWeeks + 1, lastActiveWeek: currentWeek });
          } else {
            // Streak broken — try freeze
            if (get().streakFreezes > 0 && streakWeeks >= 2) {
              // Auto-use freeze to save streak
              set({ streakFreezes: get().streakFreezes - 1, lastActiveWeek: currentWeek });
            } else {
              set({ streakWeeks: 1, lastActiveWeek: currentWeek });
            }
          }
        } else {
          set({ streakWeeks: 1, lastActiveWeek: currentWeek });
        }
      },

      bumpMonthlyProgress: () => {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const { monthlyGoalMonth, monthlyProgress } = get();
        if (currentMonth !== monthlyGoalMonth) {
          // New month → reset
          set({ monthlyGoalMonth: currentMonth, monthlyProgress: 1 });
        } else {
          set({ monthlyProgress: monthlyProgress + 1 });
        }
      },

      setMonthlyGoal: (goal) => set({ monthlyGoal: goal }),

      markMilestoneShown: (id) => {
        const shown = get().milestonesShown;
        if (!shown.includes(id)) {
          set({ milestonesShown: [...shown, id] });
        }
      },

      isMilestoneShown: (id) => get().milestonesShown.includes(id),

      // Weekly goals
      bumpWeeklyProgress: () => {
        const now = new Date();
        const jan1 = new Date(now.getFullYear(), 0, 1);
        const wk = Math.ceil((((now.getTime() - jan1.getTime()) / 86400000) + jan1.getDay() + 1) / 7);
        const currentWeek = now.getFullYear() + '-W' + String(wk).padStart(2, '0');
        const { weeklyGoalWeek, weeklyProgress } = get();
        if (currentWeek !== weeklyGoalWeek) {
          set({ weeklyGoalWeek: currentWeek, weeklyProgress: 1 });
        } else {
          set({ weeklyProgress: weeklyProgress + 1 });
        }
      },
      setWeeklyGoal: (goal) => set({ weeklyGoal: goal }),

      // Notifications
      addNotification: (notif) => {
        const entry = { ...notif, id: 'notif-' + Date.now(), createdAt: new Date().toISOString(), read: false };
        set({ inAppNotifications: [entry, ...get().inAppNotifications].slice(0, 20) });
      },
      markNotificationRead: (id) => {
        set({ inAppNotifications: get().inAppNotifications.map(n => n.id === id ? { ...n, read: true } : n) });
      },
      clearNotifications: () => set({ inAppNotifications: [] }),
      updateLastActive: () => set({ lastActiveDate: new Date().toISOString().slice(0, 10) }),

      // Paywall
      showPaywall: () => set({ hasSeenPaywall: true }),
      submitPremiumInterest: (email) => set({ premiumInterestEmail: email }),

      // Trip planner
      addTripPlan: (trip) => {
        const id = 'trip-' + Date.now();
        set({ tripPlans: [{ ...trip, id, createdAt: new Date().toISOString() }, ...get().tripPlans] });
        get().bumpMonthlyProgress();
        get().bumpWeeklyProgress();
        return id;
      },
      deleteTripPlan: (id) => set({ tripPlans: get().tripPlans.filter(t => t.id !== id) }),

      // Level
      setGlobalLevel: (level) => set({ globalLevel: level }),

      // Post-activity
      setLastActivitySummary: (summary) => set({ lastActivitySummary: summary }),

      // Celebration
      dismissCelebration: () => set({ showCelebration: false }),

      // Streak Freeze
      useStreakFreeze: () => {
        const { streakFreezes, streakWeeks } = get();
        if (streakFreezes <= 0) return false;
        set({ streakFreezes: streakFreezes - 1 });
        // Restore streak instead of breaking it
        return true;
      },
      resetMonthlyFreezes: () => {
        const currentMonth = new Date().toISOString().slice(0, 7);
        if (get().streakFreezeUsedMonth !== currentMonth) {
          const maxFreezes = get().isPremium ? 2 : 1;
          set({ streakFreezes: maxFreezes, streakFreezeUsedMonth: currentMonth });
        }
      },

      // Badges
      checkAndAwardBadges: () => {
        const { activityLog, earnedBadges, streakWeeks, language } = get();
        const fr = language === 'fr';
        const existing = new Set(earnedBadges.map(b => b.id));
        const newBadges: Array<{ id: string; name: string; icon: string; description: string }> = [];

        // First activity
        if (activityLog.length >= 1 && !existing.has('first-activity')) {
          newBadges.push({ id: 'first-activity', name: fr ? 'Première Aventure' : 'First Adventure', icon: '🎯', description: fr ? 'Première activité enregistrée' : 'First activity logged' });
        }
        // 10 activities
        if (activityLog.length >= 10 && !existing.has('10-activities')) {
          newBadges.push({ id: '10-activities', name: fr ? 'Aventurier Régulier' : 'Regular Adventurer', icon: '⭐', description: fr ? '10 activités enregistrées' : '10 activities logged' });
        }
        // 1000m D+ in a single activity
        if (activityLog.some(a => { const dp = a.dplus ? parseFloat(a.dplus.replace(/[^\d.]/g, '')) : 0; return dp >= 1000; }) && !existing.has('vertical-marathon')) {
          newBadges.push({ id: 'vertical-marathon', name: fr ? 'Marathonien Vertical' : 'Vertical Marathon', icon: '🏔️', description: fr ? '+1000m D+ en une sortie' : '+1000m elevation in one outing' });
        }
        // 50km+ distance in single activity
        if (activityLog.some(a => { const d = a.distance ? parseFloat(a.distance.replace(/[^\d.]/g, '')) : 0; return d >= 50; }) && !existing.has('ultra-distance')) {
          newBadges.push({ id: 'ultra-distance', name: fr ? 'Ultra-Endurant' : 'Ultra Endurance', icon: '🦁', description: fr ? '50km+ en une sortie' : '50km+ in one outing' });
        }
        // 7 days in a row (check last 7 dates)
        const uniqueDates = [...new Set(activityLog.map(a => a.date.slice(0, 10)))].sort().reverse();
        if (uniqueDates.length >= 7) {
          const last7 = uniqueDates.slice(0, 7);
          const dayMs = 86400000;
          const firstDate = new Date(last7[6]).getTime();
          const lastDate = new Date(last7[0]).getTime();
          if (lastDate - firstDate <= 6 * dayMs && !existing.has('iron-week')) {
            newBadges.push({ id: 'iron-week', name: fr ? 'Iron Week' : 'Iron Week', icon: '💎', description: fr ? 'Activité 7 jours de suite' : 'Activity 7 days in a row' });
          }
        }
        // 4 week streak
        if (streakWeeks >= 4 && !existing.has('streak-master')) {
          newBadges.push({ id: 'streak-master', name: fr ? 'Streak Master' : 'Streak Master', icon: '🔥', description: fr ? '4 semaines consécutives' : '4 consecutive weeks' });
        }
        // Night owl — activity with duration implying evening
        if (activityLog.some(a => { const h = new Date(a.date).getHours(); return h >= 21 || h < 5; }) && !existing.has('night-owl')) {
          newBadges.push({ id: 'night-owl', name: fr ? 'Aventurier Nocturne' : 'Night Adventurer', icon: '🦉', description: fr ? 'Sortie après 21h' : 'Outing after 9pm' });
        }
        // Multi-sport: 3+ different sports
        const uniqueSports = [...new Set(activityLog.map(a => a.sport))];
        if (uniqueSports.length >= 3 && !existing.has('multi-sport')) {
          newBadges.push({ id: 'multi-sport', name: fr ? 'Touche-à-tout' : 'Multi-Sport', icon: '🌈', description: fr ? '3 sports différents pratiqués' : '3 different sports practiced' });
        }
        // 50 activities
        if (activityLog.length >= 50 && !existing.has('50-activities')) {
          newBadges.push({ id: '50-activities', name: fr ? 'Légende Outdoor' : 'Outdoor Legend', icon: '👑', description: fr ? '50 activités enregistrées' : '50 activities logged' });
        }

        if (newBadges.length > 0) {
          const withDates = newBadges.map(b => ({ ...b, earnedAt: new Date().toISOString() }));
          set({ earnedBadges: [...withDates, ...earnedBadges] });
        }
      },

      // Social Feed
      toggleSocialLike: (postId) => {
        const likes = { ...get().socialFeedLikes };
        likes[postId] = !likes[postId];
        set({ socialFeedLikes: likes });
      },

      // Mini-ligues
      getLeagueData: () => {
        const { leagueLevel, leagueRank, leagueXP, leagueWeek } = get();
        return { level: leagueLevel, rank: leagueRank, xp: leagueXP, week: leagueWeek };
      },
      updateLeagueXP: (xp) => {
        const now = new Date();
        const jan1 = new Date(now.getFullYear(), 0, 1);
        const wk = Math.ceil((((now.getTime() - jan1.getTime()) / 86400000) + jan1.getDay() + 1) / 7);
        const currentWeek = now.getFullYear() + '-W' + String(wk).padStart(2, '0');
        const { leagueWeek, leagueXP, leagueRank, leagueLevel } = get();
        if (currentWeek !== leagueWeek) {
          // New week — promote/demote based on last rank
          let newLevel = leagueLevel;
          if (leagueRank <= 3 && leagueLevel !== 'diamond') {
            const levels: Array<'bronze' | 'silver' | 'gold' | 'diamond'> = ['bronze', 'silver', 'gold', 'diamond'];
            const idx = levels.indexOf(leagueLevel);
            newLevel = levels[Math.min(idx + 1, 3)];
          } else if (leagueRank > 15 && leagueLevel !== 'bronze') {
            const levels: Array<'bronze' | 'silver' | 'gold' | 'diamond'> = ['bronze', 'silver', 'gold', 'diamond'];
            const idx = levels.indexOf(leagueLevel);
            newLevel = levels[Math.max(idx - 1, 0)];
          }
          set({ leagueWeek: currentWeek, leagueXP: xp, leagueRank: 10, leagueLevel: newLevel });
        } else {
          const newXP = leagueXP + xp;
          // Simulate rank improvement (simplified)
          const newRank = Math.max(1, leagueRank - Math.floor(xp / 15));
          set({ leagueXP: newXP, leagueRank: newRank });
        }
      },

      // Wrapped
      triggerWrapped: () => set({ showWrapped: true }),
      dismissWrapped: () => {
        const prevMonth = new Date();
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        set({ showWrapped: false, lastWrappedMonth: prevMonth.toISOString().slice(0, 7) });
      },

      // Spot Check-in
      addSpotCheckIn: (checkIn) => {
        const entry = { ...checkIn, id: 'ci-' + Date.now(), createdAt: new Date().toISOString(), userName: get().userName };
        set({ spotCheckIns: [entry, ...get().spotCheckIns].slice(0, 50) });
      },

      // Premium gate
      incrementTripsUsed: () => set({ premiumTripsUsed: get().premiumTripsUsed + 1 }),
      canUseTrip: () => get().isPremium || get().premiumTripsUsed < 3,

      // User-created challenges
      createUserChallenge: (challenge) => {
        const id = `uc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const newChallenge: UserChallenge = {
          ...challenge,
          id,
          participants: [challenge.authorName],
          createdAt: new Date().toISOString(),
        };
        set({ userChallenges: [newChallenge, ...get().userChallenges] });
        return id;
      },
      joinUserChallenge: (challengeId, userName) => {
        set({
          userChallenges: get().userChallenges.map(c =>
            c.id === challengeId && !c.participants.includes(userName)
              ? { ...c, participants: [...c.participants, userName] }
              : c
          ),
        });
      },
      leaveUserChallenge: (challengeId, userName) => {
        set({
          userChallenges: get().userChallenges.map(c =>
            c.id === challengeId
              ? { ...c, participants: c.participants.filter(p => p !== userName) }
              : c
          ),
        });
      },
      deleteUserChallenge: (challengeId) => {
        set({ userChallenges: get().userChallenges.filter(c => c.id !== challengeId) });
      },

      // Sponsored challenges
      joinSponsoredChallenge: (id) => set({ sponsoredChallengesJoined: [...get().sponsoredChallengesJoined, id] }),
      leaveSponsoredChallenge: (id) => set({ sponsoredChallengesJoined: get().sponsoredChallengesJoined.filter(c => c !== id) }),
      isSponsoredChallengeJoined: (id) => get().sponsoredChallengesJoined.includes(id),
      setPushNotificationsEnabled: (enabled) => set({ pushNotificationsEnabled: enabled }),

      // Strava
      connectStrava: (data) => set({
        stravaConnected: true,
        stravaAthleteName: data.athleteName,
        stravaAthleteId: data.athleteId,
        stravaProfilePic: data.profilePic,
      }),
      disconnectStrava: () => {
        // Clear cookies by calling disconnect endpoint
        document.cookie = 'strava_access_token=; path=/; max-age=0';
        document.cookie = 'strava_refresh_token=; path=/; max-age=0';
        document.cookie = 'strava_expires_at=; path=/; max-age=0';
        document.cookie = 'strava_athlete_id=; path=/; max-age=0';
        localStorage.removeItem('adventurer-strava');
        set({
          stravaConnected: false,
          stravaAthleteName: '',
          stravaAthleteId: '',
          stravaProfilePic: '',
          stravaActivities: [],
          stravaLastSync: '',
        });
      },
      setStravaActivities: (activities) => set({
        stravaActivities: activities,
        stravaLastSync: new Date().toISOString(),
      }),
      syncStrava: () => {
        // Trigger a sync — the ProfilePage calls the API and then setStravaActivities
        // This is a no-op marker to trigger UI refresh
        set({ stravaLastSync: new Date().toISOString() });
      },
    }),
    {
      name: 'adventurer-v5-storage',
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        authMethod: state.authMethod,
        userName: state.userName,
        userEmail: state.userEmail,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        selectedSports: state.selectedSports,
        sportLevels: state.sportLevels,
        gdprConsent: state.gdprConsent,
        showCookieBanner: state.showCookieBanner,
        fontSize: state.fontSize,
        theme: state.theme,
        language: state.language,
        activityLog: state.activityLog,
        spotGoers: state.spotGoers,
        friends: state.friends,
        userLat: state.userLat,
        userLng: state.userLng,
        geoPermission: state.geoPermission,
        dismissedAdventures: state.dismissedAdventures,
        dismissedEvents: state.dismissedEvents,
        plannedAdventures: state.plannedAdventures,
        plannedChallenges: state.plannedChallenges,
        userChallenges: state.userChallenges,
        joinedTeams: state.joinedTeams,
        hasSeenWelcome: state.hasSeenWelcome,
        hasSeenTutorial: state.hasSeenTutorial,
        savedPlans: state.savedPlans,
        quickMatches: state.quickMatches,
        safetyCheckIns: state.safetyCheckIns,
        coachBookings: state.coachBookings,
        marketplaceThreads: state.marketplaceThreads,
        routeReports: state.routeReports,
        streakWeeks: state.streakWeeks,
        lastActiveWeek: state.lastActiveWeek,
        monthlyGoal: state.monthlyGoal,
        monthlyProgress: state.monthlyProgress,
        monthlyGoalMonth: state.monthlyGoalMonth,
        milestonesShown: state.milestonesShown,
        referralCode: state.referralCode,
        weeklyGoal: state.weeklyGoal,
        weeklyProgress: state.weeklyProgress,
        weeklyGoalWeek: state.weeklyGoalWeek,
        lastActiveDate: state.lastActiveDate,
        inAppNotifications: state.inAppNotifications,
        hasSeenPaywall: state.hasSeenPaywall,
        premiumInterestEmail: state.premiumInterestEmail,
        isPremium: state.isPremium,
        tripPlans: state.tripPlans,
        globalLevel: state.globalLevel,
        streakFreezes: state.streakFreezes,
        streakFreezeUsedMonth: state.streakFreezeUsedMonth,
        earnedBadges: state.earnedBadges,
        socialFeedLikes: state.socialFeedLikes,
        leagueLevel: state.leagueLevel,
        leagueRank: state.leagueRank,
        leagueWeek: state.leagueWeek,
        leagueXP: state.leagueXP,
        lastWrappedMonth: state.lastWrappedMonth,
        spotCheckIns: state.spotCheckIns,
        premiumTripsUsed: state.premiumTripsUsed,
        sponsoredChallengesJoined: state.sponsoredChallengesJoined,
        pushNotificationsEnabled: state.pushNotificationsEnabled,
        stravaConnected: state.stravaConnected,
        stravaAthleteName: state.stravaAthleteName,
        stravaAthleteId: state.stravaAthleteId,
        stravaProfilePic: state.stravaProfilePic,
        stravaActivities: state.stravaActivities,
        stravaLastSync: state.stravaLastSync,
      }),
    }
  )
);
