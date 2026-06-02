// Content for the "Regional Partners" page (app/[lang]/regional-partners).
// EN + RU (other languages fall back to EN). Structured, not inline ternaries.

export type RegionalPartnersContent = {
  badge: string
  title: string
  intro: string
  requirementsTitle: string
  requirements: string[]
  offerTitle: string
  offer: string[]
  dutiesTitle: string
  duties: string[]
  regionTitle: string
  region: string
  applyTitle: string
  apply: string
  applyEmail: string
  applySubject: string
  emailSubject: string
  ctaButton: string
}

const EN: RegionalPartnersContent = {
  badge: 'Partnership',
  title: "We're looking for regional partners",
  intro:
    'We are looking for regional partners who want to work with us as equals in their region — represent Fractera, take part in promoting the business, and receive and fulfill orders to install Fractera and the AI Company Brain in their region.',
  requirementsTitle: 'Business requirements',
  requirements: [
    'A registered legal entity, operating for more than 3 years.',
    'A significant audience of partners or subscribers.',
    'Strong skills and knowledge in search-engine optimization and off-page / external-link work.',
    'Business development skills.',
  ],
  offerTitle: 'What we offer',
  offer: [
    'A page for your region featuring your own referral links for VPS and domain sales.',
    'Referral rewards split 30 / 70 — the partner keeps 70%.',
    'Official Fractera reseller status in your region.',
  ],
  dutiesTitle: 'Partner responsibilities',
  duties: [
    'Promote your regional page in search by driving traffic through your own publications, pages, and mailings.',
    'The principle is simple: the more visitors, the more referral reward you earn from VPS and domain sales. Minimal ongoing activity, compounding reward.',
  ],
  regionTitle: 'What counts as a region',
  region:
    'A region is either a whole country (when it is effectively a single state or region) or a state / region within a country. So one country can have several regional representatives.',
  applyTitle: 'How to apply',
  apply:
    'If you want to become a regional Fractera representative — earning referral payouts and taking part in other projects such as delivering the AI Company Brain — send your application to:',
  applyEmail: 'admin@fractera.ai',
  applySubject: 'Put "Regional representation application" in the subject line.',
  emailSubject: 'Regional representation application',
  ctaButton: 'Apply by email',
}

const RU: RegionalPartnersContent = {
  badge: 'Партнёрство',
  title: 'Мы ищем региональных партнёров',
  intro:
    'Мы ищем региональных партнёров, которые хотели бы работать с нами на равных правах в своём регионе — представлять интересы Fractera, участвовать в продвижении бизнеса, а также получать и исполнять заказы на установку Fractera и AI Company Brain в своём регионе.',
  requirementsTitle: 'Требования к бизнесу',
  requirements: [
    'Зарегистрированное юридическое лицо, работающее более 3 лет.',
    'Значительная аудитория партнёров или подписчиков.',
    'Высокие навыки и знания в области поисковой оптимизации и работы с внешними ссылками.',
    'Навыки business development.',
  ],
  offerTitle: 'Что мы предлагаем',
  offer: [
    'Страницу для вашего региона с вашими реферальными ссылками на продажу VPS и домена.',
    'Реферальные вознаграждения делятся по схеме 30 / 70 — партнёр получает 70%.',
    'Статус официального реселлера Fractera в вашем регионе.',
  ],
  dutiesTitle: 'Обязанности партнёра',
  duties: [
    'Продвигать страницу вашего региона в поиске за счёт привлечения трафика через собственные публикации, страницы и рассылки.',
    'Принцип простой: чем больше посетителей, тем больше реферального вознаграждения от продажи VPS и домена. Минимальная постоянная активность — накопительный доход.',
  ],
  regionTitle: 'Что считается регионом',
  region:
    'Регион — это либо целая страна (если она по сути состоит из одного штата или региона), либо штат / регион внутри страны. То есть в одной стране может быть несколько региональных представителей.',
  applyTitle: 'Как подать заявку',
  apply:
    'Если вы хотите стать региональным представителем Fractera — получать реферальные вознаграждения и участвовать в других проектах, таких как реализация AI Company Brain, — отправьте заявку на:',
  applyEmail: 'admin@fractera.ai',
  applySubject: 'В теме письма укажите «Заявка на региональное представительство».',
  emailSubject: 'Заявка на региональное представительство',
  ctaButton: 'Подать заявку по почте',
}

const MAP: Record<string, RegionalPartnersContent> = { en: EN, ru: RU }

export function getRegionalPartners(lang: string): RegionalPartnersContent {
  return MAP[lang] ?? EN
}
