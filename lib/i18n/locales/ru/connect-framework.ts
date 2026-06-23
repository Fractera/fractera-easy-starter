import type { SiteContent } from '../../types'

type ConnectFrameworkPart = Pick<SiteContent, 'connectFramework'>

export const connectFramework: ConnectFrameworkPart = {
  connectFramework: {
    badge: 'Любой фреймворк · Любой репозиторий',
    h2: 'Разверните open-source агентные фреймворки на своём VPS',
    description:
      'Любой ваш фреймворк автоматически оптимизируется под встроенную локальную базу данных и локальное файловое хранилище, получает готовую авторизацию и интегрируется с агентами искусственного интеллекта — и всё это в один клик на собственном сервере.',
    // Только инструменты создания САЙТОВ (web-фреймворки, мета-фреймворки, генераторы
    // статических сайтов). Без «голых» языков и без ORM/query-билдеров.
    // Имена собственные — общие для всех локалей.
    frameworks: [
      'Fractera Pro',
      'Next.js',
      'React',
      'Vue',
      'Angular',
      'SvelteKit',
      'Nuxt',
      'Astro',
      'Remix',
      'Gatsby',
      'SolidStart',
      'Qwik',
      'React Router',
      'TanStack Start',
      'Hugo',
      'Jekyll',
      'Eleventy',
      'Vite',
      'Ember',
      'Redwood',
      'Express',
      'NestJS',
      'Fastify',
      'Hono',
      'Django',
      'Flask',
      'FastAPI',
      'Reflex',
      'Laravel',
      'Symfony',
      'Rails',
      'Phoenix',
      'Spring',
      '.NET',
    ],
    collapsedCount: 12,
    showAll: 'Показать все фреймворки',
    hide: 'Свернуть',
    hint: 'Выберите свой фреймворк, чтобы узнать больше.',
  },
}
