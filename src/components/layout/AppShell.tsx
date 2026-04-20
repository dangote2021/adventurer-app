'use client';

import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/supabase/auth-provider';

import AuthPage from '@/components/layout/AuthPage';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import HomePage from '@/components/pages/HomePage';
import MapPage from '@/components/pages/MapPage';
import ExplorePage from '@/components/pages/ExplorePage';
import MessagesPage from '@/components/pages/MessagesPage';
import ProfilePage from '@/components/pages/ProfilePage';
import CoachAIPage from '@/components/pages/CoachAIPage';
import CoachHubPage from '@/components/pages/CoachHubPage';
import MarketplacePage from '@/components/pages/MarketplacePage';
import TripPlannerPage from '@/components/pages/TripPlannerPage';
import PremiumPage from '@/components/pages/PremiumPage';
import TrailDetailPage from '@/components/pages/TrailDetailPage';
import UserProfilePage from '@/components/pages/UserProfilePage';
import TeamsPage from '@/components/pages/TeamsPage';
import PrivacyPage from '@/components/pages/PrivacyPage';
import CGUPage from '@/components/pages/CGUPage';
import MyBookingsPage from '@/components/pages/MyBookingsPage';
import MyPlansPage from '@/components/pages/MyPlansPage';
import QuickMatchListPage from '@/components/pages/QuickMatchListPage';
import MarketplaceItemPage from '@/components/pages/MarketplaceItemPage';
import MarketplaceThreadPage from '@/components/pages/MarketplaceThreadPage';
import ActivityCelebration from '@/components/modals/ActivityCelebration';
import WrappedModal from '@/components/modals/WrappedModal';

import TopBar from './TopBar';
import BottomNav from './BottomNav';
import CookieBanner from './CookieBanner';
import Toast from '@/components/ui/Toast';

/**
 * AuthBridge — Syncs Supabase auth state → Zustand store.
 * When a user signs in via Supabase (email or Google), the session is detected
 * here and we call the Zustand `login()` to keep the rest of the app working.
 * This runs inside AppShell so it has access to both useAuth and useStore.
 */
function AuthBridge() {
  const { user, session, loading } = useAuth();
  const { isLoggedIn, login, logout } = useStore();

  useEffect(() => {
    if (loading) return; // Still initializing Supabase session

    if (session && user && !isLoggedIn) {
      // Supabase session exists but Zustand doesn't know yet → sync
      const name = user.user_metadata?.name || user.email?.split('@')[0] || 'Aventurier';
      const email = user.email || '';
      const method = user.app_metadata?.provider === 'google' ? 'google' : 'email';
      login(method as 'google' | 'email', name, email);
    } else if (!session && !loading && isLoggedIn) {
      // Supabase session ended but Zustand still thinks we're logged in
      // Only logout if the user wasn't logged in via guest mode
      const zustandEmail = useStore.getState().userEmail;
      if (zustandEmail !== 'guest@adventurer.app') {
        logout();
      }
    }
  }, [session, user, loading, isLoggedIn, login, logout]);

  return null;
}

// P1 fix: Delayed cookie banner — shows after 30 seconds instead of immediately
function DelayedCookieBanner() {
  const { showCookieBanner, gdprConsent } = useStore();
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (showCookieBanner && gdprConsent === null) {
      const timer = setTimeout(() => setShow(true), 30000);
      return () => clearTimeout(timer);
    }
  }, [showCookieBanner, gdprConsent]);
  if (!show) return null;
  return <CookieBanner />;
}

