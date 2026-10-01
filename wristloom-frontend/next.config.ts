import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Fix: tell Turbopack the workspace root is THIS directory,
  // not the parent e:\WristLoom which has multiple lockfiles
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Remote image optimization domains
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/**',
      },
    ],
  },

  // Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
    ];
  },

  // Allow dev access from local network (e.g. phone/tablet testing)
  allowedDevOrigins: ['192.168.56.1', '192.168.1.*', '10.0.0.*'],
};

export default nextConfig;
