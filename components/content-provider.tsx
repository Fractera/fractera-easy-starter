'use client'

import { HeroContentCtx } from '@/lib/i18n/context'
import type { SiteContent } from '@/lib/i18n/types'

export function ContentProvider({
  value,
  children,
}: {
  value: SiteContent
  children: React.ReactNode
}) {
  return <HeroContentCtx.Provider value={value}>{children}</HeroContentCtx.Provider>
}
