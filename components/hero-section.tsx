/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { DomainStatus } from '@/components/domain-status'
import { InfoTooltip } from '@/components/info-tooltip'
import { InstallForm } from '@/components/install-form'
import { DangerZone } from '@/components/danger-zone'
import { PlatformSelector } from '@/components/platform-selector'
import { DeployProgress } from '@/components/deploy-progress'
import { useAuthModal, useDashboard } from '@/components/providers'

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
  const { openDashboard } = useDashboard()

  const [domainReady, setDomainReady] = useState(false)
  const [liveSubdomain, setLiveSubdomain] = useState('')
  const [installing, setInstalling] = useState(false)
  const [installStarted, setInstallStarted] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(PLANS[1])
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
              Production coding platform —{' '}
              <span className="text-white font-semibold">your own server, writing code live in the browser</span>,
              on a real domain.{' '}
              <span className="text-white font-semibold">5× cheaper & 10× faster</span> than vibe coding.
            </p>
            <InfoTooltip text="Fractera runs five coding platforms on a server you own — not a SaaS, not a cloud IDE. Each platform reuses a single subscription, so routine tasks cost almost nothing. Premium AI (Claude, Codex) is called only when it matters." />
          </div>
          <p className="text-base text-gray-500 leading-relaxed flex items-start gap-3">
            Five coding platforms and a global agent RAG memory — your company brain — run entirely
            on a server you own. Not SaaS. Not a CMS. 100% your infrastructure.
            The Fractera Pro architecture is the engine of your coding factory, built for high load
            and real project scale. Deployment takes ~10 minutes with zero setup on your end.
            In 10 minutes, your partners can open your project live.
            <InfoTooltip text="We automate the full server setup from this page — you don't touch a terminal. In about 10 minutes you get five AI coding platforms, a RAG memory layer, and your project running on your own domain. Nothing is shared. Everything is yours." />
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
              <button
                type="button"
                onClick={openDashboard}
                className="text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-lg transition-colors self-start"
              >
                Open Dashboard →
              </button>
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
          <div className="flex flex-col gap-5 bg-white/[0.03] border border-orange-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                RECOMMENDED
              </span>
            </div>
            <h2 className="text-xl font-bold text-white -mt-1">One-click START</h2>

            <PlanSelector selected={selectedPlan} onSelect={setSelectedPlan} />

            {selectedPlan.id !== 'free' && (
              <ul className="flex flex-col gap-1.5 text-xs text-gray-400">
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
                  <span className="text-white font-medium">Fractera Pro</span>
                </li>
              </ul>
            )}

            {selectedPlan.id === 'free' && (
              <p className="text-xs text-gray-500">
                Use the <span className="text-gray-300">Fractera Light</span> option below — bring your own VPS server.
              </p>
            )}

            {selectedPlan.id === 'trial' && (
              <button
                type="button"
                onClick={handleOneClick}
                disabled={checkoutLoading}
                className="w-full bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkoutLoading ? 'Redirecting to checkout…' : 'Launch my server →'}
              </button>
            )}

            {(selectedPlan.id === 'monthly' || selectedPlan.id === 'annual') && (
              <button
                type="button"
                disabled
                className="w-full bg-white/[0.04] border border-white/10 text-gray-600 font-semibold px-6 py-3.5 rounded-xl text-sm cursor-not-allowed"
              >
                Coming soon
              </button>
            )}

            {selectedPlan.id === 'free' && (
              <button
                type="button"
                onClick={() => document.getElementById('light-card')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-gray-300 font-semibold px-6 py-3.5 rounded-xl text-sm transition-colors"
              >
                Use Fractera Light ↓
              </button>
            )}

            {!session && selectedPlan.id === 'trial' && (
              <p className="text-xs text-gray-600 text-center -mt-2">
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

          {/* Use your own server card */}
          <div id="light-card" className="flex flex-col gap-4 bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-mono text-gray-500 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/10 self-start">
                  YOUR OWN SERVER
                </span>
                <h2 className="text-xl font-bold text-white mt-1">Fractera Light</h2>
                <p className="text-sm text-gray-400">Install on your VPS — you provide the server</p>
              </div>
            </div>

            <ul className="flex flex-col gap-1.5 text-xs text-gray-400">
              <li className="flex items-center gap-2">
                <span className="text-gray-500">✓</span>
                <span>5 coding platforms — Claude Code · Codex · Gemini CLI · Qwen Code · Kimi Code</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-500">✓</span>
                <span>LightRAG — the company brain</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-600">—</span>
                <span className="text-gray-600">Fractera Pro not included</span>
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
    name: 'Free',
    sublabel: 'Your own server · Fractera Light',
    price: null,
    period: null,
    badge: null,
  },
  {
    id: 'trial',
    name: 'Try Fractera Pro',
    sublabel: 'One-time · 1 day · No subscription',
    price: '$1',
    period: null,
    badge: 'POPULAR',
  },
  {
    id: 'monthly',
    name: 'Fractera Pro + Server',
    sublabel: 'Monthly · Server included',
    price: '$25',
    period: '/mo',
    badge: null,
    comingSoon: true,
  },
  {
    id: 'annual',
    name: 'Fractera Pro + Server',
    sublabel: 'Annual · Best value',
    price: '$190',
    period: '/yr',
    badge: 'BEST VALUE',
    comingSoon: true,
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
        className="w-full flex items-center justify-between gap-3 bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 transition-colors"
      >
        <div className="flex flex-col items-start gap-0.5 min-w-0">
          <span className="text-[10px] text-gray-600 uppercase tracking-widest">Тарифный план</span>
          <span className="text-sm text-white font-medium">{selected.name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {selected.price && (
            <span className="text-lg font-bold text-white">
              {selected.price}
              {selected.period && <span className="text-xs text-gray-500 font-normal">{selected.period}</span>}
            </span>
          )}
          {!selected.price && <span className="text-sm text-gray-400">Free</span>}
          <span className={`text-gray-500 text-xs transition-transform duration-150 ${open ? 'rotate-180' : ''}`}>▾</span>
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-30">
          {PLANS.map((plan, i) => {
            const isSelected = plan.id === selected.id
            return (
              <div key={plan.id}>
                {i > 0 && <div className="h-px bg-white/[0.05] mx-4" />}
                <button
                  type="button"
                  onClick={() => { onSelect(plan); setOpen(false) }}
                  disabled={plan.comingSoon}
                  className={`w-full flex items-center justify-between gap-3 px-5 py-4 text-left transition-colors
                    ${plan.comingSoon ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/[0.04] cursor-pointer'}
                    ${isSelected ? 'bg-orange-500/5' : ''}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-orange-400 bg-orange-500' : 'border-white/20'}`}>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                          {plan.name}
                        </span>
                        {plan.badge && (
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border ${
                            plan.badge === 'BEST VALUE'
                              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                              : 'text-orange-400 bg-orange-500/10 border-orange-500/20'
                          }`}>
                            {plan.badge}
                          </span>
                        )}
                        {plan.comingSoon && (
                          <span className="text-[10px] font-mono text-gray-600 bg-white/[0.03] px-1.5 py-0.5 rounded-full border border-white/[0.06]">
                            SOON
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-600">{plan.sublabel}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    {plan.price
                      ? <span className="text-base font-bold text-white">{plan.price}<span className="text-xs text-gray-500 font-normal">{plan.period}</span></span>
                      : <span className="text-sm text-gray-500">Free</span>
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
        className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
      >
        <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-medium text-gray-300">
          {initials}
        </span>
        <span className="hidden sm:inline truncate max-w-[160px]">{email}</span>
        <span className="text-gray-700">▾</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-44 bg-neutral-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-20">
          <button
            type="button"
            onClick={() => { close(); onDashboard() }}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            Dashboard
          </button>
          <div className="h-px bg-white/[0.06]" />
          <button
            type="button"
            onClick={() => { close(); signOut() }}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:text-gray-300 hover:bg-white/[0.05] transition-colors"
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
