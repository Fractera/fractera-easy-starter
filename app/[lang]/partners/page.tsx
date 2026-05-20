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
    subtitle: 'Превратите ваш контент в стабильный источник пассивного дохода — через наших VPS-партнёров или ваших собственных.',

    featuresTitle: 'Что получает партнёр',
    features: [
      {
        title: 'Личный поддомен — зеркало нашего лендинга',
        text: 'Адрес вида your-name.partners.fractera.ai с полной копией лендинга Fractera. Отличие одно: блок «Где купить VPS» содержит вашу партнёрскую ссылку вместо нашей. Поддомен нужен для одобрения партнёрки у любого хостинга — провайдеры (Contabo и другие) требуют сайт с размещённой ссылкой.',
      },
      {
        title: 'Кабинет управления партнёрскими ссылками',
        text: 'Подключите Contabo (наш рекомендованный — у них уже работающая партнёрка от 20 €) или ваши собственные ссылки на любых VPS-провайдеров, с которыми у вас есть отдельный договор. Можно подключить несколько — выберите, какой показывать на зеркале.',
      },
      {
        title: 'Embed-виджет регистрации',
        text: 'Готовый snippet с iframe для встраивания регистрационной формы Fractera прямо в ваш блог, статью или описание под YouTube-видео. Учётная запись создаётся на нашем сервере, виджет показывает упрощённый success-state — «письмо отправлено, проверьте спам».',
      },
      {
        title: 'Статистика и выплаты',
        text: 'Просмотры зеркала, клики по партнёрской ссылке, регистрации через виджет, история выплат от провайдеров — всё в одном кабинете.',
      },
    ],

    previewTitle: 'Превью кабинета',
    previewSubtitle: 'Так будет выглядеть ваш кабинет после регистрации. Блоки ниже — макет финальной версии.',
    preview: {
      domainLabel: 'Ваше зеркало',
      domainValue: 'red-bull-123.partners.fractera.ai',
      domainStatus: 'Активно · SSL',

      linksLabel: 'Партнёрские ссылки',
      linkRows: [
        { provider: 'Contabo', target: 'Cloud VPS 10 · Ubuntu 24.04', payout: '20 € / клиент', status: 'По умолчанию' },
        { provider: 'Hetzner', target: 'CCX13 · Ubuntu 24.04', payout: 'ваш контракт', status: 'Активна' },
        { provider: 'Свой провайдер', target: 'добавьте ссылку', payout: '—', status: 'Не настроено' },
      ],
      addLinkLabel: '+ Добавить партнёрскую ссылку',

      widgetLabel: 'Embed-виджет',
      widgetHint: 'Вставьте этот snippet туда, где хотите показать форму регистрации:',
      widgetCode: `<iframe\n  src="https://embed.fractera.ai/signup?ref=red-bull-123"\n  width="100%" height="640"\n  style="border:0; border-radius:16px"\n></iframe>`,

      statsLabel: 'Статистика за 30 дней',
      stats: [
        { label: 'Просмотры зеркала', value: '—' },
        { label: 'Клики по ссылке', value: '—' },
        { label: 'Регистрации', value: '—' },
        { label: 'Выплаты, €', value: '—' },
      ],
    },

    providersTitle: 'Какие провайдеры можно подключать',
    providersBody: 'Партнёрский кабинет не привязан к одному хостингу. Подключайте любых провайдеров, с которыми у вас есть партнёрское соглашение. На вашем зеркале лендинга будет показан тот, который вы пометите как основной.',
    providersList: [
      {
        name: 'Contabo — наш рекомендованный',
        desc: 'Доверенный европейский хостинг с прозрачной партнёркой. Cloud VPS 10 — от 3,60 €/мес (4 vCPU, 8 ГБ RAM, 150 ГБ NVMe). Выплаты: 20 € за приведённого клиента на рекомендованную конфигурацию, 30 €+ за более мощные. Учтите: Contabo не выдаёт ссылку мгновенно — они проверяют страницу размещения и юридические данные. Зеркало вашего поддомена решает требование «страницы».',
      },
      {
        name: 'Ваши собственные провайдеры',
        desc: 'Hetzner, DigitalOcean, OVH, AWS, Azure — любой хостинг с affiliate-программой. Подключайте по партнёрской ссылке, которую вам выдал провайдер. Размер вознаграждения и условия — на стороне провайдера.',
      },
    ],

    joinTitle: 'Как стать партнёром',
    joinBody: 'Регистрация партнёра встроена в кабинет (форма выше — макет). На этой стадии разработки регистрация принимается по email. Напишите нам, и мы откроем вам ранний доступ к кабинету и зеркальному поддомену.',
    joinButton: 'Запросить ранний доступ',
    joinEmail: 'admin@fractera.ai',
    joinNote: 'Ответим в течение 1–2 рабочих дней.',
  } : {
    badge: 'Partner Program',
    h1: 'Fractera Partner Cabinet',
    subtitle: 'Turn your content into a steady stream of passive income — through our recommended VPS partner or your own.',

    featuresTitle: 'What partners get',
    features: [
      {
        title: 'Personal mirror subdomain',
        text: 'An address like your-name.partners.fractera.ai — a full copy of the Fractera landing page. Only difference: the "Where to buy VPS" block carries your affiliate link instead of ours. The mirror is what hosting providers (Contabo and others) require when approving you as an affiliate — they need a page where the link is hosted.',
      },
      {
        title: 'Affiliate link management',
        text: 'Connect Contabo (our recommended provider — they already pay 20 €+ per referral) or your own affiliate links for any VPS provider you have a separate contract with. Connect multiple — choose which one to surface on your mirror.',
      },
      {
        title: 'Embeddable signup widget',
        text: 'A ready-to-paste iframe snippet that embeds the Fractera signup form directly in your blog post, article, or YouTube description. Accounts are created on our server; the widget shows a simplified success state — "email sent, check spam".',
      },
      {
        title: 'Stats and payouts',
        text: 'Mirror views, referral clicks, signups through the widget, payout history from providers — all in one cabinet.',
      },
    ],

    previewTitle: 'Cabinet preview',
    previewSubtitle: 'This is what your cabinet will look like after signup. The blocks below are mockups of the final version.',
    preview: {
      domainLabel: 'Your mirror',
      domainValue: 'red-bull-123.partners.fractera.ai',
      domainStatus: 'Active · SSL',

      linksLabel: 'Affiliate links',
      linkRows: [
        { provider: 'Contabo', target: 'Cloud VPS 10 · Ubuntu 24.04', payout: '20 € / customer', status: 'Default' },
        { provider: 'Hetzner', target: 'CCX13 · Ubuntu 24.04', payout: 'your contract', status: 'Active' },
        { provider: 'Custom provider', target: 'add a link', payout: '—', status: 'Not configured' },
      ],
      addLinkLabel: '+ Add affiliate link',

      widgetLabel: 'Embed widget',
      widgetHint: 'Paste this snippet wherever you want the signup form:',
      widgetCode: `<iframe\n  src="https://embed.fractera.ai/signup?ref=red-bull-123"\n  width="100%" height="640"\n  style="border:0; border-radius:16px"\n></iframe>`,

      statsLabel: '30-day stats',
      stats: [
        { label: 'Mirror views', value: '—' },
        { label: 'Link clicks', value: '—' },
        { label: 'Signups', value: '—' },
        { label: 'Payouts, €', value: '—' },
      ],
    },

    providersTitle: 'Which providers you can connect',
    providersBody: 'The partner cabinet is not tied to a single host. Connect any provider you have an affiliate agreement with. The one you mark as primary will be the one shown on your mirror landing.',
    providersList: [
      {
        name: 'Contabo — our recommended choice',
        desc: 'A trusted European host with a transparent affiliate program. Cloud VPS 10 — from €3.60/mo (4 vCPU, 8 GB RAM, 150 GB NVMe). Payouts: 20 € for the recommended configuration, 30 €+ for higher-tier servers. Note: Contabo does not issue the link instantly — they review the hosting page and legal details. Your mirror subdomain satisfies the "page" requirement.',
      },
      {
        name: 'Your own providers',
        desc: 'Hetzner, DigitalOcean, OVH, AWS, Azure — any host with an affiliate program. Connect via the affiliate link the provider issued to you. Reward amount and terms are set by the provider.',
      },
    ],

    joinTitle: 'How to join',
    joinBody: 'Partner signup is built into the cabinet (the form above is a mockup). At this development stage we accept applications by email. Write to us and we will open early access to the cabinet and the mirror subdomain.',
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

        {/* Features grid */}
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-white">{t.featuresTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.features.map((f, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-2xl border border-white/15 bg-white/[0.02] p-6">
                <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">0{i + 1}</p>
                <h3 className="text-lg font-bold text-white">{f.title}</h3>
                <p className="text-sm text-white/65 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cabinet preview (mockup) */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-white">{t.previewTitle}</h2>
            <p className="text-base text-white/60 leading-relaxed">{t.previewSubtitle}</p>
          </div>

          {/* Mockup container */}
          <div className="flex flex-col gap-4 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/30 via-violet-900/10 to-black/60 p-6">

            {/* Mirror subdomain block */}
            <div className="flex flex-col gap-3 rounded-xl border border-white/15 bg-black/40 p-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{t.preview.domainLabel}</p>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">{t.preview.domainStatus}</span>
              </div>
              <p className="font-mono text-base md:text-lg text-white font-bold break-all select-all">{t.preview.domainValue}</p>
            </div>

            {/* Links table */}
            <div className="flex flex-col gap-3 rounded-xl border border-white/15 bg-black/40 p-5">
              <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{t.preview.linksLabel}</p>
              <div className="flex flex-col">
                {t.preview.linkRows.map((row, i) => (
                  <div key={i} className={`flex items-center justify-between gap-3 py-3 flex-wrap ${i > 0 ? 'border-t border-white/10' : ''}`}>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-bold text-white">{row.provider}</span>
                      <span className="text-xs text-white/50">{row.target}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-white/60 font-mono">{row.payout}</span>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${row.status === (isRu ? 'По умолчанию' : 'Default') ? 'text-violet-300 bg-violet-500/10 border-violet-500/30' : row.status === (isRu ? 'Не настроено' : 'Not configured') ? 'text-white/40 bg-white/[0.03] border-white/15' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'}`}>{row.status}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" disabled className="self-start text-sm font-semibold text-white/40 border border-white/15 px-3 py-1.5 rounded-lg cursor-not-allowed">
                {t.preview.addLinkLabel}
              </button>
            </div>

            {/* Widget snippet */}
            <div className="flex flex-col gap-3 rounded-xl border border-white/15 bg-black/40 p-5">
              <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{t.preview.widgetLabel}</p>
              <p className="text-sm text-white/65 leading-relaxed">{t.preview.widgetHint}</p>
              <pre className="text-xs md:text-sm font-mono text-emerald-300 bg-black/60 border border-white/10 rounded-lg p-4 overflow-x-auto leading-relaxed select-all">{t.preview.widgetCode}</pre>
            </div>

            {/* Stats grid */}
            <div className="flex flex-col gap-3 rounded-xl border border-white/15 bg-black/40 p-5">
              <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{t.preview.statsLabel}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {t.preview.stats.map((s, i) => (
                  <div key={i} className="flex flex-col gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-3">
                    <span className="text-xs text-white/50">{s.label}</span>
                    <span className="text-xl font-bold text-white font-mono">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Providers section */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-white">{t.providersTitle}</h2>
            <p className="text-base text-white/60 leading-relaxed">{t.providersBody}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.providersList.map((p, i) => (
              <div key={i} className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/[0.02] p-6">
                <h3 className="text-lg font-bold text-white">{p.name}</h3>
                <p className="text-sm text-white/65 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
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
