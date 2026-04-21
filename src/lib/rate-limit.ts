/**
 * Naïf rate limiter en mémoire pour les endpoints publics sensibles au spam
 * (waitlist, ambassador apply, etc.).
 *
 * Limitations :
 *  - Mémoire locale au process serverless : partage zéro entre instances.
 *  - Contourné trivialement par un attaquant motivé qui tourne l'IP.
 *
 * Pour une vraie protection on passera sur Upstash/Redis, mais ça suffit largement
 * pour bloquer les spams de base et les bots naïfs au launch.
 */

type Bucket = { count: number; resetAt: number };

const BUCKETS: Map<string, Bucket> = new Map();

// Nettoyage opportuniste pour éviter la fuite mémoire sur les process long-running.
function sweep() {
  const now = Date.now();
  for (const [key, bucket] of BUCKETS) {
    if (bucket.resetAt < now) BUCKETS.delete(key);
  }
}

/**
 * Retourne true si la requête est autorisée, false si elle dépasse la limite.
 *
 * @param key       Clé de bucket (en général : IP + endpoint).
 * @param limit     Nombre max d'appels autorisés dans la fenêtre.
 * @param windowMs  Durée de la fenêtre en ms.
 */
export function allow(key: string, limit: number, windowMs: number): boolean {
  // 1% de chance de sweep à chaque appel — assez pour ne pas grossir sans cesse.
  if (Math.random() < 0.01) sweep();

  const now = Date.now();
  const bucket = BUCKETS.get(key);

  if (!bucket || bucket.resetAt < now) {
    BUCKETS.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

/**
 * Extrait une IP depuis les headers Next.js / Vercel.
 * Fallback sur "unknown" — avec le risque qu'un attaquant spamme cette clé,
 * mais c'est volontaire (mieux qu'un crash si l'header manque).
 */
export function getClientIp(req: Request): string {
  const headers = req.headers;
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}
