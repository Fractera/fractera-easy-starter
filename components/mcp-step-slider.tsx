'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useHeroContent } from '@/lib/i18n/context'

// The MCP "step-by-step" carousel, extracted from PlatformSelector so it can be
// reused on its own — e.g. as the hero (top) of /deployments/mcp while the connector
// details (agents + server URL) render lower in the body. The first frame
// (mcp-step1.png) is also the page's social snippet image.
const MCP_SLIDES = Array.from({ length: 10 }, (_, i) => `/mcp-step-by-step/mcp-step${i + 1}.png`)
const MCP_SLIDE_MS = 450

export function McpStepSlider() {
  const mcp = useHeroContent().mcpSection
  const [slide, setSlide] = useState(0)
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

  // Warm the cache for the neighbouring slides before they reach the viewport.
  useEffect(() => {
    const len = MCP_SLIDES.length
    ;[(slide + 1) % len, (slide - 1 + len) % len].forEach((i) => {
      const img = new window.Image()
      img.src = MCP_SLIDES[i]
    })
  }, [slide])

  const showGlow = !transitioning && !!loaded[slide]

  return (
    <div className="flex flex-col gap-3 items-center w-full">
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
        {/* Fixed aspect (all 10 PNGs are ~1278×630) so the slide and the perimeter
            glow never cause a layout jump. The glow is an outset box-shadow — it
            renders outside the border-box, so overflow-hidden does not clip it.
            Inside, a flex track holds every slide in a row and shifts via translateX. */}
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
  )
}
