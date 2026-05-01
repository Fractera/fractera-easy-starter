'use client'

import { CopyUrl } from '@/components/copy-url'
import { StartPhrase } from '@/components/start-phrase'
import { OpenClaudeButton } from '@/components/open-claude-button'
import { StepsCarousel } from '@/components/steps-carousel'

const MCP_URL = 'https://fractera.ai/api/mcp'

export function ClaudeCodeSetup() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <CopyUrl label="Connector Name" url="Fractera" />
      <CopyUrl label="MCP Server URL" url={MCP_URL} />
      <StartPhrase />

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
        <p className="text-sm text-gray-600">
          Incognito mode is not recommended — it may interfere with Claude Code login.
        </p>
      </div>

      <div className="w-full">
        <h3 className="text-base font-semibold text-gray-300 mb-4">How to connect Claude</h3>
        <StepsCarousel />
      </div>
    </div>
  )
}
