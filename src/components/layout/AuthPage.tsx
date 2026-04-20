'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/supabase/auth-provider';
import { t } from '@/lib/i18n';

export default function AuthPage() {
  const { login, setSubPage, language, setLanguage } = useStore();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();

  // P10: Auto-detect browser language on first load
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const autoDetected = window.localStorage.getItem('adventurer-lang-detected');
    if (autoDetected) return;
    const browserLang = navigator.language || (navigator as unknown as { userLanguage?: string }).userLanguage || 'fr';
    const lang = browserLang.startsWith('fr') ? 'fr' : 'en';
    setLanguage(lang as 'fr' | 'en');
    window.localStorage.setItem('adventurer-lang-detected', '1');
  }, []);
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [acceptGDPR, setAcceptGDPR] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      console.error('[Auth] Google OAuth error:', error.message);
      setError(language === 'fr'
        ? 'Erreur de connexion Google. Réessaie ou utilise ton email.'
        : 'Google sign-in error. Try again or use email.');
      setLoading(false);
    }
    // If no error, Supabase redirects to Google — the AuthBridge in AppShell
    // will sync the session to Zustand when the user comes back.
  };

  const handleGuestMode = () => {
    login('email', 'Explorateur', 'guest@adventurer.app');
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError(t('auth.errorFields', language));
      return;
    }
    if (mode === 'signup' && !name) {
      setError(t('auth.errorName', language));
      return;
    }
    if (mode === 'signup' && !acceptGDPR) {
      setError(t('auth.errorGdpr', language));
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setError(error.message);
        }
        // Success: AuthBridge will detect the session and sync to Zustand
      } else {
        const { error } = await signUpWithEmail(email, password, name);
        if (error) {
          setError(error.message);
        } else {
          setSuccess(
            language === 'fr'
              ? 'Inscription réussie ! Vérifie ta boîte mail pour confirmer ton compte.'
              : 'Sign up successful! Check your inbox to confirm your account.'
          );
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (language === 'fr' ? 'Une erreur est survenue' : 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col max-w-[430px] mx-auto">
      {/* Language toggle */}
      {/* P10: Language toggle — 44px min touch target (Apple HIG / Material Design) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-white/5 backdrop-blur-sm rounded-full p-1 border border-white/10">
        <button
          type="button"
          onClick={() => setLanguage('fr')}
          className={`min-w-[44px] min-h-[44px] px-4 rounded-full text-sm font-semibold transition flex items-center justify-center ${language === 'fr' ? 'bg-[var(--accent)] text-white' : 'text-gray-400'}`}
          aria-label="Français"
        >
          FR
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`min-w-[44px] min-h-[44px] px-4 rounded-full text-sm font-semibold transition flex items-center justify-center ${language === 'en' ? 'bg-[var(--accent)] text-white' : 'text-gray-400'}`}
          aria-label="English"
        >
          EN
        </button>
      </div>
      {/* Hero with logo */}
      <div className="relative pt-16 pb-6 flex flex-col items-center justify-center overflow-hidden">
        {/* Ambient glow behind logo */}
        <div className="absolute top-8 w-48 h-48 bg-green-500/15 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute top-12 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl" aria-hidden="true" />

        {/* Logo */}
        <div className="relative z-10 w-28 h-28 rounded-full overflow-hidden shadow-2xl shadow-green-900/40 ring-2 ring-white/10">
          <img
            src="/logo-icon.svg"
            alt="Adventurer"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        {/* Wordmark */}
        <h1 className="relative z-10 mt-5 text-3xl font-black tracking-[0.2em] text-white">ADVENTURER</h1>

        {/* Tagline */}
        <p className="relative z-10 text-gray-400 mt-2 text-sm tracking-wide">{t('topbar.tagline', language)}</p>
      </div>

      {/* Auth Form */}
      <div className="flex-1 px-6 py-4 space-y-5">
        {/* Mode Toggle */}
        <div className="flex bg-white/5 rounded-xl p-1" role="tablist" aria-label="Mode de connexion">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${
              mode === 'signup' ? 'bg-[var(--accent)] text-white' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => {
              setMode('signup');
              setError('');
            }}
            aria-label="Mode inscription"
          >
            {t('auth.signup', language)}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${
              mode === 'login' ? 'bg-[var(--accent)] text-white' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => {
              setMode('login');
              setError('');
            }}
            aria-label="Mode connexion"
          >
            {t('auth.login', language)}
          </button>
        </div>

        {/* Google Button */}
        <button
          type="button"
          className="w-full py-3 bg-white text-gray-900 rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-gray-100 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          onClick={handleGoogleLogin}
          aria-label="Continuer avec Google"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {t('auth.continueGoogle', language)}
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-gray-500 text-sm">
            {t('auth.or', language)}
          </span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3" noValidate>
          {mode === 'signup' && (
            <div>
              <label htmlFor="auth-name" className="block text-sm font-medium text-gray-300 mb-1">
                {t('auth.firstName', language)}
              </label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t('auth.firstNamePlaceholder', language)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition"
                aria-required="true"
              />
            </div>
          )}
          <div>
            <label htmlFor="auth-email" className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder', language)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition"
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="auth-password" className="block text-sm font-medium text-gray-300 mb-1">
              {t('auth.password', language)}
            </label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition"
              aria-required="true"
            />
          </div>

          {mode === 'signup' && (
            <div className="flex items-start gap-2 py-2">
              <input
                id="gdpr-consent"
                type="checkbox"
                checked={acceptGDPR}
                onChange={e => setAcceptGDPR(e.target.checked)}
                className="mt-1 w-4 h-4 rounded accent-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                aria-required="true"
                aria-label="J'accepte les conditions d'utilisation et la politique de confidentialité"
              />
              <label htmlFor="gdpr-consent" className="text-sm text-gray-300">
                {t('auth.acceptPrefix', language)}{' '}
                <button
                  type="button"
                  className="text-[var(--accent)] underline hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] rounded"
                  onClick={() => setSubPage('cgu')}
                  aria-label={t('auth.readCgu', language)}
                >
                  {t('auth.cgu', language)}
                </button>{' '}
                {t('auth.and', language)}{' '}
                <button
                  type="button"
                  className="text-[var(--accent)] underline hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] rounded"
                  onClick={() => setSubPage('privacy')}
                  aria-label={t('auth.readPrivacy', language)}
                >
                  {t('auth.privacy', language)}
                </button>
                . {t('auth.gdprNote', language)}
              </label>
            </div>
          )}

          {error && (
            <div
              className="p-3 bg-red-900/30 border border-red-800/50 rounded-xl text-red-300 text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="p-3 bg-green-900/30 border border-green-800/50 rounded-xl text-green-300 text-sm"
              role="status"
            >
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[var(--accent)] text-white rounded-xl font-bold hover:opacity-90 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:opacity-50"
            aria-label={mode === 'login' ? 'Se connecter à mon compte' : 'Créer mon compte'}
          >
            {loading ? '...' : mode === 'login' ? t('auth.login', language) : t('auth.signup', language)}
          </button>
        </form>

        {mode === 'login' && (
          <button
            type="button"
            className="w-full text-center text-sm text-gray-400 hover:text-[var(--accent)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] rounded"
            aria-label={t('auth.forgotPassword', language)}
          >
            {t('auth.forgotPassword', language)}
          </button>
        )}

        {/* Guest Mode */}
        <div className="flex items-center gap-3 mt-2">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-gray-500 text-sm">{t('auth.or', language)}</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>
        <button
          type="button"
          className="w-full py-3 bg-white/5 border border-white/10 text-gray-300 rounded-xl font-medium hover:bg-white/10 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          onClick={handleGuestMode}
          aria-label="Continuer en mode invité"
        >
          {t('auth.guestMode', language)}
        </button>

        {/* Footer links */}
        <div
          className="pt-4 border-t border-white/5 flex justify-center gap-4 text-sm text-gray-500"
        >
          <button
            type="button"
            className="hover:text-gray-300 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] rounded px-1"
            aria-label={t('auth.readPrivacy', language)}
            onClick={() => setSubPage('privacy')}
          >
            {t('auth.privacy', language)}
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            className="hover:text-gray-300 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] rounded px-1"
            aria-label={t('auth.readCgu', language)}
            onClick={() => setSubPage('cgu')}
          >
            {t('auth.cgu', language)}
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            className="hover:text-gray-300 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] rounded px-1"
            aria-label={t('auth.about', language)}
          >
            {t('auth.about', language)}
          </button>
        </div>
      </div>
    </div>
  );
}
