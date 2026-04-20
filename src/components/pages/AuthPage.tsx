'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/supabase/auth-provider';
import { useStore } from '@/lib/store';

export default function AuthPage() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const language = useStore(s => s.language);
  const isEn = language === 'en';
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signInWithEmail(email, password);
        if (error) setError(error.message);
      } else {
        const { error } = await signUpWithEmail(email, password, name);
        if (error) {
          setError(error.message);
        } else {
          setSuccess(isEn ? 'Check your inbox to confirm your signup!' : 'Vérifie ta boîte mail pour confirmer ton inscription !');
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (isEn ? 'An error occurred' : 'Une erreur est survenue'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    const { error } = await signInWithGoogle();
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1B4332] to-[#2D6A4F] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white rounded-3xl p-8 shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Adventurer"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo.svg'; }}
            className="mx-auto mb-3 w-36 h-36 object-contain drop-shadow-lg"
          />
          <p className="text-gray-500 text-sm mt-1">
            {mode === 'login'
              ? (isEn ? 'Welcome back!' : 'Content de te revoir !')
              : (isEn ? 'Join the outdoor community' : 'Rejoins la communauté outdoor')}
          </p>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-xl py-3 px-4 text-gray-700 font-medium hover:bg-gray-50 transition-colors mb-4"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continuer avec Google
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">ou</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Comment tu t'appelles ?"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none transition-all text-gray-800"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none transition-all text-gray-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none transition-all text-gray-800"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 px-4 py-3 rounded-xl text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1B4332] text-white font-bold py-3 rounded-xl hover:bg-[#2D6A4F] transition-colors disabled:opacity-50"
          >
            {loading ? '...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-500 text-sm">
          {mode === 'login' ? (
            <>
              Pas encore de compte ?{' '}
              <button onClick={() => { setMode('signup'); setError(''); }} className="text-[#2D6A4F] font-semibold">
                Inscris-toi
              </button>
            </>
          ) : (
            <>
              Déjà un compte ?{' '}
              <button onClick={() => { setMode('login'); setError(''); }} className="text-[#2D6A4F] font-semibold">
                Connecte-toi
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
