/**
 * Notifications outdoor-smart (G5)
 *
 * Utilise l'API Notification du navigateur pour pousser des alertes
 * contextualisées : fenêtre météo favorable, BRA/risque avalanche,
 * rappel check-in, nouveau spot à proximité, défi communautaire.
 *
 * Préférences en localStorage (les push server-side arriveront via VAPID + SW).
 */

export type NotifChannel =
  | 'weatherWindow'
  | 'avalancheRisk'
  | 'checkinReminder'
  | 'nearbySpot'
  | 'friendActivity'
  | 'challenge'
  | 'gearDeal';

export interface NotifPrefs {
  enabled: boolean;
  permission: NotificationPermission | 'unsupported';
  channels: Record<NotifChannel, boolean>;
  quietHours: { start: number; end: number } | null;
  minWindKnots?: number;
  maxAvalancheRisk?: number;
}

const STORAGE_KEY = 'adventurer-notif-prefs';

const DEFAULTS: NotifPrefs = {
  enabled: false,
  permission: 'default',
  channels: {
    weatherWindow: true,
    avalancheRisk: true,
    checkinReminder: true,
    nearbySpot: false,
    friendActivity: true,
    challenge: false,
    gearDeal: false,
  },
  quietHours: { start: 22, end: 7 },
  minWindKnots: 15,
  maxAvalancheRisk: 3,
};

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function currentPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export function loadPrefs(): NotifPrefs {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS, permission: currentPermission() };
    const parsed = JSON.parse(raw) as NotifPrefs;
    return {
      ...DEFAULTS,
      ...parsed,
      channels: { ...DEFAULTS.channels, ...(parsed.channels || {}) },
      permission: currentPermission(),
    };
  } catch {
    return { ...DEFAULTS, permission: currentPermission() };
  }
}

export function savePrefs(p: NotifPrefs): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* quota */ }
}

export async function requestPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

function inQuietHours(prefs: NotifPrefs): boolean {
  if (!prefs.quietHours) return false;
  const h = new Date().getHours();
  const { start, end } = prefs.quietHours;
  if (start === end) return false;
  if (start < end) return h >= start && h < end;
  return h >= start || h < end;
}

export function notify(channel: NotifChannel, title: string, body: string, icon?: string): boolean {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;
  const prefs = loadPrefs();
  if (!prefs.enabled) return false;
  if (!prefs.channels[channel]) return false;
  if (inQuietHours(prefs)) return false;
  try {
    new Notification(title, {
      body,
      icon: icon || '/icon-192.png',
      tag: channel,
      badge: '/icon-192.png',
    });
    return true;
  } catch {
    return false;
  }
}

export const CHANNEL_LABELS: Record<NotifChannel, { icon: string; title: string; desc: string }> = {
  weatherWindow:   { icon: '🌞', title: 'Fenêtre météo',      desc: 'Créneaux favorables pour tes sports (vent, soleil, houle).' },
  avalancheRisk:   { icon: '⚠️', title: 'Risque avalanche',   desc: 'Alerte BRA sur tes zones montagne.' },
  checkinReminder: { icon: '🛡️', title: 'Rappel check-in',    desc: 'Rappel à l\'heure de retour prévue d\'un plan de sortie.' },
  nearbySpot:      { icon: '📍', title: 'Spots à proximité',  desc: 'Nouveau spot dans ton rayon habituel.' },
  friendActivity:  { icon: '👥', title: 'Activité des amis',  desc: 'Tes amis postent une sortie, relèvent un défi.' },
  challenge:       { icon: '🏆', title: 'Défis communauté',   desc: 'Défi du mois, challenges saisonniers.' },
  gearDeal:        { icon: '🏷️', title: 'Bons plans matos',   desc: 'Offres d\'occasion dans ton secteur.' },
};
