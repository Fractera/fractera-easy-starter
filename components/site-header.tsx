'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { useAuthModal } from '@/components/providers'

export function SiteHeader() {
  const { data: session, status } = useSession()
  const { openModal } = useAuthModal()
  const [menuOpen, setMenuOpen] = useState(false)

  const initials = session?.user?.name
    ? session.user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : session?.user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <header className="w-full border-b border-white/[0.06] bg-black/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <span className="text-sm font-semibold tracking-tight text-white">Fractera</span>

        <div className="flex items-center gap-3">
          {status === 'loading' && (
            <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse" />
          )}

          {status === 'unauthenticated' && (
            <button
              type="button"
              onClick={openModal}
              className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.06]"
            >
              Sign in
            </button>
          )}

          {status === 'authenticated' && session?.user && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(v => !v)}
                className="flex items-center gap-2 rounded-full hover:bg-white/[0.06] pl-1 pr-3 py-1 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-orange-500/20 ring-2 ring-orange-500/30 flex items-center justify-center text-sm font-bold text-orange-400 shrink-0">
                  {initials}
                </div>
                <span className="text-sm text-gray-300 max-w-[140px] truncate hidden sm:block">
                  {session.user.name ?? session.user.email}
                </span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-gray-600 shrink-0" aria-hidden="true">
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 w-56 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl p-1 flex flex-col">
                    <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                      <p className="text-xs font-medium text-white truncate">{session.user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors text-left"
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
          )}
        </div>
      </div>
    </header>
  )
}
