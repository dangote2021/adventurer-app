import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/strava/activities
 * Fetches recent activities from Strava using the stored access token.
 * Handles token refresh automatically.
 */
export async function GET(request: NextRequest) {
  let accessToken = request.cookies.get('strava_access_token')?.value;
  const refreshToken = request.cookies.get('strava_refresh_token')?.value;
  const expiresAt = request.cookies.get('strava_expires_at')?.value;

  if (!accessToken && !refreshToken) {
    return NextResponse.json(
      { error: 'Not connected to Strava', code: 'not_connected' },
      { status: 401 }
    );
  }

  // Check if token needs refresh
  const now = Math.floor(Date.now() / 1000);
  if (expiresAt && parseInt(expiresAt) < now + 60 && refreshToken) {
    // Token expired or about to expire — refresh it
    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Strava not configured on server' },
        { status: 500 }
      );
    }

    try {
      const refreshResponse = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!refreshResponse.ok) {
        return NextResponse.json(
          { error: 'Failed to refresh Strava token', code: 'refresh_failed' },
          { status: 401 }
        );
      }

      const refreshData = await refreshResponse.json();
      accessToken = refreshData.access_token;

      // We'll set the new cookies in the response
      const response = await fetchActivities(accessToken!);

      // Update cookies with new tokens
      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'lax' as const,
        path: '/',
      };

      response.cookies.set('strava_access_token', refreshData.access_token, {
        ...cookieOptions,
        maxAge: refreshData.expires_at - now,
      });
      response.cookies.set('strava_refresh_token', refreshData.refresh_token, {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 180,
      });
      response.cookies.set('strava_expires_at', String(refreshData.expires_at), {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 180,
      });

      return response;
    } catch (err) {
      console.error('Strava token refresh error:', err);
      return NextResponse.json(
        { error: 'Token refresh failed' },
        { status: 500 }
      );
    }
  }

  return fetchActivities(accessToken!);
}

async function fetchActivities(accessToken: string): Promise<NextResponse> {
  try {
    const params = new URLSearchParams({
      per_page: '30',
      page: '1',
    });

    const response = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?${params}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Strava token expired', code: 'token_expired' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch Strava activities' },
        { status: response.status }
      );
    }

    const activities = await response.json();

    // Map Strava activities to our format
    const mapped = activities.map((act: Record<string, unknown>) => ({
      id: `strava-${act.id}`,
      stravaId: act.id,
      name: act.name,
      sport: mapStravaType(act.sport_type as string || act.type as string),
      type: act.sport_type || act.type,
      distance: act.distance ? Math.round((act.distance as number) / 10) / 100 : 0, // km with 2 decimals
      elevation_gain: act.total_elevation_gain ? Math.round(act.total_elevation_gain as number) : 0,
      moving_time: act.moving_time as number, // seconds
      elapsed_time: act.elapsed_time as number,
      start_date: act.start_date,
      start_date_local: act.start_date_local,
      average_speed: act.average_speed, // m/s
      max_speed: act.max_speed,
      average_heartrate: act.average_heartrate,
      max_heartrate: act.max_heartrate,
      kudos_count: act.kudos_count,
      has_map: !!(act.map && (act.map as Record<string, unknown>).summary_polyline),
    }));

    return NextResponse.json({ activities: mapped });
  } catch (err) {
    console.error('Error fetching Strava activities:', err);
    return NextResponse.json(
      { error: 'Server error fetching activities' },
      { status: 500 }
    );
  }
}

/**
 * Maps Strava sport types to Adventurer sport names
 */
function mapStravaType(stravaType: string): string {
  const mapping: Record<string, string> = {
    'Run': 'Course à pied',
    'Trail Run': 'Trail',
    'TrailRun': 'Trail',
    'Ride': 'Vélo route',
    'MountainBikeRide': 'VTT',
    'GravelRide': 'Gravel',
    'Hike': 'Randonnée',
    'Walk': 'Randonnée',
    'AlpineSki': 'Ski alpin',
    'BackcountrySki': 'Ski de rando',
    'NordicSki': 'Ski de fond',
    'Snowboard': 'Snowboard freeride',
    'Snowshoe': 'Raquettes',
    'Swim': 'Nage eau libre',
    'Surf': 'Surf',
    'Windsurf': 'Windsurf',
    'Kitesurf': 'Kitesurf',
    'Kayaking': 'Kayak mer',
    'Canoeing': 'Canoë',
    'StandUpPaddling': 'Paddle',
    'Rowing': 'Kayak rivière',
    'RockClimbing': 'Escalade',
    'IceSkate': 'Escalade glace',
    'Sail': 'Voile',
    'Paraglider': 'Parapente',
    'VirtualRun': 'Course à pied',
    'VirtualRide': 'Vélo route',
    'EBikeRide': 'Vélo route',
  };

  return mapping[stravaType] || stravaType;
}
