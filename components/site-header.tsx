'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuthModal, useDashboard } from '@/components/providers'
import { useLang } from '@/lib/i18n/use-lang'
import { getContent } from '@/lib/i18n/locales'
import { ICON } from '@/components/sections/connect-framework'

export function SiteHeader() {
  const pathname = usePathname() ?? ''
  const { data: session, status } = useSession()
  const { openModal } = useAuthModal()
  const { openServers, openSubscription, openPurchases, openPartnerCabinet } = useDashboard()
  const [menuOpen, setMenuOpen] = useState(false)
  const [deployOpen, setDeployOpen] = useState(false)
  const [fwOpen, setFwOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const isAdmin = session?.user?.email === 'admin@fractera.ai'
  const isPartner = !!session?.user?.partnerSlug
  const lang = useLang()
  const frameworks = getContent(lang).connectFramework.frameworks
  const partnerCabinetLabel = lang === 'ru' ? 'Партнёрский кабинет' : 'Partner cabinet'

  if (pathname.includes('/embed')) return null

  const initials = session?.user?.name
    ? session.user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : session?.user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <header className="w-full border-b border-white/40 bg-black/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="w-full px-6 md:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/fractera-logo.jpg" alt="Fractera" width={28} height={28} className="rounded" />
            <span className="text-sm font-semibold tracking-tight text-white">Fractera</span>
          </Link>

          {/* Separator + nav to the right of the wordmark, in this exact order:
              Deploy (dropdown) · Frameworks (dropdown) · Company Brain · Docs · News.
              Desktop only (>=780px); below that they collapse into the hamburger. */}
          <div className="hidden min-[780px]:flex items-center gap-3 ml-1">
            <span className="h-5 w-px bg-white/25" aria-hidden />

            {/* Deploy dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDeployOpen(v => !v)}
                className="flex items-center gap-1 text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                Deploy
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className={`transition-transform duration-200 ${deployOpen ? 'rotate-180' : ''}`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {deployOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDeployOpen(false)} />
                  <div className="absolute left-0 top-full mt-1 z-50 w-52 bg-neutral-900 border border-white/40 rounded-xl shadow-2xl p-1.5 flex flex-col gap-0.5">
                    <Link
                      href={`/${lang}/deployments`}
                      onClick={() => setDeployOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.06] transition-colors text-sm font-medium text-white/85 hover:text-white"
                    >
                      Manual VPS Deploy
                    </Link>
                    <a
                      href="/#"
                      onClick={() => setDeployOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.06] transition-colors text-sm font-medium text-white/85 hover:text-white"
                    >
                      MCP Deploy
                    </a>
                  </div>
                </>
              )}
            </div>

            {/* Frameworks dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setFwOpen(v => !v)}
                className="flex items-center gap-1 text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                Frameworks
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className={`transition-transform duration-200 ${fwOpen ? 'rotate-180' : ''}`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {fwOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setFwOpen(false)} />
                  <div className="thin-scroll absolute left-0 top-full mt-1 z-50 w-64 max-h-[600px] overflow-y-auto bg-neutral-900 border border-white/40 rounded-xl shadow-2xl p-1.5 flex flex-col gap-0.5">
                    {frameworks.map((name) => (
                      <a
                        key={name}
                        href="/#"
                        onClick={() => setFwOpen(false)}
                        className="group flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.06] transition-colors"
                      >
                        {name === 'Fractera Pro' ? (
                          <span aria-hidden className="flex h-5 w-5 shrink-0 items-center justify-center">
                            <img
                              src="/favicon-32x32.png"
                              alt="" width={20} height={20} loading="lazy"
                              className="h-full w-full object-contain rounded-sm"
                            />
                          </span>
                        ) : ICON[name] ? (
                          <span aria-hidden className="flex h-5 w-5 shrink-0 items-center justify-center">
                            <img
                              src={`/framework-icons/${ICON[name]}.svg`}
                              alt="" width={20} height={20} loading="lazy"
                              className="h-full w-full object-contain"
                            />
                          </span>
                        ) : (
                          <span
                            aria-hidden
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/15 bg-white/[0.04] text-[10px] font-bold text-violet-300"
                          >
                            {name.charAt(0)}
                          </span>
                        )}
                        <span className="text-sm font-medium text-white/85 group-hover:text-white truncate transition-colors">
                          {name}
                        </span>
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>

            <Link
              href={`/${lang}/company-brain`}
              className="text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              Company Brain
            </Link>
            <Link
              href={`/${lang}/documentation`}
              className="text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              Docs
            </Link>
            <Link
              href={`/${lang}/news`}
              className="text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              News
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {status === 'loading' && (
            <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse" />
          )}

          {status === 'unauthenticated' && (
            <button
              type="button"
              onClick={() => openModal()}
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
                  <div className="w-7 h-7 rounded-full bg-violet-500/20 ring-1 ring-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-400 shrink-0">
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
                      {!isAdmin && (
                        <>
                          {/* PAID_PLAN_HIDDEN — НЕ УДАЛЯТЬ НИ ПРИ КАКИХ ОБСТОЯТЕЛЬСТВАХ: кнопка Subscription скрыта для позиционирования как бесплатного open-source проекта */}
                          {false && (
                          <button
                            type="button"
                            onClick={() => { setMenuOpen(false); openSubscription() }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/[0.06] rounded-lg transition-colors text-left"
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                              <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                              <path d="M1 6h12" stroke="currentColor" strokeWidth="1.3"/>
                            </svg>
                            Subscription
                          </button>
                          )}
                          <button
                            type="button"
                            onClick={() => { setMenuOpen(false); openServers() }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/[0.06] rounded-lg transition-colors text-left"
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                              <rect x="1" y="2" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1.3"/>
                              <rect x="1" y="8" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1.3"/>
                              <circle cx="11" cy="4" r="0.8" fill="currentColor"/>
                              <circle cx="11" cy="10" r="0.8" fill="currentColor"/>
                            </svg>
                            Servers
                          </button>
                          {isPartner && (
                            <button
                              type="button"
                              onClick={() => { setMenuOpen(false); openPartnerCabinet() }}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/[0.06] rounded-lg transition-colors text-left"
                            >
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                <circle cx="7" cy="4.5" r="2.2" stroke="currentColor" strokeWidth="1.3"/>
                                <path d="M2.5 12c0-2.4 2-4 4.5-4s4.5 1.6 4.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                              </svg>
                              {partnerCabinetLabel}
                            </button>
                          )}
                          {/* Purchases — restored: White Label (Fractera-branding removal) is still sold */}
                          <button
                            type="button"
                            onClick={() => { setMenuOpen(false); openPurchases() }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/[0.06] rounded-lg transition-colors text-left"
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                              <path d="M2 2h1.5l1.5 6h5l1-4H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="7" cy="11.5" r="0.8" fill="currentColor"/>
                              <circle cx="10" cy="11.5" r="0.8" fill="currentColor"/>
                            </svg>
                            Purchases
                          </button>
                          <div className="h-px bg-white/20 my-1" />
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/[0.06] rounded-lg transition-colors text-left"
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

            </div>
          )}

          {/* Hamburger — mobile only (<780px). Toggles the nav links that the
              desktop bar shows inline. */}
          <button
            type="button"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
            className="min-[780px]:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <>
                  <path d="M3 6h18" />
                  <path d="M3 12h18" />
                  <path d="M3 18h18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav menu (<780px): the collapsed nav as a vertical list, in the
          same order — Deploy · Frameworks · Company Brain · Docs · News. */}
      {mobileOpen && (
        <nav className="min-[780px]:hidden border-t border-white/15 bg-black/95 backdrop-blur-sm">
          <div className="flex flex-col px-6 py-2">
            <Link href={`/${lang}/deployments`} onClick={() => setMobileOpen(false)} className="py-2.5 text-sm font-medium text-white/80 hover:text-white transition-colors">
              Deploy
            </Link>
            <a href={`/${lang}#connect-framework`} onClick={() => setMobileOpen(false)} className="py-2.5 text-sm font-medium text-white/80 hover:text-white transition-colors">
              Frameworks
            </a>
            <Link href={`/${lang}/company-brain`} onClick={() => setMobileOpen(false)} className="py-2.5 text-sm font-medium text-white/80 hover:text-white transition-colors">
              Company Brain
            </Link>
            <Link href={`/${lang}/documentation`} onClick={() => setMobileOpen(false)} className="py-2.5 text-sm font-medium text-white/80 hover:text-white transition-colors">
              Docs
            </Link>
            <Link href={`/${lang}/news`} onClick={() => setMobileOpen(false)} className="py-2.5 text-sm font-medium text-white/80 hover:text-white transition-colors">
              News
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
