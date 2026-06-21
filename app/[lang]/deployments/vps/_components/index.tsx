import { Suspense } from 'react'
import { createContentPage } from '@/lib/content/create-content-page'
import { BRAND } from '@/lib/brand'
import { getContent } from '@/lib/i18n/content'
import { ContentProvider } from '@/components/content-provider'
import { PricingFlow } from '@/components/sections/pricing-flow'
import { PostBody } from '@/app/[lang]/blog/_components/post-body'
import { deploymentContent, deploymentFounderQuote } from '@/lib/deployments/post'
import { getDeploymentsUi } from '@/lib/deployments/ui'
import { data } from '../_data'

// Entry component for /deployments/vps (standard route shape: page.tsx is thin and
// re-exports this; composition + data wiring live here; page content lives in
// ../_data). Authoring is data-only — H1/SEO/blocks/faq are in ../_data/{en,ru}.ts,
// resolved via deploymentContent.
//
// VPS is the core product: the deploy form (the same PricingFlow section that lives
// on the homepage) is restored HERE via the `footer` slot, so it renders at the true
// page bottom — after the FAQ, below it the founder quote, and the back link last.
// `hideBackLink` suppresses the default mid-page back link so the footer owns it.

const page = createContentPage({
  resolve: lang => deploymentContent(data, lang),
  meta: {
    subPath: data.meta.subPath,
    ogImage: data.meta.ogImage,
    heroImage: data.meta.heroImage,
    tags: data.meta.tags,
  },
  chrome: (lang, c) => {
    const ui = getDeploymentsUi(lang)
    return {
      breadcrumbs: [
        { label: BRAND.name, href: `/${lang}` },
        { label: ui.breadcrumb, href: `/${lang}/deployments` },
        { label: c.title },
      ],
      backHref: `/${lang}/deployments`,
      backLabel: ui.backToHub,
    }
  },
  hideBackLink: true,
  footer: lang => {
    const ui = getDeploymentsUi(lang)
    const founderQuote = deploymentFounderQuote(data, lang)
    return (
      <>
        {/* Deploy form — the heart of the product. The same PricingFlow section as
            the homepage; #pricing inside it is the in-page CTA anchor. */}
        <section className="mt-12 flex flex-col items-center border-t border-white/10 pt-10">
          <ContentProvider value={getContent(lang)}>
            <Suspense fallback={null}>
              <PricingFlow />
            </Suspense>
          </ContentProvider>
        </section>

        {/* Founder quote — directly below the form. */}
        {founderQuote && (
          <div className="mt-10">
            <PostBody blocks={[{ kind: 'founder', text: founderQuote }]} lang={lang} />
          </div>
        )}

        {/* Back link — the true page bottom, below the form + founder quote. */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <a
            href={`/${lang}/deployments`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-400 hover:text-violet-300"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {ui.backToHub}
          </a>
        </div>
      </>
    )
  },
})

export const generateMetadata = page.generateMetadata
export default page.Page
