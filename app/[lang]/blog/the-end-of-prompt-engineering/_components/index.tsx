import { createContentPost } from '@/lib/content/create-content-post'
import { blogPost } from '@/lib/blog/post'
import { BRAND } from '@/lib/brand'
import { data } from '../_data'

// Entry for this blog post (format: 'blog'). Blog is EN-only, so resolve ignores
// lang; the URL still carries the lang segment for routing. Renders the co-located
// _data through the universal post factory + the shared StandardContentPage block.

const post = createContentPost({
  format: 'blog',
  subPath: `/blog/${data.slug}`,
  resolve: () => blogPost(data),
  chrome: (lang, p) => ({
    breadcrumbs: [
      { label: BRAND.name, href: `/${lang}` },
      { label: 'Blog', href: `/${lang}/blog` },
      { label: p.title },
    ],
    backHref: `/${lang}/blog`,
    backLabel: 'Back to all articles',
  }),
  titleSuffix: () => 'Fractera Blog',
})

export const generateMetadata = post.generateMetadata
export default post.Page
