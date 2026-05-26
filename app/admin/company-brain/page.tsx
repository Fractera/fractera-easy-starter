'use client'

import { useCallback, useEffect, useState } from 'react'

type HistoryEntry = { id: string; createdAt: string; status: string; note: string }
type Row = {
  id: string
  createdAt: string
  email: string
  name: string | null
  company: string | null
  area: string | null
  country: string | null
  companyDoes: string | null
  aiTask: string | null
  telegram: string | null
  lang: string | null
  status: string
  history: HistoryEntry[]
}

const STATUS_OPTIONS = ['new', 'first_contact', 'negotiation', 'partner', 'lost'] as const
const STATUS_COLORS: Record<string, string> = {
  new:            'text-violet-300 border-violet-500/30 bg-violet-500/10',
  first_contact:  'text-blue-300 border-blue-500/30 bg-blue-500/10',
  negotiation:    'text-yellow-300 border-yellow-500/30 bg-yellow-500/10',
  partner:        'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
  lost:           'text-white/40 border-white/15 bg-white/[0.04]',
}

export default function CompanyBrainPage() {
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [newNote, setNewNote] = useState<Record<string, string>>({})
  const [pendingStatus, setPendingStatus] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const url = new URL('/api/admin/company-brain', window.location.origin)
    if (q.trim()) url.searchParams.set('q', q.trim())
    if (statusFilter) url.searchParams.set('status', statusFilter)
    try {
      const res = await fetch(url.toString())
      if (res.ok) {
        const d = await res.json()
        setRows(d.rows ?? [])
      }
    } finally { setLoading(false) }
  }, [q, statusFilter])

  useEffect(() => { load() }, [load])

  function fmt(d: string) { return new Date(d).toLocaleString('ru-RU') }

  async function commit(id: string) {
    setSaving(id)
    const note = (newNote[id] ?? '').trim()
    const statusChange = pendingStatus[id]
    const current = rows.find(r => r.id === id)
    if (!note && (!statusChange || statusChange === current?.status)) {
      setSaving(null)
      return
    }
    const body: Record<string, unknown> = { id }
    if (statusChange && statusChange !== current?.status) body.status = statusChange
    if (note) body.note = note
    const res = await fetch('/api/admin/company-brain', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      setNewNote(n => ({ ...n, [id]: '' }))
      setPendingStatus(s => { const c = { ...s }; delete c[id]; return c })
      await load()
    }
    setSaving(null)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">AI Company Brain CRM</h1>
        <div className="text-sm text-white/55">Inquiries: <strong className="text-white">{rows.length}</strong></div>
      </div>

      <form onSubmit={e => { e.preventDefault(); load() }} className="flex gap-2 flex-wrap">
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="search email / company / name…"
          className="flex-1 min-w-[200px] bg-white/[0.04] border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/70"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-white/[0.04] border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/70"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-4 py-2 rounded-lg text-sm">
          Apply
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {loading && rows.length === 0 ? (
          <div className="text-center text-white/40 py-6">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="text-center text-white/40 py-6 rounded-xl border border-white/15">No inquiries</div>
        ) : rows.map(r => {
          const isOpen = expanded === r.id
          return (
            <div key={r.id} className="rounded-xl border border-white/15 bg-white/[0.02] overflow-hidden">
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : r.id)}
                className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-white/[0.03]"
              >
                <div className="flex items-center gap-3 flex-wrap min-w-0">
                  <span className={`text-xs px-2 py-0.5 rounded border shrink-0 ${STATUS_COLORS[r.status] ?? STATUS_COLORS.new}`}>{r.status}</span>
                  <span className="text-sm font-mono text-white truncate">{r.email}</span>
                  {r.company && <span className="text-sm text-white/65 truncate">· {r.company}</span>}
                  <span className="text-xs text-white/40 shrink-0">{fmt(r.createdAt)}</span>
                </div>
                <span className="text-white/40 shrink-0">{isOpen ? '▾' : '▸'}</span>
              </button>

              {isOpen && (
                <div className="border-t border-white/10 px-4 py-4 flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {r.name && <Field label="Name" value={r.name} />}
                    {r.company && <Field label="Company" value={r.company} />}
                    {r.area && <Field label="Area" value={r.area} />}
                    {r.country && <Field label="Country" value={r.country} />}
                    {r.telegram && <Field label="Telegram" value={r.telegram} />}
                    {r.lang && <Field label="Lang" value={r.lang} />}
                    {r.companyDoes && <Field label="What company does" value={r.companyDoes} full />}
                    {r.aiTask && <Field label="AI task" value={r.aiTask} full />}
                  </div>

                  <div className="flex flex-col gap-2 rounded-lg border border-violet-500/30 bg-violet-500/[0.04] p-3">
                    <p className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">Add note / change status</p>
                    <div className="flex flex-col md:flex-row gap-2">
                      <select
                        value={pendingStatus[r.id] ?? r.status}
                        onChange={e => setPendingStatus(s => ({ ...s, [r.id]: e.target.value }))}
                        className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/70"
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <textarea
                        value={newNote[r.id] ?? ''}
                        onChange={e => setNewNote(n => ({ ...n, [r.id]: e.target.value }))}
                        placeholder="optional note…"
                        rows={2}
                        className="flex-1 bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/70 leading-relaxed"
                      />
                      <button
                        type="button"
                        onClick={() => commit(r.id)}
                        disabled={saving === r.id}
                        className="self-end bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg text-sm whitespace-nowrap"
                      >
                        {saving === r.id ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  </div>

                  {r.history.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-mono font-bold text-white/55 uppercase tracking-widest">History</p>
                      <div className="overflow-x-auto rounded-lg border border-white/10">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-white/10 text-white/55">
                              <th className="text-left px-3 py-2 font-normal">Date</th>
                              <th className="text-left px-3 py-2 font-normal">Status</th>
                              <th className="text-left px-3 py-2 font-normal">Note</th>
                            </tr>
                          </thead>
                          <tbody>
                            {r.history.map(h => (
                              <tr key={h.id} className="border-b border-white/5 last:border-0">
                                <td className="px-3 py-2 text-white/65 whitespace-nowrap">{fmt(h.createdAt)}</td>
                                <td className="px-3 py-2">
                                  <span className={`text-xs px-1.5 py-0.5 rounded border ${STATUS_COLORS[h.status] ?? STATUS_COLORS.new}`}>{h.status}</span>
                                </td>
                                <td className="px-3 py-2 text-white/80 whitespace-pre-wrap">{h.note}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Field({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={`flex flex-col gap-0.5 ${full ? 'md:col-span-2' : ''}`}>
      <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">{label}</span>
      <span className="text-sm text-white/85 whitespace-pre-wrap leading-relaxed">{value}</span>
    </div>
  )
}
