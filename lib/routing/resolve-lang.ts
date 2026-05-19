import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '@/config/translations/translations.config'

/**
 * Validates lang from URL params, falls back to DEFAULT_LANGUAGE then 'en'.
 * Call once in page.tsx, pass result down as prop.
 */
export function resolveLang(lang: string): string {
  if (SUPPORTED_LANGUAGES.includes(lang)) return lang
  if (SUPPORTED_LANGUAGES.includes(DEFAULT_LANGUAGE)) return DEFAULT_LANGUAGE
  return 'en'
}
