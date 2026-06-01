import type { SiteContent } from '../../types'

type MarketplacePart = Pick<SiteContent, 'marketplace'>

export const marketplace: MarketplacePart = {
  marketplace: {
    linkedNote: 'Открыто из вашего рабочего пространства Fractera.',
    skills: {
      h1: 'Навыки Fractera',
      intro:
        'Маркетплейс переиспользуемых AI-воркфлоу — берите проверенные рецепты или упакуйте и продавайте свои.',
      comingSoon: 'Скоро',
      comingSoonNote: 'Маркетплейс навыков — в нашей дорожной карте. Оставайтесь с нами.',
    },
    productLoop: {
      h1: 'Продуктовая петля',
      intro:
        'Больше, чем навык: оцифрованный путь предпринимателя от начала до конца — от регистрации компании до трафика, экономики и масштабирования — как логика решений, которую может купить другой основатель.',
      comingSoon: 'Скоро',
      comingSoonNote: 'Продуктовая петля — наша долгосрочная цель. Оставайтесь с нами — мы сделаем это вместе.',
    },
  },
}
