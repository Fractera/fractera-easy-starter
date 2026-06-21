import { createContentPage } from '@/lib/content/create-content-page'
import { BRAND } from '@/lib/brand'
import { deploymentContent } from '@/lib/deployments/post'
import { getDeploymentsUi } from '@/lib/deployments/ui'
import { data } from '../_data'

// Entry component for /deployments/mcp (standard route shape: page.tsx is thin and
// re-exports this; composition + data wiring live here; page content lives in
// ../_data). Authoring is data-only — H1/SEO/blocks/faq are in ../_data/{en,ru}.ts,
// resolved via deploymentContent. This entry only wires that descriptor + the
// localized breadcrumb/back chrome into createContentPage.

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
})

export const generateMetadata = page.generateMetadata
export default page.Page
