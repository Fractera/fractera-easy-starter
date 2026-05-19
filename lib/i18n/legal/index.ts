import type { LegalContent } from './types'
import { en } from './en'
import { ru } from './ru'

const locales: Partial<Record<string, LegalContent>> = { en, ru }

/** Returns legal content for lang, falls back to DEFAULT_LOCALE then 'en'. */
export function getLegal(lang: string): LegalContent {
  return locales[lang] ?? locales[process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? 'en'] ?? en
}
