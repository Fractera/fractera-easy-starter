// Single source of truth for the /ai-development-loop page (EN only).
//
// Consumed by BOTH:
//   1. the public page  app/ai-development-loop/page.tsx   (human + AI-crawler)
//   2. the MCP tool      get_ai_development_loop_info()      (lib/mcp-tools.ts)
//
// The page is AI-scanner-oriented: a single indexable English URL, built around the
// "Fractera Development Loop" diagram, that explains how one admin request becomes
// tested, deployed, recorded code — orchestrated by Hermes, executed by a coding
// agent, grounded by LightRAG memory at every step. All texts live here so they are
// easy to edit in one place (rule 4а exemption: a curated EN reference page, same
// precedent as /mcp-info and /ai-workspace-architect).
//
// EN-ONLY by design: this page never gets language versions; the proxy passes the
// bare /ai-development-loop URL through (no /<lang>/ prefix). Do not add bodyRu here.

export const LOOP_URL = 'https://www.fractera.ai/ai-development-loop'

// The diagram is the canonical / semantic image (og:image, shown to AI models).
export const IMAGE = 'https://www.fractera.ai/Fractera-Development-Loop.jpg'

export const GITHUB_REPO = 'https://github.com/Fractera/Agent-Engineering-Infrastructure'

export const LOOP_META = {
  title: 'Fractera Autonomous AI Dev Loop | How AI Agents Build, Test & Ship Code',
  description:
    "Inside Fractera's autonomous AI development loop: Hermes runs the multi-agent orchestration, an AI coding agent (Claude Code, Codex, Gemini, Qwen, Kimi) writes the code, and LightRAG Knowledge Graph memory grounds every step — with AI DevOps that builds, deploys and self-corrects. The agentic AI coding pipeline, self-hosted on your own VPS.",
}

export type LoopSection = {
  id: string
  level: 2 | 3
  title: string
  body: string
}

