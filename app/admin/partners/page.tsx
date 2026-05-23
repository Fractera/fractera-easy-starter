'use client'

import { useCallback, useEffect, useState } from 'react'

type Row = {
  id: string
  slug: string
  status: string
  companyName: string | null
  companyEmail: string | null
  createdAt: string
  user: { email: string | null }
  _count: { referrals: number }
}

export default function PartnersPage() {
  const [q, setQ] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const url = new URL('/api/admin/partners', window.location.origin)
    if (q.trim()) url.searchParams.set('q', q.trim())
    try {
      const res = await fetch(url.toString())
      if (res.ok) {
        const d = await res.json()
        setRows(d.rows ?? [])
      }
    } finally { setLoading(false) }
  }, [q])

  useEffect(() => { load() }, [load])

  function fmt(d: string) { return new Date(d).toLocaleString('ru-RU') }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">Partners</h1>
        <div className="text-sm text-white/55">Total: <strong className="text-white">{rows.length}</strong></div>
      </div>

      <form onSubmit={e => { e.preventDefault(); load() }} className="flex gap-2">
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="search slug / email / company…"
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
              <th className="text-left px-4 py-2 font-normal">Slug</th>
              <th className="text-left px-4 py-2 font-normal">Partner email</th>
              <th className="text-left px-4 py-2 font-normal">Company</th>
              <th className="text-left px-4 py-2 font-normal">Status</th>
              <th className="text-left px-4 py-2 font-normal">Clients</th>
              <th className="text-left px-4 py-2 font-normal">Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-white/40 py-6">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-white/40 py-6">No partners</td></tr>
            ) : rows.map(r => (
              <tr key={r.id} className="border-b border-white/10 last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-2 text-white font-mono text-xs">{r.slug}</td>
                <td className="px-4 py-2 text-white/80 font-mono text-xs">{r.user.email ?? '—'}</td>
                <td className="px-4 py-2 text-white/80 text-xs">
                  {r.companyName ?? '—'}
                  {r.companyEmail && <span className="block text-white/40">{r.companyEmail}</span>}
                </td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded border ${
                    r.status === 'active' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                    r.status === 'suspended' ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                    'text-white/70 border-white/20'
                  }`}>{r.status}</span>
                </td>
                <td className="px-4 py-2 text-center text-white font-mono">{r._count.referrals}</td>
                <td className="px-4 py-2 text-white/70">{fmt(r.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
