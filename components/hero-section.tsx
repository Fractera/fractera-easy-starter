/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Layers, Lightbulb, Code2, Rocket } from 'lucide-react'
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

const FEATURE_ITEMS = [
  { icon: Layers,    text: "Everything comes pre-configured out of the box: architecture, database, development agents, global memory, your own server and domain." },
  { icon: Lightbulb, text: "If you're a product manager or entrepreneur — you can build both the product and the code. Community skill libraries help you discover new approaches and ship faster." },
  { icon: Code2,     text: "If you're a developer who wants to build products, not just write code — you'll expand your expertise into SEO, multi-language support, routing, and other product-level capabilities." },
  { icon: Rocket,    text: "All of this lets you ship professional applications at a fraction of the time and cost of managing a project by hand." },
]

const DESCRIPTION_ITEMS = [
  "In seconds, you get a server with a live domain — ready to start building your project with AI right in the browser.",
  "Everything comes pre-configured out of the box: architecture, database, development agents, global memory, your own server and domain.",
  "If you’re a product manager or entrepreneur — you can build both the product and the code. Community skill libraries help you discover new approaches and ship faster.",
  "If you’re a developer who wants to build products, not just write code — you’ll expand your expertise into SEO, multi-language support, routing, and other product-level capabilities.",
  "All of this lets you ship professional applications at a fraction of the time and cost of managing a project by hand.",
]

