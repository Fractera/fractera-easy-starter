import type { Metadata } from 'next'
import { SiteFooter } from '@/components/site-footer'
import { Body } from '@/lib/architect-page/markdown'
import {
  SECTIONS,
  ARCHITECT_META,
  ARCHITECT_URL,
  IMAGE_WIDE,
  IMAGE_MOBILE,
  IMAGE_SCREENSHOT,
  GITHUB_REPO,
} from '@/lib/architect-page/content'
import { ArchSchema } from './_components/arch-schema'
import { ZoomImage } from './_components/zoom-image.client'

// STATIC English reference about what Fractera AI Workspace is made of and how it
// works, built around the architecture illustration. ONE indexable URL with no
// language prefix (proxy passes it through), prerendered at build time. The MCP
// tool get_ai_workspace_architect_info() exposes the same content for AI agents.

export const dynamic = 'force-static'

// Canonical now points to the bilingual documentation replica (dark standard
// template, RU+EN). This scanner page stays live but defers ranking to the doc.
const CANONICAL_DOC_URL = 'https://www.fractera.ai/en/documentation/multi-agent-workspace-architecture'

export const metadata: Metadata = {
  title: ARCHITECT_META.title,
  description: ARCHITECT_META.description,
  alternates: { canonical: CANONICAL_DOC_URL },
  robots: { index: true, follow: true },
  openGraph: {
    title: ARCHITECT_META.title,
    description: ARCHITECT_META.description,
    url: ARCHITECT_URL,
    type: 'article',
    images: [{ url: IMAGE_WIDE, alt: 'Fractera Multi-Agent AI Workspace Architecture Diagram' }],
  },
}

// Two linked entities: the page (TechArticle) and the software it describes
// (SoftwareApplication) — the article's mainEntity, so Google understands this
// describes an open-source developer platform, not just an article.
const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: ARCHITECT_META.title,
    description: ARCHITECT_META.description,
    image: IMAGE_WIDE,
    audience: { '@type': 'Audience', audienceType: 'AI agents, developers' },
    about: 'Fractera AI agent platform architecture — Hermes multi-agent orchestrator, LightRAG Knowledge Graph RAG, five coding agents, MCP',
    url: ARCHITECT_URL,
    inLanguage: 'en',
    mainEntityOfPage: { '@type': 'WebPage', '@id': ARCHITECT_URL },
    mainEntity: { '@type': 'SoftwareApplication', '@id': 'https://www.fractera.ai/#software' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': 'https://www.fractera.ai/#software',
    name: 'Fractera AI Workspace',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Linux (Ubuntu VPS)',
    description: 'Open-source, self-hosted AI agent platform: multi-agent orchestration (Hermes), LightRAG Knowledge Graph memory, five coding agents, and MCP — deployed to your own VPS.',
    url: 'https://www.fractera.ai',
    isAccessibleForFree: true,
    license: 'https://opensource.org/licenses/MIT',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    sameAs: [GITHUB_REPO],
  },
]

export default function AiWorkspaceArchitectPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white text-zinc-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

      <div className="mx-auto w-full max-w-3xl flex-1 px-5 py-12">
        <header className="mb-8 border-b border-zinc-200 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-400">AI Workspace · architecture</p>
              <h1 className="mt-2 text-2xl font-bold">AI Workspace Architect — Open-Source AI Agent Platform</h1>
            </div>
            {/* Return to the site root */}
            <a href="/" aria-label="Fractera home" title="Fractera home" className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fractera-logo.jpg" alt="Fractera" width={40} height={40} className="h-10 w-10 rounded-lg border border-zinc-200 object-cover" />
            </a>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            A complete technical blueprint of Fractera — an <strong className="font-semibold text-zinc-900">open-source AI agent platform</strong> for
            automated software development: multi-agent orchestration, Knowledge Graph RAG, and seamless tool integration via MCP.
            Built for AI agents scanning the web and for developers who want the whole picture in one place. See also the{' '}
            <a href="/mcp-info" className="font-medium text-violet-700 underline hover:text-violet-900">project knowledge base</a>,
            or go back to{' '}
            <a href="/" className="font-medium text-violet-700 underline hover:text-violet-900">fractera.ai</a>.
          </p>
          {/* Social proof — star the open-source repo */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-100"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M12 .5a11.5 11.5 0 0 0-3.633 22.41c.575.106.787-.25.787-.555 0-.273-.01-1-.016-1.964-3.2.695-3.877-1.542-3.877-1.542-.523-1.33-1.278-1.685-1.278-1.685-1.045-.714.08-.7.08-.7 1.156.082 1.764 1.187 1.764 1.187 1.027 1.76 2.695 1.252 3.353.957.104-.745.402-1.252.73-1.54-2.555-.292-5.243-1.278-5.243-5.687 0-1.256.45-2.284 1.186-3.088-.119-.293-.514-1.466.113-3.054 0 0 .967-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.202-1.49 3.168-1.18 3.168-1.18.628 1.588.233 2.761.114 3.054.74.804 1.186 1.832 1.186 3.088 0 4.42-2.694 5.392-5.26 5.676.413.355.78 1.06.78 2.137 0 1.543-.014 2.787-.014 3.166 0 .308.21.667.793.553A11.5 11.5 0 0 0 12 .5Z" />
              </svg>
              Star Fractera on GitHub
            </a>
            <span className="text-xs text-zinc-400">Open-source · MIT · self-hosted</span>
          </div>
        </header>

        {/* Main illustration — wide on desktop (the canonical / semantic image),
            tall on phones. Both stay in the DOM; the wide one is the og:image. */}
        <figure className="mb-10">
          <div className="hidden md:block">
            <ZoomImage
              src={IMAGE_WIDE}
              alt="Fractera Multi-Agent AI Workspace Architecture Diagram - Web View"
              thumbClassName="w-full rounded-xl border border-zinc-200"
            />
          </div>
          <div className="mx-auto max-w-xs md:hidden">
            <ZoomImage
              src={IMAGE_MOBILE}
              alt="Fractera Self-Hosted AI Platform Mobile Architecture Schema"
              thumbClassName="w-full rounded-xl border border-zinc-200"
            />
          </div>
        </figure>

        {/* Table of contents — H2 sections */}
        <nav className="mb-12">
          <ol className="list-decimal space-y-1 pl-5 text-sm text-zinc-600">
            {SECTIONS.filter(s => s.level === 2).map(s => (
              <li key={s.id}><a href={`#${s.id}`} className="hover:underline">{s.title}</a></li>
            ))}
          </ol>
        </nav>

        <div className="flex flex-col gap-10">
          {SECTIONS.map(sec => (
            <section key={sec.id} id={sec.id} className={`scroll-mt-6 ${sec.level === 3 ? 'border-l-2 border-zinc-100 pl-4' : ''}`}>
              {sec.level === 2 ? (
                <h2 className="mb-3 text-lg font-semibold">{sec.title}</h2>
              ) : (
                <h3 className="mb-2 text-base font-semibold text-zinc-800">{sec.title}</h3>
              )}
              {sec.id === 'how-it-looks' && (
                <figure className="mb-4">
                  <ZoomImage
                    src={IMAGE_SCREENSHOT}
                    alt="Fractera Open Source AI Agent Admin Panel Screenshot"
                    thumbClassName="w-full rounded-xl border border-zinc-200"
                  />
                </figure>
              )}
              <Body body={sec.body} idp={sec.id} />
              {sec.id === 'how-it-works' && (
                <div className="mt-6 rounded-xl border border-violet-200 bg-violet-50/60 p-5">
                  <p className="text-sm font-semibold text-zinc-900">Ready to build your own AI development workspace?</p>
                  <p className="mt-1 text-sm text-zinc-600">
                    Deploy this whole stack to your own VPS in about 10 minutes — one click, no configuration.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <a
                      href="/en/deployments/vps#pricing"
                      className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-500"
                    >
                      Deploy your instance
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </a>
                    <a
                      href={GITHUB_REPO}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-bold text-zinc-800 hover:bg-zinc-100"
                    >
                      Get started on GitHub
                    </a>
                  </div>
                  <p className="mt-3 text-xs text-zinc-500">
                    See how teams ship faster with this architecture in our{' '}
                    <a href="/en/cases" className="font-medium text-violet-700 underline hover:text-violet-900">use cases</a>.
                  </p>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Conclusion — the full /ai-core entity schema, static and fully expanded */}
        <section id="schema" className="mt-12 scroll-mt-6">
          <h2 className="mb-1 text-lg font-semibold">The full workspace map</h2>
          <p className="mb-4 text-sm leading-relaxed text-zinc-600">
            Explore the detailed interactive schema below to understand every component of this AI agent platform
            architecture. Every running entity is drawn the way a request flows — behind nginx and the auth gate, then
            the app, data and admin layers, plus the documentation corpus that feeds Company Memory.
          </p>
          <ArchSchema />
        </section>
      </div>

      <SiteFooter />
    </main>
  )
}
