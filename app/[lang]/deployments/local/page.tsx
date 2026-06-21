import { createContentPage } from '@/lib/content/create-content-page'
import { getDeploymentsLocal, deploymentsLocalMeta } from './_data'
import { getDeploymentsUi } from '@/lib/deployments/ui'

// /deployments/local — the reference page built entirely through the shared
// factory. Authoring is data-only: H1/SEO/blocks/faq live in the co-located
// per-language content module (./_data/{en,ru}.ts via resolveEntry); this route
// only wires that descriptor + the localized breadcrumb/back chrome into
// createContentPage. Adding another page = copy this whole folder (page.tsx +
// _data/) and edit the data. Deleting a page = delete the folder; route, data
// (and any _components) go with it.

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
