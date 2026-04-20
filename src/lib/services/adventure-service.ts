/**
 * Adventure Service - handles activities, events, training plans, weather
 * Currently uses mock data. Will be replaced by Supabase queries.
 */

import type { AdventureToday, UpcomingEvent, TrainingPlan } from '@/types';
import {
  getAdventuresForSwipe,
  getWeatherConditions,
  getUpcomingEvents,
  getTrainingPlans,
  NEARBY_PEOPLE,
  NEARBY_COACHES,
  MY_RANKINGS,
  INSPIRATION_POSTS,
} from '@/lib/mock-data';

export const adventureService = {
  /** Get adventure suggestions based on user sports */
  async getAdventures(sports: string[]): Promise<AdventureToday[]> {
    // TODO: Replace with Supabase query + AI recommendations
    return getAdventuresForSwipe(sports);
  },

  /** Get weather conditions for user's sports */
  async getWeatherConditions(sports: string[]) {
    // TODO: Replace with weather API integration
    return getWeatherConditions(sports);
  },

  /** Get upcoming events */
  async getUpcomingEvents(): Promise<UpcomingEvent[]> {
    // TODO: Replace with Supabase query
    return getUpcomingEvents();
  },

  /** Get training plans */
  async getTrainingPlans(): Promise<TrainingPlan[]> {
    // TODO: Replace with Supabase query
    return getTrainingPlans();
  },

  /** Get nearby people */
  async getNearbyPeople() {
    // TODO: Replace with Supabase PostGIS query
    return NEARBY_PEOPLE;
  },

  /** Get nearby coaches */
  async getNearbyCoaches() {
    // TODO: Replace with Supabase query
    return NEARBY_COACHES;
  },

  /** Get rankings/leaderboards */
  async getRankings() {
    // TODO: Replace with Supabase aggregate query
    return MY_RANKINGS;
  },

  /** Get inspiration feed */
  async getInspirationFeed() {
    // TODO: Replace with Supabase query
    return INSPIRATION_POSTS;
  },

  /** Log a new activity */
  async logActivity(data: {
    sport: string;
    duration: number;
    distance?: number;
    dplus?: number;
    notes?: string;
  }): Promise<boolean> {
    // TODO: Replace with Supabase insert into activities
    console.log('Mock log activity:', data);
    return true;
  },
};
