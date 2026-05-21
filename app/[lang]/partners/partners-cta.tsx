'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useAuthModal, useDashboard } from '@/components/providers'
import { PartnerRegistrationDrawer } from '@/components/partner-registration-drawer'

// Marker so the partner-page can re-open the drawer after the visitor
// signs in. AuthModal does not call back into the page — it just lands
// the user back on /partners — and the natural read of "I already
// clicked, take me into the flow" is to resume, not require a second
// click on the same button.
const RESUME_DRAWER_KEY = 'fractera_partner_resume_drawer'

export function PartnersCta({ lang, label }: { lang: string; label: string }) {
  const { data: session } = useSession()
  const { openModal } = useAuthModal()
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // After a sign-in round-trip we land here as an authenticated user; if
  // the marker is set, open the drawer automatically and consume it.
  useEffect(() => {
    if (!session?.user) return
    try {
      if (sessionStorage.getItem(RESUME_DRAWER_KEY) === '1') {
        sessionStorage.removeItem(RESUME_DRAWER_KEY)
        setDrawerOpen(true)
      }
    } catch {
      // sessionStorage unavailable — fall back to the original two-click flow.
    }
  }, [session?.user])

  function handleClick() {
    if (!session?.user) {
      try { sessionStorage.setItem(RESUME_DRAWER_KEY, '1') } catch {}
      openModal('partner')
      return
    }
    setDrawerOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-violet-500/30"
      >
        {label} →
      </button>
      <PartnerRegistrationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onRegistered={() => router.refresh()}
        lang={lang}
      />
    </>
  )
}

export function OpenCabinetButton({ label }: { label: string }) {
  const { openPartnerCabinet } = useDashboard()
  return (
    <button
      type="button"
      onClick={openPartnerCabinet}
      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-base transition-colors shadow-lg shadow-emerald-500/20"
    >
      {label} →
    </button>
  )
}
