'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useAuthModal } from '@/components/providers'
import { CompanyBrainInquiryDrawer } from '@/components/company-brain-inquiry-drawer'

// Interactive primary CTA of /deployments/local: submit a consultation inquiry for
// the AI Company Brain. Ported from the former homepage Company Brain section (lost
// in the StandardContentPage refactor) and re-expressed as a content block so the
// data files (en/ru) own the copy. The backend is unchanged: auth gate → inquiry
// drawer → POST /api/company-brain/inquiry.
//
// Flow: signed in → open the drawer; signed out → open the global auth modal with
// plan 'company_brain' (its magic link returns to this page with ?company_brain=1).
// On return, the marker auto-opens the drawer, then the URL is cleaned.
export function CompanyBrainInquiryCta({
  lang,
  title,
  text,
  label,
}: {
  lang: string
  title?: string
  text: string
  label: string
}) {
  const drawerLang: 'en' | 'ru' = lang === 'ru' ? 'ru' : 'en'
  const { data: session, status } = useSession()
  const { openModal } = useAuthModal()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Auto-open the drawer when the user returns from magic-link sign-in with the
  // company_brain=1 marker AND has a live session. Then clear the URL param.
  // Read the query from window.location (not useSearchParams) so this block stays
  // compatible with the statically rendered page without a Suspense boundary.
  useEffect(() => {
    if (status !== 'authenticated') return
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    if (url.searchParams.get('company_brain') !== '1') return
    setDrawerOpen(true)
    url.searchParams.delete('company_brain')
    window.history.replaceState({}, '', url.toString())
  }, [status])

  function handleCta() {
    if (status === 'authenticated') setDrawerOpen(true)
    else openModal('company_brain')
  }

  return (
    <div className="my-4 flex flex-col gap-4 rounded-2xl border border-violet-500/30 bg-violet-500/[0.06] p-6">
      {title && <h3 className="text-lg font-bold text-white">{title}</h3>}
      <p className="text-base font-medium text-white/80">{text}</p>
      <button
        type="button"
        onClick={handleCta}
        className="inline-flex w-fit items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500"
      >
        {label}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
      </button>

      <CompanyBrainInquiryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        lang={drawerLang}
        email={session?.user?.email ?? ''}
      />
    </div>
  )
}
