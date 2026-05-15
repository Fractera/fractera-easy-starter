/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Layers, Lightbulb, Code2, Rocket, TrendingUp, Brain, Target, Smartphone, AlertCircle, Mic, ShieldCheck, Database, GitBranch, Zap, ShoppingBag, Globe, Crosshair, Bot } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { DomainStatus } from '@/components/domain-status'
import { InstallForm } from '@/components/install-form'
import { PlatformSelector } from '@/components/platform-selector'
import { DeployProgress } from '@/components/deploy-progress'
import { useAuthModal, useDashboard, useCheckout } from '@/components/providers'
import { getContent } from '@/lib/i18n/content'
import { HeroContentCtx, useHeroContent } from '@/lib/i18n/context'

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
  { icon: Layers,    title: "Zero to Production",  text: "Everything comes pre-configured out of the box: architecture, database, development agents, global memory, your own server and domain." },
  { icon: Lightbulb, title: "Build the Product",   text: "If you're a product manager or entrepreneur — you can build both the product and the code. Community skill libraries help you discover new approaches and ship faster." },
  { icon: Code2,     title: "Beyond the Code",     text: "If you're a developer who wants to build products, not just write code — you'll expand your expertise into SEO, multi-language support, routing, and other product-level capabilities." },
  { icon: Rocket,    title: "Ship 10× Faster",     text: "All of this lets you ship professional applications at a fraction of the time and cost of managing a project by hand." },
]

const DESCRIPTION_ITEMS = [
  "In seconds, you get a server with a live domain — ready to start building your project with AI right in the browser.",
  "Everything comes pre-configured out of the box: architecture, database, development agents, global memory, your own server and domain.",
  "If you’re a product manager or entrepreneur — you can build both the product and the code. Community skill libraries help you discover new approaches and ship faster.",
  "If you’re a developer who wants to build products, not just write code — you’ll expand your expertise into SEO, multi-language support, routing, and other product-level capabilities.",
  "All of this lets you ship professional applications at a fraction of the time and cost of managing a project by hand.",
]

