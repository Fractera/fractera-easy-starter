'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { signIn } from 'next-auth/react'

type Lang = 'en' | 'ru'
type State =
  | 'presentation'
  | 'signup'
  | 'waiting'
  | 'post-activation'
  | 'deploying'
  | 'deploy-done'
  | 'deploy-error'

const LS_TOKEN = 'fractera_embed_light_token'
const LS_STATE = 'fractera_embed_light_state'
const LS_EMAIL = 'fractera_embed_light_email'
const LS_SESSION_ID = 'fractera_embed_light_session_id'
const LS_IP = 'fractera_embed_light_ip'
const POLL_ACTIVATION_MS = 3000
const POLL_PROGRESS_MS = 3000

const FALLBACK_PROVIDER_URL = 'https://contabo.com/en/vps/cloud-vps-10/?image=ubuntu.332&qty=1&contract=12&storage-type=cloud-vps-10-150-gb-ssd'

// ───────────────────────────────────────────────────────────────────────────
// All UI text, RU + EN
function getTexts(lang: Lang) {
  const isRu = lang === 'ru'
  return {
    label: isRu ? 'Начать' : 'Get Started',
    h2: isRu ? 'Разверните приватную AI-инфраструктуру на своём сервере' : 'Deploy Private AI Infrastructure on Your Own Server',
    description: isRu
      ? 'Установите Fractera на свой VPS и получите полную среду AI-разработки — полностью бесплатно и open source.'
      : 'Install Fractera on your own VPS and get the full AI development environment — completely free and open source.',
    serverLabel: isRu ? 'Где купить' : 'Where to buy',
    serverHeader: isRu ? 'Рекомендуемый Ubuntu 24.04 VPS-провайдер для AI' : 'Recommended Ubuntu 24.04 VPS Provider for AI Workloads',
    serverDescription: isRu
      ? 'Fractera устанавливается на любой VPS с Ubuntu 24.04, 4 ядрами и 6 ГБ RAM.'
      : 'Fractera installs on any Ubuntu 24.04 VPS with 4 cores and 6 GB RAM.',
    providerPrice: isRu ? 'от 3,60 €/мес' : 'from €3.60/mo',

    freeBadge: isRu ? 'ВАШ СЕРВЕР' : 'YOUR OWN SERVER',
    freeSub: isRu ? 'Бесплатно — установка на VPS' : 'Free — install on your VPS',
    features: isRu ? [
      'Hermes — AI-оркестратор агентов',
      '5 платформ для кода',
      'LightRAG — мозг компании',
      'База данных, файлы, auth — из коробки',
      'Open source — навсегда на своём сервере',
    ] : [
      'Hermes — AI orchestration agent',
      '5 coding platforms',
      'LightRAG — the company brain',
      'Database, file storage & auth — built in',
      'Open source — self-hosted forever',
    ],
    trust: isRu ? ['Ваш сервер', 'Ваш домен', 'Ваш AI'] : ['Your server', 'Your domain', 'Your AI'],

    deployButton: isRu ? 'Нажмите, чтобы подтвердить ваш email' : 'Click to verify your email',
    deployHint: isRu ? 'Email будет использоваться для развёртывания проекта.' : 'Your email will be used to deploy the project.',
    buyVpsAt: (provider: string) => isRu ? `Купить VPS у ${provider}` : `Buy VPS at ${provider}`,
    buyVpsGeneric: isRu ? 'Купить VPS' : 'Buy VPS',

    // Signup modal
    signupTitle: isRu ? 'Бесплатная регистрация' : 'Free sign-up',
    signupSubtitle: isRu ? 'Email — единственное, что нужно. Пришлём ссылку для активации.' : 'Email is all we need. We will send you an activation link.',
    emailPlaceholder: 'you@example.com',
    submit: isRu ? 'Получить ссылку для активации' : 'Send activation link',
    submitting: isRu ? 'Отправляем…' : 'Sending…',
    cancel: isRu ? 'Отмена' : 'Cancel',
    invalidEmail: isRu ? 'Введите корректный email' : 'Please enter a valid email',
    sendFailed: isRu ? 'Не удалось отправить. Попробуйте ещё раз.' : 'Sending failed. Please try again.',

    // Waiting state
    waitingTitle: isRu ? 'Письмо отправлено' : 'Email sent',
    waitingBody: (email: string) => isRu
      ? `Мы отправили ссылку для активации на ${email}. Кликните по ней — окно автоматически обновится.`
      : `We sent an activation link to ${email}. Click it and this window will update automatically.`,
    waitingHint: isRu ? 'Проверьте папку «Спам», если не видите письмо.' : 'Check the spam folder if you do not see the email.',

    // Post-activation
    activatedTitle: isRu ? 'Спасибо за регистрацию' : 'Thanks for signing up',
    activatedBody: isRu
      ? 'Теперь нажмите кнопку ниже, чтобы перейти к покупке сервера. Когда сервер будет готов — возвращайтесь сюда и впишите данные для развёртывания.'
      : 'Now click the button below to buy your server. Once it is ready, come back here and enter the credentials to start deployment.',

    // Install form
    installTitle: isRu ? 'Развёртывание Fractera' : 'Deploy Fractera',
    installSubtitle: isRu
      ? 'Введите IP-адрес и root-пароль вашего нового VPS.'
      : 'Enter the IP address and root password of your new VPS.',
    ipLabel: isRu ? 'IP-адрес сервера' : 'Server IP address',
    passwordLabel: isRu ? 'Root-пароль' : 'Root password',
    deployStart: isRu ? 'Запустить развёртывание' : 'Start deployment',
    deployStarting: isRu ? 'Запускаем…' : 'Starting…',
    installKickoffFailed: isRu ? 'Не удалось запустить развёртывание.' : 'Failed to start deployment.',
    installMissingFields: isRu ? 'Введите IP и пароль.' : 'Please enter both IP and password.',

    // Deploying (with progress)
    deployingTitle: isRu ? 'Развёртывание идёт' : 'Deployment in progress',
    deployingBody: isRu
      ? 'Установка занимает несколько минут. Это окно можно закрыть — деплой продолжится на сервере, результат придёт на email. После закрытия вы сможете запустить развёртывание ещё одного сервера.'
      : 'Setup takes a few minutes. You can close this window — the deploy keeps running on the server and the result arrives by email. After closing, you can launch deployment for another server.',
    deployingActive: isRu ? 'Сейчас:' : 'Now:',
    dashboardInfoPre: isRu ? 'Больше информации — в личном кабинете для ' : 'More info in your dashboard for ',
    dashboardInfoMid: isRu ? ' на ' : ' at ',
    deployAnother: isRu ? 'Развернуть ещё один сервер' : 'Deploy another server',
    closeModal: isRu ? 'Закрыть' : 'Close',
    saveTokenNote: isRu
      ? 'Сохраните server_token — пригодится для восстановления через AI-агента, если деплой прервётся:'
      : 'Save the server_token below — it lets you recover the deploy via an AI agent if anything breaks:',

    // Deploy done
    doneTitle: isRu ? 'Развёртывание завершено' : 'Deployment complete',
    doneBody: (subdomain: string | null) => isRu
      ? subdomain
        ? `Ваш сервер готов: ${subdomain}. Подробности — на email.`
        : 'Сервер готов. Подробности с URL и доступами уже на email.'
      : subdomain
        ? `Your server is live: ${subdomain}. Full details are in your email.`
        : 'Your server is ready. Full URLs and credentials are in your email.',
    doneHint: isRu ? 'Проверьте папку «Спам», если письма не во входящих.' : 'Check the spam folder if the email is not in your inbox.',
    yourApp: isRu ? 'Ваше приложение' : 'Your app',
    controlPanel: isRu ? 'Панель управления приложением' : 'Control panel',
    allServersPre: isRu ? 'Все ваши серверы — на ' : 'All your servers are at ',
    allServersMid: isRu ? ', войдите с email ' : ' — sign in with email ',

    // Deploy error
    errorTitle: isRu ? 'Развёртывание не удалось' : 'Deployment failed',
    errorBody: isRu
      ? 'Не удалось подключиться к вашему серверу или установить ПО. Чаще всего причина — опечатка в IP или пароле. Проверьте данные и попробуйте снова.'
      : 'We could not connect to your server or run the install. The most common cause is a typo in the IP or password. Check the data and try again.',
    errorRetry: isRu ? 'Изменить данные и повторить' : 'Edit data and retry',
    errorDetails: isRu ? 'Сообщение от сервера' : 'Server message',
    errorMcpPre: isRu ? 'или ' : 'or ',
    errorMcpLink: isRu ? 'запустите развёртывание через AI-агента (MCP)' : 'launch deployment via an AI agent (MCP)',
    errorMcpPost: isRu ? ' — он сможет сам устранить ошибку.' : ' — it can fix the error itself.',
    mcpRecoveryTitle: isRu ? 'Восстановление через AI-агента' : 'Recover via AI agent',
    mcpRecoveryBody: isRu
      ? 'Скопируйте этот server_token и вставьте его в чат с AI-агентом (Claude Code, Codex, Gemini CLI), у которого подключён Fractera MCP. Агент сам запустит retry_deploy и доведёт развёртывание до конца.'
      : 'Copy this server_token and paste it into your AI agent (Claude Code, Codex, Gemini CLI) with the Fractera MCP enabled. The agent will call retry_deploy and finish the deployment for you.',
    mcpRecoveryTokenLabel: isRu ? 'Ваш server_token' : 'Your server_token',
    mcpRecoveryCopy: isRu ? 'Скопировать' : 'Copy',
    mcpRecoveryLearn: isRu ? 'Что такое Fractera MCP →' : 'What is Fractera MCP →',
    mcpHelpHint: isRu
      ? '* Никогда не использовали MCP? Просто спросите ваш AI-агент (Claude, Codex, Gemini): «как мне подключить Fractera MCP?» — он подскажет настройку в своём интерфейсе, занимает ~15 секунд.'
      : '* Never used MCP before? Just ask your AI agent (Claude, Codex, Gemini): "how do I connect Fractera MCP to you?" — it will walk you through setup in its own interface, takes ~15 seconds.',
  }
}

