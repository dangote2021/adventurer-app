/**
 * Market Service - handles gear marketplace (buy, sell, rent)
 * Currently uses mock data. Will be replaced by Supabase queries.
 */

import type { MarketItem, GearSuggestion } from '@/types';
import { MARKET_SELL, MARKET_RENT, GEAR_SUGGESTIONS } from '@/lib/mock-data';

export const marketService = {
  /** Get items for sale */
  async getForSale(sport?: string): Promise<MarketItem[]> {
    // TODO: Replace with Supabase query
    if (sport) return MARKET_SELL.filter(i => i.sport === sport);
    return MARKET_SELL;
  },

  /** Get items for rent */
  async getForRent(sport?: string): Promise<MarketItem[]> {
    // TODO: Replace with Supabase query
    if (sport) return MARKET_RENT.filter(i => i.sport === sport);
    return MARKET_RENT;
  },

  /** Get gear suggestions */
  async getGearSuggestions(): Promise<GearSuggestion[]> {
    // TODO: Replace with Supabase query
    return GEAR_SUGGESTIONS;
  },

  /** List an item for sale */
  async listForSale(data: Partial<MarketItem>): Promise<MarketItem | null> {
    // TODO: Replace with Supabase insert
    console.log('Mock list for sale:', data);
    return null;
  },

  /** List an item for rent */
  async listForRent(data: Partial<MarketItem>): Promise<MarketItem | null> {
    // TODO: Replace with Supabase insert
    console.log('Mock list for rent:', data);
    return null;
  },
};
