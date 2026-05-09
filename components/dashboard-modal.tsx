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
        This will <strong>destroy the server</strong> and <strong>cancel your subscription</strong>. No further charges.
      </p>
      <input
        type="text"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        placeholder='Type DELETE to confirm'
        className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg py-2 transition-colors"
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

function ServerCard({ server, onRefresh }: { server: ServerRecord; onRefresh: () => void }) {
  const isStale = server.status === 'pending' && !server.subdomain && !server.isRedeploy
  const progress = useDeployProgress(
    server.status === 'pending' && !isStale ? server.deploySessionId : null
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
    pending:        'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    pendingRedeploy:'text-blue-400   bg-blue-400/10   border-blue-400/20',
    active:         'text-green-400  bg-green-400/10  border-green-400/20',
    offline:        'text-gray-500   bg-white/[0.03]  border-white/10',
    error:          'text-orange-400 bg-orange-400/10 border-orange-400/20',
  }
  const statusLabel: Record<string, string> = {
    pending:        'Deploying',
    pendingRedeploy:'Устраняем',
    active:         'Active',
    offline:        'Offline',
    error:          'Установка не удалась',
  }

  const statusKey =
    server.status === 'pending' && server.isRedeploy ? 'pendingRedeploy'
    : server.status

  // Stale pending card (no domain — setup never completed)
  if (isStale) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.01] px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm text-gray-600">Incomplete setup</p>
          <p className="text-xs text-gray-700">
            {new Date(server.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={handleRemove}
          disabled={removing}
          className="text-xs text-gray-600 hover:text-red-400 transition-colors disabled:opacity-40"
        >
          {removing ? 'Removing…' : 'Remove'}
        </button>
      </div>
    )
  }

  const color = statusColors[statusKey] ?? statusColors.offline
  const label = statusLabel[statusKey] ?? server.status

  return (
    <div className={`flex flex-col gap-3 rounded-2xl border p-5 ${server.status === 'offline' ? 'border-white/[0.06] bg-white/[0.01]' : 'border-white/10 bg-white/[0.03]'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <p className={`text-sm font-mono truncate ${server.status === 'offline' ? 'text-gray-600' : 'text-white'}`}>
            {server.subdomain}
          </p>
          {expiry && server.status !== 'offline' && (
            <p className="text-xs text-gray-600">
              {planLabel && <span className="text-gray-500">{planLabel} · </span>}
              Expires {expiry}
            </p>
          )}
          {server.status === 'offline' && (
            <p className="text-xs text-gray-700">
              Destroyed {new Date(server.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${color}`}>
          {label}
        </span>
      </div>

      {/* Error message */}
      {server.status === 'error' && (
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 px-4 py-3">
          <p className="text-xs text-orange-300/80 leading-relaxed">
            Не удалось установить автоматически — наша команда устраняет проблему. Мы свяжемся с вами как только сервер будет готов.
          </p>
        </div>
      )}

      {/* Progress bar for pending deploys */}
      {server.status === 'pending' && !isStale && (
        <div className="flex flex-col gap-1.5">
          {server.isRedeploy && (
            <p className="text-xs text-blue-400/70">Устраняем проблему — установка запущена повторно</p>
          )}
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-600">{progress}% complete</p>
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
              className="flex-1 text-center text-xs text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-lg py-2 transition-colors"
            >
              Open app ↗
            </a>
            <a
              href={`https://admin.${server.subdomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-xs text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-lg py-2 transition-colors"
            >
              Open admin ↗
            </a>
          </div>

          {!showDelete ? (
            <button
              onClick={() => setShowDelete(true)}
              className="text-xs text-gray-600 hover:text-red-400 transition-colors text-left"
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

      <div className="relative z-10 w-full max-w-lg bg-neutral-950 border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1 bg-white/[0.04] rounded-xl p-0.5 self-start">
              <button
                onClick={() => setTab('servers')}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${tab === 'servers' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Серверы
              </button>
              <button
                onClick={() => setTab('subscription')}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${tab === 'subscription' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Подписка
              </button>
            </div>
            {session?.user?.email && (
              <p className="text-xs text-gray-600">{session.user.email}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-white transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-3">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
              <span className="inline-block w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
              Загрузка…
            </div>
          ) : tab === 'servers' ? (
            servers.length === 0 ? (
              <p className="text-sm text-gray-600 py-4">Серверов пока нет. Запустите первый сервер на главной странице.</p>
            ) : (
              <>
                {activeServers.map(s => (
                  <ServerCard key={s.id} server={s} onRefresh={fetchServers} />
                ))}
                {offlineServers.length > 0 && activeServers.length > 0 && (
                  <div className="h-px bg-white/[0.06] my-1" />
                )}
                {offlineServers.map(s => (
                  <ServerCard key={s.id} server={s} onRefresh={fetchServers} />
                ))}
              </>
            )
          ) : (
            /* Subscription tab */
            servers.filter(s => s.status !== 'offline').length === 0 ? (
              <p className="text-sm text-gray-600 py-4">Нет активных серверов.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {servers.filter(s => s.status !== 'offline').map(server => {
                  const sub = server.subscription
                  const periodEnd = sub?.currentPeriodEnd
                    ? new Date(sub.currentPeriodEnd).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
                    : null
                  const planLabel = sub?.planId
                    ? sub.planId.charAt(0).toUpperCase() + sub.planId.slice(1)
                    : null
                  const isActive = sub?.status === 'active'
                  return (
                    <div key={server.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                      {server.subdomain && (
                        <p className="text-xs font-mono text-gray-500">{server.subdomain}</p>
                      )}
                      {sub ? (
                        <div className="flex flex-col gap-2 text-sm">
                          {planLabel && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Тариф</span>
                              <span className="text-gray-200">{planLabel}</span>
                            </div>
                          )}
                          {periodEnd && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Текущий период до</span>
                              <span className="text-gray-200">{periodEnd}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Статус подписки</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${isActive ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-orange-400 border-orange-500/30 bg-orange-500/10'}`}>
                              {isActive ? 'Активна' : sub.status}
                            </span>
                          </div>
                          {!isActive && (
                            <p className="text-xs text-orange-300/70 mt-1">
                              Подписка неактивна — проверьте платёжный метод в Stripe.
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">Нет данных о подписке.</p>
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
