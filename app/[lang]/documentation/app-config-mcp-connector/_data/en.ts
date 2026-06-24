import type { DocBase } from '../../_lib/types'

// English base document for /documentation/app-config-mcp-connector.
// Written for a hybrid reader: a technically-minded human AND an AI agent. Mirrors the
// raw reference app-config-automation.md (offered for download via the docref block).
export const en: DocBase = {
  title: 'Automating Project Configuration: The App Config MCP Connector',
  description:
    'How a deployed Fractera app exposes its own App Config so any AI agent can read and change project configuration through an automated MCP connector — applied on the next page load, with no rebuild.',
  summary:
    'An engineering reference for the automated MCP connector that lets AI agents manage project configuration (branding, SEO, PWA, languages) by plain request, with on-demand revalidation and architect-only access.',
  keywords:
    'App Config automation, MCP connector, project configuration, agentic engineering infrastructure, AI settings management, app-config.json, on-demand revalidation, owner tier',
  faq: [
    {
      q: 'How does an AI agent change a project setting?',
      a: 'It calls the validated setter exposed as the app-settings-bridge MCP connector on port 3218 — for example owner_app_settings_set_text_value with a dot-path and value. The setter validates the value against the field catalog, writes the runtime config file atomically, and triggers on-demand revalidation so the change appears on the next page load. Reading is done with owner_app_settings_list_text_fields, which never corrupts anything.',
    },
    {
      q: 'Where are the settings stored — a database, environment variables, or a file?',
      a: 'A plain JSON file on disk, app/APP-CONFIG/app-config.json, deep-merged over the code defaults on every render. A file is the most transparent, agent-native store: it holds nested structure (unlike flat env vars), it applies without a rebuild (unlike NEXT_PUBLIC env vars baked into the bundle), and an agent can read it directly (unlike a database that needs a query layer). The language set is the one exception — it lives in build-time env because it feeds static page generation.',
    },
    {
      q: 'Does the change require a full rebuild to go live?',
      a: 'No. The public pages stay static (SSG/ISR); the setter purges their cache on demand, so the very next request rebuilds only the affected pages with the new value. Pages keep working with JavaScript off. The single exception is the language set: adding or removing a language is build-time and needs a rebuild (a few minutes), and the agent says so honestly.',
    },
    {
      q: 'Can an outside caller change my configuration?',
      a: 'No. Writing configuration is restricted to the architect role and checked at every layer; the MCP connector binds to localhost only and is never exposed to the internet; every call carries a per-deploy Bearer secret; and a mutating tool confirms the change with the owner before writing. Only the owner’s authorized agents, from inside the workspace, can retune the app.',
    },
  ],
  blocks: [
    {
      kind: 'founder',
      text: 'Here is the quiet part said out loud: the workspace where AI writes your application should also let AI retune the application’s own identity. Changing your site’s name, description, SEO, or languages should not mean hunting through an admin panel — it should be a sentence. We turned the settings panel into a first-class tool for agents, so the same assistant that ships your features can also rebrand the site on request, and the change goes live without a rebuild.',
    },
    {
      kind: 'p',
      text: 'Fractera is an [Agentic Engineering Infrastructure](/en): a secure, self-hosted workspace where AI models write and run your application on your own server. This document specifies the **automated MCP connector for managing project configuration** — what an agent can change, how the change is written safely, how it reaches visitors on the next page load, and how access is locked down. It is written for a hybrid reader: a technically-minded human and an AI agent.',
    },
    {
      kind: 'h2',
      text: 'Where the settings live (and why)',
    },
    {
      kind: 'p',
      text: 'The settings are a plain JSON file on disk — `app/APP-CONFIG/app-config.json` — read by the Shell on every render and deep-merged over the code defaults, so a partial file is always valid. A text change applies on the next page load; the language set is the one exception (build-time). Three candidate stores were weighed, and the file wins for agent-native work:',
    },
    {
      kind: 'code',
      text:
        'Store                       Nested structure   Applies w/o rebuild   Transparent to agent   Verdict\n' +
        '──────────────────────────  ─────────────────  ───────────────────   ────────────────────   ─────────────────\n' +
        'JSON file (app-config.json) Yes (seo.*, geo.*) Yes (render / ISR)    Yes — reads it directly Substrate\n' +
        'Env vars (NEXT_PUBLIC_*)    No (flat keys)     No (baked at build)   Weak                   Languages only\n' +
        'Database (SQLite)           Yes                Read at build (SSG)   No — needs query layer Rejected for config',
    },
    {
      kind: 'p',
      text: 'The key distinction is **substrate vs. write path**. The substrate (where the bytes live) is the file — small, single-owner, low-frequency, directly readable. The write path (how a change is written) is the **validated setter**, never raw hand-editing: editing raw JSON risks broken braces, clobbered keys, wrong types, or a write race. The setter validates against a catalog, writes atomically, and revalidates — the safety of a database without the opacity. The fragile part was never the store; it was the write path.',
    },
    {
      kind: 'h2',
      text: 'The path of one change',
    },
    {
      kind: 'code',
      text:
        'You (chat/voice): "change the description to \'Acme Corp\'"\n' +
        '   |\n' +
        '   v\n' +
        'Agent calls the MCP tool on :3218  ->  set_text_value { path: "description", value: "Acme Corp" }\n' +
        '   |\n' +
        '   v\n' +
        'Setter validates against the catalog (field exists? type ok?) and writes app-config.json\n' +
        '   |   (atomic: temp file + rename -- a crash mid-write never leaves a corrupt config)\n' +
        '   v\n' +
        'Setter POSTs /api/revalidate on the Shell (:3000)  -- purges the ISR cache\n' +
        '   |\n' +
        '   v\n' +
        'On the next page load the new value is live -- pages stay static, no rebuild',
    },
    {
      kind: 'callout',
      title: 'What "applies on next load" means',
      text: 'Public pages are pre-built and cached for speed via [static-first rendering](/en/documentation/static-first-rendering-economics). A naive setup would leave a change waiting out the cache window; the setter instead asks the Shell to revalidate immediately, so the next request rebuilds only the affected pages — still static, still working with JavaScript off.',
    },
    {
      kind: 'h2',
      text: 'The connector and its tools',
    },
    {
      kind: 'p',
      text: 'The connector is the MCP server `app-settings-bridge` on port **3218** (file `bridges/platforms/app-settings-mcp-server.js`). It validates every write against a field catalog (`bridges/platforms/app-settings-catalog.js`) — the single source of paths, types, defaults and roles.',
    },
    {
      kind: 'code',
      text:
        'Tool                                    Mutates   What it does\n' +
        '──────────────────────────────────────  ───────   ──────────────────────────────────────────────────────\n' +
        'owner_app_settings_list_text_fields     no        Every text setting: path, label, role, value, is_set\n' +
        'owner_app_settings_list_unfilled_fields no        Only the empty / default settings, to prompt the owner\n' +
        'owner_app_settings_set_text_value       YES       Set one field (validate -> write atomically -> revalidate)\n' +
        'owner_app_settings_list_languages       no        Read the supported language set + default locale\n' +
        'owner_app_settings_set_languages        YES       Set the language set (build-time: needs a rebuild)',
    },
    {
      kind: 'h2',
      text: 'Worked cases',
    },
    {
      kind: 'list',
      items: [
        '**"Change my description to \'Acme Corp\'"** → `set_text_value(path="description", value="Acme Corp")` → new meta description / OG snippet on next load, no rebuild.',
        '**"Use my domain example.com"** → sets `url` and usually `seo.canonicalBase` → canonical links and OG url follow the new domain.',
        '**"Turn on the Organization schema"** → `set_text_value(path="jsonLd.organization", value=true)` → Organization JSON-LD emitted in the page head.',
        '**"Add French"** → `set_languages(languages=["en","ru","fr"])` → saved to env; the agent says it appears after a rebuild (a few minutes).',
        '**"What should I still fill in for SEO?"** → `list_unfilled_fields` → lists the empty fields and prompts you.',
        '**"Change the logo"** → rejected for images: the agent tells you to upload it in the panel (crop + storage are panel-only).',
      ],
    },
    {
      kind: 'h2',
      text: 'Available to every agent (parity 6/6)',
    },
    {
      kind: 'p',
      text: 'A capability is only real if it survives no matter which single agent is present — a project may run one agent with no orchestrator. So the connector and the skill are duplicated to all agents:',
    },
    {
      kind: 'code',
      text:
        'Agent                  MCP :3218 registered in        Skill manage-app-settings\n' +
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
      text: 'Request flow — directly vs. through the orchestrator',
    },
    {
      kind: 'p',
      text: 'The same job runs two ways. Directly on a single coding agent (no orchestrator):',
    },
    {
      kind: 'code',
      text:
        'You -> Codex (CLI chat): "change the description to \'Acme Corp\'"\n' +
        '  1. Codex sees the manage-app-settings skill (its description is loaded) -> knows the procedure\n' +
        '  2. Codex connects to :3218 via .codex/config.toml (Bearer secret)\n' +
        '  3. (optional) list_text_fields -> { path:"description", current:"...", is_set:false, role:"meta description..." }\n' +
        '  4. Codex calls set_text_value { path:"description", value:"Acme Corp" }\n' +
        '       -> validate -> write app-config.json (atomic) -> POST /api/revalidate\n' +
        '  5. Response: { ok:true, path:"description", value:"Acme Corp", is_set:true }\n' +
        '  -> Codex: "Done -- it shows on the next page load."',
    },
    {
      kind: 'p',
      text: 'Through Hermes, the orchestrator:',
    },
    {
      kind: 'code',
      text:
        'You -> Hermes: "change the description to \'Acme Corp\' and turn on the Organization schema"\n' +
        '  1. Hermes has the same tools in its MCP client\n' +
        '  2. set_text_value { path:"description", value:"Acme Corp" }\n' +
        '     set_text_value { path:"jsonLd.organization", value:true }\n' +
        '  3. Hermes collects both results, replies once, and can chain adjacent steps\n' +
        '     (verify the page, log to memory, coordinate other agents)',
    },
    {
      kind: 'p',
      text: 'The difference in one line: the write mechanics are identical (both hit the same `:3218` server). Hermes adds **orchestration** — multiple steps, autonomous loops, multi-agent coordination. For a single change it is not required, and a project with a single Codex does the whole job by itself.',
    },
    {
      kind: 'h2',
      text: 'Native discoverability',
    },
    {
      kind: 'olist',
      items: [
        '**Skill** — the `manage-app-settings` description is loaded into the agent’s list of available skills at session start, so it knows the capability exists.',
        '**MCP tools** — the agent queries `tools/list` from `:3218`; the tools appear in its toolset with descriptions, ready to call.',
        '**Vector memory** — this document is ingested into the shared memory (LightRAG), so a memory-equipped agent recalls the deeper how/why on demand.',
      ],
    },
    {
      kind: 'p',
      text: 'A project with no memory and no orchestrator still has the skill and the MCP locally — that is the point of self-sufficiency. Languages are the deliberate exception: they feed static page generation, so they are build-time and the agent says so honestly rather than implying an instant change.',
    },
    {
      kind: 'h2',
      text: 'Security and external access',
    },
    {
      kind: 'p',
      text: 'Configuration is a mutation of the file system, so access to the connector is constrained by design, in depth:',
    },
    {
      kind: 'list',
      items: [
        '**Identity, not just a key.** Writing configuration (and the database) is restricted to the **architect** role, checked at every layer — the MCP connector, the HTTP config routes, and the data service — not merely by possession of a secret. Reading may be broader; writing is architect-only.',
        '**Network isolation.** The MCP connector binds to `127.0.0.1` and is never exposed to the internet. The public surface sits behind nginx and the auth gate; the connector is reachable only from inside the workspace.',
        '**Credential.** Every connector call carries a per-deploy Bearer secret, so only in-workspace agents can reach it.',
        '**Confirm before mutating.** A mutating tool restates the change (old → new) and waits for the owner’s confirmation before writing.',
      ],
    },
    {
      kind: 'p',
      text: 'The result: the owner — and only the owner’s authorized agents — can retune the app, from inside their own server, with no path for an outside caller to change anything.',
    },
    {
      kind: 'quote',
      text: 'Experiment relentlessly. If you work “the way it’s done,” your ceiling is known in advance. Try to do things “differently” — not like everyone else.',
      cite: 'Roma Armstrong, Founder at Fractera',
    },
    {
      kind: 'docref',
      title: 'app-config-automation.md — Complete Technical Reference',
      summary:
        'The full reference used by AI agents to manage App Config: the store and write-path design, the connector and its tools, worked cases, six-agent parity, the request-flow diagrams, and the access model.',
      href: '/docs/app-config-automation.md',
    },
    {
      kind: 'cta',
      text: 'Deploy a workspace where your AI agents not only write the app, but also retune its identity on request — safely, from your own server.',
      href: 'https://www.fractera.ai/',
      label: 'Deploy with AI',
    },
  ],
}
