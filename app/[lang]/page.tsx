import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getContent } from '@/lib/i18n/content'
import { ContentProvider } from '@/components/content-provider'
import { Hero } from '@/components/sections/hero'
import { ElonTrillion } from '@/components/sections/elon-trillion'
import { ImportSubstitution } from '@/components/sections/import-substitution'
import { LoopShowcase } from '@/components/sections/loop-showcase'
import { DoublePresentation } from '@/components/sections/double-presentation'
import { PlatformsGrid } from '@/components/sections/platforms-grid'
import { ProblemSection } from '@/components/sections/problem-section'
import { PricingFlow } from '@/components/sections/pricing-flow'
import { PlatformSelector } from '@/components/platform-selector'
import { DeployButton } from '@/components/deploy-button'
import { FeaturesGrid } from '@/components/sections/features-grid'
import { FractеraPromo } from '@/components/sections/fractera-promo'
import { FaqSection } from '@/components/sections/faq-section'
import { SponsorshipSection } from '@/components/sections/sponsorship-section'
import { CompanyBrainSection } from '@/components/sections/company-brain'
import { FractеraTestimonial } from '@/components/sections/testimonial'

/* FAQ JSON-LD disabled — do NOT delete, re-enable later. Commented out so it is
   not emitted to production on the next deployment.
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
*/

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
      {/* FAQ JSON-LD disabled — do NOT delete, re-enable later (kept out of prod).
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema(lang)) }}
      />
      */}
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-5xl mx-auto px-6 pb-20">
          <ContentProvider value={content}>
            <section className="flex flex-col gap-32 items-start w-full">

              <div id="hero" className="w-full scroll-mt-16"><Hero /></div>
              {lang === 'ru' ? <ImportSubstitution /> : <ElonTrillion />}
              <DeployButton caption={content.deployCaptions?.afterHero} />
              <div id="ai-loop" className="w-full scroll-mt-16"><LoopShowcase /></div>
              <DeployButton caption={content.deployCaptions?.afterLoop} />
              <div id="ai-coding" className="w-full scroll-mt-16"><DoublePresentation /></div>
              <DeployButton caption={content.deployCaptions?.afterPresentation} />
              <div id="platforms" className="w-full scroll-mt-16"><PlatformsGrid /></div>
              <DeployButton caption={content.deployCaptions?.afterPlatforms} />
              <div id="problem" className="w-full scroll-mt-16"><ProblemSection /></div>
              <DeployButton caption={content.deployCaptions?.afterProblem} />

              <div id="pricing" className="w-full scroll-mt-16">
                <Suspense fallback={null}>
                  <PricingFlow />
                </Suspense>
              </div>

              <div className="w-full max-w-4xl">
                <PlatformSelector />
              </div>

              <div id="features" className="w-full scroll-mt-16"><FeaturesGrid /></div>
              <DeployButton caption={content.deployCaptions?.afterFeatures} />
              <FractеraPromo />
              <CompanyBrainSection />
              <DeployButton caption={content.deployCaptions?.afterBrain} />
              <div id="sponsors" className="w-full scroll-mt-16"><SponsorshipSection /></div>
              <DeployButton caption={content.deployCaptions?.afterSponsors} />
              <div id="faq" className="w-full scroll-mt-16"><FaqSection /></div>
              <DeployButton caption={content.deployCaptions?.afterFaq} />

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
