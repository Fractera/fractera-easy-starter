'use client'

import { usePathname } from 'next/navigation'

const SUPPORTED_UI_LANGS = ['en', 'ru'] as const
type UiLang = (typeof SUPPORTED_UI_LANGS)[number]

export function useLang(): UiLang {
  const pathname = usePathname() ?? '/'
  const first = pathname.split('/').filter(Boolean)[0]
  return first === 'ru' ? 'ru' : 'en'
}
