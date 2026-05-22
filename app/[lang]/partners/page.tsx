import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { PartnersCta, OpenCabinetButton } from './partners-cta'

export default async function PartnersPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const isRu = lang === 'ru'

  const session = await auth()
  const partner = session?.user?.id
    ? await db.partner.findUnique({
        where: { userId: session.user.id },
        select: { slug: true, createdAt: true },
      })
    : null

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
        text: 'Если у пользователя что-то пошло не так — упал деплой или он не хочет вводить IP вручную — единая ссылка на MCP Fractera открывает развёртывание через любого AI-агента (Claude Code, Codex, Gemini CLI). Никаких отдельных MCP-серверов на каждого партнёра: партнёрская атрибуция уже зафиксирована в момент клика по реферальной кнопке хостинга — благодаря 45-day cookie провайдера. На партнёрской странице ссылка на MCP появляется только после того, как пользователь хотя бы раз перешёл на сайт одного из подключённых вами хостингов.',
      },
    ],

    howTitle: 'Как работает партнёрка',
    howBody: 'Партнёрская программа — это договор между вами и VPS-поставщиком (например, Contabo или любой другой хостинг с affiliate-программой). Fractera не участвует в денежной транзакции: выплаты идут напрямую от поставщика вам, по его тарифам и графику. Мы даём инфраструктуру вокруг — поддомен, кабинет, виджет, MCP — благодаря которой вы можете рекомендовать любого провайдера так, чтобы это конвертировалось в реальные клики и регистрации.',
    howFootnote: '* Например, Contabo выплачивает от 20 до 55 € за каждого нового клиента в зависимости от выбранной им конфигурации сервера. Однако сначала вы должны зарегистрироваться на cj.com как publisher — Contabo, как и более 3000 других брендов, ведёт свою партнёрку через эту сеть. Onboarding в CJ — один раз: tax forms, payment info, описание property — после чего весь каталог программ открывается для подачи заявок (каждый бренд одобряет вас отдельно, но повторять регистрацию не нужно). Поэтому час, потраченный на CJ, окупается доступом к одному из крупнейших каталогов affiliate-программ в мире.',

    attributionTitle: 'Вы зарабатываете, даже если пользователь не купил VPS прямо сейчас',
    attributionBody: 'Достаточно того, что пользователь перешёл по вашей реферальной ссылке на страницу хостинга — даже если он не купил VPS прямо сейчас и закрыл вкладку. Большинство партнёрских программ (включая Contabo через CJ Affiliate) фиксируют клик в 45-day cookie на стороне хостинга. Если этот пользователь совершит любую покупку у хостинга в течение 45 дней — пусть даже для другого, не связанного с Fractera проекта — комиссия будет начислена вам. Это означает: вы зарабатываете не только на тех, кто прямо сейчас разворачивает Fractera, а на всём трафике, который однажды касался вашей рекомендации.',

    payoutsNoteTitle: 'Важно про выплаты',
    payoutsNoteBody: 'Никакой статистики выплат внутри Fractera-кабинета не будет. Деньги вам платит ваш VPS-поставщик, и историю выплат вы видите в его собственном кабинете. Мы можем показать клики и регистрации, которые прошли через ваш поддомен, виджет или MCP — это нужно для понимания эффективности вашего контента. Сами комиссии — на стороне поставщика.',

    joinTitle: 'Готовы стать партнёром?',
    joinBody: 'Регистрация занимает 30 секунд. Достаточно согласиться с политикой сотрудничества — мы сразу активируем ваш партнёрский кабинет и отправляем письмо с подробностями.',
    joinButton: 'Зарегистрироваться как партнёр',
    joinNote: 'Аккаунт Fractera нужен — если ещё не вошли, откроется окно входа.',

    activeBadge: '✓ Вы партнёр',
    activeTitle: 'Поздравляем — вы стали партнёром Fractera',
    activeIdLabel: 'Ваш партнёрский идентификатор',
    activeBody: 'Управление партнёрскими ссылками и виджет — в Dashboard в правом верхнем углу, на вкладке «Партнёрский кабинет». Или нажмите кнопку ниже, чтобы открыть кабинет прямо сейчас.',
    activeButton: 'Открыть партнёрский кабинет',
    activeNote: 'Email с подробностями уже отправлен. Проверьте папку «спам», если письма нет во входящих.',
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
        text: 'If something goes wrong for the user — a failed deploy, or they prefer not to type the IP manually — a single Fractera MCP link unlocks deployment through any AI agent (Claude Code, Codex, Gemini CLI). No per-partner MCP servers: partner attribution is already locked in the moment the user clicks one of your affiliate hosting buttons, thanks to the provider\'s 45-day cookie. On the partner page the MCP link appears only after the user has visited at least one of your connected hosting providers.',
      },
    ],

    howTitle: 'How the partner program works',
    howBody: 'The affiliate program is a contract between you and a VPS provider (for example, Contabo or any other host with an affiliate program). Fractera does not participate in the financial transaction: payouts come directly from the provider to you, on their terms and schedule. We provide the surrounding infrastructure — the mirror, the cabinet, the widget, the MCP — that lets you recommend any provider in a way that actually converts into clicks and signups.',
    howFootnote: '* For example, Contabo pays 20–55 € per new customer, depending on the server configuration they pick. But first you need to register on cj.com as a publisher — Contabo, like 3,000+ other brands, runs its affiliate program through that network. CJ onboarding happens once: tax forms, payment info, property description — after which the whole catalogue is open for applications (each brand still approves you separately, but you never repeat the signup). The hour you spend on CJ is repaid by access to one of the largest affiliate-program catalogues in the world.',

    attributionTitle: 'You earn even if the user does not buy a VPS right now',
    attributionBody: 'It is enough that the user clicked through your affiliate link to a hosting page — even if they did not buy a VPS this minute and closed the tab. Most affiliate programs (including Contabo via CJ Affiliate) lock the click in a 45-day cookie on the hosting side. If that same user makes any purchase from that hosting provider within 45 days — even for an unrelated project that has nothing to do with Fractera — the commission is credited to you. This means you earn not only from people who deploy Fractera right now, but from every visitor whose attention your recommendation ever touched.',

    payoutsNoteTitle: 'A note on payouts',
    payoutsNoteBody: 'There will be no payout statistics inside the Fractera cabinet. Money is paid to you by the VPS provider, and you see the payout history in their own dashboard. We can show clicks and signups that came through your subdomain, widget, or MCP — useful for understanding what content works. The commissions themselves stay on the provider side.',

    joinTitle: 'Ready to become a partner?',
    joinBody: 'Sign-up takes 30 seconds. Just agree to the cooperation policy — your partner cabinet is activated immediately and a welcome email is sent.',
    joinButton: 'Register as a partner',
    joinNote: 'A Fractera account is required — if you are not signed in, the sign-in window will open.',

    activeBadge: '✓ You are a partner',
    activeTitle: 'Congratulations — you are now a Fractera partner',
    activeIdLabel: 'Your partner identifier',
    activeBody: 'Manage your affiliate links and widget in the Dashboard (top-right corner) under the «Partner cabinet» tab. Or click the button below to open it right now.',
    activeButton: 'Open partner cabinet',
    activeNote: 'A welcome email has been sent. Check your spam folder if it is not in the inbox.',
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
              <div
                key={i}
                id={i === 3 ? 'mcp' : undefined}
                className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/[0.02] p-6 scroll-mt-24"
              >
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
          <p className="text-sm text-orange-400/80 leading-relaxed border-t border-orange-500/20 pt-4">{t.howFootnote}</p>
        </div>

        {/* 45-day attribution */}
        <div className="flex flex-col gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.04] p-6">
          <h2 className="text-base font-bold text-emerald-300 uppercase tracking-widest font-mono">{t.attributionTitle}</h2>
          <p className="text-sm text-white/75 leading-relaxed">{t.attributionBody}</p>
        </div>

        {/* Payouts note */}
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-6">
          <h2 className="text-base font-bold text-amber-300 uppercase tracking-widest font-mono">{t.payoutsNoteTitle}</h2>
          <p className="text-sm text-white/75 leading-relaxed">{t.payoutsNoteBody}</p>
        </div>

        {/* Join / Active partner state */}
        {partner ? (
          <div className="flex flex-col gap-5 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-emerald-900/20 to-black/60 p-8 items-start">
            <span className="self-start text-xs font-mono font-bold text-emerald-300 uppercase tracking-widest border border-emerald-500/40 bg-emerald-500/[0.08] px-3 py-1 rounded-full">
              {t.activeBadge}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-white">{t.activeTitle}</h2>
            <div className="w-full flex flex-col gap-2 rounded-xl border border-emerald-500/30 bg-black/40 p-5">
              <p className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-widest">{t.activeIdLabel}</p>
              <p className="font-mono text-2xl md:text-3xl font-bold text-white tracking-wide select-all">{partner.slug}</p>
            </div>
            <p className="text-base text-white/70 leading-relaxed max-w-2xl">{t.activeBody}</p>
            <OpenCabinetButton label={t.activeButton} />
            <p className="text-sm text-white/50">{t.activeNote}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-violet-900/20 to-black/60 p-8 items-start">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-white">{t.joinTitle}</h2>
            <p className="text-base text-white/70 leading-relaxed max-w-2xl">{t.joinBody}</p>
            <PartnersCta lang={lang} label={t.joinButton} />
            <p className="text-sm text-white/50">{t.joinNote}</p>
          </div>
        )}

      </div>
    </main>
    </>
  )
}
