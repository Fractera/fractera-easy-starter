import { en } from './en'
import { ru } from './ru'
import type { FrameworkUi } from '../_lib/types'

// Public API of the catalog's chrome _data: the localized UI strings, one object per
// language (en base + ru), resolved with EN fallback. Same co-location contract as
// every other _data folder (per-language files + this index). Add a language by
// adding a file and a line here.
const UI: Record<string, FrameworkUi> = { en, ru }

export function getFrameworkUi(lang: string): FrameworkUi {
  return UI[lang] ?? UI.en
}
