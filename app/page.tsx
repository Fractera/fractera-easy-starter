import { StepsCarousel } from '@/components/steps-carousel'
import { CopyUrl } from '@/components/copy-url'
import { OpenClaudeButton } from '@/components/open-claude-button'

const MCP_URL = 'https://fractera.ai/api/mcp'

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
          <OpenClaudeButton />
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
