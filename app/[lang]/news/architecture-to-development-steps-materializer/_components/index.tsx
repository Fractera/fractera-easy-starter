import { createContentPost } from '@/lib/content/create-content-post'
import { newsPost } from '@/lib/news/post'
import { getNewsUi } from '@/lib/news/ui'
import { BRAND } from '@/lib/brand'
import { data } from '../_data'

// Entry for this news post (format: 'news'). Renders the co-located _data through
// the universal post factory + the shared StandardContentPage block.
const post = createContentPost({
  format: 'news',
  subPath: `/news/${data.meta.slug}`,
  resolve: lang => newsPost(data, lang),
  chrome: (lang, p) => {
    const ui = getNewsUi(lang)
    return {
      breadcrumbs: [
        { label: BRAND.name, href: `/${lang}` },
        { label: ui.breadcrumbNews, href: `/${lang}/news` },
        { label: p.title },
      ],
      backHref: `/${lang}/news`,
      backLabel: ui.backToNews,
    }
  },
  titleSuffix: lang => getNewsUi(lang).titleSuffix,
  minLabel: lang => getNewsUi(lang).minRead,
})

export const generateMetadata = post.generateMetadata
export default post.Page
