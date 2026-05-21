/**
 * Helper de partage natif.
 *
 * Sur Capacitor natif (Android), utilise @capacitor/share qui ouvre la VRAIE
 * feuille de partage du système — WhatsApp, SMS, Messenger, mail, etc.
 * Sur le web, fallback sur navigator.share (Web Share API), puis sur le
 * presse-papier si rien d'autre n'est disponible.
 *
 * navigator.share seul ne suffit pas dans une WebView Capacitor : il n'est
 * pas toujours exposé, et quand il l'est il n'ouvre pas toujours la feuille
 * native complète. @capacitor/share est la voie fiable pour viser WhatsApp.
 */

export interface ShareResult {
  method: 'native' | 'web' | 'clipboard' | 'none';
}

export async function shareContent(opts: {
  title: string;
  text: string;
  url?: string;
  /** Texte de confirmation si on tombe sur le fallback presse-papier. */
  onClipboard?: () => void;
}): Promise<ShareResult> {
  const { title, text, url } = opts;

  // 1) Capacitor natif — feuille de partage Android (WhatsApp & co)
  if (typeof window !== 'undefined') {
    const cap = (window as unknown as {
      Capacitor?: { isNativePlatform?: () => boolean };
    }).Capacitor;
    if (cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform()) {
      try {
        const { Share } = await import('@capacitor/share');
        await Share.share({
          title,
          text,
          url,
          dialogTitle: title,
        });
        return { method: 'native' };
      } catch {
        // L'utilisateur a annulé, ou le plugin n'est pas dispo → on tente le web
      }
    }
  }

  // 2) Web Share API (navigateurs mobiles modernes)
  if (typeof navigator !== 'undefined') {
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    if (typeof nav.share === 'function') {
      try {
        await nav.share({ title, text, url });
        return { method: 'web' };
      } catch {
        // annulé — on ne tombe pas sur le presse-papier dans ce cas
        return { method: 'none' };
      }
    }
  }

  // 3) Fallback presse-papier
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(url ? `${text} ${url}` : text);
      opts.onClipboard?.();
      return { method: 'clipboard' };
    } catch {
      /* rien de plus à faire */
    }
  }

  return { method: 'none' };
}
