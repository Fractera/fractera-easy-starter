/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useAuthModal } from '@/components/providers'
import { FrameworkFeedbackDrawer } from '@/components/framework-feedback-drawer'
import type { SiteContent } from '@/lib/i18n/types'

type FeedbackStrings = SiteContent['frameworkFeedback']

// Universal callback card on every /framework/<slug> page: invite someone with real
// expertise in {framework} to share a wish on improving the Fractera + {framework}
// deployment experience. Mirrors the Company-Brain inquiry CTA mechanics (auth gate
// → slide-over drawer → Resend email) but with a distinct, product-feedback intent.
// Copy comes pre-localized from the i18n shell (no lang ternary here); the framework
// name is interpolated via {framework}. Drop one tag per page:
//   <FrameworkFeedbackCta lang={lang} framework="Next.js" strings={...} />
//
// Flow: signed in → open the drawer; signed out → open the global auth modal with
// plan 'framework_feedback' (its magic link returns to THIS page with
// ?framework_feedback=1). On return, the marker auto-opens the drawer, then the URL
// is cleaned. The framework is known from props (same page), so no encoding needed.
export function FrameworkFeedbackCta({
  lang,
  framework,
  strings,
}: {
  lang: string
  framework: string
  strings: FeedbackStrings
}) {
  const { data: session, status } = useSession()
  const { openModal } = useAuthModal()
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated') return
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    if (url.searchParams.get('framework_feedback') !== '1') return
    setDrawerOpen(true)
    url.searchParams.delete('framework_feedback')
    window.history.replaceState({}, '', url.toString())
  }, [status])

  function handleCta() {
    if (status === 'authenticated') setDrawerOpen(true)
    else openModal('framework_feedback')
  }

  const fill = (s: string) => s.replaceAll('{framework}', framework)
  const c = strings.card

  return (
    <div className="my-4 flex flex-col gap-4 rounded-2xl border border-violet-500/30 bg-violet-500/[0.06] p-6">
      <span className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">{fill(c.eyebrow)}</span>
      <h3 className="text-lg font-bold text-white">{fill(c.title)}</h3>
      <p className="text-base font-medium text-white/80">{fill(c.text)}</p>
      <button
        type="button"
        onClick={handleCta}
        className="inline-flex w-fit items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500"
      >
        {fill(c.label)}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
      </button>

      <FrameworkFeedbackDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        lang={lang}
        email={session?.user?.email ?? ''}
        framework={framework}
        strings={strings.drawer}
      />
    </div>
  )
}
