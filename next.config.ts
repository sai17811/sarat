import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Tree-shake the big 3D helper barrels so only what we import ships.
    optimizePackageImports: ['@react-three/drei', '@react-three/postprocessing', 'maath'],
  },
  async headers() {
    return [
      {
        // Compressed 3D assets are immutable: cache them for a year.
        source: '/models/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default nextConfig;
