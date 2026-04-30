'use client'

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
  },
  {
    number: 2,
    title: 'Paste the MCP URL',
    description: 'Name it "Fractera" and paste: https://fractera.ai/api/mcp',
    placeholder: 'Screenshot: Add connector dialog with URL field',
  },
  {
    number: 3,
    title: 'Type "install fractera"',
    description: 'Start a new chat and Claude will guide you through the whole process',
    placeholder: 'Screenshot: Claude chat with install fractera message',
  },
]

export function StepsCarousel() {
  return (
    <div className="w-full">
      <Carousel
        opts={{ align: 'start', loop: false }}
        className="w-full"
      >
        <CarouselContent>
          {STEPS.map((step) => (
            <CarouselItem key={step.number} className="md:basis-1/2 lg:basis-1/3">
              <Card className="bg-white/5 border-white/10 h-full">
                <CardContent className="p-0 flex flex-col h-full">
                  {/* Placeholder image area */}
                  <div className="aspect-video bg-white/5 rounded-t-xl flex items-center justify-center border-b border-white/10">
                    <p className="text-xs text-gray-600 text-center px-4">{step.placeholder}</p>
                  </div>
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
        <CarouselPrevious className="border-white/20 text-white hover:bg-white/10 hover:text-white -left-4" />
        <CarouselNext className="border-white/20 text-white hover:bg-white/10 hover:text-white -right-4" />
      </Carousel>
    </div>
  )
}
