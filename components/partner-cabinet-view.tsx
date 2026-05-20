'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { isTrustedUrl, TRUSTED_PROVIDERS } from '@/lib/trusted-providers'

type Lang = 'ru' | 'en'

type PartnerLink = {
  id: string
  providerName: string
  affiliateUrl: string
  isDefault: boolean
  forWidget: boolean
  forPage: boolean
  sortOrder: number
  createdAt: string
}

type Surface = 'widget' | 'page'

const EMBED_ORIGIN = 'https://fractera.ai'
const PARTNERS_ORIGIN = 'https://partners.fractera.ai'

function buildEmbedUrl(lang: Lang, slug: string) {
  return `${EMBED_ORIGIN}/${lang}/embed?ref=${slug}`
}
function buildPartnerPageUrl(lang: Lang, slug: string) {
  return `${PARTNERS_ORIGIN}/${lang}/${slug}`
}
function buildPartnerCanonicalUrl(lang: Lang, slug: string) {
  return `${EMBED_ORIGIN}/${lang}/partners/${slug}`
}

// ─────────────────────────────────────────────────────────────────────────────
function getTexts(lang: Lang) {
  const isRu = lang === 'ru'
  return {
    partnerIdLabel: isRu ? 'ID партнёра' : 'Partner ID',
    activeBadge: isRu ? 'Активен' : 'Active',
    tabWidget: isRu ? 'Виджет' : 'Widget',
    tabPage: isRu ? 'Страница' : 'Page',

    // Shared link table
    loading: isRu ? 'Загружаем…' : 'Loading…',
    empty: isRu ? 'Пока нет ни одной партнёрской ссылки.' : 'No affiliate links yet.',
    addLink: isRu ? '+ Добавить ссылку' : '+ Add link',
    defaultBadge: isRu ? 'по умолчанию' : 'default',
    setDefault: isRu ? 'Сделать default' : 'Set default',
    edit: isRu ? 'Изменить' : 'Edit',
    delete: isRu ? 'Удалить' : 'Delete',
    deleted: isRu ? 'Ссылка удалена' : 'Link deleted',
    deleteFailed: isRu ? 'Не удалось удалить' : 'Delete failed',
    setDefaultDone: isRu ? 'По умолчанию' : 'Default updated',
    updateFailed: isRu ? 'Не удалось обновить' : 'Update failed',

    // Form
    formProviderLabel: isRu ? 'Название провайдера' : 'Provider name',
    formProviderPlaceholder: isRu ? 'Например, Contabo' : 'For example, Contabo',
    formUrlLabel: isRu ? 'Партнёрская ссылка' : 'Affiliate link',
    formUrlPlaceholder: 'https://...',
    save: isRu ? 'Сохранить' : 'Save',
    add: isRu ? 'Добавить' : 'Add',
    saving: isRu ? 'Сохраняем…' : 'Saving…',
    cancel: isRu ? 'Отмена' : 'Cancel',
    linkAdded: isRu ? 'Ссылка добавлена' : 'Link added',
    linkUpdated: isRu ? 'Ссылка обновлена' : 'Link updated',
    saveFailed: isRu ? 'Ошибка сохранения' : 'Save failed',

    // Surface toggles inside the form
    surfaceWidget: isRu ? 'Виджет' : 'Widget',
    surfacePage: isRu ? 'Страница' : 'Page',
    surfaceHelp: isRu
      ? 'Виджет — iframe для блогов. Страница — partners.fractera.ai/<slug>. Для страницы провайдер должен быть в whitelist доверенных.'
      : 'Widget = iframe for blogs. Page = partners.fractera.ai/<slug>. Page requires the provider to be on the trusted whitelist.',

    // Trusted whitelist
    trustedBadge: isRu ? 'Проверенный' : 'Trusted',
    notTrustedBadge: isRu ? 'Не в whitelist' : 'Not whitelisted',
    notTrustedTitle: isRu ? 'Этот провайдер не в whitelist' : 'Provider not on whitelist',
    notTrustedBody: isRu
      ? 'Чтобы этот хостинг появился на вашей партнёрской странице, свяжитесь с командой Fractera через приватный Telegram-канал для $20/mo спонсоров. Мы проверим провайдера и добавим в whitelist.'
      : 'To list this host on your partner page, contact the Fractera team via the private Telegram channel for $20/mo sponsors. We will verify the provider and add it to the whitelist.',
    notTrustedClose: isRu ? 'Понятно' : 'Got it',

    // Widget tab specific
    referralsLabel: isRu ? 'Регистраций через ваш ref' : 'Signups via your ref',
    referralsHint: isRu
      ? 'Считаются пользователи, прошедшие активацию учётной записи после прихода через виджет с вашим идентификатором.'
      : 'Counts users who completed account activation after coming through the widget with your identifier.',
    snippetLabel: isRu ? 'Snippet для встраивания' : 'Embed snippet',
    copy: isRu ? 'Копировать' : 'Copy',
    copied: isRu ? 'Скопировано' : 'Copied',
    copyFailed: isRu ? 'Не получилось скопировать' : 'Copy failed',
    widgetLinksIntro: isRu
      ? 'Здесь — ссылки, показываемые в iframe-виджете на сайтах партнёра. URL не ограничен whitelist-ом: партнёр несёт ответственность за свой контент.'
      : 'Links shown in the iframe widget on partner blogs. URL is not restricted by the whitelist — the partner is responsible for their own content.',

    // Page tab specific
    pageLinksIntro: isRu
      ? 'Ссылки, показываемые на вашей партнёрской странице partners.fractera.ai. Разрешены только проверенные хостинги — для защиты бренда Fractera.'
      : 'Links shown on your partner page at partners.fractera.ai. Only trusted hosts are allowed — to protect the Fractera brand.',
    pageUrlLabel: isRu ? 'URL вашей партнёрской страницы' : 'Your partner page URL',
    pageUrlCanonical: isRu ? 'Canonical (главный URL)' : 'Canonical (main URL)',
    pageUrlShort: isRu ? 'Короткая форма' : 'Short form',
    infoTitle: isRu ? 'Реквизиты для footer страницы' : 'Footer details',
    infoIntro: isRu
      ? 'Эти данные показываются в footer вашей партнёрской страницы. Нужны для одобрения партнёрства у хостинга (например, при валидации Contabo через CJ Affiliate).'
      : 'Shown in the footer of your partner page. Required for affiliate-program approval by hosting providers (e.g. Contabo via CJ Affiliate).',
    companyNameLabel: isRu ? 'Название компании или ваше имя' : 'Company name or your name',
    companyEmailLabel: isRu ? 'Email для связи' : 'Contact email',
    infoSave: isRu ? 'Сохранить реквизиты' : 'Save details',
    infoSaved: isRu ? 'Реквизиты сохранены' : 'Details saved',
    infoFailed: isRu ? 'Не удалось сохранить реквизиты' : 'Failed to save details',
  }
}

