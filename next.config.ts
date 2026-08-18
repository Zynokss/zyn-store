import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/settings',
        destination: '/account',
        permanent: true,
      },
      {
        source: '/user',
        destination: '/account',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.supabase.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: '**.mediadecathlon.com' },
      { protocol: 'https', hostname: 'contents.mediadecathlon.com' },
      { protocol: 'https', hostname: '**.shopify.com' },
      { protocol: 'https', hostname: '**.shopifycdn.com' },
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: '**.cdninstagram.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: '**.co.uk' },
      { protocol: 'https', hostname: '**.com' },
      { protocol: 'https', hostname: '**.net' },
      { protocol: 'https', hostname: '**.org' },
      { protocol: 'https', hostname: '**.ma' },
      { protocol: 'https', hostname: '**.fr' },
      { protocol: 'https', hostname: '**.es' },
      { protocol: 'https', hostname: '**.de' },
      { protocol: 'https', hostname: '**.it' },
      { protocol: 'https', hostname: '**.eu' },
      { protocol: 'https', hostname: '**.io' },
      { protocol: 'https', hostname: '**.dev' },
      { protocol: 'https', hostname: '**.app' },
      { protocol: 'https', hostname: '**.store' },
      { protocol: 'https', hostname: '**.shop' },
      { protocol: 'https', hostname: 'coresg-normal.trae.ai' },
      { protocol: 'https', hostname: '**.trae.ai' },
    ],
  },
};

export default nextConfig;