// ───────────────────────────────────────────────────────────────────────────
type ProgressStep = { id: string; label: string; done: boolean; ts: number; skipped?: boolean }
type ProgressData = {
  status: 'installing' | 'done' | 'error'
  steps: ProgressStep[]
  subdomain?: string
  error?: string
  server_token?: string
}

export function EmbedFlowLight({ lang, partnerSlug, providerName, affiliateUrl }: {
  lang: Lang
  partnerSlug: string | null
  providerName: string | null
  affiliateUrl: string | null
}) {
  const t = getTexts(lang)

  // ── State ──
  const [state, setStateRaw] = useState<State>('presentation')
  const [email, setEmail] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [embedToken, setEmbedToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // Install / deployment
  const [ip, setIp] = useState('')
  const [password, setPassword] = useState('')
  const [deploySessionId, setDeploySessionId] = useState<string | null>(null)
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [deployError, setDeployError] = useState<string | null>(null)

  // Polling refs
  const activationPollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressPollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const setState = useCallback((next: State) => {
    setStateRaw(next)
    try { localStorage.setItem(LS_STATE, next) } catch {}
  }, [])

  // ── Restore from localStorage ──
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(LS_TOKEN)
      const savedState = localStorage.getItem(LS_STATE) as State | null
      const savedEmail = localStorage.getItem(LS_EMAIL)
      const savedSessionId = localStorage.getItem(LS_SESSION_ID)
      const savedIp = localStorage.getItem(LS_IP)
      if (savedToken) setEmbedToken(savedToken)
      if (savedEmail) setSubmittedEmail(savedEmail)
      if (savedSessionId) setDeploySessionId(savedSessionId)
      if (savedIp) setIp(savedIp)
      if (savedState && savedState !== 'presentation' && savedState !== 'signup') {
        setStateRaw(savedState)
      }
    } catch {}
  }, [])

  // ── Polling: account activation ──
  useEffect(() => {
    if (state !== 'waiting' || !embedToken) return
    let cancelled = false
    async function poll() {
      try {
        const res = await fetch(`/api/embed/check-activation?token=${encodeURIComponent(embedToken!)}`)
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        if (data.activated) setState('post-activation')
      } catch {}
    }
    poll()
    activationPollRef.current = setInterval(poll, POLL_ACTIVATION_MS)
    return () => {
      cancelled = true
      if (activationPollRef.current) clearInterval(activationPollRef.current)
    }
  }, [state, embedToken, setState])

  // ── Polling: deployment progress ──
  useEffect(() => {
    if (state !== 'deploying' || !deploySessionId) return
    let cancelled = false
    async function poll() {
      try {
        const res = await fetch(`/api/progress?session_id=${encodeURIComponent(deploySessionId!)}`)
        if (!res.ok) return
        const data: ProgressData = await res.json()
        if (cancelled) return
        setProgress(data)
        if (data.status === 'done') {
          setState('deploy-done')
        } else if (data.status === 'error') {
          setDeployError(data.error ?? 'Unknown error')
          setState('deploy-error')
        }
      } catch {}
    }
    poll()
    progressPollRef.current = setInterval(poll, POLL_PROGRESS_MS)
    return () => {
      cancelled = true
      if (progressPollRef.current) clearInterval(progressPollRef.current)
    }
  }, [state, deploySessionId, setState])

  // ── Handlers ──
  async function handleSubmitEmail(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const trimmed = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError(t.invalidEmail)
      return
    }
    setBusy(true)
    try {
      const startRes = await fetch('/api/embed/start-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, ref: partnerSlug }),
      })
      if (!startRes.ok) {
        setError(t.sendFailed)
        return
      }
      const startData = await startRes.json()
      const token = startData.embedToken as string

      const signInResult = await signIn('resend', {
        email: trimmed,
        callbackUrl: `/${lang}/embed/callback`,
        redirect: false,
      })
      if (signInResult?.error) {
        setError(t.sendFailed)
        return
      }

      try {
        localStorage.setItem(LS_TOKEN, token)
        localStorage.setItem(LS_EMAIL, trimmed)
      } catch {}

      setEmbedToken(token)
      setSubmittedEmail(trimmed)
      setState('waiting')
    } catch {
      setError(t.sendFailed)
    } finally {
      setBusy(false)
    }
  }

  function handleDeploy(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!ip.trim() || !password.trim()) {
      setError(t.installMissingFields)
      return
    }
    if (!embedToken) {
      setError(t.installKickoffFailed)
      return
    }
    // Client-generated session id so the progress poller can start at once.
    const sessionId = `light-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    try {
      localStorage.setItem(LS_SESSION_ID, sessionId)
      localStorage.setItem(LS_IP, ip.trim())
    } catch {}
    setDeploySessionId(sessionId)
    setProgress(null)
    setDeployError(null)
    setState('deploying')
    // Fire-and-forget: the server function keeps running the SSH upload to
    // completion (Vercel keeps it alive until deployToServer resolves).
    // Awaiting it here would freeze the UI on 'Starting…' for the whole SSH
    // phase. The progress poller tracks the real outcome via /api/progress.
    fetch('/api/embed/install/light', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: embedToken, ip: ip.trim(), password, sessionId }),
    }).catch(() => {})
  }

  function retryFromError() {
    setProgress(null)
    setDeployError(null)
    setDeploySessionId(null)
    try { localStorage.removeItem(LS_SESSION_ID) } catch {}
    // Keep IP + password populated for typo fix
    setState('post-activation')
  }

  // Dismiss any deployment modal (deploying / deploy-done / deploy-error).
  // The deploy keeps running server-side; user receives email with the result.
  // Closing just unlocks the UI so they can deploy another server. Clearing
  // LS_SESSION_ID/LS_IP prevents the previous session's modal from re-appearing
  // on next visit.
  function dismissDeploymentModal() {
    setProgress(null)
    setDeployError(null)
    setDeploySessionId(null)
    setIp('')
    setPassword('')
    try {
      localStorage.removeItem(LS_SESSION_ID)
      localStorage.removeItem(LS_IP)
    } catch {}
    setState('post-activation')
  }

  function cancelToPresentation() {
    setError(null)
    setState('presentation')
  }

  // ── Computed ──
  const buyButtonLabel = providerName ? t.buyVpsAt(providerName) : t.buyVpsGeneric
  const partnerUrl = affiliateUrl ?? FALLBACK_PROVIDER_URL

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-8">

        {/* ── PRESENTATION (mirror of landing pricing-flow section) ── */}
        <div className="w-full flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            <div className="flex flex-col gap-6 items-start text-left h-full">
              <div className="flex flex-col gap-3">
                <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{t.label}</p>
                <h2 className="font-serif font-bold leading-tight text-white text-2xl md:text-3xl lg:text-4xl">{t.h2}</h2>
                <p className="text-base text-white/60">{t.description}</p>
              </div>

              <div className="flex flex-col gap-3 w-full pt-4 border-t border-white/10 mt-auto">
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{t.serverLabel}</p>
                  <h3 className="text-base font-bold font-serif text-white">{t.serverHeader}</h3>
                  <p className="text-xs text-white/50 leading-relaxed">{t.serverDescription}</p>
                </div>
                <a
                  href={partnerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full flex items-center justify-between gap-3 rounded-xl border border-white/20 hover:border-violet-500/60 bg-white/[0.03] hover:bg-violet-500/[0.06] px-5 py-4 transition-all"
                >
                  <span className="flex flex-col gap-0.5">
                    <span className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">{providerName ?? 'Contabo'}</span>
                    {!affiliateUrl && <span className="text-xs text-white/60 font-medium">{t.providerPrice}</span>}
                  </span>
                  <span className="shrink-0 text-white/60 group-hover:text-violet-300 text-base font-bold transition-colors">↗</span>
                </a>
              </div>
            </div>

            <div id="light-card" className="flex flex-col gap-4 rounded-2xl p-6 bg-gradient-to-br from-emerald-950/70 via-emerald-900/30 to-black/60 border border-emerald-500/60 h-full">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 self-start">{t.freeBadge}</span>
                <h3 className="text-xl font-bold text-white mt-1">Fractera Free</h3>
                <p className="text-sm text-emerald-300/70 font-medium">{t.freeSub}</p>
              </div>
              <ul className="flex flex-col gap-1.5 text-sm text-white font-medium flex-1">
                {t.features.slice(0, 4).map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><span className="text-emerald-400">✓</span><span>{f}</span></li>
                ))}
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 shrink-0 mt-0.5">◈</span>
                  <span className="text-white">{t.features[4]}</span>
                </li>
              </ul>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (state === 'presentation') setState('signup')
                  }}
                  disabled={state !== 'presentation'}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/40 text-white font-bold px-6 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-emerald-500/30"
                >
                  {t.deployButton} →
                </button>
                <p className="text-xs text-white/50 text-center leading-relaxed">{t.deployHint}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {t.trust.map((item, i) => (
              <div key={i} className="flex items-center justify-center py-3 px-4 rounded-xl border border-white/15 bg-white/[0.03] text-sm font-bold text-white text-center tracking-wide">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SIGNUP MODAL ── */}
      {state === 'signup' && (
        <Overlay onClose={cancelToPresentation}>
          <form onSubmit={handleSubmitEmail} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold text-white font-serif">{t.signupTitle}</h2>
              <p className="text-sm text-white/60 leading-relaxed">{t.signupSubtitle}</p>
            </div>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              disabled={busy}
              required
              className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-base text-white placeholder-white/30 focus:outline-none focus:border-violet-500/70 disabled:opacity-50"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy || !email.trim()}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl text-base transition-colors"
              >
                {busy ? <><span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{t.submitting}</> : <>{t.submit} →</>}
              </button>
              <button
                type="button"
                onClick={cancelToPresentation}
                disabled={busy}
                className="text-sm font-semibold text-white/60 hover:text-white border border-white/20 px-4 py-3 rounded-xl transition-colors"
              >
                {t.cancel}
              </button>
            </div>
          </form>
        </Overlay>
      )}

      {/* ── WAITING FOR ACTIVATION ── */}
      {state === 'waiting' && (
        <Overlay onClose={cancelToPresentation}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-block w-5 h-5 border-2 border-violet-500/40 border-t-violet-300 rounded-full animate-spin" />
              <h2 className="text-xl font-bold text-white font-serif">{t.waitingTitle}</h2>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">{t.waitingBody(submittedEmail)}</p>
            <p className="text-xs text-amber-300/80">{t.waitingHint}</p>
            <button
              type="button"
              onClick={cancelToPresentation}
              className="self-start text-xs font-semibold text-white/50 hover:text-white border border-white/20 px-3 py-1.5 rounded transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        </Overlay>
      )}

      {/* ── POST-ACTIVATION (CTA + install form) ── */}
      {state === 'post-activation' && (
        <Overlay>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 text-xl leading-none">✓</span>
                <h2 className="text-xl font-bold text-white font-serif">{t.activatedTitle}</h2>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">{t.activatedBody}</p>
            </div>

            <a
              href={partnerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-violet-500/30"
            >
              {buyButtonLabel} ↗
            </a>

            <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold text-white">{t.installTitle}</h3>
                <p className="text-xs text-white/60">{t.installSubtitle}</p>
              </div>
              <form onSubmit={handleDeploy} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">{t.ipLabel}</label>
                  <input
                    type="text"
                    value={ip}
                    onChange={e => setIp(e.target.value)}
                    placeholder="123.45.67.89"
                    disabled={busy}
                    className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/70 font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">{t.passwordLabel}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={busy}
                    className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/70 font-mono"
                  />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={busy || !ip.trim() || !password.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
                >
                  {busy ? <><span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{t.deployStarting}</> : <>{t.deployStart} →</>}
                </button>
              </form>
            </div>
          </div>
        </Overlay>
      )}

      {/* ── DEPLOYING (with progress polling) ── */}
      {state === 'deploying' && (
        <Overlay onClose={dismissDeploymentModal}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-block w-5 h-5 border-2 border-violet-500/40 border-t-violet-300 rounded-full animate-spin" />
              <h2 className="text-xl font-bold text-white font-serif">{t.deployingTitle}</h2>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">{t.deployingBody}</p>
            <ProgressList progress={progress} t={t} />
            {progress?.server_token && (
              <div className="flex flex-col gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
                <p className="text-[11px] text-white/55 leading-relaxed">{t.saveTokenNote}</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-[11px] font-mono text-violet-200 break-all select-all">{progress.server_token}</code>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(progress.server_token ?? '').catch(() => {})}
                    className="shrink-0 text-[10px] font-semibold text-white/60 hover:text-white border border-white/15 hover:border-white/40 px-2 py-0.5 rounded transition-colors"
                  >
                    {t.mcpRecoveryCopy}
                  </button>
                </div>
              </div>
            )}
            <p className="text-xs text-white/40 leading-relaxed">
              {t.dashboardInfoPre}
              <strong className="text-white/65">{submittedEmail}</strong>
              {t.dashboardInfoMid}
              <a href="https://fractera.ai" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 transition-colors">fractera.ai</a>
            </p>
            <button
              type="button"
              onClick={dismissDeploymentModal}
              className="self-start text-xs font-semibold text-white/60 hover:text-white border border-white/20 px-3 py-1.5 rounded transition-colors"
            >
              {t.closeModal}
            </button>
          </div>
        </Overlay>
      )}

      {/* ── DEPLOY DONE ── */}
      {state === 'deploy-done' && (
        <Overlay onClose={dismissDeploymentModal}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 text-2xl leading-none">✓</span>
              <h2 className="text-xl font-bold text-white font-serif">{t.doneTitle}</h2>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">{t.doneBody(progress?.subdomain ?? null)}</p>
            <p className="text-xs text-amber-300/80">{t.doneHint}</p>
            {progress?.subdomain && (
              <div className="flex flex-col gap-2">
                <a
                  href={`https://${progress.subdomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
                >
                  {t.yourApp} ↗
                </a>
                <a
                  href={`https://${progress.subdomain}/admin`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 border border-violet-500/60 hover:border-violet-400 hover:bg-violet-500/10 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
                >
                  {t.controlPanel} ↗
                </a>
              </div>
            )}
            <p className="text-xs text-white/40 leading-relaxed">
              {t.allServersPre}
              <a href="https://fractera.ai" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 transition-colors">fractera.ai</a>
              {t.allServersMid}
              <strong className="text-white/65">{submittedEmail}</strong>
            </p>
            <button
              type="button"
              onClick={dismissDeploymentModal}
              className="self-start mt-2 inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              {t.deployAnother} →
            </button>
          </div>
        </Overlay>
      )}

      {/* ── DEPLOY ERROR ── */}
      {state === 'deploy-error' && (
        <Overlay onClose={dismissDeploymentModal}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-red-400 text-2xl leading-none">✗</span>
              <h2 className="text-xl font-bold text-white font-serif">{t.errorTitle}</h2>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">{t.errorBody}</p>
            {deployError && (
              <div className="flex flex-col gap-1.5 rounded-lg border border-red-500/30 bg-red-500/[0.05] p-3">
                <p className="text-xs font-mono font-bold text-red-300 uppercase tracking-widest">{t.errorDetails}</p>
                <p className="text-xs text-red-200 break-all whitespace-pre-wrap font-mono leading-relaxed">{deployError}</p>
              </div>
            )}
            <button
              type="button"
              onClick={retryFromError}
              className="self-start mt-2 inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              {t.errorRetry} →
            </button>
            {progress?.server_token && (
              <div className="flex flex-col gap-2 rounded-xl border border-violet-500/30 bg-violet-500/[0.04] p-4 mt-2">
                <p className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">{t.mcpRecoveryTitle}</p>
                <p className="text-xs text-white/70 leading-relaxed">{t.mcpRecoveryBody}</p>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold text-violet-300 uppercase tracking-widest">{t.mcpRecoveryTokenLabel}</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs font-mono text-violet-200 bg-black/40 border border-white/15 rounded px-2 py-1.5 break-all select-all">
                      {progress.server_token}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(progress.server_token ?? '').catch(() => {})
                      }}
                      className="shrink-0 text-xs font-semibold text-white/70 hover:text-white border border-white/20 hover:border-white/40 px-2 py-1.5 rounded transition-colors"
                    >
                      {t.mcpRecoveryCopy}
                    </button>
                  </div>
                </div>
                <a
                  href={`https://fractera.ai/${lang}#mcp-section`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-start text-xs text-violet-300 hover:text-violet-200 transition-colors"
                >
                  {t.mcpRecoveryLearn}
                </a>
                <p className="text-[11px] text-amber-300/80 leading-relaxed mt-1">{t.mcpHelpHint}</p>
              </div>
            )}
          </div>
        </Overlay>
      )}
    </main>
  )
}

