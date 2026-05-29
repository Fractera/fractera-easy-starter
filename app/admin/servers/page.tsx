'use client'

import { useCallback, useEffect, useState } from 'react'

type Row = {
  id: string
  token: string
  subdomain: string | null
  serverIp: string | null
  serverPassword: string | null
  status: string
  createdAt: string
  lastPingAt: string | null
  deployError: string | null
  whiteLabelActive: boolean
  user: {
    email: string | null
    referredBy: { slug: string; companyName: string | null } | null
  }
}

type Resp = { total: number; page: number; pageSize: number; pageCount: number; rows: Row[] }

const STATUSES = ['', 'pending', 'provisioning', 'queued', 'active', 'offline', 'error', 'deleted']

function fmt(d: string | null) { return d ? new Date(d).toLocaleString('ru-RU') : '—' }
function shortToken(t: string) { return t.slice(0, 8) + '…' }

export default function ServersPage() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [showDeleted, setShowDeleted] = useState(false)
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Resp | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{ id: string; mode: 'soft' | 'hard' } | null>(null)
  const [confirmText, setConfirmText] = useState('')
  const [working, setWorking] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const url = new URL('/api/admin/server-tokens', window.location.origin)
    if (q.trim()) url.searchParams.set('q', q.trim())
    if (status) url.searchParams.set('status', status)
    if (showDeleted) url.searchParams.set('showDeleted', '1')
    url.searchParams.set('page', String(page))
    try {
      const res = await fetch(url.toString())
      if (res.ok) setData(await res.json())
    } finally { setLoading(false) }
  }, [q, status, showDeleted, page])

  useEffect(() => { load() }, [load])

  async function performDelete() {
    if (!pendingDelete) return
    const row = data?.rows.find(r => r.id === pendingDelete.id)
    if (!row) return
    if (pendingDelete.mode === 'hard' && confirmText !== row.subdomain) {
      setErr('Subdomain mismatch — type it exactly as shown')
      return
    }
    setErr(null)
    setWorking(pendingDelete.id)
    try {
      const res = await fetch('/api/admin/server-tokens', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: pendingDelete.id,
          mode: pendingDelete.mode,
          confirmSubdomain: pendingDelete.mode === 'hard' ? confirmText : undefined,
        }),
      })
      const d = await res.json()
      if (!res.ok) { setErr(d.error ?? 'failed'); return }
      setPendingDelete(null)
      setConfirmText('')
      await load()
    } finally { setWorking(null) }
  }

  function openDelete(id: string, mode: 'soft' | 'hard') {
    setPendingDelete({ id, mode })
    setConfirmText('')
    setErr(null)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">Servers</h1>
        <div className="text-sm text-white/55">Total: <strong className="text-white">{data?.total ?? '—'}</strong></div>
      </div>

      <p className="text-sm text-white/55 max-w-3xl">
        All ServerTokens ever issued (paid pool, free-tier, embed, MCP). Search by IP, partner slug, email, subdomain or token.
      </p>

      <form onSubmit={e => { e.preventDefault(); setPage(1); load() }} className="flex flex-wrap gap-2">
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="IP / partner slug / email / subdomain / token…"
          className="flex-1 min-w-[240px] bg-white/[0.04] border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/70"
        />
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="bg-white/[0.04] border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/70"
        >
          {STATUSES.map(s => <option key={s || 'any'} value={s}>{s || 'any status'}</option>)}
        </select>
        <label className="flex items-center gap-2 text-xs text-white/65 px-2">
          <input type="checkbox" checked={showDeleted} onChange={e => setShowDeleted(e.target.checked)} className="accent-violet-500" />
          show deleted
        </label>
        <button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-4 py-2 rounded-lg text-sm">
          Search
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-white/15">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/15 text-xs text-white/55 uppercase tracking-wider">
              <th className="text-left px-4 py-2 font-normal">Token</th>
              <th className="text-left px-4 py-2 font-normal">Subdomain</th>
              <th className="text-left px-4 py-2 font-normal">IP</th>
              <th className="text-left px-4 py-2 font-normal">Password</th>
              <th className="text-left px-4 py-2 font-normal">Email</th>
              <th className="text-left px-4 py-2 font-normal">Partner</th>
              <th className="text-left px-4 py-2 font-normal">Status</th>
              <th className="text-left px-4 py-2 font-normal">Created</th>
              <th className="text-left px-4 py-2 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {loading && !data ? (
              <tr><td colSpan={9} className="text-center text-white/40 py-6">Loading…</td></tr>
            ) : !data || data.rows.length === 0 ? (
              <tr><td colSpan={9} className="text-center text-white/40 py-6">No servers</td></tr>
            ) : data.rows.map(r => (
              <ServerRow
                key={r.id}
                r={r}
                isOpen={expanded === r.id}
                onToggle={() => setExpanded(expanded === r.id ? null : r.id)}
                onDelete={openDelete}
                working={working === r.id}
              />
            ))}
          </tbody>
        </table>
      </div>

      {data && data.pageCount > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button type="button" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="text-xs font-semibold text-white/70 hover:text-white border border-white/20 px-3 py-1.5 rounded disabled:opacity-30">← Prev</button>
          <span className="text-xs text-white/55 font-mono">{data.page} / {data.pageCount}</span>
          <button type="button" disabled={page >= data.pageCount} onClick={() => setPage(p => Math.min(data.pageCount, p + 1))} className="text-xs font-semibold text-white/70 hover:text-white border border-white/20 px-3 py-1.5 rounded disabled:opacity-30">Next →</button>
        </div>
      )}

      {pendingDelete && (() => {
        const row = data?.rows.find(r => r.id === pendingDelete.id)
        if (!row) return null
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setPendingDelete(null)}>
            <div className="bg-neutral-950 border border-white/20 rounded-xl p-6 max-w-md w-full flex flex-col gap-4" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-white">
                {pendingDelete.mode === 'soft' ? 'Soft delete server' : 'Hard wipe server'}
              </h2>
              {pendingDelete.mode === 'soft' ? (
                <p className="text-sm text-white/75 leading-relaxed">
                  Marks the ServerToken status as <code className="text-violet-300">deleted</code> in our DB. The customer&rsquo;s VPS keeps running with the existing Fractera install — we only remove it from admin lists. Reversible by editing the DB row.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-red-300 leading-relaxed">
                    <strong>This destroys the customer&rsquo;s working server.</strong> We will SSH in and wipe <code>/opt/fractera</code>, PM2, and nginx configs.
                  </p>
                  <p className="text-sm text-white/75">
                    To authorise, type the full subdomain below:
                  </p>
                  <code className="bg-white/5 border border-white/15 rounded px-3 py-2 text-violet-200 font-mono text-sm select-all">{row.subdomain}</code>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={e => setConfirmText(e.target.value)}
                    placeholder="type the subdomain to confirm"
                    autoFocus
                    className="bg-black/40 border border-red-500/40 rounded px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-400 font-mono"
                  />
                </div>
              )}
              {err && <p className="text-sm text-red-400">{err}</p>}
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => { setPendingDelete(null); setConfirmText(''); setErr(null) }} className="text-sm font-semibold text-white/70 hover:text-white border border-white/20 px-4 py-2 rounded">Cancel</button>
                <button
                  type="button"
                  onClick={performDelete}
                  disabled={working === pendingDelete.id || (pendingDelete.mode === 'hard' && confirmText !== row.subdomain)}
                  className={`text-sm font-bold px-4 py-2 rounded ${pendingDelete.mode === 'hard'
                    ? 'bg-red-600 hover:bg-red-500 disabled:bg-red-900/50 disabled:text-white/40 text-white'
                    : 'bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white'} disabled:cursor-not-allowed`}
                >
                  {working === pendingDelete.id ? 'Working…' : (pendingDelete.mode === 'hard' ? 'Wipe & delete' : 'Soft delete')}
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

function ServerRow({ r, isOpen, onToggle, onDelete, working }: {
  r: Row
  isOpen: boolean
  onToggle: () => void
  onDelete: (id: string, mode: 'soft' | 'hard') => void
  working: boolean
}) {
  const statusClass = r.status === 'active' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
    r.status === 'error' ? 'text-red-400 border-red-500/30 bg-red-500/10' :
    r.status === 'deleted' ? 'text-white/30 border-white/10' :
    r.status === 'offline' ? 'text-white/40 border-white/15' :
    'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'

  return (
    <>
      <tr className="border-b border-white/10 last:border-0 hover:bg-white/[0.02] cursor-pointer" onClick={onToggle}>
        <td className="px-4 py-2 text-white/65 font-mono text-xs" title={r.token}>{shortToken(r.token)}</td>
        <td className="px-4 py-2 text-white font-mono text-xs">
          {r.subdomain ? <a href={`https://${r.subdomain}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="hover:text-violet-300">{r.subdomain}</a> : '—'}
        </td>
        <td className="px-4 py-2 text-white/85 font-mono text-xs">{r.serverIp ?? '—'}</td>
        <td className="px-4 py-2 text-white/55 font-mono text-xs select-all">{r.serverPassword ?? '—'}</td>
        <td className="px-4 py-2 text-white/65 font-mono text-xs">{r.user.email ?? '—'}</td>
        <td className="px-4 py-2 text-violet-300 font-mono text-xs">
          {r.user.referredBy ? r.user.referredBy.slug : <span className="text-white/30">—</span>}
        </td>
        <td className="px-4 py-2">
          <span className={`text-xs px-2 py-0.5 rounded border ${statusClass}`}>{r.status}</span>
        </td>
        <td className="px-4 py-2 text-white/55 text-xs whitespace-nowrap">{fmt(r.createdAt)}</td>
        <td className="px-4 py-2 text-right text-white/40">{isOpen ? '▾' : '▸'}</td>
      </tr>
      {isOpen && (
        <tr className="border-b border-white/10 bg-white/[0.01]">
          <td colSpan={9} className="px-4 py-3">
            <div className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-white/65">
                <div><span className="text-white/40">Full token:</span> <code className="text-violet-200 select-all">{r.token}</code></div>
                <div><span className="text-white/40">Last ping:</span> {fmt(r.lastPingAt)}</div>
                <div><span className="text-white/40">White-label:</span> {r.whiteLabelActive ? '✓ active' : '○ off'}</div>
                {r.user.referredBy?.companyName && <div><span className="text-white/40">Partner company:</span> {r.user.referredBy.companyName}</div>}
                {r.deployError && <div className="md:col-span-2 text-red-300"><span className="text-white/40">Last error:</span> {r.deployError}</div>}
              </div>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                {r.status !== 'deleted' && (
                  <>
                    <button
                      type="button"
                      onClick={() => onDelete(r.id, 'soft')}
                      disabled={working}
                      className="text-xs font-semibold text-white/70 hover:text-white border border-white/20 hover:border-white/40 px-3 py-1.5 rounded disabled:opacity-50"
                    >
                      Soft delete (DB only)
                    </button>
                    {r.subdomain && r.serverIp && r.serverPassword && (
                      <button
                        type="button"
                        onClick={() => onDelete(r.id, 'hard')}
                        disabled={working}
                        className="text-xs font-semibold text-red-400 hover:text-red-300 border border-red-500/40 hover:border-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded disabled:opacity-50"
                      >
                        Hard wipe (SSH + DNS)
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
