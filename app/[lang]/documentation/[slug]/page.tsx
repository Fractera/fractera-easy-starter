import { createContentPost } from '@/lib/content/create-content-post'
import { getAllDocs, getDoc } from '@/lib/documentation'

// Documentation route — built through the universal post factory (format:
// 'document'). Docs are EN-only, so `resolve` ignores `lang` and returns the same
// entry; the URL still carries the lang segment for routing/hreflang. The shared
// StandardContentPage block renders the chrome; only the doc-specific bits
// (TechArticle JSON-LD, Person author, responsive-picture hero) are supplied here.

const post = createContentPost({
  format: 'document',
  basePath: '/documentation',
  getAllSlugs: () => getAllDocs().map(d => d.slug),
  resolve: (_lang, slug) => {
    const doc = getDoc(slug)
    if (!doc) return undefined
    return {
      title: doc.title,
      subtitle: doc.description,
      description: doc.description,
      tags: doc.tags,
      date: doc.date,
      readingMinutes: doc.readingMinutes,
      blocks: doc.blocks,
      faq: doc.faq,
      ogImage: doc.image?.web,
      inLanguage: 'en',
      hero: doc.image ? (
        <figure className="my-8">
          <picture>
            <source media="(min-width: 768px)" srcSet={doc.image.web} />
            <img
              src={doc.image.mobile}
              alt={doc.image.alt}
              loading="eager"
              className="w-full rounded-2xl border border-white/10 bg-white"
            />
          </picture>
        </figure>
      ) : undefined,
    }
  },
  titleSuffix: () => 'Fractera Documentation',
  breadcrumbLabel: () => 'Documentation',
  backLabel: () => 'Back to all documentation',
})

export const generateStaticParams = post.generateStaticParams
export const generateMetadata = post.generateMetadata
export default post.Page
