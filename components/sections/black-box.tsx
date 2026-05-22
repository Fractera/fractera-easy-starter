'use client'

import { useHeroContent } from '@/lib/i18n/context'

export function BlackBoxSection() {
  const content = useHeroContent()
  const bb = content.blackBox

  return (
    <div id="black-box" className="w-full max-w-4xl flex flex-col gap-10 scroll-mt-24">

      {/* Top — badge, h2, subhead */}
      <div className="flex flex-col gap-4 items-start text-left md:items-center md:text-center">
        <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-widest border border-amber-500/40 bg-amber-500/[0.06] px-3 py-1 rounded-full">
          {bb.label}
        </span>
        <h2 className="max-w-3xl font-serif font-bold leading-tight text-white text-2xl md:text-3xl lg:text-4xl">
          {bb.h2}
        </h2>
        <p className="max-w-2xl text-base text-white/65 leading-relaxed">
          {bb.subhead}
        </p>
      </div>

      {/* Full-width device image */}
      <div className="w-full rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-b from-neutral-900 to-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mac_mini.png"
          alt={bb.imageAlt}
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Intro */}
      <p className="text-base md:text-lg text-white/80 leading-relaxed">
        {bb.intro}
      </p>

      {/* Pillars grid */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl md:text-2xl font-bold font-serif text-white">{bb.pillarsTitle}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bb.pillars.map((p, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-2xl border border-white/15 bg-white/[0.02] p-5">
              <p className="text-xs font-mono font-bold text-amber-300 uppercase tracking-widest">0{i + 1}</p>
              <h4 className="text-base font-bold text-white leading-snug">{p.title}</h4>
              <p className="text-sm text-white/65 leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing + limited — two narrow blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-5">
          <h3 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-widest">{bb.pricingLabel}</h3>
          <p className="text-sm text-white/75 leading-relaxed">{bb.pricingBody}</p>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-5">
          <h3 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-widest">{bb.limitedLabel}</h3>
          <p className="text-sm text-white/75 leading-relaxed">{bb.limitedBody}</p>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col gap-4 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-amber-900/20 to-black/60 p-6 md:p-8 items-start">
        <h3 className="text-xl md:text-2xl font-bold font-serif text-white">{bb.ctaTitle}</h3>
        <p className="text-sm md:text-base text-white/75 leading-relaxed max-w-2xl">{bb.ctaBody}</p>
        <a
          href="mailto:blackbox@fractera.ai"
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-5 py-3 rounded-xl text-sm md:text-base transition-colors shadow-lg shadow-amber-500/20"
        >
          {bb.ctaButton} →
        </a>
      </div>

    </div>
  )
}
