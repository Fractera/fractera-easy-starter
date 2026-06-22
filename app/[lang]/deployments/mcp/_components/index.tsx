import { createContentPage } from '@/lib/content/create-content-page'
import { BRAND } from '@/lib/brand'
import { getContent } from '@/lib/i18n/content'
import { ContentProvider } from '@/components/content-provider'
import { PlatformSelector } from '@/components/platform-selector'
import { McpStepSlider } from '@/components/mcp-step-slider'
import { PostBody } from '@/components/content-page/post-body'
import { deploymentContent, deploymentFounderQuote } from '../../_lib/post'
import { getDeploymentsUi } from '../../_data'
import { data } from '../_data'

// Entry component for /deployments/mcp (standard route shape: page.tsx is thin and
// re-exports this; composition + data wiring live here; page content lives in
// ../_data). Authoring is data-only — H1/SEO/blocks/faq are in ../_data/{en,ru}.ts,
// resolved via deploymentContent.
//
// The step-by-step carousel is the page HERO (top, under the H1) — its first frame is
// also the social snippet (meta.ogImage). The MCP connector details (the five agents +
// subscriptions + the copyable server URL) render lower via the `sections` slot using
// PlatformSelector with showSlider={false} (the slider is already at the top). The
// founder quote goes last in the slot: hero carousel → … → connector → founder →
// sponsors → FAQ → back link.

const page = createContentPage({
  resolve: lang => deploymentContent(data, lang),
  meta: {
    subPath: data.meta.subPath,
    ogImage: data.meta.ogImage,
    tags: data.meta.tags,
  },
  // Hero = the step-by-step carousel at the top, in place of a static image.
  hero: lang => (
    <div className="my-8">
      <ContentProvider value={getContent(lang)}>
        <McpStepSlider />
      </ContentProvider>
    </div>
  ),
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
            <PlatformSelector showSlider={false} />
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
