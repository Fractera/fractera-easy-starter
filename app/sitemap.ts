import type { MetadataRoute } from 'next'
import { SUPPORTED_LANGUAGES as SUPPORTED_LANGS, DEFAULT_LANGUAGE } from '@/config/translations/translations.config'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.fractera.ai'
  const now = new Date()

  const pages = [
    { path: '',         changeFrequency: 'weekly'  as const, priority: 1.0 },
    { path: '/privacy', changeFrequency: 'yearly'  as const, priority: 0.3 },
    { path: '/terms',   changeFrequency: 'yearly'  as const, priority: 0.3 },
    { path: '/cookies', changeFrequency: 'yearly'  as const, priority: 0.2 },
    { path: '/blog',    changeFrequency: 'weekly'  as const, priority: 0.7 },
    { path: '/cases',   changeFrequency: 'weekly'  as const, priority: 0.6 },
    { path: '/skills',       changeFrequency: 'weekly'  as const, priority: 0.7 },
    { path: '/product-loop', changeFrequency: 'weekly'  as const, priority: 0.7 },
    { path: '/sponsors',     changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/refund',       changeFrequency: 'yearly'  as const, priority: 0.3 },
    { path: '/partners', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/regional-partners', changeFrequency: 'monthly' as const, priority: 0.5 },
  ]

  const buildAlternates = (path: string) => ({
    languages: Object.fromEntries(
      SUPPORTED_LANGS.map(l => [
        l,
        l === DEFAULT_LANGUAGE && path === ''
          ? `${base}/`
          : `${base}/${l}${path}`,
      ])
    ),
  })

  // Root entry — the bare URL. Hosts the same HTML the proxy.ts rewrite
  // serves from `/${DEFAULT_LANGUAGE}`, but search engines see it as the
  // primary canonical for the English homepage.
  const rootEntry = {
    url: `${base}/`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 1.0,
    alternates: buildAlternates(''),
  }

  // /mcp-info — a SINGLE canonical page at the bare root (no /[lang] duplicates).
  const mcpInfoEntry = {
    url: `${base}/mcp-info`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }

  // /ai-workspace-architect — likewise a SINGLE canonical root page (no /[lang]).
  const architectEntry = {
    url: `${base}/ai-workspace-architect`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }

  // /ai-development-loop — likewise a SINGLE canonical root page (no /[lang]).
  const developmentLoopEntry = {
    url: `${base}/ai-development-loop`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }


  // Per-language entries. The English homepage's /en URL is deliberately
  // skipped here — it duplicates the root and we don't want to advertise
  // both. Other languages' homepages and ALL other paths in every language
  // stay in the sitemap.
  const perLang = SUPPORTED_LANGS.flatMap(lang =>
    pages
      .filter(({ path }) => !(lang === DEFAULT_LANGUAGE && path === ''))
      .map(({ path, changeFrequency, priority }) => ({
        url: `${base}/${lang}${path}`,
        lastModified: now,
        changeFrequency,
        priority: lang === DEFAULT_LANGUAGE ? priority : priority * 0.8,
        alternates: buildAlternates(path),
      }))
  )

  return [rootEntry, mcpInfoEntry, architectEntry, developmentLoopEntry, ...perLang]
}
