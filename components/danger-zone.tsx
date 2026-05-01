'use client'

import { useState } from 'react'

export function DangerZone({ onDestroyed }: { onDestroyed: () => void }) {
  const [open, setOpen] = useState(false)
  const [ip, setIp] = useState('')
  const [login, setLogin] = useState('root')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [destroying, setDestroying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canDestroy = ip.trim() && login.trim() && password.trim() && confirm === 'DELETE'

  async function handleDestroy() {
    if (!canDestroy || destroying) return
    setDestroying(true)
    setError(null)
    try {
      let domain: string | undefined
      try {
        const raw = localStorage.getItem('fractera_domain')
        if (raw) domain = JSON.parse(raw).domain
      } catch {}

      const res = await fetch('/api/destroy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: ip.trim(), login: login.trim(), password, domain }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `Server error ${res.status}`)
      }
      localStorage.removeItem('fractera_domain')
      onDestroyed()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      setDestroying(false)
    }
  }

  return (
    <div className="w-full max-w-xl flex flex-col gap-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="self-start text-sm text-red-500 hover:text-red-400 border border-red-500/40 hover:border-red-400/60 transition-colors px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <span className={`inline-block transition-transform duration-200 ${open ? 'rotate-90' : ''}`}>›</span>
        Danger Zone
      </button>

      {open && (
        <div className="flex flex-col gap-4 bg-red-500/[0.06] border border-red-500/40 rounded-xl p-5">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-red-400">Delete server and domain</p>
            <p className="text-xs text-gray-500">
              This will stop all services, remove Fractera from the server, and release your domain. The server itself will not be deleted from your hosting provider — you can reinstall Fractera on it at any time.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Server IP address"
              value={ip}
              onChange={e => setIp(e.target.value)}
              disabled={destroying}
              className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-red-500/50 transition-colors disabled:opacity-50"
            />
            <input
              type="text"
              placeholder="Login (usually: root)"
              value={login}
              onChange={e => setLogin(e.target.value)}
              disabled={destroying}
              className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-red-500/50 transition-colors disabled:opacity-50"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={destroying}
              className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-red-500/50 transition-colors disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-gray-400">
              To confirm, type <span className="font-mono font-bold text-red-400">DELETE</span> in capital letters:
            </p>
            <input
              type="text"
              placeholder="DELETE"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              disabled={destroying}
              className="bg-white/5 border border-red-500/20 rounded-xl px-5 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-red-500/60 transition-colors disabled:opacity-50 font-mono"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 break-all">
              {error}
            </p>
          )}

          <button
            onClick={handleDestroy}
            disabled={!canDestroy || destroying}
            className="w-full bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {destroying ? 'Deleting...' : 'Delete server and domain'}
          </button>
        </div>
      )}
    </div>
  )
}
