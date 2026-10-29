/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Umožní build i při ESLint chybách (deployment nezablokuje lint)
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  async headers() {
    return [
      {
        // Place photos only change when someone replaces them, so browsers (and the app's WebView)
        // may keep them for a day instead of re-asking the server on every view; a stale copy is
        // served for up to a week while the fresh one is fetched.
        source: '/images/:path*',
        // not for the app's requests: those are rewritten (below) to a route with its own headers
        missing: [{ type: 'header', key: 'referer', value: 'https://localhost(/.*)?' }],
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Already installed versions of the Android app request the full-size photos directly. They
        // identify themselves by the Capacitor origin (https://localhost) in the Referer, and get the
        // right-sized, long-cached copy instead - no app release needed. (A website visitor never
        // has that Referer, and the resizer itself fetches the original without one.)
        {
          source: '/images/:path*',
          has: [{ type: 'header', key: 'referer', value: 'https://localhost(/.*)?' }],
          destination: '/api/legacy-img/:path*',
        },
      ],
    };
  },
  // IMPORTANT: This config is for web/production builds with API routes
  // Mobile builds use build-mobile.mjs which swaps in next.config.mobile.mjs
  // DO NOT add output: 'export' here - it breaks API routes!
};

export default nextConfig;
