'use client'

import { useHeroContent } from '@/lib/i18n/context'

// Small inline "Deploy my server" CTA repeated between landing sections
// so the conversion path is always within thumb reach as users scroll.
export function DeployButton() {
  const content = useHeroContent()
  return (
    <div className="w-full flex justify-center">
      <a
        href="#pricing"
        className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-7 py-3 rounded-xl text-sm md:text-base transition-colors shadow-lg shadow-violet-500/30"
      >
        {content.deployButton}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </a>
    </div>
  )
}
