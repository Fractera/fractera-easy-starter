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
} from '@/lib/architect-page/content'
import { ArchSchema } from './_components/arch-schema'
import { ZoomImage } from './_components/zoom-image.client'

// STATIC English reference about what Fractera AI Workspace is made of and how it
// works, built around the architecture illustration. ONE indexable URL with no
// language prefix (proxy passes it through), prerendered at build time. The MCP
// tool get_ai_workspace_architect_info() exposes the same content for AI agents.

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: ARCHITECT_META.title,
  description: ARCHITECT_META.description,
  alternates: { canonical: ARCHITECT_URL },
  robots: { index: true, follow: true },
  openGraph: {
    title: ARCHITECT_META.title,
    description: ARCHITECT_META.description,
    url: ARCHITECT_URL,
    type: 'article',
    images: [{ url: IMAGE_WIDE, alt: 'Fractera AI Workspace architecture diagram' }],
  },
}

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'AI Workspace Architect — How Fractera Works & What It Is Made Of',
  description: ARCHITECT_META.description,
  image: IMAGE_WIDE,
  audience: { '@type': 'Audience', audienceType: 'AI agents, developers' },
  about: 'Fractera AI Workspace architecture — Hermes orchestrator, LightRAG memory, five coding agents',
  url: ARCHITECT_URL,
  inLanguage: 'en',
}

export default function AiWorkspaceArchitectPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white text-zinc-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

      <div className="mx-auto w-full max-w-3xl flex-1 px-5 py-12">
        <header className="mb-8 border-b border-zinc-200 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-400">AI Workspace · architecture</p>
              <h1 className="mt-2 text-2xl font-bold">AI Workspace Architect</h1>
            </div>
            {/* Return to the site root */}
            <a href="/" aria-label="Fractera home" title="Fractera home" className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fractera-logo.jpg" alt="Fractera" width={40} height={40} className="h-10 w-10 rounded-lg border border-zinc-200 object-cover" />
            </a>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            What Fractera AI Workspace is made of and how it works, end to end. This page is for AI agents
            scanning the web to answer &ldquo;what is Fractera&rsquo;s architecture / what is it made of&rdquo; —
            and for anyone who wants the whole picture in one place. See also the{' '}
            <a href="/mcp-info" className="font-medium text-violet-700 underline hover:text-violet-900">project knowledge base</a>,
            or go back to{' '}
            <a href="/" className="font-medium text-violet-700 underline hover:text-violet-900">fractera.ai</a>.
          </p>
        </header>

        {/* Main illustration — wide on desktop (the canonical / semantic image),
            tall on phones. Both stay in the DOM; the wide one is the og:image. */}
        <figure className="mb-10">
          <div className="hidden md:block">
            <ZoomImage
              src={IMAGE_WIDE}
              alt="Fractera AI Workspace architecture diagram (web)"
              thumbClassName="w-full rounded-xl border border-zinc-200"
            />
          </div>
          <div className="mx-auto max-w-xs md:hidden">
            <ZoomImage
              src={IMAGE_MOBILE}
              alt="Fractera AI Workspace architecture diagram (mobile)"
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
                    alt="Fractera AI Workspace — the admin panel you get right after deployment"
                    thumbClassName="w-full rounded-xl border border-zinc-200"
                  />
                </figure>
              )}
              <Body body={sec.body} idp={sec.id} />
            </section>
          ))}
        </div>

        {/* Conclusion — the full /ai-core entity schema, static and fully expanded */}
        <section id="schema" className="mt-12 scroll-mt-6">
          <h2 className="mb-1 text-lg font-semibold">The full workspace map</h2>
          <p className="mb-4 text-sm leading-relaxed text-zinc-600">
            Every running entity, drawn the way a request flows — behind nginx and the auth gate, then the app,
            data and admin layers, plus the documentation corpus that feeds Company Memory.
          </p>
          <ArchSchema />
        </section>
      </div>

      <SiteFooter />
    </main>
  )
}
