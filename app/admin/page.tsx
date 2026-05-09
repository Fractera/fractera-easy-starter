'use client'

import { useState, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// ─── Типы ────────────────────────────────────────────────────────────────────

type VpsReserve = {
  id: string
  ip: string
  login: string
  password: string
  status: string
  activatedAt: string | null
  paidAmount: number | null
  expiresAt: string | null
  reservedUntil: string | null
  createdAt: string
}

type QueuedToken = {
  id: string
  email: string | null
  planId: string | null
  paidAt: string
}

type DeployAttemptRecord = {
  id: string
  triggeredBy: string
  status: string
  error: string | null
  subdomain: string | null
  serverIp: string | null
  startedAt: string
  completedAt: string | null
}

type DeployIssueToken = {
  id: string
  email: string | null
  status: string  // 'error' | 'pending'
  serverIp: string | null
  serverPassword: string | null
  deployError: string | null
  createdAt: string
  latestAttempt: DeployAttemptRecord | null
}

type SaleRecord = {
  id: string
  email: string
  ip: string | null
  paidAt: string
  subdomain: string | null
  status: string
}

// ─── Компонент обратного отсчёта для pending_payment ─────────────────────────

function Countdown({ reservedUntil }: { reservedUntil: string }) {
  const [remaining, setRemaining] = useState(() => new Date(reservedUntil).getTime() - Date.now())

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(new Date(reservedUntil).getTime() - Date.now())
    }, 1000)
    return () => clearInterval(id)
  }, [reservedUntil])

  if (remaining <= 0) return <span className="text-gray-600 text-xs">истекает…</span>

  const m = Math.floor(remaining / 60000)
  const s = Math.floor((remaining % 60000) / 1000)
  return (
    <span className="font-mono text-xs text-yellow-500">
      {m}:{String(s).padStart(2, '0')}
    </span>
  )
}

// ─── Строка деплоя: ошибка (форма) или pending-редеплой (история попыток) ────

