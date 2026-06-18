import type { SiteContent } from '../../types'

type ConnectFrameworkPart = Pick<SiteContent, 'connectFramework'>

export const connectFramework: ConnectFrameworkPart = {
  connectFramework: {
    badge: 'Любой фреймворк · Любой репозиторий',
    h2: 'Подключите свой фреймворк — разверните стартер чего угодно на своём VPS',
    description:
      'Fractera не привязана к одному стеку. Идея проста: выбираете фреймворк — и в один клик разворачиваете его чистый стартер на собственном сервере, либо указываете любой публичный репозиторий. Мы подключаем фреймворки один за другим: стартер Next.js работает уже сегодня, остальные добавляются по мере расширения пайплайна развёртывания.',
    // Имена собственные — общие для всех локалей.
    frameworks: [
      'Next.js',
      'React',
      'Vue',
      'Astro',
      'SvelteKit',
      'Nuxt',
      'React Router',
      'TanStack Start',
      'SolidStart',
      'Remix',
      'Redwood',
      'Express',
      'Hono',
      'Reflex',
      'Django',
      'Laravel',
      'Symfony',
      'Rails',
      'Phoenix',
      'Quarkus',
      'Micronaut',
      '.NET',
      'Go',
      'Rust',
      'Java',
      'Python',
      'Drizzle',
      'Prisma',
      'Kysely',
      'TypeORM',
      'SQLAlchemy',
    ],
    collapsedCount: 12,
    showAll: 'Показать все фреймворки',
    hide: 'Свернуть',
    hint: 'Выберите свой фреймворк, чтобы узнать больше — гайды по каждому уже в работе. Сегодня развёртывание в один клик ставит стартер Next.js, остальные — скоро.',
  },
}
