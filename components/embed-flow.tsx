'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { signIn } from 'next-auth/react'

type Lang = 'en' | 'ru'
type State = 'presentation' | 'signup' | 'waiting' | 'post-activation' | 'install' | 'deploying'

const LS_TOKEN = 'fractera_embed_token'
const LS_STATE = 'fractera_embed_state'
const LS_EMAIL = 'fractera_embed_email'
const POLL_INTERVAL_MS = 3000

const FALLBACK_PROVIDER_URL = 'https://contabo.com/en/vps/cloud-vps-10/?image=ubuntu.332&qty=1&contract=12&storage-type=cloud-vps-10-150-gb-ssd'

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

    deployButton: isRu ? 'Развернуть на своём сервере' : 'Deploy on your own server',
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
    deploying: isRu ? 'Запускаем…' : 'Starting…',
    installFailed: isRu ? 'Не удалось запустить развёртывание.' : 'Failed to start deployment.',

    // Final
    finalTitle: isRu ? 'Развёртывание начато' : 'Deployment started',
    finalBody: isRu
      ? 'Установка займёт несколько минут. Подробная информация о вашем сервере — IP, ссылки, доступы — придёт на email сразу после завершения развёртывания.'
      : 'Setup takes a few minutes. Full information about your server — IP, URLs, credentials — will arrive by email as soon as deployment completes.',
    finalHint: isRu ? 'Это окно можно закрыть. Письма уже идут.' : 'You can close this window. The emails are on their way.',
    openDashboard: isRu ? 'Открыть Dashboard на fractera.ai' : 'Open Dashboard at fractera.ai',
  }
}

export function EmbedFlow({ lang, partnerSlug, providerName, affiliateUrl }: {
  lang: Lang
  partnerSlug: string | null
  providerName: string | null
  affiliateUrl: string | null
}) {
  const t = getTexts(lang)
  const [state, setStateRaw] = useState<State>('presentation')
  const [email, setEmail] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [embedToken, setEmbedToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  // Persist state in localStorage for iframe reloads
  const setState = useCallback((next: State) => {
    setStateRaw(next)
    try { localStorage.setItem(LS_STATE, next) } catch {}
  }, [])

  // Restore state on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(LS_TOKEN)
      const savedState = localStorage.getItem(LS_STATE) as State | null
      const savedEmail = localStorage.getItem(LS_EMAIL)
      if (savedToken) setEmbedToken(savedToken)
      if (savedEmail) setSubmittedEmail(savedEmail)
      if (savedState && savedState !== 'presentation' && savedState !== 'signup') {
        setStateRaw(savedState)
      }
    } catch {}
  }, [])

  // Polling for activation
  useEffect(() => {
    if (state !== 'waiting' || !embedToken) return

    let cancelled = false
    async function poll() {
      try {
        const res = await fetch(`/api/embed/check-activation?token=${encodeURIComponent(embedToken!)}`)
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        if (data.activated) {
          setState('post-activation')
        }
      } catch {}
    }
    poll()
    pollTimer.current = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      if (pollTimer.current) clearInterval(pollTimer.current)
    }
  }, [state, embedToken, setState])

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

  function cancelToPresentation() {
    setError(null)
    setState('presentation')
  }

  // Computed
  const buyButtonLabel = providerName ? t.buyVpsAt(providerName) : t.buyVpsGeneric
  const partnerUrl = affiliateUrl ?? FALLBACK_PROVIDER_URL

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-8">

        {/* ── PRESENTATION (mirror of landing pricing-flow section) ── */}
        <div className="w-full flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="flex flex-col gap-6 items-start text-left">
              <div className="flex flex-col gap-3">
                <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{t.label}</p>
                <h2 className="font-serif font-bold leading-tight text-white text-2xl md:text-3xl lg:text-4xl">{t.h2}</h2>
                <p className="text-base text-white/60">{t.description}</p>
              </div>

              <div className="flex flex-col gap-3 w-full pt-4 border-t border-white/10">
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
                    <span className="text-xs text-white/60 font-medium">{t.providerPrice}</span>
                  </span>
                  <span className="shrink-0 text-white/60 group-hover:text-violet-300 text-base font-bold transition-colors">↗</span>
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div id="light-card" className="flex flex-col gap-4 rounded-2xl p-6 bg-gradient-to-br from-emerald-950/70 via-emerald-900/30 to-black/60 border border-emerald-500/60">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 self-start">{t.freeBadge}</span>
                  <h3 className="text-xl font-bold text-white mt-1">Fractera Light</h3>
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

        <p className="text-xs text-white/30 text-center">
          <a href="https://fractera.ai" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">Powered by Fractera</a>
        </p>
      </div>

      {/* ── SIGNUP MODAL (overlay over the presentation) ── */}
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
          <PostActivationStep
            lang={lang}
            t={t}
            buyButtonLabel={buyButtonLabel}
            partnerUrl={partnerUrl}
            embedToken={embedToken}
            onStartInstall={() => setState('install')}
            onDeploying={() => setState('deploying')}
          />
        </Overlay>
      )}

      {/* ── DEPLOYING (terminal state) ── */}
      {state === 'deploying' && (
        <Overlay>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 text-2xl leading-none">✓</span>
              <h2 className="text-xl font-bold text-white font-serif">{t.finalTitle}</h2>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">{t.finalBody}</p>
            <p className="text-xs text-amber-300/80">{t.finalHint}</p>
            <a
              href="https://fractera.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="self-start mt-2 inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              {t.openDashboard} ↗
            </a>
          </div>
        </Overlay>
      )}
    </main>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Overlay shell (blur + centred card). Optional close button if onClose given.
function Overlay({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-neutral-950 border border-white/15 rounded-2xl shadow-2xl p-6">
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

// ─────────────────────────────────────────────────────────────────────────────
// Post-activation step: CTA to buy VPS + install form. Lives inside its own
// component so input state is isolated.
function PostActivationStep({
  lang,
  t,
  buyButtonLabel,
  partnerUrl,
  embedToken,
  onStartInstall,
  onDeploying,
}: {
  lang: Lang
  t: ReturnType<typeof getTexts>
  buyButtonLabel: string
  partnerUrl: string
  embedToken: string | null
  onStartInstall: () => void
  onDeploying: () => void
}) {
  void lang
  const [ip, setIp] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDeploy(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!ip.trim() || !password.trim()) {
      setError(t.installFailed)
      return
    }
    if (!embedToken) {
      setError(t.installFailed)
      return
    }
    setBusy(true)
    onStartInstall()
    try {
      const res = await fetch('/api/embed/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: embedToken, ip: ip.trim(), password }),
      })
      if (!res.ok) {
        setError(t.installFailed)
        return
      }
      onDeploying()
    } catch {
      setError(t.installFailed)
    } finally {
      setBusy(false)
    }
  }

  return (
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
            {busy ? <><span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{t.deploying}</> : <>{t.deployStart} →</>}
          </button>
        </form>
      </div>
    </div>
  )
}
