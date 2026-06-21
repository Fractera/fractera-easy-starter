import type { Metadata } from 'next'
import { SiteFooter } from '@/components/site-footer'
import { Body } from '@/lib/architect-page/markdown'
import { SECTIONS, CARRIER_META, CARRIER_URL, GITHUB_REPO } from '@/lib/next-aircraft-carrier/content'

// STATIC English silo page — "The Next.js Aircraft Carrier": converts skeptical
// senior developers by making the technical case for a 50k-line pre-built parallel
// routing framework that ships the moment you deploy. ONE indexable URL with no
// language prefix (proxy passes it through), prerendered at build time. EN-only.

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: CARRIER_META.title,
  description: CARRIER_META.description,
  alternates: { canonical: CARRIER_URL },
  robots: { index: true, follow: true },
  keywords: [
    'next js enterprise boilerplate',
    'cost effective ai development',
    'prevent ai context window inflation',
    'next js parallel routing seo',
    'zero token overhead ai framework',
    'next js on demand isr architecture',
    'production ready next js starter',
    'self hosted alternative to vercel',
    'scalable web application architecture',
    'next js multi language routing',
  ],
  openGraph: {
    title: CARRIER_META.title,
    description: CARRIER_META.description,
    url: CARRIER_URL,
    type: 'article',
    images: [{ url: 'https://www.fractera.ai/nextjs-parallel-routes.png', alt: 'Fractera Next.js parallel-routing layout — Header, Promo Screen, Left, Right, Center Header, Center, Center Footer, Footer slots with an active-slots checklist' }],
  },
}

const FAQ_ITEMS = [
  {
    q: 'What is the "Next.js Aircraft Carrier" in Fractera?',
    a: 'It is a fully pre-built, parallel-routing Next.js application (around 50,000 lines) that ships the moment you deploy Fractera. Eight layout slots (Header, Footer, Left, Right, Center, Promo Screen, Center Header, Center Footer) can be toggled on or off without page reloads, and AI agents can reconfigure the entire layout without human intervention.',
  },
  {
    q: 'Does the parallel-routing framework hurt AI token efficiency?',
    a: 'No — it saves tokens. Each slot is a discrete file with a clear, predictable boundary. An AI agent opens, reads, or rewrites exactly the slot it needs without touching the rest of the layout. That is the opposite of a monolithic page where the agent must parse thousands of unrelated lines to change one section.',
  },
  {
    q: "Can I use this boilerplate without Fractera's platform?",
    a: 'The framework is open-source (MIT). You can run it on any Node.js host. Fractera adds the AI development loop, LightRAG memory, Hermes orchestration, and a one-click VPS deploy on top — so the same codebase you get as a standalone starter runs with full AI-native tooling inside Fractera.',
  },
]

// Two linked entities: the page (TechArticle) and the software it describes
// (SoftwareApplication, the shared @id).
const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: CARRIER_META.title,
    description: CARRIER_META.description,
    audience: { '@type': 'Audience', audienceType: 'AI agents, developers' },
    about: 'Next.js parallel routing, enterprise boilerplate, on-demand ISR, context window inflation, self-hosted Next.js scale',
    url: CARRIER_URL,
    inLanguage: 'en',
    mainEntityOfPage: { '@type': 'WebPage', '@id': CARRIER_URL },
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
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Fractera', item: 'https://www.fractera.ai/' },
      { '@type': 'ListItem', position: 2, name: 'The Next.js Aircraft Carrier', item: CARRIER_URL },
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

export default function NextAircraftCarrierPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white text-zinc-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

      <div className="mx-auto w-full max-w-3xl flex-1 px-5 py-12">
        {/* Breadcrumb — matches the BreadcrumbList JSON-LD above */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-zinc-400">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><a href="/" className="hover:text-zinc-700 hover:underline">Fractera</a></li>
            <li aria-hidden className="text-zinc-300">/</li>
            <li aria-current="page" className="text-zinc-500">The Next.js Aircraft Carrier</li>
          </ol>
        </nav>

        <header className="mb-8 border-b border-zinc-200 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-400">Fractera · the Next.js Aircraft Carrier</p>
              <h1 className="mt-2 text-2xl font-bold">The Next.js Aircraft Carrier: Pre-Built Enterprise Boilerplate Deployed in 1 Click</h1>
            </div>
            {/* Return to the site root */}
            <a href="/" aria-label="Fractera home" title="Fractera home" className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fractera-logo.jpg" alt="Fractera" width={40} height={40} className="h-10 w-10 rounded-lg border border-zinc-200 object-cover" />
            </a>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            This page is for the skeptic: the developer who suspects a 50,000-line framework is overkill and{' '}
            <strong className="font-semibold text-zinc-900">just another AI token-burner</strong>. It is the opposite — a{' '}
            <strong className="font-semibold text-zinc-900">production-ready Next.js starter</strong> that ships the moment you deploy and turns
            parallel routing into something an AI rotates like a Rubik&rsquo;s Cube. See also the{' '}
            <a href="/token-economics" className="font-medium text-violet-700 underline hover:text-violet-900">token economics</a>, the{' '}
            <a href="/ai-workspace-architect" className="font-medium text-violet-700 underline hover:text-violet-900">workspace architecture</a> and the{' '}
            <a href="/ai-development-loop" className="font-medium text-violet-700 underline hover:text-violet-900">development loop</a>,
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

        {/* Static, crawlable illustration of the parallel-routing layout — visible to
            AI scanners and no-JS clients (the interactive demo on the home page is
            client-only). Reinforces the "works even without JavaScript" claim. */}
        <figure className="mb-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/nextjs-parallel-routes.png"
            alt="Next.js parallel-routing layout: Header, Promo Screen, Left, Right, Center Header, Center, Center Footer and Footer slots, with an active-slots checklist on the right"
            width={862}
            height={496}
            className="w-full rounded-xl border border-zinc-200"
          />
          <figcaption className="mt-3 text-center text-xs text-zinc-500">
            The parallel-routing slot matrix — header and footer locked, every other slot toggled on or off. Selecting slots reshapes the layout with no code and no page reload.
          </figcaption>
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
              <Body body={sec.body} idp={sec.id} />
              {sec.id === 'whats-inside' && (
                <div className="mt-6 rounded-xl border border-violet-200 bg-violet-50/60 p-5">
                  <p className="text-sm font-semibold text-zinc-900">Want this framework on your own server?</p>
                  <p className="mt-1 text-sm text-zinc-600">
                    Deploy the whole stack to your own VPS in about 10 minutes — one click, no configuration.
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
                </div>
              )}
            </section>
          ))}
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
      </div>

      <SiteFooter />
    </main>
  )
}
