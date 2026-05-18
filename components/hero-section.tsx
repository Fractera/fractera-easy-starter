/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bot, Brain, Code2, Globe, Database, ShoppingBag } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { DomainStatus } from '@/components/domain-status'
import { InstallForm } from '@/components/install-form'
import { PlatformSelector } from '@/components/platform-selector'
import { DeployProgress } from '@/components/deploy-progress'
import { useAuthModal, useDashboard, useCheckout } from '@/components/providers'
import { getContent } from '@/lib/i18n/content'
import { HeroContentCtx } from '@/lib/i18n/context'
import { LoopShowcase } from '@/components/sections/loop-showcase'
import { DoublePresentation } from '@/components/sections/double-presentation'
import { PlatformsGrid } from '@/components/sections/platforms-grid'
import { ProblemSection } from '@/components/sections/problem-section'
import { FeaturesGrid } from '@/components/sections/features-grid'
import { FractеraPromo } from '@/components/sections/fractera-promo'
import { FaqSection } from '@/components/sections/faq-section'
import { FractеraTestimonial } from '@/components/sections/testimonial'

const HERO_BENEFIT_ICONS = [Bot, Brain, Code2, Globe, Database, ShoppingBag]

type MyServer = {
  id: string
  status: string
  subdomain: string | null
  deploySessionId: string | null
  createdAt: string
} | null

type Plan = {
  id: string
  name: string
  sublabel: string
  price: string | null
  period: string | null
  badge: string | null
  comingSoon?: boolean
}

