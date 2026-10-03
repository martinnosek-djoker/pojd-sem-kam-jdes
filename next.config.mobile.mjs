/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
    unoptimized: true,
  },
  // Lets shared code (e.g. card links) know it's the static app build, at compile time
  env: { NEXT_PUBLIC_MOBILE_BUILD: 'true' },
  // Static export for mobile Capacitor builds
  output: 'export',
  trailingSlash: true,
};

export default nextConfig;
