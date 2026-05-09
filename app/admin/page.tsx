'use client'

import { useState, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type VpsReserve = {
  id: string
  ip: string
  login: string
  password: string
  status: string
  activatedAt: string | null
  paidAmount: number | null
  expiresAt: string | null
  createdAt: string
}

type QueuedToken = {
  id: string
  email: string | null
  planId: string | null
  paidAt: string
}

type SaleRecord = {
  id: string
  email: string
  ip: string | null
  paidAt: string
  subdomain: string | null
  status: string
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [servers, setServers] = useState<VpsReserve[]>([])
  const [queued, setQueued] = useState<QueuedToken[]>([])
  const [searchEmail, setSearchEmail] = useState('')
  const [searchResults, setSearchResults] = useState<SaleRecord[] | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [addForm, setAddForm] = useState({ ip: '', login: 'root', password: '', activatedAt: '', paidAmount: '', expiresAt: '' })
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')
  const [counts, setCounts] = useState({ available: 0, pending: 0 })

  useEffect(() => {
    if (status === 'unauthenticated') { router.replace('/'); return }
    if (status === 'loading') return
    if (session?.user?.email !== 'admin@fractera.ai') { router.replace('/'); return }
    loadServers()
    loadQueued()
  }, [status, session])

  async function loadServers() {
    const res = await fetch('/api/admin/servers?status=available,pending_payment')
    if (!res.ok) return
    const data: VpsReserve[] = await res.json()
    setServers(data)
    setCounts({
      available: data.filter(s => s.status === 'available').length,
      pending: data.filter(s => s.status === 'pending_payment').length,
    })
  }

  async function loadQueued() {
    const res = await fetch('/api/admin/servers?status=queued')
    if (!res.ok) return
    setQueued(await res.json())
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAddLoading(true)
    setAddError('')
    const res = await fetch('/api/admin/servers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addForm),
    })
    if (res.ok) {
      setAddForm({ ip: '', login: 'root', password: '', activatedAt: '', paidAmount: '', expiresAt: '' })
      loadServers()
    } else {
      const d = await res.json()
      setAddError(d.error ?? 'Error')
    }
    setAddLoading(false)
  }

  async function handleRelease(id: string) {
    await fetch('/api/admin/servers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'available' }),
    })
    loadServers()
  }

  async function handleAssign(serverTokenId: string) {
    const res = await fetch('/api/admin/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverTokenId }),
    })
    if (res.ok) {
      loadServers()
      loadQueued()
    } else {
      const d = await res.json()
      alert(d.error ?? 'Error assigning server')
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchEmail.trim()) return
    setSearchLoading(true)
    const res = await fetch(`/api/admin/servers?search=${encodeURIComponent(searchEmail.trim())}`)
    setSearchResults(res.ok ? await res.json() : [])
    setSearchLoading(false)
  }

  const fmtDate = (s: string | null) => s ? new Date(s).toLocaleDateString('ru-RU') : '—'
  const fmtDateTime = (s: string | null) => s ? new Date(s).toLocaleString('ru-RU') : '—'

  if (status === 'loading') {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center text-gray-500">Загрузка…</div>
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-12">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fractera</h1>
            <p className="text-sm text-gray-500 mt-1">Панель администратора · {session?.user?.email}</p>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-xs text-gray-600 hover:text-gray-400 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            Выйти
          </button>
        </div>

        {/* System description */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-mono text-gray-600 uppercase tracking-widest">Как работает система</h2>
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex flex-col gap-5 text-sm text-gray-400 leading-relaxed">

            <div className="flex flex-col gap-2">
              <p className="text-white font-semibold text-xs uppercase tracking-widest">Путь A — есть серверы в пуле</p>
              <ol className="list-decimal list-inside flex flex-col gap-1 pl-1">
                <li>Пользователь открывает fractera.ai → запрос <code className="text-gray-300">/api/pool/status</code></li>
                <li>Если <code className="text-gray-300">available &gt; 0</code> — показывается кнопка «Купить»</li>
                <li>Клик → резервируем сервер (<code className="text-gray-300">pending_payment</code>) → Stripe checkout</li>
                <li>Оплата → webhook → VpsReserve переходит в <code className="text-gray-300">paid</code> → создаётся ServerToken</li>
                <li><strong className="text-white">Письмо 1</strong>: IP, логин, пароль — мгновенно (сервер уже готов)</li>
                <li>bootstrap.sh разворачивает Fractera Lite (~15 мин)</li>
                <li><strong className="text-white">Письмо 2</strong>: URL workspace</li>
              </ol>
            </div>

            <div className="h-px bg-white/[0.06]" />

            <div className="flex flex-col gap-2">
              <p className="text-yellow-400 font-semibold text-xs uppercase tracking-widest">Путь B — пул пуст</p>
              <ol className="list-decimal list-inside flex flex-col gap-1 pl-1">
                <li>Пользователь видит Warning-баннер на сайте</li>
                <li>Может купить с ожиданием до 60 минут</li>
                <li>Оплата → webhook → ServerToken со статусом <code className="text-gray-300">queued</code></li>
                <li>Письмо пользователю «сервер будет готов в течение 60 мин»</li>
                <li><strong className="text-white">Письмо на admin@fractera.ai</strong> с данными пользователя</li>
                <li>Администратор добавляет сервер в пул и нажимает «Назначить» → Письмо 1 → деплой → Письмо 2</li>
              </ol>
            </div>

            <div className="h-px bg-white/[0.06]" />

            <p className="text-xs text-gray-600">
              Платформа: <span className="text-gray-500">Vercel</span> — временно для разработки.
              В будущем Easy Starter переедет на собственный сервер.
            </p>
          </div>
        </section>

        {/* Roadmap */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-mono text-gray-600 uppercase tracking-widest">Цели разработки</h2>
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex flex-col gap-4 text-sm">
            <div className="flex flex-col gap-2">
              <p className="text-xs text-red-400 uppercase tracking-widest font-mono">Без чего нельзя запуститься</p>
              <ul className="flex flex-col gap-1 text-gray-400">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Ручной пул серверов</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Страница администратора</li>
                <li className="flex items-center gap-2"><span className="text-gray-600">○</span> Протестировать полный Путь A и Путь B</li>
              </ul>
            </div>
            <div className="h-px bg-white/[0.06]" />
            <div className="flex flex-col gap-2">
              <p className="text-xs text-gray-600 uppercase tracking-widest font-mono">Следующие этапы (запуск возможен без них)</p>
              <ul className="flex flex-col gap-1 text-gray-500">
                <li className="flex items-center gap-2"><span className="text-gray-700">○</span> Контроль продления — подсвечивать строки за 7 дней до <code>expiresAt</code></li>
                <li className="flex items-center gap-2"><span className="text-gray-700">○</span> Таймаут <code>pending_payment</code> — освобождать зависшие резервы (Stripe: <code>checkout.session.expired</code>)</li>
                <li className="flex items-center gap-2"><span className="text-gray-700">○</span> Автоматическое создание VPS через Contabo API</li>
                <li className="flex items-center gap-2"><span className="text-gray-700">○</span> Автопополнение пула (cron, velocity-based)</li>
                <li className="flex items-center gap-2"><span className="text-gray-700">○</span> Email-алёрт при снижении запаса заранее (при N серверах)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Pool table */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xs font-mono text-gray-600 uppercase tracking-widest">Пул серверов</h2>
            <div className="flex gap-3 text-xs text-gray-500">
              <span>Доступно: <strong className="text-green-400">{counts.available}</strong></span>
              <span>Зарезервировано: <strong className="text-yellow-400">{counts.pending}</strong></span>
            </div>
          </div>

          {servers.length === 0 ? (
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 text-sm text-gray-600 text-center">
              Пул пуст — добавьте сервер ниже
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-gray-600 uppercase tracking-widest">
                    <th className="text-left px-4 py-3 font-normal">Добавлен</th>
                    <th className="text-left px-4 py-3 font-normal">Стоимость</th>
                    <th className="text-left px-4 py-3 font-normal">Истекает</th>
                    <th className="text-left px-4 py-3 font-normal">IP</th>
                    <th className="text-left px-4 py-3 font-normal">Логин</th>
                    <th className="text-left px-4 py-3 font-normal">Пароль</th>
                    <th className="text-left px-4 py-3 font-normal">Статус</th>
                    <th className="px-4 py-3 font-normal" />
                  </tr>
                </thead>
                <tbody>
                  {servers.map(s => {
                    const expiring = s.expiresAt && (new Date(s.expiresAt).getTime() - Date.now()) < 7 * 86400_000
                    return (
                      <tr key={s.id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-gray-400">{fmtDate(s.activatedAt ?? s.createdAt)}</td>
                        <td className="px-4 py-3 text-gray-400">{s.paidAmount != null ? `€${s.paidAmount}` : '—'}</td>
                        <td className={`px-4 py-3 ${expiring ? 'text-red-400' : 'text-gray-400'}`}>
                          {fmtDate(s.expiresAt)}
                          {expiring && <span className="ml-1 text-xs text-red-500">!</span>}
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-200">{s.ip}</td>
                        <td className="px-4 py-3 font-mono text-gray-400">{s.login}</td>
                        <td className="px-4 py-3 font-mono text-gray-200 text-xs">{s.password}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${
                            s.status === 'available'
                              ? 'text-green-400 border-green-500/30 bg-green-500/10'
                              : 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
                          }`}>
                            {s.status === 'available' ? 'Доступен' : 'Зарезервирован'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {s.status === 'pending_payment' && (
                            <button
                              type="button"
                              onClick={() => handleRelease(s.id)}
                              className="text-xs text-gray-500 hover:text-white border border-white/10 hover:border-white/20 px-2 py-1 rounded-lg transition-colors"
                            >
                              Освободить
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Add server form */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
            <p className="text-xs text-gray-600 uppercase tracking-widest font-mono">Добавить сервер</p>
            <form onSubmit={handleAdd} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <input
                  required
                  placeholder="IP-адрес"
                  value={addForm.ip}
                  onChange={e => setAddForm(f => ({ ...f, ip: e.target.value }))}
                  className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-white/30 transition-colors"
                />
                <input
                  placeholder="Логин (root)"
                  value={addForm.login}
                  onChange={e => setAddForm(f => ({ ...f, login: e.target.value }))}
                  className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-white/30 transition-colors"
                />
                <input
                  required
                  placeholder="Пароль"
                  value={addForm.password}
                  onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))}
                  className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-white/30 transition-colors"
                />
                <input
                  type="date"
                  placeholder="Дата активации"
                  value={addForm.activatedAt}
                  onChange={e => setAddForm(f => ({ ...f, activatedAt: e.target.value }))}
                  className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-white/30 transition-colors"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Стоимость (€)"
                  value={addForm.paidAmount}
                  onChange={e => setAddForm(f => ({ ...f, paidAmount: e.target.value }))}
                  className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-white/30 transition-colors"
                />
                <input
                  type="date"
                  placeholder="Истекает"
                  value={addForm.expiresAt}
                  onChange={e => setAddForm(f => ({ ...f, expiresAt: e.target.value }))}
                  className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-white/30 transition-colors"
                />
              </div>
              {addError && <p className="text-xs text-red-400">{addError}</p>}
              <button
                type="submit"
                disabled={addLoading}
                className="self-start bg-white text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-opacity disabled:opacity-50"
              >
                {addLoading ? 'Добавляю…' : 'Добавить сервер'}
              </button>
            </form>
          </div>
        </section>

        {/* Queued section (Path B) */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-mono text-gray-600 uppercase tracking-widest">
            Ожидают сервер (Путь B)
            {queued.length > 0 && (
              <span className="ml-2 text-red-400 normal-case">— {queued.length} пользователей</span>
            )}
          </h2>

          {queued.length === 0 ? (
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 text-sm text-gray-600 text-center">
              Нет пользователей в очереди
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-red-500/20">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-gray-600 uppercase tracking-widest">
                    <th className="text-left px-4 py-3 font-normal">Email</th>
                    <th className="text-left px-4 py-3 font-normal">Тариф</th>
                    <th className="text-left px-4 py-3 font-normal">Дата оплаты</th>
                    <th className="px-4 py-3 font-normal" />
                  </tr>
                </thead>
                <tbody>
                  {queued.map(q => (
                    <tr key={q.id} className="border-b border-white/[0.05] last:border-0">
                      <td className="px-4 py-3 text-gray-200">{q.email ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-400">{q.planId ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-400">{fmtDateTime(q.paidAt)}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleAssign(q.id)}
                          className="text-xs text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Назначить сервер
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Sales search */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-mono text-gray-600 uppercase tracking-widest">История продаж</h2>
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="email"
              placeholder="Email пользователя"
              value={searchEmail}
              onChange={e => setSearchEmail(e.target.value)}
              className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-white/30 transition-colors"
            />
            <button
              type="submit"
              disabled={searchLoading}
              className="bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 text-gray-300 font-medium px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {searchLoading ? 'Поиск…' : 'Найти'}
            </button>
          </form>

          {searchResults !== null && (
            searchResults.length === 0 ? (
              <p className="text-sm text-gray-600">Нет результатов для «{searchEmail}»</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs text-gray-600 uppercase tracking-widest">
                      <th className="text-left px-4 py-3 font-normal">IP</th>
                      <th className="text-left px-4 py-3 font-normal">Дата оплаты</th>
                      <th className="text-left px-4 py-3 font-normal">Subdomain</th>
                      <th className="text-left px-4 py-3 font-normal">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map(r => (
                      <tr key={r.id} className="border-b border-white/[0.05] last:border-0">
                        <td className="px-4 py-3 font-mono text-gray-200">{r.ip ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-400">{fmtDateTime(r.paidAt)}</td>
                        <td className="px-4 py-3 text-gray-400">{r.subdomain ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-500">{r.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </section>

      </div>
    </main>
  )
}
