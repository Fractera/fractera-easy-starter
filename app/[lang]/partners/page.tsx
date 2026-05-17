import { getContent } from '@/lib/i18n/content'

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
    subtitle: 'Два способа получать вознаграждение — выбирайте один или оба.',
    type1Badge: 'Тип 1',
    type1Title: 'VPS-партнёрство',
    type1Body: 'Станьте партнёром одного из VPS-провайдеров из нашего блока (Contabo, Hetzner, Netcup, DigitalOcean) и получите партнёрскую ссылку прямо у них. Передайте нам эту ссылку — мы разместим её в блоке рекомендованных серверов на лендинге Fractera.',
    type1How: 'Как это работает:',
    type1Steps: [
      'Зарегистрируйтесь как партнёр у выбранного VPS-провайдера и получите партнёрскую ссылку.',
      'Передайте нам эту ссылку через форму регистрации ниже.',
      'Мы размещаем вашу ссылку на лендинге — рядом с именем провайдера.',
      'Пользователь переходит по ссылке, покупает сервер — провайдер выплачивает вознаграждение напрямую вам.',
    ],
    type1Note: 'Fractera не участвует в этой транзакции. Размер вознаграждения определяет провайдер.',
    type2Badge: 'Тип 2',
    type2Title: 'Реферальная ссылка Fractera',
    type2Body: 'Расскажите о Fractera своей аудитории. Когда пользователь зарегистрируется и купит платный тариф по вашей реферальной ссылке — вы получите 50% от его первого платежа.',
    type2How: 'Как это работает:',
    type2Steps: [
      'Зарегистрируйтесь в программе и получите персональную реферальную ссылку.',
      'Поделитесь ею в своём блоге, канале, социальных сетях или на своём сайте.',
      'Когда пользователь купит платный тариф Fractera — вы получаете 50% от первого платежа.',
    ],
    type2Note: 'Выплата производится Fractera. Подходит для контент-мейкеров, блогеров и технических авторов.',
    ctaTitle: 'Хотите стать партнёром?',
    ctaBody: 'Зарегистрируйтесь по ссылке ниже. После регистрации вы получите персональную реферальную ссылку и инструкции по передаче VPS-партнёрских ссылок.',
    ctaButton: 'Зарегистрироваться в программе',
    ctaNote: 'По вопросам: admin@fractera.ai',
  } : {
    badge: 'Partner Program',
    h1: 'Earn with Fractera',
    subtitle: 'Two ways to get rewarded — choose one or both.',
    type1Badge: 'Type 1',
    type1Title: 'VPS Referrals',
    type1Body: 'Become an affiliate partner with any VPS provider in our server block (Contabo, Hetzner, Netcup, DigitalOcean) and get an affiliate link directly from them. Share it with us — we\'ll place it in the recommended servers section on the Fractera landing page.',
    type1How: 'How it works:',
    type1Steps: [
      'Sign up as an affiliate with your chosen VPS provider and get your affiliate link.',
      'Submit that link to us via the registration form below.',
      'We place your link on the landing page — next to the provider\'s name.',
      'A user clicks your link, buys a server — the provider pays you directly.',
    ],
    type1Note: 'Fractera is not involved in this transaction. Reward size is set by the VPS provider.',
    type2Badge: 'Type 2',
    type2Title: 'Fractera Referral Link',
    type2Body: 'Tell your audience about Fractera. When someone registers and purchases a paid plan through your referral link, you receive 50% of their first payment.',
    type2How: 'How it works:',
    type2Steps: [
      'Register for the program and receive your personal referral link.',
      'Share it on your blog, channel, social media, or website.',
      'When a user buys a paid Fractera plan — you earn 50% of their first payment.',
    ],
    type2Note: 'Payment is made by Fractera. Ideal for content creators, bloggers, and technical writers.',
    ctaTitle: 'Ready to join?',
    ctaBody: 'Register via the link below. After signing up you\'ll receive your personal referral link and instructions for submitting your VPS affiliate links.',
    ctaButton: 'Join the Partner Program',
    ctaNote: 'Questions? admin@fractera.ai',
  }

  return (
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

        {/* Type 1 */}
        <div className="flex flex-col gap-5 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-violet-900/20 to-black/60 p-8">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-violet-400 bg-violet-500/10 border border-violet-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-widest">
              {t.type1Badge}
            </span>
            <h2 className="text-2xl font-bold text-white">{t.type1Title}</h2>
          </div>
          <p className="text-base text-white/70 leading-relaxed">{t.type1Body}</p>
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-white/50 uppercase tracking-widest">{t.type1How}</p>
            <ol className="flex flex-col gap-3">
              {t.type1Steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-base text-white/80 leading-relaxed">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-xs font-bold text-violet-300 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <p className="text-xs text-white/35 leading-relaxed border-t border-white/10 pt-4">{t.type1Note}</p>
        </div>

        {/* Type 2 */}
        <div className="flex flex-col gap-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-emerald-900/20 to-black/60 p-8">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-widest">
              {t.type2Badge}
            </span>
            <h2 className="text-2xl font-bold text-white">{t.type2Title}</h2>
          </div>
          <div className="flex items-center gap-3 self-start bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-5 py-3">
            <span className="text-3xl font-bold text-emerald-400">50%</span>
            <span className="text-sm text-white/70 leading-snug max-w-[180px]">
              {isRu ? 'от первого платежа нового пользователя' : 'of the first payment from each new user'}
            </span>
          </div>
          <p className="text-base text-white/70 leading-relaxed">{t.type2Body}</p>
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-white/50 uppercase tracking-widest">{t.type2How}</p>
            <ol className="flex flex-col gap-3">
              {t.type2Steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-base text-white/80 leading-relaxed">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-300 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <p className="text-xs text-white/35 leading-relaxed border-t border-white/10 pt-4">{t.type2Note}</p>
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
  )
}
