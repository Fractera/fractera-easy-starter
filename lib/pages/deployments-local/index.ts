// Public API for the /deployments/local page content. Per-document, per-language
// (en base + ru partial override), resolved with resolveEntry — the same path
// the News feature uses (lib/news/index.ts), so blocks/faq and the scalar SEO
// fields fall back to English per key.

import { resolveEntry } from '@/lib/content/resolve'
import { meta } from './meta'
import { en } from './en'
import { ru } from './ru'
import type { DeploymentsLocalBase, DeploymentsLocalOverride } from './types'

export type { DeploymentsLocalBase, DeploymentsLocalOverride } from './types'
export { meta as deploymentsLocalMeta }

const FIELDS = ['title', 'seoTitle', 'subtitle', 'description', 'keywords'] as const

const OVERRIDES: Record<string, DeploymentsLocalOverride> = { ru }

export function getDeploymentsLocal(lang: string) {
  const resolved = resolveEntry<DeploymentsLocalBase, DeploymentsLocalOverride, typeof FIELDS>(
    en,
    OVERRIDES,
    lang,
    FIELDS,
  )
  return { ...resolved, seoTitle: resolved.seoTitle ?? resolved.title }
}
