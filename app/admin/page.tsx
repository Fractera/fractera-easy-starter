'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// ─── Типы ────────────────────────────────────────────────────────────────────

type VpsReserve = {
  id: string
  ip: string
  login: string
  password: string
  subdomain: string | null
  status: string
  reservedUntil: string | null
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

// ─── Таймер с момента начала bootstrap ───────────────────────────────────────

function ElapsedTimer({ startedAt }: { startedAt: number }) {
  const [elapsed, setElapsed] = useState(() => Date.now() - startedAt)

  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 1000)
    return () => clearInterval(id)
  }, [startedAt])

  const m = Math.floor(elapsed / 60000)
  const s = Math.floor((elapsed % 60000) / 1000)
  return (
    <span className="font-mono text-xs text-blue-400/70">
      {m}:{String(s).padStart(2, '0')}
    </span>
  )
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

  if (remaining <= 0) return <span className="text-white/60 text-xs">истекает…</span>

  const m = Math.floor(remaining / 60000)
  const s = Math.floor((remaining % 60000) / 1000)
  return (
    <span className="font-mono text-xs text-yellow-500">
      {m}:{String(s).padStart(2, '0')}
    </span>
  )
}

// ─── Основная страница ────────────────────────────────────────────────────────

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [servers, setServers] = useState<VpsReserve[]>([])
  const [queued, setQueued] = useState<QueuedToken[]>([])
  const [searchEmail, setSearchEmail] = useState('')
  const [searchResults, setSearchResults] = useState<SaleRecord[] | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [addForm, setAddForm] = useState({ ip: '', login: 'root', password: '' })
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')
  const [counts, setCounts] = useState({ ready: 0, provisioning: 0, pending: 0 })
  const [bootstrapping, setBootstrapping] = useState<Set<string>>(new Set())
  const [recovering, setRecovering] = useState<Set<string>>(new Set())
  const [resetting, setResetting] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState<Set<string>>(new Set())
  const provisioningStart = useRef<Map<string, number>>(new Map())

  // ─── Загрузка данных ──────────────────────────────────────────────────────

  async function loadServers() {
    const res = await fetch('/api/admin/servers?status=available,provisioning,ready,pending_payment')
    if (!res.ok) return
    const data: VpsReserve[] = await res.json()
    data.forEach(s => {
      if (s.status === 'provisioning' && !provisioningStart.current.has(s.id)) {
        provisioningStart.current.set(s.id, Date.now())
      } else if (s.status !== 'provisioning') {
        provisioningStart.current.delete(s.id)
      }
    })
    setServers(data)
    setCounts({
      ready: data.filter(s => s.status === 'ready').length,
      provisioning: data.filter(s => s.status === 'provisioning').length,
      pending: data.filter(s => s.status === 'pending_payment').length,
    })
  }

  async function loadQueued() {
    const res = await fetch('/api/admin/servers?status=queued')
    if (!res.ok) return
    setQueued(await res.json())
  }

  useEffect(() => {
    if (status === 'unauthenticated') { router.replace('/'); return }
    if (status === 'loading') return
    if (session?.user?.email !== 'admin@fractera.ai') { router.replace('/'); return }

    loadServers()
    loadQueued()

    const id = setInterval(() => {
      loadServers()
      loadQueued()
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
      setAddForm({ ip: '', login: 'root', password: '' })
      loadServers()
    } else {
      const d = await res.json()
      setAddError(d.error ?? 'Error')
    }
    setAddLoading(false)
  }

  async function handleBootstrap(id: string) {
    setBootstrapping(prev => new Set(prev).add(id))
    const res = await fetch('/api/pool/provision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vpsReserveId: id }),
    })
    if (!res.ok) {
      const d = await res.json()
      alert(d.error ?? 'Bootstrap failed')
      setBootstrapping(prev => { const s = new Set(prev); s.delete(id); return s })
    }
    // Status changes to 'provisioning' on next poll — button disappears automatically
  }

  async function handleRecover(id: string) {
    setRecovering(prev => new Set(prev).add(id))
    const res = await fetch('/api/admin/pool/recover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vpsReserveId: id }),
    })
    const d = await res.json()
    if (d.ok) {
      loadServers()
    } else {
      alert(d.message ?? d.error ?? 'Recover failed')
    }
    setRecovering(prev => { const s = new Set(prev); s.delete(id); return s })
  }

  async function handleReset(id: string) {
    setResetting(prev => new Set(prev).add(id))
    const res = await fetch('/api/admin/pool/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vpsReserveId: id }),
    })
    const d = await res.json()
    if (d.ok) {
      loadServers()
    } else {
      alert(d.error ?? 'Reset failed')
    }
    setResetting(prev => { const s = new Set(prev); s.delete(id); return s })
  }

  async function handleDelete(id: string) {
    if (!confirm('Удалить сервер из пула? Это действие необратимо.')) return
    setDeleting(prev => new Set(prev).add(id))
    await fetch('/api/admin/servers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadServers()
    setDeleting(prev => { const s = new Set(prev); s.delete(id); return s })
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

  const fmtDateTime = (s: string | null) => s ? new Date(s).toLocaleString('ru-RU') : '—'

  if (status === 'loading') {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center text-white">Загрузка…</div>
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-12">

        {/* ─── Заголовок ──────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fractera</h1>
          <p className="text-base text-white font-medium mt-1">Панель администратора · {session?.user?.email}</p>
        </div>

        {/* ─── Контекст панели ────────────────────────────────────────────── */}
        <section className="flex flex-col gap-3 max-w-2xl">
          <p className="text-base text-white font-medium leading-relaxed">
            Эта панель управляет процессом, в котором пользователи приобретают серверы вместе с подпиской <strong className="text-white font-bold">Fractera Pro</strong>.
            Поток, при котором пользователи регистрируют собственные серверы с уже имеющимися IP-адресами, в данной панели не отображается и не фиксируется в базе данных как серверы, за которые Fractera несёт ответственность.
          </p>
          <p className="text-base text-white font-medium leading-relaxed">
            Текущий процесс — <strong className="text-white font-bold">полуавтоматический</strong>: администратор своевременно закупает необходимое количество серверов и вручную вносит их IP-адреса и пароли в пул. В будущем этот шаг может быть частично автоматизирован за счёт парсинга входящих писем от провайдера, однако процесс в целом останется полуавтоматическим.
          </p>
          <p className="text-base text-white font-medium leading-relaxed">
            По достижении определённого объёма продаж потребуется переход на <strong className="text-white font-bold">автоматизированную закупку</strong> серверов и автозаполнение данных в таблицу пула — это задача следующего этапа масштабирования.
          </p>
          <p className="text-base text-white font-medium leading-relaxed border-l border-orange-500/50 pl-3">
            <span className="text-orange-400 font-medium">Нерешённый сценарий:</span> отслеживание авторенньюала серверов у провайдера в случаях, когда пользователь задержал оплату, планирует оплатить или решил отказаться от сервиса. Политика работы с такими случаями не разработана.
          </p>
        </section>

        {/* ─── Как работает система ───────────────────────────────────────── */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-mono font-bold text-white uppercase tracking-widest">Как работает система</h2>
          <div className="bg-white/[0.04] border border-white/40 rounded-2xl p-6 flex flex-col gap-5 text-sm text-white leading-relaxed">

            {/* Путь A */}
            <div className="flex flex-col gap-2">
              <p className="text-white font-bold text-sm uppercase tracking-widest">Путь A — есть готовые серверы в пуле</p>
              <ol className="list-decimal list-inside flex flex-col gap-1 pl-1">
                <li>Администратор добавляет VPS в пул → нажимает Bootstrap → сервер настраивается (~20 мин)</li>
                <li>Сервер получает субдомен и статус <code className="text-white font-semibold">ready</code></li>
                <li>Пользователь открывает fractera.ai → запрос <code className="text-white font-semibold">/api/pool/status</code></li>
                <li>Если <code className="text-white font-semibold">available &gt; 0</code> — показывается кнопка «Купить»</li>
                <li>Клик → резервируем сервер (<code className="text-white font-semibold">pending_payment</code>, 30 мин) → Stripe checkout</li>
                <li>Оплата → webhook → мгновенно: ServerToken со статусом <code className="text-white font-semibold">active</code></li>
                <li><strong className="text-white">Единственное письмо</strong>: URL workspace — сразу, без ожидания</li>
              </ol>
            </div>

            <div className="h-px bg-white/[0.06]" />

            {/* Путь B */}
            <div className="flex flex-col gap-2">
              <p className="text-yellow-400 font-semibold text-xs uppercase tracking-widest">Путь B — пул пуст</p>
              <ol className="list-decimal list-inside flex flex-col gap-1 pl-1">
                <li>Пользователь видит Warning-баннер на сайте</li>
                <li>Может купить с ожиданием до 60 минут</li>
                <li>Оплата → webhook → ServerToken со статусом <code className="text-white font-semibold">queued</code></li>
                <li>Письмо пользователю «сервер будет готов в течение 60 мин»</li>
                <li><strong className="text-white">Письмо на admin@fractera.ai</strong> с данными пользователя</li>
                <li>Администратор добавляет сервер в пул, делает Bootstrap → сервер готов → нажимает «Назначить» → мгновенно: ServerToken <code className="text-white font-semibold">active</code> + письмо пользователю с URL</li>
              </ol>
            </div>

            <div className="h-px bg-white/[0.06]" />

            {/* Таймаут резерва */}
            <div className="flex flex-col gap-2">
              <p className="text-white font-bold text-sm uppercase tracking-widest">Таймаут резерва (pending_payment)</p>
              <p className="text-white text-sm font-medium">
                При открытии Stripe checkout сервер переходит в <code className="text-white">pending_payment</code> на 30 минут.
                Если пользователь не оплатил — Stripe стреляет <code className="text-white">checkout.session.expired</code>,
                сервер автоматически возвращается в <code className="text-white">ready</code>.
                Обратный отсчёт виден в таблице пула ниже. Таблица обновляется каждые 5 секунд.
              </p>
            </div>

            <div className="h-px bg-white/[0.06]" />

            <p className="text-xs text-white/70">
              Платформа: <span className="text-white">Vercel</span> — временно для разработки.
              В будущем Easy Starter переедет на собственный сервер.
            </p>
          </div>
        </section>

        {/* ─── Цели разработки (roadmap) ──────────────────────────────────── */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-mono font-bold text-white uppercase tracking-widest">Цели разработки</h2>
          <div className="bg-white/[0.04] border border-white/40 rounded-2xl p-6 flex flex-col gap-4 text-sm">
            <div className="flex flex-col gap-2">
              <p className="text-xs text-red-400 uppercase tracking-widest font-mono">Без чего нельзя запуститься</p>
              <ul className="flex flex-col gap-1 text-white">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Ручной пул серверов</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Страница администратора</li>
                <li className="flex items-center gap-2"><span className="text-white/70">○</span> Протестировать полный Путь A и Путь B</li>
              </ul>
            </div>
            <div className="h-px bg-white/[0.06]" />
            <div className="flex flex-col gap-2">
              <p className="text-sm text-white font-bold uppercase tracking-widest font-mono">Следующие этапы (запуск возможен без них)</p>
              <ul className="flex flex-col gap-1 text-white">
                <li className="flex items-center gap-2"><span className="text-white/50">○</span> Контроль продления подписки</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Таймаут <code>pending_payment</code> — 30 мин резерв, <code>checkout.session.expired</code> освобождает автоматически</li>
                <li className="flex items-center gap-2"><span className="text-white/50">○</span> Автоматическое создание VPS через Contabo API</li>
                <li className="flex items-center gap-2"><span className="text-white/50">○</span> Автопополнение пула (cron, velocity-based)</li>
                <li className="flex items-center gap-2"><span className="text-white/50">○</span> Email-алёрт при снижении запаса заранее (при N серверах)</li>
              </ul>
            </div>
            <div className="h-px bg-white/[0.06]" />
            <div className="flex flex-col gap-3">
              <p className="text-xs text-yellow-500 uppercase tracking-widest font-mono">⚠ Известный дефект — требует исправления до масштабирования</p>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex flex-col gap-2 text-sm text-yellow-100/70 leading-relaxed">
                <p className="font-semibold text-yellow-300">TempToken пингует сервер вместо пользовательского токена (Путь A)</p>
                <p>
                  После bootstrap кронтаб на сервере настроен с <strong className="text-yellow-200">TempToken</strong> (администраторский, создаётся при Bootstrap).
                  При продаже сервера (Путь A) пользователь получает свой <strong className="text-yellow-200">ServerToken</strong>, но он никогда не устанавливается на сервер —
                  кронтаб продолжает пинговать с TempToken.
                </p>
                <p>
                  <strong className="text-yellow-300">Последствия:</strong>
                </p>
                <ul className="flex flex-col gap-1 pl-3 list-disc">
                  <li><code className="text-yellow-200">lastPingAt</code> у пользовательского ServerToken навсегда остаётся <code>null</code></li>
                  <li>Email-предупреждение за 7 дней до истечения подписки никогда не отправляется (проверка привязана к пользовательскому токену)</li>
                  <li>Любой будущий UI «сервер онлайн/офлайн» покажет офлайн для пользователя</li>
                </ul>
                <p>
                  <strong className="text-yellow-300">Решение (не реализовано):</strong> при продаже сервера в Stripe webhook (Path A) — SSH на сервер
                  и заменить токен в кронтабе на пользовательский. Либо хранить оба токена в <code>/etc/fractera/secrets.env</code>
                  и пинговать оба. Либо при первом пинге TempToken — проверять, продан ли сервер, и обновлять кронтаб через API.
                </p>
              </div>
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
        {/* Статусы: available (не настроен) → provisioning (bootstrap идёт) → ready (готов к продаже)
            → pending_payment (зарезервирован под Stripe-сессию, 30 мин) → paid (продан).
            Таблица обновляется каждые 5 секунд. При истечении Stripe-сессии сервер
            автоматически возвращается в ready. */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-mono font-bold text-white uppercase tracking-widest">Пул серверов</h2>
            <div className="flex gap-3 text-xs text-white">
              <span>Готово: <strong className="text-green-400">{counts.ready}</strong></span>
              {counts.provisioning > 0 && <span>Настраивается: <strong className="text-blue-400">{counts.provisioning}</strong></span>}
              {counts.pending > 0 && <span>Зарезервировано: <strong className="text-yellow-400">{counts.pending}</strong></span>}
            </div>
          </div>

          {servers.length === 0 ? (
            <div className="bg-white/[0.04] border border-white/40 rounded-2xl p-6 text-sm text-white/70 text-center">
              Пул пуст — добавьте сервер ниже
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/40">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/40 text-sm text-white font-bold uppercase tracking-widest">
                    <th className="text-left px-4 py-3 font-normal">IP</th>
                    <th className="text-left px-4 py-3 font-normal">Пароль</th>
                    <th className="text-left px-4 py-3 font-normal">Субдомен</th>
                    <th className="text-left px-4 py-3 font-normal">Статус</th>
                    <th className="px-4 py-3 font-normal" />
                  </tr>
                </thead>
                <tbody>
                  {servers.map(s => {
                    return (
                      <tr key={s.id} className="border-b border-white/25 last:border-0 hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-mono text-white font-semibold">{s.ip}</td>
                        <td className="px-4 py-3 font-mono text-white font-semibold text-xs">{s.password}</td>
                        <td className="px-4 py-3 font-mono text-white text-xs">
                          {s.subdomain
                            ? <a href={`https://${s.subdomain}`} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">{s.subdomain}</a>
                            : <span className="text-white/30">—</span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full border w-fit ${
                              s.status === 'ready'
                                ? 'text-green-400 border-green-500/30 bg-green-500/10'
                                : s.status === 'provisioning'
                                ? 'text-blue-400 border-blue-500/30 bg-blue-500/10'
                                : s.status === 'available'
                                ? 'text-white/60 border-white/20 bg-white/[0.04]'
                                : 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
                            }`}>
                              {s.status === 'ready' ? 'Готов'
                                : s.status === 'provisioning' ? 'Настраивается…'
                                : s.status === 'available' ? 'Не настроен'
                                : 'Зарезервирован'}
                            </span>
                            {s.status === 'pending_payment' && s.reservedUntil && (
                              <Countdown reservedUntil={s.reservedUntil} />
                            )}
                            {s.status === 'provisioning' && provisioningStart.current.has(s.id) && (
                              <ElapsedTimer startedAt={provisioningStart.current.get(s.id)!} />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {s.status === 'available' && (
                            <div className="flex flex-col gap-1">
                              <button
                                type="button"
                                onClick={() => handleBootstrap(s.id)}
                                disabled={bootstrapping.has(s.id)}
                                className="text-xs text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                {bootstrapping.has(s.id) ? 'Запускаю…' : 'Bootstrap'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(s.id)}
                                disabled={deleting.has(s.id)}
                                className="text-xs text-red-400/70 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                {deleting.has(s.id) ? 'Удаляю…' : 'Удалить'}
                              </button>
                            </div>
                          )}
                          {s.status === 'provisioning' && (
                            <div className="flex flex-col gap-1">
                              <button
                                type="button"
                                onClick={() => handleRecover(s.id)}
                                disabled={recovering.has(s.id)}
                                className="text-xs text-white/70 hover:text-white border border-white/30 hover:border-white/50 disabled:opacity-50 px-2 py-1 rounded-lg transition-colors"
                              >
                                {recovering.has(s.id) ? 'Проверяю…' : 'Восстановить'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReset(s.id)}
                                disabled={resetting.has(s.id)}
                                className="text-xs text-red-400/70 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 disabled:opacity-50 px-2 py-1 rounded-lg transition-colors"
                              >
                                {resetting.has(s.id) ? 'Сброс…' : 'Сбросить'}
                              </button>
                            </div>
                          )}
                          {s.status === 'pending_payment' && (
                            <button
                              type="button"
                              onClick={() => handleRelease(s.id)}
                              className="text-xs text-white hover:text-white border border-white/40 hover:border-white/20 px-2 py-1 rounded-lg transition-colors"
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
          <div className="bg-white/[0.04] border border-white/40 rounded-2xl p-6 flex flex-col gap-4">
            <p className="text-sm text-white font-bold uppercase tracking-widest font-mono">Добавить сервер</p>
            <form onSubmit={handleAdd} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <input
                  required
                  placeholder="IP-адрес"
                  value={addForm.ip}
                  onChange={e => setAddForm(f => ({ ...f, ip: e.target.value }))}
                  className="bg-white/[0.06] border border-white/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-400 outline-none focus:border-white/70 transition-colors"
                />
                <input
                  placeholder="Логин (root)"
                  value={addForm.login}
                  onChange={e => setAddForm(f => ({ ...f, login: e.target.value }))}
                  className="bg-white/[0.06] border border-white/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-400 outline-none focus:border-white/70 transition-colors"
                />
                <input
                  required
                  placeholder="Пароль"
                  value={addForm.password}
                  onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))}
                  className="bg-white/[0.06] border border-white/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-400 outline-none focus:border-white/70 transition-colors"
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
        {/* Пользователи оплатили подписку когда пул был пуст. Нужно добавить сервер
            в пул, запустить Bootstrap (ждать ~20 мин), затем нажать «Назначить» —
            система отправит Письмо 1 и запустит bootstrap.sh на выбранном сервере. */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-mono font-bold text-white uppercase tracking-widest">
            Ожидают сервер (Путь B)
            {queued.length > 0 && (
              <span className="ml-2 text-red-400 normal-case">— {queued.length} пользователей</span>
            )}
          </h2>

          {queued.length === 0 ? (
            <div className="bg-white/[0.04] border border-white/40 rounded-2xl p-6 text-sm text-white/70 text-center">
              Нет пользователей в очереди
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-red-500/20">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/40 text-sm text-white font-bold uppercase tracking-widest">
                    <th className="text-left px-4 py-3 font-normal">Email</th>
                    <th className="text-left px-4 py-3 font-normal">Тариф</th>
                    <th className="text-left px-4 py-3 font-normal">Дата оплаты</th>
                    <th className="px-4 py-3 font-normal" />
                  </tr>
                </thead>
                <tbody>
                  {queued.map(q => (
                    <tr key={q.id} className="border-b border-white/25 last:border-0">
                      <td className="px-4 py-3 text-white font-semibold">{q.email ?? '—'}</td>
                      <td className="px-4 py-3 text-white">{q.planId ?? '—'}</td>
                      <td className="px-4 py-3 text-white font-medium">{fmtDateTime(q.paidAt)}</td>
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

        {/* ─── История продаж (поиск по email) ───────────────────────────── */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-mono font-bold text-white uppercase tracking-widest">История продаж</h2>
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="email"
              placeholder="Email пользователя"
              value={searchEmail}
              onChange={e => setSearchEmail(e.target.value)}
              className="flex-1 bg-white/[0.06] border border-white/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-400 outline-none focus:border-white/70 transition-colors"
            />
            <button
              type="submit"
              disabled={searchLoading}
              className="bg-white/[0.08] hover:bg-white/[0.15] border border-white/40 hover:border-white/60 text-white font-bold px-5 py-2.5 rounded-xl text-base transition-colors disabled:opacity-50"
            >
              {searchLoading ? 'Поиск…' : 'Найти'}
            </button>
          </form>

          {searchResults !== null && (
            searchResults.length === 0 ? (
              <p className="text-sm text-white/70">Нет результатов для «{searchEmail}»</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/40">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/40 text-sm text-white font-bold uppercase tracking-widest">
                      <th className="text-left px-4 py-3 font-normal">IP</th>
                      <th className="text-left px-4 py-3 font-normal">Дата оплаты</th>
                      <th className="text-left px-4 py-3 font-normal">Subdomain</th>
                      <th className="text-left px-4 py-3 font-normal">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map(r => (
                      <tr key={r.id} className="border-b border-white/25 last:border-0">
                        <td className="px-4 py-3 font-mono text-white font-semibold">{r.ip ?? '—'}</td>
                        <td className="px-4 py-3 text-white font-medium">{fmtDateTime(r.paidAt)}</td>
                        <td className="px-4 py-3 text-white">{r.subdomain ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-white">{r.status}</span>
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
