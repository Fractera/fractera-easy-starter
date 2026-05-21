'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

type Partner = { id: string; slug: string; status: string; createdAt: string }

export function PartnerRegistrationDrawer({ open, onClose, onRegistered, lang }: {
  open: boolean
  onClose: () => void
  onRegistered?: () => void
  lang: string
}) {
  const isRu = lang === 'ru'
  const { data: session, update: updateSession } = useSession()
  const [submitting, setSubmitting] = useState(false)
  const [partner, setPartner] = useState<Partner | null>(null)
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    if (!open) return
    setPartner(null)
    setAgreed(false)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open || !session?.user) return
    fetch('/api/partner/register')
      .then(r => r.json())
      .then(d => { if (d.partner) setPartner(d.partner) })
      .catch(() => {})
  }, [open, session?.user])

  if (!open) return null

  const t = isRu ? {
    title: 'Партнёрский кабинет Fractera',
    subtitle: 'Перед регистрацией ознакомьтесь с политикой сотрудничества',
    policyHeader: 'Политика сотрудничества',
    policyDraft: '(черновик документа — финальная редакция готовится)',
    policyParas: [
      'Партнёрская программа Fractera — это техническая инфраструктура, которая позволяет вам как партнёру рекомендовать вашей аудитории VPS-провайдеров и получать вознаграждение от этих провайдеров напрямую. Fractera не выплачивает партнёрские комиссии: финансовые отношения происходят строго между вами и провайдером (например, Contabo) в рамках их собственной affiliate-программы.',
      'Регистрируясь в партнёрском кабинете, вы получаете персональный идентификатор партнёра, доступ к личному кабинету для управления партнёрскими ссылками, embed-виджету для встраивания формы регистрации Fractera в ваш контент, а также MCP-инструмент для активации через AI-агента. Дополнительно — в будущем — персональный поддомен с зеркалом нашего лендинга.',
      'Вы соглашаетесь использовать партнёрскую инфраструктуру добросовестно: не распространять её через спам, искусственную накрутку, клик-фермы или иные методы недобросовестной атрибуции. Fractera оставляет за собой право приостановить партнёрский статус при обнаружении нарушений.',
      'Вы соглашаетесь с тем, что Fractera не несёт ответственности за решения VPS-провайдеров об одобрении или отказе в их собственных affiliate-программах, размер и сроки выплат, а также за любые споры между вами и провайдером по поводу комиссий.',
      'Полная версия документа будет опубликована до запуска кабинета в общий доступ.',
    ],
    agreeLabel: 'Я ознакомлен и согласен с политикой сотрудничества',
    button: 'Зарегистрироваться как партнёр',
    buttonBusy: 'Регистрируем…',
    notSignedIn: 'Чтобы зарегистрироваться, сначала войдите в аккаунт.',
    successTitle: 'Партнёрский кабинет активирован',
    successBody: 'Ваш идентификатор партнёра',
    successHint: 'Откройте Dashboard в правом верхнем углу — вкладка «Партнёрский кабинет». Письмо с подробностями и шаблоном виджета уже отправлено на ваш email (проверьте «спам», если не видите).',
    successClose: 'Понятно',
    toast: 'Откройте Dashboard → вкладка «Партнёрский кабинет»',
  } : {
    title: 'Fractera Partner Cabinet',
    subtitle: 'Please review the cooperation policy before signing up',
    policyHeader: 'Cooperation policy',
    policyDraft: '(draft — final version is being prepared)',
    policyParas: [
      'The Fractera Partner Program is technical infrastructure that lets you, as a partner, recommend VPS providers to your audience and earn commission directly from those providers. Fractera does not pay affiliate commissions: the financial relationship is strictly between you and the provider (e.g. Contabo) under their own affiliate program.',
      'By registering in the partner cabinet, you receive a personal partner identifier, access to a cabinet for managing affiliate links, an embeddable signup widget you can place in your content, and an MCP tool for AI-agent-driven activation. Additionally — at a later stage — a personal mirror subdomain of our landing page.',
      'You agree to use this infrastructure in good faith: no spam distribution, no artificial traffic, no click farms, no abusive attribution techniques. Fractera reserves the right to suspend the partner status in case of violations.',
      'You agree that Fractera is not responsible for VPS-provider decisions about approving or rejecting their own affiliate programs, for payout amounts and schedules, or for any dispute between you and the provider regarding commissions.',
      'The full final version of this document will be published before the cabinet ships to general availability.',
    ],
    agreeLabel: 'I have read and agree to the cooperation policy',
    button: 'Register as a partner',
    buttonBusy: 'Registering…',
    notSignedIn: 'Sign in first to register as a partner.',
    successTitle: 'Partner cabinet activated',
    successBody: 'Your partner identifier',
    successHint: 'Open Dashboard from the top-right corner — tab «Partner cabinet». A welcome email with details and a widget snippet has been sent to your address (check spam if you do not see it).',
    successClose: 'Got it',
    toast: 'Open Dashboard → «Partner cabinet» tab',
  }

  async function handleSubmit() {
    if (submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/partner/register', { method: 'POST' })
      if (!res.ok) throw new Error('register failed')
      const data = await res.json()
      setPartner(data.partner)
      toast.success(t.toast, { duration: 8000 })
      // Force NextAuth to re-run the server-side session() callback so
      // session.user.partnerSlug picks up the freshly-created Partner row.
      // Without this, opening the dashboard cabinet right after registration
      // shows "you are not registered" — the cabinet reads partnerSlug from
      // a stale cached session that was created before the Partner existed.
      // updateSession() is awaited so the parent's onRegistered() (router.refresh)
      // runs against a fresh session on the next render.
      try { await updateSession() } catch { /* best effort */ }
      // Tell the parent page to refresh — it renders the emerald
      // "Congratulations" banner from a server component (DB lookup), so
      // without a refresh it stays on the pre-registration CTA until the
      // user reloads. The drawer's success state still shows immediately;
      // refresh runs in the background.
      onRegistered?.()
    } catch {
      toast.error(isRu ? 'Не удалось зарегистрировать. Попробуйте позже.' : 'Registration failed. Please try again later.')
    } finally {
      setSubmitting(false)
    }
  }

  const signedIn = !!session?.user

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full z-50 w-full md:w-[560px] bg-neutral-950 border-l border-white/10 shadow-2xl overflow-y-auto text-white">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl font-bold leading-none"
        >
          ×
        </button>

        <div className="px-6 md:px-8 py-10 flex flex-col gap-6">

          {!partner ? (
            <>
              <div className="flex flex-col gap-2">
                <span className="self-start text-xs font-mono font-bold text-violet-400 uppercase tracking-widest border border-violet-500/30 bg-violet-500/[0.06] px-3 py-1 rounded-full">
                  {isRu ? 'Регистрация' : 'Sign up'}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold font-serif tracking-tight">{t.title}</h2>
                <p className="text-sm text-white/60 leading-relaxed">{t.subtitle}</p>
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/[0.02] p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{t.policyHeader}</p>
                  <span className="text-xs text-white/40 italic">{t.policyDraft}</span>
                </div>
                <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-2 text-sm text-white/70 leading-relaxed">
                  {t.policyParas.map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-violet-500 cursor-pointer"
                />
                <span className="text-sm text-white/80 leading-relaxed">{t.agreeLabel}</span>
              </label>

              {!signedIn && (
                <p className="text-sm text-amber-300 bg-amber-500/[0.06] border border-amber-500/30 rounded-lg px-3 py-2">{t.notSignedIn}</p>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!agreed || !signedIn || submitting}
                className="w-full inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed text-white font-bold px-6 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-violet-500/30 disabled:shadow-none"
              >
                {submitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    {t.buttonBusy}
                  </>
                ) : (
                  <>{t.button} →</>
                )}
              </button>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <span className="self-start text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest border border-emerald-500/30 bg-emerald-500/[0.06] px-3 py-1 rounded-full">
                  ✓ {isRu ? 'Активирован' : 'Activated'}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold font-serif tracking-tight">{t.successTitle}</h2>
              </div>

              <div className="flex flex-col gap-2 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-violet-900/20 to-black/60 p-5">
                <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{t.successBody}</p>
                <p className="font-mono text-2xl font-bold text-white tracking-wide select-all">{partner.slug}</p>
              </div>

              <p className="text-sm text-white/65 leading-relaxed">{t.successHint}</p>

              <button
                type="button"
                onClick={onClose}
                className="self-start inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3 rounded-xl text-base transition-colors"
              >
                {t.successClose}
              </button>
            </>
          )}

        </div>
      </div>
    </>
  )
}
