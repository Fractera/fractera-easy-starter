import { createContentPost } from '@/lib/content/create-content-post'
import { getAllArticles, getArticle, resolveArticle } from '@/lib/news'
import { getNewsUi } from '@/lib/news/ui'

// News article route — built through the universal post factory (format: 'news').
// News is per-language: `resolve` runs resolveArticle(article, lang) so the H1/
// SEO/blocks/faq come from the article's base-en + per-language override. The
// shared StandardContentPage block renders the chrome; only the news-specific
// bits (NewsArticle JSON-LD, Person author, localized labels, image hero) are
// supplied here.

const post = createContentPost({
  format: 'news',
  basePath: '/news',
  getAllSlugs: () => getAllArticles().map(a => a.slug),
  resolve: (lang, slug) => {
    const article = getArticle(slug)
    if (!article) return undefined
    const r = resolveArticle(article, lang)
    return {
      title: r.title,
      seoTitle: r.seoTitle,
      subtitle: r.subtitle,
      description: r.description,
      keywords: r.keywords,
      tags: article.tags,
      date: article.date,
      readingMinutes: article.readingMinutes,
      authorName: article.author?.name,
      blocks: r.blocks,
      faq: r.faq,
      ogImage: article.ogImage,
      inLanguage: lang,
      hero: article.heroImage ? (
        <figure className="my-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.heroImage}
            alt={r.title}
            loading="eager"
            className="w-full rounded-2xl border border-white/10"
          />
        </figure>
      ) : undefined,
    }
  },
  titleSuffix: lang => getNewsUi(lang).titleSuffix,
  breadcrumbLabel: lang => getNewsUi(lang).breadcrumbNews,
  backLabel: lang => getNewsUi(lang).backToNews,
  minLabel: lang => getNewsUi(lang).minRead,
})

export const generateStaticParams = post.generateStaticParams
export const generateMetadata = post.generateMetadata
export default post.Page
