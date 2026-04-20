/**
 * Adventurer middleware
 * - Captures ?r=CODE referral codes and stores them in a 90-day cookie
 *   so we can credit the right ambassador when the visitor converts later.
 */

import { NextRequest, NextResponse } from 'next/server';

const REFERRAL_COOKIE = 'adv_referral_code';
const NINETY_DAYS_SECONDS = 60 * 60 * 24 * 90;

export function middleware(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('r');
  const res = NextResponse.next();
  if (code && /^[A-Z0-9-]{3,40}$/.test(code)) {
    res.cookies.set(REFERRAL_COOKIE, code, {
      path: '/',
      maxAge: NINETY_DAYS_SECONDS,
      sameSite: 'lax',
      httpOnly: false, // readable from client for UX feedback
    });
  }
  return res;
}

export const config = {
  matcher: [
    // Run on every page (not API, not static assets)
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json|icon-|logo|screenshots|dm-ambassadeurs.html).*)',
  ],
};
