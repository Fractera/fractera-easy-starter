'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type Lang = 'en' | 'ru'

type Props = {
  open: boolean
  onClose: () => void
  lang: Lang
  email: string
}

export function BlackBoxInquiryDrawer({ open, onClose, lang, email }: Props) {
  const isRu = lang === 'ru'
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [area, setArea] = useState('')
  const [country, setCountry] = useState('')
  const [companyDoes, setCompanyDoes] = useState('')
  const [aiTask, setAiTask] = useState('')
  const [telegram, setTelegram] = useState('')
  const [spamUnderstood, setSpamUnderstood] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!open) return
    setDone(false)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const t = isRu ? {
    title: 'Fractera Black Box — заявка на консультацию',
    subtitle: 'Эти данные помогут основателю Fractera подготовиться к разговору. Все поля кроме email — необязательные.',
    nameLabel: 'Ваше имя',
    companyLabel: 'Название компании',
    areaLabel: 'Область деятельности',
    countryLabel: 'Страна',
    companyDoesLabel: 'Чем занимается компания',
    aiTaskLabel: 'Какую задачу хотели бы решить с помощью AI',
    emailLabel: 'Email для связи',
    emailHint: 'Если нужен ответ на другой email — выйдите из аккаунта и войдите с нужным.',
    telegramLabel: 'Telegram (альтернативный способ связи)',
    telegramPlaceholder: '@username',
    spamLabel: 'Я понимаю, что ответ может попасть в папку «Спам».',
    submit: 'Отправить заявку',
    submitting: 'Отправляем…',
    sendFailed: 'Не удалось отправить. Попробуйте ещё раз или напишите напрямую на admin@fractera.ai.',
    successTitle: 'Заявка отправлена',
    successBody: 'Основатель Fractera получил вашу заявку и свяжется с вами в течение 48 часов. Проверьте «Спам», если ответа не будет во входящих.',
    successClose: 'Понятно',
  } : {
    title: 'Fractera Black Box — consultation inquiry',
    subtitle: 'These details help the Fractera founder prepare for the call. All fields except email are optional.',
    nameLabel: 'Your name',
    companyLabel: 'Company name',
    areaLabel: 'Area of activity',
    countryLabel: 'Country',
    companyDoesLabel: 'What your company does',
    aiTaskLabel: 'What you would like to solve with AI',
    emailLabel: 'Contact email',
    emailHint: 'Need a reply to a different email? Sign out and sign in with that address.',
    telegramLabel: 'Telegram (alternative contact)',
    telegramPlaceholder: '@username',
    spamLabel: 'I understand the reply may land in the Spam folder.',
    submit: 'Send inquiry',
    submitting: 'Sending…',
    sendFailed: 'Failed to send. Please try again or email admin@fractera.ai directly.',
    successTitle: 'Inquiry sent',
    successBody: 'The Fractera founder received your inquiry and will reply within 48 hours. Check the Spam folder if you do not see a reply.',
    successClose: 'Got it',
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/black-box/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, company, area, country, companyDoes, aiTask, telegram, lang,
        }),
      })
      if (!res.ok) {
        toast.error(t.sendFailed)
        return
      }
      setDone(true)
    } catch {
      toast.error(t.sendFailed)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full z-50 w-full md:w-[500px] bg-neutral-950 border-l border-white/15 shadow-2xl overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg font-bold leading-none"
        >
          ×
        </button>

        <div className="flex flex-col gap-5 p-6 md:p-8 pt-12">

          {done ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 text-2xl leading-none">✓</span>
                <h2 className="text-xl md:text-2xl font-bold text-white font-serif">{t.successTitle}</h2>
              </div>
              <p className="text-sm md:text-base text-white/75 leading-relaxed">{t.successBody}</p>
              <button
                type="button"
                onClick={onClose}
                className="self-start mt-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                {t.successClose}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">Fractera Black Box</span>
                <h2 className="text-xl md:text-2xl font-bold text-white font-serif">{t.title}</h2>
                <p className="text-sm text-white/60 leading-relaxed">{t.subtitle}</p>
              </div>

              <Field label={t.nameLabel} value={name} onChange={setName} />
              <Field label={t.companyLabel} value={company} onChange={setCompany} />
              <Field label={t.areaLabel} value={area} onChange={setArea} />
              <Field label={t.countryLabel} value={country} onChange={setCountry} />
              <Field label={t.companyDoesLabel} value={companyDoes} onChange={setCompanyDoes} multiline />
              <Field label={t.aiTaskLabel} value={aiTask} onChange={setAiTask} multiline />

              {/* Email — readonly */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">{t.emailLabel}</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="bg-white/[0.02] border border-white/15 rounded-lg px-3 py-2 text-sm text-white/70 font-mono cursor-not-allowed"
                />
                <p className="text-xs text-white/50 leading-relaxed">{t.emailHint}</p>
              </div>

              <Field label={t.telegramLabel} value={telegram} onChange={setTelegram} placeholder={t.telegramPlaceholder} />

              <label className="flex items-start gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={spamUnderstood}
                  onChange={e => setSpamUnderstood(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-violet-500"
                />
                <span className="text-sm text-white/75 leading-relaxed">{t.spamLabel}</span>
              </label>

              <button
                type="submit"
                disabled={submitting || !spamUnderstood}
                className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed text-white font-bold px-5 py-3 rounded-xl text-sm md:text-base transition-colors shadow-lg shadow-violet-500/30"
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
          )}

        </div>
      </div>
    </>
  )
}

function Field({ label, value, onChange, placeholder, multiline }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  multiline?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/70 leading-relaxed"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/70"
        />
      )}
    </div>
  )
}
