import { Suspense } from 'react'
import { AdminRedirect } from '@/components/admin-redirect'
import { getContent } from '@/lib/i18n/content'
import { ContentProvider } from '@/components/content-provider'
import { Hero } from '@/components/sections/hero'
import { UltimateScale } from '@/components/sections/ultimate-scale'
import { HERO_NARRATIVE_REGISTRY } from '@/lib/content/hero-narrative-registry'
import { LoopShowcase } from '@/components/sections/loop-showcase'
import { DoublePresentation } from '@/components/sections/double-presentation'
import { PlatformsGrid } from '@/components/sections/platforms-grid'
import { ProblemSection } from '@/components/sections/problem-section'
import { ConnectFramework } from '@/components/sections/connect-framework'
import { FeaturesGrid } from '@/components/sections/features-grid'
import { FractеraPromo } from '@/components/sections/fractera-promo'
import { FaqSection } from '@/components/sections/faq-section'
import { SponsorshipSection } from '@/components/sections/sponsorship-section'
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

  const content = getContent(lang)
  const HeroNarrative = HERO_NARRATIVE_REGISTRY[content.heroNarrativeVariant]

  return (
    <>
      <AdminRedirect />
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
              {/* The architecture CTA + reference-links block was removed here. The
                  single architecture-doc button now lives under the hero illustration
                  (in <Hero/>), pointing at /documentation/multi-agent-workspace-architecture. */}

              {/* Marketing funnel order: agitate the problem first, then reveal the
                  solution (infinite scale + 70–90% token savings), how it works, the
                  product depth (coding + platforms), the feature set, and finally the
                  framework breadth + the RU sovereignty narrative. The FAQ, Sponsors
                  and GitHub-promo blocks stay pinned to the very bottom. */}
              <div id="problem" className="w-full scroll-mt-16"><ProblemSection /></div>
              <UltimateScale />
              {/* The "Next.js Aircraft Carrier" deep-dive block moved off the homepage
                  to its own framework page (/framework/fractera-pro). */}
              <div id="ai-loop" className="w-full scroll-mt-16"><LoopShowcase /></div>
              <div id="ai-coding" className="w-full scroll-mt-16"><DoublePresentation /></div>
              <div id="platforms" className="w-full scroll-mt-16"><PlatformsGrid /></div>
              <div id="features" className="w-full scroll-mt-16"><FeaturesGrid /></div>
              {/* "Connect your framework" — the framework catalog grid. */}
              <div id="connect-framework" className="w-full scroll-mt-16"><ConnectFramework /></div>
              {/* Narrative slot — RU import-substitution (sovereignty differentiation);
                  EN 'none' renders nothing. */}
              {HeroNarrative && <HeroNarrative />}

              {/* Deploy form + MCP connector moved off the homepage to their own
                  pages (/deployments/vps and /deployments/mcp). The homepage no
                  longer carries the install form or any deploy CTA buttons. */}

              {/* Social proof, then the pinned bottom trio (cases → GitHub → sponsors → FAQ). */}
              <div id="cases" className="w-full flex justify-center scroll-mt-16">
                <FractеraTestimonial />
              </div>
              <FractеraPromo />
              <div id="sponsors" className="w-full scroll-mt-16">
                <Suspense fallback={null}><SponsorshipSection /></Suspense>
              </div>
              <div id="faq" className="mb-32 w-full scroll-mt-16"><FaqSection /></div>

            </section>
          </ContentProvider>
        </div>
      </main>
    </>
  )
}
