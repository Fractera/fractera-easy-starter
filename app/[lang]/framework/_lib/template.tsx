import { Suspense } from 'react'
import { createContentPage } from '@/lib/content/create-content-page'
import { BRAND } from '@/lib/brand'
import { getContent } from '@/lib/i18n/content'
import { ContentProvider } from '@/components/content-provider'
import { PricingFlow } from '@/components/sections/pricing-flow'
import { FrameworkFeedbackCta } from '@/components/framework-feedback-cta'
import { PostBody } from '@/components/content-page/post-body'
import { frameworkPageBySlug } from '@/lib/frameworks-pages'
import { frameworkContent, frameworkFounderQuote, buildFrameworkData } from './post'
import { getFrameworkUi } from '../_data'

// createFrameworkPage — the shared page factory for EVERY /framework/<slug> page.
// Each framework folder's _components/index.tsx is just:
//   const page = createFrameworkPage('<slug>'); export { generateMetadata }; export default Page
// The framework's name (from the registry) is substituted into the H1/breadcrumb/SEO
// (via buildFrameworkData) AND into the dynamic containers injected here:
//   - the universal deploy form (PricingFlow), made page-aware with framework={id,name}
//     → name in the form H2 + first feature item + the install dropdown preselect
//     (every framework temporarily deploys the Next.js starter — resolveSlotRepoUrl → FNS);
//   - the framework-feedback callback card (ask an expert for a wish → Resend, tagged
//     with the framework name);
//   - the founder quote (last in the slot).
// Canonical bottom order: form → feedback card → founder → sponsors → FAQ → back link.
export function createFrameworkPage(slug: string) {
  const fw = frameworkPageBySlug(slug)
  if (!fw) throw new Error(`createFrameworkPage: unknown framework slug "${slug}"`)
  const data = buildFrameworkData(slug)

  return createContentPage({
    resolve: lang => frameworkContent(data, lang),
    meta: {
      subPath: data.meta.subPath,
      ogImage: data.meta.ogImage,
      heroImage: data.meta.heroImage,
      tags: data.meta.tags,
    },
    chrome: (lang, c) => {
      const ui = getFrameworkUi(lang)
      return {
        breadcrumbs: [
          { label: BRAND.name, href: `/${lang}` },
          { label: ui.breadcrumb, href: `/${lang}/framework` },
          { label: c.title },
        ],
        backHref: `/${lang}/framework`,
        backLabel: ui.backToHub,
      }
    },
    sections: lang => {
      const founderQuote = frameworkFounderQuote(data, lang)
      return (
        <>
          <section className="mt-12 flex flex-col items-center border-t border-white/10 pt-10">
            <ContentProvider value={getContent(lang)}>
              <Suspense fallback={null}>
                <PricingFlow framework={{ id: fw.id, name: fw.name }} />
              </Suspense>
            </ContentProvider>
          </section>
          <div className="mt-10">
            <FrameworkFeedbackCta lang={lang} framework={fw.name} strings={getContent(lang).frameworkFeedback} />
          </div>
          {founderQuote && (
            <div className="mt-10">
              <PostBody blocks={[{ kind: 'founder', text: founderQuote }]} lang={lang} />
            </div>
          )}
        </>
      )
    },
  })
}
