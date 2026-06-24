import type { DocMeta } from '../../_lib/types'

// Non-translatable fields shared by every language of this doc. `image.web` is both
// the responsive hero and the social snippet (og:image) per the page-image rule.
export const meta: DocMeta = {
  slug: 'app-config-mcp-connector',
  date: '2026-06-24',
  readingMinutes: 8,
  tags: ['App Config', 'MCP connector', 'Project configuration', 'Settings automation', 'Agentic engineering', 'Architecture'],
  image: {
    mobile: '/docs/fractera-app-config-mcp-updating.jpg',
    web: '/docs/fractera-app-config-mcp-updating.jpg',
    alt: 'App Config automation: an AI agent updating a deployed app’s project configuration through the app-settings MCP connector — branding, SEO, PWA and languages written to app-config.json and applied on the next page load.',
  },
}
