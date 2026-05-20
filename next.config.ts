import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma', 'ssh2'],
  async headers() {
    return [
      {
        // Allow /embed/* to be framed from any domain (partner blogs, articles, etc.)
        source: '/embed/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: 'frame-ancestors *;' },
        ],
      },
    ]
  },
};

export default nextConfig;
