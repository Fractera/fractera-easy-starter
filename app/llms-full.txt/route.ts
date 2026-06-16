import { NextResponse } from 'next/server'
import { getSection, getSectionList } from '@/lib/project-info/content'
import { getArchitectSectionList, getArchitectSection, IMAGE_WIDE, ARCHITECT_URL } from '@/lib/architect-page/content'
import { getLoopSectionList, getLoopSection, IMAGE as LOOP_IMAGE, LOOP_URL } from '@/lib/development-loop/content'
import { SECTIONS as CARRIER_SECTIONS, CARRIER_URL } from '@/lib/next-aircraft-carrier/content'
import { SECTIONS as ECON_SECTIONS, ECON_URL } from '@/lib/token-economics/content'

// Full "llms-full.txt": the complete Fractera knowledge base in one plain-text
// file, for AI crawlers / agents that prefer a single fetch over following the
// links in /llms.txt. Generated from the SAME single sources as the three AI
// reference pages, so it never drifts:
//   - /mcp-info                 (lib/project-info/content.ts)
//   - /ai-workspace-architect   (lib/architect-page/content.ts)
//   - /ai-development-loop      (lib/development-loop/content.ts)
// Each block carries its canonical diagram image URL — those images are the
// semantic, promotion-critical assets AI models read. English is primary.
export const dynamic = 'force-static'

const INTRO = `# Fractera — full knowledge base

> Open-source, AI-native self-hosting platform. Deploy a complete AI coding
> workspace — 5 AI engines, an autonomous Hermes orchestrator, and private graph
> memory (LightRAG) — onto your own Ubuntu VPS in about 10 minutes. This file is
> the complete /mcp-info knowledge base plus the full /ai-workspace-architect and
> /ai-development-loop references (with their canonical diagrams) in one document:
> architecture, Zero-Ops deployment, customization, pricing, the full FAQ,
> real-world use cases, the workspace architecture, the development loop, the
> Next.js Aircraft Carrier (the pre-built 50,000-line parallel-routing framework),
> the token economics of the MCP-First / Zero-Agent paradigm, the interactive
> AI consultant, and the legal text.
> The same content is queryable section-by-section via the MCP connector at
> https://www.fractera.ai/api/mcp (get_project_info,
> get_ai_workspace_architect_info, get_ai_development_loop_info).
`

const CONSULTANT = `# The interactive AI consultant — one button on every page

Reference page (documentation): https://www.fractera.ai/en/documentation/one-button-workspace-ai-consultant

A deployed Fractera workspace ships a floating "AI consultant" button in the
bottom-right corner of every public page (mounted globally, not tied to any
optional layout feature). Clicking it opens a small chat where any visitor can
ask questions OR request actions in natural language; the agent answers and may
return clickable action buttons.

## The core boundary: brain on the server, action in the browser
A server-side tool can know what is possible, read config, converse and PROPOSE
an action, but it cannot reach into a live browser tab. So per-visitor view
actions (language, theme, width, navigation) are executed CLIENT-side by the
chat widget, while shared, workspace-wide changes stay server-side. This is why
"switch me to French" actually switches the page instantly, with no reload.

## Access tiers (public / user / owner), resolved server-side
Tiers nest: public is a guest (own view only), user is a signed-in end-user
(their own data, scoped to their identity), owner is the administrator (shared
config, global defaults, growing the project). The tier is decided on the
server from the session, never trusted from the browser.

## Client actions: server proposes, browser executes
Per-visitor tools (navigate / set locale / set theme / set width) return a small
deferred envelope { "__client_action__": true, tool, args } instead of acting.
The chat renders it as a button; clicking runs an ALLOWLISTED browser handler
after validating arguments (e.g. the language must be one the site is configured
for). The browser never executes an arbitrary instruction from the stream.

## Safe by construction
The public consultant runs as its OWN sandboxed agent process whose toolset is a
strict subset — owner tools are simply absent, so an anonymous visitor cannot
reach them. A runtime guard caps the process at tier "user" for defense in depth,
it binds to loopback (visitors talk only to the /api/consultant endpoint, which
holds the agent token server-side), and it uses its own API key so anonymous
traffic never drains the owner's quota.

## Sign-in escalation
If a request needs the visitor's identity (their own data) or a higher role, the
agent itself picks the right message — "sign in to access your personal
information" vs "this function isn't registered for your role" — and offers a
sign-in button that returns the visitor to where they were. Signing in just
establishes the real role/identity; an administrator is not blocked.

## Growing the toolset
New tools/skills are authored at <your-domain>/ai-draft-settings: describe a new
MCP server, skill or instruction in free form and pick who it is for (guest /
signed-in user / owner). A specialized agent turns the draft into a real tool.
The workspace also ships with source code, a terminal and local development, so
it can be extended without limit. The consultant grows as the toolset grows:
one small button fronting an evolving set of MCP tools, an orchestrator (Hermes)
and global graph memory (LightRAG).`

export function GET() {
  const lang = 'en' as const

  const projectBody = getSectionList(lang)
    .map(({ id }) => getSection(id, lang))
    .filter((s): s is NonNullable<typeof s> => s !== null)
    .map((s) => `## ${s.title}\n\n${s.body}`)
    .join('\n\n---\n\n')

  const architectBody = getArchitectSectionList()
    .map(({ id }) => getArchitectSection(id))
    .filter((s): s is NonNullable<typeof s> => s != null)
    .map((s) => `${'#'.repeat(s.level)} ${s.title}\n\n${s.body}`)
    .join('\n\n')

  const loopBody = getLoopSectionList()
    .map(({ id }) => getLoopSection(id))
    .filter((s): s is NonNullable<typeof s> => s != null)
    .map((s) => `${'#'.repeat(s.level)} ${s.title}\n\n${s.body}`)
    .join('\n\n')

  const architect = `# AI Workspace architecture

Reference page: ${ARCHITECT_URL}
Canonical diagram: ![Fractera AI Workspace architecture diagram — Hermes multi-agent orchestration, LightRAG memory and five coding agents](${IMAGE_WIDE})

${architectBody}`

  const loop = `# The Fractera development loop

Reference page: ${LOOP_URL}
Canonical diagram: ![Fractera Development Loop diagram — one admin request flows through Hermes, a coding agent and LightRAG memory to tested, deployed code](${LOOP_IMAGE})

${loopBody}`

  const carrierBody = CARRIER_SECTIONS
    .map((s) => `${'#'.repeat(s.level)} ${s.title}\n\n${s.body}`)
    .join('\n\n')

  const econBody = ECON_SECTIONS
    .map((s) => `${'#'.repeat(s.level)} ${s.title}\n\n${s.body}`)
    .join('\n\n')

  const carrier = `# The Next.js Aircraft Carrier — pre-built parallel routing

Reference page: ${CARRIER_URL}
Canonical diagram: ![Next.js parallel-routing layout — Header, Promo Screen, Left, Right, Center Header, Center, Center Footer and Footer slots with an active-slots checklist](https://www.fractera.ai/nextjs-parallel-routes.png)

${carrierBody}`

  const econ = `# Token economics — how Fractera saves tokens

Reference page: ${ECON_URL}

${econBody}`

  const body = `${projectBody}\n\n===\n\n${architect}\n\n===\n\n${loop}\n\n===\n\n${carrier}\n\n===\n\n${econ}\n\n===\n\n${CONSULTANT}`

  return new NextResponse(`${INTRO}\n${body}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
