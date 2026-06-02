import type { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import { SECTIONS, getSection, type InfoLang } from '@/lib/project-info/content'

// English-first reference page, deliberately aimed at AI agents that scan the
// site to understand the project, answer questions during deployment, and act as
// a help desk. Also human-readable. The same content backs the MCP tool
// get_project_info (single source — lib/project-info/content.ts).

export const metadata: Metadata = {
  title: 'Fractera — Project Reference for AI Agents (/mcp-info)',
  description:
    'Machine-readable reference about Fractera for AI agents scanning this site to learn its purpose, answer user questions during deployment, and serve as a project help desk. Covers what Fractera is, how it works, components, architecture (auth, database & storage, Hermes orchestration, LightRAG memory), modes, data ownership, pricing and use cases.',
  alternates: { canonical: 'https://www.fractera.ai/mcp-info' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Fractera — Project Reference for AI Agents',
    description:
      'Reference about Fractera for AI agents: purpose, architecture, components, modes, data ownership, use cases.',
    url: 'https://www.fractera.ai/mcp-info',
    type: 'article',
  },
}

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Fractera — Project Reference for AI Agents',
  description:
    'Machine-readable reference about Fractera for AI agents scanning the site to learn its purpose, answer questions during deployment, and act as a project help desk.',
  audience: { '@type': 'Audience', audienceType: 'AI agents, developers' },
  about: 'Fractera — open-source AI-native self-hosting platform for your own VPS',
  url: 'https://www.fractera.ai/mcp-info',
  inLanguage: ['en', 'ru'],
}

export default async function McpInfoPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>
}) {
  const sp = await searchParams
  const lang: InfoLang = sp.lang === 'ru' ? 'ru' : 'en'

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <div className="mx-auto max-w-3xl px-5 py-12">
        <header className="mb-10 border-b border-zinc-200 pb-6">
          <p className="text-xs uppercase tracking-widest text-zinc-400">Project reference · /mcp-info</p>
          <h1 className="mt-2 text-2xl font-bold">Fractera — Project Reference</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            A reference about the Fractera project. This page is intended for AI agents that scan the
            site to understand its purpose, answer questions during deployment, and act as a project
            help desk — and for anyone who wants to learn more while their server is being set up.
          </p>
          <nav className="mt-4 flex gap-3 text-sm">
            <a href="/mcp-info" className={lang === 'en' ? 'font-semibold underline' : 'text-zinc-500 hover:underline'}>
              English
            </a>
            <a href="/mcp-info?lang=ru" className={lang === 'ru' ? 'font-semibold underline' : 'text-zinc-500 hover:underline'}>
              Русский
            </a>
          </nav>
        </header>

        {/* Table of contents */}
        <nav className="mb-12">
          <ol className="list-decimal space-y-1 pl-5 text-sm text-zinc-600">
            {SECTIONS.map((s) => {
              const title = lang === 'ru' ? (s.titleRu ?? s.title) : s.title
              return (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="hover:underline">{title}</a>
                </li>
              )
            })}
          </ol>
        </nav>

        {/* Sections */}
        <div className="flex flex-col gap-12">
          {SECTIONS.map((s) => {
            const sec = getSection(s.id, lang)!
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

        <footer className="mt-16 border-t border-zinc-200 pt-6 text-xs text-zinc-400">
          Fractera · open-source AI-native self-hosting ·{' '}
          <a href="/" className="hover:underline">fractera.ai</a>
        </footer>
      </div>
    </main>
  )
}