function DeployRow({ token, onRedeployed }: { token: DeployIssueToken; onRedeployed: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [ip, setIp] = useState(token.serverIp ?? '')
  const [password, setPassword] = useState(token.serverPassword ?? '')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [history, setHistory] = useState<DeployAttemptRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const isInProgress = token.status === 'pending' && !!token.latestAttempt && token.latestAttempt.triggeredBy === 'admin'
  const isStale = token.status === 'pending' && !isInProgress

  async function loadHistory() {
    setHistoryLoading(true)
    const res = await fetch(`/api/admin/deploy-history?serverTokenId=${token.id}`)
    if (res.ok) setHistory(await res.json())
    setHistoryLoading(false)
  }

  async function handleExpand() {
    setExpanded(v => !v)
    if (!expanded && isInProgress) loadHistory()
  }

  async function handleRedeploy() {
    setLoading(true)
    setFormError('')
    const res = await fetch('/api/admin/redeploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverTokenId: token.id, serverIp: ip || undefined, serverPassword: password || undefined }),
    })
    if (res.ok) {
      onRedeployed()
    } else {
      const d = await res.json()
      setFormError(d.error ?? 'Ошибка')
    }
    setLoading(false)
  }

  const lastAttemptAgo = token.latestAttempt
    ? (() => {
        const ms = Date.now() - new Date(token.latestAttempt.startedAt).getTime()
        const m = Math.floor(ms / 60000)
        return m < 1 ? 'только что' : `${m} мин назад`
      })()
    : null

  return (
    <>
      <tr className="border-b border-white/[0.05] hover:bg-white/[0.02]">
        <td className="px-4 py-3 text-gray-200">{token.email ?? '—'}</td>
        <td className="px-4 py-3 font-mono text-gray-400 text-xs">{token.serverIp ?? '—'}</td>
        <td className="px-4 py-3">
          {isInProgress ? (
            <span className="text-xs px-2 py-0.5 rounded-full border text-blue-400 border-blue-500/30 bg-blue-500/10">
              🔄 Устраняется
            </span>
          ) : isStale ? (
            <span className="text-xs px-2 py-0.5 rounded-full border text-yellow-400 border-yellow-500/30 bg-yellow-500/10">
              ⚠ Завис
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full border text-red-400 border-red-500/30 bg-red-500/10">
              Ошибка
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-gray-500 text-xs">
          {lastAttemptAgo ?? new Date(token.createdAt).toLocaleString('ru-RU')}
        </td>
        <td className="px-4 py-3">
          <button
            type="button"
            onClick={handleExpand}
            className={`text-xs text-white px-3 py-1.5 rounded-lg transition-colors ${
              isInProgress
                ? 'bg-blue-700/50 hover:bg-blue-700/70'
                : 'bg-red-700/60 hover:bg-red-700/80'
            }`}
          >
            {expanded ? 'Свернуть' : isInProgress ? 'История ▾' : 'Перезапустить ▾'}
          </button>
        </td>
      </tr>

      {expanded && (
        <tr className="border-b border-white/[0.05] bg-white/[0.015]">
          <td colSpan={5} className="px-4 py-4">
            {/* Редеплой в процессе → показываем историю попыток */}
            {isInProgress ? (
              <div className="flex flex-col gap-3 max-w-2xl">
                <p className="text-xs text-gray-500">История попыток деплоя. Текущая в процессе — дождитесь завершения или запустите заново.</p>
                {historyLoading ? (
                  <p className="text-xs text-gray-600">Загрузка…</p>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-600 border-b border-white/[0.06]">
                        <th className="text-left py-1.5 font-normal">#</th>
                        <th className="text-left py-1.5 font-normal">Кто запустил</th>
                        <th className="text-left py-1.5 font-normal">Старт</th>
                        <th className="text-left py-1.5 font-normal">Завершение</th>
                        <th className="text-left py-1.5 font-normal">Статус</th>
                        <th className="text-left py-1.5 font-normal">Домен / Ошибка</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((a, i) => (
                        <tr key={a.id} className="border-b border-white/[0.04]">
                          <td className="py-2 text-gray-600">{i + 1}</td>
                          <td className="py-2 text-gray-400">{a.triggeredBy}</td>
                          <td className="py-2 text-gray-400">{new Date(a.startedAt).toLocaleString('ru-RU')}</td>
                          <td className="py-2 text-gray-500">{a.completedAt ? new Date(a.completedAt).toLocaleString('ru-RU') : '—'}</td>
                          <td className="py-2">
                            <span className={
                              a.status === 'success' ? 'text-green-400'
                              : a.status === 'failed' ? 'text-red-400'
                              : 'text-yellow-400'
                            }>
                              {a.status === 'success' ? '✓ success' : a.status === 'failed' ? '✗ failed' : '… running'}
                            </span>
                          </td>
                          <td className="py-2 text-gray-500 max-w-[200px] truncate" title={a.subdomain ?? a.error ?? ''}>
                            {a.subdomain ?? a.error ?? '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {/* Форма для перезапуска даже когда в процессе (если хотим прервать и запустить с другими кредами) */}
                <div className="border-t border-white/[0.06] pt-3 mt-1 flex flex-col gap-2">
                  <p className="text-xs text-gray-600">Запустить заново с другими кредами:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input value={ip} onChange={e => setIp(e.target.value)} placeholder="IP-адрес"
                      className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono placeholder-gray-600 outline-none focus:border-white/30" />
                    <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль"
                      className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono placeholder-gray-600 outline-none focus:border-white/30" />
                  </div>
                  {formError && <p className="text-xs text-red-400">{formError}</p>}
                  <button type="button" onClick={handleRedeploy} disabled={loading}
                    className="self-start bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-1.5 rounded-xl text-xs transition-colors disabled:opacity-50">
                    {loading ? 'Запускаю…' : 'Перезапустить с новыми кредами'}
                  </button>
                </div>
              </div>
            ) : (
              /* Ошибка → форма перезапуска */
              <div className="flex flex-col gap-3 max-w-xl">
                {token.deployError && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Текст ошибки:</p>
                    <p className="text-xs text-red-300/80 font-mono break-all whitespace-pre-wrap">{token.deployError}</p>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  При необходимости измените IP/пароль (другой сервер), затем нажмите «Перезапустить деплой».
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-600">IP-адрес сервера</label>
                    <input value={ip} onChange={e => setIp(e.target.value)} placeholder="1.2.3.4"
                      className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono placeholder-gray-600 outline-none focus:border-white/30 transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-600">Пароль root</label>
                    <input value={password} onChange={e => setPassword(e.target.value)} placeholder="пароль"
                      className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono placeholder-gray-600 outline-none focus:border-white/30 transition-colors" />
                  </div>
                </div>
                {formError && <p className="text-xs text-red-400">{formError}</p>}
                <button type="button" onClick={handleRedeploy} disabled={loading}
                  className="self-start bg-white text-black font-semibold px-5 py-2 rounded-xl text-sm transition-opacity disabled:opacity-50">
                  {loading ? 'Запускаю…' : 'Перезапустить деплой'}
                </button>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

// ─── Основная страница ────────────────────────────────────────────────────────

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [servers, setServers] = useState<VpsReserve[]>([])
  const [queued, setQueued] = useState<QueuedToken[]>([])
  const [deploys, setDeploys] = useState<DeployIssueToken[]>([])
  const [searchEmail, setSearchEmail] = useState('')
  const [searchResults, setSearchResults] = useState<SaleRecord[] | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [addForm, setAddForm] = useState({ ip: '', login: 'root', password: '', activatedAt: '', paidAmount: '', expiresAt: '' })
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')
  const [counts, setCounts] = useState({ available: 0, pending: 0 })

  // ─── Загрузка данных ──────────────────────────────────────────────────────

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

  async function loadDeploys() {
    const res = await fetch('/api/admin/servers?status=deploy-issues')
    if (!res.ok) return
    setDeploys(await res.json())
  }

  // ─── Полинг каждые 5 секунд ──────────────────────────────────────────────
  // Все три таблицы обновляются в фоне без перезагрузки страницы.
  // React обновляет только строки, данные которых изменились (stable key).

  useEffect(() => {
    if (status === 'unauthenticated') { router.replace('/'); return }
    if (status === 'loading') return
    if (session?.user?.email !== 'admin@fractera.ai') { router.replace('/'); return }

    loadServers()
    loadQueued()
    loadDeploys()

    const id = setInterval(() => {
      loadServers()
      loadQueued()
      loadDeploys()
    }, 5000)

    return () => clearInterval(id)
  }, [status, session])

  // ─── Обработчики действий ─────────────────────────────────────────────────

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

        {/* ─── Заголовок ──────────────────────────────────────────────────── */}
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

        {/* ─── Контекст панели ────────────────────────────────────────────── */}
        <section className="flex flex-col gap-3 max-w-2xl">
          <p className="text-sm text-gray-400 leading-relaxed">
            Эта панель управляет процессом, в котором пользователи приобретают серверы вместе с подпиской <strong className="text-white">Fractera Pro</strong>.
            Поток, при котором пользователи регистрируют собственные серверы с уже имеющимися IP-адресами, в данной панели не отображается и не фиксируется в базе данных как серверы, за которые Fractera несёт ответственность.
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
            Текущий процесс — <strong className="text-gray-300">полуавтоматический</strong>: администратор своевременно закупает необходимое количество серверов и вручную вносит их IP-адреса и пароли в пул. В будущем этот шаг может быть частично автоматизирован за счёт парсинга входящих писем от провайдера, однако процесс в целом останется полуавтоматическим.
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
            По достижении определённого объёма продаж потребуется переход на <strong className="text-gray-300">автоматизированную закупку</strong> серверов и автозаполнение данных в таблицу пула — это задача следующего этапа масштабирования.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed border-l border-orange-500/30 pl-3">
            <span className="text-orange-400 font-medium">Нерешённый сценарий:</span> отслеживание авторенньюала серверов у провайдера в случаях, когда пользователь задержал оплату, планирует оплатить или решил отказаться от сервиса. Политика работы с такими случаями не разработана.
          </p>
        </section>

        {/* ─── Как работает система ───────────────────────────────────────── */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-mono text-gray-600 uppercase tracking-widest">Как работает система</h2>
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex flex-col gap-5 text-sm text-gray-400 leading-relaxed">

            {/* Путь A */}
            <div className="flex flex-col gap-2">
              <p className="text-white font-semibold text-xs uppercase tracking-widest">Путь A — есть серверы в пуле</p>
              <ol className="list-decimal list-inside flex flex-col gap-1 pl-1">
                <li>Пользователь открывает fractera.ai → запрос <code className="text-gray-300">/api/pool/status</code></li>
                <li>Если <code className="text-gray-300">available &gt; 0</code> — показывается кнопка «Купить»</li>
                <li>Клик → резервируем сервер (<code className="text-gray-300">pending_payment</code>, 30 мин) → Stripe checkout</li>
                <li>Оплата → webhook → VpsReserve переходит в <code className="text-gray-300">paid</code> → создаётся ServerToken</li>
                <li><strong className="text-white">Письмо 1</strong>: IP, логин, пароль — мгновенно (сервер уже готов)</li>
                <li>bootstrap.sh разворачивает Fractera Lite (~15 мин)</li>
                <li><strong className="text-white">Письмо 2</strong>: URL workspace</li>
              </ol>
            </div>

            <div className="h-px bg-white/[0.06]" />

            {/* Путь B */}
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

            {/* Таймаут резерва */}
            <div className="flex flex-col gap-2">
              <p className="text-gray-500 font-semibold text-xs uppercase tracking-widest">Таймаут резерва (pending_payment)</p>
              <p className="text-gray-500 text-xs">
                При открытии Stripe checkout сервер переходит в <code className="text-gray-400">pending_payment</code> на 30 минут.
                Если пользователь не оплатил — Stripe стреляет <code className="text-gray-400">checkout.session.expired</code>,
                сервер автоматически возвращается в <code className="text-gray-400">available</code>.
                Обратный отсчёт виден в таблице пула ниже. Таблица обновляется каждые 5 секунд.
              </p>
            </div>

            <div className="h-px bg-white/[0.06]" />

            {/* Ошибки деплоя и аудит попыток */}
            <div className="flex flex-col gap-2">
              <p className="text-red-400 font-semibold text-xs uppercase tracking-widest">Деплои — ошибки и редеплои</p>
              <p className="text-gray-500 text-xs leading-relaxed">
                Если bootstrap.sh или SSH завершился с ошибкой — <code className="text-gray-400">serverToken.status</code>{' '}
                переходит в <code className="text-gray-400">error</code>, ошибка сохраняется в БД навсегда.
                Пользователь получает письмо-извинение, на <strong className="text-gray-400">admin@fractera.ai</strong> приходит алерт.
                В таблице «Деплои» раскройте строку чтобы отредактировать IP/пароль и запустить повторный деплой.
                После нажатия «Перезапустить» строка переходит в режим «🔄 Устраняется» — видна история всех попыток (<code className="text-gray-400">DeployAttempt</code>).
                Каждая попытка записывает: кто запустил (webhook / admin), время старта и завершения, итог.
                После успешного деплоя строка автоматически исчезает из таблицы.
                Пользователь на дашборде видит соответствующий статус на каждом этапе.
              </p>
            </div>

            <div className="h-px bg-white/[0.06]" />

            <p className="text-xs text-gray-600">
              Платформа: <span className="text-gray-500">Vercel</span> — временно для разработки.
              В будущем Easy Starter переедет на собственный сервер.
            </p>
          </div>
        </section>

        {/* ─── Цели разработки (roadmap) ──────────────────────────────────── */}
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
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Таймаут <code>pending_payment</code> — 30 мин резерв, <code>checkout.session.expired</code> освобождает автоматически</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Ошибки деплоя — алерт администратору, письмо-извинение пользователю, перезапуск из панели</li>
                <li className="flex items-center gap-2"><span className="text-gray-700">○</span> Автоматическое создание VPS через Contabo API</li>
                <li className="flex items-center gap-2"><span className="text-gray-700">○</span> Автопополнение пула (cron, velocity-based)</li>
                <li className="flex items-center gap-2"><span className="text-gray-700">○</span> Email-алёрт при снижении запаса заранее (при N серверах)</li>
              </ul>
            </div>
            <div className="h-px bg-white/[0.06]" />
            <div className="flex flex-col gap-3">
              <p className="text-xs text-orange-500 uppercase tracking-widest font-mono">⚠ Нерешённый сценарий — требует обсуждения</p>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex flex-col gap-2 text-sm text-orange-200/70 leading-relaxed">
                <p className="font-semibold text-orange-300">Что происходит если пользователь не продлил подписку вовремя?</p>
                <p>
                  Сценарий не проработан. Stripe может отменить подписку при неудачном списании,
                  но мы не определили что делать с сервером пользователя в этот момент.
                </p>
                <p>
                  <strong className="text-orange-300">Риски:</strong> автоматическое удаление данных с сервера, потеря
                  работы пользователя, репутационный ущерб. Пользователь мог просто не успеть —
                  это не намеренный отказ от сервиса.
                </p>
                <p>
                  <strong className="text-orange-300">Предварительное решение (не реализовано):</strong> в первый месяц
                  просрочки не трогать сервер. При необходимости — оплатить следующий месяц у
                  провайдера из собственных средств, чтобы дать пользователю время. Связаться
                  вручную и предложить продление.
                </p>
                <p className="text-xs text-orange-500">
                  Необходимо обсудить: grace period, автоматические попытки списания Stripe,
                  политику удаления данных, процесс ручного вмешательства администратора.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Пул серверов ───────────────────────────────────────────────── */}
        {/* Серверы со статусом available и pending_payment. Таблица обновляется
            каждые 5 секунд через setInterval без перезагрузки страницы.
            pending_payment → сервер зарезервирован под активную Stripe-сессию,
            через 30 мин автоматически вернётся в available если оплата не прошла. */}
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
                          <div className="flex flex-col gap-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full border w-fit ${
                              s.status === 'available'
                                ? 'text-green-400 border-green-500/30 bg-green-500/10'
                                : 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
                            }`}>
                              {s.status === 'available' ? 'Доступен' : 'Зарезервирован'}
                            </span>
                            {s.status === 'pending_payment' && s.reservedUntil && (
                              <Countdown reservedUntil={s.reservedUntil} />
                            )}
                          </div>
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

          {/* Форма добавления нового сервера в пул */}
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

        {/* ─── Ожидают сервер (Путь B) ────────────────────────────────────── */}
        {/* Пользователи оплатили подписку когда пул был пуст. Нужно вручную
            добавить сервер в пул и нажать «Назначить» — система сама отправит
            Письмо 1 и запустит bootstrap.sh. */}
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

        {/* ─── Деплои ─────────────────────────────────────────────────────── */}
        {/* status=error: bootstrap.sh/SSH завершился с ошибкой — перезапустить форму.
            status=pending (редеплой): admin уже нажал «Перезапустить» — показываем историю
            попыток (DeployAttempt). Таблица обновляется каждые 5 с; после успеха строка исчезает. */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-mono text-gray-600 uppercase tracking-widest">
            Деплои
            {deploys.length > 0 && (
              <span className="ml-2 text-red-400 normal-case">— {deploys.length}</span>
            )}
          </h2>

          {deploys.length === 0 ? (
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 text-sm text-gray-600 text-center">
              Нет проблемных деплоев
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-red-500/30">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-gray-600 uppercase tracking-widest">
                    <th className="text-left px-4 py-3 font-normal">Email</th>
                    <th className="text-left px-4 py-3 font-normal">IP</th>
                    <th className="text-left px-4 py-3 font-normal">Статус</th>
                    <th className="text-left px-4 py-3 font-normal">Последняя попытка</th>
                    <th className="px-4 py-3 font-normal" />
                  </tr>
                </thead>
                <tbody>
                  {deploys.map(t => (
                    <DeployRow
                      key={t.id}
                      token={t}
                      onRedeployed={loadDeploys}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ─── История продаж (поиск по email) ───────────────────────────── */}
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
