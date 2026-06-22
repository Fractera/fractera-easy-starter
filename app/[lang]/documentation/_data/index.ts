import { en } from './en'
import { ru } from './ru'
import type { DocUi } from '../_lib/types'

// Public API of the Documentation chrome _data: localized UI strings with EN
// fallback. Same co-location contract as every other _data folder.
const UI: Record<string, DocUi> = { en, ru }

export function getDocUi(lang: string): DocUi {
  return UI[lang] ?? UI.en
}
