/**
 * Adventurer Service Layer
 *
 * This module provides a unified API for all data operations.
 * Currently backed by mock data, designed to be swapped to Supabase.
 *
 * Usage: import { userService, teamService, ... } from '@/lib/services';
 */

export { userService } from './user-service';
export { teamService } from './team-service';
export { messageService } from './message-service';
export { adventureService } from './adventure-service';
export { spotService } from './spot-service';
export { marketService } from './market-service';
