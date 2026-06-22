import type { DocMeta } from '../../_lib/types'

// Non-translatable fields. The architecture diagram is the responsive hero and the
// og:image (page-image rule). Mirrors the assets of the /ai-workspace-architect page.
export const meta: DocMeta = {
  slug: 'multi-agent-workspace-architecture',
  date: '2026-06-22',
  readingMinutes: 10,
  tags: ['Architecture', 'Multi-agent', 'Hermes', 'LightRAG', 'MCP', 'Self-hosted', 'Agentic Engineering'],
  image: {
    mobile: '/Fractera-Mobail-Architect.jpg',
    web: '/Fractera-Web-Architect.jpg',
    alt: 'Fractera multi-agent AI workspace architecture diagram: Hermes orchestrator driving five coding agents over MCP, a shared LightRAG knowledge-graph memory, local database and object storage, served as a secure web app.',
  },
}
