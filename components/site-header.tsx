'use client'

import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { useAuthModal, useDashboard } from '@/components/providers'

export function SiteHeader() {
  const { data: session, status } = useSession()
  const { openModal } = useAuthModal()
  const { openDashboard } = useDashboard()
  const [menuOpen, setMenuOpen] = useState(false)

  const initials = session?.user?.name
    ? session.user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : session?.user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <header className="w-full border-b border-white/40 bg-black/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/fractera-logo.jpg" alt="Fractera" width={28} height={28} className="rounded" />
          <span className="text-sm font-semibold tracking-tight text-white">Fractera</span>
        </div>

        <div className="flex items-center gap-3">
          {status === 'loading' && (
            <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse" />
          )}

          {status === 'unauthenticated' && (
            <button
              type="button"
              onClick={openModal}
              className="text-sm font-semibold text-white hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.06]"
            >
              Sign in
            </button>
          )}

          {status === 'authenticated' && session?.user && (
            <div className="flex items-center gap-2">
              {/* Avatar + name — click opens sign-out dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen(v => !v)}
                  className="flex items-center gap-2 rounded-full hover:bg-white/[0.06] pl-1 pr-3 py-1 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-orange-500/20 ring-1 ring-orange-500/30 flex items-center justify-center text-xs font-bold text-orange-400 shrink-0">
                    {initials}
                  </div>
                  <span className="text-sm font-medium text-white max-w-[140px] truncate hidden sm:block">
                    {session.user.name ?? session.user.email}
                  </span>
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 z-50 w-52 bg-neutral-900 border border-white/40 rounded-xl shadow-2xl p-1 flex flex-col">
                      <div className="px-3 py-2 border-b border-white/30 mb-1">
                        <p className="text-xs font-bold text-white truncate">{session.user.name}</p>
                        <p className="text-xs font-medium text-white truncate">{session.user.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors text-left"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                          <path d="M5 2H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Dashboard button — separate, rightmost */}
              <button
                type="button"
                onClick={openDashboard}
                className="text-base font-bold text-white bg-white/[0.06] hover:bg-white/[0.10] border border-white/40 hover:border-white/60 px-4 py-1.5 rounded-lg transition-colors"
              >
                Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
