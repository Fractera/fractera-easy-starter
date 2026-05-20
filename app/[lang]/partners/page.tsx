const CONTABO_AFFILIATE_PROGRAM_URL = 'https://contabo.com/en/affiliate-program/'

export default async function PartnersPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const isRu = lang === 'ru'

  const t = isRu ? {
    badge: 'Партнёрская программа',
    h1: 'Зарабатывайте вместе с Fractera',
    subtitle: 'Партнёрство с Contabo — пассивный доход, пока ваш контент жив.',
    mainTitle: 'Реферальная программа Contabo',
    mainBody: 'Наш рекомендованный VPS-провайдер — Contabo. Это доверенный, давно работающий хостинг, который стабильно выплачивает партнёрское вознаграждение. Станьте его аффилиатом, передайте нам свою партнёрскую ссылку — мы разместим её в блоке рекомендованных серверов на лендинге. Каждый клиент, купивший сервер через ваш канал, приносит вам выплату напрямую от Contabo.',
    rewardsTitle: 'Размер вознаграждения',
    rewardsItems: [
      'Наша рекомендованная конфигурация (Cloud VPS 10, Ubuntu 24.04) — 20 € за каждого нового клиента.',
      'Более мощные конфигурации — 30 € и выше за клиента.',
      'Точные тарифы и условия выплат — на странице партнёрской программы Contabo.',
    ],
    mainHow: 'Как это работает:',
    mainSteps: [
      'Перейдите на страницу партнёрской программы Contabo (ссылка ниже) и подайте заявку. Contabo не выдаёт партнёрскую ссылку мгновенно: они проверяют страницу, на которой будет размещена ссылка, и запрашивают базовые юридические данные о вашей компании. Это стандартная практика для серьёзной партнёрки.',
      'Проверка занимает обычно несколько рабочих дней. После одобрения Contabo выдаёт вашу персональную партнёрскую ссылку.',
      'Передайте ссылку нам — на этом этапе принимаем заявки по email: admin@fractera.ai.',
      'Мы размещаем вашу ссылку на лендинге в блоке рекомендованных серверов. Каждый купленный через неё VPS приносит вам выплату напрямую от Contabo.',
    ],
    mainNote: 'Fractera не участвует в транзакции — выплаты идут напрямую от Contabo. Размер, периодичность и условия определяет Contabo. Подходит для блогеров, контент-мейкеров, технических авторов и YouTube-каналов.',
    soonTitle: 'Что появится позже',
    soonBody: 'Сейчас мы готовим полноценный партнёрский кабинет с автоматической регистрацией, личным поддоменом-зеркалом (например, your-name.partners.fractera.ai) и статистикой кликов. До его запуска заявки принимаем вручную — пишите на admin@fractera.ai.',
    benefitsTitle: 'Почему Contabo',
    benefits: [
      'Стабильность — десятилетия на рынке, репутация надёжного европейского хостинга.',
      'Цена и ресурсы — Cloud VPS 10 (4 vCPU, 8 ГБ RAM, 150 ГБ NVMe SSD) от €4.50/мес. Идеально под AI-нагрузки Fractera.',
      'Прозрачная партнёрка — фиксированная выплата за каждого приведённого клиента, без скрытых условий.',
      'Прямая выплата от Contabo — без посредников и задержек со стороны Fractera.',
    ],
    ctaTitle: 'Подайте заявку в Contabo',
    ctaBody: 'Откройте страницу партнёрской программы Contabo, изучите условия и подайте заявку. После одобрения напишите нам — мы разместим вашу ссылку на лендинге.',
    ctaButton: 'Открыть Contabo Affiliate Program',
    ctaNote: 'По вопросам: admin@fractera.ai',
  } : {
    badge: 'Partner Program',
    h1: 'Earn with Fractera',
    subtitle: 'Partner with Contabo — passive income for as long as your content stays alive.',
    mainTitle: 'Contabo Referral Program',
    mainBody: 'Our recommended VPS provider is Contabo — a trusted, long-standing host with a reliable affiliate-payout track record. Become a Contabo affiliate, submit your referral link to us, and we display it in the recommended servers block on the landing page. Every customer who buys a server through your link pays out directly from Contabo to you.',
    rewardsTitle: 'Reward amount',
    rewardsItems: [
      'Our recommended configuration (Cloud VPS 10, Ubuntu 24.04) — 20 € per new customer.',
      'Higher-tier configurations — 30 € and above per customer.',
      'Exact rates and payout terms are listed on the Contabo affiliate program page.',
    ],
    mainHow: 'How it works:',
    mainSteps: [
      'Open the Contabo affiliate program page (link below) and apply. Contabo does not issue affiliate links instantly: they review the page where the link will be hosted and ask for basic legal details about your company. This is standard practice for a serious affiliate program.',
      'Review typically takes a few business days. Once approved, Contabo gives you your personal affiliate link.',
      'Submit the link to us — at this stage we accept submissions by email: admin@fractera.ai.',
      'We place your link on the landing page in the recommended servers block. Every VPS purchased through it pays you directly from Contabo.',
    ],
    mainNote: 'Fractera is not involved in the transaction — payouts come directly from Contabo. Contabo sets the amount, schedule, and terms. Ideal for bloggers, content creators, technical writers, and YouTube channels.',
    soonTitle: 'Coming soon',
    soonBody: 'A full partner cabinet is in development — automated signup, your own mirror subdomain (e.g., your-name.partners.fractera.ai), and click analytics. Until it ships, we accept submissions manually — email admin@fractera.ai.',
    benefitsTitle: 'Why Contabo',
    benefits: [
      'Reliability — decades on the market, reputation as a dependable European host.',
      'Resources for the price — Cloud VPS 10 (4 vCPU, 8 GB RAM, 150 GB NVMe SSD) from €4.50/mo. A natural fit for Fractera AI workloads.',
      'Transparent affiliate program — flat payout per customer, no hidden terms.',
      'Direct payout from Contabo — no middlemen, no Fractera-side delays.',
    ],
    ctaTitle: 'Apply at Contabo',
    ctaBody: 'Open the Contabo affiliate program page, review the terms, and apply. Once approved, email us — we will place your link on the landing page.',
    ctaButton: 'Open Contabo Affiliate Program',
    ctaNote: 'Questions? admin@fractera.ai',
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Fractera', item: 'https://fractera.ai' },
      { '@type': 'ListItem', position: 2, name: isRu ? 'Партнёры' : 'Partners', item: `https://fractera.ai/${lang}/partners` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-20 flex flex-col gap-16">

        {/* Header */}
        <div className="flex flex-col gap-4">
          <span className="self-start text-xs font-mono font-bold text-violet-400 uppercase tracking-widest border border-violet-500/30 bg-violet-500/[0.06] px-3 py-1 rounded-full">
            {t.badge}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight text-white leading-tight">
            {t.h1}
          </h1>
          <p className="text-lg text-white/60 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Main offer */}
        <div className="flex flex-col gap-5 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-violet-900/20 to-black/60 p-8">
          <h2 className="text-2xl font-bold text-white">{t.mainTitle}</h2>
          <p className="text-base text-white/70 leading-relaxed">{t.mainBody}</p>

          {/* Rewards */}
          <div className="flex flex-col gap-3 pt-2">
            <p className="text-sm font-semibold text-white/50 uppercase tracking-widest">{t.rewardsTitle}</p>
            <ul className="flex flex-col gap-2">
              {t.rewardsItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-base text-white/80 leading-relaxed">
                  <span className="shrink-0 text-violet-400 mt-1">€</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* How it works */}
          <div className="flex flex-col gap-3 pt-2">
            <p className="text-sm font-semibold text-white/50 uppercase tracking-widest">{t.mainHow}</p>
            <ol className="flex flex-col gap-3">
              {t.mainSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-base text-white/80 leading-relaxed">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-xs font-bold text-violet-300 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <p className="text-xs text-white/35 leading-relaxed border-t border-white/10 pt-4">{t.mainNote}</p>
        </div>

        {/* Coming soon — partner cabinet */}
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-6">
          <h2 className="text-lg font-bold text-amber-300">{t.soonTitle}</h2>
          <p className="text-sm text-white/70 leading-relaxed">{t.soonBody}</p>
        </div>

        {/* Why Contabo */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-white">{t.benefitsTitle}</h2>
          <ul className="flex flex-col gap-3">
            {t.benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-base text-white/80 leading-relaxed">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-violet-400 mt-2.5" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-5 items-center text-center">
          <h2 className="text-2xl font-bold text-white">{t.ctaTitle}</h2>
          <p className="text-base text-white/60 max-w-md leading-relaxed">{t.ctaBody}</p>
          <a
            href={CONTABO_AFFILIATE_PROGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-violet-500/30"
          >
            {t.ctaButton} ↗
          </a>
          <p className="text-sm text-white/35">{t.ctaNote}</p>
        </div>

      </div>
    </main>
    </>
  )
}
