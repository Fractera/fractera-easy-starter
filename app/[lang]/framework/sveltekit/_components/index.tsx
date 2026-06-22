import { Suspense } from 'react'
import { createContentPage } from '@/lib/content/create-content-page'
import { BRAND } from '@/lib/brand'
import { getContent } from '@/lib/i18n/content'
import { ContentProvider } from '@/components/content-provider'
import { PricingFlow } from '@/components/sections/pricing-flow'
import { FrameworkFeedbackCta } from '@/components/framework-feedback-cta'
import { PostBody } from '@/components/content-page/post-body'
import { frameworkContent, frameworkFounderQuote } from '../../_lib/post'
import { getFrameworkUi } from '../../_data'
import { data } from '../_data'

// Entry for /framework/sveltekit — STANDARD co-located page (CONTENT-I18N-
// ARCHITECTURE-STANDARD §7.6/§7.8): thin page.tsx + this entry + own ../_data. Calls
// createContentPage DIRECTLY (the /deployments/vps path), NOT the shared
// createFrameworkPage factory. Sections in the open slot: form (page-aware) →
// feedback card → founder. Hero = top-of-page deploy CTA (#pricing).

const FW = { id: 'sveltekit' as const, name: 'SvelteKit' }

const page = createContentPage({
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
  hero: lang => {
    const label = getFrameworkUi(lang).deployCta.replaceAll('{framework}', FW.name)
    return (
      <div className="mt-8 flex justify-center">
        <a
          href="#pricing"
          className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-500/[0.04] px-6 py-3 text-sm font-semibold text-violet-200 transition-colors hover:border-violet-400/70 hover:bg-violet-500/[0.10]"
        >
          {label}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
        </a>
      </div>
    )
  },
  sections: lang => {
    const founderQuote = frameworkFounderQuote(data, lang)
    return (
      <ContentProvider value={getContent(lang)}>
        <section className="mt-12 flex flex-col items-center border-t border-white/10 pt-10">
          <Suspense fallback={null}>
            <PricingFlow framework={FW} />
          </Suspense>
        </section>
        <div className="mt-10">
          <FrameworkFeedbackCta lang={lang} framework={FW.name} strings={getContent(lang).frameworkFeedback} />
        </div>
        {founderQuote && (
          <div className="mt-10">
            <PostBody blocks={[{ kind: 'founder', text: founderQuote }]} lang={lang} />
          </div>
        )}
      </ContentProvider>
    )
  },
})

export const generateMetadata = page.generateMetadata
export default page.Page
