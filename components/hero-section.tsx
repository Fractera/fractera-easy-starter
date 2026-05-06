/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { DomainStatus } from '@/components/domain-status'
import { InfoTooltip } from '@/components/info-tooltip'
import { InstallForm } from '@/components/install-form'
import { DangerZone } from '@/components/danger-zone'
import { PlatformSelector } from '@/components/platform-selector'
import { AuthModal } from '@/components/auth-modal'

const PLATFORMS = [
  'Claude Code',
  'Codex',
  'Gemini CLI',
  'Qwen Code',
  'Kimi Code',
  'LightRAG',
]

export function HeroSection() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const paymentSuccess = searchParams.get('payment') === 'success'

  const [domainReady, setDomainReady] = useState(false)
  const [liveSubdomain, setLiveSubdomain] = useState('')
  const [installing, setInstalling] = useState(false)
  const [installStarted, setInstallStarted] = useState(false)
  const [showCredentials, setShowCredentials] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<'oneclick' | 'credentials' | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const domainResetRef = useRef<(() => void) | undefined>(undefined)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('fractera_domain')
      if (!raw) return
      const stored = JSON.parse(raw)
      setDomainReady(stored.status === 'ready')
    } catch {}
  }, [])

  // After auth completes, resume the pending action
  useEffect(() => {
    if (!session || !pendingAction) return
    if (pendingAction === 'oneclick') {
      setPendingAction(null)
      triggerCheckout()
    } else if (pendingAction === 'credentials') {
      setPendingAction(null)
      setShowCredentials(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  async function triggerCheckout() {
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      setCheckoutLoading(false)
    }
  }

  function handleOneClick() {
    if (!session) {
      setPendingAction('oneclick')
      setAuthModalOpen(true)
      return
    }
    triggerCheckout()
  }

  function handleCredentialsToggle() {
    if (!session) {
      setPendingAction('credentials')
      setAuthModalOpen(true)
      return
    }
    setShowCredentials(v => !v)
  }

  const showTroubleshoot = installStarted && !domainReady

  return (
    <section className="flex flex-col gap-8 items-start">
      <AuthModal
        open={authModalOpen}
        onClose={() => { setAuthModalOpen(false); setPendingAction(null) }}
      />

      <div className="flex flex-col gap-5">
        {/* Platform chips */}
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
            <InfoTooltip text="Fractera ships with pre-built templates and skills that run autonomously with minimal AI usage — most routine tasks cost almost nothing. Complex or high-stakes tasks can be delegated to premium models like Claude (Anthropic) or Codex only when needed, so you pay for real intelligence only where it matters." />
          </div>
          <p className="text-base text-gray-500 leading-relaxed flex items-start gap-3">
            Run all 7 AI platforms on a dedicated server you own. No subscriptions to cloud
            infrastructure, no data leaving your environment. Fractera architecture reuses
            a single subscription across every platform — saving tokens and compute time up
            to 10×. Ready in 3–7 minutes.
            <InfoTooltip text="We help you choose the right hosting provider based on your needs and budget, then automate the full installation from this page. In 3 to 7 minutes you'll have your own server running on your own domain — ready to build any project using voice and AI. Nothing runs on your home computer. Everything happens over a secure connection to the server you own." />
          </p>
        </div>
      </div>

      {/* Payment success banner */}
      {paymentSuccess && (
        <div className="w-full max-w-xl flex flex-col gap-3 bg-green-500/10 border border-green-500/30 rounded-xl p-5">
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-lg">✓</span>
            <p className="text-sm font-semibold text-green-400">Payment confirmed — your server is being deployed</p>
          </div>
          <p className="text-xs text-gray-400">
            Your Fractera coding environment is being set up. You&apos;ll receive an email at{' '}
            <strong className="text-white">{session?.user?.email}</strong> when it&apos;s ready
            (usually 3–7 minutes).
          </p>
        </div>
      )}

      {/* Two scenarios */}
      {!paymentSuccess && (
        <div className="w-full max-w-xl flex flex-col gap-4">

          {/* One-click START card */}
          <div className="flex flex-col gap-4 bg-white/[0.03] border border-orange-500/30 rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                    RECOMMENDED
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">One-click START</h2>
                <p className="text-sm text-gray-400">
                  Launch your coding server for{' '}
                  <span className="text-white font-semibold">$1/day</span>
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-3xl font-bold text-white">$1</p>
                <p className="text-xs text-gray-600">per day</p>
                <p className="text-xs text-gray-700">min 3 days</p>
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Get a fully ready project on a unique domain in a few minutes.
              Minimum 3 days — cancel anytime after. No server setup required.
            </p>

            <button
              type="button"
              onClick={handleOneClick}
              disabled={checkoutLoading}
              className="w-full bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkoutLoading ? 'Redirecting to checkout…' : 'Launch my server →'}
            </button>

            {!session && (
              <p className="text-xs text-gray-600 text-center -mt-1">
                You&apos;ll be asked to sign in first
              </p>
            )}
          </div>

          {/* Use your credentials toggle */}
          <div className="flex flex-col gap-0">
            <button
              type="button"
              onClick={handleCredentialsToggle}
              className="flex items-center justify-between w-full px-5 py-4 bg-white/[0.02] border border-white/10 rounded-xl hover:border-white/20 transition-colors group"
            >
              <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                Use your own server credentials
              </span>
              <div className={`relative w-11 h-6 rounded-full transition-colors ${showCredentials ? 'bg-white/30' : 'bg-white/10'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${showCredentials ? 'left-6' : 'left-1'}`} />
              </div>
            </button>

            {showCredentials && (
              <div className="mt-3">
                <InstallForm
                  onSubdomainReady={sub => { setLiveSubdomain(sub); setDomainReady(true) }}
                  onInstallingChange={v => { setInstalling(v); if (v) setInstallStarted(true) }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Domain status (shown after install starts) */}
      {(liveSubdomain || installing) && (
        <DomainStatus
          onStatusChange={setDomainReady}
          subdomain={liveSubdomain}
          installing={installing}
          onResetRef={fn => { domainResetRef.current = fn }}
        />
      )}

      {/* Troubleshoot */}
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
