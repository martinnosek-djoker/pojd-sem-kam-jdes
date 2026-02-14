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
  // IMPORTANT: This config is for web/production builds with API routes
  // Mobile builds use build-mobile.mjs which swaps in next.config.mobile.mjs
  // DO NOT add output: 'export' here - it breaks API routes!
};

export default nextConfig;
