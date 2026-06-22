'use client'

import { usePathname } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { getAskAi, GOOGLE_AI_URL } from '@/lib/i18n/ask-ai'

// Floating "Ask the AI" widget — fixed bottom-right. A glowing violet Sparkles
// pill; on hover the label slides out to the LEFT (the pill is right-anchored,
// so growing width expands leftward). Click opens Google Search "AI Mode" in a
// new tab, pre-filled with "Fractera ai" — the AI there has up-to-date info
// about Fractera and answers the user's questions directly, with zero setup.
// Plain <a> so middle-click / open-in-new-tab work. Strings via i18n (rule 4а).
export function AskAiWidget({ lang }: { lang: string }) {
  const t = getAskAi(lang)
  const pathname = usePathname()

  // Don't show on the embed widget (it's a standalone surface).
  if (pathname?.includes('/embed')) return null

  return (
    <a
      href={GOOGLE_AI_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.bubble}
      className="cta-shimmer group fixed right-5 z-50 inline-flex items-center overflow-hidden rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg transition-colors"
      // bottom = 20px (was bottom-5) + 64px = 84px — lifted up 64px per request.
      // Inline (not an arbitrary `bottom-[84px]` class) to dodge the JIT arbitrary-value drop.
      style={{ bottom: 84, paddingTop: 12, paddingBottom: 12, paddingLeft: 16, paddingRight: 16 }}
    >
      <span aria-hidden className="cta-shimmer-sweep pointer-events-none absolute inset-0 z-0 rounded-full" />
      {/* label expands to the left on hover */}
      <span className="relative z-10 max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold opacity-0 transition-all duration-300 group-hover:mr-2 group-hover:max-w-[260px] group-hover:opacity-100">
        {t.bubble}
      </span>
      <Sparkles className="relative z-10 shrink-0" size={22} />
    </a>
  )
}
