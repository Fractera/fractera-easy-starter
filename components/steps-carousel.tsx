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

const STEPS = [
  {
    number: 1,
    title: 'Open claude.ai Settings',
    description: 'Go to Settings → Integrations → Add custom connector',
    placeholder: 'Screenshot: claude.ai Settings → Integrations',
    image: '/screenshots/step-1.png',
  },
  {
    number: 2,
    title: 'Paste the MCP URL',
    description: 'Name it "Fractera" and paste: https://fractera.ai/api/mcp',
    placeholder: 'Screenshot: Add connector dialog with URL field',
    image: '/screenshots/step-2.png',
  },
  {
    number: 3,
    title: 'Type "install fractera"',
    description: 'Start a new chat and Claude will guide you through the whole process',
    placeholder: 'Screenshot: Claude chat with install fractera message',
    image: '/screenshots/step-3.png',
  },
]

type Step = typeof STEPS[number]

function Lightbox({ step, onClose }: { step: Step; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden w-full max-w-[400px] max-h-[90vh]"
        style={{ width: 'min(400px, 100vw - 32px)', maxHeight: 'min(600px, 90vh)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>

        {/* Image / placeholder */}
        <div className="w-full h-[300px] bg-white/5 flex items-center justify-center">
          <p className="text-xs text-gray-600 text-center px-6">{step.placeholder}</p>
        </div>

        {/* Text */}
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

export function StepsCarousel() {
  const [activeStep, setActiveStep] = useState<Step | null>(null)

  return (
    <>
      <div className="w-full px-14">
        <Carousel opts={{ align: 'start', loop: false }} className="w-full">
          <CarouselContent>
            {STEPS.map((step) => (
              <CarouselItem key={step.number} className="md:basis-1/2 lg:basis-1/3">
                <Card className="bg-white/5 border-white/10 h-full">
                  <CardContent className="p-0 flex flex-col h-full">
                    {/* Clickable image area */}
                    <button
                      onClick={() => setActiveStep(step)}
                      className="aspect-video bg-white/5 rounded-t-xl flex items-center justify-center border-b border-white/10 w-full cursor-zoom-in hover:bg-white/10 transition-colors"
                    >
                      <p className="text-xs text-gray-600 text-center px-4">{step.placeholder}</p>
                    </button>
                    {/* Text */}
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
          <CarouselPrevious className="w-10 h-10 -left-12 border-white/20 text-white hover:bg-white/10 hover:text-white" />
          <CarouselNext className="w-10 h-10 -right-12 border-white/20 text-white hover:bg-white/10 hover:text-white" />
        </Carousel>
      </div>

      {activeStep && <Lightbox step={activeStep} onClose={() => setActiveStep(null)} />}
    </>
  )
}
