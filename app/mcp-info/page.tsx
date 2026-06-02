import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { SECTIONS, getSection, type InfoLang } from '@/lib/project-info/content'

// SINGLE canonical reference page at the bare root /mcp-info — intentionally NOT
// under /[lang], so there is exactly ONE indexable URL (no per-language
// duplicates). proxy.ts has an explicit pass-through for /mcp-info so it is
// served here directly instead of being redirected to /<lang>/mcp-info.
// Bilingual via ?lang=ru (canonical always points to the bare /mcp-info, so the
// toggle never creates a duplicate indexable page). Dependency-free markdown
// rendering (bold / code / bullet & numbered lists / paragraphs) — no external
// library, which keeps the route robust.

export const metadata: Metadata = {
  title: 'Fractera — Project Reference for AI Agents (/mcp-info)',
  description:
    'Machine-readable reference about Fractera for AI agents scanning this site to learn its purpose, answer user questions during deployment, and serve as a project help desk. Covers architecture (auth, database & storage, Hermes orchestration, LightRAG memory), modes, data ownership, pricing, use cases, regional partners and Russia-specific sovereignty.',
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

// --- tiny dependency-free markdown rendering (bold, code, lists, paragraphs) ---

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const re = /\*\*([^*]+)\*\*|`([^`]+)`/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    if (m[1] !== undefined) {
      nodes.push(<strong key={`${keyPrefix}-b${i}`} className="font-semibold text-zinc-900">{m[1]}</strong>)
    } else {
      nodes.push(
        <code key={`${keyPrefix}-c${i}`} className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.85em]">{m[2]}</code>,
      )
    }
    last = re.lastIndex
    i++
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

type Block =
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }

function parseBody(body: string): Block[] {
  const blocks: Block[] = []
  let list: { kind: 'ul' | 'ol'; items: string[] } | null = null
  let para: string[] = []
  const flushPara = () => { if (para.length) { blocks.push({ kind: 'p', text: para.join(' ') }); para = [] } }
  const flushList = () => { if (list) { blocks.push(list); list = null } }

  for (const raw of body.split('\n')) {
    const line = raw.trim()
    if (!line) { flushPara(); flushList(); continue }
    const bullet = line.match(/^-\s+(.*)/)
    const numbered = line.match(/^\d+\.\s+(.*)/)
    if (bullet) {
      flushPara()
      if (!list || list.kind !== 'ul') { flushList(); list = { kind: 'ul', items: [] } }
      list.items.push(bullet[1])
    } else if (numbered) {
      flushPara()
      if (!list || list.kind !== 'ol') { flushList(); list = { kind: 'ol', items: [] } }
      list.items.push(numbered[1])
    } else {
      flushList()
      para.push(line)
    }
  }
  flushPara(); flushList()
  return blocks
}

function Body({ body, idp }: { body: string; idp: string }) {
  const blocks = parseBody(body)
  return (
    <div className="flex flex-col gap-3 text-sm leading-relaxed text-zinc-700">
      {blocks.map((b, i) => {
        if (b.kind === 'p') return <p key={`${idp}-p${i}`}>{renderInline(b.text, `${idp}-p${i}`)}</p>
        const cls = b.kind === 'ul' ? 'list-disc' : 'list-decimal'
        const Tag = b.kind === 'ul' ? 'ul' : 'ol'
        return (
          <Tag key={`${idp}-l${i}`} className={`${cls} space-y-1 pl-5`}>
            {b.items.map((it, j) => <li key={`${idp}-l${i}-${j}`}>{renderInline(it, `${idp}-l${i}-${j}`)}</li>)}
          </Tag>
        )
      })}
    </div>
  )
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <div className="mx-auto max-w-3xl px-5 py-12">
        <header className="mb-10 border-b border-zinc-200 pb-6">
          <p className="text-xs uppercase tracking-widest text-zinc-400">Project reference · /mcp-info</p>
          <h1 className="mt-2 text-2xl font-bold">Fractera — Project Reference</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            {lang === 'ru'
              ? 'Справочник о проекте Fractera. Эта страница предназначена для AI-агентов, сканирующих сайт, чтобы понять его назначение, отвечать на вопросы во время развёртывания и служить справочной службой — а также для всех, кто хочет узнать больше, пока готовится сервер.'
              : 'A reference about the Fractera project. This page is intended for AI agents that scan the site to understand its purpose, answer questions during deployment, and act as a project help desk — and for anyone who wants to learn more while their server is being set up.'}
          </p>
          <nav className="mt-4 flex gap-3 text-sm">
            <a href="/mcp-info" className={lang === 'en' ? 'font-semibold underline' : 'text-zinc-500 hover:underline'}>English</a>
            <a href="/mcp-info?lang=ru" className={lang === 'ru' ? 'font-semibold underline' : 'text-zinc-500 hover:underline'}>Русский</a>
          </nav>
        </header>

        <nav className="mb-12">
          <ol className="list-decimal space-y-1 pl-5 text-sm text-zinc-600">
            {SECTIONS.map((s) => {
              const title = lang === 'ru' ? (s.titleRu ?? s.title) : s.title
              return <li key={s.id}><a href={`#${s.id}`} className="hover:underline">{title}</a></li>
            })}
          </ol>
        </nav>

        <div className="flex flex-col gap-12">
          {SECTIONS.map((s) => {
            const sec = getSection(s.id, lang)!
            return (
              <section key={s.id} id={s.id} className="scroll-mt-6">
                <h2 className="mb-3 text-lg font-semibold">{sec.title}</h2>
                <Body body={sec.body} idp={s.id} />
              </section>
            )
          })}
        </div>

        <footer className="mt-16 border-t border-zinc-200 pt-6 text-xs text-zinc-400">
          Fractera · open-source AI-native self-hosting · <a href="/" className="hover:underline">fractera.ai</a>
        </footer>
      </div>
    </main>
  )
}
