'use client'

import { useState, useEffect, useRef } from 'react'
import { Server, Globe, Rocket, ChevronLeft, ChevronRight } from 'lucide-react'
import { useHeroContent } from '@/lib/i18n/context'

const ICONS = [Server, Globe, Rocket]
const GRADIENT = 'from-violet-900/40 via-violet-700/20 to-purple-950/40'

const STEP_SWITCH_DURATION = 5000
const FADE_DURATION = 700
const SLIDES_PER_BLOCK = 3

export function LoopShowcase() {
  const content = useHeroContent()
  const slides = content.loopShowcase.slides
  const totalSlides = slides.length
  const blockCount = Math.max(1, Math.ceil(totalSlides / SLIDES_PER_BLOCK))

  const sectionRef = useRef<HTMLElement>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [opacity, setOpacity] = useState(1)
  const [isPausedByPress, setIsPausedByPress] = useState(false)
  const [isInView, setIsInView] = useState(true)
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({})

  const blockIndex = Math.floor(currentSlide / SLIDES_PER_BLOCK)
  const blockStart = blockIndex * SLIDES_PER_BLOCK
  const blockSlides = slides.slice(blockStart, blockStart + SLIDES_PER_BLOCK)
  const dotsCount = blockSlides.length

  const isAnimating = isInView && !isPausedByPress

  // Pause when section scrolls out of view (prevents layout shift on long pages)
  useEffect(() => {
    const el = sectionRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Auto-advance across slides; wraps to slide 0 after the last one
  useEffect(() => {
    if (!isAnimating) return
    const timer = setInterval(() => {
      setOpacity(0)
      setTimeout(() => {
        setCurrentSlide(prev => (prev + 1) % totalSlides)
        setOpacity(1)
      }, FADE_DURATION)
    }, STEP_SWITCH_DURATION)
    return () => clearInterval(timer)
  }, [isAnimating, totalSlides])

  // Lazy-load images only for current + next block so 100+ slides stay light
  useEffect(() => {
    const preload = new Set<number>()
    for (let i = blockStart; i < blockStart + SLIDES_PER_BLOCK && i < totalSlides; i++) {
      preload.add(i)
    }
    const nextStart = ((blockIndex + 1) % blockCount) * SLIDES_PER_BLOCK
    for (let i = nextStart; i < nextStart + SLIDES_PER_BLOCK && i < totalSlides; i++) {
      preload.add(i)
    }
    preload.forEach(idx => {
      const slide = slides[idx]
      if (!slide?.imageSrc || loadedImages[idx]) return
      const img = new window.Image()
      img.src = slide.imageSrc
      img.onload = () => setLoadedImages(prev => ({ ...prev, [idx]: true }))
    })
  }, [blockIndex, blockStart, blockCount, totalSlides, slides, loadedImages])

  // Press-and-hold a circle: pause + jump. Release to resume.
  const handleCirclePointerDown = (slideIdx: number) => {
    setIsPausedByPress(true)
    setOpacity(1)
    setCurrentSlide(slideIdx)
  }
  const handleCirclePointerUp = () => setIsPausedByPress(false)

  // Block-step navigation: ±3 with wrap-around
  const shiftBlock = (delta: 1 | -1) => {
    const nextBlock = (blockIndex + delta + blockCount) % blockCount
    setOpacity(0)
    setTimeout(() => {
      setCurrentSlide(nextBlock * SLIDES_PER_BLOCK)
      setOpacity(1)
    }, FADE_DURATION)
  }

  const activeSlide = slides[currentSlide]

  const getCircleLeft = (pos: number) => {
    if (dotsCount === 1) return '50%'
    if (dotsCount === 3) {
      if (pos === 0) return '60px'
      if (pos === 1) return '50%'
      return 'calc(100% - 60px)'
    }
    if (dotsCount === 2) {
      return pos === 0 ? '60px' : 'calc(100% - 60px)'
    }
    return `${(pos / (dotsCount - 1)) * 100}%`
  }

  // Progress line spans the whole block; restarts via key={blockIndex}
  const progressDurationSec = (STEP_SWITCH_DURATION * dotsCount) / 1000

  return (
    <section ref={sectionRef} className="w-full max-w-5xl mx-auto px-4 flex flex-col items-center">
      <style>{`
        @keyframes fractera-line-slide {
          0%   { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
      `}</style>

      {/* Section header — badge + h2 + description */}
      <div className="text-center flex flex-col items-center gap-3 max-w-3xl mb-12">
        <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">
          {content.loopShowcase.label}
        </p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif leading-tight text-white">
          {content.loopShowcase.h2}
        </h2>
        <p className="text-base md:text-lg text-white/70 leading-relaxed">
          {content.loopShowcase.description}
        </p>
      </div>

      {/* Image area — blur placeholder until real image loads */}
      <div className="relative w-full aspect-[16/9] max-w-4xl mx-auto mb-8 rounded-2xl border-2 border-violet-500/60 shadow-violet-500/[0.12] overflow-hidden shadow-2xl">
        {slides.map((slide, idx) => {
          const Icon = ICONS[idx % ICONS.length]
          const isActive = idx === currentSlide
          const opacityCls = isActive && opacity === 1 ? 'opacity-100' : 'opacity-0'
          const hasImage = !!slide.imageSrc
          const isLoaded = !!loadedImages[idx]
          return (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-700 ${opacityCls}`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${GRADIENT} flex flex-col items-center justify-center gap-4 transition-[filter] duration-700 ${
                  hasImage && isLoaded ? 'blur-md' : ''
                }`}
              >
                <Icon className="w-24 h-24 text-violet-400 opacity-80" strokeWidth={1.5} />
                <p className="text-sm font-mono font-bold text-violet-400 uppercase tracking-widest opacity-70">
                  {slide.label}
                </p>
                {!hasImage && (
                  <p className="text-xs text-white/40 italic">placeholder — image coming soon</p>
                )}
              </div>
              {hasImage && isLoaded && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={slide.imageSrc}
                  alt={slide.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Step indicator: [‹] [dot] [progress line] [dot] [dot] [›] */}
      <div className="w-full max-w-4xl mx-auto mb-4 flex items-center gap-3">
        {blockCount > 1 && (
          <button
            type="button"
            aria-label="Previous 3 slides"
            onClick={() => shiftBlock(-1)}
            className="shrink-0 w-10 h-10 rounded-full border-2 border-white/30 bg-black text-white/70 hover:border-violet-500/70 hover:text-violet-300 transition-colors flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2} />
          </button>
        )}

        <div className="relative flex-1 h-12">
          <div className="absolute top-1/2 left-[60px] right-[60px] h-[2px] -translate-y-1/2 bg-white/20" />
          <div
            key={`progress-${blockIndex}`}
            className="absolute top-1/2 left-[60px] right-[60px] h-[2px] -translate-y-1/2 bg-violet-500 origin-left"
            style={{
              animation: `fractera-line-slide ${progressDurationSec}s linear infinite`,
              animationPlayState: isAnimating ? 'running' : 'paused',
            }}
          />
          {blockSlides.map((_, pos) => {
            const slideIdx = blockStart + pos
            const isActive = slideIdx === currentSlide
            return (
              <button
                key={slideIdx}
                type="button"
                aria-label={`Slide ${slideIdx + 1}${
                  isPausedByPress && isActive
                    ? ' (paused — release to resume)'
                    : ' (press and hold to pause)'
                }`}
                onPointerDown={(e) => { e.preventDefault(); handleCirclePointerDown(slideIdx) }}
                onPointerUp={handleCirclePointerUp}
                onPointerCancel={handleCirclePointerUp}
                onPointerLeave={handleCirclePointerUp}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 touch-none select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-full"
                style={{ left: getCircleLeft(pos) }}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2 ${
                    isActive
                      ? 'border-violet-500 bg-black text-violet-400 shadow-lg shadow-violet-500/40 scale-110'
                      : 'border-white/30 bg-black text-white/60 hover:border-white/60'
                  }`}
                >
                  {slideIdx + 1}
                </div>
              </button>
            )
          })}
        </div>

        {blockCount > 1 && (
          <button
            type="button"
            aria-label="Next 3 slides"
            onClick={() => shiftBlock(1)}
            className="shrink-0 w-10 h-10 rounded-full border-2 border-white/30 bg-black text-white/70 hover:border-violet-500/70 hover:text-violet-300 transition-colors flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Block index indicator */}
      {blockCount > 1 && (
        <div className="text-xs font-mono text-white/40 mb-4 tracking-widest">
          {blockIndex + 1} / {blockCount}
        </div>
      )}

      {/* Three columns — labels for current block. Active is sharp, others blurred. */}
      <div className="w-full max-w-4xl mx-auto px-4 mb-8">
        <div className="hidden md:flex justify-between gap-8">
          {blockSlides.map((slide, pos) => {
            const slideIdx = blockStart + pos
            return (
              <div
                key={slideIdx}
                className={`flex-1 text-center transition-all duration-300 ${
                  slideIdx === currentSlide ? 'opacity-100' : 'opacity-60 blur-sm'
                }`}
              >
                <h4 className="text-lg font-bold text-white mb-2">{slide.label}</h4>
                <p className="text-sm text-violet-400 leading-relaxed">{slide.sublabel}</p>
              </div>
            )
          })}
        </div>

        <div className="md:hidden text-center">
          <div className={`transition-opacity duration-700 ${opacity === 1 ? 'opacity-100' : 'opacity-0'}`}>
            <h4 className="text-lg font-bold text-white mb-2">{activeSlide.label}</h4>
            <p className="text-sm text-violet-400 leading-relaxed">{activeSlide.sublabel}</p>
          </div>
        </div>
      </div>

      {/* Active slide caption — title + description */}
      <div
        className={`text-center flex flex-col items-center gap-2 max-w-3xl transition-opacity duration-700 ${
          opacity === 1 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <h3 className="text-xl md:text-2xl font-bold text-white">{activeSlide.title}</h3>
        <p className="text-sm md:text-base text-white/70 leading-relaxed">{activeSlide.description}</p>
      </div>
    </section>
  )
}
