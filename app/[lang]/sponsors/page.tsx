import { db } from '@/lib/db'

type SponsorPublic = {
  email: string
  tier: 's1' | 's5' | 's20'
  flag: string
  since: string
  isDemo?: boolean
}

// PAID_PLAN_HIDDEN — НЕ УДАЛЯТЬ: фейковые demo-спонсоры для иллюстрации страницы
// пока реальных нет. Помечаются isDemo=true, чтобы при появлении настоящих
// можно было отфильтровать. Mix: 1 RU + 1 FR + 2 US.
const DEMO_SPONSORS: SponsorPublic[] = [
  { email: 'a***@gmail.com',       tier: 's20', flag: '🇺🇸', since: '2026-02-14', isDemo: true },
  { email: 'm***@yandex.ru',       tier: 's20', flag: '🇷🇺', since: '2026-03-02', isDemo: true },
  { email: 'j***@hotmail.com',     tier: 's5',  flag: '🇺🇸', since: '2026-03-19', isDemo: true },
  { email: 'p***@orange.fr',       tier: 's5',  flag: '🇫🇷', since: '2026-04-08', isDemo: true },
]

function maskEmail(email: string | null | undefined): string {
  if (!email) return '—'
  const [local, domain] = email.split('@')
  if (!local || !domain) return email
  const masked = local[0] + '***'
  return `${masked}@${domain}`
}

