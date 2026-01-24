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
  // Conditional static export for mobile builds
  ...(process.env.MOBILE_BUILD === 'true' ? {
    output: 'export',
    images: {
      unoptimized: true,
    },
    trailingSlash: true,
  } : {}),
};

export default nextConfig;
