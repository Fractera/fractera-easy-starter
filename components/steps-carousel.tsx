'use client'

import { useState } from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Card, CardContent } from '@/components/ui/card'
import { SLIDES, type Slide } from '@/slides.config'

type Step = Slide

function Lightbox({ step, onClose }: { step: Step; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden"
        style={{ width: 'min(400px, 100vw - 32px)', maxHeight: 'min(600px, 90vh)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
        <div className="w-full h-[300px] bg-white/5 flex items-center justify-center">
          <p className="text-xs text-gray-600 text-center px-6">{step.title}</p>
        </div>
        <div className="p-5 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white shrink-0">
              {step.number}
            </span>
            <h3 className="font-semibold text-white text-sm">{step.title}</h3>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">{step.description}</p>
        </div>
      </div>
    </div>
  )
}

const btnBase: React.CSSProperties = {
  width: 40,
  height: 40,
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.2)',
  color: 'white',
  transition: 'background 0.15s, color 0.15s, transform 0.1s',
  transform: 'translateY(-50%)',
}

function CarouselBtn({ children, onClick, style }: {
  children: React.ReactNode
  onClick?: () => void
  style?: React.CSSProperties
}) {
  const [pressed, setPressed] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.background = 'white'
        el.style.color = 'black'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.background = 'transparent'
        el.style.color = 'white'
        el.style.transform = (style?.transform ?? 'translateY(-50%)')
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = (style?.transform ?? 'translateY(-50%)') + ' scale(1.1)'
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = (style?.transform ?? 'translateY(-50%)')
      }}
      style={{ ...btnBase, ...style }}
      className="absolute rounded-full flex items-center justify-center"
    >
      {children}
    </button>
  )
}

export function StepsCarousel() {
  const [activeStep, setActiveStep] = useState<Step | null>(null)

  return (
    <>
      <div className="w-full px-14">
        <Carousel opts={{ align: 'start', loop: false }} className="w-full">
          <CarouselContent>
            {SLIDES.map((step) => (
              <CarouselItem key={step.number} className="md:basis-1/2 lg:basis-1/3">
                <Card className="bg-white/5 border-white/10 h-full">
                  <CardContent className="p-0 flex flex-col h-full">
                    <button
                      onClick={() => setActiveStep(step)}
                      className="aspect-video bg-white/5 rounded-t-xl flex items-center justify-center border-b border-white/10 w-full cursor-zoom-in hover:bg-white/10 transition-colors"
                    >
                      <p className="text-xs text-gray-600 text-center px-4">{step.title}</p>
                    </button>
                    <div className="p-5 flex flex-col gap-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white shrink-0">
                          {step.number}
                        </span>
                        <h3 className="font-semibold text-white text-sm">{step.title}</h3>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">{step.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="w-10 h-10 -left-12 bg-transparent border-white/20 text-white hover:bg-white hover:text-black active:!translate-y-[-50%] active:scale-110" />
          <CarouselNext className="w-10 h-10 -right-12 bg-transparent border-white/20 text-white hover:bg-white hover:text-black active:!translate-y-[-50%] active:scale-110" />
        </Carousel>
      </div>

      {activeStep && <Lightbox step={activeStep} onClose={() => setActiveStep(null)} />}
    </>
  )
}
