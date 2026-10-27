import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Fix: tell Turbopack the workspace root is THIS directory,
  // not the parent e:\WristLoom which has multiple lockfiles
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Remote image optimization domains & responsive breakpoints
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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

  // Tree-shake large packages automatically
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
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
  allowedDevOrigins: ['192.168.56.1', '192.168.1.*', '10.0.0.*', '172.27.240.1', '172.*'],
};

export default nextConfig;
