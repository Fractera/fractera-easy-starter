'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { signIn } from 'next-auth/react'

type Lang = 'en' | 'ru'
type State = 'presentation' | 'signup' | 'waiting' | 'activated'

type PageLink = {
  id: string
  providerName: string
  affiliateUrl: string
  isDefault: boolean
}

type PartnerData = {
  slug: string
  companyName: string | null
  companyEmail: string | null
  links: PageLink[]
}

const POLL_ACTIVATION_MS = 3000
const LS_TOKEN = 'fractera_partner_token'
const LS_STATE = 'fractera_partner_state'
const LS_EMAIL = 'fractera_partner_email'

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

    verifyEmail: isRu ? 'Подтвердить email' : 'Verify your email',
    verifyHint: isRu
      ? 'Email будет использоваться для регистрации и развёртывания.'
      : 'Email is used for sign-up and deployment.',

    // Scenario block (right column, before activation)
    scenarioTitle: isRu ? 'Как это работает' : 'How it works',
    scenarioSteps: isRu ? [
      'Подтвердите email — пришлём ссылку для активации.',
      'После клика по письму вернётесь сюда — кнопки покупки VPS станут активными.',
      'Купите сервер у одного из проверенных провайдеров.',
      'После покупки сможете запустить Fractera на нём.',
    ] : [
      'Verify your email — we send an activation link.',
      'Click the link, you return here — the buy-VPS buttons become active.',
      'Buy a server from one of the trusted providers.',
      'Once purchased, you can deploy Fractera onto it.',
    ],

    // Post-activation right column
    activatedTitle: isRu ? 'Email подтверждён' : 'Email verified',
    activatedBody: isRu
      ? 'Теперь вы можете приступить к покупке сервера. Выберите провайдера из списка слева — после оплаты вернётесь, чтобы развернуть Fractera.'
      : 'You can now buy your server. Pick a provider from the list on the left — after payment, return here to deploy Fractera.',

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

    // Default-link badge
    primaryBadge: '★',
    open: '↗',
  }
}

export function PartnerPageFlow({ partner, lang }: { partner: PartnerData; lang: Lang }) {
  const t = getTexts(lang)
  const [state, setStateRaw] = useState<State>('presentation')
  const [email, setEmail] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [embedToken, setEmbedToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
      if (savedToken) setEmbedToken(savedToken)
      if (savedEmail) setSubmittedEmail(savedEmail)
      if (savedState === 'waiting' || savedState === 'activated') {
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
        if (data.activated) setState('activated')
      } catch {}
    }
    poll()
    pollRef.current = setInterval(poll, POLL_ACTIVATION_MS)
    return () => {
      cancelled = true
      if (pollRef.current) clearInterval(pollRef.current)
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
        body: JSON.stringify({ email: trimmed, ref: partner.slug }),
      })
      if (!startRes.ok) { setError(t.sendFailed); return }
      const startData = await startRes.json()
      const token = startData.embedToken as string

      const signInResult = await signIn('resend', {
        email: trimmed,
        callbackUrl: `/${lang}/embed/callback`,
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

  function openSignupOrJustClick(_url?: string) {
    if (state === 'activated') {
      // Activated: clicks pass through to the actual affiliate URL via the <a> handler
      return
    }
    setState('signup')
  }

  const isActivated = state === 'activated'
  const isConfigured = partner.links.length > 0

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-16 flex flex-col gap-12">

        {/* Hero + scenario / verified card (two columns) */}
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

              {isConfigured ? (
                <div className="flex flex-col gap-2">
                  {partner.links.map(link => (
                    isActivated ? (
                      <a
                        key={link.id}
                        href={link.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
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
                        onClick={() => openSignupOrJustClick(link.affiliateUrl)}
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
              ) : (
                <div className="flex flex-col gap-2 rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-4">
                  <p className="text-xs font-mono font-bold text-amber-300 uppercase tracking-widest">{t.notConfiguredTitle}</p>
                  <p className="text-sm text-white/70 leading-relaxed">{t.notConfiguredBody}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right column — scenario before activation, verified card after */}
          {isActivated ? (
            <div className="flex flex-col gap-4 rounded-2xl p-6 bg-gradient-to-br from-emerald-950/70 via-emerald-900/30 to-black/60 border border-emerald-500/60 h-full">
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 text-2xl leading-none">✓</span>
                <h2 className="text-xl font-bold text-white font-serif">{t.activatedTitle}</h2>
              </div>
              <p className="text-sm text-white/75 leading-relaxed">{t.activatedBody}</p>
              <ul className="flex flex-col gap-1.5 text-sm text-white font-medium mt-2">
                {t.features.slice(0, 4).map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><span className="text-emerald-400">✓</span><span>{f}</span></li>
                ))}
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 shrink-0 mt-0.5">◈</span>
                  <span className="text-white">{t.features[4]}</span>
                </li>
              </ul>
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
    </main>
  )
}

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
