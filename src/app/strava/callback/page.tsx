'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function StravaCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connexion à Strava en cours...');

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const athleteName = searchParams.get('athlete_name');
    const athleteId = searchParams.get('athlete_id');
    const profile = searchParams.get('profile');

    if (success === 'true' && athleteId) {
      // Store connection info in localStorage for the ProfilePage to pick up
      const stravaData = {
        connected: true,
        athleteId,
        athleteName: athleteName || 'Athlète Strava',
        profilePic: profile || '',
        connectedAt: new Date().toISOString(),
      };
      localStorage.setItem('adventurer-strava', JSON.stringify(stravaData));

      setStatus('success');
      setMessage(`Connecté en tant que ${athleteName || 'Athlète Strava'} !`);

      // Redirect to profile after 2 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } else if (error) {
      setStatus('error');
      const errorMessages: Record<string, string> = {
        access_denied: 'Tu as refusé la connexion Strava. Pas de souci, tu peux réessayer quand tu veux !',
        no_code: 'Erreur de connexion — aucun code reçu de Strava.',
        not_configured: 'Strava n\'est pas encore configuré sur le serveur.',
        token_exchange: 'Erreur lors de l\'échange de token avec Strava.',
        server_error: 'Erreur serveur — réessaie dans quelques instants.',
      };
      setMessage(errorMessages[error] || 'Erreur inconnue lors de la connexion Strava.');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#0B1D0E] flex items-center justify-center p-4">
      <div className="bg-[#1a2e1a] rounded-2xl p-8 max-w-md w-full text-center space-y-6">
        {/* Strava Logo */}
        <div className="text-5xl">
          {status === 'loading' && '⏳'}
          {status === 'success' && '🎉'}
          {status === 'error' && '😕'}
        </div>

        {/* Strava brand */}
        <div className="flex items-center justify-center gap-2">
          <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#FC4C02">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
          </svg>
          <span className="text-white font-bold text-xl">Strava</span>
        </div>

        {/* Status message */}
        <p className="text-white text-lg">{message}</p>

        {status === 'success' && (
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">Redirection vers ton profil...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/api/strava/auth'}
              className="px-6 py-3 bg-[#FC4C02] text-white rounded-xl font-semibold hover:bg-[#e04400] transition"
            >
              Réessayer
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="block mx-auto text-gray-400 text-sm hover:text-white transition"
            >
              Retour à l&apos;app
            </button>
          </div>
        )}

        {status === 'loading' && (
          <div className="animate-pulse flex justify-center">
            <div className="w-8 h-8 border-2 border-[#FC4C02] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function StravaCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B1D0E] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FC4C02] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <StravaCallbackContent />
    </Suspense>
  );
}