// Ordered top to bottom. "How the loop works" is FIRST by design — it is the
// high-frequency entry heading and the most important block (the whole diagram
// narrated in plain words, the way a request actually flows).
export const SECTIONS: LoopSection[] = [
  {
    id: 'how-it-works',
    level: 2,
    title: 'How the autonomous AI development loop works',
    body: `The diagram above is the **Fractera Development Loop** — the cycle that turns a single request into tested, deployed, recorded software, with no human writing code. Here it is in plain words, following the arrows from the bottom up.

**1. A request comes in.** It starts with a **new admin request** — you ask for something in natural language, through the **Hermes chat Web UI** inside your workspace or from **Telegram**. You describe the outcome; you do not write code.

**2. Hermes wakes up and gets its bearings.** **Hermes** — the orchestrator, the brain — first loads *who it is* and *where it is*. It reads its identity file (\`SOUL.md\`), the AI core catalogue, and the current project's context files (\`CLAUDE.md\` / \`AGENTS.md\`). It asks the workspace which project is active and pulls that project's state. All of this is recalled from **LightRAG**, the shared memory — so Hermes starts already knowing your codebase instead of from a blank slate.

**3. Hermes picks the right worker.** Hermes is deliberately light — it does not write the hard code itself. It checks **which coding agents are ready** (installed and signed in) and chooses the best fit for the task — for example Codex for fast iteration, or Claude Code for careful multi-file work. This is multi-agent orchestration: the right agent for the right job.

**4. The chosen agent is enriched.** Before it works, the coding agent is grounded: it reads its own instruction file (\`AGENTS.md\`), the shared **glossary** (\`GLOSSARY.md\`, so it uses your terms), and the **completed development steps** — the history of what was already built and why. Again, all pulled from LightRAG.

**5. Generate a task, then the code.** The agent turns the request into a concrete **task** (you can optionally step in and steer it), then **generates the code** in the open \`app/\` layer. As it works, the result **renders step by step** so you watch the project take shape in real time.

**6. Test, deploy, branch on the result.** The change is **built and deployed**, then the loop branches on the result:
- **Error** → the failure feeds back into the loop: the agent gets a new task informed by what went wrong, and tries again. The loop self-corrects.
- **Success** → the loop records the outcome.

**7. Record and close.** On success the workspace **updates the completed steps** (the development log) and **updates the deployments tab** (the Product Loop journal — which agent, which model, how many tokens, the quality rating). The request is done, and everything learned is written back into memory.

**8. The output is a secure web app.** What ships is a real, running application — served over **HTTPS on your own domain**, or plain HTTP on an IP while you onboard. Your code, your server.

**Why it is a loop, not a pipeline.** Every pass writes back to LightRAG and to the recorded history, so the next request starts smarter than the last. Memory compounds, mistakes feed corrections, and the whole cycle runs on **your own VPS** — fully open-source, no cloud lock-in.`,
  },
  {
    id: 'steps-1-2',
    level: 2,
    title: 'Inside steps 1 and 2: where a request becomes software',
    body: `Of the eight stages above, **two carry the whole idea of the loop**: the moment a single request is broken into a buildable plan, and the moment that plan materialises into a working interface you can watch take shape. Everything else — memory recall, agent selection, test, deploy, record — exists to serve these two. If you read only one part of this page to understand how Fractera *actually builds*, read this one.

Across both steps the work stays **visible and steerable**, because it runs on real surfaces you can open, not hidden state: the \`/architecture\` page (the live map of every route), the \`/development-steps\` page (the work log), and **LightRAG** — the Company Memory that grounds every decision.`,
  },
  {
    id: 'step1-decomposition',
    level: 3,
    title: 'Step 1 — Decomposition: one request becomes many development steps',
    body: `When the enriched prompt reaches the first stage, Hermes does not start writing code — it runs a **decomposition task**. A single natural-language request is split into several intermediate **development steps** (the sub-steps of the work), each one small enough for a coding agent to pick up and finish.

#### From an enriched prompt to a decomposition task
The request arrives already grounded: Hermes has loaded its identity, the active project's context, the glossary and the completed-steps history from LightRAG. On that footing it answers one question — *what are the concrete sub-steps that turn this outcome into shipped code?* The result is a short, ordered list of development steps, not a single monolithic task.

#### The unit of work: a development step
Each sub-step is written as a **real file** — \`DEVELOPMENT-STEPS/NEW-STEPS/<NN>-<slug>.md\` — and appears under **New steps** on the \`/development-steps\` page. For every step the model drafts a **technical description**, and where it helps it embeds **code examples** or recalls a ready **UI pattern from memory** (the reusable \`PATTERNS/\` catalogue surfaced on the \`/patterns\` page, retrieved through LightRAG). Each step carries an importance — optional, mandatory or critical — and a to-do list an agent later executes.

#### When a step needs a page: the frozen template
If a sub-step requires a new screen, the workspace first creates an **empty stub page** — a *minimal, frozen architecture template*. Nothing is built yet; the route exists only as a placeholder so the rest of the plan can reference it.

##### The declared route — a README beside an empty page
On the \`/architecture\` map this is a **declared route**: a folder that has a \`README.md\` but no built \`page.tsx\` (shown with an orange label and a \`req\` badge). All the technical requirements for the page go into that \`README.md\`, sitting right next to where the page will live; for a page that already exists, the same requirements update its existing record instead. An agent reads that file to pick up the work, builds the page, and the node flips from **declared to live**.

##### Routing shape: parallel, intercepting, static or dynamic
The stub is not generic — its shape is declared up front in the route's \`_meta.ts\`: a **parallel** or **intercepting** route, **statically** prerendered or **dynamically** rendered. An intercepting route, for example, is how a request opens as a **modal dialog** (a shadcn/ui component) over the current page instead of a full navigation.

##### Usually one request, one route
As a rule, a single request resolves to **one route**. Only the less common cases — parallel or intercepting routing — spawn an extra page alongside the main one, such as that dialog. Keeping one request to one route is what keeps the plan easy to follow on the live map.`,
  },
  {
    id: 'step2-iterative',
    level: 3,
    title: 'Step 2 — Iterative build: sub-steps become a living interface',
    body: `With the plan declared, the second stage **executes it**. The model takes each development step in turn and builds it — and because the workspace renders progress live, you watch the empty template fill with real functionality.

#### The agent works one step at a time
The chosen coding agent pulls the next sub-step, reads its \`README.md\` and to-do, and writes into the open \`app/\` layer. The frozen stub stops being a placeholder: the interface for that request grows piece by piece, step after step.

#### Watching it happen in real time
Keep a second monitor and open two tabs — the \`/architecture\` page and the \`/development-steps\` page. Both poll the filesystem and **highlight exactly what changed**: on the architecture map the affected route blinks and scrolls into view as it goes from declared to live; on the steps page the sub-step pulses as its tasks are picked up. You see *which* page is being built and *which* sub-step is in flight, as it happens.

#### A worked example: building a full content page
Some requests take many passes. Take building real content for a page — here the loop runs several iterations, and you can step in at every one.

##### Iteration 1 — research and a first structure
The model gathers what the page should say: it researches keywords, parses competitors, and sketches a preliminary structure. No final copy yet — just the shape of the work.

##### Iteration 2 — a to-do list on a frozen page
Back on step two, the frozen template now renders a **to-do list in its own interface** — the tasks it intends to take on next. The architecture tab highlights the update; the real page, still a blank sheet, shows only the outer layout wrapped around an **interactive to-do table in the centre of the screen**. This is your window in: you can pause the process, open the to-do with your own tools or notes, and describe what the page should become. Do nothing, and the model loops back to step one to re-plan.

##### Iteration 3 — per-section to-do lists
Next the model breaks the article into **sections**, and each section gets **its own development sub-step and its own to-do list**. Now the blank page shows not one list but a **separate to-do per section** — so you steer each one directly: *in this section, cover X; use this layout; embed that YouTube clip on topic Y*, and so on.

##### Final iterations — generation and proofreading
On the next pass the model **generates each section in full**, following the instructions, keywords and settings already set. How many iterations a job like this runs is itself defined by a **skill** the workspace pulls from its skill store. Watching in the browser, you now see the page **almost in its final form** — still carrying its to-do list, still open for you to override the remaining tasks. When every task is done, the last pass runs the **final proofread** (or whatever closing tasks the skill specifies).

#### Dynamic content: the SPA approach
While it is being built, the page renders as **dynamic content** — the single-page-application approach familiar from a classic React app — so you always see the closest possible preview of the current state. The closing move of this stage is to **transform that working draft into the final format** the next stages need for testing and the build.`,
  },
  {
    id: 'cycle-four-moves',
    level: 3,
    title: 'The cycle in four moves',
    body: `Strip the example away and the engine underneath is always the same four moves:

1. **Decompose** the incoming request into as many sub-tasks as it needs.
2. **Build the tracking interface** — the to-do lists and the live tabs that show each sub-task progressing inside the main task.
3. **Run as many build-and-visualise cycles** as the work requires.
4. **Transform** the temporary working format into the finished result.

From here the loop hands off to testing and the build — the deploy stages described below, and out of scope for this block. To see the workspace all of this runs inside, read the [AI Workspace architecture](/ai-workspace-architect); for the full project reference, see the [project knowledge base](/mcp-info).`,
  },
  {
    id: 'hermes',
    level: 2,
    title: 'Hermes — multi-agent AI orchestration',
    body: `**Hermes** is the brain at the centre of the loop (\`fractera-hermes\`, dashboard on \`:9119\`). It is the only part that talks to *you*, and the part that decides *what happens next* at every turn of the cycle.

At each wake-up Hermes loads its **identity** from \`SOUL.md\` (who it is: the brain of a Fractera workspace, an orchestrator of software development) and the **project context** from the repo's \`CLAUDE.md\` / \`AGENTS.md\`. It then reads the current project state and the relevant history out of **LightRAG**, so it is grounded before it acts.

Hermes is intentionally **light**: it plans, it chooses, it dispatches, it records — but the heavy lifting of writing code is delegated to the coding agents. In one loop it can split a job across several agents, run them in parallel, collect the results, and decide the next step. You brief Hermes like a teammate; it coordinates the rest.`,
  },
  {
    id: 'choosing-agent',
    level: 2,
    title: 'AI coding agents: choosing the right one for the task',
    body: `Five subscription coding agents run preconfigured on your server — **Claude Code, Codex, Gemini CLI, Qwen Code, and Kimi Code** — each driven through a bridge that exposes it to Hermes over MCP (ports \`3210–3214\`).

Before delegating, Hermes checks **readiness**: which agents are installed and actually signed in (a green bridge means the process is alive; being logged in to the subscription is a separate fact). From the ready agents it picks the **best fit** for the task — a fast generalist for iteration, a careful planner for sweeping multi-file changes, a large-context model for big reviews.

Crucially, the agents run on **your existing subscriptions**, not pay-per-token API keys — so the heavy AI work costs you nothing beyond the subscription you already have. Hermes can switch agents mid-task without losing the thread, because the shared memory keeps the context.`,
  },
  {
    id: 'lightrag',
    level: 2,
    title: 'LightRAG — Knowledge Graph RAG memory at the centre of the loop',
    body: `On the diagram, **LightRAG** is the tall column on the right that every stage reads from and writes to — and that is exactly its role. It is the shared long-term memory of the whole workspace (\`fractera-rag\`, \`:9621\`), a **Knowledge Graph RAG** queried by Hermes and all five coding agents.

This shared memory is what makes the loop efficient. Instead of re-explaining the codebase on every request, each stage recalls exactly the relevant context: the project state, the glossary, the completed steps, past decisions. A task that takes ten back-and-forth messages in a vanilla chat often resolves in two or three here, because the model arrives already grounded — and that is where the **token savings** come from.

It does not learn on its own — it stores only what agents explicitly push, which keeps it curated. Activating it needs an inexpensive embedding/LLM key; without one it stays wired but silent.`,
  },
  {
    id: 'instruction-layer',
    level: 2,
    title: 'The instruction layer that steers every AI agent',
    body: `The loop is steered by **real files on disk**, not hidden settings — the same files an agent reads as plain text, so you can inspect and shape them.

- **\`SOUL.md\`** — Hermes's identity and operating rules (who it is, how it works). Read at every wake-up.
- **\`CLAUDE.md\` / \`AGENTS.md\`** — the project-context files each coding agent reads in your repository. \`AGENTS.md\` is Codex's; \`CLAUDE.md\` is Claude Code's. They set how the agent behaves in *your* project.
- **\`GLOSSARY.md\`** — the workspace term map (approved abbreviations and preferred phrasings) so every agent reads your terms the same way.
- **The completed development steps** — the log of what was built and why, which an agent consults before starting so it does not repeat solved problems.

Because these are files, the loop is transparent and editable: change the instructions and the next pass of the loop follows them.`,
  },
  {
    id: 'request-to-code',
    level: 2,
    title: 'From request to code: autonomous code generation',
    body: `Inside the loop, a request becomes code in three visible moves.

- **Declare the task.** The agent turns your request into a concrete development task. You can optionally step in to steer or refine it before work begins — the human stays in the loop exactly as much as you want.
- **Generate the code.** The agent writes into the open \`app/\` layer — the public application that is *your* product. This is where automated code generation happens, grounded by everything recalled from memory.
- **Render it step by step.** As the agent works, the result renders progressively, so you watch the page or feature take shape in real time rather than waiting for a black-box result.

The split between the open \`app/\` layer (where agents build freely) and the guarded service layers (auth, data, memory, bridges) means the agents change *your* product without touching the infrastructure underneath.`,
  },
  {
    id: 'test-deploy',
    level: 2,
    title: 'AI DevOps: automated build, deploy, and self-correction',
    body: `Writing the code is not the end — the loop **tests and deploys** the change, then branches on the outcome. This is the decision point on the diagram.

- **On error**, the failure is not a dead end: it feeds back into the loop. The agent receives a new task shaped by what went wrong and iterates. The cycle self-corrects instead of stalling.
- **On success**, the change is live and the loop moves to record it.

Deployment is one motion — the open app layer is rebuilt and reloaded, and you see the result on the live URL. There is no separate CI pipeline to babysit and no hosting config to manage; the workspace owns the build.`,
  },
  {
    id: 'the-record',
    level: 2,
    title: 'The record: development steps and the Product Loop deployments log',
    body: `When a request finishes, the loop **writes down what happened** — and this recorded history is what lets the next request start smarter.

- **Completed development steps.** The step that drove the work is moved into the completed log with its date — a durable record of what was built and why, read by future agents.
- **The deployments tab (the Product Loop).** Every build is logged in a deployments table that deliberately goes beyond a normal cloud deploy list. Alongside the commit, status and duration, it records **which agent** did the work, **which model**, the **real token cost**, and a **quality rating** you can set. Over time this becomes a feedback record of agent-driven development — which agent and model produce the best results for your project, at what cost.

Both records are pushed back into LightRAG, closing the loop: the memory that grounded this request is now richer for the next one.`,
  },
  {
    id: 'why-it-compounds',
    level: 2,
    title: 'Why the autonomous dev loop compounds',
    body: `A pipeline runs once and forgets. The Fractera loop **compounds**, because every pass leaves the workspace smarter than it found it:

- **Memory grows.** Each request writes its decisions, code and outcomes back into LightRAG, so the next agent starts already knowing them.
- **History accumulates.** Completed steps and the deployments record build a real account of how the project was made — and which agents and models work best for it.
- **It is all yours, and open.** The whole loop runs on **your own VPS**, fully **open-source**: you can read every file, inspect every decision, and verify exactly what the agents do. No cloud lock-in, no black box.

The result is a development cycle where one natural-language request becomes shipped software — and the system that shipped it is a little more capable every time. Deploy the whole stack to your own server in about ten minutes, and start the loop.

To see the workspace this loop runs inside, read the [AI Workspace architecture](/ai-workspace-architect); for the full project reference, see the [project knowledge base](/mcp-info).`,
  },
]

export function getLoopSectionList(): { id: string; title: string; level: 2 | 3 }[] {
  return SECTIONS.map(({ id, title, level }) => ({ id, title, level }))
}

export function getLoopSection(id: string): LoopSection | undefined {
  return SECTIONS.find(s => s.id === id)
}
