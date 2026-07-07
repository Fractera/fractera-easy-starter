import { createContentPost } from '@/lib/content/create-content-post'
import { docPost } from '../../_lib/post'
import { getDocUi } from '../../_data'
import { BRAND } from '@/lib/brand'
import { data } from '../_data'

// Entry for this documentation page (format: 'document'). EN-only by construction:
// resolve(lang) returns the en base (EN fallback per key); chrome (breadcrumb/back/
// title/min-read) is localized via getDocUi.
const post = createContentPost({
  format: 'document',
  subPath: `/documentation/${data.meta.slug}`,
  resolve: lang => docPost(data, lang),
  chrome: (lang, p) => {
    const ui = getDocUi(lang)
    return {
      breadcrumbs: [
        { label: BRAND.name, href: `/${lang}` },
        { label: ui.breadcrumbDoc, href: `/${lang}/documentation` },
        { label: p.title },
      ],
      backHref: `/${lang}/documentation`,
      backLabel: ui.backToDoc,
    }
  },
  titleSuffix: lang => getDocUi(lang).titleSuffix,
  minLabel: lang => getDocUi(lang).minRead,
})

export const generateMetadata = post.generateMetadata
export default post.Page
