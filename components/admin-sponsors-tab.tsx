'use client'

import { useCallback, useEffect, useState } from 'react'

type Row = {
  id: string
  tier: 's1' | 's5' | 's20'
  email: string | null
  status: string
  firstPaymentAt: string | null
  lastPaymentAt: string | null
  paymentsCount: number
  createdAt: string
}

export function SponsorsTab({ tier, amount }: { tier: 's1' | 's5' | 's20'; amount: number }) {
  const [q, setQ] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const url = new URL('/api/admin/sponsors', window.location.origin)
    url.searchParams.set('tier', tier)
    if (q.trim()) url.searchParams.set('q', q.trim())
    try {
      const res = await fetch(url.toString())
      if (res.ok) setRows(await res.json())
    } finally { setLoading(false) }
  }, [q, tier])

  useEffect(() => { load() }, [load])

  function fmt(d: string | null) { return d ? new Date(d).toLocaleString('ru-RU') : '—' }

  const active = rows.filter(r => r.status === 'active').length
  const mrr = active * amount

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">${amount} sponsors</h1>
        <div className="flex gap-4 text-sm text-white/55">
          <span>Total: <strong className="text-white">{rows.length}</strong></span>
          <span>Active: <strong className="text-emerald-400">{active}</strong></span>
          <span>MRR: <strong className="text-yellow-400">${mrr}</strong></span>
        </div>
      </div>

      <form onSubmit={e => { e.preventDefault(); load() }} className="flex gap-2">
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="search by email…"
          className="flex-1 bg-white/[0.04] border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/70"
        />
        <button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-4 py-2 rounded-lg text-sm">
          Search
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-white/15">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/15 text-xs text-white/55 uppercase tracking-wider">
              <th className="text-left px-4 py-2 font-normal">Email</th>
              <th className="text-left px-4 py-2 font-normal">First payment</th>
              <th className="text-left px-4 py-2 font-normal">Last payment</th>
              <th className="text-left px-4 py-2 font-normal">Count</th>
              <th className="text-left px-4 py-2 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-white/40 py-6">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-white/40 py-6">No sponsors at this tier</td></tr>
            ) : rows.map(r => (
              <tr key={r.id} className="border-b border-white/10 last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-2 text-white font-mono text-xs">{r.email ?? '—'}</td>
                <td className="px-4 py-2 text-white/70">{fmt(r.firstPaymentAt)}</td>
                <td className="px-4 py-2 text-white/70">{fmt(r.lastPaymentAt)}</td>
                <td className="px-4 py-2 text-white font-mono">{r.paymentsCount}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded border ${
                    r.status === 'active' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                    r.status === 'past_due' || r.status === 'unpaid' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' :
                    r.status === 'canceled' ? 'text-white/40 border-white/10' :
                    'text-white/70 border-white/20'
                  }`}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