export function HeroSection({ lang }: { lang?: string }) {
  const content = getContent(lang ?? 'en')
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const paymentSuccess = searchParams.get('payment') === 'success'
  const { openModal } = useAuthModal()
  const { openServers, openWhiteLabel } = useDashboard()
  const { openCheckout } = useCheckout()

  const [imageFullscreen, setImageFullscreen] = useState(false)
  const [domainReady, setDomainReady] = useState(false)
  const [liveSubdomain, setLiveSubdomain] = useState('')
  const [installing, setInstalling] = useState(false)
  const [installStarted, setInstallStarted] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(PLANS[0]) // monthly
  const [poolAvailable, setPoolAvailable] = useState<number | null>(null)
  const domainResetRef = useRef<(() => void) | undefined>(undefined)

  // Stripe one-click: server from DB
  const [myServer, setMyServer] = useState<MyServer>(undefined as unknown as MyServer)
  const [myServerLoading, setMyServerLoading] = useState(false)
  const [stripeSubdomain, setStripeSubdomain] = useState<string | null>(null)

  // domainReady is set only via active credential verification — not from localStorage cache

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
    // Single initial check only — no auto-polling
    checkServerStatus()
  }, [paymentSuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  function checkServerStatus() {
    const stripeSessionId = searchParams.get('stripe_session_id')
    const apiUrl = stripeSessionId
      ? `/api/my-server?stripe_session_id=${encodeURIComponent(stripeSessionId)}`
      : '/api/my-server'
    setMyServerLoading(true)
    fetch(apiUrl)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.server) setMyServer(data.server) })
      .catch(() => {})
      .finally(() => setMyServerLoading(false))
  }

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
    <HeroContentCtx.Provider value={content}>
    <section className="flex flex-col gap-32 items-start">

      {/* ── AIFA-style full-screen hero with video background ── */}
      <div className="relative min-h-screen overflow-hidden flex flex-col -mx-6 w-[calc(100%+3rem)]">

        {/* Video background */}
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
          src="/video/ai-loop.mp4"
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Overlay content */}
        <div className="relative z-10 flex flex-col flex-1 min-h-screen">

          {/* Top: badge + title + description */}
          <div className="flex flex-col items-center text-center gap-6 pt-16 px-4 flex-1 justify-center max-w-3xl mx-auto">

            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/50 bg-violet-500/[0.06]">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-[0.15em]">Open Source</span>
            </div>

            <p className="text-6xl font-bold font-serif tracking-tight leading-[0.95] md:text-7xl lg:text-8xl text-white">
              Fractera
            </p>

            <h1
              className="text-3xl font-bold font-serif leading-tight md:text-4xl lg:text-5xl"
              style={{
                color: 'white',
                WebkitTextStroke: '1px rgba(139,92,246,0.8)',
                paintOrder: 'stroke fill',
                textShadow: '0 0 18px rgba(139,92,246,0.55), 0 0 36px rgba(139,92,246,0.28)',
              } as React.CSSProperties}
            >
              Production AI Development Workspace
            </h1>

            <p className="text-lg text-white/80 leading-relaxed max-w-xl">
              {content.description}
            </p>
          </div>

          {/* Bottom: 3 feature blocks (AIFA pattern) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 pb-12 pt-8 md:px-8 lg:px-12 max-w-6xl mx-auto w-full">
            {content.featureItems.slice(0, 3).map(({ title, text }, i) => (
              <div key={i} className="flex flex-col items-center text-center md:items-start md:text-left">
                <h3 className="text-2xl font-bold text-white">{title}</h3>
                <p className="mb-4 text-base text-white/50 min-h-[1.5rem]" />
                <div className="mb-4 h-px w-16 bg-violet-500" />
                <p className="text-[15px] text-white/80 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── S2: Illustration ── */}
      <div className="w-full max-w-4xl">
        <div
          className="w-full rounded-2xl border-2 border-violet-500/60 overflow-hidden shadow-2xl shadow-violet-500/[0.12] cursor-zoom-in"
          onClick={() => setImageFullscreen(true)}
          title="Click to enlarge"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Admin-Fractera.png" alt="Fractera Admin Panel" className="w-full h-auto block" />
        </div>
      </div>

      {/* ── S3: Double presentation (animated) ── */}
      <DoublePresentation />

      {/* ── S4: Platforms grid ── */}
      <PlatformsGrid />

      {/* Fullscreen lightbox */}
      {imageFullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setImageFullscreen(false)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white hover:text-violet-400 transition-colors text-3xl leading-none font-light"
            onClick={() => setImageFullscreen(false)}
          >
            ×
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Admin-Fractera.png"
            alt="Fractera Admin Panel"
            className="max-w-full max-h-[90vh] rounded-2xl border-2 border-violet-500/60 shadow-2xl"
            onClick={e => e.stopPropagation()}
            />
          </div>
        )}

      {/* Payment success: pipeline or server links */}
      {paymentSuccess && (
        <div className="w-full max-w-4xl flex flex-col gap-4 py-32">
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
                  className="text-base font-semibold text-violet-400 hover:text-violet-300 border border-violet-500/50 hover:border-violet-400/70 px-4 py-2 rounded-lg transition-colors"
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

          {/* Waiting for initial check */}
          {myServerLoading && !myServer && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-base text-white font-medium">
                <span className="inline-block w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
                Connecting to your server…
              </div>
              <button
                type="button"
                onClick={() => router.replace('/')}
                className="text-xs text-white/50 hover:text-red-400 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Server not found yet — show check button */}
          {!myServerLoading && !myServer && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-white">
                Your Fractera environment is being set up. You&apos;ll receive an email at{' '}
                <strong className="text-white">{session?.user?.email}</strong> when it&apos;s ready (3–7 min).
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={checkServerStatus}
                  className="text-sm font-semibold text-white border border-white/40 hover:border-white/60 px-4 py-2 rounded-lg transition-colors"
                >
                  Check status
                </button>
                <button
                  type="button"
                  onClick={() => router.replace('/')}
                  className="text-xs text-white/50 hover:text-red-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <p className="text-xs text-yellow-400">
            Emails from us may land in <strong>spam or junk</strong> — please check there if you don&apos;t see them.
          </p>
        </div>
      )}

      {/* Problem section */}
      <ProblemSection />

      {!paymentSuccess && (
        <div className="w-full max-w-4xl flex flex-col gap-6">

          {/* Pricing header */}
          <div className="flex flex-col gap-3 items-start text-left md:items-center md:text-center">
            <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{content.pricingHeader.label}</p>
            <h2 className="max-w-3xl font-serif font-bold leading-tight text-white text-2xl md:text-3xl lg:text-4xl">
              {content.pricingHeader.h2}
            </h2>
            <p className="max-w-xl text-base text-white/60">
              {content.pricingHeader.description}
            </p>
          </div>

          {/* Two cards — row on md+, stacked on mobile */}
          <div id="pricing" className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

            {/* ── Paid card (violet glow + shimmer border) ── */}
            <div
              className="flex flex-col gap-5 rounded-2xl p-6 bg-gradient-to-br from-violet-950/70 via-violet-900/30 to-black/60"
              style={{ animation: 'shimmerBorder 3s ease-in-out infinite', border: '1px solid rgba(139,92,246,0.7)' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
                  {content.planLabels.recommended}
                </span>
              </div>
              <div className="flex items-baseline justify-between -mt-1">
                <h3 className="text-xl font-bold text-white">Fractera Pro + Server</h3>
              </div>

              <PlanSelector selected={selectedPlan} onSelect={setSelectedPlan} />

              <ul className="flex flex-col gap-1.5 text-base text-white font-medium flex-1">
                {content.planLabels.planFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><span className="text-violet-400">✓</span><span className={i === 0 || i === 4 ? 'font-bold' : ''}>{f}</span></li>
                ))}
              </ul>

              {poolAvailable === null && (
                <div className="w-full flex items-center justify-center gap-2 py-3.5 text-sm text-white font-medium">
                  <span className="inline-block w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
                  Checking availability…
                </div>
              )}
              {poolAvailable !== null && poolAvailable > 0 && (
                <button type="button" onClick={handleOneClick}
                  className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-violet-500/30">
                  {content.planLabels.subscribeButton.replace('{price}', selectedPlan.price ?? '')}
                </button>
              )}
              {poolAvailable !== null && poolAvailable === 0 && (
                <div className="flex flex-col gap-3">
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex flex-col gap-2">
                    <p className="text-sm text-yellow-400 font-semibold">{content.planLabels.unavailableTitle}</p>
                    <p className="text-sm text-yellow-300 font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: content.planLabels.unavailableDesc }} />
                  </div>
                  <button type="button" onClick={handleOneClick}
                    className="w-full bg-yellow-600/80 hover:bg-yellow-600 text-white font-bold px-6 py-3.5 rounded-xl text-base transition-colors">
                    {content.planLabels.subscribeButtonWait.replace('{price}', selectedPlan.price ?? '')}
                  </button>
                </div>
              )}
              {!session && (
                <p className="text-sm text-white/50 text-center -mt-2">{content.planLabels.signInPrompt}</p>
              )}
            </div>

            {/* ── Free card (green glow + shimmer border) ── */}
            <div
              id="light-card"
              className="flex flex-col gap-4 rounded-2xl p-6 bg-gradient-to-br from-emerald-950/70 via-emerald-900/30 to-black/60"
              style={{ animation: 'shimmerBorderGreen 3s ease-in-out infinite', border: '1px solid rgba(52,211,153,0.7)' }}
            >
              <div className="flex flex-col gap-1">
                <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 self-start">
                  {content.planLabels.ownServer}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">Fractera Light</h3>
                <p className="text-sm text-emerald-300/70 font-medium">{content.planLabels.freeInstall}</p>
              </div>

              <ul className="flex flex-col gap-1.5 text-sm text-white font-medium flex-1">
                {content.planLabels.freeFeatures.slice(0, 4).map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><span className="text-emerald-400">✓</span><span>{f}</span></li>
                ))}
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 shrink-0 mt-0.5">◈</span>
                  <span className="text-white">{content.planLabels.freeFeatures[4]}</span>
                </li>
              </ul>

              {session ? (
                <InstallForm
                  onSubdomainReady={sub => { setLiveSubdomain(sub); setDomainReady(true) }}
                  onInstallingChange={v => { setInstalling(v); if (v) setInstallStarted(true) }}
                  onWhiteLabel={openWhiteLabel}
                />
              ) : (
                <button type="button" onClick={() => openModal()}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-emerald-500/30">
                  {content.planLabels.signInButton}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Domain status — negative margin removes the 128px gap above and below */}
      {(liveSubdomain || installing) && (
        <div className="-my-32 w-full">
          <DomainStatus
            onStatusChange={setDomainReady}
            subdomain={liveSubdomain}
            installing={installing}
            onResetRef={fn => { domainResetRef.current = fn }}
          />
        </div>
      )}

      {/* MCP block — always visible for SEO */}
      <div className="w-full max-w-4xl">
        <PlatformSelector />
      </div>

      {/* Features grid */}
      <FeaturesGrid />

      {/* Promo */}
      <FractеraPromo />

      {/* FAQ */}
      <FaqSection />

      {/* Testimonial */}
      <div className="mb-32 w-full flex justify-center">
        <FractеraTestimonial />
      </div>

    </section>
    </HeroContentCtx.Provider>
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
                    ${isSelected ? 'bg-violet-500/10' : ''}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-violet-400 bg-violet-500' : 'border-white/50'}`}>
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
                              : 'text-violet-400 bg-violet-500/10 border-violet-500/30'
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

// ─── Features grid (AIFA FeaturesGrid pattern) ───────────────────────────────

const FEATURE_LIST = [
  { icon: Mic,          title: "Voice AI Commands",       description: "Issue coding commands and navigate content hands-free via microphone. AI agents respond to natural voice input in real time.",             badge: "Lite" },
  { icon: ShieldCheck,  title: "Auth Stack Built-in",     description: "Google OAuth, magic-link via Resend, and Credentials — all pre-configured with role management and enterprise sessions.",                  badge: "Lite" },
  { icon: Database,     title: "Database & Storage",      description: "SQLite with WAL mode, object file storage, and media service included. Scales with your project without extra subscriptions.",              badge: "Lite" },
  { icon: GitBranch,    title: "GitHub & Dev Workflow",   description: "GitHub sync, production coding and local development unified. Push, pull, and deploy directly from the admin panel in one click.",          badge: "Lite" },
  { icon: Zap,          title: "Platforms in 50ms",       description: "All five coding platforms pre-configured and ready to use. LightRAG global memory initialised on first start. Zero setup time.",            badge: "Lite" },
  { icon: ShoppingBag,  title: "Skills Marketplace",      description: "Discover, buy, and sell AI workflows in the community library. Share free skills or monetise your own automation recipes.",                 badge: "Lite" },
  { icon: Globe,        title: "SEO, PWA & i18n",         description: "Production-grade SEO, Progressive Web App support, and multi-language routing — all configured before your first user arrives.",            badge: "Pro"  },
  { icon: Crosshair,    title: "Element Highlighting",    description: "Click any UI element to capture its exact identifier. Communicate precise changes to the AI — fewer tokens, faster iterations.",             badge: "Pro"  },
  { icon: Bot,          title: "Hermes AI Agents",        description: "Fully configured agents with self-learning memory. The most powerful AI technology available in seconds — not hours of setup.",             badge: "Pro"  },
]

function FeaturesGrid() {
  const content = useHeroContent()
  const ICONS = [Mic, ShieldCheck, Database, GitBranch, Zap, ShoppingBag, Globe, Crosshair, Bot]
  return (
    <div className="w-full max-w-4xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 items-start text-left md:items-center md:text-center">
        <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{content.featuresHeader.label}</p>
        <h2 className="max-w-3xl font-serif font-bold leading-tight text-white text-2xl md:text-3xl lg:text-4xl">
          {content.featuresHeader.h2}
        </h2>
        <p className="max-w-xl text-base text-white/60">
          {content.featuresHeader.description}
        </p>
      </div>

      {/* Grid */}
      <ul className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 md:gap-x-8 md:gap-y-11">
        {content.featureList.map(({ title, description, badge }, i) => {
          const Icon = ICONS[i]
          return (
          <li key={i} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Icon className="w-[22px] h-[22px] shrink-0 text-violet-400" />
              <h3 className="text-lg font-medium leading-tight tracking-tight text-white">{title}</h3>
            </div>
            <p className="text-sm leading-snug text-white/50">{description}</p>
            <span className={`mt-1 self-start text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              badge === 'Pro'
                ? 'text-violet-300 bg-violet-500/10 border-violet-500/30'
                : 'text-white/50 bg-white/[0.05] border-white/20'
            }`}>{badge}</span>
          </li>
          )
        })}
      </ul>
    </div>
  )
}

// ─── S3: Double Presentation (port of AIFA custom-double-prsentation) ────────

const DP_LEFT = {
  imageSrc: '/ai-chat.png',
  title: 'AI Coding in Your Browser',
  description: 'Open a tab, speak your intent, watch code appear. No IDE, no local setup. Five AI platforms work directly in your browser — terminals included.',
}
const DP_RIGHT = {
  imageSrc: '/ai-web.png',
  title: 'Live in Production. Instantly.',
  description: 'Your server launches in seconds. One click deploys your changes live. No CI pipeline, no hosting configuration — just ship.',
}

function DoublePresentation() {
  const content = useHeroContent()
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const [activeContainer, setActiveContainer] = useState<'left' | 'right'>('left')
  const [sliderKey, setSliderKey] = useState(0)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (isMobile) return
    let sliderTimer: ReturnType<typeof setTimeout>
    let transitionTimer: ReturnType<typeof setTimeout>
    const startCycle = () => {
      setSliderKey(k => k + 1)
      sliderTimer = setTimeout(() => {
        setActiveContainer(a => a === 'left' ? 'right' : 'left')
        transitionTimer = setTimeout(startCycle, 500)
      }, 9000)
    }
    startCycle()
    return () => { clearTimeout(sliderTimer); clearTimeout(transitionTimer) }
  }, [isMobile])

  if (isMobile === null) return null

  const renderDesktopCard = (item: typeof DP_LEFT, side: 'left' | 'right') => {
    const isActive = activeContainer === side
    return (
      <div
        style={{ flex: isActive ? '7 1 0%' : '3 1 0%', transition: 'flex 0.5s ease' }}
        className="relative flex flex-col rounded-lg overflow-hidden text-white shadow-lg h-[30rem] flex-shrink-0"
      >
        <div className="relative w-full h-60 mb-4 rounded-xl overflow-hidden border-4 border-gray-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imageSrc} alt={item.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col pt-6">
          <h2 className="text-2xl font-bold mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
            {item.title}
          </h2>
          <div className="relative w-full h-px bg-gray-700 mb-4">
            <div
              key={`slider-${side}-${sliderKey}`}
              className="absolute top-0 left-0 h-full bg-violet-500"
              style={{
                animation: isActive ? 'sliderProgress 9s linear forwards' : 'none',
                width: isActive ? undefined : '0%',
              }}
            />
          </div>
          <p className="text-white/60 text-sm line-clamp-4 min-h-[4rem]">{item.description}</p>
        </div>
      </div>
    )
  }

  const renderMobileCard = (item: typeof DP_LEFT) => (
    <div className="relative flex flex-col rounded-xl bg-gray-900 text-white shadow-lg mb-6 overflow-hidden">
      <div className="w-full relative" style={{ paddingTop: '56.25%' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.imageSrc} alt={item.title} className="absolute inset-0 w-full h-full object-cover rounded-t-xl" />
      </div>
      <div className="flex flex-col p-4">
        <h2 className="text-xl font-bold mb-2">{item.title}</h2>
        <p className="text-gray-300 text-base min-h-16">{item.description}</p>
      </div>
    </div>
  )

  const header = (
    <div className="flex flex-col gap-3 items-start text-left md:items-center md:text-center">
      <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{content.dpHeader.label}</p>
      <h2 className="max-w-3xl font-serif font-bold leading-tight text-white text-2xl md:text-3xl lg:text-4xl">
        {content.dpHeader.h2}
      </h2>
      <p className="max-w-2xl text-base text-white/60 leading-relaxed">
        {content.dpHeader.description}
      </p>
    </div>
  )

  if (isMobile) {
    return (
      <div className="w-full max-w-4xl flex flex-col gap-6">
        {header}
        {renderMobileCard(content.dpLeft)}
        {renderMobileCard(content.dpRight)}
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl flex flex-col items-center gap-12">
      {header}
      <div className="flex gap-6 w-full">
        {renderDesktopCard(content.dpLeft, 'left')}
        {renderDesktopCard(content.dpRight, 'right')}
      </div>
    </div>
  )
}

// ─── Platforms grid (AIFA Impacts pattern) ───────────────────────────────────

// Radial gradient positions: each card's highlight is at the corner facing the grid center
// Row 0: highlight toward bottom; Row 1: highlight toward top
// Col 0: highlight toward right; Col 1: highlight center; Col 2: highlight toward left
const CARD_GRADIENT_POSITIONS = [
  "100% 100%", // top-left     → bottom-right
  "50% 100%",  // top-center   → bottom
  "0% 100%",   // top-right    → bottom-left
  "100% 0%",   // bottom-left  → top-right
  "50% 0%",    // bottom-center → top
  "0% 0%",     // bottom-right  → top-left
]

const PLATFORM_CARDS = [
  { title: "Claude Code", subtitle: "Writes, runs, and fixes code in your terminal. The gold standard for AI-assisted development.",     company: "Anthropic" },
  { title: "Codex",       subtitle: "Browser-native coding agent. Full project context, no terminal required.",                         company: "OpenAI"    },
  { title: "Gemini CLI",  subtitle: "Long-context AI coding. Understands your entire project structure at once.",                       company: "Google"    },
  { title: "Qwen Code",   subtitle: "Open-source coding agent. No subscription lock-in, powerful and free.",                           company: "Alibaba"   },
  { title: "Kimi Code",   subtitle: "Context-first AI for large codebases. Excellent for refactoring and architecture.",                company: "Moonshot"  },
  { title: "LightRAG",    subtitle: "Your company brain. Persistent vector memory shared across all five AI platforms.",                company: "Fractera"  },
]

function PlatformsGrid() {
  const content = useHeroContent()
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 items-start text-left md:items-center md:text-center">
        <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{content.platformsHeader.label}</p>
        <h2 className="max-w-3xl font-serif font-bold leading-tight text-white text-2xl md:text-3xl lg:text-4xl">
          {content.platformsHeader.h2}
        </h2>
        <p className="max-w-xl text-base text-white/60">
          {content.platformsHeader.description}
        </p>
      </div>

      {/* Grid */}
      <div
        className="grid grid-cols-2 md:grid-cols-3 gap-[2px]"
        style={{ background: "radial-gradient(circle at center, hsl(263.4,70%,50.4%) 0%, rgba(0,0,0,0) 99%)" }}
      >
        {content.platformCards.map((card, i) => (
          <div key={i} className="group relative size-full p-6 sm:p-8 bg-black flex flex-col justify-between overflow-hidden">
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <p className="text-xl font-bold text-white mb-2">{card.title}</p>
                <p className="text-sm text-white/50 leading-snug">{card.subtitle}</p>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <span className="text-xs font-mono text-white/40 font-medium">{card.company}</span>
              </div>
            </div>
            {/* Hover glow — radial from the corner facing grid center */}
            <span
              className="pointer-events-none absolute inset-px opacity-0 transition-opacity duration-300 md:group-hover:opacity-100"
              style={{
                background: `radial-gradient(circle at ${CARD_GRADIENT_POSITIONS[i]}, hsl(263.4,70%,50.4%,0.45) 0%, transparent 70%)`,
              }}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>

    </div>
  )
}

// ─── Problems (AIFA-style interactive switcher) ───────────────────────────────

const FRACTERA_HELPS_ITEMS = [
  {
    id: "cloud-costs",
    title: "Unpredictable Cloud Costs",
    problem: "Auth, storage, database, email — each service bills separately and scales with traffic. What starts as free becomes a paid tier, and that tier isn't a flat $20/month — it scales with your users and their load. Miss one payment and your live product goes dark. Partners who switched to Fractera share this exact story more often than you'd expect.",
    solution: "Fractera runs everything your business needs — authentication, databases, media storage — on one server. One subscription, one bill. Cost does not scale with your users. If you pause your business, your data does not disappear. Back it up, store it, and restore when you're ready.",
  },
  {
    id: "ai-context",
    title: "AI Loses Context Every Session",
    problem: "Without persistent memory, every AI session starts from scratch. Tokens spent on 'where is the navbar?', 'what was the architecture decision?', or 'remind me how auth works here' are tokens not spent on your actual feature. Tasks that should take 2 focused messages take 15 back-and-forth exchanges.",
    solution: "Fractera includes LightRAG — a persistent vector store that remembers your entire codebase, every architectural decision, and your project's domain knowledge. Every AI message arrives with full context. Switching between Claude Code, Gemini CLI, or Codex doesn't mean losing the thread of your project.",
  },
  {
    id: "product-gap",
    title: "Products Need More Than Code",
    problem: "SEO, routing, multi-language support, auth flows, media handling — these aren't optional extras. They're what separates a toy project from a shipped product. Most developers stop at the code. Most product managers stop before it. The gap between idea and live product stays wide, and every week it stays wide costs real money.",
    solution: "Fractera ships with production-ready starters that include auth, database, file storage, and advanced routing pre-configured. The AI skips months of scaffolding and goes straight to your feature from day one. Community skill libraries help non-technical founders discover new approaches and ship faster.",
  },
  {
    id: "failure-points",
    title: "Too Many Single Points of Failure",
    problem: "Ten services means ten billing cycles, ten dashboards, ten places something can go wrong. When one service quietly expires, you often don't know which one caused the white screen. By the time you figure it out, the reputation damage is done. Running multiple projects multiplies every one of these risks.",
    solution: "Everything your application needs lives on your server, not spread across a dozen cloud dashboards. Your code stays on GitHub — recovery is always possible, even if dependencies have aged. Built-in AI systems can help rebuild the project even when some packages are outdated.",
  },
  {
    id: "hardware",
    title: "Your Hardware Shouldn't Be the Limit",
    problem: "Active AI development — global memory, autonomous agents, five coding platforms running in parallel — can push your machine hard. If you're doing anything else at the same time, performance drops fast. Not everyone can afford a dedicated high-spec computer just for AI workflows.",
    solution: "With Fractera, your device carries zero load. All computation runs on your server. You can scale it up whenever your project demands — more cores, more RAM, more throughput. Works on a laptop, tablet, or phone. No reason to upgrade your hardware until you actually need to.",
  },
]

function ProblemSection() {
  const content = useHeroContent()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  function handleSelect(index: number) {
    if (index === activeIndex || isAnimating) return
    setIsAnimating(true)
    setTimeout(() => { setActiveIndex(index); setIsAnimating(false) }, 400)
  }

  const active = content.problemItems[activeIndex]

  return (
    <div className="w-full max-w-4xl flex flex-col gap-6">

      {/* Section header */}
      <div className="flex flex-col gap-3 items-start text-left md:items-center md:text-center">
        <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{content.problemHeader.label}</p>
        <h2 className="max-w-3xl font-serif font-bold leading-tight text-white text-2xl md:text-3xl lg:text-4xl">
          {content.problemHeader.h2}
        </h2>
        <p className="max-w-xl text-base text-white/60 leading-relaxed">
          {content.problemHeader.description}
        </p>
      </div>

      {/* Interactive block */}
      <div className="flex flex-col gap-4 md:flex-row md:gap-6 items-start">

        {/* Left: nav list */}
        <ul className="flex w-full flex-col gap-y-1 md:w-[220px] md:shrink-0">
          {content.problemItems.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => handleSelect(index)}
                className={[
                  "w-full border-l-[3px] py-2.5 pl-3.5 text-left text-base font-medium leading-snug transition-all duration-200",
                  index === activeIndex
                    ? "border-violet-500 text-white cursor-default"
                    : "border-transparent text-white/40 hover:text-white/80"
                ].join(" ")}
              >
                {item.title}
              </button>
            </li>
          ))}
        </ul>

        {/* Right: content panel */}
        <div className="relative w-full grow overflow-hidden rounded-[14px] bg-gray-900 p-6 border border-white/10">

          {/* Problem */}
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-violet-400 shrink-0" />
            <h3 className="text-base font-semibold text-white">{content.problemLabel}</h3>
          </div>
          <div className="relative overflow-hidden min-h-[72px]">
            <p className={[
              "text-[15px] leading-relaxed text-white/80 transition-all duration-[400ms] ease-in-out",
              isAnimating ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
            ].join(" ")}>
              {active.problem}
            </p>
          </div>

          {/* Divider */}
          <span className="my-4 block h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Solution */}
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-violet-400 shrink-0" />
            <h3 className="text-base font-semibold text-white">{content.solutionLabel}</h3>
          </div>
          <div className="relative overflow-hidden min-h-[72px]">
            <p className={[
              "text-[15px] leading-relaxed text-white/80 transition-all duration-[400ms] ease-in-out",
              isAnimating ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
            ].join(" ")}>
              {active.solution}
            </p>
          </div>

          {/* Decorative blur */}
          <span className="pointer-events-none absolute -bottom-14 -left-32 h-[83px] w-[155px] rounded-full bg-violet-400/20 blur-2xl" />
          <span className="pointer-events-none absolute -bottom-40 -left-20 h-[293px] w-[175px] -rotate-45 rounded-full bg-gradient-to-b from-violet-400/30 to-transparent opacity-40 blur-2xl" />
          <span className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white/10" />
        </div>
      </div>
    </div>
  )
}

// ─── Testimonial (port of AIFA testimonial) ──────────────────────────────────

function FractеraTestimonial() {
  const content = useHeroContent()
  return (
    <div className="w-full max-w-4xl flex flex-col items-center">
      {/* Quote icon */}
      <div className="h-[68px] w-full relative flex items-center justify-center mb-10">
        <div className="absolute left-1/2 top-0 -ml-2.5 -mt-7 -translate-x-1/2">
          <div className="mb-6 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/blockquote-violet.svg"
              alt="Quote"
              width={96}
              height={96}
              className="w-24 h-24"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <figure className="max-w-[840px] lg:max-w-[620px]">
        <blockquote className="text-center">
          <p
            className="text-center text-[28px] leading-snug tracking-tighter lg:text-2xl md:text-xl bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(167,139,250,0.2) 0%, rgba(167,139,250,0.9) 25%, #a78bfa 50%, rgba(167,139,250,0.9) 75%, rgba(167,139,250,0.2) 100%)",
            }}
          >
            Be so involved they can&apos;t tell if you&apos;re crazy or a genius.
          </p>
        </blockquote>

        <figcaption className="mt-5 flex flex-col items-center gap-6">
          <div className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/roma_armstrong.jpg"
              alt="Roma Armstrong photo"
              width={30}
              height={30}
              className="mr-2.5 rounded-full"
            />
            <span className="text-lg font-light leading-tight tracking-tight text-gray-400 lg:text-base md:text-sm">
              Roma Armstrong
              <cite className="ml-1.5 not-italic text-gray-500 before:mr-1.5 before:inline-flex before:h-px before:w-4 before:bg-gray-500 before:align-middle">
                Founder at Fractera.ai
              </cite>
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="#" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/20 text-sm font-medium text-white/60 hover:text-white hover:border-white/40 transition-colors">
              {content.testimonial.blogButton}
            </a>
            <a href="#" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/20 text-sm font-medium text-white/60 hover:text-white hover:border-white/40 transition-colors">
              {content.testimonial.casesButton}
            </a>
            <a href="#" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-violet-500/40 bg-violet-500/[0.06] text-sm font-medium text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/60 transition-colors">
              {content.testimonial.marketplaceButton}
            </a>
          </div>
        </figcaption>
      </figure>
    </div>
  )
}

