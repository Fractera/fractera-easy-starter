import type { NewsArticleBase } from '../../_lib/types'

export const en: NewsArticleBase = {
  title: 'MCP Coding in Agentic Engineering: One Messy Request Becomes a Development Pipeline',
  seoTitle: 'MCP Coding: Decompose Complex Requests Into a Development Pipeline — Agentic Engineering Platform',
  subtitle:
    'A major update to our agentic engineering platform: you no longer feed tasks to AI agents one at a time. Say everything at once — even messily — and the platform decomposes it into an ordered pipeline of development steps, written to disk and approved by you before the first line of code is written or the first frozen MCP brick is thawed.',
  description:
    'Fractera, the agentic engineering platform, now decomposes a long, unstructured, even error-ridden request into an ordered development pipeline: dedicated MCP tools and skills break the order into parts, record every sub-step on the Development Steps page, and only then start MCP coding. Hermes runs the flat pipeline on inexpensive models and delegates real coding to Claude Code, Codex or another available agent. You watch the app grow live on the Architecture page.',
  summary:
    'One compound request instead of four tickets: the platform decomposes it into an order sheet, materializes every sub-step on the Development Steps page before any code exists, survives a crash mid-run, and splits work between flat MCP coding on cheap models and recursive development by coding agents.',
  keywords:
    'agentic engineering platform, MCP coding, task decomposition, development pipeline, order sheet, materialize-first, resume after crash, Hermes orchestration, delegate to coding agents, Claude Code, Codex, flat scaling, recursive development',
  blocks: [
    {
      kind: 'quote',
      text: 'The pipeline is assembled, shown to you, and approved before the first line of code is written — and before the first frozen MCP brick is thawed.',
      cite: 'Fractera product team',
    },
    {
      kind: 'p',
      text: 'Until recently, working with AI agents on [Agentic Engineering Infrastructure](/en) looked the way it looks everywhere: one task per message. **Add a news section.** Wait. **Add a documentation section.** Wait. **Add a sign-in button.** Wait. **Now make documentation visible only to signed-in users.** Four separate requests, four separate waits, and the burden of remembering the right order was on you. Today that changes: the platform for agentic engineering takes the whole order at once — long, unstructured, even messy — and turns it into a development pipeline you can read, approve, and watch run.',
    },
    {
      kind: 'callout',
      title: 'In plain words',
      text: 'You describe everything you want in one breath, the way you would brief a human team. The platform breaks your order into parts, shows you the plan as a numbered list of steps, asks the couple of questions it genuinely cannot guess, and after your "yes" builds the whole thing step by step — deploying and recording each piece. You just watch.',
    },
    {
      kind: 'h2',
      text: 'Four Tickets Become One Request to Your AI Agents',
    },
    {
      kind: 'p',
      text: 'Here is the same job, before and after. Before, each line was its own ticket you had to send in the right order:',
    },
    {
      kind: 'list',
      items: [
        'Add a news section to the site',
        'Add a documentation section to the project',
        'Add a sign-in button to the site',
        'Make the documentation available only to signed-in users',
      ],
    },
    {
      kind: 'p',
      text: 'Now you say all of it in one message — dictated by voice, with typos, in any order. Dedicated MCP tools and agent skills **decompose** the request by the actual state of your site: does the news section already exist? Is public login already enabled? The decomposition is deterministic — the agent checks the project, it does not guess. And crucially, the fourth task ("documentation for signed-in users only") is understood as what it really is: a dependency that implies enabling site login and gating one section by role — the plan even shows this as an explicitly marked implied line.',
    },
    {
      kind: 'h2',
      text: 'An Order Sheet Before the First Line of Code',
    },
    {
      kind: 'p',
      text: 'The decomposed request becomes an **order sheet** — the construction-brigade kind: one resolved human line per section ("news — visible to EVERYONE — appears in: top menu, footer"), the implied consequences spelled out, and an honest content boundary: new pages come up as frozen placeholder stubs, and filling them with real prose is a separate, later request. The agent must show you every line verbatim. Two questions per section are mandatory and are never guessed — whether the section needs an admin panel and whether it needs a dashboard.',
    },
    {
      kind: 'olist',
      items: [
        '**Decompose** — your compound request is flattened into fine sub-steps: create section → add pages → set menus → set access.',
        '**Show the order sheet** — you read the resolved plan, line by line, and edit it while it is still just a plan.',
        '**Approve** — your explicit "yes" issues an approval token bound to exactly that plan; a changed or unconfirmed plan cannot start.',
        '**Run** — every sub-step executes through the full lifecycle: open a development step → execute → deploy → record the deployment → close the step.',
      ],
    },
    {
      kind: 'p',
      text: 'The deployment record is a hard gate, not a courtesy: a step cannot close without a confirmed row in the deployments table — the same discipline hosting platforms apply to their own deploys. If recording fails, the step stays open and the run stops with an honest report instead of a silent shrug.',
    },
    {
      kind: 'h2',
      text: 'The Plan Lives on the Development Steps Page — Not in the Agent’s Memory',
    },
    {
      kind: 'p',
      text: 'This is the part we consider the deepest change. The moment you approve, the orchestrator **first writes the entire queue to disk** — every sub-step becomes its own file on the Development Steps page, carrying its full machine spec: the order-sheet id, its sequence number, what it does, its arguments, the page URL it will produce, and the approved order line it came from. Only then does execution begin. The plan history exists on disk **before any work**.',
    },
    {
      kind: 'p',
      text: 'Why does that matter? Because long runs die: a timeout, a crash, a lost session. With the queue materialized first, nothing is lost — completed sub-steps are closed with a full timestamp, the live one is marked in progress, and the pending ones sit as real specs waiting. To resume — **even in a brand-new session, on a cold start** — the agent calls the same tool with the same plan and the same approval token: finished steps are skipped automatically, pending ones re-execute from their files. No re-briefing, no duplicated sections, no archaeology.',
    },
    {
      kind: 'h2',
      text: 'Two Scenarios of Agentic Engineering: Flat MCP Coding and Recursive Development',
    },
    {
      kind: 'h3',
      text: 'Flat scaling — MCP coding on inexpensive models',
    },
    {
      kind: 'p',
      text: 'Standing up new structure — sections, pages, menus, access — is **MCP coding**: assembly from vetted frozen bricks via the [Frozen Template Constructor](/en/news/frozen-template-constructor-compose-structures), pure file copy plus token substitution, zero code generation. Because no code is generated, any model produces the identical result — so this whole pipeline is deliberately run by **Hermes on inexpensive models**. MCP coding scales the architecture **flat**: it adds structure breadth-wise, never rewrites what exists.',
    },
    {
      kind: 'h3',
      text: 'Recursive development — when a coding agent takes over',
    },
    {
      kind: 'p',
      text: 'When a task cannot be finished by MCP coding alone — real prose, a real feature, changing an existing page — Hermes does not pretend. It **delegates** the work to one of the available coding agents: Claude Code, Codex, Gemini CLI, Qwen Code or Kimi Code — whichever is ready right now, meaning it has tokens available or an open session window within its subscription. A coding agent works differently: its process may be **recursive and more creative, at the agent’s own discretion** — it decomposes deeper as it goes, extracts patterns, and grows new steps mid-flight. And if no coding agent is currently active, that is not a failure: the task is calmly saved as a development step to return to later.',
    },
    {
      kind: 'h2',
      text: 'Watching AI Agents Work: Two Live Pages Instead of a Silent Chat',
    },
    {
      kind: 'p',
      text: 'While the pipeline runs, the chat goes quiet — and that used to feel like a black box. Now you watch the work happen. On the **Architecture** page, new routes, pages and service components appear on the live map of your app as they are built. On the **Development Steps** page, each step carries a status badge — new, in progress, completed — and closes with a completion time down to the second. Both pages poll the filesystem and pulse the nodes that just changed.',
    },
    {
      kind: 'callout',
      title: 'Did you know?',
      text: 'These pages update automatically, in real time. When an agent opens, deploys, or closes a sub-step, you see it highlight before your eyes — no refresh, no log-reading. This is the progress view while the chat is silent.',
    },
    {
      kind: 'h2',
      text: 'Toward Application Development 100× Faster and 100× Cheaper',
    },
    {
      kind: 'p',
      text: 'Every piece described here serves one direction: turning the development of complex applications into a fast, inexpensive process that is genuinely interesting to watch from the outside — where it is always clear what is happening and why. Flat MCP assembly on cheap models does the structural bulk; expensive creative attention is spent only where it is irreplaceable. Very soon we expect to say it in the affirmative — and show it in worked examples — that Fractera builds applications **up to 100× faster and 100× cheaper** than traditional app-generation and automation systems. We are on the threshold of final testing; what the platform already does, you can [see and try today](/en/deployments). Stay with us — it only gets bigger from here.',
    },
    {
      kind: 'docref',
      title: 'orchestrate-content-by-steps — the decomposition skill, raw',
      summary: 'The full raw skill an AI agent reads to run this pipeline end to end: the intent model, the order-sheet protocol with the approval token, the materialize-first queue and resume contract, and the operation gate between frozen assembly and real development.',
      href: '/docs/orchestrate-content-by-steps.md',
    },
    {
      kind: 'cta',
      text: 'Deploy your first AI-optimized workspace today — choose your framework and get started.',
      href: 'https://www.fractera.ai/',
      label: 'Deploy with AI',
    },
    {
      kind: 'founder',
      text: 'Only fools and dead men never change their minds.',
    },
  ],
  faq: [
    {
      q: 'What is MCP coding and how is it different from an AI agent writing code?',
      a: 'MCP coding is assembly, not generation: new sections and pages are composed from vetted frozen templates by file copy and token substitution, driven through MCP tools. No code is generated, so any model — including inexpensive ones — produces the identical result, and the architecture scales flat (structure is added, existing code is never rewritten). Writing or changing real code is the other scenario, real development, done only by coding agents such as Claude Code or Codex, whose process may be recursive and more creative at the agent’s discretion.',
    },
    {
      q: 'What happens if the process crashes in the middle of a long run?',
      a: 'Nothing is lost. On approval the orchestrator first writes the entire queue to the Development Steps page — every sub-step as its own file with its full machine spec — and only then starts executing. Completed steps are closed with a timestamp, pending ones wait as real specs. To resume, even in a brand-new session, the agent calls the same tool with the same plan and the same approval token: finished sub-steps are skipped, pending ones re-execute from their files.',
    },
    {
      q: 'Who executes the pipeline — Hermes or the coding agents?',
      a: 'Both, by scenario. The flat MCP-coding pipeline (new sections, pages, menus, access) is run by Hermes — or any single agent — on inexpensive models, because frozen assembly needs no creativity. When a task cannot be finished by MCP coding alone, Hermes delegates it to an available coding agent (Claude Code, Codex, Gemini CLI, Qwen Code, Kimi Code) — one that currently has tokens or an open session window within its subscription. If none is active, the task is saved as a development step to return to later.',
    },
    {
      q: 'Can this pipeline change pages that already exist on my site?',
      a: 'No — by design. The frozen pipeline accepts only create-new operations: standing up sections and placeholder pages. Modifying an existing page or authoring real content is the real-development scenario, routed to a coding agent. The order sheet states this boundary explicitly before you approve, so a placeholder never masquerades as finished content.',
    },
  ],
}
