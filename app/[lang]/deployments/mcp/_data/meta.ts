import { AUTHOR } from '@/lib/author'
import type { DeploymentMeta } from '@/lib/deployments/post'

// Non-translatable fields shared by every language of the /deployments/mcp page.
export const meta: DeploymentMeta = {
  slug: 'mcp',
  subPath: '/deployments/mcp',
  order: 2,
  tags: ['Claude Code MCP', 'Model Context Protocol', 'Deploy from Chat', 'Agentic Engineering', 'Zero Ops'],
  author: { name: AUTHOR.name, role: AUTHOR.role, url: AUTHOR.url },
  heroImage: '/Does-Anthropic-only-wake-up-GOD-at-3-AM.jpg',
  ogImage: '/Does-Anthropic-only-wake-up-GOD-at-3-AM.jpg',
}
