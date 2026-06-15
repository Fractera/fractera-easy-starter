'use client'

import { useHeroContent } from '@/lib/i18n/context'

// First H2 after the hero — the "Ultimate Scale" hub. Reuses the canonical section
// header (badge + serif H2 + description, same as ElonTrillion). The three teasers
// are bordered rounded cards (same style as the bottom note card) with a hover glow
// reused verbatim from the carousel (shadow-[0_0_50px_6px_rgba(139,92,246,0.5)]).
// The pricing CTA itself is the standard DeployButton, rendered by page.tsx right
// after this section. Order: badge → H2 → description → 3 H3 teaser cards → note card.

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

      {/* Three H3 teaser cards — bordered + rounded, violet glow on hover (same as the
          carousel). Each links to a deeper page or on-page section. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {t.columns.map((col, i) => (
          <div
            key={i}
            className="flex flex-col items-start text-left rounded-xl border border-white/15 bg-white/[0.02] px-5 py-5 transition-shadow duration-300 hover:border-violet-500/40 hover:shadow-[0_0_50px_6px_rgba(139,92,246,0.5)]"
          >
            <h3 className="text-lg font-bold text-white leading-snug">{col.title}</h3>
            <div className="my-3 h-px w-12 bg-emerald-500" />
            <p className="text-[14px] text-white/70 leading-relaxed">{col.text}</p>
            <a
              href={col.href}
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-violet-300 hover:text-violet-200 transition-colors"
            >
              {col.linkLabel}
            </a>
          </div>
        ))}
      </div>

      {/* Classic-mode note — full-width bordered card, plain text (no orange clutter). */}
      <div className="w-full rounded-xl border border-white/15 bg-white/[0.02] px-5 py-4">
        <p className="text-center text-sm text-white/70 leading-relaxed">
          {t.footnote}
        </p>
      </div>

    </div>
  )
}
