'use client'

// Shared deploy options for the partner surfaces (partner page mirror + embed
// widget), bringing them to parity with the live landing install form
// (components/install-form.tsx):
//   1. Component selection — standard (full) vs custom build. Mirrors the
//      install-form switch/checkbox UX and the same lib/components-catalog ids.
//   2. Password-change security acknowledgment (step 78) — Fractera never stores
//      the SSH password; the user must confirm they will change it after deploy.
//
// These two partner surfaces use a self-contained bilingual `getTexts(lang)`
// pattern (they render on the partner mirror page /partner/<lang>/<slug> / inside
// an iframe, outside the main i18n context), so this component carries its own EN+RU copy
// (rule 4а — EN+RU coverage). Labels mirror the catalog grouping; the catalog
// itself stays the single source of truth for the component ids.

import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { SELECTABLE_COMPONENTS, type ComponentId } from '@/lib/components-catalog'

type Lang = 'en' | 'ru'

function getTexts(lang: Lang) {
  const isRu = lang === 'ru'
  return {
    fullLabel: isRu ? 'Стандартная сборка — установить всё' : 'Standard build — install everything',
    customLabel: isRu ? 'Кастомная сборка — выбрать компоненты' : 'Custom build — choose components',
    customHint: isRu
      ? 'Базовые сервисы (Shell, Auth, Admin, Data, терминал) ставятся всегда. Выберите, какие AI-агенты и сервисы добавить.'
      : 'Core services (Shell, Auth, Admin, Data, terminal) are always installed. Choose which AI agents and services to add.',
    agentsTitle: isRu ? 'AI-агенты' : 'AI agents',
    servicesTitle: isRu ? 'Сервисы' : 'Services',
    coreNote: isRu
      ? 'Снять все галочки = простой сервер без AI.'
      : 'Unchecking everything = a plain server with no AI.',
    securityNote: isRu
      ? 'Fractera подключается по SSH один раз и не хранит ваш пароль. После развёртывания смените пароль сервера — это ваша ответственность.'
      : 'Fractera connects over SSH once and never stores your password. After deployment, change the server password — it is your responsibility.',
    passwordAck: isRu
      ? 'Я понимаю, что должен сменить пароль сервера после развёртывания.'
      : 'I understand I should change my server password after deployment.',
    items: {
      'claude-code': { name: 'Claude Code', desc: isRu ? 'Агентный CLI для кода' : 'Agentic coding CLI' },
      'codex':       { name: 'Codex',       desc: isRu ? 'Агентный CLI для кода' : 'Agentic coding CLI' },
      'gemini-cli':  { name: 'Gemini CLI',  desc: isRu ? 'Агентный CLI для кода' : 'Agentic coding CLI' },
      'qwen-code':   { name: 'Qwen Code',   desc: isRu ? 'Агентный CLI для кода' : 'Agentic coding CLI' },
      'kimi-code':   { name: 'Kimi Code',   desc: isRu ? 'Агентный CLI для кода' : 'Agentic coding CLI' },
      'memory':      { name: isRu ? 'Память (LightRAG)' : 'Memory (LightRAG)', desc: isRu ? 'Векторная база знаний' : 'Vector knowledge base' },
      'brain':       { name: isRu ? 'Мозг (Hermes)' : 'Brain (Hermes)',        desc: isRu ? 'AI-оркестратор агентов' : 'AI orchestration agent' },
    } as Record<ComponentId, { name: string; desc: string }>,
  }
}

export function PartnerDeployOptions({
  lang,
  customMode,
  setCustomMode,
  selected,
  setSelected,
  passwordAck,
  setPasswordAck,
  disabled,
}: {
  lang: Lang
  customMode: boolean
  setCustomMode: (v: boolean) => void
  selected: ComponentId[]
  setSelected: (updater: (prev: ComponentId[]) => ComponentId[]) => void
  passwordAck: boolean
  setPasswordAck: (v: boolean) => void
  disabled?: boolean
}) {
  const t = getTexts(lang)

  return (
    <div className="flex flex-col gap-3">
      {/* Component selection — full vs custom */}
      <div className="flex flex-col gap-3 bg-white/[0.03] border border-white/15 rounded-xl p-4">
        <label className="flex items-center justify-between gap-3 cursor-pointer select-none">
          <span className="text-sm text-white font-medium">
            {customMode ? t.customLabel : t.fullLabel}
          </span>
          {/* Switch ON = standard/full build (default). OFF reveals checkboxes.
              Visual inverted from customMode so "all active" reads as ON. */}
          <Switch checked={!customMode} onCheckedChange={(v) => setCustomMode(!v)} disabled={disabled} />
        </label>

        {customMode && (
          <div className="flex flex-col gap-4 pt-1">
            <p className="text-xs text-white/45 leading-relaxed">{t.customHint}</p>
            {(['agent', 'service'] as const).map(group => (
              <div key={group} className="flex flex-col gap-2.5">
                <p className="text-[11px] uppercase tracking-widest text-white/40">
                  {group === 'agent' ? t.agentsTitle : t.servicesTitle}
                </p>
                {SELECTABLE_COMPONENTS.filter(c => c.group === group).map(c => {
                  const it = t.items[c.id]
                  const on = selected.includes(c.id)
                  return (
                    <label key={c.id} className="flex items-start gap-3 cursor-pointer select-none">
                      <Checkbox
                        checked={on}
                        disabled={disabled}
                        onCheckedChange={(v) =>
                          setSelected(prev => v ? [...new Set([...prev, c.id])] : prev.filter(x => x !== c.id))
                        }
                        className="mt-0.5"
                      />
                      <span className="flex flex-col">
                        <span className="text-sm text-white leading-snug">{it.name}</span>
                        <span className="text-xs text-white/40 leading-snug">{it.desc}</span>
                      </span>
                    </label>
                  )
                })}
              </div>
            ))}
            <p className="text-xs text-white/35 leading-relaxed border-t border-white/10 pt-2">
              {t.coreNote}
            </p>
          </div>
        )}
      </div>

      {/* Password-change security acknowledgment (step 78) — gates the deploy button */}
      <div className="flex flex-col gap-3 bg-white/[0.04] border border-white/20 rounded-xl p-4">
        <p className="text-xs text-white/60 leading-relaxed">{t.securityNote}</p>
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <Checkbox
            checked={passwordAck}
            disabled={disabled}
            onCheckedChange={v => setPasswordAck(!!v)}
            className="mt-0.5"
          />
          <span className="text-sm text-white leading-snug">{t.passwordAck}</span>
        </label>
      </div>
    </div>
  )
}
