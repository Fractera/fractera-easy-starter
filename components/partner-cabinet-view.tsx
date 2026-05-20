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

const EMBED_BASE = 'https://embed.fractera.ai/signup'

export function PartnerCabinetView({ partnerSlug }: { partnerSlug: string }) {
  const [tab, setTab] = useState<'links' | 'widget'>('links')

  return (
    <div className="flex flex-col gap-4">
      {/* Partner ID + tab switcher */}
      <div className="flex flex-col gap-3 rounded-xl border border-violet-500/30 bg-violet-500/[0.04] p-4">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <p className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">Partner ID</p>
          <span className="text-xs font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">Active</span>
        </div>
        <p className="font-mono text-lg md:text-xl font-bold text-white break-all select-all">{partnerSlug}</p>
      </div>

      <div className="flex gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/10 self-start">
        <button
          type="button"
          onClick={() => setTab('links')}
          className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${tab === 'links' ? 'bg-violet-500/20 text-violet-200' : 'text-white/60 hover:text-white'}`}
        >
          Ссылки
        </button>
        <button
          type="button"
          onClick={() => setTab('widget')}
          className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${tab === 'widget' ? 'bg-violet-500/20 text-violet-200' : 'text-white/60 hover:text-white'}`}
        >
          Виджет
        </button>
      </div>

      {tab === 'links' ? <LinksTab /> : <WidgetTab partnerSlug={partnerSlug} />}
    </div>
  )
}

function LinksTab() {
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
      toast.success('Ссылка удалена')
      fetchLinks()
    } else {
      toast.error('Не удалось удалить')
    }
  }

  async function handleSetDefault(id: string) {
    const res = await fetch(`/api/partner/links/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDefault: true }),
    })
    if (res.ok) {
      toast.success('По умолчанию')
      fetchLinks()
    } else {
      toast.error('Не удалось обновить')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-white/60 leading-relaxed">
          Подключайте партнёрские ссылки от любых VPS-провайдеров. Одна из них помечается «по умолчанию» — именно она будет использоваться в виджете и (позже) на вашем зеркальном поддомене.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-white/40 py-4">Загружаем…</div>
      ) : links.length === 0 && !adding ? (
        <div className="flex flex-col gap-3 rounded-xl border border-dashed border-white/15 p-6 items-start">
          <p className="text-sm text-white/60">У вас пока нет ни одной партнёрской ссылки.</p>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            + Добавить партнёрскую ссылку
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col">
            {links.map((link, i) => (
              <div key={link.id} className={`py-3 flex flex-col gap-2 ${i > 0 ? 'border-t border-white/10' : ''}`}>
                {editingId === link.id ? (
                  <LinkForm
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
                          <span className="text-xs font-mono text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/30">по умолчанию</span>
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
                          Сделать default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditingId(link.id)}
                        className="text-xs text-white/50 hover:text-white border border-white/15 hover:border-white/40 px-2 py-1 rounded transition-colors"
                      >
                        Изменить
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(link.id)}
                        className="text-xs text-red-400/70 hover:text-red-400 border border-white/15 hover:border-red-500/40 px-2 py-1 rounded transition-colors"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {adding ? (
            <LinkForm
              onCancel={() => setAdding(false)}
              onSaved={() => { setAdding(false); fetchLinks() }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="self-start text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
              + Добавить партнёрскую ссылку
            </button>
          )}
        </>
      )}
    </div>
  )
}

function LinkForm({ initial, onCancel, onSaved }: {
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
        toast.success(initial ? 'Ссылка обновлена' : 'Ссылка добавлена')
        onSaved()
      } else {
        const d = await res.json().catch(() => ({}))
        toast.error(d.error ?? 'Ошибка сохранения')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const valid = providerName.trim().length > 0 && /^https?:\/\//i.test(affiliateUrl.trim())

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-violet-500/30 bg-violet-500/[0.04] p-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">Название провайдера</label>
        <input
          type="text"
          value={providerName}
          onChange={e => setProviderName(e.target.value)}
          placeholder="Например, Contabo"
          maxLength={80}
          className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/70"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">Партнёрская ссылка</label>
        <input
          type="url"
          value={affiliateUrl}
          onChange={e => setAffiliateUrl(e.target.value)}
          placeholder="https://..."
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
          {submitting ? 'Сохраняем…' : initial ? 'Сохранить' : 'Добавить'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-semibold text-white/60 hover:text-white border border-white/20 px-4 py-2 rounded-lg transition-colors"
        >
          Отмена
        </button>
      </div>
    </div>
  )
}

function WidgetTab({ partnerSlug }: { partnerSlug: string }) {
  const snippet = `<iframe\n  src="${EMBED_BASE}?ref=${partnerSlug}"\n  width="100%" height="640"\n  style="border:0; border-radius:16px"\n></iframe>`

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet)
      toast.success('Скопировано')
    } catch {
      toast.error('Не получилось скопировать')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-4">
        <p className="text-xs font-mono font-bold text-amber-300 uppercase tracking-widest">В разработке</p>
        <p className="text-sm text-white/70 leading-relaxed">
          Embed-виджет ещё не запущен — endpoint <code className="text-amber-300 font-mono text-xs bg-black/40 px-1.5 py-0.5 rounded">{EMBED_BASE}</code> заработает в следующем шаге разработки. Snippet ниже уже содержит ваш идентификатор партнёра — его можно сохранить или скопировать сейчас, чтобы вставить в блог/статью когда виджет станет доступен.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">Snippet для встраивания</p>
          <button
            type="button"
            onClick={copy}
            className="text-xs font-semibold text-white/70 hover:text-white border border-white/15 hover:border-white/40 px-3 py-1 rounded transition-colors"
          >
            Копировать
          </button>
        </div>
        <pre className="text-xs md:text-sm font-mono text-emerald-300 bg-black/60 border border-white/10 rounded-lg p-4 overflow-x-auto leading-relaxed select-all">{snippet}</pre>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <p className="text-xs font-mono font-bold text-white/50 uppercase tracking-widest">Как это будет работать</p>
        <p className="text-sm text-white/65 leading-relaxed">
          Виджет покажет упрощённую форму регистрации Fractera. Внутри будет кнопка с названием вашего default-провайдера (из вкладки «Ссылки») и переход на вашу партнёрскую ссылку. Учётная запись создаётся на нашем сервере, виджет отображает «письмо отправлено, проверьте спам» — без полного процесса развёртывания.
        </p>
      </div>
    </div>
  )
}
