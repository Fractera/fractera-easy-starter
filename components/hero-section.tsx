'use client'

import { useState, useEffect } from 'react'
import { DomainStatus } from '@/components/domain-status'
import { OpenClaudeButton } from '@/components/open-claude-button'
import { InfoTooltip } from '@/components/info-tooltip'
import { InstallForm } from '@/components/install-form'
import { DangerZone } from '@/components/danger-zone'
import { PlatformSelector } from '@/components/platform-selector'

export function HeroSection() {
  const [domainReady, setDomainReady] = useState(false)
  const [liveSubdomain, setLiveSubdomain] = useState('')
  const [installing, setInstalling] = useState(false)
  const [installStarted, setInstallStarted] = useState(false)
  const [destroyed, setDestroyed] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('fractera_domain')
      if (!raw) return
      const stored = JSON.parse(raw)
      setDomainReady(stored.status === 'ready')
    } catch {}
  }, [])

  // error state = install was started but domain never appeared
  const showTroubleshoot = installStarted && !domainReady

  return (
    <section className="flex flex-col gap-8 items-start">
      <div className="flex flex-col gap-4">
        <h1 className="text-6xl font-bold tracking-tight">Fractera</h1>
        <p className="text-2xl text-gray-400 max-w-xl flex items-start gap-3">
          Install your own AI workspace on a dedicated server — in 5 to 15 minutes.
          <InfoTooltip text="We help you choose the right hosting provider based on your needs and budget, then automate the full installation from this page. In 5–15 minutes you'll have your own server running on your own domain — ready to build any project using voice and AI. Nothing runs on your home computer. Everything happens over a secure connection to the server you purchase." />
        </p>
      </div>

      {/* Step 1: Install */}
      <InstallForm
        onSubdomainReady={sub => { setLiveSubdomain(sub); setDomainReady(true) }}
        onInstallingChange={v => { setInstalling(v); if (v) setInstallStarted(true) }}
      />

      {/* Step 2: Domain */}
      <DomainStatus
        onStatusChange={setDomainReady}
        subdomain={liveSubdomain}
        installing={installing}
        destroyed={destroyed}
      />

      {/* Error state: install started but no domain yet — show troubleshoot + platform selector */}
      {showTroubleshoot && (
        <div className="w-full max-w-xl flex flex-col gap-3">
          <div className="flex flex-col gap-3 bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-sm text-gray-400">
              Having trouble? Choose your AI platform to get help:
            </p>
            <PlatformSelector />
          </div>
        </div>
      )}

      {/* Success state: domain ready — show MCP section */}
      {domainReady && (
        <>
          <div className="flex flex-col gap-6 w-full max-w-xl">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold text-gray-300">Connect via Fractera MCP</h2>
              <p className="text-sm text-gray-500 max-w-xl">
                Use the Fractera MCP to work with your server and your project directly from the Claude chat — no terminal, no SSH. You get full control over your application through the standard Claude chat interface.
              </p>
            </div>
            <PlatformSelector />
          </div>

          <DangerZone onDestroyed={() => { setDomainReady(false); setLiveSubdomain(''); setDestroyed(true) }} />
        </>
      )}
    </section>
  )
}
