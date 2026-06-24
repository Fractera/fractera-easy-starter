import { AUTHOR } from '@/lib/author'
import type { NewsArticleMeta } from '../../_lib/types'

export const meta: NewsArticleMeta = {
  slug: 'static-safe-app-config-by-ai',
  date: '2026-06-24',
  readingMinutes: 14,
  tags: ['App Config', 'Static-first', 'Agentic Engineering', 'MCP connector', 'Next.js', 'SEO', 'Metadata'],
  author: { name: AUTHOR.name, role: AUTHOR.role },
  // Diagram: App Config managed two ways — the manual settings panel and the MCP
  // connector — both writing app-config.json and keeping the app static. Hero + OG.
  heroImage: '/news/fractera-app-config-architecture/fractera-app-config-architecture-mcp-and-Manual-settings.jpg',
  ogImage: '/news/fractera-app-config-architecture/fractera-app-config-architecture-mcp-and-Manual-settings.jpg',
}
