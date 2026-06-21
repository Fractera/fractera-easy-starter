// Public API for the /deployments/local page content. Per-document, per-language
// (en base + ru partial override), resolved with deepMerge so a missing field
// falls back to English — the same architecture as lib/news.

import { deepMerge, type DeepPartial } from '@/lib/utils/deep-merge'
import { meta } from './meta'
import { en } from './en'
import { ru } from './ru'
import type { DeploymentsLocalContent } from './types'

export type { DeploymentsLocalContent, Pillar } from './types'
export { meta as deploymentsLocalMeta }

const OVERRIDES: Record<string, DeepPartial<DeploymentsLocalContent>> = { ru }

export function getDeploymentsLocal(lang: string): DeploymentsLocalContent {
  return deepMerge<DeploymentsLocalContent>(en, OVERRIDES[lang])
}
