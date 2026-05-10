'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'

type ServerRecord = {
  id: string
  status: string
  subdomain: string | null
  deploySessionId: string | null
  createdAt: string
  isRedeploy: boolean
  subscription: {
    id: string
    currentPeriodEnd: string
    status: string
    planId: string
  } | null
}

function useDeployProgress(sessionId: string | null) {
  const [percent, setPercent] = useState(0)
  useEffect(() => {
    if (!sessionId) return
    const iv = setInterval(async () => {
      try {
        const res = await fetch(`/api/progress?session_id=${sessionId}`)
        if (!res.ok) return
        const data = await res.json()
        if (data.steps) {
          const done = data.steps.filter((s: { done: boolean }) => s.done).length
          setPercent(Math.round((done / 44) * 100))
        }
        if (data.status === 'done' || data.status === 'error') clearInterval(iv)
      } catch {}
    }, 4000)
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

function ServerCard({ server, onRefresh }: { server: ServerRecord; onRefresh: () => void }) {
  const progress = useDeployProgress(
    server.status === 'pending' ? server.deploySessionId : null
  )
  const [showDelete, setShowDelete] = useState(false)
  const [removing, setRemoving] = useState(false)

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
  }
  const statusLabel: Record<string, string> = {
    pending: 'Deploying',
    active:  'Active',
    offline: 'Offline',
  }

  const color = statusColors[server.status] ?? statusColors.offline
  const label = statusLabel[server.status] ?? server.status

  return (
    <div className={`flex flex-col gap-3 rounded-2xl border p-5 ${server.status === 'offline' ? 'border-white/20 bg-white/[0.02]' : 'border-white/40 bg-white/[0.04]'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <p className={`text-base font-bold font-mono truncate ${server.status === 'offline' ? 'text-white/40' : 'text-white'}`}>
            {server.subdomain}
          </p>
          {expiry && server.status !== 'offline' && (
            <p className="text-sm text-white font-medium">
              {planLabel && <span className="text-white font-semibold">{planLabel} · </span>}
              Expires {expiry}
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
          <p className="text-sm text-white font-semibold">{progress}% complete</p>
        </div>
      )}

      {/* Links for active servers */}
      {server.status === 'active' && server.subdomain && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <a
              href={`https://${server.subdomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-sm font-semibold text-white hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/40 rounded-lg py-2 transition-colors"
            >
              Open app ↗
            </a>
            <a
              href={`https://admin.${server.subdomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-sm font-semibold text-white hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/40 rounded-lg py-2 transition-colors"
            >
              Open admin ↗
            </a>
          </div>

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
        </div>
      )}
    </div>
  )
}

interface Props {
  open: boolean
  onClose: () => void
}

export function DashboardModal({ open, onClose }: Props) {
  const { data: session } = useSession()
  const [servers, setServers] = useState<ServerRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'servers' | 'subscription'>('servers')
  const [cancellingSubId, setCancellingSubId] = useState<string | null>(null)
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

  // Initial fetch
  useEffect(() => {
    if (open && !fetchedRef.current) {
      fetchedRef.current = true
      fetchServers()
    }
    if (!open) fetchedRef.current = false
  }, [open, fetchServers])

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
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1 bg-white/[0.04] rounded-xl p-0.5 self-start">
              <button
                onClick={() => setTab('servers')}
                className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${tab === 'servers' ? 'bg-white/20 text-white' : 'text-white hover:text-white hover:bg-white/10'}`}
              >
                Servers
              </button>
              <button
                onClick={() => setTab('subscription')}
                className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${tab === 'subscription' ? 'bg-white/20 text-white' : 'text-white hover:text-white hover:bg-white/10'}`}
              >
                Subscription
              </button>
            </div>
            {session?.user?.email && (
              <p className="text-sm text-white font-medium">{session.user.email}</p>
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
          {loading ? (
            <div className="flex items-center gap-2 text-base text-white font-medium py-4">
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Loading…
            </div>
          ) : tab === 'servers' ? (
            servers.length === 0 ? (
              <p className="text-base text-white font-medium py-4">No servers yet. Launch your first server from the home page.</p>
            ) : (
              <>
                {activeServers.map(s => (
                  <ServerCard key={s.id} server={s} onRefresh={fetchServers} />
                ))}
                {offlineServers.length > 0 && activeServers.length > 0 && (
                  <div className="h-px bg-white/30 my-1" />
                )}
                {offlineServers.map(s => (
                  <ServerCard key={s.id} server={s} onRefresh={fetchServers} />
                ))}
              </>
            )
          ) : (
            /* Subscription tab */
            servers.filter(s => s.status !== 'offline').length === 0 ? (
              <p className="text-base text-white font-medium py-4">No active servers.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {servers.filter(s => s.status !== 'offline').map(server => {
                  const sub = server.subscription
                  const periodEnd = sub?.currentPeriodEnd
                    ? new Date(sub.currentPeriodEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                    : null
                  const planLabel = sub?.planId
                    ? sub.planId.charAt(0).toUpperCase() + sub.planId.slice(1)
                    : null
                  const isActive = sub?.status === 'active'
                  return (
                    <div key={server.id} className="flex flex-col gap-3 rounded-2xl border border-white/40 bg-white/[0.04] p-5">
                      {server.subdomain ? (
                        <p className="text-base font-bold font-mono text-white">{server.subdomain}</p>
                      ) : (
                        <p className="text-sm text-white font-medium">
                          Server:{' '}
                          <span className={
                            server.status === 'error' ? 'text-orange-400' :
                            server.status === 'queued' ? 'text-yellow-500' :
                            'text-gray-500'
                          }>
                            {server.status === 'pending' ? 'Installing…' :
                             server.status === 'error'   ? 'Installation error' :
                             server.status === 'queued'  ? 'Queued' :
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
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${isActive ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-orange-400 border-orange-500/30 bg-orange-500/10'}`}>
                              {isActive ? 'Active' : sub.status}
                            </span>
                          </div>
                          {!isActive && (
                            <p className="text-xs text-orange-300/70 mt-1">
                              Subscription inactive — check your payment method in Stripe.
                            </p>
                          )}
                          {isActive && (
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
