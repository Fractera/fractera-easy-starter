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
    subtitle: 'Пять минут настройки — пассивный доход, пока ваш контент жив.',
    mainTitle: 'VPS-партнёрство',
    mainBody: 'Каждый пользователь Fractera покупает VPS у одного из четырёх проверенных провайдеров — Contabo, Hetzner, Netcup, DigitalOcean. Станьте их аффилиатом, передайте нам свои партнёрские ссылки — мы разместим их в блоке рекомендованных серверов на лендинге. Каждый купленный через ваш канал сервер приносит вам вознаграждение напрямую от провайдера.',
    mainHow: 'Как это работает:',
    mainSteps: [
      'Зарегистрируйтесь как аффилиат у выбранного VPS-провайдера и получите партнёрскую ссылку. Несколько минут на каждого.',
      'Передайте ссылки через форму регистрации ниже.',
      'Мы размещаем их на лендинге рядом с именем провайдера.',
      'Пользователь переходит по ссылке, покупает сервер — провайдер выплачивает вознаграждение напрямую вам.',
    ],
    mainNote: 'Fractera не участвует в транзакции. Размер и периодичность выплат определяет хостинг-провайдер. Подходит для блогеров, контент-мейкеров, технических авторов и YouTube-каналов.',
    benefitsTitle: 'Почему это работает',
    benefits: [
      'Пассивный доход — статья или видео работают на вас месяцами и годами.',
      'Никаких порогов и лимитов — каждый приведённый клиент учитывается.',
      'Прямая выплата от провайдера — без посредников, без задержек.',
      'Подключение за пять минут — все четыре провайдера принимают новых аффилиатов онлайн.',
    ],
    ctaTitle: 'Готовы присоединиться?',
    ctaBody: 'Зарегистрируйтесь по ссылке ниже. После регистрации получите инструкции по передаче VPS-партнёрских ссылок.',
    ctaButton: 'Зарегистрироваться в программе',
    ctaNote: 'По вопросам: admin@fractera.ai',
  } : {
    badge: 'Partner Program',
    h1: 'Earn with Fractera',
    subtitle: 'Five minutes of setup — passive income for as long as your content stays alive.',
    mainTitle: 'VPS Referrals',
    mainBody: 'Every Fractera user buys a VPS from one of four tested providers — Contabo, Hetzner, Netcup, DigitalOcean. Become their affiliate, submit your referral links, and we display them in the recommended servers block on the landing page. Every server bought through your channel pays you a commission directly from the provider.',
    mainHow: 'How it works:',
    mainSteps: [
      'Sign up as an affiliate with your chosen VPS provider and grab your referral link. A few minutes per provider.',
      'Submit your links via the registration form below.',
      'We place them on the landing page next to the provider name.',
      'A user clicks your link, buys a server — the provider pays your commission directly.',
    ],
    mainNote: 'Fractera is not involved in the transaction. The hosting provider sets the reward amount and payout schedule. Ideal for bloggers, content creators, technical writers, and YouTube channels.',
    benefitsTitle: 'Why this works',
    benefits: [
      'Passive income — your article or video keeps working for months and years.',
      'No thresholds, no caps — every customer you bring is counted.',
      'Direct payout from the provider — no middlemen, no delays.',
      'Five-minute onboarding — all four providers accept new affiliates online.',
    ],
    ctaTitle: 'Ready to join?',
    ctaBody: 'Register via the link below. After signing up you will receive instructions for submitting your VPS affiliate links.',
    ctaButton: 'Join the Partner Program',
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
          <div className="flex flex-col gap-3">
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

        {/* Why it works */}
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
            href="#"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-violet-500/30"
          >
            {t.ctaButton} →
          </a>
          <p className="text-sm text-white/35">{t.ctaNote}</p>
        </div>

      </div>
    </main>
    </>
  )
}
