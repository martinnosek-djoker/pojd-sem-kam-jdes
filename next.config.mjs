import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Umožní build i při ESLint chybách (deployment nezablokuje lint)
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/cs',
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
