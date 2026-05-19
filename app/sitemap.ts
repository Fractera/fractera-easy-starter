import type { MetadataRoute } from 'next'
import { SUPPORTED_LANGUAGES as SUPPORTED_LANGS } from '@/config/translations/translations.config'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://fractera.ai'
  const now = new Date()

  const pages = [
    { path: '', changeFrequency: 'weekly' as const, priority: 1.0 },
    { path: '/privacy', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/terms', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/cookies', changeFrequency: 'yearly' as const, priority: 0.2 },
    { path: '/blog', changeFrequency: 'weekly' as const, priority: 0.7 },
    { path: '/cases', changeFrequency: 'weekly' as const, priority: 0.6 },
    { path: '/partners', changeFrequency: 'monthly' as const, priority: 0.5 },
  ]

  return SUPPORTED_LANGS.flatMap(lang =>
    pages.map(({ path, changeFrequency, priority }) => ({
      url: `${base}/${lang}${path}`,
      lastModified: now,
      changeFrequency,
      priority: lang === 'en' ? priority : priority * 0.8,
    }))
  )
}
