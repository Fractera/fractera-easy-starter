'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useHeroContent } from '@/lib/i18n/context'

const MCP_SLIDES = Array.from({ length: 10 }, (_, i) => `/mcp-step-by-step/mcp-step${i + 1}.png`)
// Horizontal slide duration for the step-by-step slider.
const MCP_SLIDE_MS = 450

type Platform = {
  id: string
  name: string
  subscription: string
}

const PLATFORMS: Platform[] = [
  { id: 'claude-code', name: 'Claude Code',  subscription: 'Anthropic Claude Pro/Max' },
  { id: 'codex',       name: 'Codex',        subscription: 'ChatGPT Plus/Pro'         },
  { id: 'gemini',      name: 'Gemini CLI',   subscription: 'Google AI Pro'            },
  { id: 'qwen',        name: 'Qwen Code',    subscription: 'Qwen Cloud'               },
  { id: 'kimi',        name: 'Kimi Code',    subscription: 'Kimi Cloud'               },
]

const CARD_STYLE: React.CSSProperties = {
  animation: 'shimmerBorder 3s ease-in-out infinite',
  border: '1px solid rgba(139,92,246,0.7)',
}

export function PlatformSelector() {
  const content = useHeroContent()
  const mcp = content.mcpSection
  const [copied, setCopied] = useState(false)
  const [slide, setSlide] = useState(0)
  // Slide transition: a flex track holding all slides side by side slides
  // horizontally via translateX. `transitioning` guards clicks landing mid-slide
  // and drops the glow while the track is in motion.
  const [transitioning, setTransitioning] = useState(false)
  const [loaded, setLoaded] = useState<Record<number, boolean>>({})

  const changeSlide = (compute: (s: number) => number) => {
    if (transitioning) return
    setTransitioning(true)
    setSlide(compute)
    setTimeout(() => setTransitioning(false), MCP_SLIDE_MS)
  }
  const prevSlide = () => changeSlide((s) => (s - 1 + MCP_SLIDES.length) % MCP_SLIDES.length)
  const nextSlide = () => changeSlide((s) => (s + 1) % MCP_SLIDES.length)

  // Warm the browser cache for the slide that is about to slide into view so it
  // is painted before the track reaches it (offscreen track children can be
  // deferred by the browser otherwise).
  useEffect(() => {
    const len = MCP_SLIDES.length
    ;[(slide + 1) % len, (slide - 1 + len) % len].forEach((i) => {
      const img = new window.Image()
      img.src = MCP_SLIDES[i]
    })
  }, [slide])

  // Outer-perimeter glow (same as loop-showcase): shows only when the active
  // slide is loaded and the track has settled; fades out while slides move.
  const showGlow = !transitioning && !!loaded[slide]

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(mcp.serverUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard may be blocked — user can still triple-click and copy */
    }
  }

  return (
    <div id="mcp-section" className="flex flex-col gap-6 w-full scroll-mt-16">
      <div className="flex flex-col gap-3 items-start text-left md:items-center md:text-center">
        <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{mcp.label}</p>
        <h2 className="max-w-3xl font-serif font-bold leading-tight text-white text-2xl md:text-3xl lg:text-4xl">
          {mcp.h2}
        </h2>
        <p className="max-w-xl text-base text-white/60">
          {mcp.description}
        </p>
      </div>

      {/* 6-col grid: first 3 cards col-span-2 (33%), last 2 col-span-3 (50%) */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        {PLATFORMS.map((platform, index) => {
          const colSpan = index >= 3 ? 'md:col-span-3' : 'md:col-span-2'
          return (
            <div
              key={platform.id}
              style={CARD_STYLE}
              className={`${colSpan} rounded-lg p-4 text-left flex flex-col gap-1 min-h-[88px] items-start transition-all duration-300 bg-gradient-to-br from-violet-950/30 via-violet-900/10 to-transparent`}
            >
              <span className="text-sm font-semibold text-white">{platform.name}</span>
              <span className="text-xs text-gray-500">{platform.subscription}</span>
            </div>
          )
        })}
      </div>

      {/* MCP server URL — copyable */}
      <div className="flex flex-col gap-2 rounded-xl border border-violet-500/30 bg-violet-500/[0.04] p-4 md:p-5">
        <p className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">{mcp.serverUrlLabel}</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm md:text-base font-mono text-violet-100 bg-black/40 border border-white/15 rounded-lg px-3 py-2.5 break-all select-all">
            {mcp.serverUrl}
          </code>
          <button
            type="button"
            onClick={copyUrl}
            className="shrink-0 inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-4 py-2.5 rounded-lg text-sm transition-colors"
          >
            {copied ? mcp.copied : mcp.copy}
          </button>
        </div>
        <p className="text-xs md:text-sm text-amber-300/85 leading-relaxed mt-1">{mcp.helpHint}</p>
        <a
          href="/mcp-info"
          className="inline-flex items-center gap-1 text-sm font-medium text-violet-300 hover:text-violet-200 transition-colors mt-1"
        >
          {mcp.docLink}
        </a>
      </div>

      {/* Step-by-step slider — 70% width image, prev/next one slide at a time, no autoplay */}
      <div className="flex flex-col gap-3 items-center w-full mt-4">
        <h3 className="font-serif font-bold text-white text-xl md:text-2xl text-center">{mcp.sliderH3}</h3>
        <div className="flex items-center justify-center gap-2 md:gap-4 w-full">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous"
            className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/15 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {/* Fixed aspect (all 10 PNGs are ~1278×630) so the slide and the
              perimeter glow never cause a layout jump. The glow is an outset
              box-shadow — it renders outside the border-box, so overflow-hidden
              does not clip it. Inside, a flex track holds every slide in a row
              and shifts horizontally via translateX. */}
          <div
            className={`relative w-[70%] aspect-[1278/630] overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] transition-shadow ease-out ${
              showGlow
                ? 'shadow-[0_0_50px_6px_rgba(139,92,246,0.5)]'
                : 'shadow-[0_0_0px_0px_rgba(139,92,246,0)]'
            }`}
            style={{ transitionDuration: `${MCP_SLIDE_MS}ms` }}
          >
            <div
              className="flex h-full"
              style={{
                width: `${MCP_SLIDES.length * 100}%`,
                transform: `translateX(-${(slide * 100) / MCP_SLIDES.length}%)`,
                transition: `transform ${MCP_SLIDE_MS}ms ease`,
              }}
            >
              {MCP_SLIDES.map((src, idx) => (
                <div key={src} className="h-full" style={{ width: `${100 / MCP_SLIDES.length}%` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`MCP deployment step ${idx + 1}`}
                    onLoad={() => setLoaded((prev) => ({ ...prev, [idx]: true }))}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next"
            className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/15 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-white/40 text-center max-w-xl">{mcp.sliderCaption}</p>
      </div>
    </div>
  )
}
