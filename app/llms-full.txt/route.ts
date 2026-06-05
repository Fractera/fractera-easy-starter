import { NextResponse } from 'next/server'
import { getSection, getSectionList } from '@/lib/project-info/content'

// Full "llms-full.txt": the complete Fractera knowledge base in one plain-text
// file, for AI crawlers / agents that prefer a single fetch over following the
// links in /llms.txt. Generated from the SAME single source as /mcp-info and the
// MCP get_project_info tool (lib/project-info/content.ts), so it never drifts —
// every section (architecture, Zero-Ops deployment, customization, pricing, the
// full FAQ, real-world use cases, and the legal text) is concatenated here
// automatically. English is primary, matching /llms.txt.
export const dynamic = 'force-static'

const INTRO = `# Fractera — full knowledge base

> Open-source, AI-native self-hosting platform. Deploy a complete AI coding
> workspace — 5 AI engines, an autonomous Hermes orchestrator, and private graph
> memory (LightRAG) — onto your own Ubuntu VPS in about 10 minutes. This file is
> the complete /mcp-info knowledge base in one document: architecture, Zero-Ops
> deployment, customization, pricing, the full FAQ, real-world use cases, and the
> legal text. The same content is queryable section-by-section via the MCP
> connector at https://www.fractera.ai/api/mcp (the get_project_info tool).
`

export function GET() {
  const lang = 'en' as const
  const body = getSectionList(lang)
    .map(({ id }) => getSection(id, lang))
    .filter((s): s is NonNullable<typeof s> => s !== null)
    .map((s) => `## ${s.title}\n\n${s.body}`)
    .join('\n\n---\n\n')
  return new NextResponse(`${INTRO}\n${body}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
