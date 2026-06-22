import { AUTHOR } from '@/lib/author'
import type { FrameworkMeta } from '../../_lib/post'

// Non-translatable fields shared by every language of the /framework/next-js page.
// Scaffolding only — the SEO/content pass (heroImage, richer tags) is a separate
// sub-step. ogImage is required for the social snippet.
export const meta: FrameworkMeta = {
  slug: 'next-js',
  subPath: '/framework/next-js',
  order: 1,
  tags: ['Next.js', 'Agentic Engineering'],
  author: { name: AUTHOR.name, role: AUTHOR.role, url: AUTHOR.url },
  ogImage: '/Fractera-ai-workspace-screenshot.png',
}
