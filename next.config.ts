import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma', 'ssh2'],
  async rewrites() {
    return [
      {
        source: '/.well-known/oauth-protected-resource',
        destination: '/api/mcp-oauth-metadata',
      },
    ]
  },
  async headers() {
    return [
      {
        // Allow /:lang/embed/* to be framed from any domain (partner blogs, articles, etc.)
        source: '/:lang/embed/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: 'frame-ancestors *;' },
        ],
      },
    ]
  },
};

export default nextConfig;
