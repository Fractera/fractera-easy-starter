export default async function PartnersPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const isRu = lang === 'ru'

  const t = isRu ? {
    badge: 'Партнёрская программа',
    h1: 'Партнёрский кабинет Fractera',
    subtitle: 'Превратите ваш контент в стабильный источник пассивного дохода. Партнёрский кабинет Fractera — это инфраструктура, которая нужна каждому, кто рекомендует VPS-провайдеров своей аудитории.',

    featuresTitle: 'Что получает партнёр',
    features: [
      {
        title: 'Личный поддомен — зеркало нашего сайта',
        text: 'Адрес вида your-name.partners.fractera.ai с полной копией лендинга Fractera. Отличие одно: блок «Где купить VPS» содержит вашу партнёрскую ссылку вместо нашей. Поддомен решает требование любого хостинг-провайдера показать «сайт, где будет размещена партнёрская ссылка» — без этого партнёрский статус получить почти невозможно.',
      },
      {
        title: 'Кабинет для управления партнёрскими ссылками',
        text: 'Вы получаете партнёрскую ссылку у выбранного вами VPS-провайдера (например, Contabo) и подключаете её в кабинете. Подключайте сколько угодно ссылок и выбирайте, какая показывается на вашем зеркале. Кабинет ничего не знает о конкретных провайдерах — он работает с любой партнёрской ссылкой.',
      },
      {
        title: 'Embed-виджет регистрации сервера',
        text: 'Готовый snippet для встраивания формы регистрации Fractera прямо в ваш блог, статью или описание под YouTube-видео. Учётная запись создаётся на нашем сервере, виджет показывает упрощённый ответ — «письмо отправлено, проверьте спам». Дальше пользователь идёт по вашей партнёрской ссылке к провайдеру.',
      },
      {
        title: 'Активация сервера через AI-агента (MCP)',
        text: 'Партнёр рекомендует пользователю развернуть Fractera через AI-агента — Claude Code, Codex, Gemini CLI или другого. На первом шаге MCP-инструмент запрашивает идентификатор партнёра. После ввода — пользователь получает вашу партнёрскую ссылку для оплаты VPS у поставщика. После покупки сервера пользователь возвращается в того же AI-агента и продолжает настройку — без переключения контекста.',
      },
    ],

    howTitle: 'Как работает партнёрка',
    howBody: 'Партнёрская программа — это договор между вами и VPS-поставщиком (например, Contabo или любой другой хостинг с affiliate-программой). Fractera не участвует в денежной транзакции: выплаты идут напрямую от поставщика вам, по его тарифам и графику. Мы даём инфраструктуру вокруг — поддомен, кабинет, виджет, MCP — благодаря которой вы можете рекомендовать любого провайдера так, чтобы это конвертировалось в реальные клики и регистрации.',

    payoutsNoteTitle: 'Важно про выплаты',
    payoutsNoteBody: 'Никакой статистики выплат внутри Fractera-кабинета не будет. Деньги вам платит ваш VPS-поставщик, и историю выплат вы видите в его собственном кабинете. Мы можем показать клики и регистрации, которые прошли через ваш поддомен, виджет или MCP — это нужно для понимания эффективности вашего контента. Сами комиссии — на стороне поставщика.',

    joinTitle: 'Готовы стать партнёром?',
    joinBody: 'Регистрация партнёрского кабинета сейчас на стадии активной разработки. Если вы создаёте контент о разработке, AI или self-hosted-инфраструктуре — напишите нам, мы откроем ранний доступ.',
    joinButton: 'Запросить ранний доступ',
    joinEmail: 'admin@fractera.ai',
    joinNote: 'Ответим в течение 1–2 рабочих дней.',
  } : {
    badge: 'Partner Program',
    h1: 'Fractera Partner Cabinet',
    subtitle: 'Turn your content into a steady stream of passive income. The Fractera Partner Cabinet is the infrastructure every creator needs when recommending VPS providers to their audience.',

    featuresTitle: 'What partners get',
    features: [
      {
        title: 'Personal mirror subdomain',
        text: 'An address like your-name.partners.fractera.ai — a full copy of the Fractera landing page. Only difference: the "Where to buy VPS" block carries your affiliate link instead of ours. The mirror solves what every hosting provider asks for — a page where the affiliate link will live. Without it, getting affiliate status is nearly impossible.',
      },
      {
        title: 'Affiliate link management cabinet',
        text: 'You get your affiliate link from the VPS provider of your choice (e.g. Contabo) and connect it in the cabinet. Connect as many as you like and pick which one is shown on your mirror. The cabinet is provider-agnostic — it works with any affiliate link.',
      },
      {
        title: 'Embeddable server-signup widget',
        text: 'A ready-to-paste snippet that embeds the Fractera signup form directly in your blog post, article, or YouTube description. Accounts are created on our server; the widget shows a simplified response — "email sent, check spam". From there the user follows your affiliate link to the provider.',
      },
      {
        title: 'AI-agent server activation (MCP)',
        text: 'Recommend that the user deploys Fractera through an AI agent — Claude Code, Codex, Gemini CLI, or any other. The MCP tool asks for your partner ID as its first step. Once entered, the user receives your affiliate link to buy the VPS from the provider. After purchase, the user returns to the same AI agent and continues setup — without leaving the context.',
      },
    ],

    howTitle: 'How the partner program works',
    howBody: 'The affiliate program is a contract between you and a VPS provider (for example, Contabo or any other host with an affiliate program). Fractera does not participate in the financial transaction: payouts come directly from the provider to you, on their terms and schedule. We provide the surrounding infrastructure — the mirror, the cabinet, the widget, the MCP — that lets you recommend any provider in a way that actually converts into clicks and signups.',

    payoutsNoteTitle: 'A note on payouts',
    payoutsNoteBody: 'There will be no payout statistics inside the Fractera cabinet. Money is paid to you by the VPS provider, and you see the payout history in their own dashboard. We can show clicks and signups that came through your subdomain, widget, or MCP — useful for understanding what content works. The commissions themselves stay on the provider side.',

    joinTitle: 'Ready to become a partner?',
    joinBody: 'Partner cabinet signup is under active development. If you create content about software development, AI, or self-hosted infrastructure — write to us, we will open early access.',
    joinButton: 'Request early access',
    joinEmail: 'admin@fractera.ai',
    joinNote: 'Reply within 1–2 business days.',
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
      <div className="max-w-4xl mx-auto px-6 py-20 flex flex-col gap-20">

        {/* Header */}
        <div className="flex flex-col gap-4">
          <span className="self-start text-xs font-mono font-bold text-violet-400 uppercase tracking-widest border border-violet-500/30 bg-violet-500/[0.06] px-3 py-1 rounded-full">
            {t.badge}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight text-white leading-tight">
            {t.h1}
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-3xl">
            {t.subtitle}
          </p>
        </div>

        {/* Features grid — 4 cards */}
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-white">{t.featuresTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.features.map((f, i) => (
              <div key={i} className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/[0.02] p-6">
                <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">0{i + 1}</p>
                <h3 className="text-lg font-bold text-white leading-snug">{f.title}</h3>
                <p className="text-sm text-white/65 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-white">{t.howTitle}</h2>
          <p className="text-base text-white/70 leading-relaxed">{t.howBody}</p>
        </div>

        {/* Payouts note */}
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-6">
          <h2 className="text-base font-bold text-amber-300 uppercase tracking-widest font-mono">{t.payoutsNoteTitle}</h2>
          <p className="text-sm text-white/75 leading-relaxed">{t.payoutsNoteBody}</p>
        </div>

        {/* Join — early access */}
        <div className="flex flex-col gap-5 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-violet-900/20 to-black/60 p-8 items-start">
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-white">{t.joinTitle}</h2>
          <p className="text-base text-white/70 leading-relaxed max-w-2xl">{t.joinBody}</p>
          <a
            href={`mailto:${t.joinEmail}?subject=${encodeURIComponent(isRu ? 'Заявка на партнёрский кабинет Fractera' : 'Fractera Partner Cabinet — early access')}`}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-violet-500/30"
          >
            {t.joinButton} → <span className="font-mono text-sm font-normal">{t.joinEmail}</span>
          </a>
          <p className="text-sm text-white/50">{t.joinNote}</p>
        </div>

      </div>
    </main>
    </>
  )
}
