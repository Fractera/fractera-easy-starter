import type { DocBase } from '../../_lib/types'

// English base document for /documentation/app-config-mcp-connector.
// Voice: a clear, engaging engineering explainer for a hybrid reader (a technical human
// AND an AI agent) — not a press release. The RU override (../_data/ru) ships the full
// Russian version. SEO key: "agentic engineering" / configuration automation.
export const en: DocBase = {
  title: 'App Config Automation in Agentic Engineering: Settings by an Agent’s Voice',
  description:
    'How an AI agent manages a deployed app’s configuration in agentic engineering — name, description, SEO, PWA and languages changed by a plain request and applied on the next page load, with no rebuild. The App Config MCP connector explained.',
  summary:
    'A clear engineering explainer of configuration automation in agentic engineering: an AI agent changes your app’s settings by plain request through the App Config MCP connector — applied on the next load, no rebuild, architect-only.',
  keywords:
    'agentic engineering, app config automation, project configuration, MCP connector, AI settings management, app-config.json, on-demand revalidation, self-hosted AI workspace',
  faq: [
    {
      q: 'How does an AI agent change a project setting?',
      a: 'You ask it in plain words. The agent finds the right field, validates the value, and writes it through the App Config MCP connector (port 3218) — for example set_text_value with a path and a value. It reads first with list_text_fields (reading never breaks anything), confirms the change with you, then writes and triggers revalidation so the new value is live on the next page load.',
    },
    {
      q: 'Where are the settings stored — a database, environment variables, or a file?',
      a: 'A plain JSON file on disk, app/APP-CONFIG/app-config.json — think of it as your site’s passport. A file beats a database (which is opaque to an agent and needs a query layer) and env vars (flat, and NEXT_PUBLIC_* bakes into the build so it would need a rebuild): the file is transparent, holds nested structure, and applies with no rebuild. The language set is the one exception — it lives in build-time env because it decides which pages get generated.',
    },
    {
      q: 'Does the change need a full rebuild to go live?',
      a: 'No. Public pages are pre-built and cached for speed; the setter purges that cache on demand, so the very next visit rebuilds only the affected page with the new value — still static, still working with JavaScript off. The single exception is the language set: adding or removing a language is build-time and needs a rebuild (a few minutes), and the agent tells you so honestly.',
    },
    {
      q: 'Can someone from outside change my configuration?',
      a: 'No. Writing configuration is restricted to the architect role and checked at every layer; the connector listens on localhost only and is never exposed to the internet; every call carries a per-deploy secret; and the agent confirms the change before writing. Only your own authorized agents, from inside your workspace, can retune the app.',
    },
  ],
  blocks: [
    {
      kind: 'founder',
      text: 'Here is the idea in one breath: the workspace where AI writes your app should also let AI retune the app itself. Changing your site’s name, description, SEO or languages should not be a hunt through an admin panel — it should be a sentence. So we took the settings panel built for humans and gave the AI its own door into it. The same assistant that ships your features can now rebrand the site on request — and the change is live on the next page load, no rebuild.',
    },
    {
      kind: 'p',
      text: 'Fractera is an [Agentic Engineering Infrastructure](/en): a secure, self-hosted workspace where AI models write and run your application on your own server. This guide explains, plainly, one piece of it — **configuration automation in agentic engineering**: how an agent changes what your app says about itself, why the change is safe, and how it reaches visitors instantly. It is written to be read by a technical human and by an AI agent alike.',
    },
    {
      kind: 'h2',
      text: 'What we automated: project settings by an agent’s voice',
    },
    {
      kind: 'p',
      text: 'Before, to change the site name, description, SEO or an icon, you opened the admin panel and clicked through fields. Now you do the same thing by simply **asking an AI agent in words** — in chat or by voice. The agent finds the right field, checks the value, and writes it. And the change shows up on your site on the **next page load**, with no full rebuild.',
    },
    {
      kind: 'callout',
      title: 'The one-line version',
      text: 'The panel built for humans is now mirrored by a tool built for AI. Same settings, two doors — click them yourself, or just ask.',
    },
    {
      kind: 'h2',
      text: 'Where the settings live — a simple model',
    },
    {
      kind: 'p',
      text: 'Picture a single plain text file, `app/APP-CONFIG/app-config.json` — the **passport of your site**:',
    },
    {
      kind: 'code',
      text:
        '{\n' +
        '  "name": "Fractera",\n' +
        '  "description": "Production-Coding AI Server ...",\n' +
        '  "url": "https://fractera.ai",\n' +
        '  "seo": { "titleTemplate": "%s | Fractera" },\n' +
        '  "jsonLd": { "organization": false }\n' +
        '}',
    },
    {
      kind: 'p',
      text: 'Why a file — and not a database or environment variables:',
    },
    {
      kind: 'list',
      items: [
        '**A file is transparent** — the agent can read it as-is, no database query needed.',
        '**It holds nested structure** (`seo.*`, `jsonLd.*`, `geo.*`) — flat env variables cannot.',
        '**It applies with no rebuild** — env variables do need one, which is exactly why languages live there (more below).',
      ],
    },
    {
      kind: 'p',
      text: 'Editing the file by hand is risky — one broken brace and the site falls over. So a change never goes in raw: it goes through a **validated setter** (a smart writer) that checks the value against a catalog and writes it cleanly and atomically. The file is *where the bytes live*; the setter is *how they are written* — and only the setter writes.',
    },
    {
      kind: 'h2',
      text: 'How it works under the hood: a five-step flow',
    },
    {
      kind: 'code',
      text:
        'You (chat/voice): "change the description to \'Acme Corp\'"\n' +
        '        |\n' +
        '        v\n' +
        'The agent calls the MCP tool on :3218  ->  set_text_value { path:"description", value:"Acme Corp" }\n' +
        '        |\n' +
        '        v\n' +
        'The setter checks (field exists? type ok?) and writes app-config.json  (atomic -- no risk of corruption)\n' +
        '        |\n' +
        '        v\n' +
        'The setter pings /api/revalidate  <-- the piece added so the change is instant\n' +
        '        |\n' +
        '        v\n' +
        'The site drops the page cache  ->  on the next load the new description is visible',
    },
    {
      kind: 'callout',
      title: 'In plain words about the cache (ISR)',
      text: 'A public page is built ahead of time and stored so it opens instantly. “Revalidation” is the command “rebuild that stored copy.” We taught the setter to send that command automatically — so a change no longer waits out a cache window; it appears on the very next visit, while pages stay static and work even with JavaScript off. See also [static-first rendering](/en/documentation/static-first-rendering-economics).',
    },
    {
      kind: 'h2',
      text: 'The tools every agent now has',
    },
    {
      kind: 'code',
      text:
        'Tool                            What it does\n' +
        '──────────────────────────────  ─────────────────────────────────────────────────────────────\n' +
        'list_text_fields                Show ALL settings: path, what it means, current value, is it set\n' +
        'list_unfilled_fields            Show only the empty ones (so the agent can nudge you to fill them)\n' +
        'set_text_value { path, value }  Change one field (validate + write + revalidate)\n' +
        'list_languages / set_languages  Read / change the language set',
    },
    {
      kind: 'h2',
      text: 'Cases: what it looks like in practice',
    },
    {
      kind: 'list',
      items: [
        '**Description.** You: “Change the description to ‘Acme Corp’.” → `set_text_value { path:"description", value:"Acme Corp" }` → new text in the search snippet and social shares on the next load. No panel, no rebuild.',
        '**Your own domain.** You: “My domain is now example.com.” → the agent sets two fields, `url` and `seo.canonicalBase` → canonical links and OG tags follow the new domain.',
        '**Schema for Google.** You: “Turn on the Organization schema.” → `set_text_value { path:"jsonLd.organization", value:true }` → structured Organization data appears in the page HTML.',
        '**Languages (the special case).** You: “Add French.” → `set_languages(["en","ru","fr"])` → written to env, and the agent answers honestly: “French appears after a rebuild, a few minutes.” Languages decide which pages get generated — that is settled at build time, so it cannot be instant.',
        '**Help filling things in.** You: “What else should I fill in for SEO?” → `list_unfilled_fields` → “not set: keywords, Google verification, the author’s Twitter…” and the agent offers to complete them.',
      ],
    },
    {
      kind: 'h2',
      text: 'One capability, in all six agents of the agentic engineering workspace',
    },
    {
      kind: 'p',
      text: 'A capability is only real if it survives no matter which single agent is present — a project may run just one, with no orchestrator. So the connector **and** the skill are duplicated into every agent:',
    },
    {
      kind: 'code',
      text:
        'Agent                  MCP :3218 in                   Skill manage-app-settings\n' +
        '─────────────────────  ─────────────────────────────  ──────────────────────────────\n' +
        'Claude Code            .mcp.json                      own copy in .claude/skills\n' +
        'Codex                  .codex/config.toml             reads .agents/skills\n' +
        'Gemini CLI             .gemini/settings.json          own copy in .gemini/skills\n' +
        'Qwen Code              .qwen/settings.json            own copy in .qwen/skills\n' +
        'Kimi Code              .kimi/config.toml              reads .agents/skills\n' +
        'Hermes (orchestrator)  its config (mcp_servers)       services/hermes-skills/manage-app-settings.md',
    },
    {
      kind: 'h2',
      text: 'Request flow: a single agent vs. the orchestrator',
    },
    {
      kind: 'p',
      text: 'Directly on one coding agent — the real “single-agent” case, no orchestrator:',
    },
    {
      kind: 'code',
      text:
        'You -> Codex: "change the description to \'Acme Corp\'"\n' +
        '  1. Codex sees the manage-app-settings skill (its description is loaded) -> knows the steps\n' +
        '  2. Codex connects to :3218 via .codex/config.toml (with the secret)\n' +
        '  3. (optional) list_text_fields -> { path:"description", current:"...", is_set:false, role:"meta description..." }\n' +
        '  4. set_text_value { path:"description", value:"Acme Corp" }\n' +
        '       -> validate -> write app-config.json (atomic) -> ping /api/revalidate\n' +
        '  5. response: { ok:true, path:"description", value:"Acme Corp", is_set:true }\n' +
        '  -> Codex: "Done -- it shows on the next page load."',
    },
    {
      kind: 'p',
      text: 'Through Hermes, the orchestrator — same tools, plus coordination:',
    },
    {
      kind: 'code',
      text:
        'You -> Hermes: "change the description to \'Acme Corp\' and turn on the Organization schema"\n' +
        '  1. Hermes holds the same tools in its MCP client\n' +
        '  2. set_text_value { path:"description", value:"Acme Corp" }\n' +
        '     set_text_value { path:"jsonLd.organization", value:true }\n' +
        '  3. Hermes gathers both results, replies once, and can chain next steps\n' +
        '     (verify the page, log it to memory, coordinate other agents)',
    },
    {
      kind: 'p',
      text: 'The difference in one line: the write mechanics are identical — both hit the same `:3218` connector. Hermes only adds **orchestration** (several steps, autonomous loops, multi-agent coordination). For a single change it is not required, and a project with one lone Codex does the whole job by itself.',
    },
    {
      kind: 'h2',
      text: 'How an agent knows this natively',
    },
    {
      kind: 'olist',
      items: [
        '**The skill** — its description is loaded into the agent’s list of skills at session start, so it knows a “manage app settings” capability exists.',
        '**The MCP tools** — the agent asks `:3218` for `tools/list`; the tools appear in its toolset with descriptions, ready to call.',
        '**Vector memory** — this document is ingested into the shared memory (LightRAG), so a memory-equipped agent recalls the deeper how and why on demand.',
      ],
    },
    {
      kind: 'p',
      text: 'Even with no memory and no orchestrator, the agent still has the skill and the MCP locally — that is the whole point of self-sufficiency. Languages stay the deliberate exception: they feed static page generation, so they are build-time, and the agent says so rather than pretending the change is instant.',
    },
    {
      kind: 'h2',
      text: 'Security and external access in agentic engineering',
    },
    {
      kind: 'p',
      text: 'Configuration is a change to the file system, so access to the connector is constrained by design, in depth:',
    },
    {
      kind: 'list',
      items: [
        '**Identity, not just a key.** Writing configuration (and the database) is restricted to the **architect** role, checked at every layer — the MCP connector, the HTTP config routes, and the data service. Reading can be broader; writing is architect-only.',
        '**Network isolation.** The connector listens on `127.0.0.1` only and is never exposed to the internet. The public surface sits behind nginx and the auth gate; the connector is reachable solely from inside the workspace.',
        '**A per-deploy secret.** Every call to the connector carries a secret unique to your deployment, so only your in-workspace agents can reach it.',
        '**Confirm before changing.** A writing tool restates the change (old → new) and waits for your go-ahead before it writes.',
      ],
    },
    {
      kind: 'callout',
      title: 'In one phrase',
      text: 'Your project settings became manageable in natural language: the agent reads them as an open file, changes them through a guarded tool, and the site updates on the next load — no panel, no rebuild (except languages, where a rebuild is unavoidable and you are told so up front).',
    },
    {
      kind: 'docref',
      title: 'app-config-automation.md — the complete technical reference',
      summary:
        'The full reference used by AI agents: the store and the write path, the connector and its tools, worked cases, six-agent parity, the request-flow diagrams, and the access model.',
      href: '/docs/app-config-automation.md',
    },
    {
      kind: 'cta',
      text: 'Deploy a workspace where your AI agents don’t just write the app — they retune its identity on request, safely, from your own server.',
      href: 'https://www.fractera.ai/',
      label: 'Deploy with AI',
    },
    {
      kind: 'quote',
      text: 'Experiment relentlessly. If you work “the way it’s done,” your ceiling is known in advance. Try to do things differently — not like everyone else.',
      cite: 'Roma Armstrong, Founder at Fractera',
    },
  ],
}
