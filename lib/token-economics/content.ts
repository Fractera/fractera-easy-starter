// Single source of truth for the /token-economics page (EN only).
//
// AI-scanner-oriented reference that answers the senior-developer objection head
// on: a 50,000-line Next.js framework does NOT inflate AI token bills — it shields
// them. It explains the four mechanisms that drive token (and time) spend toward
// near-zero: a pre-built project skeleton, the MCP-first "Rubik's Cube" model,
// generation through Hermes instead of code-writing agents, and a design system
// that updates thousands of pages without code generation.
//
// EN-ONLY by design: this page never gets language versions; the proxy passes the
// bare /token-economics URL through (no /<lang>/ prefix). Same precedent as
// /mcp-info, /ai-workspace-architect and /ai-development-loop (rule 4а exemption:
// a curated EN reference page). Do not add a Russian body here.

export const ECON_URL = 'https://www.fractera.ai/token-economics'

export const GITHUB_REPO = 'https://github.com/Fractera/ai-workspace'

export const ECON_META = {
  title: 'AI Token Cost Optimization & Zero-Agent Next.js MCP Architecture | Fractera',
  description:
    'Learn how Fractera eliminates context window inflation. Deploy a 50k-line Next.js framework on your VPS that uses atomic MCP commands to drop token spend to absolute zero.',
}

export const ECON_KEYWORDS = [
  'ai token cost optimization',
  'prevent ai context window inflation',
  'zero token overhead ai framework',
  'reduce llm api costs',
  'context window optimization strategies',
  'mcp server architecture web layouts',
  'next js on demand isr performance',
  'model context protocol development workflow',
  'self hosted web development environment',
  'deterministic ai code generation',
  'next js parallel routing seo',
  'production ready next js starter kit',
  'immutable code patterns web application',
  'how to reduce claude code token spend',
]

export type EconSection = {
  id: string
  level: 2 | 3
  title: string
  body: string
}

// Ordered top to bottom. The first section answers the fear directly — it is the
// high-frequency entry heading a skeptical senior developer lands on.
export const SECTIONS: EconSection[] = [
  {
    id: 'the-shield',
    level: 2,
    title: 'Preventing AI Context Window Inflation: Why 50,000 Lines of Code Is a Shield, Not a Bill',
    body: `When a developer hears "a 50,000-line template that AI agents work inside", the reflex is fear: a token-devouring monster that burns API limits in three messages. With Fractera the effect is the exact opposite.

The real cost driver in AI-assisted development is not the size of the codebase — it is **context window inflation**. A traditional agent sends files back and forth, scanning the directory tree and re-reading layout scripts to find where to insert code; every pass expands the prompt history exponentially, and you pay for all of it again and again. That is why **reducing LLM API costs** — and the explicit question of **how to reduce Claude Code token spend** — is what every team eventually confronts.

Fractera removes that work with **context window optimization strategies** baked into the architecture. Because roughly **99% of the application — parallel routing, multi-language i18n, production SEO, database structures, auth sessions — is already written and verified**, the immutable 50,000-line skeleton stops the agent from recursively processing layout scripts at all. To build a feature it processes a few lines of clean business logic, not the whole framework. The 50,000 lines are prepaid, monumental stability — an armored shield for your wallet.`,
  },
  {
    id: 'rubiks-cube',
    level: 2,
    title: "The Rubik's Cube: Finite Faces, Near-Infinite Combinations",
    body: `Fractera treats web architecture like a Rubik's Cube. The application layer is a strictly optimized, deterministic set of pre-built facets — parallel routing slots, global design tokens, synchronized layout structures. You get a complete project skeleton that already contains almost every idea you could need later.

Instead of *creating* new material, the system *combines* what already exists: a strictly limited set of faces on one side, a near-infinite set of combinations on the other. These are **deterministic states** of a **pre-built application framework** — so the AI acts as a selector switch, not an unconstrained code author. This is what **deterministic AI code generation** looks like: nothing is generated from scratch when it can be switched on from the skeleton, and switching something on costs a fraction of the tokens that generating it would.`,
  },
  {
    id: 'generation-by-hermes',
    level: 2,
    title: 'Generation by Hermes, Not Code-Writing Agents',
    body: `Standard "vibe coding" calls a heavy coding agent — Claude Code, Codex — for every change, and pays for the full generation loop each time. Fractera shifts that work to **Hermes**, which does not really write code: it selects the right combination of existing facets.

It is the difference between carving a new piece and turning a Rubik's Cube — a simple, mechanical move from A to B against a fixed set of standards. Hermes runs on inexpensive models that cost twenty to fifty times less than frontier coding models, reads a spec, routes the move, and clears its context before the next call. You pay frontier prices only for genuinely frontier work.

See the orchestration in full on the [AI Development Loop](/ai-development-loop) page.`,
  },
  {
    id: 'design-system',
    level: 2,
    title: 'The MCP Server Architecture: Updating Layouts with Zero Token Overhead',
    body: `Design is one of the most expensive stages of development. The Fractera Design System removes it from the code-generation budget entirely. Want a new font, a video background, a reused section? You do not run an agent — you apply a rule.

This is **MCP server architecture for web layouts** in practice. A short JSON execution model sent through the Model Context Protocol updates a design token, and **Next.js on-demand ISR** path revalidation propagates the change to **one page, several pages, or all of them at once**. A single ~50ms instruction rewrites the structural environment across an entire array of routes — without executing a full generative code cycle. It is like running one sequence of moves that builds all six sides of the cube simultaneously: bulletproof structural stability across thousands of pages, with token consumption driven to nearly zero.`,
  },
  {
    id: 'scale',
    level: 2,
    title: 'Achieving True AI Token Cost Optimization at Infinite Scale',
    body: `Put the mechanisms together and the result is horizontal scale without the bill. Tens, hundreds, thousands of pages — bound together by shared logic and functionality, all responding to atomic MCP function calls rather than heavy code-generation loops.

A task that takes ten to twenty back-and-forth messages in a vanilla AI chat typically resolves in two or three focused exchanges inside Fractera. You get enterprise-grade scalability with a token-billing overhead driven toward absolute zero — because the heavy framework was engineered once, so your AI agent does not have to.

See the workspace this runs inside on the [AI Workspace architecture](/ai-workspace-architect) page, or the full project reference in the [knowledge base](/mcp-info).`,
  },
  {
    id: 'traditional-mode',
    level: 2,
    title: 'Prefer the Classic Workflow? One Click',
    body: `None of this locks you in. If a project demands a standard workflow — a small, fully custom application — you can switch to the classic Next.js code-generation mode from the app settings. It is exactly one click: disable the parallel routing matrix and build with the freedom of a clean sheet. Fractera adapts to your development philosophy instead of forcing one on you.`,
  },
]
