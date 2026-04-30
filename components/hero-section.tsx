'use client'

import { useState, useEffect } from 'react'
import { CopyUrl } from '@/components/copy-url'
import { StartPhrase } from '@/components/start-phrase'
import { DomainStatus } from '@/components/domain-status'
import { OpenClaudeButton } from '@/components/open-claude-button'
import { InfoTooltip } from '@/components/info-tooltip'

const MCP_URL = 'https://fractera.ai/api/mcp'

export function HeroSection() {
  const [domainReady, setDomainReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('fractera_domain')
      if (!raw) return
      const stored = JSON.parse(raw)
      setDomainReady(stored.status === 'ready')
    } catch {}
  }, [])

  return (
    <section className="flex flex-col gap-8 items-start">
      <div className="flex flex-col gap-4">
        <h1 className="text-6xl font-bold tracking-tight">Fractera</h1>
        <p className="text-2xl text-gray-400 max-w-xl flex items-start gap-3">
          Install your own AI workspace on a dedicated server — in 5 to 15 minutes.
          <InfoTooltip text="We help you choose the right hosting provider based on your needs and budget, then automate the full installation from this page. In 5–15 minutes you'll have your own server running on your own domain — ready to build any project using voice and AI. Nothing runs on your home computer. Everything happens over a secure connection to the server you purchase." />
        </p>
      </div>

      <CopyUrl label="Connector Name" url="Fractera" disabled={domainReady} />
      <CopyUrl url={MCP_URL} disabled={domainReady} />
      <StartPhrase />
      <DomainStatus onStatusChange={setDomainReady} />

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
    </section>
  )
}
