import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { getSectionList, getSection } from '@/lib/project-info/content'
import { SiteFooter } from '@/components/site-footer'

// STATIC English knowledge base about the whole project = a full copy of the
// landing content (incl. the entire FAQ) + the architecture/technical sections.
// Fully prerendered at build time (force-static) — ONE indexable URL, zero
// per-request server cost. English only. Sections carry #anchors so a section
// can be sliced out (e.g. by nginx / an API) without rendering anything per call.
// The MCP tool get_project_info() exposes the same content for AI agents.

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Fractera — Project Knowledge Base for AI Agents (/mcp-info)',
  description:
    'Static, machine-readable knowledge base about Fractera for AI agents scanning this site: full project overview, capabilities, browser workspace, problems & solutions, pricing, features, AI Company Brain, regional partners, sponsorship, the complete FAQ, and the deep architecture (auth, database & storage, Hermes orchestration, LightRAG memory, modes, secure transition).',
  alternates: { canonical: 'https://www.fractera.ai/mcp-info' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Fractera — Project Knowledge Base',
    description:
      'Static reference about Fractera: overview, architecture, components, modes, data ownership, pricing, FAQ, use cases.',
    url: 'https://www.fractera.ai/mcp-info',
    type: 'article',
  },
}

const FAQ_ITEMS = [
  {
    q: 'What is the Fractera MCP connector used for?',
    a: 'The Fractera MCP connector lets Claude (and any MCP-compatible AI assistant) deploy a private Fractera Agentic Engineering Infrastructure directly from the chat. It asks a few questions and calls a single tool that provisions a VPS, runs the install, and streams real-time progress — no manual setup required.',
  },
  {
    q: 'Does Fractera work without a custom domain?',
    a: 'Yes. The default deploy is "IP-first": your workspace goes live at http://<your-IP>:3002 in about 10 minutes, with no DNS or certificate wait. Attaching your own domain with HTTPS is an optional later step done from inside the workspace (Admin → Personal Domain).',
  },
  {
    q: 'Is Fractera Open Code and self-hosted?',
    a: 'Yes. The Agentic Engineering Infrastructure layer (the L2 that runs on your VPS) is Open Code — source-available under the PolyForm Small Business license: free for individuals and small businesses, with a separate commercial license for larger companies. It runs entirely on your own VPS — no data leaves your server. You own the code, the database, and the AI memory.',
  },
]

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Fractera — Project Knowledge Base for AI Agents',
    description:
      'Static knowledge base about Fractera for AI agents scanning the site to learn its purpose, answer questions during deployment, and act as a project help desk.',
    audience: { '@type': 'Audience', audienceType: 'AI agents, developers' },
    about: 'Fractera — Open Code (source-available) AI-native self-hosting platform for your own VPS',
    url: 'https://www.fractera.ai/mcp-info',
    inLanguage: 'en',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Fractera', item: 'https://www.fractera.ai/' },
      { '@type': 'ListItem', position: 2, name: 'Project Knowledge Base', item: 'https://www.fractera.ai/mcp-info' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  },
]

