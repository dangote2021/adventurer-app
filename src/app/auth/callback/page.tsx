'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

/**
 * /auth/callback
 *
 * Client-side OAuth callback page.
 * Relies on the Supabase client's built-in detectSessionInUrl: true
 * to automatically exchange the PKCE code for a session.
 * We just listen for the auth state change and redirect.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Listen for auth state changes — Supabase client handles code exchange automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setStatus('success');
        // Small delay for UX then redirect
        setTimeout(() => router.replace('/'), 800);
      }
    });

    // Also check if session already exists (in case onAuthStateChange already fired)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStatus('success');
        setTimeout(() => router.replace('/'), 800);
      }
    });

    // Timeout: if nothing happens in 10 seconds, show error
    const timeout = setTimeout(() => {
      setStatus((prev) => {
        if (prev === 'loading') {
          setErrorMsg('Délai dépassé. Réessayez.');
          return 'error';
        }
        return prev;
      });
    }, 10000);

    // Also try explicit code exchange as fallback
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    if (error) {
      setStatus('error');
      setErrorMsg(errorDescription || error);
    } else if (code) {
      // Try exchanging the code — if detectSessionInUrl already did it,
      // this will fail silently and we rely on onAuthStateChange above
      supabase.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
        if (exchangeError) {
          console.warn('[Auth Callback] Code exchange error (may be expected if auto-detected):', exchangeError.message);
          // Don't set error status yet — onAuthStateChange might still fire
          // Only set error if we're still in loading state after the timeout
        }
      });
    } else {
      // No code, no error — redirect home
      router.replace('/');
    }

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="text-center space-y-4 p-8">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-400">Connexion en cours...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-4xl">✅</div>
            <p className="text-white font-semibold">Connexion réussie !</p>
            <p className="text-gray-400 text-sm">Redirection...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-4xl">❌</div>
            <p className="text-white font-semibold">Erreur de connexion</p>
            <p className="text-gray-400 text-sm">{errorMsg}</p>
            <button
              onClick={() => router.replace('/')}
              className="mt-4 px-6 py-2 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 transition text-sm"
            >
              Retour à l'accueil
            </button>
          </>
        )}
      </div>
    </div>
  );
}
