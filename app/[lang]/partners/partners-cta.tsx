'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useAuthModal, useDashboard } from '@/components/providers'
import { PartnerRegistrationDrawer } from '@/components/partner-registration-drawer'

export function PartnersCta({ lang, label }: { lang: string; label: string }) {
  const { data: session } = useSession()
  const { openModal } = useAuthModal()
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)

  function handleClick() {
    if (!session?.user) {
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