// --- tiny dependency-free markdown rendering (bold, code, lists, paragraphs) ---

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  // bold | inline-code | [text](url)
  const re = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    if (m[1] !== undefined) {
      nodes.push(<strong key={`${keyPrefix}-b${i}`} className="font-semibold text-zinc-900">{m[1]}</strong>)
    } else if (m[2] !== undefined) {
      nodes.push(
        <code key={`${keyPrefix}-c${i}`} className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.85em]">{m[2]}</code>,
      )
    } else {
      const href = m[4]
      const external = /^https?:/.test(href)
      nodes.push(
        <a
          key={`${keyPrefix}-a${i}`}
          href={href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="font-medium text-violet-700 underline hover:text-violet-900"
        >
          {m[3]}
        </a>,
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
  | { kind: 'hr' }

function parseBody(body: string): Block[] {
  const blocks: Block[] = []
  let list: { kind: 'ul' | 'ol'; items: string[] } | null = null
  let para: string[] = []
  const flushPara = () => { if (para.length) { blocks.push({ kind: 'p', text: para.join(' ') }); para = [] } }
  const flushList = () => { if (list) { blocks.push(list); list = null } }

  for (const raw of body.split('\n')) {
    const line = raw.trim()
    if (!line) { flushPara(); flushList(); continue }
    if (line === '---') { flushPara(); flushList(); blocks.push({ kind: 'hr' }); continue }
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
        if (b.kind === 'hr') return <hr key={`${idp}-hr${i}`} className="my-2 border-zinc-200" />
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

export default function McpInfoPage() {
  const list = getSectionList('en')

  return (
    <main className="flex min-h-screen flex-col bg-white text-zinc-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <div className="mx-auto w-full max-w-3xl flex-1 px-5 py-12">
        {/* Breadcrumb — matches the BreadcrumbList JSON-LD above */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-zinc-400">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><a href="/" className="hover:text-zinc-700 hover:underline">Fractera</a></li>
            <li aria-hidden className="text-zinc-300">/</li>
            <li aria-current="page" className="text-zinc-500">Project Knowledge Base</li>
          </ol>
        </nav>

        <header className="mb-10 border-b border-zinc-200 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-400">Project knowledge base · /mcp-info</p>
              <h1 className="mt-2 text-2xl font-bold">Fractera — Project Knowledge Base</h1>
            </div>
            <a href="/" aria-label="Fractera home" title="Fractera home" className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fractera-logo.jpg" alt="Fractera" width={40} height={40} className="h-10 w-10 rounded-lg border border-zinc-200 object-cover" />
            </a>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            A complete reference about the Fractera project — landing content and deep architecture. This page is
            intended for AI agents that scan the site to understand its purpose, answer questions during deployment,
            and act as a project help desk — and for anyone who wants to learn more while their server is being set up.
            For the visual architecture, see the{' '}
            <a href="/ai-workspace-architect" className="font-medium text-violet-700 underline hover:text-violet-900">Agentic Engineering Infrastructure architecture</a>{' '}
            page, or go back to{' '}
            <a href="/" className="font-medium text-violet-700 underline hover:text-violet-900">fractera.ai</a>.
          </p>
        </header>

        <nav className="mb-12">
          <ol className="list-decimal space-y-1 pl-5 text-sm text-zinc-600">
            {list.map((s) => (
              <li key={s.id}><a href={`#${s.id}`} className="hover:underline">{s.title}</a></li>
            ))}
          </ol>
        </nav>

        <div className="flex flex-col gap-12">
          {list.map((entry) => {
            const sec = getSection(entry.id, 'en')!
            return (
              <section key={sec.id} id={sec.id} className="scroll-mt-6">
                <h2 className="mb-3 text-lg font-semibold">{sec.title}</h2>
                <Body body={sec.body} idp={sec.id} />
              </section>
            )
          })}
        </div>

        {/* FAQ — mirrors the FAQPage JSON-LD above (rich-result eligible) */}
        <section aria-labelledby="faq-heading" className="mt-16 border-t border-zinc-200 pt-10">
          <h2 id="faq-heading" className="mb-6 text-lg font-semibold">Frequently asked questions</h2>
          <dl className="flex flex-col gap-4">
            {FAQ_ITEMS.map((f, i) => (
              <div key={i} className="rounded-xl border border-zinc-200 bg-zinc-50 p-5">
                <dt className="text-sm font-semibold text-zinc-900">{f.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-zinc-600">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <footer className="mt-16 border-t border-zinc-200 pt-6 text-xs text-zinc-400">
          <p>Fractera · Open Code AI-native self-hosting · <a href="/" className="hover:underline">fractera.ai</a></p>
          {/* MCP registry listings */}
          <p className="mt-4 text-xs text-zinc-400">Find this MCP connector in:</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <a href="https://smithery.ai/servers/admin-add5/fractera" target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://smithery.ai/badge/admin-add5/fractera" alt="Fractera on Smithery" />
            </a>
            <a href="https://mcp.so/server/fractera" target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-400 hover:text-zinc-600 hover:underline">
              mcp.so
            </a>
            <a href="https://glama.ai/mcp/servers" target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-400 hover:text-zinc-600 hover:underline">
              Glama
            </a>
          </div>
        </footer>
      </div>

      <SiteFooter />
    </main>
  )
}
