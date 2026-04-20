import { NextResponse } from 'next/server';

/**
 * GET /api/strava/auth
 * Redirects user to Strava OAuth authorization page
 */
export async function GET() {
  const clientId = process.env.STRAVA_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: 'Strava is not configured. Set STRAVA_CLIENT_ID in environment variables.' },
      { status: 500 }
    );
  }

  // Build the callback URL dynamically based on the request
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://adventurer-outdoor.vercel.app';
  const redirectUri = `${baseUrl}/api/strava/callback`;

  const scope = 'read,activity:read_all,profile:read_all';

  const stravaAuthUrl = new URL('https://www.strava.com/oauth/authorize');
  stravaAuthUrl.searchParams.set('client_id', clientId);
  stravaAuthUrl.searchParams.set('response_type', 'code');
  stravaAuthUrl.searchParams.set('redirect_uri', redirectUri);
  stravaAuthUrl.searchParams.set('approval_prompt', 'auto');
  stravaAuthUrl.searchParams.set('scope', scope);

  return NextResponse.redirect(stravaAuthUrl.toString());
}
