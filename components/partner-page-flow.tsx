'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { signIn } from 'next-auth/react'
import { PartnerDeployOptions } from './partner-deploy-options'
import { DomainDnsBlock } from './domain-dns-block'
import { ALL_COMPONENT_IDS, type ComponentId } from '@/lib/components-catalog'

type Lang = 'en' | 'ru'
type State =
  | 'presentation'
  | 'signup'
  | 'waiting'
  | 'activated'
  | 'deploying'
  | 'deploy-done'
  | 'deploy-error'

type PageLink = {
  id: string
  providerName: string
  affiliateUrl: string
  isDefault: boolean
  kind?: string
}

type PartnerData = {
  slug: string
  companyName: string | null
  companyEmail: string | null
  links: PageLink[]
}

type ProgressStep = { id: string; label: string; done: boolean; ts: number; skipped?: boolean }
type ProgressData = {
  status: 'installing' | 'done' | 'error'
  steps: ProgressStep[]
  subdomain?: string
  error?: string
  server_token?: string
}

const POLL_ACTIVATION_MS = 3000
const POLL_PROGRESS_MS = 30000
const LS_TOKEN = 'fractera_partner_token'
const LS_STATE = 'fractera_partner_state'
const LS_EMAIL = 'fractera_partner_email'
const LS_SESSION_ID = 'fractera_partner_session_id'
const LS_IP = 'fractera_partner_ip'
const LS_HOSTING_CLICKED = 'fractera_partner_hosting_clicked'

