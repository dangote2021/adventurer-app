/**
 * Team Service - handles groups/teams, memberships, events
 * Currently uses mock data. Will be replaced by Supabase queries.
 */

import type { Team } from '@/types';
import { TEAMS, getTeam } from '@/lib/mock-data';

export const teamService = {
  /** Get all teams, optionally filtered by sport */
  async getTeams(sport?: string): Promise<Team[]> {
    // TODO: Replace with Supabase query with optional filter
    if (sport) return TEAMS.filter(t => t.sport === sport);
    return TEAMS;
  },

  /** Get a single team by ID */
  async getTeam(teamId: string): Promise<Team | undefined> {
    // TODO: Replace with Supabase query
    return getTeam(teamId);
  },

  /** Search teams by name */
  async searchTeams(query: string): Promise<Team[]> {
    // TODO: Replace with Supabase full-text search
    return TEAMS.filter(t =>
      t.name.toLowerCase().includes(query.toLowerCase())
    );
  },

  /** Join a team */
  async joinTeam(teamId: string, userId: string): Promise<boolean> {
    // TODO: Replace with Supabase insert into team_members
    console.log('Mock join team:', teamId, userId);
    return true;
  },

  /** Leave a team */
  async leaveTeam(teamId: string, userId: string): Promise<boolean> {
    // TODO: Replace with Supabase delete from team_members
    console.log('Mock leave team:', teamId, userId);
    return true;
  },

  /** Create a new team */
  async createTeam(data: Partial<Team>): Promise<Team | null> {
    // TODO: Replace with Supabase insert
    console.log('Mock create team:', data);
    return null;
  },
};
