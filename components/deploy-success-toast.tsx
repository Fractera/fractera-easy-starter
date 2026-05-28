'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { buildUrls } from '@/lib/subdomain-helpers'

type SuccessToastStrings = {
  title: string
  siteLabel: string
  adminLabel: string
  dashboardNote: string
  checkboxLabel: string
  closeButton: string
}

export function DeploySuccessToast({
  subdomain,
  strings,
  onClose,
}: {
  subdomain: string
  strings: SuccessToastStrings
  onClose: () => void
}) {
  const [confirmed, setConfirmed] = useState(false)
  const urls = buildUrls(subdomain)
  const isIpMode = urls.mode === 'ip'

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop — non-interactive, just visual */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Toast panel */}
      <div className="relative w-full max-w-md flex flex-col gap-5 rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-900/60 to-black border border-emerald-500/70 p-6 shadow-2xl shadow-emerald-500/20 my-6">

        {/* Header */}
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-lg font-bold text-emerald-300 leading-snug">
            {strings.title}
          </p>
        </div>

        {isIpMode && (
          <>
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-3.5 text-[13px] leading-relaxed text-emerald-100/90">
              <p className="font-semibold text-emerald-300 mb-1">✓ Полностью автономный сервер</p>
              <p>
                Работает на вашем VPS. Никаких зависимостей от Fractera — если мы исчезнем завтра, ваш сервер
                продолжит работать. Весь код, данные и доступы — ваши.
              </p>
            </div>
            <div className="rounded-lg border border-amber-500/50 bg-amber-950/30 p-3.5 text-[13px] leading-relaxed text-amber-100/90">
              <p className="font-semibold text-amber-300 mb-2">⚠ Как открыть ссылки ниже — обязательно прочитайте</p>
              <p className="mb-2">
                Ссылки используют HTTP без SSL (SSL появится автоматически когда вы привяжете свой домен).
                Браузер покажет «Небезопасное соединение». Откройте так:
              </p>
              <ol className="list-decimal pl-5 space-y-1.5">
                <li>
                  Откройте ссылку в режиме <strong>инкогнито</strong> (Chrome: <code className="bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-200 font-mono text-xs">Ctrl+Shift+N</code>,
                  Firefox: <code className="bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-200 font-mono text-xs">Ctrl+Shift+P</code>) — это обходит кеш HTTPS от прошлых деплоев.
                </li>
                <li>
                  Если всё равно видите предупреждение — <strong>Дополнительно → Перейти на сайт</strong>.
                  В Chrome можно просто напечатать на клавиатуре <code className="bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-200 font-mono text-xs">thisisunsafe</code>.
                </li>
                <li>
                  Вы подключаетесь к <strong>своему собственному серверу</strong> — никто не перехватывает трафик.
                  Предупреждение значит лишь «нет SSL-сертификата».
                </li>
              </ol>
              <p className="mt-2.5 pt-2.5 border-t border-amber-500/30 text-amber-200/90">
                <strong>✓ После привязки реального домена в админке</strong> Fractera автоматически получит
                бесплатный SSL-сертификат (Let's Encrypt), и предупреждения исчезнут — браузер покажет
                зелёный замок.
              </p>
            </div>
          </>
        )}

        {/* Links */}
        <div className="flex flex-col gap-2">
          <a
            href={urls.appUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between group bg-white/[0.05] hover:bg-white/[0.10] border border-emerald-500/40 hover:border-emerald-400/60 rounded-xl px-4 py-3 transition-colors"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                {strings.siteLabel}
              </span>
              <span className="text-sm text-white font-mono font-bold">{urls.appLabel}</span>
            </div>
            <span className="text-emerald-400 group-hover:text-emerald-300 text-base font-bold transition-colors">↗</span>
          </a>

          <a
            href={urls.adminUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between group bg-white/[0.05] hover:bg-white/[0.10] border border-emerald-500/40 hover:border-emerald-400/60 rounded-xl px-4 py-3 transition-colors"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                {strings.adminLabel}
              </span>
              <span className="text-sm text-white font-mono font-bold">{urls.adminLabel}</span>
            </div>
            <span className="text-emerald-400 group-hover:text-emerald-300 text-base font-bold transition-colors">↗</span>
          </a>
        </div>

        {/* Dashboard note */}
        <p className="text-sm text-emerald-200/70 leading-relaxed">
          {strings.dashboardNote}
        </p>

        {/* Divider */}
        <div className="h-px bg-emerald-500/20" />

        {/* Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={e => setConfirmed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-emerald-400 cursor-pointer shrink-0"
          />
          <span className="text-sm text-white leading-snug font-medium">
            {strings.checkboxLabel}
          </span>
        </label>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          disabled={!confirmed}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900/50 disabled:text-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-base transition-colors disabled:cursor-not-allowed"
        >
          {strings.closeButton}
        </button>
      </div>
    </div>
  )
}
