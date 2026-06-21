// Per-document content contract for the /deployments/local page ("Local Agent
// Engineering: Edge Appliances for Private Data" — the AI Company Brain offer).
// Same per-document, per-language shape as lib/news: a full base file (en.ts) +
// a partial per-language override (ru.ts) merged with deepMerge. Non-translatable
// fields (slug/tags/author/images) live in meta.ts.

import type { FaqPair } from '@/lib/blog/types'

export type Pillar = { title: string; text: string }

export type DeploymentsLocalContent = {
  // SEO surface (news parity)
  title: string // page H1 — from the Block 3 keymap
  seoTitle?: string
  description: string
  summary: string
  keywords: string

  // Visual section (moved verbatim from the homepage Company Brain section)
  label: string
  h2: string // the appliance value headline (former section h2, now an H2)
  subhead: string
  imageAlt: string
  intro: string
  pillarsTitle: string
  pillars: Pillar[]
  pricingLabel: string
  pricingBody: string
  limitedLabel: string
  limitedBody: string
  assuranceTitle: string
  assuranceBody: string

  // Strengthening block — three extra paragraphs added on the move (device /
  // private LightRAG memory / who-and-how), grounded in CRUD-DOCS facts.
  detailsTitle: string
  details: string[]

  // CTA (founder consultation)
  ctaTitle: string
  ctaBody: string
  ctaButton: string

  // FAQ (news parity; powers FAQPage JSON-LD)
  faq?: FaqPair[]
}
