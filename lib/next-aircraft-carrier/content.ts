// Single source of truth for the /next-aircraft-carrier page (EN only).
//
// AI-scanner-oriented silo page that converts skeptical senior developers: the
// "50k lines is overkill / another token-burner" crowd. It explains parallel
// routing, why the next generation of apps needs it, and how Fractera ships it
// pre-built so pages deploy without a build and without token spend.
//
// EN-ONLY by design: the proxy passes the bare /next-aircraft-carrier URL through
// (no /<lang>/ prefix). Same precedent as /mcp-info, /ai-workspace-architect,
// /ai-development-loop, /token-economics (rule 4а exemption: curated EN reference).
//
// SEO keys placed per the Google brief: enterprise boilerplate, cost-effective AI
// development, prevent context window inflation, parallel routing SEO, on-demand
// ISR, self-hosted alternative to Vercel, scalable web application architecture,
// MCP server development layout, immutable code patterns, multi-language routing.
//
// NOTE: slot count is written as 13 to match the founder's signed manifesto on the
// home page. Product currently ships 12 (@codeGenerator excluded) — swap globally
// if the founder confirms 12.

export const CARRIER_URL = 'https://www.fractera.ai/next-aircraft-carrier'

export const GITHUB_REPO = 'https://github.com/Fractera/ai-workspace'

export const CARRIER_META = {
  title: 'Next.js Enterprise Boilerplate & Cost-Effective AI Development | Fractera',
  description:
    'Stop AI context window inflation. Deploy a production-ready Next.js starter with 50,000 lines of pre-built architecture and parallel routing. Scale to thousands of pages with zero token overhead — self-hosted on your own VPS.',
}

export type CarrierSection = {
  id: string
  level: 2 | 3
  title: string
  body: string
}

