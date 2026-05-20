'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

type PartnerLink = {
  id: string
  providerName: string
  affiliateUrl: string
  isDefault: boolean
  createdAt: string
}

const EMBED_ORIGIN = 'https://fractera.ai'

function buildEmbedUrl(lang: Lang, slug: string) {
  return `${EMBED_ORIGIN}/${lang}/embed/signup?ref=${slug}`
}

type Lang = 'ru' | 'en'

function getTexts(lang: Lang) {
  const isRu = lang === 'ru'
  return {
    partnerIdLabel: isRu ? 'ID партнёра' : 'Partner ID',
    activeBadge: isRu ? 'Активен' : 'Active',
    tabLinks: isRu ? 'Ссылки' : 'Links',
    tabWidget: isRu ? 'Виджет' : 'Widget',

    // Links tab
    linksIntro: isRu
      ? 'Подключайте партнёрские ссылки от любых VPS-провайдеров. Одна из них помечается «по умолчанию» — именно она будет использоваться в виджете и (позже) на вашем зеркальном поддомене.'
      : 'Connect affiliate links from any VPS providers. One link is flagged "default" — it is the one used by the widget and (later) on your mirror subdomain.',
    loading: isRu ? 'Загружаем…' : 'Loading…',
    empty: isRu ? 'У вас пока нет ни одной партнёрской ссылки.' : 'You have no affiliate links yet.',
    addLink: isRu ? '+ Добавить партнёрскую ссылку' : '+ Add affiliate link',
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

    // Widget tab
    referralsLabel: isRu ? 'Регистраций через ваш ref' : 'Signups via your ref',
    referralsHint: isRu
      ? 'Считаются пользователи, прошедшие активацию учётной записи (клик по magic-link) после прихода через виджет с вашим идентификатором.'
      : 'Counts users who completed account activation (clicked the magic link) after coming through the widget with your identifier.',
    snippetLabel: isRu ? 'Snippet для встраивания' : 'Embed snippet',
    copy: isRu ? 'Копировать' : 'Copy',
    copied: isRu ? 'Скопировано' : 'Copied',
    copyFailed: isRu ? 'Не получилось скопировать' : 'Copy failed',
    howWorksLabel: isRu ? 'Как это будет работать' : 'How it will work',
    howWorksBody: isRu
      ? 'Виджет покажет упрощённую форму регистрации Fractera. Внутри будет кнопка с названием вашего default-провайдера (из вкладки «Ссылки») и переход на вашу партнёрскую ссылку. Учётная запись создаётся на нашем сервере, виджет отображает «письмо отправлено, проверьте спам» — без полного процесса развёртывания.'
      : 'The widget shows a simplified Fractera signup form. Inside it will surface a button labelled with your default provider name (from the «Links» tab) and link to your affiliate URL. Accounts are created on our server, the widget shows «email sent, check spam» — without the full deployment flow.',
  }
}

export function PartnerCabinetView({ partnerSlug, lang }: { partnerSlug: string; lang: Lang }) {
  const t = getTexts(lang)
  const [tab, setTab] = useState<'links' | 'widget'>('links')

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

      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/10 self-start">
        <button
          type="button"
          onClick={() => setTab('links')}
          className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${tab === 'links' ? 'bg-violet-500/20 text-violet-200' : 'text-white/60 hover:text-white'}`}
        >
          {t.tabLinks}
        </button>
        <button
          type="button"
          onClick={() => setTab('widget')}
          className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${tab === 'widget' ? 'bg-violet-500/20 text-violet-200' : 'text-white/60 hover:text-white'}`}
        >
          {t.tabWidget}
        </button>
      </div>

      {tab === 'links' ? <LinksTab t={t} /> : <WidgetTab partnerSlug={partnerSlug} t={t} lang={lang} />}
    </div>
  )
}

type Texts = ReturnType<typeof getTexts>

function LinksTab({ t }: { t: Texts }) {
  const [links, setLinks] = useState<PartnerLink[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const fetchLinks = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/partner/links')
      if (res.ok) {
        const data = await res.json()
        setLinks(data.links ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

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
      <p className="text-sm text-white/60 leading-relaxed">{t.linksIntro}</p>

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
                    t={t}
                    initial={link}
                    onCancel={() => setEditingId(null)}
                    onSaved={() => { setEditingId(null); fetchLinks() }}
                  />
                ) : (
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">{link.providerName}</span>
                        {link.isDefault && (
                          <span className="text-xs font-mono text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/30">{t.defaultBadge}</span>
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
              t={t}
              onCancel={() => setAdding(false)}
              onSaved={() => { setAdding(false); fetchLinks() }}
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
    </div>
  )
}

function LinkForm({ t, initial, onCancel, onSaved }: {
  t: Texts
  initial?: PartnerLink
  onCancel: () => void
  onSaved: () => void
}) {
  const [providerName, setProviderName] = useState(initial?.providerName ?? '')
  const [affiliateUrl, setAffiliateUrl] = useState(initial?.affiliateUrl ?? '')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (submitting) return
    setSubmitting(true)
    try {
      const url = initial ? `/api/partner/links/${initial.id}` : '/api/partner/links'
      const method = initial ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerName, affiliateUrl }),
      })
      if (res.ok) {
        toast.success(initial ? t.linkUpdated : t.linkAdded)
        onSaved()
      } else {
        const d = await res.json().catch(() => ({}))
        toast.error(d.error ?? t.saveFailed)
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
          className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/70"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">{t.formUrlLabel}</label>
        <input
          type="url"
          value={affiliateUrl}
          onChange={e => setAffiliateUrl(e.target.value)}
          placeholder={t.formUrlPlaceholder}
          maxLength={2048}
          className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/70 font-mono"
        />
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
      <div className="flex flex-col gap-2 rounded-xl border border-violet-500/30 bg-violet-500/[0.04] p-4">
        <p className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">{t.referralsLabel}</p>
        <p className="text-3xl font-bold text-white font-mono">{referralCount === null ? '—' : referralCount}</p>
        <p className="text-xs text-white/50 leading-relaxed">{t.referralsHint}</p>
      </div>

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

      <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <p className="text-xs font-mono font-bold text-white/50 uppercase tracking-widest">{t.howWorksLabel}</p>
        <p className="text-sm text-white/65 leading-relaxed">{t.howWorksBody}</p>
      </div>
    </div>
  )
}
