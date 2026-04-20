import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/strava/callback
 * Receives the OAuth code from Strava, exchanges it for tokens,
 * then redirects to the client-side callback page with token data
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://adventurer-outdoor.vercel.app';

  // Handle user denial
  if (error) {
    return NextResponse.redirect(`${baseUrl}/strava/callback?error=access_denied`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/strava/callback?error=no_code`);
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/strava/callback?error=not_configured`);
  }

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Strava token exchange failed:', errorData);
      return NextResponse.redirect(`${baseUrl}/strava/callback?error=token_exchange`);
    }

    const tokenData = await tokenResponse.json();

    // tokenData contains: access_token, refresh_token, expires_at, athlete { id, firstname, lastname, profile }
    const { access_token, refresh_token, expires_at, athlete } = tokenData;

    // Redirect to client-side callback page with token info encoded
    // We pass minimal info via URL params and store tokens in a secure httpOnly cookie
    const callbackUrl = new URL(`${baseUrl}/strava/callback`);
    callbackUrl.searchParams.set('success', 'true');
    callbackUrl.searchParams.set('athlete_name', `${athlete.firstname} ${athlete.lastname}`);
    callbackUrl.searchParams.set('athlete_id', String(athlete.id));
    callbackUrl.searchParams.set('profile', athlete.profile_medium || athlete.profile || '');

    // Create response with redirect
    const response = NextResponse.redirect(callbackUrl.toString());

    // Store tokens in httpOnly cookies (secure, not accessible by JS)
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 180, // 6 months
    };

    response.cookies.set('strava_access_token', access_token, {
      ...cookieOptions,
      maxAge: expires_at - Math.floor(Date.now() / 1000), // Until token expires
    });
    response.cookies.set('strava_refresh_token', refresh_token, cookieOptions);
    response.cookies.set('strava_expires_at', String(expires_at), cookieOptions);
    response.cookies.set('strava_athlete_id', String(athlete.id), {
      ...cookieOptions,
      httpOnly: false, // Allow client to read athlete ID
    });

    return response;
  } catch (err) {
    console.error('Strava OAuth error:', err);
    return NextResponse.redirect(`${baseUrl}/strava/callback?error=server_error`);
  }
}
