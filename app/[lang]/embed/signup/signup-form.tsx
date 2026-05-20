'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'

type Lang = 'en' | 'ru'

export function SignupForm({
  partnerSlug,
  providerName,
  affiliateUrl,
  lang,
}: {
  partnerSlug: string | null
  providerName: string | null
  affiliateUrl: string | null
  lang: Lang
}) {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)

  const t = lang === 'ru' ? {
    emailPlaceholder: 'you@example.com',
    submit: 'Получить ссылку для активации',
    submitting: 'Отправляем…',
    successTitle: 'Письмо отправлено',
    successBody: 'Мы отправили ссылку для активации на',
    successHint: 'Проверьте папку «Спам», если не видите письмо в течение пары минут.',
    ctaWith: (provider: string) => `Купить VPS у ${provider}`,
    ctaNoProvider: 'Перейти на fractera.ai',
    invalidEmail: 'Пожалуйста, введите корректный email',
    failed: 'Не удалось отправить. Попробуйте ещё раз.',
  } : {
    emailPlaceholder: 'you@example.com',
    submit: 'Send activation link',
    submitting: 'Sending…',
    successTitle: 'Email sent',
    successBody: 'We sent an activation link to',
    successHint: 'Check your spam folder if you do not see the email within a couple of minutes.',
    ctaWith: (provider: string) => `Buy VPS at ${provider}`,
    ctaNoProvider: 'Open fractera.ai',
    invalidEmail: 'Please enter a valid email',
    failed: 'Sending failed. Please try again.',
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const trimmed = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError(t.invalidEmail)
      return
    }
    setSubmitting(true)
    try {
      const callbackUrl = partnerSlug
        ? `/${lang}/embed/post-signup?ref=${encodeURIComponent(partnerSlug)}`
        : `/${lang}/embed/post-signup`
      const result = await signIn('resend', { email: trimmed, callbackUrl, redirect: false })
      if (result?.error) {
        setError(t.failed)
      } else {
        setSubmittedEmail(trimmed)
      }
    } catch {
      setError(t.failed)
    } finally {
      setSubmitting(false)
    }
  }

  if (submittedEmail) {
    const ctaUrl = affiliateUrl ?? 'https://fractera.ai'
    const ctaLabel = providerName ? t.ctaWith(providerName) : t.ctaNoProvider
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 via-emerald-900/10 to-black/40 p-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-xl leading-none">✓</span>
            <p className="text-base font-bold text-white">{t.successTitle}</p>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            {t.successBody} <strong className="font-mono text-white">{submittedEmail}</strong>
          </p>
          <p className="text-xs text-amber-300/80 leading-relaxed">{t.successHint}</p>
        </div>
        <a
          href={ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-violet-500/30"
        >
          {ctaLabel} ↗
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/[0.02] p-6">
      <input
        type="email"
        autoComplete="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder={t.emailPlaceholder}
        disabled={submitting}
        required
        className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-base text-white placeholder-white/30 focus:outline-none focus:border-violet-500/70 disabled:opacity-50"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={submitting || !email.trim()}
        className="w-full inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed text-white font-bold px-6 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-violet-500/30 disabled:shadow-none"
      >
        {submitting ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            {t.submitting}
          </>
        ) : (
          <>{t.submit} →</>
        )}
      </button>
    </form>
  )
}
