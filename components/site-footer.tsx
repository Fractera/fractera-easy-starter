'use client'

import { usePathname } from 'next/navigation'
import { LanguageSwitcher } from '@/components/language-switcher'

type FooterLabels = {
  privacy: string
  terms: string
  refund: string
  cookies: string
  partners: string
  regionalPartners: string
  knowledgeBase: string
  architecture: string
  developmentLoop: string
  cookieSettings: string
  rights: string
  tocLabel: string
  toc: { id: string; label: string }[]
}

const FOOTER_LABELS: Record<string, FooterLabels> = {
  ru: {
    privacy: 'Политика конфиденциальности',
    terms: 'Условия использования',
    refund: 'Политика возврата',
    cookies: 'Политика куки',
    partners: 'Партнёрская программа',
    regionalPartners: 'Региональные партнёры',
    knowledgeBase: 'База знаний (MCP)',
    architecture: 'Архитектура AI Workspace',
    developmentLoop: 'Цикл AI-разработки',
    cookieSettings: 'Настройки куки',
    rights: 'Все права защищены.',
    tocLabel: 'Содержание сайта',
    toc: [
      { id: 'hero', label: 'Главная' },
      { id: 'ai-coding', label: 'AI-разработка' },
      { id: 'platforms', label: 'AI-платформы' },
      { id: 'problem', label: 'Проблема и решение' },
      { id: 'pricing', label: 'Тарифы' },
      { id: 'mcp-section', label: 'MCP-сервер' },
      { id: 'features', label: 'Возможности' },
      { id: 'company-brain', label: 'Fractera AI Company Brain' },
      { id: 'sponsors', label: 'Поддержать' },
      { id: 'faq', label: 'Вопросы и ответы' },
      { id: 'cases', label: 'Кейсы' },
    ],
  },
  en: {
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    refund: 'Refund Policy',
    cookies: 'Cookie Policy',
    partners: 'Partner Program',
    regionalPartners: 'Regional Partners',
    knowledgeBase: 'Knowledge Base (MCP)',
    architecture: 'AI Workspace Architecture',
    developmentLoop: 'AI Development Loop',
    cookieSettings: 'Cookie Settings',
    rights: 'All rights reserved.',
    tocLabel: 'Site contents',
    toc: [
      { id: 'hero', label: 'Top' },
      { id: 'ai-coding', label: 'AI coding' },
      { id: 'platforms', label: 'AI platforms' },
      { id: 'problem', label: 'Problem & solution' },
      { id: 'pricing', label: 'Pricing' },
      { id: 'mcp-section', label: 'MCP server' },
      { id: 'features', label: 'Features' },
      { id: 'company-brain', label: 'Fractera AI Company Brain' },
      { id: 'sponsors', label: 'Sponsor us' },
      { id: 'faq', label: 'FAQ' },
      { id: 'cases', label: 'Cases' },
    ],
  },
}

