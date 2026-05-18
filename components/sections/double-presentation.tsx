'use client'

import { useState, useEffect } from 'react'
import { useHeroContent } from '@/lib/i18n/context'

type DpItem = { imageSrc: string; title: string; description: string }

export function DoublePresentation() {
  const content = useHeroContent()
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const [activeContainer, setActiveContainer] = useState<'left' | 'right'>('left')
  const [sliderKey, setSliderKey] = useState(0)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (isMobile) return
    let sliderTimer: ReturnType<typeof setTimeout>
    let transitionTimer: ReturnType<typeof setTimeout>
    const startCycle = () => {
      setSliderKey(k => k + 1)
      sliderTimer = setTimeout(() => {
        setActiveContainer(a => a === 'left' ? 'right' : 'left')
        transitionTimer = setTimeout(startCycle, 500)
      }, 9000)
    }
    startCycle()
    return () => { clearTimeout(sliderTimer); clearTimeout(transitionTimer) }
  }, [isMobile])

  if (isMobile === null) return null

  const renderDesktopCard = (item: DpItem, side: 'left' | 'right') => {
    const isActive = activeContainer === side
    return (
      <div
        style={{ flex: isActive ? '7 1 0%' : '3 1 0%', transition: 'flex 0.5s ease' }}
        className="relative flex flex-col rounded-lg overflow-hidden text-white shadow-lg h-[30rem] flex-shrink-0"
      >
        <div className="relative w-full h-60 mb-4 rounded-xl overflow-hidden border-4 border-gray-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imageSrc} alt={item.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col pt-6">
          <h2 className="text-2xl font-bold mb-2 whitespace-nowrap overflow-hidden text-ellipsis">{item.title}</h2>
          <div className="relative w-full h-px bg-gray-700 mb-4">
            <div
              key={`slider-${side}-${sliderKey}`}
              className="absolute top-0 left-0 h-full bg-violet-500"
              style={{ animation: isActive ? 'sliderProgress 9s linear forwards' : 'none', width: isActive ? undefined : '0%' }}
            />
          </div>
          <p className="text-white/60 text-sm line-clamp-4 min-h-[4rem]">{item.description}</p>
        </div>
      </div>
    )
  }

  const renderMobileCard = (item: DpItem) => (
    <div className="relative flex flex-col rounded-xl bg-gray-900 text-white shadow-lg mb-6 overflow-hidden">
      <div className="w-full relative" style={{ paddingTop: '56.25%' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.imageSrc} alt={item.title} className="absolute inset-0 w-full h-full object-cover rounded-t-xl" />
      </div>
      <div className="flex flex-col p-4">
        <h2 className="text-xl font-bold mb-2">{item.title}</h2>
        <p className="text-gray-300 text-base min-h-16">{item.description}</p>
      </div>
    </div>
  )

  const header = (
    <div className="flex flex-col gap-3 items-start text-left md:items-center md:text-center">
      <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{content.dpHeader.label}</p>
      <h2 className="max-w-3xl font-serif font-bold leading-tight text-white text-2xl md:text-3xl lg:text-4xl">
        {content.dpHeader.h2}
      </h2>
      <p className="max-w-2xl text-base text-white/60 leading-relaxed">{content.dpHeader.description}</p>
    </div>
  )

  const featureBlocks = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full pt-4">
      {content.featureItems.slice(0, 3).map(({ title, text }, i) => (
        <div key={i} className="flex flex-col items-center text-center md:items-start md:text-left">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          <p className="mb-4 text-base text-white/50 min-h-[1.5rem]" />
          <div className="mb-4 h-px w-16 bg-violet-500" />
          <p className="text-[15px] text-white/80 leading-relaxed">{text}</p>
        </div>
      ))}
    </div>
  )

  if (isMobile) {
    return (
      <div className="w-full max-w-4xl flex flex-col gap-6">
        {header}
        {renderMobileCard(content.dpLeft)}
        {renderMobileCard(content.dpRight)}
        {featureBlocks}
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl flex flex-col items-center gap-12">
      {header}
      <div className="flex gap-6 w-full">
        {renderDesktopCard(content.dpLeft, 'left')}
        {renderDesktopCard(content.dpRight, 'right')}
      </div>
      {featureBlocks}
    </div>
  )
}
