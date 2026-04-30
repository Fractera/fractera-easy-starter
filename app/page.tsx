import { StepsCarousel } from '@/components/steps-carousel'
import { CopyUrl } from '@/components/copy-url'
import { OpenClaudeButton } from '@/components/open-claude-button'
import { StartPhrase } from '@/components/start-phrase'
import { InfoTooltip } from '@/components/info-tooltip'

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
            <p className="text-2xl text-gray-400 max-w-xl flex items-start gap-3">
              Install your own AI workspace on a dedicated server — in 5 to 15 minutes.
              <InfoTooltip text="We help you choose the right hosting provider based on your needs and budget, then automate the full installation from this page. In 5–15 minutes you'll have your own server running on your own domain — ready to build any project using voice and AI. Nothing runs on your home computer. Everything happens over a secure connection to the server you purchase." />
            </p>
          </div>

          {/* Connector name */}
          <CopyUrl label="Connector Name" url="Fractera" />

          {/* MCP URL */}
          <CopyUrl url={MCP_URL} />

          {/* Start phrase */}
          <StartPhrase />

          {/* CTA button + disclaimer */}
          <div className="flex flex-col gap-3">
            <OpenClaudeButton />
            <p className="text-sm text-gray-500">
              Requires{' '}
              <a
                href="https://claude.ai/upgrade"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 underline underline-offset-2 hover:text-white transition-colors"
              >
                Claude Pro
              </a>
              {' '}($20/mo) — needed to use custom MCP connectors.
            </p>
          </div>
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
