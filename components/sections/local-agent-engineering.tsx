'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AuthModal } from '@/components/auth-modal'
import { CompanyBrainInquiryDrawer } from '@/components/company-brain-inquiry-drawer'
import type { DeploymentsLocalContent } from '@/lib/pages/deployments-local'

// Presentational section for /deployments/local. Ported from the former homepage
// Company Brain section, but content comes in as props (resolved per-document /
// per-language) instead of from the i18n context — so the page owns the source of
// truth. Only the CTA (auth + inquiry drawer) needs interactivity; the rest is
// plain markup and renders fully without JS.
export function LocalAgentEngineeringSection({
  content,
  lang,
}: {
  content: DeploymentsLocalContent
  lang: 'en' | 'ru'
}) {
  const cb = content
  const { data: session, status: sessionStatus } = useSession()
  const params = useSearchParams()

  const [authOpen, setAuthOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Auto-open the drawer when the user returns from magic-link sign-in with the
  // company_brain=1 marker AND has a live session. Clears the URL param.
  useEffect(() => {
    if (params?.get('company_brain') !== '1') return
    if (sessionStatus !== 'authenticated') return
    setDrawerOpen(true)
    const url = new URL(window.location.href)
    url.searchParams.delete('company_brain')
    window.history.replaceState({}, '', url.toString())
  }, [params, sessionStatus])

  function handleCta() {
    if (sessionStatus === 'authenticated') {
      setDrawerOpen(true)
    } else {
      setAuthOpen(true)
    }
  }

  return (
    <div id="local-agent-engineering" className="w-full max-w-4xl flex flex-col gap-10 scroll-mt-24">

      {/* Top — badge, value headline (h2), subhead */}
      <div className="flex flex-col gap-4 items-start text-left md:items-center md:text-center">
        <span className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest border border-violet-500/40 bg-violet-500/[0.06] px-3 py-1 rounded-full">
          {cb.label}
        </span>
        <h2 className="max-w-3xl font-serif font-bold leading-tight text-white text-2xl md:text-3xl lg:text-4xl">
          {cb.h2}
        </h2>
        <p className="max-w-2xl text-base text-white/65 leading-relaxed">
          {cb.subhead}
        </p>
      </div>

      {/* Hero image — one appliance vs a whole team */}
      <div className="w-full rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-b from-neutral-900 to-black p-4 md:p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/ai-company-brain.png"
          alt={cb.imageAlt}
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Intro */}
      <p className="text-base md:text-lg text-white/80 leading-relaxed">
        {cb.intro}
      </p>

      {/* Pillars grid */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl md:text-2xl font-bold font-serif text-white">{cb.pillarsTitle}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cb.pillars.map((p, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-2xl border border-white/15 bg-white/[0.02] p-5">
              <p className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">0{i + 1}</p>
              <h4 className="text-base font-bold text-white leading-snug">{p.title}</h4>
              <p className="text-sm text-white/65 leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing + limited — two narrow blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 rounded-2xl border border-violet-500/30 bg-violet-500/[0.04] p-5">
          <h3 className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">{cb.pricingLabel}</h3>
          <p className="text-sm text-white/75 leading-relaxed">{cb.pricingBody}</p>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl border border-violet-500/30 bg-violet-500/[0.04] p-5">
          <h3 className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">{cb.limitedLabel}</h3>
          <p className="text-sm text-white/75 leading-relaxed">{cb.limitedBody}</p>
        </div>
      </div>

      {/* Assurance — why we know this is what you need */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/15 bg-white/[0.02] p-6 md:p-8">
        <h3 className="text-xl md:text-2xl font-bold font-serif text-white">{cb.assuranceTitle}</h3>
        <p className="text-sm md:text-base text-white/75 leading-relaxed">{cb.assuranceBody}</p>
      </div>

      {/* Details — three strengthening paragraphs (device / private LightRAG / who-and-how) */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl md:text-2xl font-bold font-serif text-white">{cb.detailsTitle}</h3>
        <div className="flex flex-col gap-4">
          {cb.details.map((para, i) => (
            <p key={i} className="text-sm md:text-base text-white/75 leading-relaxed">{para}</p>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col gap-4 rounded-2xl border border-violet-500/40 bg-gradient-to-br from-violet-950/40 via-violet-900/20 to-black/60 p-6 md:p-8 items-start">
        <h3 className="text-xl md:text-2xl font-bold font-serif text-white">{cb.ctaTitle}</h3>
        <p className="text-sm md:text-base text-white/75 leading-relaxed max-w-2xl">{cb.ctaBody}</p>
        <button
          type="button"
          onClick={handleCta}
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-5 py-3 rounded-xl text-sm md:text-base transition-colors shadow-lg shadow-violet-500/30"
        >
          {cb.ctaButton} →
        </button>
      </div>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        pendingPlan="company_brain"
      />

      <CompanyBrainInquiryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        lang={lang}
        email={session?.user?.email ?? ''}
      />

    </div>
  )
}
