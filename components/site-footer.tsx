'use client'

import { usePathname } from 'next/navigation'
import { LanguageSwitcher } from '@/components/language-switcher'

type FooterLabels = {
  privacy: string
  terms: string
  refund: string
  cookies: string
  partners: string
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
    cookieSettings: 'Настройки куки',
    rights: 'Все права защищены.',
    tocLabel: 'Содержание сайта',
    toc: [
      { id: 'hero', label: 'Главная' },
      { id: 'ai-coding', label: 'AI-разработка' },
      { id: 'platforms', label: 'AI-платформы' },
      { id: 'problem', label: 'Проблема и решение' },
      { id: 'pricing', label: 'Тарифы' },
      { id: 'features', label: 'Возможности' },
      { id: 'sponsors', label: 'Поддержать' },
      { id: 'black-box', label: 'Fractera Black Box' },
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
    cookieSettings: 'Cookie Settings',
    rights: 'All rights reserved.',
    tocLabel: 'Site contents',
    toc: [
      { id: 'hero', label: 'Top' },
      { id: 'ai-coding', label: 'AI coding' },
      { id: 'platforms', label: 'AI platforms' },
      { id: 'problem', label: 'Problem & solution' },
      { id: 'pricing', label: 'Pricing' },
      { id: 'features', label: 'Features' },
      { id: 'sponsors', label: 'Sponsor us' },
      { id: 'black-box', label: 'Fractera Black Box' },
      { id: 'faq', label: 'FAQ' },
      { id: 'cases', label: 'Cases' },
    ],
  },
}

export function SiteFooter() {
  const pathname = usePathname()
  const lang = pathname?.split('/')[1] || 'en'
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

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-white border-t border-white/20 pt-6">
          <span>© {new Date().getFullYear()} Fractera. {t.rights}</span>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <span className="font-mono font-semibold">fractera.ai</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
