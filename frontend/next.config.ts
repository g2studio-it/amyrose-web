import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      // Unsplash (seed product images)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // CDN / storage for product images (update hostname when deploying)
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      // Brave Image Search CDN
      {
        protocol: 'https',
        hostname: 'imgs.search.brave.com',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
