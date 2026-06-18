import type { SiteContent } from '../../types'

type ConnectFrameworkPart = Pick<SiteContent, 'connectFramework'>

export const connectFramework: ConnectFrameworkPart = {
  connectFramework: {
    badge: 'Any framework · Any repository',
    h2: 'Connect your framework — deploy a starter of anything onto your VPS',
    description:
      'Fractera is not locked to one stack. The vision is simple: pick a framework, deploy a clean starter of it onto your own server in one click — or point us at any public repository. We are wiring frameworks one by one; the Next.js starter ships today, and more are landing as we expand the deploy pipeline.',
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
