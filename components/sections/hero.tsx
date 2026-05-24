'use client'

import { Bot, Brain, Code2, Globe, Database, ShoppingBag } from 'lucide-react'
import { useHeroContent } from '@/lib/i18n/context'

const HERO_BENEFIT_ICONS = [Bot, Brain, Code2, Globe, Database, ShoppingBag]

export function Hero() {
  const content = useHeroContent()

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col -mx-6 w-[calc(100%+3rem)]">
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
        src="/video/ai-loop.mp4"
        autoPlay loop muted playsInline
      />
      <div className="relative z-10 flex flex-col flex-1 min-h-screen">
        <div className="flex flex-col items-center text-center gap-6 pt-16 px-4 flex-1 justify-center max-w-3xl mx-auto">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/50 bg-violet-500/[0.06]">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-[0.15em]">{content.heroBadge}</span>
          </div>
          <p className="text-6xl font-bold font-serif tracking-tight leading-[0.95] md:text-7xl lg:text-8xl text-white">Fractera</p>
          <h1
            className="text-3xl font-bold font-serif leading-tight md:text-4xl lg:text-5xl"
            style={{ color: 'white', WebkitTextStroke: '1px rgba(139,92,246,0.8)', paintOrder: 'stroke fill', textShadow: '0 0 18px rgba(139,92,246,0.55), 0 0 36px rgba(139,92,246,0.28)' } as React.CSSProperties}
          >
            {content.heroTitle}
          </h1>
          <p className="text-lg text-white/80 leading-relaxed max-w-xl">{content.description}</p>
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-4 rounded-xl text-base transition-colors shadow-lg shadow-violet-500/30 mt-2"
          >
            {content.deployButton}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>

        <h2 className="text-center font-serif font-bold text-white text-2xl md:text-3xl lg:text-4xl pt-8 px-4 max-w-4xl mx-auto leading-tight">
          {content.heroBenefitsHeader.h2}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10 px-4 pb-12 pt-6 md:px-8 lg:px-12 max-w-6xl mx-auto w-full">
          {content.heroBenefits.map(({ title, text }, i) => {
            const Icon = HERO_BENEFIT_ICONS[i]
            return (
              <div key={i} className="flex flex-col items-center text-center md:items-start md:text-left">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-5 h-5 shrink-0 text-violet-400" />
                  <h3 className="text-lg font-bold text-white leading-snug">{title}</h3>
                </div>
                <div className="mb-3 h-px w-12 bg-violet-500" />
                <p className="text-[14px] text-white/70 leading-relaxed">{text}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
