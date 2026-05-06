'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import Image from 'next/image'
import { useState } from 'react'

export function SiteHeader() {
  const { data: session, status } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="w-full border-b border-white/[0.06] bg-black/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <span className="text-sm font-semibold tracking-tight text-white">Fractera</span>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {status === 'loading' && (
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          )}

          {status === 'unauthenticated' && (
            <button
              type="button"
              onClick={() => signIn()}
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
                className="flex items-center gap-2 rounded-full hover:bg-white/[0.06] pl-2 pr-3 py-1 transition-colors"
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? 'avatar'}
                    width={28}
                    height={28}
                    className="rounded-full ring-1 ring-white/20"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-orange-500/20 ring-1 ring-orange-500/40 flex items-center justify-center text-xs font-semibold text-orange-400">
                    {(session.user.name ?? session.user.email ?? '?')[0].toUpperCase()}
                  </div>
                )}
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
