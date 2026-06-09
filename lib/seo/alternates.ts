import type { Metadata } from 'next'
import { SUPPORTED_LANGUAGES as SUPPORTED_LANGS, DEFAULT_LANGUAGE } from '@/config/translations/translations.config'

const BASE = 'https://www.fractera.ai'

// The canonical URL for a (lang, subPath) pair. The home page of the DEFAULT
// language lives at the bare root (proxy.ts rewrites '/' -> '/<default>'); every
// other URL is /<lang><subPath>. Examples:
//   ('en', '')        -> https://www.fractera.ai/
//   ('ru', '')        -> https://www.fractera.ai/ru
//   ('en', '/skills') -> https://www.fractera.ai/en/skills
//   ('ru', '/skills') -> https://www.fractera.ai/ru/skills
function urlFor(lang: string, subPath: string): string {
  if (subPath === '') return lang === DEFAULT_LANGUAGE ? `${BASE}/` : `${BASE}/${lang}`
  return `${BASE}/${lang}${subPath}`
}

// Per-page canonical + hreflang. Each page declares ITSELF as canonical (fixing
// the old bug where every sub-page inherited canonical = the language root, so
// Google folded them into the home page). hreflang advertises the same page in
// every supported language. `subPath` is '' for a home page, '/slug' otherwise.
export function buildAlternates(lang: string, subPath = ''): Metadata['alternates'] {
  return {
    canonical: urlFor(lang, subPath),
    languages: {
      'x-default': urlFor(DEFAULT_LANGUAGE, subPath),
      ...Object.fromEntries(SUPPORTED_LANGS.map(l => [l, urlFor(l, subPath)])),
    },
  }
}
