import { createContentPage } from '@/lib/content/create-content-page'
import { BRAND } from '@/lib/brand'
import { getDeploymentsLocal, deploymentsLocalMeta } from '../_data'
import { getDeploymentsUi } from '@/lib/deployments/ui'

// Entry component for /deployments/local (the standard route shape: page.tsx is
// thin and re-exports this; presentation/composition + data wiring live here in
// _components; page content lives in ../_data). Authoring is data-only — H1/SEO/
// blocks/faq are in ../_data/{en,ru}.ts via resolveEntry; this entry only wires
// that descriptor + the localized breadcrumb/back chrome into createContentPage.
// Adding another page = copy the whole route folder (page.tsx + _components/ +
// _data/) and edit the data. Deleting a page = delete the folder; route, data
// and components go together.

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
})

export const generateMetadata = page.generateMetadata
export default page.Page
