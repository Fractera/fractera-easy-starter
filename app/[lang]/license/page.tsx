import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/seo/alternates'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  return { title: lang === 'ru' ? 'Лицензия' : 'License', alternates: buildAlternates(lang, '/license') }
}

type LicenseCopy = {
  title: string
  intro: string
  coreTitle: string
  core: string
  startersTitle: string
  starters: string
  l1Title: string
  l1: string
  note: string
  repoLink: string
}

const COPY: Record<string, LicenseCopy> = {
  en: {
    title: 'License',
    intro: 'Fractera is "Open Code" (source-available) — not OSI open source. The license differs by layer:',
    coreTitle: 'Core workspace (L2) — PolyForm Small Business 1.0.0',
    core: 'The Agent-Engineering-Infrastructure core is source-available: free for individuals and small businesses (under 100 people AND under $1M annual revenue). Larger companies need a separate commercial license — contact admin@fractera.ai.',
    startersTitle: 'Starters (FNS and future) — MIT',
    starters: 'The app starters are MIT-licensed: fork and use them freely, with no restrictions.',
    l1Title: 'Easy Starter (L1) — closed',
    l1: 'The deployment layer (billing, provisioning, dashboard) is closed-source and never opened.',
    note: 'We say "Open Code (source-available)", not "open source" — the OSI definition does not apply, and we avoid open-washing.',
    repoLink: 'View the full license texts on GitHub',
  },
  ru: {
    title: 'Лицензия',
    intro: 'Fractera — это «Open Code» (source-available), а не OSI open source. Лицензия различается по слоям:',
    coreTitle: 'Ядро workspace (L2) — PolyForm Small Business 1.0.0',
    core: 'Ядро Agent-Engineering-Infrastructure доступно как source-available: бесплатно физлицам и малому бизнесу (менее 100 человек И менее $1M годовой выручки). Крупным компаниям нужна отдельная коммерческая лицензия — admin@fractera.ai.',
    startersTitle: 'Стартеры (FNS и будущие) — MIT',
    starters: 'Стартеры приложений под лицензией MIT: форкайте и используйте свободно, без ограничений.',
    l1Title: 'Easy Starter (L1) — закрытый',
    l1: 'Слой развёртывания (биллинг, провижининг, дашборд) — closed-source, никогда не открывается.',
    note: 'Мы говорим «Open Code (source-available)», а не «open source» — определение OSI не применимо, и мы избегаем open-washing.',
    repoLink: 'Полные тексты лицензий на GitHub',
  },
}

export default async function LicensePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const t = COPY[lang] ?? COPY.en

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-20 flex flex-col gap-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-base text-white/70 leading-relaxed">{t.intro}</p>

        <div className="flex flex-col gap-6 text-base text-white/70 leading-relaxed">
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-white">{t.coreTitle}</h2>
            <p>{t.core}</p>
          </section>
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-white">{t.startersTitle}</h2>
            <p>{t.starters}</p>
          </section>
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-white">{t.l1Title}</h2>
            <p>{t.l1}</p>
          </section>
          <p className="text-sm text-white/45">{t.note}</p>
          <a
            href="https://github.com/Fractera/Agent-Engineering-Infrastructure/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
          >
            {t.repoLink} →
          </a>
        </div>
      </div>
    </main>
  )
}