function getTexts(lang: Lang) {
  const isRu = lang === 'ru'
  return {
    label: isRu ? 'Начать' : 'Get Started',
    h2: isRu ? 'Разверните приватную AI-инфраструктуру на своём сервере' : 'Deploy Private AI Infrastructure on Your Own Server',
    description: isRu
      ? 'Установите Fractera на свой VPS и получите полную среду AI-разработки — полностью бесплатно и open source.'
      : 'Install Fractera on your own VPS and get the full AI development environment — completely free and open source.',

    serverLabel: isRu ? 'Где купить VPS' : 'Where to buy VPS',
    serverHeader: isRu ? 'Проверенные VPS-провайдеры для AI' : 'Recommended VPS Providers for AI',
    serverDescriptionPre: isRu
      ? 'Партнёр рекомендует следующих провайдеров. Чтобы продолжить — сначала подтвердите ваш email.'
      : 'The partner recommends the providers below. To continue — please verify your email first.',
    serverDescriptionPost: isRu
      ? 'Email подтверждён. Нажмите на провайдера, чтобы открыть его страницу — там вы оплатите VPS и получите доступы.'
      : 'Email verified. Click a provider to open its page — purchase your VPS there and receive credentials.',
    notConfiguredTitle: isRu ? 'Страница ещё не настроена' : 'Page not yet configured',
    notConfiguredBody: isRu
      ? 'Партнёр пока не подключил ни одной партнёрской ссылки.'
      : 'The partner has not connected any affiliate link yet.',

    domainLabel: isRu ? 'Где купить домен' : 'Where to buy a domain',
    domainHeader: isRu ? 'Рекомендуемые регистраторы доменов' : 'Recommended domain registrars',
    domainDescription: isRu
      ? 'Домен понадобится позже — для защищённого доступа (HTTPS) к вашему серверу на собственном домене.'
      : 'You will need a domain later — for secure (HTTPS) access to your server on your own domain.',

    freeBadge: isRu ? 'ВАШ СЕРВЕР' : 'YOUR OWN SERVER',
    freeSub: isRu ? 'Бесплатно — установка на VPS' : 'Free — install on your VPS',
    trust: isRu ? ['Ваш сервер', 'Ваш домен', 'Ваш AI'] : ['Your server', 'Your domain', 'Your AI'],

    verifyEmail: isRu ? 'Подтвердить email' : 'Verify your email',
    verifyHint: isRu
      ? 'Email будет использоваться для регистрации и развёртывания.'
      : 'Email is used for sign-up and deployment.',

    scenarioTitle: isRu ? 'Как это работает' : 'How it works',
    scenarioSteps: isRu ? [
      'Подтвердите email — пришлём ссылку для активации.',
      'После клика по письму вернётесь сюда — кнопки покупки VPS станут активными.',
      'Купите сервер у одного из проверенных провайдеров.',
      'Впишите IP и пароль сервера здесь — мы развернём Fractera.',
    ] : [
      'Verify your email — we send an activation link.',
      'Click the link, you return here — the buy-VPS buttons become active.',
      'Buy a server from one of the trusted providers.',
      'Enter the server IP and password here — we deploy Fractera for you.',
    ],

    // Activated — install form
    activatedTitle: isRu ? 'Email подтверждён' : 'Email verified',
    installSubtitle: isRu
      ? 'Купили VPS? Введите IP-адрес и доступы вашего сервера — мы развернём на нём Fractera.'
      : 'Bought a VPS? Enter your server IP and credentials — we will deploy Fractera onto it.',
    ipLabel: isRu ? 'IP-адрес сервера' : 'Server IP address',
    loginLabel: isRu ? 'Имя пользователя' : 'Login',
    passwordLabel: isRu ? 'Пароль' : 'Password',
    deployStart: isRu ? 'Развернуть сервер' : 'Deploy server',
    deployStarting: isRu ? 'Запускаем…' : 'Starting…',
    installKickoffFailed: isRu ? 'Не удалось запустить развёртывание.' : 'Failed to start deployment.',
    installMissingFields: isRu ? 'Введите IP, имя пользователя и пароль.' : 'Enter IP, login and password.',

    // Deploying
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
      ? 'Не удалось подключиться к серверу или установить ПО. Чаще всего причина — опечатка в IP или пароле. Проверьте данные и попробуйте снова.'
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
    mcpRecoveryCopied: isRu ? 'Скопировано' : 'Copied',
    mcpRecoveryLearn: isRu ? 'Что такое Fractera MCP →' : 'What is Fractera MCP →',

    // Signup modal
    signupTitle: isRu ? 'Бесплатная регистрация' : 'Free sign-up',
    signupSubtitle: isRu
      ? 'Введите email — пришлём ссылку для активации.'
      : 'Enter your email — we will send an activation link.',
    emailPlaceholder: 'you@example.com',
    submit: isRu ? 'Получить ссылку для активации' : 'Send activation link',
    submitting: isRu ? 'Отправляем…' : 'Sending…',
    cancel: isRu ? 'Отмена' : 'Cancel',
    invalidEmail: isRu ? 'Введите корректный email' : 'Please enter a valid email',
    sendFailed: isRu ? 'Не удалось отправить. Попробуйте ещё раз.' : 'Sending failed. Please try again.',

    // Waiting
    waitingTitle: isRu ? 'Письмо отправлено' : 'Email sent',
    waitingBody: (email: string) => isRu
      ? `Мы отправили ссылку для активации на ${email}. Кликните по ней — окно автоматически обновится.`
      : `We sent an activation link to ${email}. Click it and this window will update automatically.`,
    waitingHint: isRu ? 'Проверьте папку «Спам».' : 'Check the spam folder if needed.',

    primaryBadge: '★',
    open: '↗',

    // Block 4 — MCP deployment fallback
    mcpBlockLabel: isRu ? 'Развёртывание через AI-агента' : 'AI-agent deployment',
    mcpBlockTitle: isRu ? 'Что делать, если деплой не получился' : 'What to do if deploy fails',
    mcpBlockBody: isRu
      ? 'Если развёртывание не сработало или вы не хотите вводить IP и пароль вручную — единая ссылка ниже открывает развёртывание Fractera через любого AI-агента (Claude Code, Codex, Gemini CLI). Партнёрская комиссия по-прежнему будет начислена партнёру, к которому вы пришли — 45-day cookie хостинга уже зафиксировал клик.'
      : 'If the deploy failed, or you would rather not type the IP and password manually, the link below opens Fractera deployment through any AI agent (Claude Code, Codex, Gemini CLI). The partner commission still goes to the partner that brought you here — the hosting 45-day cookie has already locked in the click.',
    mcpBlockInactive: isRu ? 'Открыть развёртывание через MCP' : 'Open deployment via MCP',
    mcpBlockActive: isRu ? 'Открыть развёртывание через MCP →' : 'Open deployment via MCP →',
    mcpBlockTooltip: isRu
      ? 'Ссылка появится после того как вы перейдёте хотя бы на один из партнёрских хостингов выше.'
      : 'The link unlocks after you visit at least one of the partner hosting providers above.',
    mcpHelpHint: isRu
      ? '* Никогда не использовали MCP? Просто спросите ваш AI-агент (Claude, Codex, Gemini): «как мне подключить Fractera MCP?» — он подскажет настройку в своём интерфейсе, занимает ~15 секунд.'
      : '* Never used MCP before? Just ask your AI agent (Claude, Codex, Gemini): "how do I connect Fractera MCP to you?" — it will walk you through setup in its own interface, takes ~15 seconds.',
  }
}

