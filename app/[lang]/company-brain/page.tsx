import type { Metadata } from 'next'
import Link from 'next/link'
import { buildAlternates } from '@/lib/seo/alternates'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  return {
    title: 'Company Brain | Fractera',
    description:
      'Company Brain — the project’s living knowledge surface: the Blog and the chronological, AI-searchable News feed, all embedded into the on-server LightRAG vector knowledge base.',
    alternates: buildAlternates(lang, '/company-brain'),
  }
}

export default async function CompanyBrainPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-20 md:py-14">
        <header className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-widest text-violet-400/70">Fractera company brain</p>
          <h1 className="text-4xl font-bold tracking-tight md:text-3xl">Company Brain</h1>
          <p className="max-w-2xl text-base text-white/50">
            The project’s living knowledge surface. Everything here is embedded into the on-server
            vector knowledge base, so it stays fully searchable with AI from inside your workspace.
          </p>
        </header>

        {/* Two entry points. Blog is a placeholder for a later step; News is live. */}
        <div className="flex flex-wrap gap-3">
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white/80 transition-all hover:border-violet-500/60 hover:bg-violet-500/[0.06] hover:text-violet-200"
          >
            Blog
          </a>
          <Link
            href={`/${lang}/news`}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white/80 transition-all hover:border-violet-500/60 hover:bg-violet-500/[0.06] hover:text-violet-200"
          >
            News
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </div>
    </main>
  )
}
