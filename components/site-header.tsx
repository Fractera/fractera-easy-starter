'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuthModal, useDashboard } from '@/components/providers'
import { useLang } from '@/lib/i18n/use-lang'
import { getContent } from '@/lib/i18n/locales'

export function SiteHeader() {
  const pathname = usePathname() ?? ''
  const { data: session, status } = useSession()
  const { openModal } = useAuthModal()
  const { openServers, openSubscription, openPurchases, openPartnerCabinet } = useDashboard()
  const [menuOpen, setMenuOpen] = useState(false)
  const [deployOpen, setDeployOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const isAdmin = session?.user?.email === 'admin@fractera.ai'
  const isPartner = !!session?.user?.partnerSlug
  const lang = useLang()
  const content = getContent(lang)
  // Header nav labels follow the site language (RU site → RU header).
  const t = content.siteHeader

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
                {t.deploy}
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
                  <div className="absolute left-0 top-full mt-1 z-50 w-52 bg-popover border border-white/40 rounded-xl shadow-2xl p-1.5 flex flex-col gap-0.5">
                    <Link
                      href={`/${lang}/deployments/vps`}
                      onClick={() => setDeployOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.06] transition-colors text-sm font-medium text-white/85 hover:text-white"
                    >
                      {t.vpsDeploy}
                    </Link>
                    <Link
                      href={`/${lang}/deployments/mcp`}
                      onClick={() => setDeployOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.06] transition-colors text-sm font-medium text-white/85 hover:text-white"
                    >
                      {t.mcpDeploy}
                    </Link>
                  </div>
                </>
              )}
            </div>


            {/* 🪦 Шаг 191 (2026-09-12): пункт «Мозг компании» УДАЛЁН из верхнего меню по
                слову владельца («Из верхнего меню убирай кнопки Мос компании документация
                и новости»). Он вёл на страницу локального развёртывания.
                🛑 НАЗВАНО ВСЛУХ, А НЕ ПРОМОЛЧАНО: эта страница была достижима ТОЛЬКО
                отсюда — измерено, ссылок вне шапки ноль, в выпадающем «Развернуть» её нет,
                в подвале нет. Она жива и отвечает 200, но входа у неё больше не осталось:
                только прямой адрес и sitemap. Это решение владельца, а не последствие. */}
            {/* «Память» — страница службы памяти на витрине (шаг 187).
                🔒 Пункт обязан стоять И здесь, И в мобильном меню ниже, и
                причина сильнее, чем кажется. Этот ряд объявлен
                `hidden min-[780px]:flex` — ниже 780 px его не существует вовсе.
                А мобильное меню отрисовывается ТОЛЬКО при `mobileOpen`, то есть
                до нажатия гамбургера его нет и в разметке. Две половины, и ни
                одна не подстраховывает другую: пункт, добавленный лишь в одну,
                на половине устройств просто отсутствует.
                ✗ Измерено в 187-6: на отданном HTML ссылка ровно ОДНА — это не
                дефект, а следствие условной отрисовки; вторая появляется после
                нажатия. */}
            <Link
              href={`/${lang}/memory`}
              className="text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              {t.memory}
            </Link>
            {/* 🪦 Шаг 191: пункты «Документация» и «Новости» УДАЛЕНЫ из верхнего меню тем
                же словом владельца. Обе страницы живы и достижимы из ПОДВАЛА — там их
                ссылки намеренно оставлены: речь шла о верхнем меню. */}
            <Link
              href={`/${lang}/blog`}
              className="text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              {t.blog}
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
              {t.signIn}
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
                    <div className="absolute right-0 top-full mt-1 z-50 w-52 bg-popover border border-white/40 rounded-xl shadow-2xl p-1 flex flex-col">
                      <div className="px-3 py-2 border-b border-white/30 mb-1">
                        <p className="text-xs font-bold text-white truncate">{session.user.name}</p>
                        <p className="text-xs font-medium text-white truncate">{session.user.email}</p>
                      </div>
                      {!isAdmin && (
                        <>
                          {/* PAID_PLAN_HIDDEN — НЕ УДАЛЯТЬ НИ ПРИ КАКИХ ОБСТОЯТЕЛЬСТВАХ: кнопка Subscription скрыта для позиционирования как бесплатного Open Code проекта */}
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
                            {t.servers}
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
                              {t.partnerCabinet}
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
                            {t.purchases}
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
                        {t.signOut}
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

      {/* Mobile nav menu (<780px): the collapsed nav as a vertical list. The two
          Deploy actions are shown flat here (no dropdown) — VPS Deploy · MCP Deploy
          · Memory · Blog. The Deploy targets are placeholders for now (final links
          pending).
          🔒 Шаг 191: перечисление в этом комментарии исправлено ВМЕСТЕ с самими
          пунктами — список, написанный руками, расходится с кодом молча. Здесь он
          пережил бы правку и назвал бы удалённые пункты живыми. */}
      {mobileOpen && (
        <nav className="min-[780px]:hidden border-t border-white/15 bg-black/95 backdrop-blur-sm">
          <div className="flex flex-col px-6 py-2">
            <Link href={`/${lang}/deployments/vps`} onClick={() => setMobileOpen(false)} className="py-2.5 text-sm font-medium text-white/80 hover:text-white transition-colors">
              {t.vpsDeploy}
            </Link>
            <Link href={`/${lang}/deployments/mcp`} onClick={() => setMobileOpen(false)} className="py-2.5 text-sm font-medium text-white/80 hover:text-white transition-colors">
              {t.mcpDeploy}
            </Link>
            {/* 🪦 Шаг 191: «Мозг компании», «Документация» и «Новости» удалены и здесь.
                🔒 Удалить их только в десктопном ряду было бы НЕДОСТАТОЧНО: он объявлен
                `hidden min-[780px]:flex` и ниже 780 px не существует вовсе, а это меню —
                единственная навигация на телефоне. Две половины не подстраховывают друг
                друга (закон 187-6). */}
            <Link href={`/${lang}/memory`} onClick={() => setMobileOpen(false)} className="py-2.5 text-sm font-medium text-white/80 hover:text-white transition-colors">
              {t.memory}
            </Link>
            <Link href={`/${lang}/blog`} onClick={() => setMobileOpen(false)} className="py-2.5 text-sm font-medium text-white/80 hover:text-white transition-colors">
              {t.blog}
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
