import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/debug', '/admin'],
    },
    sitemap: 'https://fractera.ai/sitemap.xml',
  }
}
