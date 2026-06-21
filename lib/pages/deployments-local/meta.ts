import { AUTHOR } from '@/lib/author'

// Non-translatable fields shared by every language of the /deployments/local
// page. Mirrors lib/news/entries/<slug>/meta.ts.
export const meta = {
  slug: 'deployments-local',
  subPath: '/deployments/local',
  tags: ['Local Agent Engineering', 'Edge Appliance', 'Apple Silicon', 'LightRAG', 'Private Data'],
  author: { name: AUTHOR.name, role: AUTHOR.role },
  heroImage: '/ai-company-brain.png',
  ogImage: '/ai-company-brain.png',
} as const
