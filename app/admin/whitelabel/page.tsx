'use client'

import { useCallback, useEffect, useState } from 'react'

type Row = {
  id: string
  createdAt: string
  serverIp: string | null
  serverSubdomain: string | null
  stripePaymentId: string
  user: { email: string | null }
  serverToken: { token: string; subdomain: string | null; status: string; whiteLabelActive: boolean } | null
}

export default function WhiteLabelPage() {
  const [q, setQ] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [total, setTotal] = useState(0)
  const [revenue, setRevenue] = useState(0)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const url = new URL('/api/admin/whitelabel', window.location.origin)
    if (q.trim()) url.searchParams.set('q', q.trim())
    try {
      const res = await fetch(url.toString())
      if (res.ok) {
        const d = await res.json()
        setRows(d.rows ?? [])
        setTotal(d.total ?? 0)
        setRevenue(d.totalRevenue ?? 0)
      }
    } finally { setLoading(false) }
  }, [q])

  useEffect(() => { load() }, [load])

  function fmt(d: string) { return new Date(d).toLocaleString('ru-RU') }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">White-label purchases</h1>
        <div className="flex gap-4 text-sm text-white/55">
          <span>Total: <strong className="text-white">{total}</strong></span>
          <span>Revenue: <strong className="text-emerald-400">${revenue}</strong></span>
        </div>
      </div>

      <p className="text-sm text-white/55 max-w-3xl">
        One-off $100 purchase that removes the Fractera footer branding on the customer&rsquo;s server. Each row is a paid Stripe charge.
      </p>

      <form onSubmit={e => { e.preventDefault(); load() }} className="flex gap-2">
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="search email / subdomain / IP…"
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
              <th className="text-left px-4 py-2 font-normal">Paid at</th>
              <th className="text-left px-4 py-2 font-normal">Email</th>
              <th className="text-left px-4 py-2 font-normal">Subdomain</th>
              <th className="text-left px-4 py-2 font-normal">IP</th>
              <th className="text-left px-4 py-2 font-normal">Server status</th>
              <th className="text-left px-4 py-2 font-normal">WL active</th>
              <th className="text-left px-4 py-2 font-normal">Stripe payment</th>
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-white/40 py-6">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-white/40 py-6">No white-label purchases</td></tr>
            ) : rows.map(r => (
              <tr key={r.id} className="border-b border-white/10 last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-2 text-white/70 whitespace-nowrap">{fmt(r.createdAt)}</td>
                <td className="px-4 py-2 text-white font-mono text-xs">{r.user.email ?? '—'}</td>
                <td className="px-4 py-2 text-white/85 font-mono text-xs">
                  {r.serverSubdomain ? <a href={`https://${r.serverSubdomain}`} target="_blank" rel="noopener noreferrer" className="hover:text-violet-300">{r.serverSubdomain}</a> : '—'}
                </td>
                <td className="px-4 py-2 text-white/65 font-mono text-xs">{r.serverIp ?? '—'}</td>
                <td className="px-4 py-2 text-white/65 text-xs">{r.serverToken?.status ?? '—'}</td>
                <td className="px-4 py-2 text-center">
                  {r.serverToken?.whiteLabelActive
                    ? <span className="text-emerald-400">✓</span>
                    : <span className="text-yellow-400/70">○</span>}
                </td>
                <td className="px-4 py-2 text-white/40 font-mono text-[10px] truncate max-w-[160px]">{r.stripePaymentId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
