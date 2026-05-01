'use client';

/**
 * Hook qui intercepte le bouton retour Android (matériel ou geste système)
 * pour naviguer dans l'historique de l'app au lieu de quitter.
 *
 * Comportement :
 * 1. Si une subPage est ouverte (trail-detail, user-profile, marketplace, etc.)
 *    → on ferme la subPage (retour à la page principale).
 * 2. Sinon si la page courante n'est pas 'home' → on revient à 'home'.
 * 3. Sinon (on est déjà sur home, sans subPage) → on minimise l'app (App.minimizeApp())
 *    au lieu de la quitter, pour ne pas perdre l'utilisateur.
 *
 * Le listener n'est branché que sur Capacitor natif (iOS/Android), pas sur le web.
 */

import { useEffect } from 'react';
import { useStore } from '@/lib/store';

export function useCapacitorBackButton() {
  const subPage = useStore((s) => s.subPage);
  const currentPage = useStore((s) => s.currentPage);
  const closeSubPage = useStore((s) => s.closeSubPage);
  const setPage = useStore((s) => s.setPage);

  useEffect(() => {
    // Ne s'active que sur Capacitor natif (Android/iOS)
    // window.Capacitor est injecté par le runtime Capacitor.
    if (typeof window === 'undefined') return;
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    if (!cap || typeof cap.isNativePlatform !== 'function' || !cap.isNativePlatform()) {
      return;
    }

    let cleanup: (() => void) | undefined;

    // Import dynamique pour éviter de charger @capacitor/app côté web
    (async () => {
      try {
        const { App } = await import('@capacitor/app');

        const handle = await App.addListener('backButton', async () => {
          // Récupère l'état le plus récent au moment du tap (pas une stale closure)
          const state = useStore.getState();

          if (state.subPage) {
            // Cas 1 : subPage ouverte → on ferme et on reste sur la page principale
            state.closeSubPage();
            return;
          }

          if (state.currentPage !== 'home') {
            // Cas 2 : pas sur home → retour home
            state.setPage('home');
            return;
          }

          // Cas 3 : sur home, plus rien à fermer → minimise au lieu de quitter
          // L'utilisateur peut rappuyer sur l'app dans son launcher pour revenir.
          try {
            await App.minimizeApp();
          } catch {
            // minimizeApp peut échouer sur iOS (où c'est interdit par Apple).
            // Sur Android ça marche. Si ça échoue, on ne fait rien — mieux que
            // de quitter l'app.
          }
        });

        cleanup = () => {
          handle.remove();
        };
      } catch {
        // @capacitor/app pas dispo (build web pur) → silencieux
      }
    })();

    return () => {
      if (cleanup) cleanup();
    };
    // Pas de deps : on lit l'état le plus récent via useStore.getState() dans le listener.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Subscribe quand même aux changements de subPage/currentPage pour que React
  // sache que ce hook a une dépendance logique sur ces valeurs (utile pour le debug).
  void subPage; void currentPage; void closeSubPage; void setPage;
}
