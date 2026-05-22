'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useHeroContent } from '@/lib/i18n/context'
import { AuthModal } from '@/components/auth-modal'
import { BlackBoxInquiryDrawer } from '@/components/black-box-inquiry-drawer'

export function BlackBoxSection() {
  const content = useHeroContent()
  const bb = content.blackBox
  const { data: session, status: sessionStatus } = useSession()
  const params = useSearchParams()
  const pathname = usePathname()
  const lang = (pathname?.split('/')[1] || 'en') as 'en' | 'ru'

  const [authOpen, setAuthOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Auto-open drawer when user returns from magic-link sign-in with the
  // black_box=1 marker AND has a live session. Clears the URL param so
  // refreshing the page does not re-open the drawer.
  useEffect(() => {
    if (params?.get('black_box') !== '1') return
    if (sessionStatus !== 'authenticated') return
    setDrawerOpen(true)
    const url = new URL(window.location.href)
    url.searchParams.delete('black_box')
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
    <div id="black-box" className="w-full max-w-4xl flex flex-col gap-10 scroll-mt-24">

      {/* Top — badge, h2, subhead */}
      <div className="flex flex-col gap-4 items-start text-left md:items-center md:text-center">
        <span className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest border border-violet-500/40 bg-violet-500/[0.06] px-3 py-1 rounded-full">
          {bb.label}
        </span>
        <h2 className="max-w-3xl font-serif font-bold leading-tight text-white text-2xl md:text-3xl lg:text-4xl">
          {bb.h2}
        </h2>
        <p className="max-w-2xl text-base text-white/65 leading-relaxed">
          {bb.subhead}
        </p>
      </div>

      {/* Full-width device image */}
      <div className="w-full rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-b from-neutral-900 to-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mac_mini.png"
          alt={bb.imageAlt}
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Intro */}
      <p className="text-base md:text-lg text-white/80 leading-relaxed">
        {bb.intro}
      </p>

      {/* Pillars grid */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl md:text-2xl font-bold font-serif text-white">{bb.pillarsTitle}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bb.pillars.map((p, i) => (
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
          <h3 className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">{bb.pricingLabel}</h3>
          <p className="text-sm text-white/75 leading-relaxed">{bb.pricingBody}</p>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl border border-violet-500/30 bg-violet-500/[0.04] p-5">
          <h3 className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">{bb.limitedLabel}</h3>
          <p className="text-sm text-white/75 leading-relaxed">{bb.limitedBody}</p>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col gap-4 rounded-2xl border border-violet-500/40 bg-gradient-to-br from-violet-950/40 via-violet-900/20 to-black/60 p-6 md:p-8 items-start">
        <h3 className="text-xl md:text-2xl font-bold font-serif text-white">{bb.ctaTitle}</h3>
        <p className="text-sm md:text-base text-white/75 leading-relaxed max-w-2xl">{bb.ctaBody}</p>
        <button
          type="button"
          onClick={handleCta}
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-5 py-3 rounded-xl text-sm md:text-base transition-colors shadow-lg shadow-violet-500/30"
        >
          {bb.ctaButton} →
        </button>
      </div>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        pendingPlan="black_box"
      />

      <BlackBoxInquiryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        lang={lang}
        email={session?.user?.email ?? ''}
      />

    </div>
  )
}
