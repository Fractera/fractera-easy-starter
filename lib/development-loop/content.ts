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

export const GITHUB_REPO = 'https://github.com/Fractera/ai-workspace'

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
