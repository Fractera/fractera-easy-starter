import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma', 'ssh2'],
  async headers() {
    return [
      {
        // Allow /:lang/embed/* to be framed from any domain (partner blogs, articles, etc.)
        source: '/:lang/embed/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: 'frame-ancestors *;' },
        ],
      },
      {
        // Anti-clickjacking on the whole site EXCEPT /*/embed/* (negative lookahead).
        // Two CSP headers on one path intersect to the strictest, so embed must be
        // excluded here or frame-ancestors * would be narrowed back to 'self'.
        source: '/((?!.*/embed/).*)',
        headers: [
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self';" },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
};

export default nextConfig;
