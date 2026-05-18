'use client'

import { useHeroContent } from '@/lib/i18n/context'

// Each card's radial highlight faces the grid center
const CARD_GRADIENT_POSITIONS = [
  '100% 100%', // top-left     → bottom-right
  '50% 100%',  // top-center   → bottom
  '0% 100%',   // top-right    → bottom-left
  '100% 0%',   // bottom-left  → top-right
  '50% 0%',    // bottom-center → top
  '0% 0%',     // bottom-right  → top-left
]

export function PlatformsGrid() {
  const content = useHeroContent()
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col gap-3 items-start text-left md:items-center md:text-center">
        <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{content.platformsHeader.label}</p>
        <h2 className="max-w-3xl font-serif font-bold leading-tight text-white text-2xl md:text-3xl lg:text-4xl">
          {content.platformsHeader.h2}
        </h2>
        <p className="max-w-xl text-base text-white/60">{content.platformsHeader.description}</p>
      </div>

      <div
        className="grid grid-cols-2 md:grid-cols-3 gap-[2px]"
        style={{ background: 'radial-gradient(circle at center, hsl(263.4,70%,50.4%) 0%, rgba(0,0,0,0) 99%)' }}
      >
        {content.platformCards.map((card, i) => (
          <div key={i} className="group relative size-full p-6 sm:p-8 bg-black flex flex-col justify-between overflow-hidden">
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <p className="text-xl font-bold text-white mb-2">{card.title}</p>
                <p className="text-sm text-white/50 leading-snug">{card.subtitle}</p>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <span className="text-xs font-mono text-white/40 font-medium">{card.company}</span>
              </div>
            </div>
            <span
              className="pointer-events-none absolute inset-px opacity-0 transition-opacity duration-300 md:group-hover:opacity-100"
              style={{ background: `radial-gradient(circle at ${CARD_GRADIENT_POSITIONS[i]}, hsl(263.4,70%,50.4%,0.45) 0%, transparent 70%)` }}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