export default async function SponsorsPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const isRu = lang === 'ru'

  const real = await db.sponsorship.findMany({
    where: { status: 'active' },
    include: { user: { select: { email: true } } },
    orderBy: [{ tier: 'desc' }, { createdAt: 'asc' }],
  }).catch(() => [])

  const realPublic: SponsorPublic[] = real.map(s => ({
    email: maskEmail(s.user.email),
    tier: (s.tier as 's1' | 's5' | 's20'),
    flag: '⭐',
    since: (s.firstPaymentAt ?? s.createdAt).toISOString().slice(0, 10),
  }))

  // Show demo only if we don't have enough real sponsors yet
  const all = [...realPublic, ...(realPublic.length < 4 ? DEMO_SPONSORS : [])]

  const grouped = {
    s20: all.filter(s => s.tier === 's20'),
    s5:  all.filter(s => s.tier === 's5'),
    s1:  all.filter(s => s.tier === 's1'),
  }

  const t = isRu ? {
    badge: 'Спонсоры',
    h1: 'Люди, которые поддерживают Fractera',
    subtitle: 'Этот проект существует благодаря добровольной поддержке. Спасибо каждому, кто делает Fractera возможной.',
    tiers: {
      s20: { label: 'Чемпионы · $20/мес', sublabel: 'Особая благодарность' },
      s5:  { label: 'Сторонники · $5/мес', sublabel: 'Топливо для дорожной карты' },
      s1:  { label: 'Кофейный тир · $1/мес', sublabel: 'Каждый доллар важен' },
    },
    sinceLabel: 'С',
    demoBadge: 'demo',
    ctaTitle: 'Присоединяйтесь к ним',
    ctaBody: 'Сделайте Fractera быстрее, стабильнее и открытее.',
    ctaButton: 'Стать спонсором',
    emptyTier: 'Пока никого — будьте первым',
    notesTitle: 'О приватности',
    notes: [
      'Имейлы маскируются (показывается только первая буква). Реальный адрес видит только админ.',
      'Если вы предпочитаете полную анонимность — напишите на admin@fractera.ai после оплаты.',
      'Спонсоры также получают доступ в закрытую Telegram-группу проекта.',
    ],
  } : {
    badge: 'Sponsors',
    h1: 'The people keeping Fractera alive',
    subtitle: 'This project exists thanks to voluntary support. Thank you to everyone who makes Fractera possible.',
    tiers: {
      s20: { label: 'Champions · $20/mo', sublabel: 'Highest gratitude tier' },
      s5:  { label: 'Supporters · $5/mo', sublabel: 'Roadmap fuel' },
      s1:  { label: 'Coffee tier · $1/mo', sublabel: 'Every dollar counts' },
    },
    sinceLabel: 'Since',
    demoBadge: 'demo',
    ctaTitle: 'Join them',
    ctaBody: 'Make Fractera faster, more stable, and more open.',
    ctaButton: 'Become a sponsor',
    emptyTier: 'No sponsors yet — be the first',
    notesTitle: 'About privacy',
    notes: [
      'Emails are masked (only the first letter is shown). Real addresses are visible only to the admin.',
      'If you prefer full anonymity — email admin@fractera.ai after payment.',
      'Sponsors also get access to the private Telegram group.',
    ],
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Fractera', item: 'https://fractera.ai' },
      { '@type': 'ListItem', position: 2, name: t.badge, item: `https://fractera.ai/${lang}/sponsors` },
    ],
  }

  const tierAccents = {
    s20: { ring: 'border-yellow-400/50', glow: 'shadow-[0_0_24px_-8px_rgba(250,204,21,0.35)]', chip: 'text-yellow-300 bg-yellow-500/10 border-yellow-500/50' },
    s5:  { ring: 'border-yellow-500/30', glow: '',                                              chip: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
    s1:  { ring: 'border-white/15',      glow: '',                                              chip: 'text-white/70 bg-white/[0.04] border-white/20' },
  } as const

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 py-20 flex flex-col gap-16">

          {/* Header */}
          <div className="flex flex-col gap-4 items-start md:items-center md:text-center">
            <span className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-widest border border-yellow-500/40 bg-yellow-500/[0.06] px-3 py-1 rounded-full">
              {t.badge}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight text-white leading-tight max-w-3xl">
              {t.h1}
            </h1>
            <p className="text-lg text-white/60 leading-relaxed max-w-2xl">
              {t.subtitle}
            </p>
          </div>

          {/* Tier groups */}
          {(['s20', 's5', 's1'] as const).map(tier => {
            const accent = tierAccents[tier]
            const tierMeta = t.tiers[tier]
            const list = grouped[tier]
            return (
              <section key={tier} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl md:text-2xl font-bold text-white">{tierMeta.label}</h2>
                  <p className="text-sm text-white/50">{tierMeta.sublabel}</p>
                </div>

                {list.length === 0 ? (
                  <div className="rounded-2xl border border-white/15 bg-white/[0.02] p-6 text-sm text-white/40 text-center">
                    {t.emptyTier}
                  </div>
                ) : (
                  <div className={`grid grid-cols-1 ${tier === 's20' ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-3`}>
                    {list.map((s, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-4 rounded-2xl border ${accent.ring} ${accent.glow} bg-gradient-to-br from-neutral-900/60 to-black/60 px-4 py-3.5`}
                      >
                        <span className="text-2xl shrink-0" aria-hidden="true">{s.flag}</span>
                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-white truncate">{s.email}</span>
                            {s.isDemo && (
                              <span className="text-[9px] font-mono text-white/40 border border-white/15 px-1.5 rounded uppercase tracking-widest shrink-0">
                                {t.demoBadge}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-white/40">{t.sinceLabel} {s.since}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )
          })}

          {/* Privacy notes */}
          <div className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/[0.02] p-6">
            <p className="text-xs font-mono font-bold text-white/50 uppercase tracking-widest">
              {t.notesTitle}
            </p>
            <ul className="flex flex-col gap-2">
              {t.notes.map((n, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-white/70 leading-relaxed">
                  <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-yellow-400/60 mt-2" />
                  {n}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-5 items-center text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">{t.ctaTitle}</h2>
            <p className="text-base text-white/60 max-w-md leading-relaxed">{t.ctaBody}</p>
            <a
              href={`/${lang}#sponsorship`}
              className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-yellow-500/20"
            >
              {t.ctaButton} →
            </a>
          </div>

        </div>
      </main>
    </>
  )
}
