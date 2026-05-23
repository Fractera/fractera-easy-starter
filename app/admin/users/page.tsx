'use client'

import { useCallback, useEffect, useState } from 'react'

type UserRow = {
  id: string
  email: string | null
  createdAt: string
  _count: { serverTokens: number; sponsorships: number }
  partner: { slug: string } | null
  referredByPartnerId: string | null
}

type UsersResp = {
  total: number
  page: number
  pageSize: number
  pageCount: number
  rows: UserRow[]
}

export default function UsersPage() {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<UsersResp | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const url = new URL('/api/admin/users', window.location.origin)
    if (q.trim()) url.searchParams.set('q', q.trim())
    url.searchParams.set('page', String(page))
    try {
      const res = await fetch(url.toString())
      if (res.ok) setData(await res.json())
    } finally { setLoading(false) }
  }, [q, page])

  useEffect(() => { load() }, [load])

  function fmt(d: string) { return new Date(d).toLocaleString('ru-RU') }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">Users</h1>
        <div className="text-sm text-white/55">Total: <strong className="text-white">{data?.total ?? '—'}</strong></div>
      </div>

      <form onSubmit={e => { e.preventDefault(); setPage(1); load() }} className="flex gap-2">
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
              <th className="text-left px-4 py-2 font-normal">Registered</th>
              <th className="text-left px-4 py-2 font-normal">Servers</th>
              <th className="text-left px-4 py-2 font-normal">Sponsorships</th>
              <th className="text-left px-4 py-2 font-normal">Partner</th>
              <th className="text-left px-4 py-2 font-normal">Referred by</th>
            </tr>
          </thead>
          <tbody>
            {loading && !data ? (
              <tr><td colSpan={6} className="text-center text-white/40 py-6">Loading…</td></tr>
            ) : !data || data.rows.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-white/40 py-6">No users</td></tr>
            ) : data.rows.map(u => (
              <tr key={u.id} className="border-b border-white/10 last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-2 text-white font-mono text-xs">{u.email ?? '—'}</td>
                <td className="px-4 py-2 text-white/70">{fmt(u.createdAt)}</td>
                <td className="px-4 py-2 text-center text-white/80">{u._count.serverTokens}</td>
                <td className="px-4 py-2 text-center text-white/80">{u._count.sponsorships}</td>
                <td className="px-4 py-2 text-white/80 font-mono text-xs">{u.partner?.slug ?? '—'}</td>
                <td className="px-4 py-2 text-white/55 font-mono text-xs">{u.referredByPartnerId ? u.referredByPartnerId.slice(0, 8) + '…' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.pageCount > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="text-xs font-semibold text-white/70 hover:text-white border border-white/20 px-3 py-1.5 rounded disabled:opacity-30"
          >
            ← Prev
          </button>
          <span className="text-xs text-white/55 font-mono">{data.page} / {data.pageCount}</span>
          <button
            type="button"
            disabled={page >= data.pageCount}
            onClick={() => setPage(p => Math.min(data.pageCount, p + 1))}
            className="text-xs font-semibold text-white/70 hover:text-white border border-white/20 px-3 py-1.5 rounded disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