// ─── Promo (port of AIFA aifa-promo) ─────────────────────────────────────────

function FractеraPromo() {
  const content = useHeroContent()
  return (
    <div className="w-full self-stretch -mx-6 px-6 bg-black border-y-4 border-violet-500 py-8">
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-between gap-8 md:flex-row md:gap-16">
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <h2 className="mb-6 max-w-3xl font-serif font-bold leading-tight text-white text-xl md:text-2xl lg:text-4xl">
            {content.promoSection.h2}
          </h2>
          <p className="mb-12 max-w-xl text-base text-white/60 md:text-lg">
            {content.promoSection.description}
          </p>
          <a
            href="https://github.com/Fractera/ai-workspace"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 justify-center rounded-full bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-2.5 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/></svg>
            {content.promoSection.githubButton}
          </a>
        </div>
        <div className="relative shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/git.png"
            width={300}
            height={300}
            alt="Fractera"
            className="h-auto max-w-xs sm:max-w-sm md:max-w-md"
          />
        </div>
      </div>
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
    q: 'How does Fractera keep your business stable?',
    a: [
      'Modern web development has a tempting formula: combine a handful of "free" services around platforms like Vercel or Netlify — plug in Clerk for auth, Supabase for your database, and a dozen other cloud APIs. It looks great on day one.',
      'The problems surface when your prototype becomes a real business. Each service quietly updates its pricing. What starts as free becomes a paid tier — and that paid tier is not a flat $20/month. It scales with your traffic, your users, and the load they put on the network. Multiply that across five or ten services and the math gets unpredictable fast.',
      'Worse: you now have ten billing cycles to track. Miss one payment and your project goes dark. No warning, no grace period — just a white screen where your business used to be. Partners who switched to Fractera often share exactly this story: a live project lost because one service expired, and it was not even clear which one had caused it. By the time they figured it out, the reputation damage was done. Running multiple projects only multiplies that risk.',
      'Fractera is built around a different principle: everything your business actually needs — authentication, databases, media storage, document storage, a company knowledge base — lives on your server, not spread across a dozen cloud dashboards.',
    ],
    bullets: [
      'One subscription, one server — cost does not scale with your users.',
      'If you pause your business, your data does not disappear. Back it up, store it on a drive, and restore it to a new project when you are ready.',
      'Your application code lives on GitHub — recovery is always possible, even if dependencies have aged.',
      'Built-in AI systems can help rebuild the project even when some packages are outdated.',
    ],
    trail: [
      'One server. One bill. Maximum resilience — whether you are running one project or ten.',
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
    q: 'Can I deploy a finished project to Vercel instead of keeping it on my own server?',
    a: [
      'Yes — once a project is complete and no longer needs active AI-assisted development, you can export it to Vercel. Connect cloud databases and object storage, push to GitHub, and deploy.',
      'Important: moving to Vercel means leaving the Fractera environment behind. The AI coding workspace, terminal access, LightRAG memory, and all five development platforms only run on your own server. A restaurant menu or a simple landing page is a good candidate for this move — a product you\'re still actively building is not.',
      'Also keep in mind that Vercel and cloud storage pricing can escalate quickly under real-world traffic. When that happens, migrating back to a self-hosted Fractera server is straightforward — your code is already on GitHub.',
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
    q: 'Can I combine local development with the Fractera production platform?',
    a: [
      'Yes — and for developers with an existing local setup, this is often the most natural workflow.',
      'If you prefer working with hot reload in your IDE, you don\'t have to change your habits. Use Fractera as your production environment and your local machine as the development workspace:',
    ],
    steps: [
      'After setting up your Fractera project, connect it to a GitHub repository and push the initial codebase.',
      'Pull the code to your local machine. Develop the way you always have — your IDE, your preferred AI tools, hot reload.',
      'When ready to ship, push your changes to GitHub.',
      'Return to your Fractera workspace, pull from GitHub, and hit Deploy.',
    ],
    trail: [
      'Your changes go live in production in minutes — no CI pipeline to configure, no hosting provider to manage. In effect, your own server becomes a self-hosted alternative to Vercel: GitHub is the bridge between your local environment and production.',
      'Your local development environment will continue to use the database and file storage that live on your server — no cloud database or cloud storage subscription required. If you later decide to migrate to a fully cloud-based setup, that is also possible: use the corresponding Skills available in your Fractera workspace to handle the migration.',
    ],
  },
  {
    q: 'Can I remove the "Powered by Fractera" branding from my site?',
    a: [
      'Yes — White Label is a one-time $100 purchase per server. After payment, the Fractera branding is removed from your site automatically and permanently.',
    ],
    bullets: [
      'Instant: branding disappears as soon as the payment is processed.',
      'Permanent: if you ever rebuild your server, white label status is remembered and reapplied automatically.',
      'Per server: each server requires a separate purchase.',
    ],
    trail: [
      'To purchase, open your Dashboard, select the server, and click "Remove Fractera branding". Your purchase history is saved in the Purchases tab for support purposes.',
      'Tip: after removal, open your site in an incognito / private browsing window to confirm the footer is gone — your main browser tab may show a cached version of the page.',
    ],
  },
  {
    q: 'Do you have a referral program?',
    a: [
      'Yes — we offer a referral program for content creators, bloggers, and anyone interested in building their own branded version of Fractera.',
      'Partners receive a complete white-label deployment of Fractera, including the landing page and the deployment infrastructure. Partners set their own pricing within our recommended range and are free to offer their own discounts.',
    ],
    bullets: [
      'All subscription payments go directly to the partner — 100%.',
      'All White Label purchases (removing Fractera branding) also go entirely to the partner.',
      'Partners define their own pricing for both subscriptions and White Label.',
      'Partners are required to retain attribution to the Fractera brand on their landing page. In exchange, Fractera recommends the partner\'s platform to specific audiences or localization markets.',
    ],
    trail: [
      'To apply: publish a public post or article about Fractera, then email admin@fractera.ai with the link. The link is reviewed by AI — if verified, you\'ll receive a personal offer. Deployment is a one-time $500 fee. No recurring payments. Availability is limited.',
      'We are also looking for regional distributors. For inquiries, contact: admin@fractera.ai',
    ],
  },
  {
    q: 'What happens when I delete my server?',
    a: [
      'Deleting a server from your dashboard stops all Fractera services, removes the installation from the VPS, and releases your subdomain. The VPS itself is not deleted — it remains with your hosting provider and can be reinstalled at any time.',
    ],
    bullets: [
      'Your paid subscription is preserved — it is not cancelled when you delete the server. You can deploy a new server and continue using your subscription.',
      'White Label status is tied to the server. If you purchased branding removal, it applies to that specific server. Deleting the server and deploying a new one does not automatically carry over the White Label.',
      'Your free (self-hosted) subscription is cancelled automatically when the server is deleted, since it has no value without an active server.',
    ],
    trail: [
      'If you deleted your server by mistake and need to restore White Label on a new deployment without paying again, contact support at support@fractera.ai — we will apply your existing purchase manually.',
    ],
  },
]

function FaqSection() {
  const content = useHeroContent()
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="w-full max-w-4xl flex flex-col gap-6">
      <div className="flex flex-col gap-3 items-start text-left md:items-center md:text-center">
        <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{content.faqHeader.label}</p>
        <h2 className="max-w-3xl font-serif font-bold leading-tight text-white text-2xl md:text-3xl lg:text-4xl">
          {content.faqHeader.h2}
        </h2>
        <p className="max-w-xl text-base text-white/60">
          {content.faqHeader.description}
        </p>
      </div>
      <div className="flex flex-col rounded-2xl border border-white/40 overflow-hidden divide-y divide-white/20">
        {content.faqItems.map((item, i) => (
          <div key={i} className="bg-white/[0.02]">
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left hover:bg-white/[0.04] transition-colors"
            >
              <span className="text-lg font-semibold text-white leading-snug">{item.q}</span>
              <span
                className={`shrink-0 text-white mt-0.5 transition-transform duration-200 select-none ${open === i ? 'rotate-180' : ''}`}
              >
                ▾
              </span>
            </button>
            {open === i && (
              <div className="px-5 pb-5 flex flex-col gap-3">
                {item.a.map((para, pi) => (
                  <p key={pi} className="text-[15px] text-white leading-relaxed">{para}</p>
                ))}
                {item.steps && (
                  <ol className="flex flex-col gap-2 mt-1">
                    {item.steps.map((step, si) => (
                      <li key={si} className="flex items-start gap-3 text-[15px] text-white leading-relaxed">
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
                        <span className="shrink-0 text-violet-400 mt-0.5 font-bold">✓</span>
                        <span className="text-[15px] text-white">{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {item.trail && item.trail.map((para, pi) => (
                  <p key={pi} className={`text-[15px] leading-relaxed ${pi === item.trail!.length - 1 ? 'text-violet-400 font-semibold' : 'text-white'}`}>{para}</p>
                ))}
              </div>
            )}
          </div>
        ))}


      </div>
    </div>
  )
}
