import { Suspense, type ReactNode } from 'react'
import { createContentPage } from '@/lib/content/create-content-page'
import type { Block } from '@/lib/content/blocks/types'
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
// Canonical bottom order: [page blocks] → [topSection] → form → feedback card →
// founder → [belowFounderSection] → sponsors → FAQ → back link. Optional per-page
// knobs (Fractera Pro uses all three to host the disassembled "aircraft carrier"
// deep-dive):
//   - opts.blocks(lang)       — extra standard content blocks appended to the page
//                               body feed (the carrier text: callout/h2/p);
//   - opts.topSection(lang)   — rich section at the top of the sections slot, above
//                               the form (the animated parallel-routing demo);
//   - opts.belowFounderSection(lang) — section rendered directly below the founder
//                               quote (the manifesto card).
// topSection / belowFounderSection are wrapped in ContentProvider so hero-content
// client sections work.
export function createFrameworkPage(
  slug: string,
  opts?: {
    blocks?: (lang: string) => Block[]
    topSection?: (lang: string) => ReactNode
    belowFounderSection?: (lang: string) => ReactNode
  },
) {
  const fw = frameworkPageBySlug(slug)
  if (!fw) throw new Error(`createFrameworkPage: unknown framework slug "${slug}"`)
  const data = buildFrameworkData(slug)

  return createContentPage({
    resolve: lang => {
      const c = frameworkContent(data, lang)
      const extra = opts?.blocks?.(lang) ?? []
      return extra.length ? { ...c, blocks: [...c.blocks, ...extra] } : c
    },
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
          {opts?.topSection && (
            <section className="mt-12 border-t border-white/10 pt-10">
              <ContentProvider value={getContent(lang)}>
                {opts.topSection(lang)}
              </ContentProvider>
            </section>
          )}
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
          {opts?.belowFounderSection && (
            <section className="mt-10">
              <ContentProvider value={getContent(lang)}>
                {opts.belowFounderSection(lang)}
              </ContentProvider>
            </section>
          )}
        </>
      )
    },
  })
}