// ───────────────────────────────────────────────────────────────────────────
function Overlay({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto bg-neutral-950 border border-white/15 rounded-2xl shadow-2xl p-6">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-base font-bold leading-none"
          >
            ×
          </button>
        )}
        {children}
      </div>
    </div>
  )
}

// ───────────────────────────────────────────────────────────────────────────
function ProgressList({ progress, t }: { progress: ProgressData | null; t: ReturnType<typeof getTexts> }) {
  if (!progress) {
    return (
      <p className="text-xs text-white/40 italic">{t.deployingActive} …</p>
    )
  }

  const steps = progress.steps ?? []
  const activeStep = steps.length > 0 && !steps[steps.length - 1].done ? steps[steps.length - 1] : null
  const doneCount = steps.filter(s => s.done).length
  // Fixed denominator — the bootstrap pipeline reports ~44 steps. Dividing by
  // the count of steps seen so far showed 100% when only the first step
  // (the email-sent marker) had arrived. Capped at 99% while deploying: the
  // poller flips the UI to deploy-done on status==='done', not via percent.
  const EXPECTED_STEPS = 44
  const percent = Math.min(99, Math.round((doneCount / EXPECTED_STEPS) * 100))

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-xs font-mono text-white/50 uppercase tracking-widest">
            {activeStep ? `${t.deployingActive} ${activeStep.label}` : `${t.deployingActive} …`}
          </p>
          <p className="text-xs font-mono text-white/40">{percent}%</p>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-violet-400 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      {steps.length > 0 && (
        <ul className="flex flex-col gap-1 max-h-40 overflow-y-auto">
          {steps.map(step => (
            <li key={step.id} className="flex items-center gap-2 text-xs">
              <span className={`w-4 text-center ${step.done ? 'text-emerald-400' : 'text-white/40'}`}>
                {step.done ? (step.skipped ? '—' : '✓') : '…'}
              </span>
              <span className={step.done ? 'text-white/70' : 'text-white/50'}>{step.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
