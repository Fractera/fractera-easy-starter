import { createContentPost } from '@/lib/content/create-content-post'
import { blogPost } from '../../_lib/post'
import { getBlogUi } from '../../_data'
import { BRAND } from '@/lib/brand'
import { data } from '../_data'

// Entry for this blog post. Bilingual (en + ru override). The hero is overridden
// with a YouTube embed that STARTS at the exact second referenced on the homepage
// link (t=4119s → ?start=4119), so the moment plays from the same point. The figure
// caption is a data-driven lang lookup (no hardcoded lang comparison).
const VIDEO_EMBED = 'https://www.youtube.com/embed/BYXbuik3dgA?start=4119'

function heroCaption(lang: string): string {
  const map: Record<string, string> = {
    en: 'The moment from Elon Musk’s Dwarkesh Patel interview — where the real money still is.',
    ru: 'Тот самый момент из интервью Илона Маска у Dwarkesh Patel — где до сих пор лежат настоящие деньги.',
  }
  return map[lang] ?? map.en
}

const post = createContentPost({
  format: 'blog',
  subPath: `/blog/${data.meta.slug}`,
  resolve: lang => ({
    ...blogPost(data, lang),
    hero: (
      <figure className="my-8 flex flex-col gap-3">
        <div
          className="overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_60px_-15px_rgba(167,139,250,0.35)]"
          style={{ aspectRatio: '16 / 9' }}
        >
          <iframe
            src={VIDEO_EMBED}
            title="Elon Musk — Dwarkesh Patel interview (the moment)"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
        <figcaption className="text-center text-sm text-white/40">{heroCaption(lang)}</figcaption>
      </figure>
    ),
  }),
  chrome: (lang, p) => {
    const ui = getBlogUi(lang)
    return {
      breadcrumbs: [
        { label: BRAND.name, href: `/${lang}` },
        { label: ui.breadcrumbBlog, href: `/${lang}/blog` },
        { label: p.title },
      ],
      backHref: `/${lang}/blog`,
      backLabel: ui.backToBlog,
    }
  },
  titleSuffix: lang => getBlogUi(lang).titleSuffix,
  minLabel: lang => getBlogUi(lang).minRead,
})

export const generateMetadata = post.generateMetadata
export default post.Page