export function HeroSection() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const paymentSuccess = searchParams.get('payment') === 'success'
  const { openModal } = useAuthModal()
  const { openServers } = useDashboard()
  const { openCheckout } = useCheckout()

  const [imageFullscreen, setImageFullscreen] = useState(false)
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

  useEffect(() => {
    if (!imageFullscreen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setImageFullscreen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [imageFullscreen])

  const showTroubleshoot = installStarted && !domainReady

  return (
    <section className="flex flex-col gap-8 items-start sm:items-center">

      {/* Hero: single column */}
      <div className="flex flex-col gap-8 items-start sm:items-center w-full max-w-2xl">

        {/* Open Source badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/50 bg-orange-500/[0.06]">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
          <span className="text-xs font-semibold text-orange-400 uppercase tracking-[0.15em]">Open Source</span>
        </div>

        {/* Title + subtitle */}
        <div className="flex flex-col gap-3 sm:items-center">
          <h1 className="text-7xl font-bold tracking-tight font-serif sm:text-center leading-[0.95]">
            Fractera
          </h1>
          <p className="text-2xl font-bold text-white sm:text-center leading-tight">
            Production AI Development Workspace
          </p>
        </div>

        {/* Orange accent divider */}
        <div className="w-16 h-0.5 bg-gradient-to-r from-orange-500 to-orange-500/0" />

        {/* Lead paragraph */}
        <p className="text-lg font-semibold text-white leading-relaxed sm:text-center">
          {DESCRIPTION_ITEMS[0]}
        </p>

        {/* Illustration */}
        <div
          className="w-full rounded-2xl border-2 border-orange-500/60 overflow-hidden shadow-2xl shadow-orange-500/[0.12] cursor-zoom-in"
          onClick={() => setImageFullscreen(true)}
          title="Click to enlarge"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Admin-Fractera.png" alt="Fractera Admin Panel" className="w-full h-auto block" />
        </div>

        {/* 2×2 feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {FEATURE_ITEMS.map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex flex-col gap-3 bg-white/[0.03] border border-white/20 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-orange-400" />
              </div>
              <p className="text-base text-white leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        {/* Star subscription line */}
        <p className="text-sm text-orange-400 sm:text-center">
          ★ Runs on your own Claude Code subscription — or any other platform subscription. No API keys required.
        </p>

        {/* Supported platforms */}
        <div className="flex flex-col gap-2 sm:items-center">
          <span className="text-xs font-semibold text-white uppercase tracking-widest">Supported platforms</span>
          <div className="flex items-center gap-1.5 flex-wrap sm:justify-center">
            {PLATFORMS.map((name, i) => (
              <span key={name} className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-semibold text-white px-2 py-0.5 rounded-full border border-white/40 bg-white/[0.07] tracking-wide whitespace-nowrap">
                  {name}
                </span>
                {i < PLATFORMS.length - 1 && (
                  <span className="text-white text-xs select-none">·</span>
                )}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Fullscreen lightbox */}
      {imageFullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setImageFullscreen(false)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white hover:text-orange-400 transition-colors text-3xl leading-none font-light"
            onClick={() => setImageFullscreen(false)}
          >
            ×
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Admin-Fractera.png"
            alt="Fractera Admin Panel"
            className="max-w-full max-h-[90vh] rounded-2xl border-2 border-orange-500/60 shadow-2xl"
            onClick={e => e.stopPropagation()}
            />
          </div>
        )}

      </div>

      {/* Payment success: pipeline or server links */}
      {paymentSuccess && (
        <div className="w-full max-w-2xl flex flex-col gap-4">
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

          <p className="text-xs text-yellow-400">
            Emails from us may land in <strong>spam or junk</strong> — please check there if you don&apos;t see them.
          </p>
        </div>
      )}

      {!paymentSuccess && (
        <div className="w-full max-w-2xl flex flex-col gap-4">

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
              <li className="flex items-start gap-2">
                <span className="text-orange-400 shrink-0 mt-0.5">◈</span>
                <span className="text-white">Fractera Pro — <span className="text-orange-400 font-semibold">14-day free trial available</span></span>
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
        <div className="w-full max-w-2xl flex flex-col gap-3">
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
          <div className="flex flex-col gap-6 w-full max-w-2xl">
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

      {/* FAQ */}
      <FaqSection />

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

// ─── FAQ ─────────────────────────────────────────────────────────────────────

type FaqItem = {
  q: string
  a: string[]
  steps?: string[]
  bullets?: string[]
  trail?: string[]
}

const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'The same AI platforms — yet Fractera ships faster with fewer tokens. Why?',
    a: [
      'Regular vibe coding puts all the heavy lifting on the AI: design the architecture, write boilerplate, locate the right component, recall what was decided last session. Every token spent on that overhead is a token not spent on your actual feature.',
      'Fractera eliminates that overhead at every layer:',
    ],
    bullets: [
      'Production-ready starters — Auth, database, file storage, and advanced routing (parallel routes, protected layouts, nested segments) ship fully pre-configured. The AI skips months of scaffolding and goes straight to your feature from day one.',
      'Component highlighting in the editor — Click any element on your live site to jump directly to its source. No tokens wasted asking "where is the navbar?" or hunting through hundreds of files.',
      'LightRAG, your company brain — A persistent vector store that remembers your entire codebase, every architectural decision, and your project\'s domain knowledge. Every AI message arrives with full context — not starting from scratch.',
      'AI-optimized skills & instructions — Pre-built prompts and workflows specifically designed for non-professional developers. The right approach on the first try, not after five failed attempts.',
      'Cross-platform orchestration — LightRAG coordinates all five coding platforms so they share context. Switching from Claude Code to Gemini CLI doesn\'t mean losing the thread of your project.',
    ],
    trail: [
      'The result: tasks that take 10–20 back-and-forth messages in a vanilla AI chat typically resolve in 2–3 focused exchanges inside Fractera — because the AI already knows your codebase, already has the patterns, and already understands your intent.',
      'This is Fractera Pro. And once you\'ve tried it, there\'s no going back to plain vibe coding.',
    ],
  },
  {
    q: 'What server specs do I need?',
    a: [
      'For full AI-coding workloads, the recommended minimum is 6 cores and 8 GB RAM. Storage depends on your project — 75 GB is a solid baseline, though go larger if you plan to host video or media files.',
      'Once active AI development wraps up and you just need the app running, you can downgrade to 2 cores / 4 GB RAM. Servers at that tier typically rent for €1–2 per month.',
    ],
  },
  {
    q: 'Can I switch from the paid plan to free self-hosting later?',
    a: ['Yes — at any time. Here\'s the recommended migration path:'],
    steps: [
      'Keep your code continuously synced to GitHub throughout your subscription.',
      'Export your database and file storage to an external drive.',
      'Provision a new server and deploy a mirror of your project.',
      'Import your database and file storage, then verify the app works end-to-end.',
      'Point your custom domain to the new server, then cancel your subscription.',
    ],
  },
  {
    q: 'Can I bring my existing project into Fractera and continue AI-assisted development?',
    a: [
      'Yes. Connect your existing GitHub repository to your Fractera workspace and start coding with AI immediately. Depending on your project\'s complexity, some initial migration steps may be needed — Fractera\'s built-in AI assistants can guide you through the process.',
    ],
  },
  {
    q: 'Can I use Vercel and cloud storage to run everything for free?',
    a: [
      'You can. Connect cloud databases and object storage, push your project to GitHub, and deploy it on Vercel. Just keep in mind that Vercel and cloud storage pricing can escalate quickly under real-world traffic.',
      'When that happens, Fractera\'s self-hosted option gives you predictable monthly costs regardless of traffic volume. Migrating back is straightforward — your code is already on GitHub.',
    ],
  },
  {
    q: 'Pricing and plans — details',
    a: [
      'Fractera is open-source — you can self-host and run it entirely on your own infrastructure at no cost.',
      'Deploying with our tools gives you Fractera Lite, which covers roughly 90% of everything you need to build and ship a professional application.',
      'Want more? Fractera Pro adds advanced capabilities on top of your own server for $20/month or $149/year.',
      'Need the fastest path to a live environment? Our hosted plan includes the server, full Fractera Pro, and everything pre-configured — $25/month or $199/year.',
    ],
  },
  {
    q: 'Do you have a referral program?',
    a: [
      'Yes — we offer a referral program for content creators, bloggers, and anyone interested in building their own branded version of Fractera.',
      'Partners receive a complete white-label deployment of Fractera, including the landing page and the deployment infrastructure. All payments go directly to the partner. Partners set their own pricing within our recommended range and are free to offer their own discounts.',
      'Partners are required to retain attribution to the Fractera brand. In exchange, Fractera will recommend your platform to specific audiences or localization markets from our own pages.',
      'To apply, send an email to admin@fractera.ai. Before reaching out, publish a public post or article about Fractera and include the link in your email. The link will be reviewed by AI — if verified, you\'ll receive a personal offer and your platform will be deployed.',
      'Deployment is a one-time $500 fee. No recurring payments. Availability is limited.',
    ],
  },
]

function FaqSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="w-full max-w-2xl flex flex-col gap-4">
      <p className="text-xs font-mono font-bold text-white uppercase tracking-widest">FAQ</p>
      <div className="flex flex-col rounded-2xl border border-white/40 overflow-hidden divide-y divide-white/20">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className="bg-white/[0.02]">
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left hover:bg-white/[0.04] transition-colors"
            >
              <span className="text-base font-semibold text-white leading-snug">{item.q}</span>
              <span
                className={`shrink-0 text-white mt-0.5 transition-transform duration-200 select-none ${open === i ? 'rotate-180' : ''}`}
              >
                ▾
              </span>
            </button>
            {open === i && (
              <div className="px-5 pb-5 flex flex-col gap-3">
                {item.a.map((para, pi) => (
                  <p key={pi} className="text-base text-white leading-relaxed">{para}</p>
                ))}
                {item.steps && (
                  <ol className="flex flex-col gap-2 mt-1">
                    {item.steps.map((step, si) => (
                      <li key={si} className="flex items-start gap-3 text-base text-white leading-relaxed">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-white/[0.08] border border-white/40 flex items-center justify-center text-xs font-bold text-white mt-0.5">
                          {si + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                )}
                {item.bullets && (
                  <ul className="flex flex-col gap-2.5 mt-1">
                    {item.bullets.map((b, bi) => (
                      <li key={bi} className="flex items-start gap-3 text-base leading-relaxed">
                        <span className="shrink-0 text-orange-400 mt-0.5 font-bold">✓</span>
                        <span className="text-white">{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {item.trail && item.trail.map((para, pi) => (
                  <p key={pi} className={`text-base leading-relaxed ${pi === item.trail!.length - 1 ? 'text-orange-400 font-semibold' : 'text-white'}`}>{para}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
