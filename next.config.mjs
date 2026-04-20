/** @type {import('next').NextConfig} */
const isMobileBuild = process.env.CAPACITOR_BUILD === 'true';

const nextConfig = {
  ...(isMobileBuild ? { output: 'export' } : {}),
  productionBrowserSourceMaps: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: isMobileBuild,
  },
  // Headers only work in server mode (Vercel), not in static export (Capacitor)
  ...(!isMobileBuild
    ? {
        async headers() {
          return [
            // Global security headers
            {
              source: '/(.*)',
              headers: [
                { key: 'X-Content-Type-Options', value: 'nosniff' },
                { key: 'X-Frame-Options', value: 'DENY' },
                { key: 'X-XSS-Protection', value: '1; mode=block' },
                { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
                { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
              ],
            },
            {
              source: '/.well-known/assetlinks.json',
              headers: [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'Access-Control-Allow-Origin', value: '*' },
              ],
            },
            {
              source: '/.well-known/apple-app-site-association',
              headers: [
                { key: 'Content-Type', value: 'application/json' },
              ],
            },
            {
              source: '/sw.js',
              headers: [
                { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
                { key: 'Service-Worker-Allowed', value: '/' },
              ],
            },
          ];
        },
      }
    : {}),
};

export default nextConfig;
