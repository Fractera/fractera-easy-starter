import type { SiteContent } from '../../types'

type FeaturesPart = Pick<SiteContent,
  | 'featuresHeader' | 'featureList'
  | 'promoSection'
  | 'faqHeader' | 'testimonial'
>

export const features: FeaturesPart = {
  featuresHeader: {
    label: 'Что включено',
    h2: 'Production-Ready full-stack функции разработки',
    description: 'Fractera Lite покрывает 90% того, что нужно профессиональному приложению. Fractera Pro открывает оставшиеся 10%.',
  },

  featureList: [
    { title: 'Голосовые команды AI',     description: 'Отдавайте команды и навигируйте контент голосом. AI-агенты отвечают на естественный ввод в реальном времени.',       badge: 'Lite' },
    { title: 'Auth из коробки',          description: 'Google OAuth, magic-link и Credentials — с ролями и enterprise-сессиями. Ничего настраивать не нужно.',                badge: 'Lite' },
    { title: 'База данных и хранилище',  description: 'SQLite с WAL, файловое хранилище и медиа-сервис. Масштабируется без дополнительных подписок.',                        badge: 'Lite' },
    { title: 'GitHub и рабочий процесс', description: 'GitHub sync, продакшн и локальная разработка в единой панели. Push, pull, deploy — в один клик.',                    badge: 'Lite' },
    { title: 'Платформы за 50ms',        description: 'Все пять платформ готовы к работе. LightRAG инициализируется при первом запуске. Никакой настройки.',                 badge: 'Lite' },
    { title: 'Skills Marketplace',       description: 'Покупайте и продавайте AI-воркфлоу в библиотеке сообщества. Делитесь навыками или монетизируйте рецепты автоматизации.', badge: 'Lite' },
    { title: 'SEO, PWA и i18n',          description: 'Продакшн SEO, PWA и мультиязычный роутинг — готовы до первого пользователя.',                                         badge: 'Pro'  },
    { title: 'Подсветка элементов',      description: 'Кликните на элемент — получите точный идентификатор для AI. Меньше токенов, быстрее итерации.',                       badge: 'Pro'  },
    { title: 'Hermes AI Agents',         description: 'Готовые агенты с самообучающейся памятью. Мощнейшая AI-технология за секунды — не часы настройки.',                   badge: 'Pro'  },
  ],

  promoSection: {
    h2: 'Форк и кастомная white-label AI-платформа',
    description:
      'Fractera полностью open source. Форкните репозиторий, разверните собственный инстанс и создавайте продукты с AI — для себя или как бизнес: деплой серверов для клиентов и консалтинговые услуги.',
    githubButton: 'Смотреть на GitHub',
  },

  faqHeader: {
    label: 'FAQ',
    h2: 'Техническая архитектура Fractera — FAQ',
    description: 'Всё, что нужно знать перед стартом.',
  },

  testimonial: {
    blogButton: 'Блог',
    casesButton: 'Кейсы студентов',
    marketplaceButton: 'Fractera Marketplace',
  },
}
