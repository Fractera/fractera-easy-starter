import { createContentPage } from '@/lib/content/create-content-page'
import { BRAND } from '@/lib/brand'
import { getContent } from '@/lib/i18n/content'
import { ContentProvider } from '@/components/content-provider'
import { PlatformSelector } from '@/components/platform-selector'
import { PostBody } from '@/app/[lang]/blog/_components/post-body'
import { deploymentContent, deploymentFounderQuote } from '@/lib/deployments/post'
import { getDeploymentsUi } from '@/lib/deployments/ui'
import { data } from '../_data'

// Entry component for /deployments/mcp (standard route shape: page.tsx is thin and
// re-exports this; composition + data wiring live here; page content lives in
// ../_data). Authoring is data-only — H1/SEO/blocks/faq are in ../_data/{en,ru}.ts,
// resolved via deploymentContent.
//
// The MCP connector UI (the same PlatformSelector section that lives on the homepage:
// the five agents + their subscriptions, the copyable MCP server URL, and the 10-step
// slider) is restored HERE via the `sections` slot. The founder quote goes last in
// the slot, so the bottom reads: connector → founder → sponsors → FAQ → back link.

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
  sections: lang => {
    const founderQuote = deploymentFounderQuote(data, lang)
    return (
      <>
        <section className="mt-12 border-t border-white/10 pt-10">
          <ContentProvider value={getContent(lang)}>
            <PlatformSelector />
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
