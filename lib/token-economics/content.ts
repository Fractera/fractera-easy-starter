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
  title: 'How Fractera Saves Tokens & Time | Zero-Agent MCP Token Economics',
  description:
    "Why Fractera's 50,000-line Next.js framework drives AI token spend toward near-zero instead of inflating it: a pre-built project skeleton, MCP-first generation through Hermes instead of code-writing agents, and a design system that updates one, several, or thousands of pages at once without code generation.",
}

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
    title: 'The 50,000-Line Framework Is a Shield for Your Budget, Not a Bill',
    body: `When a developer hears "a 50,000-line template that AI agents work inside", the reflex is fear: a token-devouring monster that burns API limits in three messages. With Fractera the effect is the exact opposite.

The real cost driver in AI-assisted development is not the size of the codebase — it is **context window inflation**. An agent that scans the directory tree, reads hundreds of lines to understand where to insert code, and rewrites half a file pays for all of that, every time. Fractera removes that work. Because roughly **99% of the application — parallel routing, multi-language i18n, production SEO, database structures, auth sessions — is already written and verified**, the agent never has to re-invent or re-read the infrastructure. To build a feature it processes a few lines of clean business logic, not the whole framework. The 50,000 lines are prepaid, monumental stability — an armored shield for your wallet.`,
  },
  {
    id: 'rubiks-cube',
    level: 2,
    title: "The Rubik's Cube: Finite Faces, Near-Infinite Combinations",
    body: `Fractera treats web architecture like a Rubik's Cube. The application layer is a strictly optimized, deterministic set of pre-built facets — parallel routing slots, global design tokens, synchronized layout structures. You get a complete project skeleton that already contains almost every idea you could need later.

Instead of *creating* new material, the system *combines* what already exists: a strictly limited set of faces on one side, a near-infinite set of combinations on the other. Nothing is generated from scratch when it can be switched on from the skeleton — and switching something on costs a fraction of the tokens that generating it would.`,
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
    title: 'The Design System: Change Thousands of Pages Without Code Generation',
    body: `Design is one of the most expensive stages of development. The Fractera Design System removes it from the code-generation budget entirely. Want a new font, a video background, a reused section? You do not run an agent — you apply a rule.

Through the MCP server, a single instruction updates a design token, and on-demand ISR revalidation propagates the change to **one page, several pages, or all of them at once** — in milliseconds, with no code written. It is like running one sequence of moves that builds all six sides of the cube simultaneously. Bulletproof structural stability across thousands of pages, with token consumption driven to nearly zero.`,
  },
  {
    id: 'scale',
    level: 2,
    title: 'Tens of Thousands of Pages, Near-Zero Token Cost',
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
