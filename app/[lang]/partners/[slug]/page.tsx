import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang, slug } = await params
  // Canonical lives on the main domain; the partners.fractera.ai alias is just
  // a friendly short URL — all link equity should accrue to fractera.ai.
  return {
    title: `Partner ${slug} — Fractera`,
    alternates: { canonical: `https://fractera.ai/${lang}/partners/${slug}` },
  }
}

export default async function PartnerSlugPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  const isRu = lang === 'ru'

  const partner = await db.partner.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      status: true,
      companyName: true,
      companyEmail: true,
      links: {
        where: { forPage: true },
        orderBy: [{ sortOrder: 'asc' }, { isDefault: 'desc' }, { createdAt: 'asc' }],
        select: { id: true, providerName: true, affiliateUrl: true, isDefault: true },
      },
    },
  })

  if (!partner || partner.status !== 'active') {
    notFound()
  }

  const pageLinks = partner.links
  const isConfigured = pageLinks.length > 0

  const t = isRu ? {
    label: 'Начать',
    h2: 'Разверните приватную AI-инфраструктуру на своём сервере',
    description: 'Установите Fractera на свой VPS и получите полную среду AI-разработки — полностью бесплатно и open source.',
    serverLabel: 'Где купить VPS',
    serverHeader: 'Проверенные VPS-провайдеры для AI-нагрузок',
    serverDescription: 'Fractera устанавливается на любой VPS с Ubuntu 24.04, 4 ядрами и 6 ГБ RAM. Партнёр рекомендует следующих провайдеров — клик откроет реферальную ссылку.',
    freeBadge: 'ВАШ СЕРВЕР',
    freeSub: 'Бесплатно — установка на VPS',
    features: [
      'Hermes — AI-оркестратор агентов',
      '5 платформ для кода',
      'LightRAG — мозг компании',
      'База данных, файлы, auth — из коробки',
      'Open source — навсегда на своём сервере',
    ],
    trust: ['Ваш сервер', 'Ваш домен', 'Ваш AI'],
    notConfiguredTitle: 'Страница ещё не настроена',
    notConfiguredBody: 'Партнёр пока не подключил ни одной партнёрской ссылки для этой страницы. Загляните позже или перейдите на основной сайт Fractera.',
    footerOperated: 'Сотрудничество с Fractera Partner Program',
    visit: 'fractera.ai',
  } : {
    label: 'Get Started',
    h2: 'Deploy Private AI Infrastructure on Your Own Server',
    description: 'Install Fractera on your own VPS and get the full AI development environment — completely free and open source.',
    serverLabel: 'Where to buy VPS',
    serverHeader: 'Recommended VPS Providers for AI Workloads',
    serverDescription: 'Fractera installs on any Ubuntu 24.04 VPS with 4 cores and 6 GB RAM. The partner recommends the providers below — clicking opens the referral link.',
    freeBadge: 'YOUR OWN SERVER',
    freeSub: 'Free — install on your VPS',
    features: [
      'Hermes — AI orchestration agent',
      '5 coding platforms',
      'LightRAG — the company brain',
      'Database, file storage & auth — built in',
      'Open source — self-hosted forever',
    ],
    trust: ['Your server', 'Your domain', 'Your AI'],
    notConfiguredTitle: 'Partner page is being prepared',
    notConfiguredBody: 'The partner has not yet connected any affiliate link for this page. Check back later or visit the main Fractera site.',
    footerOperated: 'Operated under the Fractera Partner Program',
    visit: 'fractera.ai',
  }

  const footerName = partner.companyName?.trim() || t.footerOperated
  const footerEmail = partner.companyEmail?.trim() || null

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-16 flex flex-col gap-12">

        {/* Hero + free card layout (mirrors landing pricing-flow section) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          <div className="flex flex-col gap-6 items-start text-left h-full">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{t.label}</p>
              <h1 className="font-serif font-bold leading-tight text-white text-3xl md:text-4xl lg:text-5xl">{t.h2}</h1>
              <p className="text-base text-white/60">{t.description}</p>
            </div>

            <div className="flex flex-col gap-3 w-full pt-4 border-t border-white/10 mt-auto">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{t.serverLabel}</p>
                <h2 className="text-base font-bold font-serif text-white">{t.serverHeader}</h2>
                <p className="text-xs text-white/50 leading-relaxed">{t.serverDescription}</p>
              </div>

              {isConfigured ? (
                <div className="flex flex-col gap-2">
                  {pageLinks.map(link => (
                    <a
                      key={link.id}
                      href={link.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="group w-full flex items-center justify-between gap-3 rounded-xl border border-white/20 hover:border-violet-500/60 bg-white/[0.03] hover:bg-violet-500/[0.06] px-5 py-3.5 transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">{link.providerName}</span>
                        {link.isDefault && (
                          <span className="text-xs font-mono text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/30">★</span>
                        )}
                      </span>
                      <span className="shrink-0 text-white/60 group-hover:text-violet-300 text-base font-bold transition-colors">↗</span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2 rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-4">
                  <p className="text-xs font-mono font-bold text-amber-300 uppercase tracking-widest">{t.notConfiguredTitle}</p>
                  <p className="text-sm text-white/70 leading-relaxed">{t.notConfiguredBody}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl p-6 bg-gradient-to-br from-emerald-950/70 via-emerald-900/30 to-black/60 border border-emerald-500/60 h-full">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 self-start">{t.freeBadge}</span>
              <h2 className="text-xl font-bold text-white mt-1">Fractera Light</h2>
              <p className="text-sm text-emerald-300/70 font-medium">{t.freeSub}</p>
            </div>
            <ul className="flex flex-col gap-1.5 text-sm text-white font-medium flex-1">
              {t.features.slice(0, 4).map((f, i) => (
                <li key={i} className="flex items-center gap-2"><span className="text-emerald-400">✓</span><span>{f}</span></li>
              ))}
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 shrink-0 mt-0.5">◈</span>
                <span className="text-white">{t.features[4]}</span>
              </li>
            </ul>
            <a
              href={`https://fractera.ai/${lang}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-lg shadow-emerald-500/30"
            >
              {t.visit} ↗
            </a>
          </div>
        </div>

        {/* Trust grid */}
        <div className="grid grid-cols-3 gap-3">
          {t.trust.map((item, i) => (
            <div key={i} className="flex items-center justify-center py-3 px-4 rounded-xl border border-white/15 bg-white/[0.03] text-sm font-bold text-white text-center tracking-wide">
              {item}
            </div>
          ))}
        </div>

        {/* Partner footer (the only piece that materially differs from the landing) */}
        <footer className="flex flex-col gap-2 pt-6 border-t border-white/10 text-center text-xs text-white/40">
          <p>{footerName}</p>
          {footerEmail && (
            <p>
              <a href={`mailto:${footerEmail}`} className="hover:text-white/70 transition-colors">{footerEmail}</a>
            </p>
          )}
          <p className="text-white/30">
            Powered by <a href={`https://fractera.ai/${lang}`} target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">Fractera</a>
          </p>
        </footer>

      </div>
    </main>
  )
}
