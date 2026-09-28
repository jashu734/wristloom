import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Fix: tell Turbopack the workspace root is THIS directory,
  // not the parent e:\WristLoom which has multiple lockfiles
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Allow dev access from local network (e.g. phone/tablet testing)
  allowedDevOrigins: ['192.168.56.1', '192.168.1.*', '10.0.0.*'],
};

export default nextConfig;
