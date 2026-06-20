// Explicit static-import registry — one line per doc. EN-only by the same
// curated precedent as the blog (see lib/documentation/types.ts).

import type { DocEntry } from './types'

import { meta as consultantMeta } from './entries/one-button-workspace-ai-consultant/meta'
import { en as consultantEn } from './entries/one-button-workspace-ai-consultant/en'

import { meta as authMeta } from './entries/authentication-roles-and-providers/meta'
import { en as authEn } from './entries/authentication-roles-and-providers/en'

import { meta as staticFirstMeta } from './entries/static-first-rendering-economics/meta'
import { en as staticFirstEn } from './entries/static-first-rendering-economics/en'

export const DOCS: DocEntry[] = [
  {
    ...staticFirstMeta,
    ...staticFirstEn,
  },
  {
    ...consultantMeta,
    ...consultantEn,
  },
  {
    ...authMeta,
    ...authEn,
  },
]
