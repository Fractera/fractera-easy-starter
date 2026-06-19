import type { SiteContent } from '../../types'

type ConnectFrameworkPart = Pick<SiteContent, 'connectFramework'>

export const connectFramework: ConnectFrameworkPart = {
  connectFramework: {
    badge: 'Any framework · Any repository',
    h2: 'Connect your framework — deploy an AI-workspace starter on your VPS',
    description:
      'Any framework you bring is automatically optimized for the built-in local database and local file storage, ships with authentication out of the box, and integrates with the on-server AI agents — all in one click on your own server.',
    // Curated, ordered list — WEBSITE-BUILDING tools only (web frameworks, meta-
    // frameworks, static-site generators). No bare languages, no ORMs/query builders.
    // Names are proper nouns shared across locales.
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
    showAll: 'Show all frameworks',
    hide: 'Hide',
    hint: 'Pick your framework to learn more.',
  },
}
