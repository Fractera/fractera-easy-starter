'use client'

import Link from 'next/link'
import { Bot, Brain, Code2, Globe, Database, ShoppingBag } from 'lucide-react'
import { useHeroContent } from '@/lib/i18n/context'
import { useLang } from '@/lib/i18n/use-lang'

const HERO_BENEFIT_ICONS = [Bot, Brain, Code2, Globe, Database, ShoppingBag]

// The one real link: the "Pre-Configured Secure Database & Auth Stack" card
// (index 4 in heroBenefits, same position in every locale) points at the new
// Authentication documentation guide. The other cards carry placeholder links.
const AUTH_BENEFIT_INDEX = 4

export function Hero() {
  const content = useHeroContent()
  const lang = useLang()

  // Full-bleed ONLY for the hero: span the viewport but cap at 1920px, centered.
  // Breaks out of the page's max-w-5xl container via a centered margin trick (the rest of
  // the page stays constrained). width = min(100vw,1920px) = 2·min(50vw,960px); the margin
  // places its left edge at viewport-center − that half, so it is full-bleed up to 1920 then
  // centered. html{overflow-x:clip} (globals) absorbs the scrollbar overshoot.
  return (
    <div
      className="relative overflow-hidden flex flex-col"
      style={{ width: 'min(100vw, 1920px)', marginInline: 'calc(50% - min(50vw, 960px))' }}
    >
      {/* ── Section 1 — hero intro. NO background video now: the agentic-engineering
          video sits inline, full-width, between the H1 and the description, and plays
          on its own (autoplay, muted, looped — no play button). ── */}
      <div className="flex flex-col items-center text-center pt-16 px-4">
        {/* Top cluster — badge, brand, H1 keep their internal spacing; the H1 then
            sits flush against the illustration below (no gap) by design. */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/50 bg-violet-500/[0.06]">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-[0.15em]">{content.heroBadge}</span>
          </div>
          <p className="text-6xl font-bold font-serif tracking-tight leading-[0.95] md:text-7xl lg:text-8xl text-white">Fractera</p>
          <h1
            className="text-3xl font-bold font-serif leading-tight md:text-4xl lg:text-5xl max-w-[1250px]"
            style={{ color: 'white', WebkitTextStroke: '1px rgba(139,92,246,0.8)', paintOrder: 'stroke fill', textShadow: '0 0 18px rgba(139,92,246,0.55), 0 0 36px rgba(139,92,246,0.28)' } as React.CSSProperties}
          >
            {content.heroTitle}
          </h1>
        </div>

        {/* Agentic-engineering illustration video — background-style playback (autoplay,
            muted, looped, inline; no controls). Capped at 1152px and flush against the
            H1 above and the button below: the PNG/video carries its own whitespace
            ledge, so touching the edges is intentional (the short subheading paragraph
            was removed — it only added clutter under such a short title). */}
        <video
          className="w-full max-w-[1152px] h-auto pointer-events-none"
          src="/fractera-agentic-engineering.mp4"
          autoPlay loop muted playsInline
        />

        {/* Single button directly under the illustration → the architecture doc page.
            No top gap: it touches the natural bottom ledge of the image by design. */}
        {content.architectureCta && (
          <Link
            href={`/${lang}/documentation/multi-agent-workspace-architecture`}
            className="inline-flex items-center gap-2 rounded-xl border border-violet-500/50 bg-violet-500/[0.06] px-6 py-3 text-sm font-semibold text-violet-200 hover:bg-violet-500/[0.12] transition-colors"
          >
            {content.architectureCta}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        )}
      </div>

      {/* ── Section 2 — "Self-Hosting Platform". The ai-loop video moved here from the
          hero intro and now runs as this section's background (autoplay, looped,
          muted). ── */}
      <div className="relative overflow-hidden mt-8">
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
          src="/video/ai-loop.mp4"
          autoPlay loop muted playsInline
        />
        <div className="relative z-10">
          <h2 className="text-center font-serif font-bold text-white text-2xl md:text-3xl lg:text-4xl pt-8 px-4 max-w-4xl mx-auto leading-tight">
            {content.heroBenefitsHeader.h2}
          </h2>
          {/* Six benefit cards reuse the UltimateScale design verbatim: bordered rounded
              card, violet glow on hover, and a link pinned to the BOTTOM via flex
              justify-between. The Auth card links to the new documentation guide; the
              rest carry placeholder links for now. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 pb-12 pt-6 md:px-8 lg:px-12 max-w-6xl mx-auto w-full">
            {content.heroBenefits.map(({ title, text }, i) => {
              const Icon = HERO_BENEFIT_ICONS[i]
              const href = i === AUTH_BENEFIT_INDEX
                ? `/${lang}/documentation/authentication-roles-and-providers`
                : '#'
              return (
                <div
                  key={i}
                  className="flex h-full flex-col justify-between text-left rounded-xl border border-white/15 bg-white/[0.02] px-5 py-5 transition-shadow duration-300 hover:border-violet-500/40 hover:shadow-[0_0_50px_6px_rgba(139,92,246,0.5)]"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 shrink-0 text-violet-400" />
                      <h3 className="text-lg font-bold text-white leading-snug">{title}</h3>
                    </div>
                    <div className="my-3 h-px w-12 bg-violet-500" />
                    <p className="text-[14px] text-white/70 leading-relaxed">{text}</p>
                  </div>
                  <a
                    href={href}
                    className="mt-4 self-start inline-flex items-center gap-1 text-sm font-medium text-violet-300 hover:text-violet-200 transition-colors"
                  >
                    {content.heroBenefitsHeader.cardLink}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
