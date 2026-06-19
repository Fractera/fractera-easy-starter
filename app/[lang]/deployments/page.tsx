import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/seo/alternates'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  return {
    title: 'Deployments | Fractera',
    description:
      'Fractera deployments — how a project is built over time: every deploy, the AI agent and model behind it, tokens spent and a rating. The full build journal of the self-hosted AI workspace.',
    alternates: buildAlternates(lang, '/deployments'),
  }
}

// Named page — content arrives in a later step (the architect will provide it).
// Header-only stub for now so the nav link resolves instead of 404-ing.
export default async function DeploymentsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-20 md:py-14">
        <header className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-widest text-violet-400/70">Fractera deployments</p>
          <h1 className="text-4xl font-bold tracking-tight md:text-3xl">Deployments</h1>
          <p className="max-w-2xl text-base text-white/50">
            The build journal of the project — every deploy with its agent, model, tokens and rating.
            Content is on the way.
          </p>
        </header>
      </div>
    </main>
  )
}
