import { AUTHOR } from '@/lib/author'
import type { DeploymentMeta } from '@/lib/deployments/post'

// Non-translatable fields shared by every language of the /deployments/vps page.
export const meta: DeploymentMeta = {
  slug: 'vps',
  subPath: '/deployments/vps',
  order: 1,
  tags: ['Production VPS', 'Self-Hosted AI', 'Ubuntu', 'IP-First Deploy', 'Agentic Engineering'],
  author: { name: AUTHOR.name, role: AUTHOR.role, url: AUTHOR.url },
  heroImage: '/Fractera-ai-workspace-screenshot.png',
  ogImage: '/Fractera-ai-workspace-screenshot.png',
}
