import type { SiteContent } from '../../types'

type ConnectFrameworkPart = Pick<SiteContent, 'connectFramework'>

export const connectFramework: ConnectFrameworkPart = {
  connectFramework: {
    badge: 'Any framework · Any repository',
    h2: 'Connect your framework — deploy an AI-workspace starter on your VPS',
    description:
      'Any framework you bring is automatically optimized for the built-in local database and local file storage, ships with authentication out of the box, and integrates with the on-server AI agents — all in one click on your own server.',
    // Curated, ordered list. Names are proper nouns shared across locales.
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
    showAll: 'Show all frameworks',
    hide: 'Hide',
    hint: 'Pick your framework to learn more — per-framework guides are on the way. Today the one-click deploy ships the Next.js starter; the rest are coming soon.',
  },
}
