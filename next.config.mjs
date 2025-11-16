/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Umožní build i při ESLint chybách (deployment nezablokuje lint)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
