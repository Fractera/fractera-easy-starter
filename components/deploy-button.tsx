'use client'

import { useHeroContent } from '@/lib/i18n/context'

// Главный CTA «Запустить в 1 клик», повторяется между секциями лендинга, чтобы путь
// к конверсии всегда был под рукой при скролле. `caption` — своя подпись на секцию
// (передаётся из page.tsx), несёт идею «волшебно легко и эффективно». Анимация —
// янтарно-золотой шиммер, контрастный к фиолетовому фону.
export function DeployButton({ caption }: { caption?: string }) {
  const content = useHeroContent()
  return (
    <div className="w-full flex flex-col items-center gap-2.5">
      <a
        href="#pricing"
        className="cta-shimmer group relative inline-flex items-center gap-2 overflow-hidden bg-violet-600 hover:bg-violet-500 text-white font-bold px-7 py-3 rounded-xl text-sm md:text-base transition-colors"
      >
        <span className="relative z-10 inline-flex items-center gap-2">
          {content.deployButton}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </span>
        <span aria-hidden className="cta-shimmer-sweep pointer-events-none absolute inset-0 z-0" />
      </a>
      {caption && (
        <p className="max-w-md text-center text-xs md:text-sm font-medium text-amber-300/90 leading-snug">
          {caption}
        </p>
      )}
    </div>
  )
}
