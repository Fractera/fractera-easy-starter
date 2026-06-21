import { createContentPost } from '@/lib/content/create-content-post'
import { docPost } from '@/lib/documentation/post'
import { BRAND } from '@/lib/brand'
import { data } from '../_data'

// Entry for this documentation page (format: 'document'). Docs are EN-only, so
// resolve ignores lang; the URL still carries the lang segment for routing.
const post = createContentPost({
  format: 'document',
  subPath: `/documentation/${data.slug}`,
  resolve: () => docPost(data),
  chrome: (lang, p) => ({
    breadcrumbs: [
      { label: BRAND.name, href: `/${lang}` },
      { label: 'Documentation', href: `/${lang}/documentation` },
      { label: p.title },
    ],
    backHref: `/${lang}/documentation`,
    backLabel: 'Back to all documentation',
  }),
  titleSuffix: () => 'Fractera Documentation',
})

export const generateMetadata = post.generateMetadata
export default post.Page
