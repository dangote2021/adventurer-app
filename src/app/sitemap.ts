import type { MetadataRoute } from 'next';
import { COACHES } from './coach/humain/coaches';

const BASE = 'https://adventurer-outdoor.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/ambassadors`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/how-it-works`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE}/explore`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/coach`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE}/coach/ai`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/coach/humain`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    ...COACHES.map(c => ({
      url: `${BASE}/coach/humain/${c.id}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${BASE}/legal/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/legal/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/legal/mentions`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ];
}
