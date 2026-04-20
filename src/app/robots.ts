import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/admin', '/booking/', '/marketplace/success', '/marketplace/cancelled'],
      },
    ],
    sitemap: 'https://adventurer-outdoor.vercel.app/sitemap.xml',
    host: 'https://adventurer-outdoor.vercel.app',
  };
}
