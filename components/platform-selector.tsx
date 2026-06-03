'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useHeroContent } from '@/lib/i18n/context'

const MCP_SLIDES = Array.from({ length: 10 }, (_, i) => `/mcp-step-by-step/mcp-step${i + 1}.png`)

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
  const prevSlide = () => setSlide((s) => (s - 1 + MCP_SLIDES.length) % MCP_SLIDES.length)
  const nextSlide = () => setSlide((s) => (s + 1) % MCP_SLIDES.length)

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
          <div className="w-[70%] overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={MCP_SLIDES[slide]}
              alt={`MCP deployment step ${slide + 1}`}
              className="w-full h-auto object-contain"
            />
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