// Ordered top to bottom. The first section disarms the skeptic head-on, then the
// page builds the technical case node by node (N1–N10).
export const SECTIONS: CarrierSection[] = [
  {
    id: 'context-window-inflation',
    level: 2,
    title: 'Preventing AI Context Window Inflation',
    body: `Let us meet the objection directly: *"50,000 lines of code is overkill — and surely it just burns more AI tokens."* The opposite is true, and here is the mechanism.

The real cost driver in AI-assisted development is not the size of the codebase — it is **context window inflation**. An agent that scans the directory tree, reads hundreds of lines to find where to insert code, and rewrites half a file pays for all of that on every pass, and the bill compounds. This is the **cost-effective AI development** problem nobody priced in.

Fractera removes that work. Because roughly **99% of the architecture is already written and verified** — parallel routing, i18n, production SEO, database, auth — the agent never re-invents or re-reads the infrastructure. To ship a feature it processes a few lines of clean business logic, not the whole framework. The 50,000 lines are not a bill; they are **prepaid stability** — an armored shield for your token budget and the core of **AI code generation cost optimization**.`,
  },
  {
    id: 'what-is-parallel-routing',
    level: 2,
    title: 'What Parallel Routing Is — and Why the Next Generation of Apps Needs It',
    body: `**Parallel routing** is a Next.js capability built so that, within a single URL — effectively a single screen — a person, an architect, or an AI model can combine a large number of dynamic parts called **slots**. Some are fixed in place; others appear on demand — as drawers sliding in from the left, right, top or bottom, or as modal windows flashing up in the centre. Most of this happens **without changing the main route, without a page reload, and without losing any content**.

Under the hood Next.js manages application memory and error handling so robustly that if one tab fails, the maximum damage is the loss of that single tab until it is reopened — the application keeps working. It is an exceptionally reliable model, and it is where the web is heading. Done right, this is also how you win **next js parallel routing SEO**: every slot is real, crawlable HTML.`,
  },
  {
    id: 'rails-not-chaos',
    level: 2,
    title: 'Next.js Parallel Routing & On-Demand ISR for Infinite Scale',
    body: `An AI agent trained to create and activate parallel-routing slots gains the ability to model an interface at an almost limitless level. The Rubik's Cube analogy is even clearer here: instead of letting a project scatter global blocks of content and logic across unpredictable parts of the app, parallel routing **structures the core of the Next.js project and lays down the rails** that every future page deployment runs along.

Note the word *deployment* rather than *generation*. Backed by **on-demand ISR** (Incremental Static Regeneration), the framework regenerates thousands of pages without overloading the server or the AI — the foundation of genuinely **scalable web application architecture** and excellent **Next.js App Router performance** and Core Web Vitals.`,
  },
  {
    id: 'deployment-not-generation',
    level: 2,
    title: 'Deployment, Not Generation',
    body: `Inside each section there are strictly regulated rules for creating content and design, described by the design system. That means the model simply **selects the section it needs and passes the required data into it**. For this, code generation is barely needed — it is a choice among available options, not authorship from scratch.

These are **immutable code patterns**: compiled, verified building blocks an AI agent configures but cannot accidentally break. You get the flexibility of custom assembly with the reliability of an enterprise backend.`,
  },
  {
    id: 'when-generation-kicks-in',
    level: 2,
    title: 'When Code Generation Kicks In — and Becomes a Reusable Widget',
    body: `Code generation switches on only at one moment: when the architect decides to add a new section or a new technical, tooling solution. At that point generation runs once and turns the result into a **reusable widget** the application will use again and again — with no further generation.

So generation is the exception, not the loop. The default path is selection and configuration; authorship happens once and is then frozen into a reusable part.`,
  },
  {
    id: 'widget-marketplace',
    level: 2,
    title: 'The Fractera Widget Marketplace',
    body: `Architects on Fractera will not only create their own widgets but also find them in the **Fractera marketplace** (coming soon). There, developers can sell their own widget — anything from an AI chat to something far more involved, such as a calculator for the made-to-order price of a fitted kitchen. Architects place these widgets in the marketplace and then attach them to one of their routes.

This is also where **MCP server development layout** comes in: the AI manages structure and layout — adding, moving, and wiring widgets — through the Model Context Protocol, like turning a Rubik's Cube.`,
  },
  {
    id: 'why-so-few-examples',
    level: 2,
    title: 'Why There Are So Few Parallel-Routing Examples',
    body: `There is a simple reason the web has so few real parallel-routing implementations: the technology is **too complex for today's AI** and demands deep, reliable reference examples. In understanding and in building it, developers run into the fact that parallel routing simultaneously requires a deep grasp of how content is stored, delivered, reused, and refreshed.

In production this matters enormously. A small mistake can flip a project from **static generation into dynamic generation**, which triggers an instant, avalanche-like spike in server load and an uncontrolled volume of database calls — inflating either your cloud-database bill or your own resource usage.`,
  },
  {
    id: 'how-fractera-solved-it',
    level: 2,
    title: 'How Fractera Solved It',
    body: `With Fractera this does not happen. Before you ever received this offer, Fractera spent a year testing and refining the interaction between parallel-routing slots — so that you receive an application you do not need to *develop*, only to **fill with data and parameters**.

We also taught the AI model, through several dedicated **MCP connectors**, to combine all the necessary slots on a single URL — and to change them when needed — in answer to any question from you or your visitor. It is an extraordinary bridge to the future that Fractera hopes will permanently change how applications are built. This is what makes it real **high-traffic web infrastructure, self-hosted** on hardware you control.`,
  },
  {
    id: 'self-hosted-vercel',
    level: 2,
    title: 'A Self-Hosted Alternative to Vercel for High-Traffic Web Infrastructure',
    body: `Because the whole stack runs on your own VPS, Fractera is a **self-hosted alternative to Vercel**: the same one-click deploy speed, none of the per-request pricing that escalates under real-world traffic. Your database, file storage, auth, and the entire parallel-routing framework live on one server, billed once through your VPS provider.

For high-traffic projects this is the difference between predictable infrastructure cost and a bill that scales with every visitor.`,
  },
  {
    id: 'why-50000-lines',
    level: 2,
    title: 'Why 50,000+ Lines — and What You Can Build With Them',
    body: `This is the largest Next.js starter we know of — and the size is the point. 50,000 lines of code so your offer generates new pages in seconds **without spending tokens**; so you can build dozens, hundreds, or a thousand applications; so you can run many projects on one server — for yourself, for work, for family — to manage business processes and staff, whatever you wish, all in one interactive screen.

Multi-language routing is already wired into those 50,000 lines and works out of the box, so **Next.js multi-language routing** is a solved, routine problem rather than a project of its own. And the stronger AI models become, the more extraordinary the applications you will build — bringing the Tony Stark and Jarvis era a little closer each year.`,
  },
  {
    id: 'whats-inside',
    level: 2,
    title: "What's Inside — and What's Coming",
    body: `This page is the tip of the iceberg. It will grow into a detailed catalogue — more than a hundred screenshots, each describing one feature, plugin, or widget of the parallel-routing system.

For now, see the live system this runs inside on the [AI Workspace architecture](/ai-workspace-architect) page, read how a request becomes shipped software on the [AI Development Loop](/ai-development-loop), or understand the cost model on the [Token Economics](/token-economics) page. When you are ready, deploy the whole stack to your own VPS in about ten minutes.`,
  },
]
