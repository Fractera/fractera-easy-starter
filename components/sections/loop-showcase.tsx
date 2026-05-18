'use client'

import { useState } from 'react'
import { Layers, RefreshCcw, ShoppingBag } from 'lucide-react'
import { useHeroContent } from '@/lib/i18n/context'

const ICONS = [Layers, RefreshCcw, ShoppingBag]
const GRADIENTS = [
  'from-violet-900/40 via-violet-700/20 to-purple-950/40',
  'from-blue-900/40 via-cyan-700/20 to-blue-950/40',
  'from-amber-900/40 via-yellow-700/20 to-orange-950/40',
]
const ACCENTS = ['violet', 'cyan', 'amber'] as const
const PLACEHOLDER_LABELS = ['Build Products diagram', 'Hermes Loop diagram', 'Skills Marketplace diagram']

export function LoopShowcase() {
  const content = useHeroContent()
  const [activeIdx, setActiveIdx] = useState(0)
  const slides = content.loopShowcase.slides
  const active = slides[activeIdx]
  const Icon = ICONS[activeIdx]
  const gradient = GRADIENTS[activeIdx]
  const accent = ACCENTS[activeIdx]

  const accentBorder =
    accent === 'violet' ? 'border-violet-500/60 shadow-violet-500/[0.12]' :
    accent === 'cyan'   ? 'border-cyan-500/60 shadow-cyan-500/[0.12]' :
                          'border-amber-500/60 shadow-amber-500/[0.12]'
  const accentText =
    accent === 'violet' ? 'text-violet-400' :
    accent === 'cyan'   ? 'text-cyan-400' :
                          'text-amber-400'

  return (
    <section className="w-full max-w-5xl mx-auto px-4 flex flex-col items-center gap-8">
      <div className="text-center flex flex-col items-center gap-3 max-w-3xl">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif leading-tight text-white">
          {content.loopShowcase.h2}
        </h2>
        <p className="text-base md:text-lg text-white/70 leading-relaxed">
          {content.loopShowcase.description}
        </p>
      </div>

      <div
        key={activeIdx}
        className={`w-full rounded-2xl border-2 ${accentBorder} overflow-hidden shadow-2xl transition-all duration-300`}
      >
        <div className={`relative w-full aspect-[16/9] bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-4`}>
          <Icon className={`w-24 h-24 ${accentText} opacity-80`} strokeWidth={1.5} />
          <p className={`text-sm font-mono font-bold ${accentText} uppercase tracking-widest opacity-70`}>
            {PLACEHOLDER_LABELS[activeIdx]}
          </p>
          <p className="text-xs text-white/40 italic">placeholder — image coming soon</p>
        </div>
      </div>

      <div className="text-center flex flex-col items-center gap-2 max-w-3xl">
        <h3 className="text-xl md:text-2xl font-bold text-white">{active.title}</h3>
        <p className="text-sm md:text-base text-white/70 leading-relaxed">{active.description}</p>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3">
        {slides.map((slide, i) => {
          const isActive = i === activeIdx
          const btnAccent = ACCENTS[i]
          const activeClass =
            btnAccent === 'violet' ? 'bg-violet-600 border-violet-500 shadow-lg shadow-violet-500/30' :
            btnAccent === 'cyan'   ? 'bg-cyan-600 border-cyan-500 shadow-lg shadow-cyan-500/30' :
                                     'bg-amber-600 border-amber-500 shadow-lg shadow-amber-500/30'
          return (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={`flex flex-col items-start gap-1 px-5 py-4 rounded-xl border-2 text-left transition-all ${
                isActive
                  ? `${activeClass} text-white`
                  : 'border-white/20 bg-white/[0.03] text-white/80 hover:border-white/40 hover:bg-white/[0.06]'
              }`}
            >
              <span className="text-base font-bold leading-tight">{slide.label}</span>
              <span className={`text-xs ${isActive ? 'text-white/80' : 'text-white/50'}`}>{slide.sublabel}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
