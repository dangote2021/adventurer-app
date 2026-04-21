import { supabase } from './client';
import { apiUrl } from '@/lib/api-url';

// Types matching the database schema
export interface Spot {
  id: string;
  name: string;
  type: string;
  sport: string;
  description: string;
  emoji: string;
  rating: number;
  lat: number;
  lng: number;
  created_at: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  emoji: string;
  sport: string;
  location: string;
  date: string;
  price: number;
  spots_available: number;
  tag: string;
}

export interface Coach {
  id: string;
  display_name: string;
  bio: string;
  sports: string[];
  certifications: string[];
  languages: string[];
  base_location: string;
  hourly_rate_cents: number;
  currency: string;
  is_published: boolean;
  is_verified: boolean;
  rating_avg: number;
  review_count: number;
  session_count: number;
}

export interface MarketItem {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  emoji: string;
  price: number;
  type: 'sell' | 'rent';
  condition: string;
  sport: string;
  location: string;
  is_available: boolean;
  shipping_available: boolean;
  shipping_cost_cents: number;
  images: string[];
  created_at: string;
}

// ============ SPOTS ============

/** Get all spots, optionally filtered by sport(s) */
export async function getSpots(sports?: string[]): Promise<Spot[]> {
  let query = supabase
    .from('spots')
    .select('id, name, type, sport, description, emoji, rating, location, created_at')
    .order('rating', { ascending: false });

  if (sports && sports.length > 0) {
    query = query.in('sport', sports);
  }

  const { data, error } = await query.limit(50);
  if (error) {
    console.error('[queries] getSpots error:', error.message);
    return [];
  }

  // Parse geography point to lat/lng
  return (data || []).map(spot => {
    let lat = 0, lng = 0;
    if (spot.location) {
      // Supabase returns geography as GeoJSON or as {type, coordinates}
      try {
        const loc = typeof spot.location === 'string' ? JSON.parse(spot.location) : spot.location;
        if (loc.coordinates) {
          lng = loc.coordinates[0];
          lat = loc.coordinates[1];
        }
      } catch {
        // ignore parse errors
      }
    }
    return { ...spot, lat, lng, location: undefined } as unknown as Spot;
  });
}

/** Get spots near a location (within radius in meters) */
export async function getSpotsNear(lat: number, lng: number, radiusMeters: number = 50000, sports?: string[]): Promise<Spot[]> {
  // Uses PostGIS RPC function if available, otherwise falls back to getSpots
  const { data, error } = await supabase.rpc('spots_within_radius', {
    lat,
    lng,
    radius_meters: radiusMeters,
    sport_filter: sports || null,
  });

  if (error) {
    console.warn('[queries] spots_within_radius RPC not available, falling back to getSpots');
    return getSpots(sports);
  }

  return data || [];
}

/** Get a single spot by ID */
export async function getSpot(id: string): Promise<Spot | null> {
  const { data, error } = await supabase
    .from('spots')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Spot;
}

// ============ EVENTS ============

/** Get upcoming events, optionally filtered by sport */
export async function getEvents(sports?: string[]): Promise<EventItem[]> {
  let query = supabase
    .from('events')
    .select('id, title, description, emoji, sport, location, date, price, spots_available, tag')
    .gte('date', new Date().toISOString())
    .order('date', { ascending: true });

  if (sports && sports.length > 0) {
    query = query.in('sport', sports);
  }

  const { data, error } = await query.limit(20);
  if (error) {
    console.error('[queries] getEvents error:', error.message);
    return [];
  }
  return data || [];
}

// ============ COACHES ============

/** Get published coaches, optionally filtered by sport */
export async function getCoaches(sport?: string): Promise<Coach[]> {
  let query = supabase
    .from('coaches')
    .select('id, display_name, bio, sports, certifications, languages, base_location, hourly_rate_cents, currency, is_published, is_verified, rating_avg, review_count, session_count')
    .eq('is_published', true)
    .order('rating_avg', { ascending: false });

  if (sport) {
    query = query.contains('sports', [sport]);
  }

  const { data, error } = await query.limit(20);
  if (error) {
    console.error('[queries] getCoaches error:', error.message);
    return [];
  }
  return data || [];
}

/** Get a single coach by ID */
export async function getCoach(id: string): Promise<Coach | null> {
  const { data, error } = await supabase
    .from('coaches')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Coach;
}

// ============ MARKETPLACE ============

/** Get available market items, optionally filtered by sport */
export async function getMarketItems(sports?: string[]): Promise<MarketItem[]> {
  let query = supabase
    .from('market_items')
    .select('id, seller_id, title, description, emoji, price, type, condition, sport, location, is_available, shipping_available, shipping_cost_cents, images, created_at')
    .eq('is_available', true)
    .order('created_at', { ascending: false });

  if (sports && sports.length > 0) {
    query = query.in('sport', sports);
  }

  const { data, error } = await query.limit(30);
  if (error) {
    console.error('[queries] getMarketItems error:', error.message);
    return [];
  }
  return data || [];
}

// ============ USER PROFILE ============

/** Get user profile from profiles table */
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data;
}

/** Get user's selected sports */
export async function getUserSports(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_sports')
    .select('sport')
    .eq('user_id', userId);

  if (error) return [];
  return (data || []).map(d => d.sport);
}

/** Get user stats */
export async function getUserStats(userId: string) {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) return null;
  return data;
}

// ============ WAITLIST & AMBASSADOR ============

/** Add email to waitlist (calls the API route) */
export async function joinWaitlist(email: string, feature: string, locale: string = 'fr') {
  const res = await fetch(apiUrl('/api/waitlist'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, feature, locale }),
  });
  return res.json();
}

// ============ CHALLENGES/DEFIS ============

/** Get community challenges */
export async function getChallenges(sports?: string[]) {
  // Check if challenges table exists, otherwise return from events with tag='defi'
  let query = supabase
    .from('events')
    .select('*')
    .eq('tag', 'Défi')
    .gte('date', new Date().toISOString())
    .order('date', { ascending: true });

  if (sports && sports.length > 0) {
    query = query.in('sport', sports);
  }

  const { data, error } = await query.limit(10);
  if (error) return [];
  return data || [];
}
