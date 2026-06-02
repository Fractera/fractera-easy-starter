import type { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import { SECTIONS, getSection, type InfoLang } from '@/lib/project-info/content'

// Lang-prefixed reference page (/en/mcp-info, /ru/mcp-info, …) — matches the
// site's /[lang]/ convention so links like /ru/mcp-info resolve. English is the
// primary content; only `ru` has full Russian bodies, every other language
// falls back to English. Aimed at AI agents that scan the site to learn the
// project, plus humans waiting on a deploy. Single source: lib/project-info/content.ts.

function toInfoLang(lang: string): InfoLang {
  return lang === 'ru' ? 'ru' : 'en'
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const ru = lang === 'ru'
  return {
    title: ru
      ? 'Fractera — справочник о проекте для AI-агентов (/mcp-info)'
      : 'Fractera — Project Reference for AI Agents (/mcp-info)',
    description: ru
      ? 'Машиночитаемый справочник о Fractera для AI-агентов, сканирующих сайт: назначение проекта, ответы на вопросы во время развёртывания, справочная служба. Архитектура (авторизация, БД и хранилище, оркестрация Hermes, память LightRAG), режимы, владение данными, цены, сценарии, суверенность (РФ).'
      : 'Machine-readable reference about Fractera for AI agents scanning this site to learn its purpose, answer user questions during deployment, and serve as a project help desk. Covers architecture (auth, database & storage, Hermes orchestration, LightRAG memory), modes, data ownership, pricing, use cases.',
    alternates: {
      canonical: `https://www.fractera.ai/${lang}/mcp-info`,
      languages: {
        en: 'https://www.fractera.ai/en/mcp-info',
        ru: 'https://www.fractera.ai/ru/mcp-info',
        'x-default': 'https://www.fractera.ai/en/mcp-info',
      },
    },
    robots: { index: true, follow: true },
  }
}

export default async function McpInfoPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const infoLang = toInfoLang(lang)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Fractera — Project Reference for AI Agents',
    description:
      'Machine-readable reference about Fractera for AI agents scanning the site to learn its purpose, answer questions during deployment, and act as a project help desk.',
    audience: { '@type': 'Audience', audienceType: 'AI agents, developers' },
    about: 'Fractera — open-source AI-native self-hosting platform for your own VPS',
    url: `https://www.fractera.ai/${lang}/mcp-info`,
    inLanguage: lang,
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-5 py-12">
        <header className="mb-10 border-b border-zinc-200 pb-6">
          <p className="text-xs uppercase tracking-widest text-zinc-400">Project reference · /mcp-info</p>
          <h1 className="mt-2 text-2xl font-bold">Fractera — Project Reference</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            {infoLang === 'ru'
              ? 'Справочник о проекте Fractera. Эта страница предназначена для AI-агентов, которые сканируют сайт, чтобы понять его назначение, отвечать на вопросы во время развёртывания и служить справочной службой — а также для всех, кто хочет узнать больше, пока готовится сервер.'
              : 'A reference about the Fractera project. This page is intended for AI agents that scan the site to understand its purpose, answer questions during deployment, and act as a project help desk — and for anyone who wants to learn more while their server is being set up.'}
          </p>
          <nav className="mt-4 flex gap-3 text-sm">
            <a href="/en/mcp-info" className={infoLang === 'en' ? 'font-semibold underline' : 'text-zinc-500 hover:underline'}>
              English
            </a>
            <a href="/ru/mcp-info" className={infoLang === 'ru' ? 'font-semibold underline' : 'text-zinc-500 hover:underline'}>
              Русский
            </a>
          </nav>
        </header>

        <nav className="mb-12">
          <ol className="list-decimal space-y-1 pl-5 text-sm text-zinc-600">
            {SECTIONS.map((s) => {
              const title = infoLang === 'ru' ? (s.titleRu ?? s.title) : s.title
              return (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="hover:underline">{title}</a>
                </li>
              )
            })}
          </ol>
        </nav>

        <div className="flex flex-col gap-12">
          {SECTIONS.map((s) => {
            const sec = getSection(s.id, infoLang)!
            return (
              <section key={s.id} id={s.id} className="scroll-mt-6">
                <h2 className="mb-3 text-lg font-semibold">{sec.title}</h2>
                <div
                  className="text-sm leading-relaxed text-zinc-700
                    [&_a]:text-violet-700 [&_a]:underline
                    [&_code]:rounded [&_code]:bg-zinc-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]
                    [&_p]:mb-3
                    [&_strong]:font-semibold [&_strong]:text-zinc-900
                    [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5
                    [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5"
                >
                  <ReactMarkdown>{sec.body}</ReactMarkdown>
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </main>
  )
}