export function SiteFooter() {
  const pathname = usePathname()
  // On root reference pages (e.g. /mcp-info, /ai-workspace-architect) the first
  // path segment is NOT a language — fall back to English and keep links pointed
  // at the real /en/… pages instead of building broken /mcp-info/privacy URLs.
  const rawSeg = pathname?.split('/')[1] || 'en'
  const lang = FOOTER_LABELS[rawSeg] ? rawSeg : 'en'
  const t = FOOTER_LABELS[lang] ?? FOOTER_LABELS.en

  function openCookieSettings() {
    window.dispatchEvent(new Event('open-cookie-settings'))
  }

  if (pathname?.includes('/embed')) return null

  return (
    <footer className="border-t border-white/20 bg-black text-white mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-6">

        <div className="flex flex-col gap-1.5">
          <span className="text-lg font-bold tracking-tight">Fractera</span>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white font-medium">
          <a href={`/${lang}/privacy`} className="hover:text-violet-400 transition-colors">{t.privacy}</a>
          <a href={`/${lang}/terms`} className="hover:text-violet-400 transition-colors">{t.terms}</a>
          <a href={`/${lang}/refund`} className="hover:text-violet-400 transition-colors">{t.refund}</a>
          <a href={`/${lang}/cookies`} className="hover:text-violet-400 transition-colors">{t.cookies}</a>
          <a href={`/${lang}/partners`} className="hover:text-violet-400 transition-colors">{t.partners}</a>
          <a href={`/${lang}/regional-partners`} className="hover:text-violet-400 transition-colors">{t.regionalPartners}</a>
          <a href="/mcp-info" className="hover:text-violet-400 transition-colors">{t.knowledgeBase}</a>
          <a href="/ai-workspace-architect" className="hover:text-violet-400 transition-colors">{t.architecture}</a>
          <a href="/ai-development-loop" className="hover:text-violet-400 transition-colors">{t.developmentLoop}</a>
          <button
            type="button"
            onClick={openCookieSettings}
            className="hover:text-violet-400 transition-colors text-left"
          >
            {t.cookieSettings}
          </button>
        </div>

        {/* Table of contents — animated scroll to landing sections */}
        <div className="flex flex-col gap-3 border-t border-white/20 pt-6">
          <p className="text-xs font-mono font-bold text-white/50 uppercase tracking-widest">{t.tocLabel}</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/75 font-medium">
            {t.toc.map(item => (
              <a
                key={item.id}
                href={`/${lang}#${item.id}`}
                className="hover:text-violet-400 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-white border-t border-white/20 pt-6">
          <div className="flex flex-col gap-1">
            <span>© {new Date().getFullYear()} Fractera, Inc. {t.rights}</span>
            <span className="text-xs text-white/45">1111B S Governors Ave STE 45122, Dover, DE 19904, USA</span>
          </div>
          <div className="flex items-center w-full justify-between sm:w-auto sm:justify-start gap-3">
            <div className="flex items-center gap-1">
              <a
                href="https://github.com/Fractera/ai-workspace"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                title="GitHub"
                className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-white/15 text-white/70 hover:text-white hover:border-white/40 hover:bg-white/[0.04] transition-colors"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M12 .5a11.5 11.5 0 0 0-3.633 22.41c.575.106.787-.25.787-.555 0-.273-.01-1-.016-1.964-3.2.695-3.877-1.542-3.877-1.542-.523-1.33-1.278-1.685-1.278-1.685-1.045-.714.08-.7.08-.7 1.156.082 1.764 1.187 1.764 1.187 1.027 1.76 2.695 1.252 3.353.957.104-.745.402-1.252.73-1.54-2.555-.292-5.243-1.278-5.243-5.687 0-1.256.45-2.284 1.186-3.088-.119-.293-.514-1.466.113-3.054 0 0 .967-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.202-1.49 3.168-1.18 3.168-1.18.628 1.588.233 2.761.114 3.054.74.804 1.186 1.832 1.186 3.088 0 4.42-2.694 5.392-5.26 5.676.413.355.78 1.06.78 2.137 0 1.543-.014 2.787-.014 3.166 0 .308.21.667.793.553A11.5 11.5 0 0 0 12 .5Z"/>
                </svg>
              </a>
              <a
                href="https://t.me/fractera"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                title="Telegram"
                className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-white/15 text-white/70 hover:text-white hover:border-white/40 hover:bg-white/[0.04] transition-colors"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M21.94 4.07a1.5 1.5 0 0 0-1.55-.27L3.24 10.34a1.16 1.16 0 0 0 .07 2.19l4.04 1.32 1.6 5.07a1.13 1.13 0 0 0 1.88.5l2.48-2.22 4.36 3.2a1.5 1.5 0 0 0 2.34-.92l3-13.92a1.5 1.5 0 0 0-1.07-1.49ZM9.7 14.94l-.4 4.18-1.2-3.78 8.43-7.42a.2.2 0 0 1 .25.32L9.7 14.94Z"/>
                </svg>
              </a>
              <a
                href="https://x.com/ikovalchuk15716?s=21"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                title="X (Twitter)"
                className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-white/15 text-white/70 hover:text-white hover:border-white/40 hover:bg-white/[0.04] transition-colors"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2H21.5l-7.5 8.575L23 22h-6.844l-5.36-7.012L4.6 22H1.34l8.04-9.193L1 2h7.014l4.844 6.405L18.244 2Zm-1.2 18h1.836L7.04 4H5.083L17.044 20Z"/>
                </svg>
              </a>
            </div>
            <LanguageSwitcher />
          </div>
        </div>

      </div>
    </footer>
  )
}
