import { createContentPage } from '@/lib/content/create-content-page'
import { getDeploymentsLocal, deploymentsLocalMeta } from '@/lib/pages/deployments-local'
import { getDeploymentsUi } from '@/lib/deployments/ui'

// /deployments/local — the reference page built entirely through the shared
// factory. Authoring is data-only: H1/SEO/blocks/faq live in the per-language
// content module (lib/pages/deployments-local/{en,ru}.ts via resolveEntry); this
// route only wires that descriptor + the localized breadcrumb/back chrome into
// createContentPage. Adding another page = copy this file and point it at a new
// content module.

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
        { label: 'Fractera', href: `/${lang}` },
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
