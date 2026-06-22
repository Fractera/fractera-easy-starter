import { Suspense } from 'react'
import { createContentPage } from '@/lib/content/create-content-page'
import { BRAND } from '@/lib/brand'
import { getContent } from '@/lib/i18n/content'
import { ContentProvider } from '@/components/content-provider'
import { PricingFlow } from '@/components/sections/pricing-flow'
import { PostBody } from '@/components/content-page/post-body'
import { frameworkContent, frameworkFounderQuote } from '../../_lib/post'
import { getFrameworkUi } from '../../_data'
import { data } from '../_data'

// Entry component for /framework/next-js (standard route shape: page.tsx is thin and
// re-exports this; composition + data wiring live here; page content lives in
// ../_data). Authoring is data-only — H1/SEO/blocks/faq are in ../_data/{en,ru}.ts,
// resolved via frameworkContent. SCAFFOLDING: the body is empty for now (content/SEO
// pass is a separate sub-step). The page still renders the full standard template —
// breadcrumbs, H1, the baked sponsorship section, and the founder quote.
//
// The universal deploy form (PricingFlow) is injected via the `sections` slot, made
// page-aware with `framework={{ id, name }}`: it weaves "Next.js" into the form H2,
// lists Next.js as the first feature, and pre-selects Next.js in the install
// dropdown. The founder quote renders below the form, last in the slot, so the
// canonical bottom order stays: form → founder → sponsors → FAQ → back link.

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
  // Deploy form (page-aware) + founder quote. The founder goes last in the slot so
  // it sits directly above the baked sponsorship section (FAQ stays last by contract).
  sections: lang => {
    const founderQuote = frameworkFounderQuote(data, lang)
    return (
      <>
        <section className="mt-12 flex flex-col items-center border-t border-white/10 pt-10">
          <ContentProvider value={getContent(lang)}>
            <Suspense fallback={null}>
              <PricingFlow framework={{ id: 'next', name: 'Next.js' }} />
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
