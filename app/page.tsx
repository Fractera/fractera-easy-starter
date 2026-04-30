import { StepsCarousel } from '@/components/steps-carousel'
import { CopyUrl } from '@/components/copy-url'

const MCP_URL = 'https://fractera.ai/api/mcp'
const CLAUDE_URL = 'https://claude.ai'

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-20 flex flex-col gap-20">

        {/* Hero */}
        <section className="flex flex-col gap-8 items-start">
          <div className="flex flex-col gap-4">
            <h1 className="text-6xl font-bold tracking-tight">
              Fractera
            </h1>
            <p className="text-2xl text-gray-400 max-w-xl">
              Your own AI workspace. On your own server. No coding required.
            </p>
          </div>

          {/* MCP URL */}
          <CopyUrl url={MCP_URL} />

          {/* CTA button */}
          <a
            href={CLAUDE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-black font-semibold px-8 py-4 rounded-xl text-base hover:bg-gray-100 transition-colors"
          >
            Open Claude
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 7h10v10"/><path d="M7 17 17 7"/>
            </svg>
          </a>
        </section>

        {/* Steps carousel */}
        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-semibold text-gray-300">How to get started</h2>
          <StepsCarousel />
        </section>

        {/* Footer */}
        <p className="text-sm text-gray-700 text-center">
          Fractera is open source. fractera.ai handles subdomain registration only.
        </p>

      </div>
    </main>
  )
}
