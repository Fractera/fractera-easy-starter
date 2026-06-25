/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { DomainStatus } from '@/components/domain-status'
import { InstallForm } from '@/components/install-form'
import { DeployProgress } from '@/components/deploy-progress'
import { useAuthModal, useDashboard, useCheckout } from '@/components/providers'
import { useHeroContent } from '@/lib/i18n/context'
import type { FrameworkId } from '@/lib/frameworks-catalog'

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

// `framework` makes the form page-aware: on a framework catalog page (e.g.
// /framework/next-js) the page passes its framework so the form (a) weaves the
// framework name into the H2, (b) lists the framework name as the first feature
// item, and (c) pre-selects that framework in the install dropdown. When omitted
// (homepage / VPS page) the form renders exactly as before — the base is unchanged.
export function PricingFlow({ framework }: { framework?: { id: FrameworkId; name: string } } = {}) {
  const content = useHeroContent()
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const paymentSuccess = searchParams.get('payment') === 'success'
  const { openModal } = useAuthModal()
  const { openServers } = useDashboard()
  // PAID_PLAN_HIDDEN — НЕ УДАЛЯТЬ: openWhiteLabel убрана отсюда — была передана в InstallForm как onWhiteLabel для кнопки White Label ($100)
  const { openCheckout } = useCheckout()

  const plans: Plan[] = [
    { id: 'monthly', name: 'Fractera Pro + Server', sublabel: content.planLabels.monthlySubLabel, price: '$25',  period: '/mo', badge: content.planLabels.popularBadge },
    { id: 'annual',  name: 'Fractera Pro + Server', sublabel: content.planLabels.annualSubLabel,  price: '$190', period: '/yr', badge: content.planLabels.bestValueBadge },
  ]

  // Free-card feature list. On a framework page the framework name is the first
  // item (bold); otherwise the base list is rendered unchanged. The last item
  // ("Open Code — self-hosted forever") keeps its ◈ marker regardless.
  const freeFeatures = framework
    ? [framework.name, ...content.planLabels.freeFeatures]
    : content.planLabels.freeFeatures
  const freeChecks = freeFeatures.slice(0, -1)
  const freeLast = freeFeatures[freeFeatures.length - 1]

  const [, setDomainReady] = useState(false)
  const [liveSubdomain, setLiveSubdomain] = useState('')
  const [installing, setInstalling] = useState(false)
  const [, setInstallStarted] = useState(false)
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
    <>
      {/* ── Payment success ── */}
      {/* PAID_PLAN_HIDDEN — НЕ УДАЛЯТЬ НИ ПРИ КАКИХ ОБСТОЯТЕЛЬСТВАХ: платная стратегия развёртывания временно скрыта для позиционирования проекта как полностью бесплатного и Open Code */}
      {false && paymentSuccess && (
        <div className="w-full max-w-4xl flex flex-col gap-4 py-32">
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-lg">✓</span>
            <p className="text-sm font-semibold text-green-400">Payment confirmed</p>
          </div>

          {myServer?.status === 'active' && (myServer!.subdomain || stripeSubdomain) && (
            <>
              <ServerLinks subdomain={(stripeSubdomain ?? myServer!.subdomain)!} email={session?.user?.email ?? ''} />
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

          {myServer && myServer!.status !== 'active' && myServer!.deploySessionId && (
            <DeployProgress
              sessionId={myServer!.deploySessionId!}
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

      {/* ── Pricing ── */}
      {(
        <div className="w-full max-w-4xl flex flex-col gap-6">
          {/* `items-stretch` (default for grid) — both columns share the tallest
              column's height. Combined with `lg:mt-auto` on the providers block
              below, this pins the Contabo card to the bottom of the left column
              on desktop, aligned with the bottom edge of the install card on the
              right. On mobile the columns stack so no alignment is needed. */}
          <div id="pricing" className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: description + where-to-buy-servers block */}
            <div className="flex flex-col gap-6 items-start text-left">
              <div className="flex flex-col gap-3">
                <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{content.pricingHeader.label}</p>
                <h2 className="font-serif font-bold leading-tight text-white text-2xl md:text-3xl lg:text-4xl">
                  {framework ? `${framework.name} — ${content.pricingHeader.h2}` : content.pricingHeader.h2}
                </h2>
                <p className="text-base text-white/60">{content.pricingHeader.description}</p>
              </div>

              {/* Server providers — compact one-line chips. `lg:mt-auto` pushes
                  the block to the bottom of the column so it aligns with the
                  install card on the right (which is the natural floor on lg+). */}
              <div className="flex flex-col gap-3 w-full pt-4 border-t border-white/10 lg:mt-auto">
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{content.serverSection.label}</p>
                  <h3 className="text-base font-bold font-serif text-white">{content.serverSection.h2}</h3>
                  <p className="text-xs text-white/50 leading-relaxed">{content.serverSection.description}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {content.serverSection.providers.map(({ name, tagline, url, price }) => (
                    <a
                      key={name}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={tagline}
                      className="group w-full flex items-center justify-between gap-3 rounded-xl border border-white/20 hover:border-violet-500/60 bg-white/[0.03] hover:bg-violet-500/[0.06] px-5 py-4 transition-all"
                    >
                      <span className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">{name}</span>
                        {price && <span className="text-xs text-white/60 font-medium">{price}</span>}
                      </span>
                      <span className="shrink-0 text-white/60 group-hover:text-violet-300 text-base font-bold transition-colors">↗</span>
                    </a>
                  ))}
                </div>

                {/* Domain registrar — separate sub-block, same visual language as
                    the server provider chips above. */}
                <div className="flex flex-col gap-1 pt-3 mt-2 border-t border-white/10">
                  <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{content.domainProviderSection.label}</p>
                  <h3 className="text-base font-bold font-serif text-white">{content.domainProviderSection.h2}</h3>
                  <p className="text-xs text-white/50 leading-relaxed">{content.domainProviderSection.description}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {content.domainProviderSection.providers.map(({ name, tagline, url, price }) => (
                    <a
                      key={name}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={tagline}
                      className="group w-full flex items-center justify-between gap-3 rounded-xl border border-white/20 hover:border-violet-500/60 bg-white/[0.03] hover:bg-violet-500/[0.06] px-5 py-4 transition-all"
                    >
                      <span className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">{name}</span>
                        {price && <span className="text-xs text-white/60 font-medium">{price}</span>}
                      </span>
                      <span className="shrink-0 text-white/60 group-hover:text-violet-300 text-base font-bold transition-colors">↗</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: install card */}
            <div className="flex flex-col gap-6">
            {/* PAID_PLAN_HIDDEN — НЕ УДАЛЯТЬ НИ ПРИ КАКИХ ОБСТОЯТЕЛЬСТВАХ: платная карточка «Fractera Pro + Server» ($25/мес, $190/год) временно скрыта */}
            {false && (
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
              {poolAvailable !== null && poolAvailable! > 0 && (
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
            )}

            {/* `flex-1` — карточка тянется на высоту колонки; внутренний `<ul flex-1>` прижимает action к низу. */}
            <div id="light-card" className="flex-1 flex flex-col gap-4 rounded-2xl p-6 bg-gradient-to-br from-emerald-950/70 via-emerald-900/30 to-black/60"
              style={{ animation: 'shimmerBorderGreen 3s ease-in-out infinite', border: '1px solid rgba(52,211,153,0.7)' }}>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 self-start">
                  {content.planLabels.ownServer}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">Fractera Free</h3>
                <p className="text-sm text-emerald-300/70 font-medium">{content.planLabels.freeInstall}</p>
              </div>
              <ul className="flex flex-col gap-1.5 text-sm text-white font-medium flex-1">
                {freeChecks.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span className={framework && i === 0 ? 'font-bold' : ''}>{f}</span>
                  </li>
                ))}
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 shrink-0 mt-0.5">◈</span>
                  <span className="text-white">{freeLast}</span>
                </li>
              </ul>
              {session ? (
                // PAID_PLAN_HIDDEN — НЕ УДАЛЯТЬ НИ ПРИ КАКИХ ОБСТОЯТЕЛЬСТВАХ: onWhiteLabel скрыт — убирает кнопку "Remove Fractera branding — $100"
                <InstallForm
                  onSubdomainReady={sub => { setLiveSubdomain(sub); setDomainReady(true) }}
                  onInstallingChange={v => { setInstalling(v); if (v) setInstallStarted(true) }}
                  domainUrl={content.domainProviderSection.providers[0]?.url}
                  defaultFramework={framework?.id}
                />
              ) : (
                <button type="button" onClick={() => openModal()}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-emerald-500/30">
                  {content.planLabels.signInButton}
                </button>
              )}
            </div>
            </div>{/* end right column */}
          </div>{/* end two-col grid */}

          <div className="grid grid-cols-3 gap-3">
            {content.planLabels.trustItems.map((item, i) => (
              <div key={i} className="flex items-center justify-center py-3 px-4 rounded-xl border border-white/15 bg-white/[0.03] text-sm font-bold text-white text-center tracking-wide">
                {item}
              </div>
            ))}
          </div>

          <p className="text-xs text-orange-400/80 leading-relaxed">{content.planLabels.disclaimer}</p>
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
    </>
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
  const ipMatch = subdomain.match(/^(?:ip-)?(\d+\.\d+\.\d+\.\d+)$/)
  const links = ipMatch
    ? [
        { href: `http://${ipMatch[1]}:3000`, label: ipMatch[1],                note: 'your app' },
        { href: `http://${ipMatch[1]}:3001`, label: `${ipMatch[1]}:3001`,      note: 'login / register' },
        { href: `http://${ipMatch[1]}:3002`, label: `${ipMatch[1]}:3002`,      note: 'AI coding workspace' },
      ]
    : [
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
