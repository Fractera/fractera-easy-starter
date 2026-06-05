'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { PartnerCabinetView } from '@/components/partner-cabinet-view'
import { useLang } from '@/lib/i18n/use-lang'
import { getDashboard } from '@/lib/i18n/locales'
import { buildUrls } from '@/lib/subdomain-helpers'

// Product flag: White Label ("Remove Fractera branding — $100") is paused
// (2026-05-31). Set to true to bring the upsell back on the Servers tab.
const WHITE_LABEL_ENABLED = false

type ServerRecord = {
  id: string
  status: string
  subdomain: string | null
  deploySessionId: string | null
  createdAt: string
  serverIp: string | null
  serverPassword: string | null
  whiteLabelActive: boolean
  certExpiresAt: string | null
  subscription: {
    id: string
    stripeSubscriptionId: string | null
    currentPeriodEnd: string
    status: string
    planId: string
  } | null
}

type PurchaseRecord = {
  id: string
  productType: string
  stripePaymentId: string
  serverIp: string | null
  serverSubdomain: string | null
  createdAt: string
  serverToken: { subdomain: string | null; status: string; whiteLabelActive: boolean } | null
}

function CredentialRow({ label, value, secret, revealNote, onCopied }: {
  label: string
  value: string
  secret?: boolean
  revealNote?: string
  onCopied: (label: string) => void
}) {
  const [visible, setVisible] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      onCopied(label)
    } catch {}
  }

  // When a reveal note is set (e.g. the password is never stored), opening the
  // eye shows the note instead of the meaningless placeholder value, and the
  // Copy button is hidden — there is nothing useful to copy.
  const showingNote = !!revealNote && visible

  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-xs text-white/40 w-16 shrink-0">{label}</span>
      <span className={`flex-1 text-xs ${showingNote ? 'text-white/50 italic' : 'font-mono text-white truncate'}`}>
        {secret && !visible ? '•'.repeat(10) : showingNote ? revealNote : value}
      </span>
      {secret && (
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          className="text-white/40 hover:text-white/70 transition-colors p-0.5 shrink-0"
          aria-label={visible ? 'Hide' : 'Show'}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
            {visible ? (
              <>
                <path d="M1 6.5C2.5 3 11 3 12 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <circle cx="6.5" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.2"/>
              </>
            ) : (
              <>
                <path d="M1 6.5C2.5 3 11 3 12 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <circle cx="6.5" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M2 2l9 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </>
            )}
          </svg>
        </button>
      )}
      {!showingNote && (
        <button
          type="button"
          onClick={copy}
          className="text-xs text-white/40 hover:text-white/70 border border-white/20 hover:border-white/40 rounded px-1.5 py-0.5 transition-colors shrink-0"
        >
          Copy
        </button>
      )}
    </div>
  )
}

