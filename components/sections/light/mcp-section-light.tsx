'use client'

import { useState } from 'react'

const MCP_URL = 'https://www.fractera.ai/api/mcp/light'

type Lang = 'en' | 'ru'

function getTexts(lang: Lang) {
  const isRu = lang === 'ru'
  return {
    label: isRu ? 'MCP · AI-агенты' : 'MCP · AI Agents',
    h2: isRu
      ? 'Разверни Fractera Light через AI-агента'
      : 'Deploy Fractera Light through an AI agent',
    description: isRu
      ? 'Подключи Light MCP к Claude, Codex, Gemini или любому другому агенту — и развёртывание превратится в обычный диалог. Агент задаст четыре вопроса (email, IP, пароль), запустит установку и пришлёт тебе ссылку на готовый сервер по email. Это полностью изолированный поток от основного Fractera MCP — никакой AI на сервер не ставится.'
      : 'Connect Light MCP to Claude, Codex, Gemini or any other agent — and deployment becomes a plain chat. The agent asks four questions (email, IP, password), launches the install and emails you the live URL once it is done. This flow is fully isolated from the main Fractera MCP — no AI is installed on the server.',
    serverUrlLabel: isRu ? 'URL Light MCP сервера' : 'Light MCP server URL',
    copy: isRu ? 'Скопировать' : 'Copy',
    copied: isRu ? 'Скопировано' : 'Copied',
    helpHint: isRu
      ? '* Никогда не использовали MCP? Просто скажите AI-агенту: «Подключи MCP-сервер по этой ссылке и разверни Fractera Light». Настройка занимает ~15 секунд.'
      : '* Never used MCP before? Just tell your AI agent: "Connect the MCP server at this URL and deploy Fractera Light for me." Setup takes ~15 seconds.',
    timeNote: isRu
      ? 'Установка занимает 6–10 минут. Чат можно закрыть — все обновления приходят на email (начало, recovery-токен, прогресс, готовый URL).'
      : 'Install takes 6–10 minutes. You can close the chat — all updates arrive by email (start, recovery token, progress, final URL).',
  }
}

export function McpSectionLight({ lang }: { lang: Lang }) {
  const t = getTexts(lang)
  const [copied, setCopied] = useState(false)

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(MCP_URL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard may be blocked — user can still triple-click and copy */
    }
  }

  return (
    <div id="mcp-section" className="flex flex-col gap-6 w-full scroll-mt-16">
      <div className="flex flex-col gap-3 items-start text-left md:items-center md:text-center">
        <p className="text-xs font-mono font-bold text-sky-700 uppercase tracking-widest">{t.label}</p>
        <h2 className="max-w-3xl font-serif font-bold leading-tight text-slate-900 text-2xl md:text-3xl lg:text-4xl">
          {t.h2}
        </h2>
        <p className="max-w-2xl text-base text-slate-600">
          {t.description}
        </p>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-sky-200 bg-sky-50 p-4 md:p-5">
        <p className="text-xs font-mono font-bold text-sky-700 uppercase tracking-widest">{t.serverUrlLabel}</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm md:text-base font-mono text-slate-900 bg-white border border-sky-200 rounded-lg px-3 py-2.5 break-all select-all">
            {MCP_URL}
          </code>
          <button
            type="button"
            onClick={copyUrl}
            className="shrink-0 inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold px-4 py-2.5 rounded-lg text-sm transition-colors"
          >
            {copied ? t.copied : t.copy}
          </button>
        </div>
        <p className="text-xs md:text-sm text-amber-700/90 leading-relaxed mt-1">{t.helpHint}</p>
      </div>

      <p className="text-sm text-slate-600 max-w-2xl md:mx-auto md:text-center leading-relaxed">
        {t.timeNote}
      </p>
    </div>
  )
}
