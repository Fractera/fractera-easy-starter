import { createContentPage } from '@/lib/content/create-content-page'
import { BRAND } from '@/lib/brand'
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
// The founder quote is injected via the `sections` slot (same pattern as
// /deployments/vps), so it renders directly ABOVE the baked sponsorship section. The
// canonical bottom order stays: founder → sponsors → FAQ → back link.

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
  // Founder quote ("Roma Armstrong content"), injected last in the slot so it sits
  // directly above the baked sponsorship section (FAQ stays last by contract).
  sections: lang => {
    const founderQuote = frameworkFounderQuote(data, lang)
    if (!founderQuote) return null
    return (
      <div className="mt-12 border-t border-white/10 pt-10">
        <PostBody blocks={[{ kind: 'founder', text: founderQuote }]} lang={lang} />
      </div>
    )
  },
})

export const generateMetadata = page.generateMetadata
export default page.Page
