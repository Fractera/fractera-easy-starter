// Explicit static-import registry — one line per article. Next/webpack needs
// statically resolvable import paths, so this is a manual list, not an fs scan.
// Adding a new article = add its folder + one entry here. Adding a new
// language to an existing article = add `<lang>.ts` in its folder + one key
// in that article's `overrides`, no other file changes.

import type { NewsArticle } from './types'

import { meta as architectureMeta } from './entries/architecture-to-development-steps-materializer/meta'
import { en as architectureEn } from './entries/architecture-to-development-steps-materializer/en'
import { ru as architectureRu } from './entries/architecture-to-development-steps-materializer/ru'

import { meta as aiDraftSettingsMeta } from './entries/ai-draft-settings-evolutionary-pipeline/meta'
import { en as aiDraftSettingsEn } from './entries/ai-draft-settings-evolutionary-pipeline/en'
import { ru as aiDraftSettingsRu } from './entries/ai-draft-settings-evolutionary-pipeline/ru'

export const ARTICLES: NewsArticle[] = [
  {
    ...architectureMeta,
    base: architectureEn,
    overrides: { ru: architectureRu },
  },
  {
    ...aiDraftSettingsMeta,
    base: aiDraftSettingsEn,
    overrides: { ru: aiDraftSettingsRu },
  },
]
