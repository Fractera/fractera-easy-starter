import type { NewsArticleBase } from '../../_lib/types'

export const en: NewsArticleBase = {
  title: 'Projects Now Decompose Before They Are Built: the Frozen Process for Private Automations',
  seoTitle: 'Project Decomposition Before Code: a Frozen Process for AI-Built Automations — Agentic Engineering Platform',
  subtitle:
    'A major update to our agentic engineering platform: a private automation is no longer built "from the head". The whole project is first decomposed into a validated graph of small nodes, the full development queue is written to disk — a project README plus one exhaustive specification step and one coder-handoff step per node — and only after your approval do coding agents build it, node by node.',
  description:
    'Fractera, the agentic engineering platform, now applies the same frozen, materialize-first discipline to private projects and automations that it already applies to content: the AI proposes a graph of small nodes, an engine validates the dependencies and refuses incomplete specifications, a project-root README explaining why / how it works / efficiency / reuse / result is generated from the graph, and every node gets its own numbered step plus a separate coder-handoff step. Graphs over ten nodes receive an MVP recommendation. Available as a self-sufficient agent skill and as an owner MCP tool.',
  summary:
    'A project used to be the one thing an AI agent still planned in its head — and a plan in a context window dies with the context window. Now a private automation is decomposed into a validated node graph, the whole queue is materialized to disk before any development, incomplete specs are refused by a gate, and coding agents receive only a step number.',
  keywords:
    'agentic engineering platform, project decomposition, private automations, materialize-first, node graph, DAG validation, spec completeness gate, project README, coder handoff, MVP recommendation, order sheet, Hermes orchestration, self-hosted AI workspace',
  blocks: [
    {
      kind: 'quote',
      text: 'A project that exists on disk before a single line of code exists cannot silently fail. A plan that lives only in a context window dies with the context window.',
      cite: 'Fractera product team',
    },
    {
      kind: 'p',
      text: 'On [Agentic Engineering Infrastructure](/en), content already had a frozen process: a compound request becomes an order sheet, the whole queue is written to disk, and only then does the work start — we told that story in [MCP coding: one messy request becomes a development pipeline](/en/news/mcp-coding-decompose-requests-into-pipeline). But private projects — the automations you run for yourself, like "summarize my YouTube channels to Telegram every morning" — were still built the way AI usually builds things: the model held the plan in its head. Today the platform for agentic engineering closes that gap. A project is now decomposed BEFORE it is built, and the decomposition itself is the deliverable you approve.',
    },
    {
      kind: 'callout',
      title: 'In plain words',
      text: 'You describe the automation you want. The AI breaks it into small nodes — each with its task, tools, keys and dependencies — and shows you the full plan as a numbered order sheet. Nothing is built yet. After your "yes", the whole plan lands on disk: a README that explains the project, one detailed specification step per node, and one handoff step per node for the coding agent. Then development starts — and you can watch it move, step by step, live.',
    },
    {
      kind: 'h2',
      text: 'Why Automations Built by AI Agents Were Doomed Without Decomposition',
    },
    {
      kind: 'p',
      text: 'An automation is not one task — it is a chain: fetch this, transform that, publish there, on this schedule, with these API keys. When an AI agent plans a chain like that implicitly, three things go wrong. The plan is invisible — you cannot read or correct it. The plan is fragile — a crash, a context reset or a subscription limit erases it. And the plan is unverifiable — nobody gates whether each piece was actually specified before someone started coding it. Our own verdict inside the team was blunt: without deep decomposition, a project of this kind is doomed to fail.',
    },
    {
      kind: 'p',
      text: 'The fix is the same discipline that already worked for content, applied with a different machine. Content decomposes deterministically by the state of your site. A project is decomposed by the model — it proposes the graph — and a frozen engine then does what engines do best: validates, gates, documents, and materializes. The engine never writes the automation code itself.',
    },
    {
      kind: 'h2',
      text: 'A Graph of Small Nodes, Validated Before Any Development',
    },
    {
      kind: 'p',
      text: 'Every node in the proposed graph carries its own contract: a title, a kind (trigger, action or transform), an exhaustive task description, the tools it uses, the environment keys it needs (never hardcoded — they are set through the same rebuild-safe channel as every build-time setting), its inputs and outputs, a to-do list, and the nodes it depends on. The engine checks the dependency graph for cycles and broken links, and then applies the real gate: **specification completeness**. A node with an empty task, a missing description or no to-do items is refused — with a precise list of what is missing — and nothing is written to disk until the graph is complete.',
    },
    {
      kind: 'list',
      items: [
        'The order sheet: one resolved human line per node, shown to you verbatim before anything happens.',
        'The approval token: a real run requires the exact plan you confirmed — a changed plan cannot start.',
        'The MVP guard: a graph over ten nodes gets a recommendation to launch a ten-node MVP first and grow each node by separate future tasks — so you always understand exactly how your project works. The decision stays with you.',
      ],
    },
    {
      kind: 'h2',
      text: 'One README That Explains the Whole Project — Born From the Decomposition',
    },
    {
      kind: 'p',
      text: 'On approval, the first thing materialized is not a step — it is the project-root README, generated from the graph itself: why the project exists, how it works (an auto-built table of every node in execution order), what makes it efficient, what it reuses, and what the result should be. Every agent instruction on the platform — all six agent entities — now requires reading that README first when working on any project step. It is the single source of truth for what the project is, and every specification and handoff step points back to it.',
    },
    {
      kind: 'h2',
      text: 'Calling the Coder Is Its Own Step in the Agentic Engineering Pipeline',
    },
    {
      kind: 'p',
      text: 'After the README, the engine writes the queue into the same Development Steps system we described in [how architecture records become development steps](/en/news/architecture-to-development-steps-materializer): one rich specification step per node, plus one separate coder-handoff step per node. The handoff step is exhaustive — the fixed first actions (read the README, open the spec), the deliverable, the tools and keys at a glance, the acceptance criteria, and the finish protocol. So when the orchestrator delegates a node to a coding agent, it hands over exactly one thing: a step number. And handing over the number does not close the node — the orchestrator watches for real completion (the step closed, the deployment recorded) before opening any dependent node.',
    },
    {
      kind: 'callout',
      title: 'Watch it happen in real time',
      text: 'The whole queue is visible the moment it is materialized: the Development Steps page shows every specification and handoff step with live new / in-progress / completed badges, and the Architecture page highlights changes as they land. While the chat is quiet, the pages are not — every on-disk action is a visible event, updating in real time.',
    },
    {
      kind: 'h2',
      text: 'Self-Sufficient by Design: a Skill in Every Agent and an MCP Tool',
    },
    {
      kind: 'p',
      text: 'Like every capability on the platform, the frozen project process does not depend on the orchestrator existing. It ships as a self-sufficient skill in every agent entity — a lone agent, even a workspace running a single CLI with no central brain, runs the identical process directly. For the conversational path, the same engine is exposed as an owner-tier MCP tool, `owner_projects_orchestrate_decomposition`, with the same dry-run, the same order sheet and the same approval token. One more piece of the operating contract rides along: the process covers only projects and automations — public site pages keep their own frozen pipeline, and the two never mix.',
    },
    {
      kind: 'docref',
      title: 'orchestrate-project-by-steps — the frozen project process, raw',
      summary: 'The full raw skill an AI agent reads to run the process end to end: the node contract, the DAG and spec-completeness gates, the order-sheet protocol with the approval token, the project README, the coder-handoff steps, cold resume, and the operating contract of the projects mode (full tool authority, delegate-watch-proceed, the MVP guard, schema-as-truth).',
      href: '/docs/orchestrate-project-by-steps.md',
    },
    {
      kind: 'founder',
      text: 'Plans are worthless, but planning is everything — the trick is to make the planning itself the artifact.',
    },
  ],
  faq: [
    {
      q: 'What is project decomposition on an agentic engineering platform?',
      a: 'It is the frozen step between your wish and the code: the AI proposes a graph of small nodes (each with a task, tools, environment keys, inputs/outputs and dependencies), an engine validates the graph and refuses incomplete specifications, and the whole development queue — a project README plus one specification step and one coder-handoff step per node — is written to disk before any development starts. You approve the plan as a verbatim order sheet before anything is materialized.',
    },
    {
      q: 'What happens if the process or the session dies in the middle?',
      a: 'Nothing is lost, because the queue lives on disk, not in the model\'s context. Re-running with the same plan and the same approval token — even in a brand-new session — skips the files that already exist and re-creates only the missing ones. The step files of an interrupted run are the queue itself, never garbage.',
    },
    {
      q: 'Does the engine write the automation code?',
      a: 'No. The engine only plans, validates, documents and materializes. Each node is built later by a coding agent (Claude Code, Codex, Gemini CLI, Qwen Code or Kimi Code) that receives exactly one thing — a step number — and finds everything else in the materialized handoff and specification steps. The orchestrator then watches for real completion before opening dependent nodes.',
    },
    {
      q: 'What is the MVP recommendation for big projects?',
      a: 'If the validated graph contains more than ten nodes, the order sheet carries a recommendation to launch an MVP of at most ten nodes and grow each node\'s functionality by separate future tasks. It is a soft gate — the reasoning is progressive understanding (you should always know exactly how your project works), and the final decision stays with you.',
    },
  ],
}