export default function AppShell() {
  const {
    isLoggedIn,
    hasCompletedOnboarding,
    currentPage,
    subPage,
    fontSize,
    showCookieBanner,
    gdprConsent,
    language,
    savedPlans,
    plannedChallenges,
    quickMatches,
    streakWeeks,
    monthlyProgress,
    monthlyGoal,
    monthlyGoalMonth,
    milestonesShown,
    markMilestoneShown,
    showToast,
    // Smart notifications
    lastActiveDate,
    weeklyGoal,
    weeklyProgress,
    weeklyGoalWeek,
    addNotification,
    inAppNotifications,
    updateLastActive,
    // Paywall
    activityLog,
    hasSeenPaywall,
    setSubPage,
    // Wrapped + Freezes
    lastWrappedMonth,
    triggerWrapped,
    resetMonthlyFreezes,
    checkAndAwardBadges,
  } = useStore();

  useEffect(() => {
    document.documentElement.lang = language === 'en' ? 'en' : 'fr';
  }, [language]);

  // Milestones / Félicitations dynamiques
  useEffect(() => {
    if (!isLoggedIn || !hasCompletedOnboarding) return;
    const fr = language === 'fr';

    const milestones: Array<{ id: string; condition: boolean; message: string; icon: string }> = [
      { id: 'first-plan', condition: savedPlans.length >= 1, message: fr ? 'Premier plan sauvegardé ! Tu es sur la bonne voie 🎯' : 'First plan saved! You\'re on track 🎯', icon: '🎉' },
      { id: '3-challenges', condition: plannedChallenges.length >= 3, message: fr ? '3 défis ajoutés ! Tu es un vrai aventurier 🏆' : '3 challenges added! True adventurer 🏆', icon: '🏆' },
      { id: 'first-quickmatch', condition: quickMatches.length >= 1, message: fr ? 'Premier Quick Match créé ! La communauté t\'attend 🤝' : 'First Quick Match created! Community awaits 🤝', icon: '🤝' },
      { id: 'streak-4', condition: streakWeeks >= 4, message: fr ? '4 semaines de streak ! Tu es en feu 🔥🔥' : '4-week streak! You\'re on fire 🔥🔥', icon: '🔥' },
      { id: 'monthly-goal-done', condition: new Date().toISOString().slice(0, 7) === monthlyGoalMonth && monthlyProgress >= monthlyGoal, message: fr ? 'Objectif mensuel atteint ! Champion 💪' : 'Monthly goal reached! Champion 💪', icon: '🏅' },
    ];

    for (const m of milestones) {
      if (m.condition && !milestonesShown.includes(m.id)) {
        markMilestoneShown(m.id);
        setTimeout(() => showToast(m.message, 'success', m.icon), 1500);
        break; // show only one per render
      }
    }
  }, [savedPlans.length, plannedChallenges.length, quickMatches.length, streakWeeks, monthlyProgress]);

  // Smart notifications: check on mount
  useEffect(() => {
    if (!isLoggedIn || !hasCompletedOnboarding) return;
    updateLastActive();
    const fr = language === 'fr';

    // Inactivity check (3+ days)
    const today = new Date();
    const lastActive = new Date(lastActiveDate);
    const daysSinceActive = Math.floor((today.getTime() - lastActive.getTime()) / 86400000);
    if (daysSinceActive >= 3 && !inAppNotifications.some(n => n.type === 'inactivity' && n.createdAt > new Date(Date.now() - 86400000 * 2).toISOString())) {
      addNotification({
        type: 'inactivity',
        message: fr ? `${daysSinceActive} jours sans sortie ! C'est le moment de reprendre` : `${daysSinceActive} days without activity! Time to get back out`,
        icon: '💪',
      });
    }

    // Weekly goal almost reached
    const now = new Date();
    const jan1 = new Date(now.getFullYear(), 0, 1);
    const wk = Math.ceil((((now.getTime() - jan1.getTime()) / 86400000) + jan1.getDay() + 1) / 7);
    const currentWeek = now.getFullYear() + '-W' + String(wk).padStart(2, '0');
    if (currentWeek === weeklyGoalWeek && weeklyProgress > 0 && weeklyProgress === weeklyGoal - 1) {
      if (!inAppNotifications.some(n => n.type === 'goal' && n.createdAt > new Date(Date.now() - 86400000).toISOString())) {
        addNotification({
          type: 'goal',
          message: fr ? `Plus qu'une sortie pour atteindre ton objectif hebdo !` : `Just one more outing to reach your weekly goal!`,
          icon: '🎯',
        });
      }
    }

    // Weekend suggestion (Friday/Saturday)
    const dayOfWeek = today.getDay();
    if ((dayOfWeek === 5 || dayOfWeek === 6) && !inAppNotifications.some(n => n.type === 'weather' && n.createdAt > new Date(Date.now() - 86400000).toISOString())) {
      addNotification({
        type: 'weather',
        message: fr ? 'C\'est le week-end ! Conditions favorables pour une sortie' : 'It\'s the weekend! Great conditions for an outing',
        icon: '☀️',
      });
    }
  }, [isLoggedIn, hasCompletedOnboarding]);

  // Monthly Wrapped trigger + freeze reset + badge check
  useEffect(() => {
    if (!isLoggedIn || !hasCompletedOnboarding) return;
    resetMonthlyFreezes();
    checkAndAwardBadges();
    // Check if we should show Wrapped (first day of month, haven't shown for prev month)
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthStr = prevMonth.toISOString().slice(0, 7);
    if (now.getDate() <= 7 && lastWrappedMonth !== prevMonthStr && activityLog.some(a => a.date.slice(0, 7) === prevMonthStr)) {
      setTimeout(() => triggerWrapped(), 2000);
    }
  }, [isLoggedIn, hasCompletedOnboarding]);

  // P5 fix: Paywall trigger — after 5th activity (not 1st) for better perceived value
  useEffect(() => {
    if (!isLoggedIn || !hasCompletedOnboarding) return;
    if (activityLog.length >= 5 && !hasSeenPaywall && !subPage) {
      const timer = setTimeout(() => {
        setSubPage('premium');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activityLog.length, hasSeenPaywall, isLoggedIn, hasCompletedOnboarding]);

  const renderContent = () => {
    // Public pages accessible without login (legal)
    if (!isLoggedIn && subPage === 'privacy') return <PrivacyPage />;
    if (!isLoggedIn && subPage === 'cgu') return <CGUPage />;
    if (!isLoggedIn) return <AuthPage />;
    if (!hasCompletedOnboarding) return <OnboardingScreen />;

    if (subPage) {
      if (typeof subPage === 'string') {
        switch (subPage) {
          case 'coach-ai': return <CoachAIPage />;
          case 'coach-hub': return <CoachHubPage />;
          case 'marketplace': return <MarketplacePage />;
          case 'teams': return <TeamsPage />;
          case 'privacy': return <PrivacyPage />;
          case 'cgu': return <CGUPage />;
          case 'edit-sports': return <OnboardingScreen />;
          case 'my-plans': return <MyPlansPage />;
          case 'my-bookings': return <MyBookingsPage />;
          case 'quick-match-list': return <QuickMatchListPage />;
          case 'trip-planner': return <TripPlannerPage />;
          case 'premium': return <PremiumPage />;
          default: return <HomePage />;
        }
      } else {
        switch (subPage.type) {
          case 'trail-detail': return <TrailDetailPage trailId={subPage.trailId} />;
          case 'user-profile': return <UserProfilePage userId={subPage.userId} />;
          case 'team-detail': return <TeamsPage teamId={subPage.teamId} />;
          case 'conversation': return <MessagesPage conversationId={subPage.conversationId} />;
          case 'marketplace-item': return <MarketplaceItemPage itemId={subPage.itemId} />;
          case 'marketplace-thread': return <MarketplaceThreadPage threadId={subPage.threadId} />;
          default: return <HomePage />;
        }
      }
    }

    switch (currentPage) {
      case 'home': return <HomePage />;
      case 'map': return <MapPage />;
      case 'explore': return <ExplorePage />;
      case 'messages': return <MessagesPage />;
      case 'profile': return <ProfilePage />;
      default: return <HomePage />;
    }
  };

  const baseFontSize = fontSize === 'large' ? '18px' : '16px';

  return (
    <div
      className="min-h-screen bg-[var(--bg)] text-white flex flex-col max-w-[430px] mx-auto relative"
      style={{ fontSize: baseFontSize }}
      role="application"
      aria-label="Adventurer"
    >
      <AuthBridge />
      {isLoggedIn && hasCompletedOnboarding && !subPage && <TopBar />}
      <main className="flex-1 overflow-y-auto pb-20" id="main-content" role="main">
        {renderContent()}
      </main>
      {isLoggedIn && hasCompletedOnboarding && !subPage && <BottomNav />}
      {/* P1 fix: removed WelcomeModal, OnboardingSuggestions, TutorialOverlay overlays —
           cookie banner delayed 30s, suggestions integrated into feed instead */}
      {isLoggedIn && hasCompletedOnboarding && <DelayedCookieBanner />}
      {isLoggedIn && hasCompletedOnboarding && <ActivityCelebration />}
      {isLoggedIn && hasCompletedOnboarding && <WrappedModal />}
      <Toast />
    </div>
  );
}
