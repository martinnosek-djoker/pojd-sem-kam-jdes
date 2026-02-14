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
  // Static export for mobile Capacitor builds
  output: 'export',
  trailingSlash: true,
};

export default nextConfig;
