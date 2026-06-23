'use client'

import { useCallback, useEffect, useState } from 'react'

type Row = {
  id: string
  domain: string
  name: string
  isHosting?: boolean
  isRegistrar?: boolean
  createdAt: string
  createdBy: string | null
}

export default function HostingsPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [overall, setOverall] = useState(0)
  const [loading, setLoading] = useState(false)
  const [domain, setDomain] = useState('')
  const [name, setName] = useState('')
  const [isHosting, setIsHosting] = useState(true)
  const [isRegistrar, setIsRegistrar] = useState(false)
  const [adding, setAdding] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const [q, setQ] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const url = new URL('/api/admin/hostings', window.location.origin)
      if (q.trim()) url.searchParams.set('q', q.trim())
      const res = await fetch(url.toString())
      if (res.ok) {
        const d = await res.json()
        setRows(d.rows ?? [])
        setOverall(d.overall ?? 0)
      }
    } finally { setLoading(false) }
  }, [q])

  useEffect(() => { load() }, [load])

  async function add(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    if (!isHosting && !isRegistrar) { setErr('Mark the provider as trusted server, trusted domain registrar, or both.'); return }
    setAdding(true)
    try {
      const res = await fetch('/api/admin/hostings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, name, isHosting, isRegistrar }),
      })
      const d = await res.json()
      if (!res.ok) {
        setErr(d.error ?? 'failed')
      } else {
        setDomain(''); setName(''); setIsHosting(true); setIsRegistrar(false)
        await load()
      }
    } finally { setAdding(false) }
  }

  async function remove(id: string) {
    if (!confirm('Delete this provider? Existing PartnerLinks using this domain will continue to render until the link is updated.')) return
    setDeleting(id)
    try {
      await fetch('/api/admin/hostings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      await load()
    } finally { setDeleting(null) }
  }

  function fmt(d: string) { return new Date(d).toLocaleString('ru-RU') }

  const isFiltered = q.trim().length > 0

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">Trusted providers (whitelist)</h1>
        <div className="text-sm text-white/55">
          {isFiltered ? (
            <>Showing <strong className="text-white">{rows.length}</strong> of <strong className="text-white">{overall}</strong></>
          ) : (
            <>Total: <strong className="text-white">{rows.length}</strong></>
          )}
        </div>
      </div>

      <p className="text-sm text-white/55 max-w-3xl">
        Domains here are allowed on partner mirror pages (`www.fractera.ai/partner/&lt;slug&gt;`). Each entry is
        trusted as a <strong className="text-emerald-300/80">server</strong> provider, a <strong className="text-sky-300/80">domain</strong> registrar, or both — that decides which partner affiliate section it may appear in. The partner-cabinet widget tab does NOT restrict by whitelist.
      </p>

      <form onSubmit={e => { e.preventDefault(); load() }} className="flex flex-wrap gap-2">
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="search name / domain…"
          className="flex-1 min-w-[200px] bg-white/[0.04] border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/70"
        />
        <button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-4 py-2 rounded-lg text-sm">
          Search
        </button>
        {isFiltered && (
          <button
            type="button"
            onClick={() => setQ('')}
            className="text-sm font-semibold text-white/65 hover:text-white border border-white/20 px-3 py-2 rounded-lg"
          >
            Clear
          </button>
        )}
      </form>

      <form onSubmit={add} className="rounded-xl border border-white/15 bg-white/[0.02] p-4 flex flex-col gap-3">
        <p className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">Add provider</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input
            value={domain}
            onChange={e => setDomain(e.target.value)}
            placeholder="domain (e.g. hetzner.com)"
            required
            className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/70 font-mono"
          />
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="display name (e.g. Hetzner)"
            required
            className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/70"
          />
        </div>
        {/* The only thing that matters: is this a trusted server provider, a
            trusted domain registrar, or both (e.g. GoDaddy). */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-white/80">
            <input type="checkbox" checked={isHosting} onChange={e => setIsHosting(e.target.checked)} />
            Trusted server provider
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-white/80">
            <input type="checkbox" checked={isRegistrar} onChange={e => setIsRegistrar(e.target.checked)} />
            Trusted domain registrar
          </label>
        </div>
        {err && <p className="text-xs text-red-400">{err}</p>}
        <button
          type="submit"
          disabled={adding || !domain.trim() || !name.trim()}
          className="self-start bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg text-sm"
        >
          {adding ? 'Adding…' : 'Add'}
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-white/15">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/15 text-xs text-white/55 uppercase tracking-wider">
              <th className="text-left px-4 py-2 font-normal">Domain</th>
              <th className="text-left px-4 py-2 font-normal">Name</th>
              <th className="text-left px-4 py-2 font-normal">Trusted for</th>
              <th className="text-left px-4 py-2 font-normal">Added</th>
              <th className="text-left px-4 py-2 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-white/40 py-6">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-white/40 py-6">No providers</td></tr>
            ) : rows.map(r => (
              <tr key={r.id} className="border-b border-white/10 last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-2 text-white font-mono">{r.domain}</td>
                <td className="px-4 py-2 text-white/85">{r.name}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-1.5">
                    {r.isHosting && <span className="text-xs font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">server</span>}
                    {r.isRegistrar && <span className="text-xs font-mono text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/30">domain</span>}
                  </div>
                </td>
                <td className="px-4 py-2 text-white/55 text-xs">{fmt(r.createdAt)}{r.createdBy && <span className="block text-white/30">{r.createdBy}</span>}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => remove(r.id)}
                    disabled={deleting === r.id}
                    className="text-xs text-red-400/70 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 disabled:opacity-50 px-2 py-1 rounded"
                  >
                    {deleting === r.id ? 'Deleting…' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
