'use client'

// "Make good use of the wait" block shown during deployment: buy a domain +
// set up DNS. Used by the partner page and the embed widget (their progress
// renders inline, outside the main i18n context — so this carries its own EN+RU
// copy, rule 4а). The main landing flow has its own inline copy in
// deploy-progress-toast.tsx; this component mirrors that UX for the partner
// surfaces, where the domain link comes from the partner's own referral links.

import { useState, Fragment } from 'react'

type Lang = 'en' | 'ru'

// The 8 hostnames covered by one multi-SAN cert (ai-workspace domain/route.ts
// SUBDOMAINS). Each needs an A record to the server IP. "@" = the apex domain.
const DNS_HOSTS = ['@', 'www', 'auth', 'admin', 'data', 'hermes', 'lightrag', 'chat']

function getTexts(lang: Lang) {
  const isRu = lang === 'ru'
  return {
    tipTitle: isRu
      ? 'Как с пользой провести время, пока мы устанавливаем на ваш сервер программное обеспечение?'
      : 'How to make good use of the time while we install the software on your server?',
    tipBody: isRu
      ? 'Если вы ещё не купили домен для своего проекта — сейчас самое время. Проект может работать и без персонального домена, но именно личный домен открывает полный набор возможностей.'
      : 'If you have not bought a domain for your project yet, now is the perfect moment. The project works fine without a personal domain, but a personal domain unlocks the full set of capabilities.',
    domainButton: isRu ? 'Купить домен' : 'Buy a domain',
    dnsButton: isRu ? 'Настроить DNS' : 'Set up DNS',
    dnsIntro: isRu
      ? 'Направьте домен на сервер: в DNS у регистратора добавьте эти A-записи — каждая указывает на IP вашего сервера. Затем активируйте домен внутри рабочего пространства.'
      : 'Point your domain at the server: in your registrar\'s DNS, add these A records — each pointing to your server IP. Then activate the domain inside the workspace.',
    dnsCovers: isRu
      ? 'Совет: вместо списка можно добавить одну wildcard-запись (Host *).'
      : 'Tip: a single wildcard record (Host *) instead of the list works too.',
  }
}

export function DomainDnsBlock({
  domainUrl,
  serverIp,
  lang,
}: {
  domainUrl?: string | null
  serverIp?: string
  lang: Lang
}) {
  const [showDns, setShowDns] = useState(false)
  const t = getTexts(lang)
  const ip = serverIp?.trim() || '<your-server-IP>'

  if (!domainUrl) return null

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-violet-500/30 bg-violet-500/10 p-4">
      {showDns ? (
        <>
          <p className="text-xs text-violet-200/80 leading-relaxed">{t.dnsIntro}</p>
          <div className="rounded-lg border border-violet-500/20 bg-black/30 p-3 font-mono text-[11px]">
            <div className="grid grid-cols-[1.2fr_auto_2fr] gap-x-3 gap-y-1">
              <span className="text-violet-400/80">Host</span>
              <span className="text-violet-400/80">Type</span>
              <span className="text-violet-400/80">Value</span>
              {DNS_HOSTS.map(h => (
                <Fragment key={h}>
                  <span className="text-violet-200">{h}</span>
                  <span className="text-violet-400">A</span>
                  <span className="text-violet-100">{ip}</span>
                </Fragment>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-violet-200/60 leading-relaxed">{t.dnsCovers}</p>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold text-violet-200 leading-snug">{t.tipTitle}</p>
          <p className="text-xs text-violet-200/70 leading-relaxed">{t.tipBody}</p>
        </>
      )}

      <div className="grid grid-cols-2 gap-2">
        <a
          href={domainUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-violet-600 px-3 py-2 text-center text-sm font-bold text-white transition-colors hover:bg-violet-500"
        >
          {t.domainButton}
        </a>
        <button
          type="button"
          onClick={() => setShowDns(v => !v)}
          aria-expanded={showDns}
          className={`rounded-lg border px-3 py-2 text-sm font-bold transition-colors ${
            showDns
              ? 'border-violet-400 bg-violet-500/20 text-white'
              : 'border-violet-500/50 text-violet-200 hover:bg-violet-500/15'
          }`}
        >
          {t.dnsButton}
        </button>
      </div>
    </div>
  )
}
