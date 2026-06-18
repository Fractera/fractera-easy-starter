import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getContent } from '@/lib/i18n/content'
import { ContentProvider } from '@/components/content-provider'
import { Hero } from '@/components/sections/hero'
import { UltimateScale } from '@/components/sections/ultimate-scale'
import { AircraftCarrier } from '@/components/sections/aircraft-carrier'
import { ElonTrillion } from '@/components/sections/elon-trillion'
import { ImportSubstitution } from '@/components/sections/import-substitution'
import { LoopShowcase } from '@/components/sections/loop-showcase'
import { DoublePresentation } from '@/components/sections/double-presentation'
import { PlatformsGrid } from '@/components/sections/platforms-grid'
import { ProblemSection } from '@/components/sections/problem-section'
import { PricingFlow } from '@/components/sections/pricing-flow'
import { ConnectFramework } from '@/components/sections/connect-framework'
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
              {(content.architectureCta || content.referenceLinks) && (
                <div className="w-full flex flex-col items-center gap-3">
                  {content.architectureCta && (
                    <a
                      href="/ai-workspace-architect"
                      className="inline-flex items-center gap-2 rounded-xl border border-violet-500/50 bg-violet-500/[0.06] px-6 py-3 text-sm font-semibold text-violet-200 hover:bg-violet-500/[0.12] transition-colors"
                    >
                      {content.architectureCta}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                  )}
                  {content.referenceLinks && (
                    <p className="w-full text-center text-sm text-white/60">
                      {content.referenceLinks.intro}{' '}
                      <a href="/ai-workspace-architect" className="font-medium text-violet-300 underline hover:text-violet-200">{content.referenceLinks.architecture}</a>
                      {' · '}
                      <a href="/mcp-info" className="font-medium text-violet-300 underline hover:text-violet-200">{content.referenceLinks.knowledgeBase}</a>
                      {' · '}
                      <a href="/ai-development-loop" className="font-medium text-violet-300 underline hover:text-violet-200">{content.referenceLinks.developmentLoop}</a>
                    </p>
                  )}
                </div>
              )}
              <UltimateScale />
              <DeployButton caption={content.deployCaptions?.afterUltimateScale} />
              <div id="aircraft-carrier-wrap" className="w-full scroll-mt-16"><AircraftCarrier /></div>
              <DeployButton caption={content.deployCaptions?.afterAircraftCarrier} />
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

              {/* "Connect your framework" — reframes the product from "we deploy a
                  50k-line Next app" to "deploy a starter of ANY framework (or any
                  public repo)". Placed directly under the pricing/deploy block. */}
              <div id="connect-framework" className="w-full scroll-mt-16"><ConnectFramework /></div>

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
