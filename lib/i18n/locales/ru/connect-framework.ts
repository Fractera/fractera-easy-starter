import type { SiteContent } from '../../types'

type ConnectFrameworkPart = Pick<SiteContent, 'connectFramework'>

export const connectFramework: ConnectFrameworkPart = {
  connectFramework: {
    badge: 'Любой фреймворк · Любой репозиторий',
    h2: 'Подключите свой фреймворк — разверните AI-workspace-стартер на своём VPS',
    description:
      'Любой ваш фреймворк автоматически оптимизируется под встроенную локальную базу данных и локальное файловое хранилище, получает готовую авторизацию и интегрируется с агентами искусственного интеллекта — и всё это в один клик на собственном сервере.',
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