type Texts = ReturnType<typeof getTexts>

export function PartnerCabinetView({ partnerSlug, lang }: { partnerSlug: string; lang: Lang }) {
  const t = getTexts(lang)
  const [tab, setTab] = useState<Surface>('widget')

  return (
    <div className="flex flex-col gap-4">
      {/* Partner ID */}
      <div className="flex flex-col gap-3 rounded-xl border border-violet-500/30 bg-violet-500/[0.04] p-4">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <p className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">{t.partnerIdLabel}</p>
          <span className="text-xs font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">{t.activeBadge}</span>
        </div>
        <p className="font-mono text-lg md:text-xl font-bold text-white break-all select-all">{partnerSlug}</p>
      </div>

      {/* Top-level tabs: Widget | Page */}
      <div className="flex gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/10 self-start">
        <button
          type="button"
          onClick={() => setTab('widget')}
          className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${tab === 'widget' ? 'bg-violet-500/20 text-violet-200' : 'text-white/60 hover:text-white'}`}
        >
          {t.tabWidget}
        </button>
        <button
          type="button"
          onClick={() => setTab('page')}
          className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${tab === 'page' ? 'bg-violet-500/20 text-violet-200' : 'text-white/60 hover:text-white'}`}
        >
          {t.tabPage}
        </button>
      </div>

      {tab === 'widget' ? (
        <WidgetTab partnerSlug={partnerSlug} t={t} lang={lang} />
      ) : (
        <PageTab partnerSlug={partnerSlug} t={t} lang={lang} />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
function WidgetTab({ partnerSlug, t, lang }: { partnerSlug: string; t: Texts; lang: Lang }) {
  const snippet = `<iframe\n  src="${buildEmbedUrl(lang, partnerSlug)}"\n  width="100%" height="640"\n  style="border:0; border-radius:16px"\n></iframe>`
  const [referralCount, setReferralCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/partner/stats')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && typeof d.referralCount === 'number') setReferralCount(d.referralCount) })
      .catch(() => {})
  }, [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet)
      toast.success(t.copied)
    } catch {
      toast.error(t.copyFailed)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Referral counter */}
      <div className="flex flex-col gap-2 rounded-xl border border-violet-500/30 bg-violet-500/[0.04] p-4">
        <p className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">{t.referralsLabel}</p>
        <p className="text-3xl font-bold text-white font-mono">{referralCount === null ? '—' : referralCount}</p>
        <p className="text-xs text-white/50 leading-relaxed">{t.referralsHint}</p>
      </div>

      {/* Snippet block */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">{t.snippetLabel}</p>
          <button
            type="button"
            onClick={copy}
            className="text-xs font-semibold text-white/70 hover:text-white border border-white/15 hover:border-white/40 px-3 py-1 rounded transition-colors"
          >
            {t.copy}
          </button>
        </div>
        <pre className="text-xs md:text-sm font-mono text-emerald-300 bg-black/60 border border-white/10 rounded-lg p-4 overflow-x-auto leading-relaxed select-all">{snippet}</pre>
      </div>

      {/* Widget links manager */}
      <LinksManager surface="widget" t={t} intro={t.widgetLinksIntro} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
function PageTab({ partnerSlug, t, lang }: { partnerSlug: string; t: Texts; lang: Lang }) {
  const canonicalUrl = buildPartnerCanonicalUrl(lang, partnerSlug)
  const shortUrl = buildPartnerPageUrl(lang, partnerSlug)

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(t.copied)
    } catch {
      toast.error(t.copyFailed)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Live URLs */}
      <div className="flex flex-col gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.04] p-4">
        <p className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-widest">{t.pageUrlLabel}</p>
        <UrlRow label={t.pageUrlShort} value={shortUrl} onCopy={copyText} t={t} />
        <UrlRow label={t.pageUrlCanonical} value={canonicalUrl} onCopy={copyText} t={t} />
      </div>

      {/* Partner info form */}
      <PartnerInfoForm t={t} />

      {/* Page links manager */}
      <LinksManager surface="page" t={t} intro={t.pageLinksIntro} />
    </div>
  )
}

function UrlRow({ label, value, onCopy, t }: {
  label: string
  value: string
  onCopy: (text: string) => void
  t: Texts
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-white/40 font-mono uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2 flex-wrap">
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-emerald-200 hover:text-emerald-100 font-mono break-all flex-1"
        >
          {value}
        </a>
        <button
          type="button"
          onClick={() => onCopy(value)}
          className="text-xs font-semibold text-white/70 hover:text-white border border-white/15 hover:border-white/40 px-2 py-1 rounded transition-colors"
        >
          {t.copy}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
function PartnerInfoForm({ t }: { t: Texts }) {
  const [companyName, setCompanyName] = useState('')
  const [companyEmail, setCompanyEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/partner/info')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.partner) {
          setCompanyName(d.partner.companyName ?? '')
          setCompanyEmail(d.partner.companyEmail ?? '')
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    if (submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/partner/info', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, companyEmail }),
      })
      if (res.ok) toast.success(t.infoSaved)
      else toast.error(t.infoFailed)
    } catch {
      toast.error(t.infoFailed)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-violet-500/30 bg-violet-500/[0.04] p-4">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">{t.infoTitle}</p>
        <p className="text-xs text-white/55 leading-relaxed">{t.infoIntro}</p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-mono font-bold text-white/60 uppercase tracking-widest">{t.companyNameLabel}</label>
        <input
          type="text"
          value={companyName}
          onChange={e => setCompanyName(e.target.value)}
          disabled={loading || submitting}
          maxLength={120}
          className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/70"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-mono font-bold text-white/60 uppercase tracking-widest">{t.companyEmailLabel}</label>
        <input
          type="email"
          value={companyEmail}
          onChange={e => setCompanyEmail(e.target.value)}
          disabled={loading || submitting}
          maxLength={120}
          className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/70"
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={loading || submitting}
        className="self-start text-sm font-semibold bg-violet-600 hover:bg-violet-500 disabled:bg-white/10 disabled:text-white/40 text-white px-4 py-2 rounded-lg transition-colors"
      >
        {submitting ? t.saving : t.infoSave}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
function LinksManager({ surface, t, intro }: {
  surface: Surface
  t: Texts
  intro: string
}) {
  const [links, setLinks] = useState<PartnerLink[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [notTrustedOpen, setNotTrustedOpen] = useState(false)

  const fetchLinks = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/partner/links?surface=${surface}`)
      if (res.ok) {
        const data = await res.json()
        setLinks(data.links ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [surface])

  useEffect(() => { fetchLinks() }, [fetchLinks])

  async function handleDelete(id: string) {
    const res = await fetch(`/api/partner/links/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success(t.deleted)
      fetchLinks()
    } else {
      toast.error(t.deleteFailed)
    }
  }

  async function handleSetDefault(id: string) {
    const res = await fetch(`/api/partner/links/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDefault: true }),
    })
    if (res.ok) {
      toast.success(t.setDefaultDone)
      fetchLinks()
    } else {
      toast.error(t.updateFailed)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-white/60 leading-relaxed">{intro}</p>

      {loading ? (
        <div className="text-sm text-white/40 py-4">{t.loading}</div>
      ) : links.length === 0 && !adding ? (
        <div className="flex flex-col gap-3 rounded-xl border border-dashed border-white/15 p-6 items-start">
          <p className="text-sm text-white/60">{t.empty}</p>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {t.addLink}
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col">
            {links.map((link, i) => (
              <div key={link.id} className={`py-3 flex flex-col gap-2 ${i > 0 ? 'border-t border-white/10' : ''}`}>
                {editingId === link.id ? (
                  <LinkForm
                    surface={surface}
                    t={t}
                    initial={link}
                    onCancel={() => setEditingId(null)}
                    onSaved={() => { setEditingId(null); fetchLinks() }}
                    onNotTrusted={() => setNotTrustedOpen(true)}
                  />
                ) : (
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">{link.providerName}</span>
                        {link.isDefault && (
                          <span className="text-xs font-mono text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/30">{t.defaultBadge}</span>
                        )}
                        {isTrustedUrl(link.affiliateUrl) ? (
                          <span className="text-xs font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">{t.trustedBadge}</span>
                        ) : (
                          <span className="text-xs font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">{t.notTrustedBadge}</span>
                        )}
                      </div>
                      <a
                        href={link.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-white/50 hover:text-violet-300 font-mono truncate transition-colors"
                      >
                        {link.affiliateUrl}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!link.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(link.id)}
                          className="text-xs text-white/50 hover:text-violet-300 border border-white/15 hover:border-violet-500/50 px-2 py-1 rounded transition-colors"
                        >
                          {t.setDefault}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditingId(link.id)}
                        className="text-xs text-white/50 hover:text-white border border-white/15 hover:border-white/40 px-2 py-1 rounded transition-colors"
                      >
                        {t.edit}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(link.id)}
                        className="text-xs text-red-400/70 hover:text-red-400 border border-white/15 hover:border-red-500/40 px-2 py-1 rounded transition-colors"
                      >
                        {t.delete}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {adding ? (
            <LinkForm
              surface={surface}
              t={t}
              onCancel={() => setAdding(false)}
              onSaved={() => { setAdding(false); fetchLinks() }}
              onNotTrusted={() => setNotTrustedOpen(true)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="self-start text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {t.addLink}
            </button>
          )}
        </>
      )}

      {notTrustedOpen && <NotTrustedModal t={t} onClose={() => setNotTrustedOpen(false)} />}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
function LinkForm({ surface, t, initial, onCancel, onSaved, onNotTrusted }: {
  surface: Surface
  t: Texts
  initial?: PartnerLink
  onCancel: () => void
  onSaved: () => void
  onNotTrusted: () => void
}) {
  const [providerName, setProviderName] = useState(initial?.providerName ?? '')
  const [affiliateUrl, setAffiliateUrl] = useState(initial?.affiliateUrl ?? '')
  const [submitting, setSubmitting] = useState(false)

  const isUrlTrusted = affiliateUrl.trim() ? isTrustedUrl(affiliateUrl.trim()) : null
  const needsTrustForSurface = surface === 'page'
  const blocksByTrust = needsTrustForSurface && isUrlTrusted === false

  async function handleSubmit() {
    if (submitting) return
    if (blocksByTrust) {
      onNotTrusted()
      return
    }
    setSubmitting(true)
    try {
      const url = initial ? `/api/partner/links/${initial.id}` : '/api/partner/links'
      const method = initial ? 'PATCH' : 'POST'
      const body: Record<string, unknown> = { providerName, affiliateUrl }
      if (!initial) {
        // Default: create entry on the active surface only.
        body.forWidget = surface === 'widget'
        body.forPage = surface === 'page'
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success(initial ? t.linkUpdated : t.linkAdded)
        onSaved()
      } else {
        const d = await res.json().catch(() => ({}))
        if (d.error === 'NOT_TRUSTED') {
          onNotTrusted()
        } else {
          toast.error(d.error ?? t.saveFailed)
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  const valid = providerName.trim().length > 0 && /^https?:\/\//i.test(affiliateUrl.trim())

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-violet-500/30 bg-violet-500/[0.04] p-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">{t.formProviderLabel}</label>
        <input
          type="text"
          value={providerName}
          onChange={e => setProviderName(e.target.value)}
          placeholder={t.formProviderPlaceholder}
          maxLength={80}
          list={surface === 'page' ? 'trusted-providers-list' : undefined}
          className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/70"
        />
        {surface === 'page' && (
          <datalist id="trusted-providers-list">
            {TRUSTED_PROVIDERS.map(p => (
              <option key={p.domain} value={p.name} />
            ))}
          </datalist>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">{t.formUrlLabel}</label>
        <input
          type="url"
          value={affiliateUrl}
          onChange={e => setAffiliateUrl(e.target.value)}
          placeholder={t.formUrlPlaceholder}
          maxLength={2048}
          className={`bg-black/40 border rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none font-mono ${blocksByTrust ? 'border-amber-500/50 focus:border-amber-400/70' : 'border-white/20 focus:border-violet-500/70'}`}
        />
        {affiliateUrl.trim() && (
          <p className={`text-xs ${isUrlTrusted ? 'text-emerald-400/80' : 'text-amber-400/80'}`}>
            {isUrlTrusted ? `✓ ${t.trustedBadge}` : `! ${t.notTrustedBadge}`}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!valid || submitting}
          className="text-sm font-semibold bg-violet-600 hover:bg-violet-500 disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
        >
          {submitting ? t.saving : initial ? t.save : t.add}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-semibold text-white/60 hover:text-white border border-white/20 px-4 py-2 rounded-lg transition-colors"
        >
          {t.cancel}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
function NotTrustedModal({ t, onClose }: { t: Texts; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-neutral-950 border border-amber-500/40 rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="text-amber-400 text-2xl leading-none">!</span>
          <h2 className="text-lg font-bold text-white">{t.notTrustedTitle}</h2>
        </div>
        <p className="text-sm text-white/70 leading-relaxed">{t.notTrustedBody}</p>
        <button
          type="button"
          onClick={onClose}
          className="self-start text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {t.notTrustedClose}
        </button>
      </div>
    </div>
  )
}
