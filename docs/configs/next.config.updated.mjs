/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export pro Capacitor
  output: 'export',

  // Image optimization nefunguje ve static exportu
  images: {
    unoptimized: true,
  },

  // Trailing slash pro správné routing v mobile app
  trailingSlash: true,

  // Disable strict mode pro produkci (může způsobit problémy v mobile)
  // reactStrictMode: false,
};

export default nextConfig;