export function HeroSection({ lang }: { lang?: string }) {
  const content = getContent(lang ?? 'en')
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const paymentSuccess = searchParams.get('payment') === 'success'
  const { openModal } = useAuthModal()
  const { openServers, openWhiteLabel } = useDashboard()
  const { openCheckout } = useCheckout()

  const plans: Plan[] = [
    { id: 'monthly', name: 'Fractera Pro + Server', sublabel: content.planLabels.monthlySubLabel, price: '$25',  period: '/mo', badge: content.planLabels.popularBadge },
    { id: 'annual',  name: 'Fractera Pro + Server', sublabel: content.planLabels.annualSubLabel,  price: '$190', period: '/yr', badge: content.planLabels.bestValueBadge },
  ]

  const [domainReady, setDomainReady] = useState(false)
  const [liveSubdomain, setLiveSubdomain] = useState('')
  const [installing, setInstalling] = useState(false)
  const [installStarted, setInstallStarted] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(plans[0])
  const [poolAvailable, setPoolAvailable] = useState<number | null>(null)
  const domainResetRef = useRef<(() => void) | undefined>(undefined)

  const [myServer, setMyServer] = useState<MyServer>(undefined as unknown as MyServer)
  const [myServerLoading, setMyServerLoading] = useState(false)
  const [stripeSubdomain, setStripeSubdomain] = useState<string | null>(null)

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

  const pendingPlan = searchParams.get('pending_plan')
  useEffect(() => {
    if (session && pendingPlan) {
      router.replace('/')
      openCheckout(pendingPlan)
    }
  }, [session, pendingPlan]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <HeroContentCtx.Provider value={content}>
    <section className="flex flex-col gap-32 items-start">

      {/* ── Hero fullscreen ── */}
      <div className="relative min-h-screen overflow-hidden flex flex-col -mx-6 w-[calc(100%+3rem)]">
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
          src="/video/ai-loop.mp4"
          autoPlay loop muted playsInline
        />
        <div className="relative z-10 flex flex-col flex-1 min-h-screen">
          <div className="flex flex-col items-center text-center gap-6 pt-16 px-4 flex-1 justify-center max-w-3xl mx-auto">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/50 bg-violet-500/[0.06]">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-[0.15em]">Open Source</span>
            </div>
            <p className="text-6xl font-bold font-serif tracking-tight leading-[0.95] md:text-7xl lg:text-8xl text-white">Fractera</p>
            <h1
              className="text-3xl font-bold font-serif leading-tight md:text-4xl lg:text-5xl"
              style={{ color: 'white', WebkitTextStroke: '1px rgba(139,92,246,0.8)', paintOrder: 'stroke fill', textShadow: '0 0 18px rgba(139,92,246,0.55), 0 0 36px rgba(139,92,246,0.28)' } as React.CSSProperties}
            >
              {content.heroTitle}
            </h1>
            <p className="text-lg text-white/80 leading-relaxed max-w-xl">{content.description}</p>
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-4 rounded-xl text-base transition-colors shadow-lg shadow-violet-500/30 mt-2"
            >
              {content.deployButton}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10 px-4 pb-12 pt-8 md:px-8 lg:px-12 max-w-6xl mx-auto w-full">
            {content.heroBenefits.map(({ title, text }, i) => {
              const Icon = HERO_BENEFIT_ICONS[i]
              return (
                <div key={i} className="flex flex-col items-center text-center md:items-start md:text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-5 h-5 shrink-0 text-violet-400" />
                    <h3 className="text-lg font-bold text-white leading-snug">{title}</h3>
                  </div>
                  <div className="mb-3 h-px w-12 bg-violet-500" />
                  <p className="text-[14px] text-white/70 leading-relaxed">{text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <LoopShowcase />
      <DoublePresentation />
      <PlatformsGrid />

      {/* ── Payment success ── */}
      {paymentSuccess && (
        <div className="w-full max-w-4xl flex flex-col gap-4 py-32">
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-lg">✓</span>
            <p className="text-sm font-semibold text-green-400">Payment confirmed</p>
          </div>

          {myServer?.status === 'active' && (myServer.subdomain || stripeSubdomain) && (
            <>
              <ServerLinks subdomain={(stripeSubdomain ?? myServer.subdomain)!} email={session?.user?.email ?? ''} />
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={openServers}
                  className="text-base font-semibold text-white hover:text-white border border-white/40 hover:border-white/60 px-4 py-2 rounded-lg transition-colors">
                  Open Dashboard →
                </button>
                <button type="button" onClick={() => router.replace('/')}
                  className="text-base font-semibold text-violet-400 hover:text-violet-300 border border-violet-500/50 hover:border-violet-400/70 px-4 py-2 rounded-lg transition-colors">
                  Deploy another server →
                </button>
              </div>
            </>
          )}

          {myServer && myServer.status !== 'active' && myServer.deploySessionId && (
            <DeployProgress
              sessionId={myServer.deploySessionId}
              onComplete={sub => {
                setStripeSubdomain(sub)
                setMyServer(prev => prev ? { ...prev, status: 'active', subdomain: sub } : prev)
              }}
            />
          )}

          {myServerLoading && !myServer && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-base text-white font-medium">
                <span className="inline-block w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
                Connecting to your server…
              </div>
              <button type="button" onClick={() => router.replace('/')}
                className="text-xs text-white/50 hover:text-red-400 transition-colors font-medium">Cancel</button>
            </div>
          )}

          {!myServerLoading && !myServer && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-white">
                Your Fractera environment is being set up. You&apos;ll receive an email at{' '}
                <strong className="text-white">{session?.user?.email}</strong> when it&apos;s ready (3–7 min).
              </p>
              <div className="flex items-center gap-3">
                <button type="button" onClick={checkServerStatus}
                  className="text-sm font-semibold text-white border border-white/40 hover:border-white/60 px-4 py-2 rounded-lg transition-colors">
                  Check status
                </button>
                <button type="button" onClick={() => router.replace('/')}
                  className="text-xs text-white/50 hover:text-red-400 transition-colors font-medium">Cancel</button>
              </div>
            </div>
          )}

          <p className="text-xs text-yellow-400">
            Emails from us may land in <strong>spam or junk</strong> — please check there if you don&apos;t see them.
          </p>
        </div>
      )}

      <ProblemSection />

      {/* ── Pricing ── */}
      {!paymentSuccess && (
        <div className="w-full max-w-4xl flex flex-col gap-6">
          <div className="flex flex-col gap-3 items-start text-left md:items-center md:text-center">
            <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{content.pricingHeader.label}</p>
            <h2 className="max-w-3xl font-serif font-bold leading-tight text-white text-2xl md:text-3xl lg:text-4xl">
              {content.pricingHeader.h2}
            </h2>
            <p className="max-w-xl text-base text-white/60">{content.pricingHeader.description}</p>
          </div>

          <div id="pricing" className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Paid card */}
            <div className="flex flex-col gap-5 rounded-2xl p-6 bg-gradient-to-br from-violet-950/70 via-violet-900/30 to-black/60"
              style={{ animation: 'shimmerBorder 3s ease-in-out infinite', border: '1px solid rgba(139,92,246,0.7)' }}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
                  {content.planLabels.recommended}
                </span>
              </div>
              <div className="flex items-baseline justify-between -mt-1">
                <h3 className="text-xl font-bold text-white">Fractera Pro + Server</h3>
              </div>
              <PlanSelector plans={plans} selected={selectedPlan} onSelect={setSelectedPlan} content={content.planLabels} />
              <ul className="flex flex-col gap-1.5 text-base text-white font-medium flex-1">
                {content.planLabels.planFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-violet-400">✓</span>
                    <span className={i === 0 ? 'font-bold' : ''}>{f}</span>
                  </li>
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

            {/* Free card */}
            <div id="light-card" className="flex flex-col gap-4 rounded-2xl p-6 bg-gradient-to-br from-emerald-950/70 via-emerald-900/30 to-black/60"
              style={{ animation: 'shimmerBorderGreen 3s ease-in-out infinite', border: '1px solid rgba(52,211,153,0.7)' }}>
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

          <div className="grid grid-cols-3 gap-3">
            {content.planLabels.trustItems.map((item, i) => (
              <div key={i} className="flex items-center justify-center py-3 px-4 rounded-xl border border-white/15 bg-white/[0.03] text-sm font-bold text-white text-center tracking-wide">
                {item}
              </div>
            ))}
          </div>

          <p className="text-xs text-orange-400/80 leading-relaxed">{content.planLabels.disclaimer}</p>

          {/* Server providers */}
          <div className="flex flex-col gap-5 pt-4 border-t border-white/10">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{content.serverSection.label}</p>
              <h3 className="text-xl font-bold font-serif text-white">{content.serverSection.h2}</h3>
              <p className="text-sm text-white/50 leading-relaxed max-w-xl">{content.serverSection.description}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {content.serverSection.providers.map(({ name, tagline, url }) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer"
                  className="group flex flex-col gap-2 rounded-xl border border-white/20 hover:border-violet-500/60 bg-white/[0.03] hover:bg-violet-500/[0.06] px-4 py-4 transition-all duration-200">
                  <span className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">{name} ↗</span>
                  <span className="text-xs text-white/45 leading-snug">{tagline}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Domain status ── */}
      {(liveSubdomain || installing) && (
        <div className="w-full max-w-4xl flex flex-col gap-6">
          <div className="flex flex-col gap-3 items-start text-left md:items-center md:text-center">
            <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{content.domainSection.label}</p>
            <h2 className="max-w-3xl font-serif font-bold leading-tight text-white text-2xl md:text-3xl lg:text-4xl">
              {content.domainSection.h2}
            </h2>
            <p className="max-w-xl text-base text-white/60">{content.domainSection.description}</p>
          </div>
          <div className="w-full rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/50 via-violet-900/20 to-black/60 p-6">
            <DomainStatus
              onStatusChange={setDomainReady}
              subdomain={liveSubdomain}
              installing={installing}
              onResetRef={fn => { domainResetRef.current = fn }}
            />
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl">
        <PlatformSelector />
      </div>

      <FeaturesGrid />
      <FractеraPromo />
      <FaqSection />

      <div className="mb-32 w-full flex justify-center">
        <FractеraTestimonial />
      </div>

    </section>
    </HeroContentCtx.Provider>
  )
}

// ─── PlanSelector ─────────────────────────────────────────────────────────────

type PlanLabels = { pricingPlan: string; freeForever: string }

function PlanSelector({ plans, selected, onSelect, content }: {
  plans: Plan[]
  selected: Plan
  onSelect: (p: Plan) => void
  content: PlanLabels
}) {
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
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-3 bg-white/[0.06] hover:bg-white/[0.10] border border-white/40 hover:border-white/60 rounded-xl px-4 py-3 transition-colors"
      >
        <div className="flex flex-col items-start gap-0.5 min-w-0">
          <span className="text-xs text-white font-semibold uppercase tracking-widest">{content.pricingPlan}</span>
          <span className="text-base text-white font-bold">{selected.name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {selected.price
            ? <span className="text-lg font-bold text-white">{selected.price}<span className="text-sm text-white font-normal">{selected.period}</span></span>
            : <span className="text-base text-white font-semibold">{content.freeForever}</span>
          }
          <span className={`text-white text-sm transition-transform duration-150 ${open ? 'rotate-180' : ''}`}>▾</span>
        </div>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-950 border border-white/40 rounded-2xl shadow-2xl overflow-hidden z-30">
          {plans.map((plan, i) => {
            const isSelected = plan.id === selected.id
            return (
              <div key={plan.id}>
                {i > 0 && <div className="h-px bg-white/20 mx-4" />}
                <button
                  type="button"
                  onClick={() => { onSelect(plan); setOpen(false) }}
                  disabled={plan.comingSoon}
                  className={`w-full flex items-center justify-between gap-3 px-5 py-4 text-left transition-colors ${plan.comingSoon ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/[0.07] cursor-pointer'} ${isSelected ? 'bg-violet-500/10' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-violet-400 bg-violet-500' : 'border-white/50'}`}>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white">{plan.name}</span>
                        {plan.badge && (
                          <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded-full border ${plan.badge === content.freeForever ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : plan.id === 'annual' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-violet-400 bg-violet-500/10 border-violet-500/30'}`}>
                            {plan.badge}
                          </span>
                        )}
                        {plan.comingSoon && (
                          <span className="text-xs font-mono font-semibold text-white bg-white/[0.08] px-1.5 py-0.5 rounded-full border border-white/30">SOON</span>
                        )}
                      </div>
                      <span className="text-sm text-white font-medium">{plan.sublabel}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    {plan.price
                      ? <span className="text-base font-bold text-white">{plan.price}<span className="text-sm text-white font-normal">{plan.period}</span></span>
                      : <span className="text-base text-white font-semibold">{content.freeForever}</span>
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

// ─── ServerLinks ──────────────────────────────────────────────────────────────

function ServerLinks({ subdomain, email }: { subdomain: string; email: string }) {
  const links = [
    { href: `https://${subdomain}`,       label: subdomain,               note: 'your app' },
    { href: `https://auth.${subdomain}`,  label: `auth.${subdomain}`,     note: 'login / register' },
    { href: `https://admin.${subdomain}`, label: `admin.${subdomain}`,    note: 'AI coding workspace' },
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