// SSL certificate expiry + countdown for Secure-mode (custom domain) servers.
// The customer server reports `certExpiresAt` (Let's Encrypt notAfter) on
// activation; here we render the date and the days remaining, tinted by
// urgency so a near-expiry cert stands out before it lapses.
function CertCountdown({ expiresAt }: { expiresAt: string }) {
  const exp = new Date(expiresAt)
  if (Number.isNaN(exp.getTime())) return null

  const daysLeft = Math.floor((exp.getTime() - Date.now()) / 86_400_000)
  const expired = daysLeft < 0
  const dateLabel = exp.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  const tone = expired || daysLeft <= 14
    ? 'text-red-400 border-red-400/20 bg-red-400/10'
    : daysLeft <= 30
      ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10'
      : 'text-green-400 border-green-400/20 bg-green-400/10'

  return (
    <div className="border-t border-white/10 pt-3 flex items-center justify-between gap-3">
      <div className="flex flex-col">
        <span className="text-xs text-white/40 uppercase tracking-widest">SSL certificate</span>
        <span className="text-xs text-white/70">Valid until {dateLabel}</span>
      </div>
      <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full border ${tone}`}>
        {expired ? 'Expired' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}
      </span>
    </div>
  )
}

function useDeployProgress(sessionId: string | null) {
  const [percent, setPercent] = useState(0)
  useEffect(() => {
    if (!sessionId) return
    const iv = setInterval(async () => {
      if (typeof document !== 'undefined' && document.hidden) return
      try {
        const res = await fetch(`/api/progress?session_id=${sessionId}`)
        if (!res.ok) return
        const data = await res.json()
        if (data.steps) {
          const done = data.steps.filter((s: { done: boolean }) => s.done).length
          // 44 is the historical estimate of bootstrap.sh's reportable steps;
          // the actual count drifts upward as new soft_steps land (wipe_start,
          // build_lightrag_webui, install_hermes_theme, etc.) and we don't
          // want this UI to ever require a bootstrap edit. Cap at 99 during
          // deploy and let `status === 'done'` swap the card into the success
          // state — the percent number stops being shown after that.
          const raw = Math.round((done / 44) * 100)
          setPercent(Math.min(99, raw))
        }
        if (data.status === 'done' || data.status === 'error') clearInterval(iv)
      } catch {}
    }, 60000)
    return () => clearInterval(iv)
  }, [sessionId])
  return percent
}

function DeleteConfirm({ serverId, onDeleted, onCancel }: { serverId: string; onDeleted: () => void; onCancel: () => void }) {
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/server/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId }),
      })
      if (res.ok) {
        onDeleted()
      } else {
        const d = await res.json()
        setError(d.error ?? 'Delete failed')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-3 flex flex-col gap-3 bg-red-500/5 border border-red-500/20 rounded-xl p-4">
      <p className="text-xs text-red-300">
        This will <strong>permanently destroy this server</strong> and all its data.
        Your subscription stays active — you can get a new server from the home page.
      </p>
      <input
        type="text"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        placeholder='Type DELETE to confirm'
        className="w-full bg-white/[0.05] border border-white/40 rounded-lg px-3 py-2 text-base text-white placeholder-gray-400 focus:outline-none focus:border-red-500/70"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 text-base font-semibold text-white hover:text-white border border-white/40 hover:border-white/60 rounded-lg py-2 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={confirm !== 'DELETE' || loading}
          className="flex-1 text-sm text-white bg-red-600 hover:bg-red-500 rounded-lg py-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Deleting…' : 'Confirm delete'}
        </button>
      </div>
    </div>
  )
}

function CancelSubscriptionConfirm({ subscriptionId, onDone, onCancel }: { subscriptionId: string; onDone: () => void; onCancel: () => void }) {
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCancel() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId }),
      })
      if (res.ok) {
        onDone()
      } else {
        const d = await res.json()
        setError(d.error ?? 'Cancel failed')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-3 flex flex-col gap-3 bg-red-500/5 border border-red-500/20 rounded-xl p-4">
      <p className="text-xs text-red-300">
        This will <strong>cancel your subscription</strong> and <strong>permanently destroy your server</strong>.
        No further charges after today.
      </p>
      <input
        type="text"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        placeholder='Type CANCEL to confirm'
        className="w-full bg-white/[0.05] border border-white/40 rounded-lg px-3 py-2 text-base text-white placeholder-gray-400 focus:outline-none focus:border-red-500/70"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 text-base font-semibold text-white hover:text-white border border-white/40 hover:border-white/60 rounded-lg py-2 transition-colors"
        >
          Keep subscription
        </button>
        <button
          onClick={handleCancel}
          disabled={confirm !== 'CANCEL' || loading}
          className="flex-1 text-sm text-white bg-red-600 hover:bg-red-500 rounded-lg py-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Cancelling…' : 'Confirm cancel'}
        </button>
      </div>
    </div>
  )
}

function ApplyWhiteLabel({ purchaseId, alreadyApplied }: { purchaseId: string; alreadyApplied: boolean }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>(alreadyApplied ? 'ok' : 'idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function apply() {
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/purchases/apply-white-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseId }),
      })
      if (res.ok) {
        setStatus('ok')
      } else {
        const d = await res.json().catch(() => ({}))
        setErrorMsg(d.error ?? 'Unknown error')
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'ok') return (
    <div className="flex flex-col gap-1.5 mt-1">
      <div className="flex items-center gap-2">
        <span className="text-xs text-green-400">Branding removed ✓</span>
        <button onClick={apply} className="text-xs text-white/30 hover:text-white/60 transition-colors">
          Reapply
        </button>
      </div>
      <p className="text-xs text-white/35 leading-relaxed">
        To confirm the footer is gone, open your site in an <strong className="text-white/50">incognito / private window</strong> — the main browser tab may show a cached version.
      </p>
    </div>
  )

  if (status === 'error') return (
    <div className="flex flex-col gap-1 mt-1">
      <p className="text-xs text-red-400">Could not reach server automatically.</p>
      {errorMsg && <p className="text-xs text-white/30 font-mono truncate">{errorMsg}</p>}
      <p className="text-xs text-white/40">
        The branding may already be removed. Contact <span className="text-white/60">admin@fractera.ai</span> if it&apos;s still visible.
      </p>
      <button onClick={apply} className="text-xs text-white/50 hover:text-white transition-colors text-left">
        Try again
      </button>
    </div>
  )

  return (
    <button
      onClick={apply}
      disabled={status === 'loading'}
      className="text-xs text-white/50 hover:text-white border border-white/20 hover:border-white/40 rounded px-2 py-0.5 transition-colors mt-1 disabled:opacity-40"
    >
      {status === 'loading' ? 'Applying…' : 'Apply to server'}
    </button>
  )
}

function ServerCard({ server, onRefresh, onWhiteLabel }: { server: ServerRecord; onRefresh: () => void; onWhiteLabel: (id: string) => void }) {
  const dash = getDashboard(useLang())
  const progress = useDeployProgress(
    server.status === 'pending' ? server.deploySessionId : null
  )
  const [showDelete, setShowDelete] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  async function handleCancelDeploy() {
    if (!server.deploySessionId) return
    if (!confirm('Cancel this deployment? You can start a new one immediately afterwards.')) return
    setCancelling(true)
    try {
      await fetch('/api/progress/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: server.deploySessionId }),
      })
      onRefresh()
    } finally {
      setCancelling(false)
    }
  }

  function handleCopied(label: string) {
    setToast(`${label} copied`)
    setTimeout(() => setToast(null), 2000)
  }

  const expiry = server.subscription?.currentPeriodEnd
    ? new Date(server.subscription.currentPeriodEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  const planLabel = server.subscription?.planId
    ? server.subscription.planId.charAt(0).toUpperCase() + server.subscription.planId.slice(1)
    : null

  async function handleRemove() {
    setRemoving(true)
    try {
      await fetch('/api/server/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId: server.id }),
      })
      onRefresh()
    } finally {
      setRemoving(false)
    }
  }

  const statusColors: Record<string, string> = {
    pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    active:  'text-green-400  bg-green-400/10  border-green-400/20',
    offline: 'text-gray-500   bg-white/[0.03]  border-white/10',
    error:   'text-red-400    bg-red-400/10    border-red-400/20',
  }
  const statusLabel: Record<string, string> = {
    pending: 'Deploying',
    active:  'Active',
    offline: 'Offline',
    error:   'Failed',
  }

  const color = statusColors[server.status] ?? statusColors.offline
  const label = statusLabel[server.status] ?? server.status

  return (
    <div className={`flex flex-col gap-3 rounded-2xl border p-5 ${server.status === 'offline' ? 'border-white/20 bg-white/[0.02]' : 'border-white/40 bg-white/[0.04]'}`}>
      {toast && (
        <div className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-1.5 text-center">
          {toast}
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <p className={`text-base font-bold font-mono truncate ${server.status === 'offline' || server.status === 'error' ? 'text-white/40' : 'text-white'}`}>
            {server.subdomain || (server.status === 'error' ? (server.serverIp ?? 'Deployment failed') : server.subdomain)}
          </p>
          {expiry && server.status !== 'offline' && (
            <p className="text-sm text-white font-medium">
              {planLabel && <span className="text-white font-semibold">{planLabel} · </span>}
              Expires {expiry}
            </p>
          )}
          {server.status !== 'offline' && (
            <p className="text-xs text-white/40">
              Launched {new Date(server.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}
          {server.status === 'offline' && (
            <p className="text-sm text-white/40">
              Destroyed {new Date(server.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
        <span className={`shrink-0 text-sm font-semibold px-2 py-0.5 rounded-full border ${color}`}>
          {label}
        </span>
      </div>

      {/* Progress bar for pending deploys */}
      {server.status === 'pending' && (
        <div className="flex flex-col gap-1.5">
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-white font-semibold">{progress}% complete</p>
            <button
              onClick={handleCancelDeploy}
              disabled={cancelling}
              className="text-xs text-white/50 hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {cancelling ? 'Cancelling…' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* Links for active servers */}
      {server.status === 'active' && server.subdomain && (
        <div className="flex flex-col gap-2">
          {(() => {
            const u = buildUrls(server.subdomain)
            return (
              <div className="flex gap-2">
                <a
                  href={u.appUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center text-sm font-semibold text-white hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/40 rounded-lg py-2 transition-colors"
                >
                  Open app ↗
                </a>
                <a
                  href={u.adminUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center text-sm font-semibold text-white hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/40 rounded-lg py-2 transition-colors"
                >
                  Open admin ↗
                </a>
              </div>
            )
          })()}

          {server.certExpiresAt && <CertCountdown expiresAt={server.certExpiresAt} />}

          {/* White Label / "Remove Fractera branding — $100" temporarily disabled
              (product decision 2026-05-31 — not activating this for a while).
              Flip WHITE_LABEL_ENABLED back to true to re-enable. */}
          {WHITE_LABEL_ENABLED && (
            server.whiteLabelActive ? (
              <span className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-2.5 py-0.5 w-fit">
                White Label ✓
              </span>
            ) : (
              <button
                onClick={() => onWhiteLabel(server.id)}
                className="text-xs text-white/50 hover:text-white transition-colors text-left font-medium"
              >
                Remove Fractera branding — $100
              </button>
            )
          )}

          {!showDelete ? (
            <button
              onClick={() => setShowDelete(true)}
              className="text-sm text-white hover:text-red-400 transition-colors text-left font-medium"
            >
              Delete server
            </button>
          ) : (
            <DeleteConfirm
              serverId={server.id}
              onDeleted={() => { setShowDelete(false); onRefresh() }}
              onCancel={() => setShowDelete(false)}
            />
          )}

          {server.serverIp && (
            <div className="border-t border-white/10 pt-3 flex flex-col gap-0.5">
              <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Credentials</p>
              <CredentialRow label="IP" value={server.serverIp} onCopied={handleCopied} />
              <CredentialRow label="Login" value="root" onCopied={handleCopied} />
              {server.serverPassword && (
                <CredentialRow
                  label="Password"
                  value={server.serverPassword}
                  secret
                  revealNote={server.serverPassword === '*****' ? dash.passwordNeverStored : undefined}
                  onCopied={handleCopied}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Failed / offline servers — let the user clear the dead entry */}
      {(server.status === 'error' || server.status === 'offline') && (
        <div className="flex flex-col gap-2">
          {server.status === 'error' && (
            <p className="text-xs text-red-300/80 leading-relaxed">
              Deployment did not complete. Delete this entry and start a new
              deployment from the home page.
            </p>
          )}
          {!showDelete ? (
            <button
              onClick={() => setShowDelete(true)}
              className="self-start text-sm text-white hover:text-red-400 transition-colors font-medium"
            >
              Delete server
            </button>
          ) : (
            <DeleteConfirm
              serverId={server.id}
              onDeleted={() => { setShowDelete(false); onRefresh() }}
              onCancel={() => setShowDelete(false)}
            />
          )}
        </div>
      )}
    </div>
  )
}

interface Props {
  open: boolean
  view: 'servers' | 'subscription' | 'purchases' | 'partner'
  onClose: () => void
  onWhiteLabel?: (serverTokenId: string) => void
}

export function DashboardModal({ open, view, onClose, onWhiteLabel }: Props) {
  const { data: session } = useSession()
  const lang = useLang()
  const [activeView, setActiveView] = useState<'servers' | 'subscription' | 'purchases' | 'partner'>(view)
  const [servers, setServers] = useState<ServerRecord[]>([])
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [cancellingSubId, setCancellingSubId] = useState<string | null>(null)
  const [reassigning, setReassigning] = useState(false)
  const fetchedRef = useRef(false)

  const fetchServers = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await fetch('/api/my-servers')
      if (res.ok) {
        const data = await res.json()
        setServers(data.servers ?? [])
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  const fetchPurchases = useCallback(async () => {
    const res = await fetch('/api/purchases')
    if (res.ok) {
      const data = await res.json()
      setPurchases(data.purchases ?? [])
    }
  }, [])

  function openWhiteLabelCheckout(serverTokenId: string) {
    onWhiteLabel?.(serverTokenId)
  }

  async function handleReassign() {
    setReassigning(true)
    try {
      const res = await fetch('/api/server/reassign', { method: 'POST' })
      const d = await res.json()
      // 409 means server already assigned — still refresh to show current state
      if (d.ok || res.status === 409) {
        await fetchServers()
      }
    } finally {
      setReassigning(false)
    }
  }

  // Sync activeView when prop changes
  useEffect(() => { setActiveView(view) }, [view])

  // Initial fetch
  useEffect(() => {
    if (open && !fetchedRef.current) {
      fetchedRef.current = true
      fetchServers()
      fetchPurchases()
    }
    if (!open) fetchedRef.current = false
  }, [open, fetchServers, fetchPurchases])

  // Poll while any server is pending — stop when all are settled
  useEffect(() => {
    if (!open) return
    const hasPending = servers.some(s => s.status === 'pending')
    if (!hasPending) return
    const iv = setInterval(() => fetchServers(true), 5000)
    return () => clearInterval(iv)
  }, [open, servers, fetchServers])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const activeServers = servers.filter(s => s.status !== 'offline')
  const offlineServers = servers.filter(s => s.status === 'offline')

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg bg-neutral-950 border border-white/40 rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/30">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-bold text-white">
              {activeView === 'servers' ? 'Servers' : activeView === 'subscription' ? 'Subscription' : activeView === 'partner' ? (lang === 'ru' ? 'Партнёрский кабинет' : 'Partner cabinet') : 'Purchases'}
            </h2>
            {session?.user?.email && (
              <p className="text-sm text-white/60 font-medium">{session.user.email}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-white transition-colors text-lg leading-none font-bold"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-3">
          {activeView === 'partner' ? (
            session?.user?.partnerSlug ? (
              <PartnerCabinetView partnerSlug={session.user.partnerSlug} lang={lang} />
            ) : (
              <p className="text-base text-white/60 py-4">
                {lang === 'ru' ? (
                  <>Партнёрская регистрация ещё не выполнена. Откройте страницу <a href="/ru/partners" className="text-violet-400 hover:text-violet-300">Партнёры</a> и нажмите «Зарегистрироваться».</>
                ) : (
                  <>You have not registered as a partner yet. Open the <a href="/en/partners" className="text-violet-400 hover:text-violet-300">Partners</a> page and click «Register as a partner».</>
                )}
              </p>
            )
          ) : loading ? (
            <div className="flex items-center gap-2 text-base text-white font-medium py-4">
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Loading…
            </div>
          ) : activeView === 'servers' ? (
            servers.length === 0 ? (
              <p className="text-base text-white font-medium py-4">No servers yet. Launch your first server from the home page.</p>
            ) : (
              <>
                {activeServers.map(s => (
                  <ServerCard key={s.id} server={s} onRefresh={fetchServers} onWhiteLabel={openWhiteLabelCheckout} />
                ))}
                {offlineServers.length > 0 && activeServers.length > 0 && (
                  <div className="h-px bg-white/30 my-1" />
                )}
                {offlineServers.map(s => (
                  <ServerCard key={s.id} server={s} onRefresh={fetchServers} onWhiteLabel={openWhiteLabelCheckout} />
                ))}
              </>
            )
          ) : activeView === 'purchases' ? (
            purchases.length === 0 ? (
              <div className="flex flex-col gap-2 py-4">
                <p className="text-base text-white font-medium">No purchases yet.</p>
                <p className="text-xs text-white/40">One-time add-ons (like White Label) will appear here.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {purchases.map(p => (
                  <div key={p.id} className="flex flex-col gap-1.5 rounded-xl border border-white/20 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">
                        {p.productType === 'white_label' ? 'White Label' : p.productType}
                      </span>
                      <span className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-2 py-0.5">
                        Paid
                      </span>
                    </div>
                    {(p.serverToken?.subdomain ?? p.serverSubdomain) && (
                      <p className="text-xs font-mono text-white/60">
                        {p.serverToken?.subdomain ?? p.serverSubdomain}
                        {p.serverToken?.status === 'offline' && (
                          <span className="ml-2 text-white/30">(server deleted)</span>
                        )}
                      </p>
                    )}
                    <p className="text-xs text-white/30">
                      {new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    {p.serverToken?.status === 'offline' ? (
                      <p className="text-xs text-yellow-400/70 mt-1">
                        Server deleted — contact support to apply white label on a new server.
                      </p>
                    ) : p.productType === 'white_label' && p.serverToken?.status === 'active' && (
                      <ApplyWhiteLabel
                        purchaseId={p.id}
                        alreadyApplied={p.serverToken?.whiteLabelActive ?? false}
                      />
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Subscription tab */
            servers.filter(s => s.subscription !== null).length === 0 ? (
              <p className="text-base text-white font-medium py-4">No active servers.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {(() => {
                  // One card per Stripe subscription — pick best status token (active > pending > queued > error > offline)
                  const STATUS_RANK: Record<string, number> = { active: 0, pending: 1, queued: 2, error: 3, offline: 4 }
                  const bySubKey = new Map<string, ServerRecord>()
                  for (const s of servers) {
                    if (!s.subscription) continue
                    const key = s.subscription.stripeSubscriptionId ?? s.subscription.id
                    const existing = bySubKey.get(key)
                    const rank = STATUS_RANK[s.status] ?? 5
                    const existingRank = existing ? (STATUS_RANK[existing.status] ?? 5) : 999
                    if (!existing || rank < existingRank) bySubKey.set(key, s)
                  }
                  return Array.from(bySubKey.values())
                })().map(server => {
                  const sub = server.subscription
                  const isFree = sub?.planId === 'free'
                  const periodEnd = !isFree && sub?.currentPeriodEnd
                    ? new Date(sub.currentPeriodEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                    : null
                  const planLabel = isFree ? 'Fractera Light' : sub?.planId
                    ? sub.planId.charAt(0).toUpperCase() + sub.planId.slice(1)
                    : null
                  const isActive = sub?.status === 'active'
                  const isOffline = server.status === 'offline'
                  const showGetNewServer = !isFree && isActive && isOffline
                  return (
                    <div key={server.id} className="flex flex-col gap-3 rounded-2xl border border-white/40 bg-white/[0.04] p-5">
                      {isOffline ? (
                        <p className="text-base font-bold font-mono text-white/40">No server connected</p>
                      ) : server.subdomain ? (
                        <p className="text-base font-bold font-mono text-white">{server.subdomain}</p>
                      ) : (
                        <p className="text-sm text-white font-medium">
                          Server:{' '}
                          <span className={
                            server.status === 'error' ? 'text-violet-400' :
                            server.status === 'queued' ? 'text-yellow-500' :
                            'text-gray-500'
                          }>
                            {server.status === 'pending' ? 'Installing…' :
                             server.status === 'error'   ? 'Installation error' :
                             server.status === 'queued'  ? 'Queued — server will be assigned soon' :
                             server.status}
                          </span>
                        </p>
                      )}
                      {sub ? (
                        <div className="flex flex-col gap-2 text-sm">
                          {planLabel && (
                            <div className="flex items-center justify-between">
                              <span className="text-white font-semibold">Plan</span>
                              <span className="text-white font-bold">{planLabel}</span>
                            </div>
                          )}
                          {periodEnd && (
                            <div className="flex items-center justify-between">
                              <span className="text-white font-semibold">Current period until</span>
                              <span className="text-white font-bold">{periodEnd}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-white font-semibold">Subscription status</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${isActive ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-violet-400 border-violet-500/30 bg-violet-500/10'}`}>
                              {isActive ? 'Active' : sub.status}
                            </span>
                          </div>
                          {sub.stripeSubscriptionId && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-white/40 font-semibold shrink-0">Sub ID</span>
                              <span className="text-xs font-mono text-white/40 truncate">{sub.stripeSubscriptionId}</span>
                            </div>
                          )}
                          {!isActive && !isFree && (
                            <p className="text-xs text-violet-300/70 mt-1">
                              Subscription inactive — check your payment method in Stripe.
                            </p>
                          )}
                          {!isActive && isFree && (
                            <p className="text-xs text-violet-300/70 mt-1">
                              Your free plan was cancelled. Go to the main page to install Fractera on a new server.
                            </p>
                          )}
                          {showGetNewServer && (
                            <button
                              onClick={handleReassign}
                              disabled={reassigning}
                              className="mt-1 w-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg py-2 transition-colors"
                            >
                              {reassigning ? 'Getting server…' : 'Get a new server →'}
                            </button>
                          )}
                          {isFree && isActive && (
                            <button
                              onClick={() => { onClose(); }}
                              className="mt-1 w-full text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-lg py-2 transition-colors"
                            >
                              Upgrade to Fractera Pro →
                            </button>
                          )}
                          {!isFree && isActive && !isOffline && (
                            cancellingSubId === sub.id ? (
                              <CancelSubscriptionConfirm
                                subscriptionId={sub.id}
                                onDone={() => { setCancellingSubId(null); fetchServers() }}
                                onCancel={() => setCancellingSubId(null)}
                              />
                            ) : (
                              <button
                                onClick={() => setCancellingSubId(sub.id)}
                                className="mt-1 text-xs text-white/50 hover:text-red-400 transition-colors text-left font-medium"
                              >
                                Cancel subscription
                              </button>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-base text-white font-medium">No subscription data.</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          )}
        </div>
      </div>
    </div>

  )
}
