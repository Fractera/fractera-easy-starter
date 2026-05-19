'use client'

import { Suspense } from 'react'
import { HeroContentCtx } from '@/lib/i18n/context'
import { getContent } from '@/lib/i18n/content'
import { Hero } from '@/components/sections/hero'
import { LoopShowcase } from '@/components/sections/loop-showcase'
import { DoublePresentation } from '@/components/sections/double-presentation'
import { PlatformsGrid } from '@/components/sections/platforms-grid'
import { ProblemSection } from '@/components/sections/problem-section'
import { PricingFlow } from '@/components/sections/pricing-flow'
import { PlatformSelector } from '@/components/platform-selector'
import { FeaturesGrid } from '@/components/sections/features-grid'
import { FractеraPromo } from '@/components/sections/fractera-promo'
import { FaqSection } from '@/components/sections/faq-section'
import { FractеraTestimonial } from '@/components/sections/testimonial'

export function HomeContent({ lang }: { lang: string }) {
  const content = getContent(lang)

  return (
    <HeroContentCtx.Provider value={content}>
      <section className="flex flex-col gap-32 items-start w-full">
        <Hero />
        <LoopShowcase />
        <DoublePresentation />
        <PlatformsGrid />
        <ProblemSection />
        <Suspense fallback={null}>
          <PricingFlow />
        </Suspense>
        <div className="w-full max-w-4xl">
          <PlatformSelector />
        </div>
        <FeaturesGrid />
        <FractеraPromo />
        <FaqSection />
        <div className="mb-32 w-full flex justify-center">
          <FractеraTestimonial />
        </div>
      </section>
    </HeroContentCtx.Provider>
  )
}
