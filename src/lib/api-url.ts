/**
 * apiUrl — Build API URLs that work both on web (Next.js server) and
 * mobile (Capacitor static export).
 *
 * On web (Vercel) : returns the relative path as-is — the browser calls
 *   the same origin serving the page, which hits the API route directly.
 *
 * On mobile (Capacitor) : the app is a static bundle loaded from
 *   `capacitor://localhost` (iOS) or `https://localhost` (Android),
 *   so relative paths would point to the local bundle (404). We prefix
 *   with the deployed API origin so API calls reach Vercel.
 *
 * Detection :
 * - Build-time : `NEXT_PUBLIC_CAPACITOR_BUILD === 'true'` set by the
 *   `mobile:build` script alongside `CAPACITOR_BUILD=true`.
 * - Runtime fallback : `window.Capacitor?.isNativePlatform()` check
 *   (in case env var wasn't set or SSR hydration mismatch).
 */

const API_ORIGIN =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  'https://adventurer-outdoor.vercel.app';

function isMobileNative(): boolean {
  // Build-time flag set by the mobile:build npm script.
  if (process.env.NEXT_PUBLIC_CAPACITOR_BUILD === 'true') return true;

  // Runtime fallback — only in the browser.
  if (typeof window !== 'undefined') {
    // @ts-expect-error — Capacitor injects a global
    const cap = window.Capacitor;
    if (cap && typeof cap.isNativePlatform === 'function') {
      return cap.isNativePlatform();
    }
  }
  return false;
}

/**
 * Prefix a relative API path with the absolute origin when running
 * inside a Capacitor native shell. Returns the path unchanged on web.
 *
 * @example
 *   fetch(apiUrl('/api/waitlist'), { method: 'POST', ... })
 */
export function apiUrl(path: string): string {
  if (!path.startsWith('/')) {
    // Already absolute or a query string - do not touch.
    return path;
  }
  if (isMobileNative()) {
    return `${API_ORIGIN}${path}`;
  }
  return path;
}

export const API_BASE_ORIGIN = API_ORIGIN;
