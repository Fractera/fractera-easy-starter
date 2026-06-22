import { AUTHOR } from '@/lib/author'
import type { DeploymentMeta } from '../../_lib/post'

// Non-translatable fields shared by every language of the /deployments/local
// page (co-located with the page, same shape as every other <slug>/_data/meta.ts).
export const meta: DeploymentMeta = {
  slug: 'local',
  subPath: '/deployments/local',
  order: 3,
  tags: ['Local Agent Engineering', 'Edge Appliance', 'Apple Silicon', 'LightRAG', 'Private Data'],
  author: { name: AUTHOR.name, role: AUTHOR.role, url: AUTHOR.url },
  heroImage: '/ai-company-brain.png',
  ogImage: '/ai-company-brain.png',
}