type Texts = ReturnType<typeof getTexts>

export function PartnerPageFlow({ partner, lang }: { partner: PartnerData; lang: Lang }) {
  const t = getTexts(lang)
  const [state, setStateRaw] = useState<State>('presentation')
  const [email, setEmail] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [embedToken, setEmbedToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // Install / deployment
  const [ip, setIp] = useState('')
  const [login, setLogin] = useState('root')
  const [password, setPassword] = useState('')
  // Deploy options — parity with the live install form (S7):
  // password-change ack (step 78) + custom component selection (step 85).
  const [passwordAck, setPasswordAck] = useState(false)
  const [customMode, setCustomMode] = useState(false)
  const [selected, setSelected] = useState<ComponentId[]>(ALL_COMPONENT_IDS)
  const [deploySessionId, setDeploySessionId] = useState<string | null>(null)
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [deployError, setDeployError] = useState<string | null>(null)

  // Block 4 — MCP link unlocks after any hosting click (attribution is
  // already locked in the provider's 45-day cookie at that point).
  const [mcpUnlocked, setMcpUnlocked] = useState(false)

  const markHostingClicked = useCallback(() => {
    try { localStorage.setItem(LS_HOSTING_CLICKED, '1') } catch {}
    setMcpUnlocked(true)
  }, [])

  const activationPollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressPollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const setState = useCallback((next: State) => {
    setStateRaw(next)
    try { localStorage.setItem(LS_STATE, next) } catch {}
  }, [])

  // Restore from localStorage
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(LS_TOKEN)
      const savedState = localStorage.getItem(LS_STATE) as State | null
      const savedEmail = localStorage.getItem(LS_EMAIL)
      const savedSessionId = localStorage.getItem(LS_SESSION_ID)
      const savedIp = localStorage.getItem(LS_IP)
      const savedHostingClicked = localStorage.getItem(LS_HOSTING_CLICKED)
      if (savedToken) setEmbedToken(savedToken)
      if (savedEmail) setSubmittedEmail(savedEmail)
      if (savedSessionId) setDeploySessionId(savedSessionId)
      if (savedIp) setIp(savedIp)
      if (savedHostingClicked === '1') setMcpUnlocked(true)
      if (savedState && savedState !== 'presentation' && savedState !== 'signup') {
        setStateRaw(savedState)
      }
    } catch {}
  }, [])

  // Polling for account activation
  useEffect(() => {
    if (state !== 'waiting' || !embedToken) return
    let cancelled = false
    async function poll() {
      try {
        const res = await fetch(`/api/embed/check-activation?token=${encodeURIComponent(embedToken!)}`)
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        if (data.activated) setState('activated')
      } catch {}
    }
    poll()
    activationPollRef.current = setInterval(poll, POLL_ACTIVATION_MS)
    return () => {
      cancelled = true
      if (activationPollRef.current) clearInterval(activationPollRef.current)
    }
  }, [state, embedToken, setState])

  // Polling for deployment progress
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
        body: JSON.stringify({ email: trimmed, ref: partner.slug }),
      })
      if (!startRes.ok) { setError(t.sendFailed); return }
      const startData = await startRes.json()
      const token = startData.embedToken as string

      const origin = typeof window !== 'undefined'
        ? window.location.origin
        : 'https://partners.fractera.ai'
      const signInResult = await signIn('resend', {
        email: trimmed,
        callbackUrl: `${origin}/${lang}/${partner.slug}`,
        redirect: false,
      })
      if (signInResult?.error) { setError(t.sendFailed); return }

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
    if (!ip.trim() || !login.trim() || !password.trim()) {
      setError(t.installMissingFields)
      return
    }
    if (!passwordAck) return
    if (!embedToken) {
      setError(t.installKickoffFailed)
      return
    }
    // Client-generated session id so the progress poller can start at once.
    const sessionId = `embed-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    try {
      localStorage.setItem(LS_SESSION_ID, sessionId)
      localStorage.setItem(LS_IP, ip.trim())
    } catch {}
    setDeploySessionId(sessionId)
    setProgress(null)
    setDeployError(null)
    setState('deploying')
    // Fire-and-forget: the server keeps running the SSH upload to completion;
    // the progress poller tracks the result via /api/progress. Awaiting here
    // would freeze the UI on 'Starting…' for the whole SSH phase.
    fetch('/api/embed/install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: embedToken, ip: ip.trim(), login: login.trim(), password, sessionId, ...(customMode ? { components: selected } : {}) }),
    }).catch(() => {})
  }

  function retryFromError() {
    setProgress(null)
    setDeployError(null)
    setDeploySessionId(null)
    try { localStorage.removeItem(LS_SESSION_ID) } catch {}
    setState('activated')
  }

  // Dismiss any of the three deployment modals (deploying/deploy-done/deploy-error).
  // The in-flight deploy keeps running server-side and the user will receive an
  // email when it finishes — closing the modal just unlocks the page so the user
  // can start another server. We clear the session-id/ip from localStorage so the
  // next visit shows a clean install form, not the previous deploy's modal again.
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
    setState('activated')
  }

  const isActivated = state === 'activated' || state === 'deploying' || state === 'deploy-done' || state === 'deploy-error'
  const serverLinks = partner.links.filter(l => l.kind !== 'domain')
  const domainLinks = partner.links.filter(l => l.kind === 'domain')

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-16 flex flex-col gap-12">

        {/* Hero + scenario / install card (two columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch">

          {/* Left column — hero + provider buttons */}
          <div className="flex flex-col gap-6 items-start text-left h-full">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{t.label}</p>
              <h1 className="font-serif font-bold leading-tight text-white text-3xl md:text-4xl">{t.h2}</h1>
              <p className="text-base text-white/60">{t.description}</p>
            </div>

            <div className="flex flex-col gap-3 w-full pt-4 border-t border-white/10 mt-auto">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{t.serverLabel}</p>
                <h2 className="text-base font-bold font-serif text-white">{t.serverHeader}</h2>
                <p className="text-xs text-white/50 leading-relaxed">{isActivated ? t.serverDescriptionPost : t.serverDescriptionPre}</p>
              </div>

              {serverLinks.length > 0 ? (
                <ProviderLinks links={serverLinks} isActivated={isActivated} onActiveClick={markHostingClicked} onInactiveClick={() => setState('signup')} t={t} />
              ) : (
                <div className="flex flex-col gap-2 rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-4">
                  <p className="text-xs font-mono font-bold text-amber-300 uppercase tracking-widest">{t.notConfiguredTitle}</p>
                  <p className="text-sm text-white/70 leading-relaxed">{t.notConfiguredBody}</p>
                </div>
              )}

              {domainLinks.length > 0 && (
                <div className="flex flex-col gap-2 pt-3 border-t border-white/10">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{t.domainLabel}</p>
                    <h2 className="text-base font-bold font-serif text-white">{t.domainHeader}</h2>
                    <p className="text-xs text-white/50 leading-relaxed">{t.domainDescription}</p>
                  </div>
                  <ProviderLinks links={domainLinks} isActivated={isActivated} onActiveClick={markHostingClicked} onInactiveClick={() => setState('signup')} t={t} />
                </div>
              )}
            </div>
          </div>

          {/* Right column — scenario before activation, install form after */}
          {isActivated ? (
            <div className="flex flex-col gap-4 rounded-2xl p-6 bg-gradient-to-br from-emerald-950/70 via-emerald-900/30 to-black/60 border border-emerald-500/60 h-full">
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 text-2xl leading-none">✓</span>
                <h2 className="text-xl font-bold text-white font-serif">{t.activatedTitle}</h2>
              </div>
              <p className="text-sm text-white/75 leading-relaxed">{t.installSubtitle}</p>

              <form onSubmit={handleDeploy} className="flex flex-col gap-3 mt-1">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-widest">{t.ipLabel}</label>
                  <input
                    type="text"
                    value={ip}
                    onChange={e => setIp(e.target.value)}
                    placeholder="123.45.67.89"
                    disabled={busy}
                    className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/70 font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-widest">{t.loginLabel}</label>
                  <input
                    type="text"
                    value={login}
                    onChange={e => setLogin(e.target.value)}
                    placeholder="root"
                    disabled={busy}
                    className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/70 font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-widest">{t.passwordLabel}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={busy}
                    className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/70 font-mono"
                  />
                </div>

                <PartnerDeployOptions
                  lang={lang}
                  customMode={customMode}
                  setCustomMode={setCustomMode}
                  selected={selected}
                  setSelected={setSelected}
                  passwordAck={passwordAck}
                  setPasswordAck={setPasswordAck}
                  disabled={busy}
                />

                {error && <p className="text-sm text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={busy || !ip.trim() || !login.trim() || !password.trim() || !passwordAck}
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed text-white font-bold px-5 py-3 rounded-xl text-base transition-colors shadow-lg shadow-emerald-500/20"
                >
                  {busy ? <><span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{t.deployStarting}</> : <>{t.deployStart} →</>}
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col gap-4 rounded-2xl p-6 bg-gradient-to-br from-violet-950/70 via-violet-900/30 to-black/60 border border-violet-500/60 h-full">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-mono font-bold text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20 self-start">{t.freeBadge}</span>
                <h2 className="text-xl font-bold text-white mt-1">{t.scenarioTitle}</h2>
                <p className="text-sm text-violet-200/70 font-medium">{t.freeSub}</p>
              </div>
              <ol className="flex flex-col gap-2 text-sm text-white/85 font-medium flex-1">
                {t.scenarioSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-xs font-bold text-violet-300 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <button
                type="button"
                onClick={() => setState('signup')}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-violet-500/30"
              >
                {t.verifyEmail} →
              </button>
              <p className="text-xs text-white/50 text-center">{t.verifyHint}</p>
            </div>
          )}
        </div>

        {/* Trust grid */}
        <div className="grid grid-cols-3 gap-3">
          {t.trust.map((item, i) => (
            <div key={i} className="flex items-center justify-center py-3 px-4 rounded-xl border border-white/15 bg-white/[0.03] text-sm font-bold text-white text-center tracking-wide">
              {item}
            </div>
          ))}
        </div>

        {/* Block 4 — MCP deployment fallback */}
        <div className="flex flex-col gap-3 rounded-2xl border border-violet-500/30 bg-violet-500/[0.04] p-6">
          <p className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">{t.mcpBlockLabel}</p>
          <h2 className="text-lg md:text-xl font-bold text-white font-serif leading-snug">{t.mcpBlockTitle}</h2>
          <p className="text-sm text-white/70 leading-relaxed">{t.mcpBlockBody}</p>
          {mcpUnlocked ? (
            <a
              href={`https://fractera.ai/${lang}#mcp-section`}
              target="_blank"
              rel="noopener noreferrer"
              className="self-start inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              {t.mcpBlockActive}
            </a>
          ) : (
            <span
              title={t.mcpBlockTooltip}
              aria-disabled="true"
              className="self-start inline-flex items-center gap-2 bg-white/[0.04] text-white/40 border border-white/15 px-5 py-2.5 rounded-xl text-sm cursor-not-allowed select-none"
            >
              {t.mcpBlockInactive}
              <span className="text-xs text-amber-300/70" aria-hidden="true">🔒</span>
            </span>
          )}
          <p className="text-xs text-amber-300/80 leading-relaxed mt-1">{t.mcpHelpHint}</p>
        </div>
      </div>

      {/* Signup modal */}
      {state === 'signup' && (
        <Overlay onClose={() => setState('presentation')}>
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
                onClick={() => setState('presentation')}
                disabled={busy}
                className="text-sm font-semibold text-white/60 hover:text-white border border-white/20 px-4 py-3 rounded-xl transition-colors"
              >
                {t.cancel}
              </button>
            </div>
          </form>
        </Overlay>
      )}

      {/* Waiting overlay */}
      {state === 'waiting' && (
        <Overlay onClose={() => setState('presentation')}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-block w-5 h-5 border-2 border-violet-500/40 border-t-violet-300 rounded-full animate-spin" />
              <h2 className="text-xl font-bold text-white font-serif">{t.waitingTitle}</h2>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">{t.waitingBody(submittedEmail)}</p>
            <p className="text-xs text-amber-300/80">{t.waitingHint}</p>
            <button
              type="button"
              onClick={() => setState('presentation')}
              className="self-start text-xs font-semibold text-white/50 hover:text-white border border-white/20 px-3 py-1.5 rounded transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        </Overlay>
      )}

      {/* Deploying overlay */}
      {state === 'deploying' && (
        <Overlay onClose={dismissDeploymentModal}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-block w-5 h-5 border-2 border-violet-500/40 border-t-violet-300 rounded-full animate-spin" />
              <h2 className="text-xl font-bold text-white font-serif">{t.deployingTitle}</h2>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">{t.deployingBody}</p>
            <ProgressList progress={progress} t={t} />
            <DomainDnsBlock domainUrl={domainLinks[0]?.url} serverIp={ip} lang={lang} />
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

      {/* Deploy done overlay */}
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
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
                >
                  {t.yourApp} ↗
                </a>
                <a
                  href={(() => {
                    const s = progress.subdomain ?? ''
                    const ipMatch = s.match(/^(?:ip-)?(\d+\.\d+\.\d+\.\d+)$/)
                    return ipMatch ? `http://${ipMatch[1]}:3002` : `https://admin.${s}`
                  })()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 border border-emerald-500/60 hover:border-emerald-400 hover:bg-emerald-500/10 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
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

      {/* Deploy error overlay */}
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

// Renders a list of partner affiliate buttons (used for both the server and
// domain blocks). Before email verification they trigger signup; after, they
// are real outbound affiliate links (attribution locked in the provider cookie).
function ProviderLinks({ links, isActivated, onActiveClick, onInactiveClick, t }: {
  links: PageLink[]
  isActivated: boolean
  onActiveClick: () => void
  onInactiveClick: () => void
  t: Texts
}) {
  return (
    <div className="flex flex-col gap-2">
      {links.map(link => (
        isActivated ? (
          <a
            key={link.id}
            href={link.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={onActiveClick}
            className="group w-full flex items-center justify-between gap-3 rounded-xl border border-emerald-500/40 hover:border-emerald-400 bg-emerald-500/[0.06] hover:bg-emerald-500/[0.10] px-5 py-3.5 transition-all"
          >
            <span className="flex items-center gap-2">
              <span className="text-base font-bold text-white group-hover:text-emerald-200 transition-colors">{link.providerName}</span>
              {link.isDefault && (
                <span className="text-xs font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">{t.primaryBadge}</span>
              )}
            </span>
            <span className="shrink-0 text-emerald-300 group-hover:text-emerald-200 text-base font-bold transition-colors">{t.open}</span>
          </a>
        ) : (
          <button
            key={link.id}
            type="button"
            onClick={onInactiveClick}
            className="group w-full flex items-center justify-between gap-3 rounded-xl border border-white/20 hover:border-violet-500/60 bg-white/[0.03] hover:bg-violet-500/[0.06] px-5 py-3.5 transition-all text-left"
          >
            <span className="flex items-center gap-2">
              <span className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">{link.providerName}</span>
              {link.isDefault && (
                <span className="text-xs font-mono text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/30">{t.primaryBadge}</span>
              )}
            </span>
            <span className="shrink-0 text-white/60 group-hover:text-violet-300 text-base font-bold transition-colors">{t.open}</span>
          </button>
        )
      ))}
    </div>
  )
}

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

function ProgressList({ progress, t }: { progress: ProgressData | null; t: Texts }) {
  if (!progress) {
    return <p className="text-xs text-white/40 italic">{t.deployingActive} …</p>
  }

  const steps = progress.steps ?? []
  const activeStep = steps.length > 0 && !steps[steps.length - 1].done ? steps[steps.length - 1] : null
  const doneCount = steps.filter(s => s.done).length
  // Fixed denominator — the bootstrap pipeline reports ~44 steps. Dividing by
  // the count of steps seen so far showed 100% when only the first step
  // (the email-sent marker) had arrived. Capped at 99% while deploying.
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
          <div className="h-full bg-violet-400 transition-all duration-500" style={{ width: `${percent}%` }} />
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
