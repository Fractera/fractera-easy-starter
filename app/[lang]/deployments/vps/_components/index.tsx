import { Suspense } from 'react'
import { createContentPage } from '@/lib/content/create-content-page'
import { BRAND } from '@/lib/brand'
import { getContent } from '@/lib/i18n/content'
import { ContentProvider } from '@/components/content-provider'
import { PricingFlow } from '@/components/sections/pricing-flow'
import { PostBody } from '@/components/content-page/post-body'
import { deploymentContent, deploymentFounderQuote } from '../../_lib/post'
import { getDeploymentsUi } from '../../_data'
import { data } from '../_data'

// Entry component for /deployments/vps (standard route shape: page.tsx is thin and
// re-exports this; composition + data wiring live here; page content lives in
// ../_data). Authoring is data-only — H1/SEO/blocks/faq are in ../_data/{en,ru}.ts,
// resolved via deploymentContent.
//
// VPS is the core product: the deploy form (the same PricingFlow section that lives
// on the homepage) is restored HERE, injected via the `sections` slot — the same
// open slot the local page uses for its sponsorship section. Sections render directly
// ABOVE the FAQ, so the FAQ stays the last section by template contract. The founder
// quote renders directly below the form.

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
  // Deploy form + founder quote, injected into the block above the FAQ (FAQ stays
  // last by contract). The form is the heart of the product: the same PricingFlow
  // section as the homepage; #pricing inside it is the in-page CTA anchor.
  sections: lang => {
    const founderQuote = deploymentFounderQuote(data, lang)
    return (
      <>
        <section className="mt-12 flex flex-col items-center border-t border-white/10 pt-10">
          <ContentProvider value={getContent(lang)}>
            <Suspense fallback={null}>
              <PricingFlow />
            </Suspense>
          </ContentProvider>
        </section>
        {founderQuote && (
          <div className="mt-10">
            <PostBody blocks={[{ kind: 'founder', text: founderQuote }]} lang={lang} />
          </div>
        )}
      </>
    )
  },
})

export const generateMetadata = page.generateMetadata
export default page.Page
