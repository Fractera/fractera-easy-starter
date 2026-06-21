import { Suspense } from 'react'
import { createContentPage } from '@/lib/content/create-content-page'
import { BRAND } from '@/lib/brand'
import { getContent } from '@/lib/i18n/content'
import { ContentProvider } from '@/components/content-provider'
import { SponsorshipSection } from '@/components/sections/sponsorship-section'
import { getDeploymentsLocal, deploymentsLocalMeta } from '../_data'
import { getDeploymentsUi } from '@/lib/deployments/ui'

// Entry component for /deployments/local (the standard route shape: page.tsx is
// thin and re-exports this; presentation/composition + data wiring live here in
// _components; page content lives in ../_data). Authoring is data-only — H1/SEO/
// blocks/faq are in ../_data/{en,ru}.ts via resolveEntry; this entry only wires
// that descriptor + the localized breadcrumb/back chrome into createContentPage.
//
// Sections are injected HERE, not baked into the block: `sections` passes the
// sponsorship section into the block's open slot, rendered directly above the FAQ
// (the FAQ stays the last section by contract). Other pages can pass other
// sections — or none.

const page = createContentPage({
  resolve: getDeploymentsLocal,
  meta: {
    subPath: deploymentsLocalMeta.subPath,
    ogImage: deploymentsLocalMeta.ogImage,
    heroImage: deploymentsLocalMeta.heroImage,
    tags: deploymentsLocalMeta.tags,
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
  // Sponsorship section, injected into the block above the FAQ.
  sections: (lang) => (
    <section className="mt-12 border-t border-white/10 pt-10">
      <ContentProvider value={getContent(lang)}>
        <Suspense fallback={null}>
          <SponsorshipSection />
        </Suspense>
      </ContentProvider>
    </section>
  ),
})

export const generateMetadata = page.generateMetadata
export default page.Page
