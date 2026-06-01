import type { SiteContent } from '../../types'

type SponsorshipPart = Pick<SiteContent, 'sponsorship'>

export const sponsorship: SponsorshipPart = {
  sponsorship: {
    label: 'Поддержите проект',
    h2: 'Станьте спонсором — сохраним Fractera свободным и открытым',
    body: [
      'Этот проект я создаю в одиночку, и у меня ещё очень много интересных планов — ваша поддержка помогает им сбыться.',
      'Если у вас есть такая возможность — мы разместим вас на вкладке «Спонсоры» нашего проекта здесь и в GitHub.',
    ],
    tiers: [
      {
        id: 's1', amount: '$1', period: '/мес', sublabel: 'Чашка кофе — каждый доллар важен',
        perks: [
          'Ваш email на странице «Спонсоры» (здесь и в GitHub)',
          'Прямой канал для предложения новых функций',
        ],
      },
      {
        id: 's5', amount: '$5', period: '/мес', sublabel: 'Поддержка — топливо для дорожной карты', badge: 'ПОПУЛЯРНО',
        perks: [
          'Доступ в закрытую Telegram-группу для спонсоров',
          'Инструкция по удалению брендинга «Powered by Fractera»',
        ],
      },
      {
        id: 's20', amount: '$20', period: '/мес', sublabel: 'Чемпион — место на странице спонсоров',
        perks: [
          'Личное общение с основателем',
          'Доступ к функциям и навыкам Fractera Pro',
        ],
      },
    ],
    sponsorButton: 'Стать спонсором · {amount}{period} →',
    signInPrompt: 'Сначала войдите, чтобы стать спонсором',
    signInButton: 'Войти и поддержать',
    thankYouTitle: 'Спасибо за поддержку Fractera 💛',
    thankYouBody: 'Подписка активирована. Управлять ей можно в Дашборде в любой момент.',
    ourSponsorsLabel: 'Наши спонсоры',
    ourSponsorsLink: 'Посмотреть всех, кто поддерживает Fractera →',
  },
}
