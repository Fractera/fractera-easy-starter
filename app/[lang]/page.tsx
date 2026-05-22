import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getContent } from '@/lib/i18n/content'
import { ContentProvider } from '@/components/content-provider'
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
import { SponsorshipSection } from '@/components/sections/sponsorship-section'
import { BlackBoxSection } from '@/components/sections/black-box'
import { FractеraTestimonial } from '@/components/sections/testimonial'

function buildFaqSchema(lang: string) {
  const content = getContent(lang)
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqItems.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: [
          ...item.a,
          ...(item.bullets ?? []),
          ...(item.steps ?? []),
          ...(item.trail ?? []),
        ].join(' '),
      },
    })),
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  const session = await auth()
  if (session?.user?.email === 'admin@fractera.ai') {
    redirect('/admin')
  }

  const content = getContent(lang)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema(lang)) }}
      />
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-5xl mx-auto px-6 pb-20">
          <ContentProvider value={content}>
            <section className="flex flex-col gap-32 items-start w-full">

              <div id="hero" className="w-full scroll-mt-16"><Hero /></div>
              <div id="ai-loop" className="w-full scroll-mt-16"><LoopShowcase /></div>
              <div id="ai-coding" className="w-full scroll-mt-16"><DoublePresentation /></div>
              <div id="platforms" className="w-full scroll-mt-16"><PlatformsGrid /></div>
              <div id="problem" className="w-full scroll-mt-16"><ProblemSection /></div>

              <div id="pricing" className="w-full scroll-mt-16">
                <Suspense fallback={null}>
                  <PricingFlow />
                </Suspense>
              </div>

              <div className="w-full max-w-4xl">
                <PlatformSelector />
              </div>

              <div id="features" className="w-full scroll-mt-16"><FeaturesGrid /></div>
              <FractеraPromo />
              <BlackBoxSection />
              <div id="sponsors" className="w-full scroll-mt-16"><SponsorshipSection /></div>
              <div id="faq" className="w-full scroll-mt-16"><FaqSection /></div>

              <div id="cases" className="mb-32 w-full flex justify-center scroll-mt-16">
                <FractеraTestimonial />
              </div>

            </section>
          </ContentProvider>
        </div>
      </main>
    </>
  )
}
