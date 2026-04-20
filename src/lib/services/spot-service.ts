/**
 * Spot Service - handles map spots, GPX routes, geographic data
 * Currently uses mock data. Will be replaced by Supabase + PostGIS.
 */

import type { SpotItem, GpxRoute } from '@/types';
import { MAP_SPOTS, GPX_ROUTES } from '@/lib/mock-data';

export const spotService = {
  /** Get all spots, optionally filtered by sport or area */
  async getSpots(filters?: { sport?: string; bounds?: { ne: [number, number]; sw: [number, number] } }): Promise<SpotItem[]> {
    // TODO: Replace with Supabase PostGIS query
    let spots = MAP_SPOTS;
    if (filters?.sport) {
      spots = spots.filter(s => s.sport === filters.sport);
    }
    return spots;
  },

  /** Get a single spot by ID */
  async getSpot(spotId: number): Promise<SpotItem | undefined> {
    // TODO: Replace with Supabase query
    return MAP_SPOTS.find(s => s.id === spotId);
  },

  /** Get GPX routes, optionally filtered by sport */
  async getRoutes(sport?: string): Promise<GpxRoute[]> {
    // TODO: Replace with Supabase query
    if (sport) return GPX_ROUTES.filter(r => r.sport === sport);
    return GPX_ROUTES;
  },

  /** Report conditions at a spot */
  async reportCondition(spotId: number, data: {
    status: string;
    comment: string;
    rating?: number;
  }): Promise<boolean> {
    // TODO: Replace with Supabase insert
    console.log('Mock report condition:', spotId, data);
    return true;
  },

  /** Add a new spot */
  async addSpot(data: Partial<SpotItem>): Promise<SpotItem | null> {
    // TODO: Replace with Supabase insert
    console.log('Mock add spot:', data);
    return null;
  },
};
