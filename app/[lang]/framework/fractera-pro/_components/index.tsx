import { Suspense } from 'react'
import { createContentPage } from '@/lib/content/create-content-page'
import { BRAND } from '@/lib/brand'
import { getContent } from '@/lib/i18n/content'
import { ContentProvider } from '@/components/content-provider'
import { PricingFlow } from '@/components/sections/pricing-flow'
import { FrameworkFeedbackCta } from '@/components/framework-feedback-cta'
import { PostBody } from '@/components/content-page/post-body'
import { AircraftCarrierDemo } from '@/components/sections/aircraft-carrier/demo'
import { AircraftCarrierManifesto } from '@/components/sections/aircraft-carrier/manifesto'
import { frameworkContent, frameworkFounderQuote } from '../../_lib/post'
import { getFrameworkUi } from '../../_data'
import { data } from '../_data'

// Entry for /framework/fractera-pro — STANDARD co-located page (CONTENT-I18N-
// ARCHITECTURE-STANDARD §7.6/§7.8): thin page.tsx + this entry + own ../_data. It
// calls createContentPage DIRECTLY (the same path as /deployments/vps), NOT the
// shared createFrameworkPage factory — every entity the page needs lives in its own
// folder. The other 33 framework pages still use the factory until they are
// refactored one by one; the factory duplication stays for now by design.
//
// Page-specific sections injected into the open slot (above the FAQ), in order:
//   1. AircraftCarrierDemo  — animated parallel-routing demo (directly above the form)
//   2. PricingFlow          — the universal deploy form, page-aware (Fractera Pro)
//   3. FrameworkFeedbackCta  — framework-expert feedback card → Resend
//   4. founder quote        — Roma Armstrong (PostBody founder block)
//   5. AircraftCarrierManifesto — the "largest Next.js starter" manifesto card
// Canonical bottom order: demo → form → feedback → founder → manifesto → sponsors
// (baked) → FAQ → back link.

const FW = { id: 'fractera-pro' as const, name: 'Fractera Pro' }

const page = createContentPage({
  resolve: lang => frameworkContent(data, lang),
  meta: {
    subPath: data.meta.subPath,
    ogImage: data.meta.ogImage,
    heroImage: data.meta.heroImage,
    tags: data.meta.tags,
  },
  chrome: (lang, c) => {
    const ui = getFrameworkUi(lang)
    return {
      breadcrumbs: [
        { label: BRAND.name, href: `/${lang}` },
        { label: ui.breadcrumb, href: `/${lang}/framework` },
        { label: c.title },
      ],
      backHref: `/${lang}/framework`,
      backLabel: ui.backToHub,
    }
  },
  // Top-of-page CTA (under the H1/description separator), centered, thin border,
  // scrolls to the deploy form (#pricing) — same as every framework page.
  hero: lang => {
    const label = getFrameworkUi(lang).deployCta.replaceAll('{framework}', FW.name)
    return (
      <div className="mt-8 flex justify-center">
        <a
          href="#pricing"
          className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-500/[0.04] px-6 py-3 text-sm font-semibold text-violet-200 transition-colors hover:border-violet-400/70 hover:bg-violet-500/[0.10]"
        >
          {label}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
        </a>
      </div>
    )
  },
  sections: lang => {
    const founderQuote = frameworkFounderQuote(data, lang)
    return (
      <ContentProvider value={getContent(lang)}>
        <section className="mt-12 border-t border-white/10 pt-10">
          <AircraftCarrierDemo />
        </section>
        <section className="mt-12 flex flex-col items-center border-t border-white/10 pt-10">
          <Suspense fallback={null}>
            <PricingFlow framework={FW} />
          </Suspense>
        </section>
        <div className="mt-10">
          <FrameworkFeedbackCta lang={lang} framework={FW.name} strings={getContent(lang).frameworkFeedback} />
        </div>
        {founderQuote && (
          <div className="mt-10">
            <PostBody blocks={[{ kind: 'founder', text: founderQuote }]} lang={lang} />
          </div>
        )}
        <section className="mt-10">
          <AircraftCarrierManifesto />
        </section>
      </ContentProvider>
    )
  },
})

export const generateMetadata = page.generateMetadata
export default page.Page
