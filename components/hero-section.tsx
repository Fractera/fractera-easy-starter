/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { DomainStatus } from '@/components/domain-status'
import { InfoTooltip } from '@/components/info-tooltip'
import { InstallForm } from '@/components/install-form'
import { DangerZone } from '@/components/danger-zone'
import { PlatformSelector } from '@/components/platform-selector'
import { DeployProgress } from '@/components/deploy-progress'
import { useAuthModal } from '@/components/providers'

type MyServer = {
  id: string
  status: string
  subdomain: string | null
  deploySessionId: string | null
  createdAt: string
} | null

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
  const { openModal } = useAuthModal()

  const [domainReady, setDomainReady] = useState(false)
  const [liveSubdomain, setLiveSubdomain] = useState('')
  const [installing, setInstalling] = useState(false)
  const [installStarted, setInstallStarted] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const domainResetRef = useRef<(() => void) | undefined>(undefined)

  // Stripe one-click: server from DB
  const [myServer, setMyServer] = useState<MyServer>(undefined as unknown as MyServer)
  const [myServerLoading, setMyServerLoading] = useState(false)
  const [stripeSubdomain, setStripeSubdomain] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('fractera_domain')
      if (!raw) return
      const stored = JSON.parse(raw)
      setDomainReady(stored.status === 'ready')
    } catch {}
  }, [])

  useEffect(() => {
    if (!paymentSuccess) return
    toast.success('Deployment started', {
      description: "After setup finishes, you'll receive an email that your server is ready to use.",
      duration: 10000,
    })
    // Poll /api/my-server until deploySessionId appears (webhook may be slightly delayed)
    setMyServerLoading(true)
    let attempts = 0
    const maxAttempts = 20
    const pollServer = async () => {
      try {
        const res = await fetch('/api/my-server')
        if (res.ok) {
          const data = await res.json()
          if (data.server) {
            setMyServer(data.server)
            setMyServerLoading(false)
            return
          }
        }
      } catch {}
      attempts++
      if (attempts < maxAttempts) setTimeout(pollServer, 3000)
      else setMyServerLoading(false)
    }
    pollServer()
  }, [paymentSuccess])

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
    if (!session) { openModal(); return }
    triggerCheckout()
  }

  const showTroubleshoot = installStarted && !domainReady

  return (
    <section className="flex flex-col gap-8 items-start">
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

      {/* Payment success: pipeline or server links */}
      {paymentSuccess && (
        <div className="w-full max-w-xl flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-lg">✓</span>
            <p className="text-sm font-semibold text-green-400">Payment confirmed</p>
          </div>

          {/* Server already active — show links */}
          {(myServer?.status === 'active' && (myServer.subdomain || stripeSubdomain)) && (
            <ServerLinks subdomain={(stripeSubdomain ?? myServer.subdomain)!} email={session?.user?.email ?? ''} />
          )}

          {/* Deploy in progress — show pipeline */}
          {myServer && myServer.status !== 'active' && myServer.deploySessionId && (
            <DeployProgress
              sessionId={myServer.deploySessionId}
              onComplete={sub => {
                setStripeSubdomain(sub)
                setMyServer(prev => prev ? { ...prev, status: 'active', subdomain: sub } : prev)
              }}
            />
          )}

          {/* Waiting for webhook to fire (first 60s) */}
          {myServerLoading && !myServer && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="inline-block w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
              Connecting to your server…
            </div>
          )}

          {/* Webhook didn't fire — rare fallback */}
          {!myServerLoading && !myServer && (
            <p className="text-xs text-gray-500">
              Your Fractera environment is being set up. You&apos;ll receive an email at{' '}
              <strong className="text-white">{session?.user?.email}</strong> when it&apos;s ready (3–7 min).
            </p>
          )}

          <p className="text-xs text-yellow-600">
            Emails from us may land in <strong>spam or junk</strong> — please check there if you don&apos;t see them.
          </p>
        </div>
      )}

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
                  <span className="text-white font-semibold">$1</span>
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-3xl font-bold text-white">$1</p>
                <p className="text-xs text-gray-600">per day · min. 3 days</p>
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Get a fully ready project on a unique domain in a few minutes.
              No server setup required — we handle everything.
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

          {/* OR separator */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-xs text-gray-600 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          {/* Use your own credentials */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-medium text-gray-300">Use your own server</h3>
              <p className="text-xs text-gray-600">Have a VPS? Enter your credentials and we install Fractera automatically.</p>
            </div>

            {session ? (
              <InstallForm
                onSubdomainReady={sub => { setLiveSubdomain(sub); setDomainReady(true) }}
                onInstallingChange={v => { setInstalling(v); if (v) setInstallStarted(true) }}
              />
            ) : (
              <button
                type="button"
                onClick={openModal}
                className="w-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-gray-300 font-medium px-6 py-3.5 rounded-xl text-sm transition-colors"
              >
                Sign in to continue
              </button>
            )}
          </div>

        </div>
      )}

      {/* Domain status */}
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

function ServerLinks({ subdomain, email }: { subdomain: string; email: string }) {
  const links = [
    { href: `https://${subdomain}`, label: subdomain, note: 'your app' },
    { href: `https://auth.${subdomain}`, label: `auth.${subdomain}`, note: 'login / register' },
    { href: `https://admin.${subdomain}`, label: `admin.${subdomain}`, note: 'AI coding workspace' },
  ]
  return (
    <div className="flex flex-col gap-4 bg-green-500/5 border border-green-500/20 rounded-2xl p-5">
      <div className="flex items-center gap-2">
        <span className="text-green-400">✓</span>
        <p className="text-sm font-semibold text-green-400">Your server is ready!</p>
      </div>
      <div className="flex flex-col gap-2">
        {links.map(({ href, label, note }) => (
          <a key={href} href={href} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between group bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 transition-colors">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-white font-mono">{label}</span>
              <span className="text-xs text-gray-600">{note}</span>
            </div>
            <span className="text-gray-600 group-hover:text-gray-400 transition-colors text-sm">↗</span>
          </a>
        ))}
      </div>
      {email && (
        <p className="text-xs text-gray-600">
          A confirmation email with these links was sent to <strong className="text-gray-400">{email}</strong>
        </p>
      )}
    </div>
  )
}
