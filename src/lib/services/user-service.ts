/**
 * User Service - handles user profiles, auth state, stats
 * Uses Supabase for auth, falls back to mock data for profiles/stats until fully migrated.
 */

import type { UserProfile } from '@/types';
import { supabase } from '@/lib/supabase/client';
import { USER_PROFILES, PROFILE_STATS, ACTIVITY_HEATMAP, getAchievements } from '@/lib/mock-data';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

export const userService = {
  // ── Auth (REAL Supabase) ──────────────────────────────────
  /** Get current authenticated user */
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email || 'Adventurer',
      avatar: '🧑‍💻',
    };
  },

  /** Sign in with email/password */
  async signInWithEmail(email: string, password: string): Promise<AuthUser | null> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return null;
    return {
      id: data.user.id,
      email: data.user.email || '',
      name: data.user.user_metadata?.name || email,
      avatar: '🧑‍💻',
    };
  },

  /** Sign in with Google OAuth */
  async signInWithGoogle(): Promise<AuthUser | null> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) return null;
    // OAuth redirects, so we won't get the user here
    return null;
  },

  /** Sign out */
  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },

  // ── Profiles (Supabase with mock fallback) ─────────────────
  /** Get a user profile by ID */
  async getProfile(userId: string): Promise<UserProfile | undefined> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error || !data) throw error;
      return {
        id: data.id,
        name: data.name,
        avatar: data.avatar || '🧑',
        location: data.location || '',
        bio: data.bio || '',
        level: data.level || 'Débutant',
        sports: [],
        stats: { sorties: 0, hours: 0, dplus: 0, km: 0 },
        badges: [],
        isOnline: data.is_online || false,
      } as UserProfile;
    } catch {
      // Fallback to mock data
      return USER_PROFILES.find(u => u.id === userId);
    }
  },

  /** Get all user profiles (for nearby, search, etc.) */
  async getProfiles(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(50);
      if (error || !data || data.length === 0) throw error;
      return data.map((p: Record<string, unknown>) => ({
        id: p.id as string,
        name: p.name as string,
        avatar: (p.avatar as string) || '🧑',
        location: (p.location as string) || '',
        bio: (p.bio as string) || '',
        level: (p.level as string) || 'Débutant',
        sports: [],
        stats: { sorties: 0, hours: 0, dplus: 0, km: 0 },
        badges: [],
        isOnline: (p.is_online as boolean) || false,
      })) as UserProfile[];
    } catch {
      return USER_PROFILES;
    }
  },

  /** Update user profile */
  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          avatar: data.avatar,
          location: data.location,
          bio: data.bio,
          level: data.level,
        })
        .eq('id', userId);
      if (error) throw error;
      return { ...data, id: userId } as UserProfile;
    } catch {
      const profile = USER_PROFILES.find(u => u.id === userId);
      if (!profile) return null;
      return { ...profile, ...data };
    }
  },

  // ── Stats & Gamification (mock for now) ─────────────────────
  async getMyStats() {
    // TODO: Replace with real Supabase aggregate query on activities
    return PROFILE_STATS;
  },

  async getActivityHeatmap(): Promise<number[]> {
    return ACTIVITY_HEATMAP;
  },

  async getAchievements() {
    return getAchievements();
  },
};
