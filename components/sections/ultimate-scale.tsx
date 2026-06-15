'use client'

import { useHeroContent } from '@/lib/i18n/context'

// First H2 after the hero — the "Ultimate Scale" hub. Reuses the canonical section
// header (badge + serif H2 + description, same as ElonTrillion) and the heroBenefits
// 3-column grid. Order: badge → H2 → description → pricing CTA → 3 H3 teaser columns
// (each linking to a deeper page or on-page section) → amber footnote (classic mode).

export function UltimateScale() {
  const t = useHeroContent().ultimateScale

  return (
    <div id="ultimate-scale" className="w-full max-w-4xl mx-auto flex flex-col gap-8 scroll-mt-24">

      {/* Header — badge + h2 + description */}
      <div className="flex flex-col gap-4 items-start text-left md:items-center md:text-center">
        <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest border border-emerald-500/30 bg-emerald-500/[0.04] px-3 py-1 rounded-full">
          {t.badge}
        </span>
        <h2 className="max-w-3xl font-serif font-bold leading-tight text-white text-2xl md:text-3xl lg:text-4xl">
          {t.h2}
        </h2>
        <p className="max-w-2xl text-base md:text-lg text-white/75 leading-relaxed">
          {t.description}
        </p>
      </div>

      {/* Pricing CTA */}
      <div className="flex justify-center">
        <a
          href={t.cta.href}
          className="cta-shimmer group relative inline-flex items-center gap-2 overflow-hidden bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-4 rounded-xl text-base transition-colors"
        >
          <span className="relative z-10 inline-flex items-center gap-2">
            {t.cta.label}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </span>
          <span aria-hidden className="cta-shimmer-sweep pointer-events-none absolute inset-0 z-0" />
        </a>
      </div>

      {/* Three H3 teaser columns — each links to a deeper page or on-page section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10 pt-2">
        {t.columns.map((col, i) => (
          <div key={i} className="flex flex-col items-start text-left">
            <h3 className="text-lg font-bold text-white leading-snug">{col.title}</h3>
            <div className="my-3 h-px w-12 bg-emerald-500" />
            <p className="text-[14px] text-white/70 leading-relaxed">{col.text}</p>
            <a
              href={col.href}
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-violet-300 hover:text-violet-200 transition-colors"
            >
              {col.linkLabel}
            </a>
          </div>
        ))}
      </div>

      {/* Amber footnote — switch to classic code-generation mode in one click */}
      <p className="max-w-2xl mx-auto text-center text-xs md:text-sm font-medium text-amber-300/90 leading-snug">
        {t.footnote}
      </p>

    </div>
  )
}
