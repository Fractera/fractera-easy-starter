/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useRef } from 'react'
import { DomainStatus } from '@/components/domain-status'
import { InfoTooltip } from '@/components/info-tooltip'
import { InstallForm } from '@/components/install-form'
import { DangerZone } from '@/components/danger-zone'
import { PlatformSelector } from '@/components/platform-selector'

const PLATFORMS = [
  'Claude Code',
  'Codex',
  'Gemini CLI',
  'Qwen Code',
  'Kimi Code',
  'Open Code',
  'LightRAG',
  'Open Claude',
]

export function HeroSection() {
  const [domainReady, setDomainReady] = useState(false)
  const [liveSubdomain, setLiveSubdomain] = useState('')
  const [installing, setInstalling] = useState(false)
  const [installStarted, setInstallStarted] = useState(false)
  const domainResetRef = useRef<(() => void) | undefined>(undefined)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('fractera_domain')
      if (!raw) return
      const stored = JSON.parse(raw)
      //ts ignore
      setDomainReady(stored.status === 'ready')
    } catch {}
  }, [])

  const showTroubleshoot = installStarted && !domainReady

  return (
    <section className="flex flex-col gap-8 items-start">
      <div className="flex flex-col gap-5">

        {/* Platform bridge */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {PLATFORMS.map((name, i) => (
            <span key={name} className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-gray-500 px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.04] tracking-wide whitespace-nowrap">
                {name}
              </span>
              {i < PLATFORMS.length - 1 && (
                <span className="text-gray-700 text-xs select-none">·</span>
              )}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-6xl font-bold tracking-tight">Fractera</h1>

        {/* Description */}
        <div className="flex flex-col gap-3 max-w-xl">
          <div className="flex items-start gap-2">
            <p className="text-2xl text-gray-300 leading-snug">
              Your own AI coding server —{' '}
              <span className="text-white font-semibold">5× cheaper & 10× faster</span>,
              installed in one click.
            </p>
            <InfoTooltip text="Fractera ships with pre-built templates and skills that run autonomously with minimal AI usage — most routine tasks cost almost nothing. The OpenCode platform gives access to many free models for everyday work. Complex or high-stakes tasks can be delegated to premium models like Claude (Anthropic) or Codex only when needed, so you pay for real intelligence only where it matters." />
          </div>
          <p className="text-base text-gray-500 leading-relaxed flex items-start gap-3">
            Run all 8 AI platforms on a dedicated server you own. No subscriptions to cloud
            infrastructure, no data leaving your environment. Fractera's architecture reuses
            a single subscription across every platform — saving tokens and compute time up
            to 10×. Ready in 3–7 minutes.
            <InfoTooltip text="We help you choose the right hosting provider based on your needs and budget, then automate the full installation from this page. In 3 to 7 minutes you'll have your own server running on your own domain — ready to build any project using voice and AI. Nothing runs on your home computer. Everything happens over a secure connection to the server you own." />
          </p>
        </div>
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
        onResetRef={fn => { domainResetRef.current = fn }}
      />

      {/* Error state */}
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

      {/* Success state */}
      {domainReady && (
        <>
          <div className="flex flex-col gap-6 w-full max-w-xl">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold text-gray-300">Connect via Fractera MCP</h2>
              <p className="text-sm text-gray-500 max-w-xl">
                Use the Fractera MCP to work with your server and your project directly from the
                Claude chat — no terminal, no SSH. Full control over your application through
                the standard Claude chat interface.
              </p>
            </div>
            <PlatformSelector />
          </div>

          <DangerZone onDestroyed={() => { setDomainReady(false); setLiveSubdomain(''); domainResetRef.current?.() }} />
        </>
      )}
    </section>
  )
}
