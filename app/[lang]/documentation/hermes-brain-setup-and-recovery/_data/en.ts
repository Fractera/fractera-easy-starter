import type { DocBase } from '../../_lib/types'

// English base document for /documentation/hermes-brain-setup-and-recovery.
// Voice: a clear engineering explainer for a hybrid reader (a technical human AND an
// AI agent). The RU override ships the full Russian version. SEO key: agentic engineering.
export const en: DocBase = {
  title: 'Hermes, the Brain of an Agentic Engineering Workspace | Setup, Components & Recovery',
  description:
    'What Hermes is in an agentic engineering workspace — the orchestrating brain that delegates to coding agents — what it is made of, how it comes up on a fresh server, the pitfalls that break it, and how to bring it back if it is ever deleted.',
  summary:
    'A continuity guide to Hermes, the orchestrating brain of the workspace: its components, how it installs, the hardening pitfalls that cause a 502, and how to recover it if it is ever removed.',
  keywords:
    'agentic engineering, Hermes agent, AI orchestrator, self-hosted AI workspace, agent setup, agent recovery, SOUL.md, MCP bridges, agent skills',
  faq: [
    {
      q: 'What is Hermes and how is it different from the coding agents?',
      a: 'Hermes is the orchestrating brain of the workspace. It does not write your app’s code itself — that is the job of the five coding agents (Claude Code, Codex, Gemini, Qwen, Kimi). Hermes decides who does what, checks which agents are ready, delegates the work, and manages the environment around the code: settings, deployments, memory. Think of it as the conductor, not a player.',
    },
    {
      q: 'What is Hermes actually made of?',
      a: 'A persona file (SOUL.md, loaded into its prompt every message), a library of skills (each a folder with a SKILL.md), plugins, a set of MCP tool bridges it calls, a config file, plus two sibling processes — the chat Web UI (:9120) and the messaging gateway. The agent dashboard itself listens on :9119.',
    },
    {
      q: 'Why would Hermes show a 502 error after a deploy?',
      a: 'The June-2026 Hermes hardening refuses to open the dashboard to the outside world (0.0.0.0) without an auth provider, and it validates the Host header against the address it bound to. So it must bind 127.0.0.1, and the reverse proxy must present that same host to it. If either is wrong the agent process crash-loops or rejects the request and the dashboard returns 502 — while the chat, a separate process, keeps working.',
    },
    {
      q: 'If someone deletes Hermes, can it be brought back?',
      a: 'Yes. Everything Hermes needs lives in the workspace substrate and ships with every deployment, so a fresh deploy installs it from scratch. If only Hermes was removed but the server is alive, you reinstall its parts from the substrate and restart its processes. This document — and its downloadable reference — is exactly the knowledge needed to do that without rediscovering the pitfalls.',
    },
  ],
  blocks: [
    {
      kind: 'quote',
      text: 'Hermes is the brain of your workspace — the part that decides, delegates and remembers. This is the short, important guide to what it is, how it stands up, and how to bring it back if it ever disappears.',
    },
    {
      kind: 'p',
      text: 'Fractera is an [Agentic Engineering Infrastructure](/en): a secure, self-hosted workspace where AI models write and run your application on your own server. At its centre sits **Hermes — the orchestrating brain**. This guide explains, plainly, what Hermes is made of, how it comes up on a fresh server, and how to recover it if it is ever deleted. It is written to be read by a technical human and by an AI agent alike — a continuity record, so the knowledge never lives only in someone’s head.',
    },
    {
      kind: 'h2',
      text: 'Who Hermes is — the brain, not the hands',
    },
    {
      kind: 'p',
      text: 'Hermes orchestrates; it does not type your app’s code. The actual code is written by the five coding agents, each holding a terminal in the app. Hermes’ job is to choose the right agent, check readiness, delegate the task, and run everything around the code — settings, deployment records, company memory. It is one of several agents in a [multi-agent workspace](/en/documentation/multi-agent-workspace-architecture); it is the one that conducts.',
    },
    {
      kind: 'h2',
      text: 'What Hermes is made of',
    },
    {
      kind: 'p',
      text: 'Hermes is not a single binary you flip on — it is a small set of parts, each with a clear home. Knowing them is what makes it recoverable.',
    },
    {
      kind: 'code',
      text: 'Surface        Port    Process                  Role\n--------------------------------------------------------------\nAgent dash     :9119   fractera-hermes          the brain + control panel\nChat Web UI    :9120   fractera-hermes-webui    friendly built-in chat\nGateway        —       fractera-hermes-gateway  Telegram/messengers + cron\n\nComponent      Where it lives (/root/.hermes/)\n--------------------------------------------------------------\nIdentity       SOUL.md            <- who it is + its place in the architecture\nSkills         skills/<name>/SKILL.md   <- one folder per skill, with frontmatter\nPlugins        plugins/\nConfig         config.yaml        <- mcp_servers (the tool bridges) + model\nMCP bridges    readiness, deployments, app-settings, drafts, ...',
    },
    {
      kind: 'h2',
      text: 'How it comes up on a fresh server',
    },
    {
      kind: 'p',
      text: 'On every deployment, the install script lays Hermes down from the substrate and starts its processes — so a fresh server has a working brain with no manual steps.',
    },
    {
      kind: 'code',
      text: 'install plugins      -> /root/.hermes/plugins/\ninstall skills       -> /root/.hermes/skills/<name>/SKILL.md   (folders, not flat files)\ninstall SOUL.md      -> the Fractera persona + architecture self-knowledge\nstart agent          -> dashboard on 127.0.0.1:9119  (NOT 0.0.0.0)\nstart gateway        -> messaging + cron\ninstall web UI       -> chat on :9120\nsave process list    -> survives a reboot',
    },
    {
      kind: 'callout',
      title: 'Why this document exists',
      text: 'A brain can be deleted by accident, or you may simply want to set one up again. When that happens, the knowledge of what Hermes is made of and where it bites must be on hand — not rediscovered under pressure. This page, and its downloadable reference, are that safety net.',
    },
    {
      kind: 'h2',
      text: 'The three things that will bite you',
    },
    {
      kind: 'olist',
      items: [
        '**Bind 127.0.0.1, never 0.0.0.0.** The June-2026 hardening refuses a public bind without an auth provider, and the old bypass flag is now a no-op. A public bind crash-loops the agent, the port never opens, and the proxy returns 502.',
        '**The proxy must send Host: 127.0.0.1 to the agent.** The same hardening checks the Host header against the bound address; the public hostname is rejected with “Invalid Host header”. Only the agent’s own location needs this — the chat and auth stay as they are.',
        '**Skills are folders, never flat files.** Hermes discovers a skill only as a folder with a SKILL.md inside (plus frontmatter). A bare markdown file is invisible, and the agent will silently pick the wrong skill instead.',
      ],
    },
    {
      kind: 'p',
      text: 'A useful tell: if the chat (:9120) answers but the agent tab shows 502, those are two different processes — the chat being alive does not mean the agent is. Check the agent process and its log first.',
    },
    {
      kind: 'h2',
      text: 'Recovery — bringing Hermes back',
    },
    {
      kind: 'p',
      text: '**Full recovery** is simply a fresh deployment: everything Hermes needs is in the substrate and ships with the install. **Partial recovery** — Hermes removed but the server alive — means reinstalling its parts from the substrate (skills as folders, SOUL.md, plugins, config), then restarting the agent (bound to 127.0.0.1), the gateway and the chat, and saving the process list. The proof it worked: the skill list shows your skills as enabled, the agent answers on its port, and the process is no longer restarting.',
    },
    {
      kind: 'callout',
      title: 'In one phrase',
      text: 'Hermes is the brain that delegates and remembers; it is a handful of parts that ship with every deploy, it bites in exactly three known places, and it can always be rebuilt — which is why this record exists.',
    },
    {
      kind: 'docref',
      title: 'hermes-setup-and-recovery.md — the complete reference',
      summary:
        'The full continuity reference used by humans and AI agents: Hermes’ surfaces and components, the exact install steps, the hardening pitfalls, and the recovery procedure — everything needed to rebuild the brain.',
      href: '/docs/hermes-setup-and-recovery.md',
    },
    {
      kind: 'cta',
      text: 'Deploy a self-hosted workspace with an orchestrating brain that delegates to your coding agents — entirely on your own server.',
      href: 'https://www.fractera.ai/',
      label: 'Deploy with AI',
    },
    {
      kind: 'founder',
      text: 'Fix your mistakes fast. If you experiment all the time there will be many of them — but if you fix them in time, no catastrophe happens.',
    },
  ],
}
