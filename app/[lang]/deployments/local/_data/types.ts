// Per-document content contract for the /deployments/local page. Same shape as a
// news article (lib/news/types): a LocalizedBody (blocks + faq) plus the scalar
// SEO/header fields, with a partial per-language override. Rendered through the
// shared StandardContentPage template + PostBody, so the page is authored purely
// as data (blocks) — no bespoke layout.

import type { LocalizedBody, LocalizedBodyOverride } from '@/lib/content/types'

export type DeploymentsLocalBase = LocalizedBody & {
  title: string // H1
  seoTitle?: string
  subtitle?: string
  description: string
  keywords: string
}

export type DeploymentsLocalOverride = LocalizedBodyOverride & {
  title?: string
  seoTitle?: string
  subtitle?: string
  description?: string
  keywords?: string
}
