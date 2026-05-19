'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Layers, RefreshCcw, ShoppingBag } from 'lucide-react'
import { useHeroContent } from '@/lib/i18n/context'

const ICONS = [Layers, RefreshCcw, ShoppingBag]
const GRADIENTS = [
  'from-violet-900/40 via-violet-700/20 to-purple-950/40',
  'from-blue-900/40 via-cyan-700/20 to-blue-950/40',
  'from-amber-900/40 via-yellow-700/20 to-orange-950/40',
]
const ACCENTS = ['violet', 'cyan', 'amber'] as const
const PLACEHOLDER_LABELS = [
  'Build Products diagram',
  'Product Loop diagram',
  'Marketplace Compound diagram',
]

const STEP_SWITCH_DURATION = 5000
const LINE_ANIMATION_DURATION = 15000
const FADE_DURATION = 700

export function LoopShowcase() {
  const content = useHeroContent()
  const slides = content.loopShowcase.slides
  const totalSteps = slides.length

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [imageOpacity, setImageOpacity] = useState(1)
  const [progressWidth, setProgressWidth] = useState(0)

  const lineAnimationFrameRef = useRef<number | null>(null)
  const lineStartTimeRef = useRef<number>(0)

  const animateLine = useCallback((currentTime: number) => {
    if (!lineStartTimeRef.current) lineStartTimeRef.current = currentTime
    const elapsed = currentTime - lineStartTimeRef.current
    let newProgress = (elapsed / LINE_ANIMATION_DURATION) * 100
    if (newProgress >= 100) {
      newProgress = 100
      setProgressWidth(0)
      lineStartTimeRef.current = currentTime
    } else {
      setProgressWidth(newProgress)
    }
    lineAnimationFrameRef.current = requestAnimationFrame(animateLine)
  }, [])

  useEffect(() => {
    lineAnimationFrameRef.current = requestAnimationFrame(animateLine)
    const stepInterval = setInterval(() => {
      setImageOpacity(0)
      setTimeout(() => {
        setCurrentStepIndex(prev => (prev + 1) % totalSteps)
        setImageOpacity(1)
      }, FADE_DURATION)
    }, STEP_SWITCH_DURATION)

    return () => {
      if (lineAnimationFrameRef.current) cancelAnimationFrame(lineAnimationFrameRef.current)
      clearInterval(stepInterval)
    }
  }, [totalSteps, animateLine])

  const activeAccent = ACCENTS[currentStepIndex]
  const accentBorder =
    activeAccent === 'violet' ? 'border-violet-500/60 shadow-violet-500/[0.12]' :
    activeAccent === 'cyan'   ? 'border-cyan-500/60 shadow-cyan-500/[0.12]' :
                                'border-amber-500/60 shadow-amber-500/[0.12]'
  const activeAccentText =
    activeAccent === 'violet' ? 'text-violet-400' :
    activeAccent === 'cyan'   ? 'text-cyan-400' :
                                'text-amber-400'

  const getCircleLeft = (index: number) => {
    if (totalSteps === 3) {
      if (index === 0) return '60px'
      if (index === 1) return 'calc((60px + (100% - 25%)) / 2)'
      if (index === 2) return 'calc(100% - 25%)'
    }
    return `${(index / (totalSteps - 1)) * 100}%`
  }

  const getCircleLeftMobile = (index: number) => {
    if (totalSteps === 3) {
      if (index === 0) return '60px'
      if (index === 1) return '50%'
      if (index === 2) return 'calc(100% - 60px)'
    }
    return `${(index / (totalSteps - 1)) * 100}%`
  }

  const activeSlide = slides[currentStepIndex]

  return (
    <section className="w-full max-w-5xl mx-auto px-4 flex flex-col items-center">
      <div className="text-center flex flex-col items-center gap-3 max-w-3xl mb-12">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif leading-tight text-white">
          {content.loopShowcase.h2}
        </h2>
        <p className="text-base md:text-lg text-white/70 leading-relaxed">
          {content.loopShowcase.description}
        </p>
      </div>

      {/* Image area — placeholder gradient with icon, fades on switch */}
      <div
        className={`relative w-full aspect-[16/9] max-w-4xl mx-auto mb-8 rounded-2xl border-2 ${accentBorder} overflow-hidden shadow-2xl transition-all duration-300`}
      >
        {slides.map((_, index) => {
          const Icon = ICONS[index]
          const gradient = GRADIENTS[index]
          const accentText =
            ACCENTS[index] === 'violet' ? 'text-violet-400' :
            ACCENTS[index] === 'cyan'   ? 'text-cyan-400' :
                                          'text-amber-400'
          const isActive = index === currentStepIndex
          const opacity = isActive && imageOpacity === 1 ? 'opacity-100' : 'opacity-0'
          return (
            <div
              key={index}
              className={`absolute inset-0 bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-4 transition-opacity duration-700 ${opacity}`}
            >
              <Icon className={`w-24 h-24 ${accentText} opacity-80`} strokeWidth={1.5} />
              <p className={`text-sm font-mono font-bold ${accentText} uppercase tracking-widest opacity-70`}>
                {PLACEHOLDER_LABELS[index]}
              </p>
              <p className="text-xs text-white/40 italic">placeholder — image coming soon</p>
            </div>
          )
        })}
      </div>

      {/* Active slide caption — title + description */}
      <div
        className={`text-center flex flex-col items-center gap-2 max-w-3xl mb-8 transition-opacity duration-700 ${
          imageOpacity === 1 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <h3 className={`text-xl md:text-2xl font-bold ${activeAccentText}`}>{activeSlide.title}</h3>
        <p className="text-sm md:text-base text-white/70 leading-relaxed">{activeSlide.description}</p>
      </div>

      {/* Horizontal step indicator with progress line */}
      <div className="relative w-full max-w-4xl mx-auto px-4 mb-8">
        <div
          className="absolute top-1/2 left-0 right-0 h-px transform -translate-y-1/2 mx-auto"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, black 60px, black calc(100% - 60px), transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 60px, black calc(100% - 60px), transparent 100%)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-white/20" />
          <div
            className="absolute top-0 left-[60px] h-px bg-violet-500"
            style={{ width: `${progressWidth}%`, transition: 'width 0.1s linear' }}
          />
        </div>

        {slides.map((_, index) => (
          <div
            key={index}
            className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 md:left-[var(--desktop-left)] left-[var(--mobile-left)]"
            style={{
              ['--desktop-left' as string]: getCircleLeft(index),
              ['--mobile-left' as string]: getCircleLeftMobile(index),
            } as React.CSSProperties}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2 ${
                index === currentStepIndex
                  ? 'border-violet-500 bg-black text-violet-400'
                  : 'border-white/30 bg-black text-white/60'
              }`}
            >
              {index + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom 3 columns: label + sublabel, active clear, others blurred */}
      <div className="w-full max-w-4xl mx-auto px-4 mt-[40px]">
        {/* Desktop: all 3 visible with blur on inactive */}
        <div className="hidden md:flex justify-between gap-8">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`flex-1 text-center transition-all duration-300 ${
                index === currentStepIndex ? 'opacity-100' : 'opacity-60 blur-sm'
              }`}
            >
              <h4 className="text-lg font-bold text-white mb-2">{slide.label}</h4>
              <p className="text-sm text-white/60 leading-relaxed">{slide.sublabel}</p>
            </div>
          ))}
        </div>

        {/* Mobile: only active visible */}
        <div className="md:hidden text-center">
          <div
            className={`transition-opacity duration-700 ${
              imageOpacity === 1 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <h4 className="text-lg font-bold text-white mb-2">{activeSlide.label}</h4>
            <p className="text-sm text-white/60 leading-relaxed">{activeSlide.sublabel}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
