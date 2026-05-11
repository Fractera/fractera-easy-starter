/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { DomainStatus } from '@/components/domain-status'
import { InstallForm } from '@/components/install-form'
import { DangerZone } from '@/components/danger-zone'
import { PlatformSelector } from '@/components/platform-selector'
import { DeployProgress } from '@/components/deploy-progress'
import { useAuthModal, useDashboard, useCheckout } from '@/components/providers'

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
  const router = useRouter()
  const paymentSuccess = searchParams.get('payment') === 'success'
  const { openModal } = useAuthModal()
  const { openServers } = useDashboard()
  const { openCheckout } = useCheckout()

  const [domainReady, setDomainReady] = useState(false)
  const [liveSubdomain, setLiveSubdomain] = useState('')
  const [installing, setInstalling] = useState(false)
  const [installStarted, setInstallStarted] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(PLANS[1]) // monthly
  const [poolAvailable, setPoolAvailable] = useState<number | null>(null)
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
    fetch('/api/pool/status')
      .then(r => r.json())
      .then(d => setPoolAvailable(d.available ?? 0))
      .catch(() => setPoolAvailable(0))
  }, [])

  useEffect(() => {
    if (!paymentSuccess) return
    toast.success('Deployment started', {
      description: "After setup finishes, you'll receive an email that your server is ready to use.",
      duration: 10000,
    })

    const stripeSessionId = searchParams.get('stripe_session_id')
    const apiUrl = stripeSessionId
      ? `/api/my-server?stripe_session_id=${encodeURIComponent(stripeSessionId)}`
      : '/api/my-server'

    setMyServerLoading(true)
    let attempts = 0
    const maxAttempts = 20

    const pollServer = async () => {
      try {
        const res = await fetch(apiUrl)
        if (res.ok) {
          const data = await res.json()
          if (data.server) {
            setMyServer(data.server)
            setMyServerLoading(false)
            // Server exists for this stripe session (any status) — go to dashboard
            openServers()
            router.replace('/')
            return
          }
        }
      } catch {}
      attempts++
      if (attempts < maxAttempts) setTimeout(pollServer, 3000)
      else setMyServerLoading(false)
    }
    pollServer()
  }, [paymentSuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleOneClick() {
    if (!session) { openModal(selectedPlan.id); return }
    openCheckout(selectedPlan.id)
  }

  // Auto-trigger checkout after OAuth/magic-link redirect with pending_plan param
  const pendingPlan = searchParams.get('pending_plan')
  useEffect(() => {
    if (session && pendingPlan) {
      router.replace('/')
      openCheckout(pendingPlan)
    }
  }, [session, pendingPlan]) // eslint-disable-line react-hooks/exhaustive-deps

  const showTroubleshoot = installStarted && !domainReady

  return (
    <section className="flex flex-col gap-8 items-start sm:items-center">

      <div className="flex flex-col gap-5">
        {/* Platform chips */}
        <div className="flex items-center gap-1.5 flex-wrap sm:justify-center">
          {PLATFORMS.map((name, i) => (
            <span key={name} className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-semibold text-white px-2 py-0.5 rounded-full border border-white/40 bg-white/[0.07] tracking-wide whitespace-nowrap">
                {name}
              </span>
              {i < PLATFORMS.length - 1 && (
                <span className="text-gray-400 text-xs select-none">·</span>
              )}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-6xl font-bold tracking-tight sm:text-center">Fractera</h1>

        {/* Description */}
        <div className="flex flex-col gap-3 max-w-xl sm:text-center">
          <p className="text-2xl text-white font-semibold leading-snug">
            Production coding platform —{' '}
            <span className="text-white font-semibold">your own server, writing code live in the browser</span>,
            on a real domain.{' '}
            <span className="text-white font-semibold">5× cheaper & 10× faster</span> than vibe coding.
          </p>
          <p className="text-base text-white leading-relaxed">
            Five coding platforms and a global agent RAG memory — your company brain — run entirely
            on a server you own. Not SaaS. Not a CMS. 100% your infrastructure.
            The Fractera Pro architecture is the engine of your coding factory, built for high load
            and real project scale. Deployment takes ~10 minutes with zero setup on your end.
            In 10 minutes, your partners can open your project live.
          </p>
          <p className="text-xs text-orange-400">
            ★ Runs on your own Claude Code subscription — or any other platform subscription. No API keys required.
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
            <>
              <ServerLinks subdomain={(stripeSubdomain ?? myServer.subdomain)!} email={session?.user?.email ?? ''} />
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={openServers}
                  className="text-base font-semibold text-white hover:text-white border border-white/40 hover:border-white/60 px-4 py-2 rounded-lg transition-colors"
                >
                  Open Dashboard →
                </button>
                <button
                  type="button"
                  onClick={() => router.replace('/')}
                  className="text-base font-semibold text-orange-400 hover:text-orange-300 border border-orange-500/50 hover:border-orange-400/70 px-4 py-2 rounded-lg transition-colors"
                >
                  Deploy another server →
                </button>
              </div>
            </>
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
            <div className="flex items-center gap-2 text-base text-white font-medium">
              <span className="inline-block w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
              Connecting to your server…
            </div>
          )}

          {/* Webhook didn't fire — rare fallback */}
          {!myServerLoading && !myServer && (
            <p className="text-sm text-white">
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
          <div className="flex flex-col gap-5 bg-white/[0.03] border border-orange-500/50 rounded-2xl p-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                RECOMMENDED
              </span>
            </div>
            <h2 className="text-xl font-bold text-white -mt-1">One-click START</h2>

            <PlanSelector selected={selectedPlan} onSelect={setSelectedPlan} />

            {selectedPlan.id !== 'free' && (
              <ul className="flex flex-col gap-1.5 text-sm text-white font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-orange-400">✓</span>
                  <span className="font-bold">4 cores · 6 GB RAM · 150 GB disk</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-400">✓</span>
                  <span>5 coding platforms — Claude Code · Codex · Gemini CLI · Qwen Code · Kimi Code</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-400">✓</span>
                  <span>LightRAG — the company brain</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-400">✓</span>
                  <span>PostgreSQL — local project database</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-400">✓</span>
                  <span>File storage — images, docs & media</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-400">✓</span>
                  <span>Auth service — built-in authentication</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-400">✓</span>
                  <span className="text-white font-bold">Fractera Pro</span>
                </li>
              </ul>
            )}

            {selectedPlan.id === 'free' && (
              <>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg font-bold text-white">Free Forever</span>
                  <span className="text-xs text-white/50 font-medium">· no credit card · no expiry</span>
                </div>
                <p className="text-sm text-white">
                  Use the <span className="text-white font-bold">Fractera Light</span> option below — bring your own VPS server.
                </p>
              </>
            )}

            {(selectedPlan.id === 'monthly' || selectedPlan.id === 'annual') && (
              <>
                {/* Pool loading */}
                {poolAvailable === null && (
                  <div className="w-full flex items-center justify-center gap-2 py-3.5 text-sm text-white font-medium">
                    <span className="inline-block w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
                    Checking availability…
                  </div>
                )}

                {/* Pool available — instant deploy */}
                {poolAvailable !== null && poolAvailable > 0 && (
                  <button
                    type="button"
                    onClick={handleOneClick}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3.5 rounded-xl text-base transition-colors"
                  >
                    {`Subscribe · ${selectedPlan.price} →`}
                  </button>
                )}

                {/* Pool empty — Path B warning */}
                {poolAvailable !== null && poolAvailable === 0 && (
                  <div className="flex flex-col gap-3">
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex flex-col gap-2">
                      <p className="text-sm text-yellow-400 font-semibold">⚠ Instant deployment temporarily unavailable</p>
                      <p className="text-sm text-yellow-300 font-medium leading-relaxed">
                        You can still subscribe — your server will be ready within <strong>60 minutes</strong>.
                        Or deploy instantly using your own server below.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOneClick}
                      className="w-full bg-yellow-600/80 hover:bg-yellow-600 text-white font-bold px-6 py-3.5 rounded-xl text-base transition-colors"
                    >
                      {`Subscribe · ${selectedPlan.price} (ready in ~60 min) →`}
                    </button>
                  </div>
                )}
              </>
            )}

            {selectedPlan.id === 'free' && (
              <button
                type="button"
                onClick={() => document.getElementById('light-card')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full bg-white/[0.07] hover:bg-white/[0.12] border border-white/40 hover:border-white/60 text-white font-bold px-6 py-3.5 rounded-xl text-base transition-colors"
              >
                Use Fractera Light ↓
              </button>
            )}

            {!session && (selectedPlan.id === 'monthly' || selectedPlan.id === 'annual') && (
              <p className="text-sm text-white text-center -mt-2">
                You&apos;ll be asked to sign in first
              </p>
            )}
          </div>

          {/* Trial card — only when pool has servers */}
          {poolAvailable !== null && poolAvailable > 0 && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/30" />
                <span className="text-sm text-white font-medium uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-white/30" />
              </div>

              <div className="flex flex-col gap-5 bg-white/[0.03] border border-emerald-500/50 rounded-2xl p-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    10-MIN TRIAL
                  </span>
                </div>
                <div className="flex items-center justify-between -mt-1">
                  <h2 className="text-xl font-bold text-white">Try Fractera</h2>
                  <span className="text-2xl font-bold text-white">$0</span>
                </div>

                <ul className="flex flex-col gap-1.5 text-sm text-white font-medium">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>5 coding platforms — Claude Code · Codex · Gemini CLI · Qwen Code · Kimi Code</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>LightRAG — the company brain</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>PostgreSQL — local project database</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>File storage — images, docs & media</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Auth service — built-in authentication</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span className="text-white font-bold">Fractera Pro</span>
                  </li>
                </ul>

                <button
                  type="button"
                  onClick={() => {
                    if (!session) { openModal(); return }
                    alert('Сервис скоро появится')
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3.5 rounded-xl text-base transition-colors"
                >
                  Start exploring →
                </button>

                <p className="text-xs text-white/50 -mt-2">
                  * Regardless of any settings, in exactly 10 minutes the project will cease to exist.
                  This is a special promo for getting acquainted with the project.
                </p>
              </div>
            </>
          )}

          {/* OR separator */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/30" />
            <span className="text-sm text-white font-medium uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white/30" />
          </div>

          {/* Use your own server card */}
          <div id="light-card" className="flex flex-col gap-4 bg-white/[0.04] border border-white/40 rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-mono font-bold text-white bg-white/[0.07] px-2 py-0.5 rounded-full border border-white/40 self-start">
                  YOUR OWN SERVER
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">Fractera Light</h2>
                <p className="text-base text-white font-medium">Install on your VPS — you provide the server</p>
              </div>
            </div>

            <ul className="flex flex-col gap-1.5 text-sm text-white font-medium">
              <li className="flex items-center gap-2">
                <span className="text-white font-bold">✓</span>
                <span>5 coding platforms — Claude Code · Codex · Gemini CLI · Qwen Code · Kimi Code</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-white font-bold">✓</span>
                <span>LightRAG — the company brain</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-white font-bold">✓</span>
                <span>PostgreSQL — local project database</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-white font-bold">✓</span>
                <span>File storage — images, docs & media</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-white font-bold">✓</span>
                <span>Auth service — built-in authentication</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-400">—</span>
                <span className="text-gray-300">Fractera Pro not included</span>
              </li>
            </ul>

            {session ? (
              <InstallForm
                onSubdomainReady={sub => { setLiveSubdomain(sub); setDomainReady(true) }}
                onInstallingChange={v => { setInstalling(v); if (v) setInstallStarted(true) }}
              />
            ) : (
              <button
                type="button"
                onClick={() => openModal()}
                className="w-full bg-white/[0.07] hover:bg-white/[0.12] border border-white/40 hover:border-white/60 text-white font-bold px-6 py-3.5 rounded-xl text-base transition-colors"
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
          <div className="flex flex-col gap-3 bg-white/[0.05] border border-white/40 rounded-xl p-5">
            <p className="text-base text-white font-semibold">
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
              <h2 className="text-2xl font-bold text-white">Connect via Fractera MCP</h2>
              <p className="text-base text-white max-w-xl">
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

// ─── Plan data ───────────────────────────────────────────────────────────────

type Plan = {
  id: string
  name: string
  sublabel: string
  price: string | null
  period: string | null
  badge: string | null
  comingSoon?: boolean
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free Forever',
    sublabel: 'Your own server · Fractera Light',
    price: null,
    period: null,
    badge: null,
  },
  {
    id: 'monthly',
    name: 'Fractera Pro + Server',
    sublabel: 'Monthly · Server included',
    price: '$25',
    period: '/mo',
    badge: 'POPULAR',
  },
  {
    id: 'annual',
    name: 'Fractera Pro + Server',
    sublabel: 'Annual · Best value',
    price: '$190',
    period: '/yr',
    badge: 'BEST VALUE',
  },
]

function PlanSelector({ selected, onSelect }: { selected: Plan; onSelect: (p: Plan) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-3 bg-white/[0.06] hover:bg-white/[0.10] border border-white/40 hover:border-white/60 rounded-xl px-4 py-3 transition-colors"
      >
        <div className="flex flex-col items-start gap-0.5 min-w-0">
          <span className="text-xs text-white font-semibold uppercase tracking-widest">Pricing plan</span>
          <span className="text-base text-white font-bold">{selected.name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {selected.price && (
            <span className="text-lg font-bold text-white">
              {selected.price}
              {selected.period && <span className="text-sm text-white font-normal">{selected.period}</span>}
            </span>
          )}
          {!selected.price && <span className="text-base text-white font-semibold">Free forever</span>}
          <span className={`text-white text-sm transition-transform duration-150 ${open ? 'rotate-180' : ''}`}>▾</span>
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-950 border border-white/40 rounded-2xl shadow-2xl overflow-hidden z-30">
          {PLANS.map((plan, i) => {
            const isSelected = plan.id === selected.id
            return (
              <div key={plan.id}>
                {i > 0 && <div className="h-px bg-white/20 mx-4" />}
                <button
                  type="button"
                  onClick={() => { onSelect(plan); setOpen(false) }}
                  disabled={plan.comingSoon}
                  className={`w-full flex items-center justify-between gap-3 px-5 py-4 text-left transition-colors
                    ${plan.comingSoon ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/[0.07] cursor-pointer'}
                    ${isSelected ? 'bg-orange-500/10' : ''}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-orange-400 bg-orange-500' : 'border-white/50'}`}>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-base font-bold ${isSelected ? 'text-white' : 'text-white'}`}>
                          {plan.name}
                        </span>
                        {plan.badge && (
                          <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded-full border ${
                            plan.badge === 'BEST VALUE'
                              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                              : 'text-orange-400 bg-orange-500/10 border-orange-500/30'
                          }`}>
                            {plan.badge}
                          </span>
                        )}
                        {plan.comingSoon && (
                          <span className="text-xs font-mono font-semibold text-white bg-white/[0.08] px-1.5 py-0.5 rounded-full border border-white/30">
                            SOON
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-white font-medium">{plan.sublabel}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    {plan.price
                      ? <span className="text-base font-bold text-white">{plan.price}<span className="text-sm text-white font-normal">{plan.period}</span></span>
                      : <span className="text-base text-white font-semibold">Free forever</span>
                    }
                  </div>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── User dropdown ────────────────────────────────────────────────────────────

function UserMenu({ email, onDashboard }: { email: string; onDashboard: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, close])

  const initials = email ? email[0].toUpperCase() : '?'

  return (
    <div ref={ref} className="relative self-start">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 text-sm text-white font-medium hover:text-white transition-colors"
      >
        <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
          {initials}
        </span>
        <span className="hidden sm:inline truncate max-w-[160px]">{email}</span>
        <span className="text-white">▾</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-44 bg-neutral-900 border border-white/40 rounded-xl shadow-xl overflow-hidden z-20">
          <button
            type="button"
            onClick={() => { close(); onDashboard() }}
            className="w-full text-left px-4 py-2.5 text-base text-white font-semibold hover:bg-white/[0.08] transition-colors"
          >
            Dashboard
          </button>
          <div className="h-px bg-white/30" />
          <button
            type="button"
            onClick={() => { close(); signOut() }}
            className="w-full text-left px-4 py-2.5 text-base text-white hover:bg-white/[0.08] transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

function ServerLinks({ subdomain, email }: { subdomain: string; email: string }) {
  const links = [
    { href: `https://${subdomain}`, label: subdomain, note: 'your app' },
    { href: `https://auth.${subdomain}`, label: `auth.${subdomain}`, note: 'login / register' },
    { href: `https://admin.${subdomain}`, label: `admin.${subdomain}`, note: 'AI coding workspace' },
  ]
  return (
    <div className="flex flex-col gap-4 bg-green-500/5 border border-green-500/40 rounded-2xl p-5">
      <div className="flex items-center gap-2">
        <span className="text-green-400">✓</span>
        <p className="text-base font-bold text-green-400">Your server is ready!</p>
      </div>
      <div className="flex flex-col gap-2">
        {links.map(({ href, label, note }) => (
          <a key={href} href={href} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between group bg-white/[0.05] hover:bg-white/[0.10] border border-white/40 hover:border-white/60 rounded-xl px-4 py-3 transition-colors">
            <div className="flex flex-col gap-0.5">
              <span className="text-base text-white font-bold font-mono">{label}</span>
              <span className="text-sm text-white font-medium">{note}</span>
            </div>
            <span className="text-white group-hover:text-white transition-colors text-base font-bold">↗</span>
          </a>
        ))}
      </div>
      {email && (
        <p className="text-sm text-white">
          A confirmation email with these links was sent to <strong className="text-white font-bold">{email}</strong>
        </p>
      )}
    </div>
  )
}
