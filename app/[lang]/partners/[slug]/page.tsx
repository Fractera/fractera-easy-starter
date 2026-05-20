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
    robots: { index: true, follow: true },
    alternates: {
      canonical: `https://fractera.ai/${lang}/partners/${slug}`,
    },
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
      links: {
        where: { isDefault: true },
        select: { providerName: true, affiliateUrl: true },
        take: 1,
      },
    },
  })

  if (!partner || partner.status !== 'active') {
    notFound()
  }

  const defaultLink = partner.links[0] ?? null

  const t = isRu ? {
    badge: 'Партнёрская страница · placeholder',
    welcome: 'Партнёр',
    intro: 'Это персональная страница партнёра. Инфраструктура работает: маршрутизация на основе хоста + рендеринг с подменой партнёрской ссылки. Полноценный лендинг с подменой Contabo-URL появится в следующем шаге разработки.',
    configuredLink: 'Настроенная партнёрская ссылка',
    noLink: 'Партнёрская ссылка пока не настроена',
    noLinkBody: 'Партнёр ещё не подключил партнёрскую ссылку в Dashboard.',
    visit: 'Перейти на fractera.ai',
  } : {
    badge: 'Partner page · placeholder',
    welcome: 'Partner',
    intro: 'This is the personal partner page. The infrastructure works: host-based routing + rendering with affiliate-link substitution. A full landing mirror with the Contabo URL swap lands in the next development step.',
    configuredLink: 'Configured affiliate link',
    noLink: 'No affiliate link yet',
    noLinkBody: 'Partner has not configured a default affiliate link in the Dashboard yet.',
    visit: 'Visit fractera.ai',
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-2xl flex flex-col gap-6 text-center">
        <span className="self-center text-xs font-mono font-bold text-violet-400 uppercase tracking-widest border border-violet-500/30 bg-violet-500/[0.06] px-3 py-1 rounded-full">
          {t.badge}
        </span>
        <h1 className="text-3xl md:text-4xl font-bold font-serif leading-tight">
          {t.welcome} — <span className="text-violet-300 font-mono">{partner.slug}</span>
        </h1>
        <p className="text-base text-white/65 leading-relaxed">{t.intro}</p>

        {defaultLink ? (
          <div className="flex flex-col gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-5 text-left">
            <p className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-widest">{t.configuredLink}</p>
            <p className="text-sm text-white">
              <strong>{defaultLink.providerName}</strong> →{' '}
              <a
                href={defaultLink.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-300 hover:text-emerald-200 font-mono break-all"
              >
                {defaultLink.affiliateUrl}
              </a>
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-5">
            <p className="text-xs font-mono font-bold text-amber-300 uppercase tracking-widest">{t.noLink}</p>
            <p className="text-sm text-white/75 leading-relaxed">{t.noLinkBody}</p>
          </div>
        )}

        <a
          href="https://fractera.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="self-center mt-2 inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
        >
          {t.visit} ↗
        </a>
      </div>
    </main>
  )
}
