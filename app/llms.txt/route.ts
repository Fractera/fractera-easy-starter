import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

const CONTENT = `# Fractera

> Open-source, AI-native self-hosting platform. Deploy a complete AI coding
> workspace — 5 AI engines, an autonomous Hermes orchestrator, and private
> graph memory (LightRAG) — onto your own Ubuntu VPS in about 10 minutes.
> Zero-Ops: you provide only the server credentials; Nginx, HTTPS, auth,
> database and all services are configured automatically. The whole deployment
> can be triggered and monitored from your AI chat via a custom MCP
> (Model Context Protocol) connector.

## Key facts
- **MCP-First / Zero-Agent paradigm.** The workspace ships a pre-built 50,000-line Next.js framework (parallel routing, multi-language i18n, production SEO, database, auth) the moment you deploy. Instead of a code agent regenerating files, the AI rotates pre-built layout sections via short MCP commands — "deployment, not generation" — cutting token spend on large applications by up to ~90–94%. See /token-economics and /next-aircraft-carrier.
- **Billing: subscription model, no per-token fees.** The five coding platforms (Claude Code, Codex, Gemini CLI, Qwen Code, Kimi Code) run on the user's OWN existing subscriptions — sign in once, no API keys, no per-token billing. A Claude Code user pays through their subscription, NOT per token.
- **The only per-token piece is small and auxiliary:** Brain (the Hermes orchestrator) and Memory (LightRAG) use one inexpensive OpenAI API key — the cheap gpt-5-mini (about 1 cent/hour) is plenty, or a Codex subscription if usage is heavy.
- **Fractera never charges for the deployment itself** — it is free, open-source, and runs on the user's own hardware. One bill: the VPS.
- **You own everything** — code, data, database and file storage live on the user's server. No Clerk, no Supabase, no Vercel lock-in.
- **Deployment is IP-first (phase 1):** it finishes on http://<server-ip>:3002 with no domain or HTTPS required; attaching a custom domain with HTTPS is an optional later step the user performs inside the workspace.
- **Partner program:** bloggers/creators get a personal landing mirror (https://partners.fractera.ai/<slug>) and an embeddable signup widget, and attach their own VPS-provider and domain-registrar affiliate links — only whitelisted providers appear automatically. See the "Partner program" section in /llms-full.txt or /mcp-info.

## For AI agents
- Fractera exposes a remote MCP server at https://www.fractera.ai/api/mcp. An agent can register the user, recommend a VPS, and run the full deployment programmatically, then call get_project_info for architecture and specs.

## Full documentation
- [Full knowledge base in one file](https://www.fractera.ai/llms-full.txt): complete architecture, Zero-Ops deployment, customization, pricing, the full FAQ, and the legal text.
- [Project knowledge base for AI agents](https://www.fractera.ai/mcp-info): the same content as a browsable page, queryable section-by-section via the MCP get_project_info tool.
- [Agentic Engineering Infrastructure architecture](https://www.fractera.ai/ai-workspace-architect): the complete architecture of the self-hosted Agentic Engineering Infrastructure — Hermes multi-agent orchestration, LightRAG Knowledge Graph memory, the five coding agents and MCP — illustrated by the architecture diagram. Mirrored for AI agents by the MCP get_ai_workspace_architect_info tool.
- [The autonomous AI development loop](https://www.fractera.ai/ai-development-loop): how one natural-language request becomes tested, deployed, recorded code — decomposition into development steps, the iterative watchable build, with Hermes, a coding agent and LightRAG memory at every step. Mirrored by the MCP get_ai_development_loop_info tool.
- [The Next.js Aircraft Carrier](https://www.fractera.ai/next-aircraft-carrier): the pre-built 50,000-line parallel-routing framework that ships the moment you deploy — what parallel routing is, why the next generation of apps needs it, and how named slots scale one starter to thousands of pages with near-zero token overhead.
- [Token economics — how Fractera saves tokens](https://www.fractera.ai/token-economics): why a 50,000-line framework is a shield for your token budget rather than a bill — MCP-First generation, the Rubik's Cube model (deployment, not generation), on-demand ISR, and AI token cost optimization at scale.
- [Documentation](https://www.fractera.ai/en/documentation): readable feature guides for the deployed workspace. First guide — "The One-Button Workspace": the built-in AI consultant (a floating button on every page) that lets any visitor talk to the site — switch language/theme, find pages, or (when signed in) act on their own data — powered by the Hermes agent, LightRAG memory and a growing set of MCP tools. Brain on the server, action in the browser; tiers public/user/owner; new tools are drafted at <your-domain>/ai-draft-settings.
- [Documentation — Authentication, Roles & Providers](https://www.fractera.ai/en/documentation/authentication-roles-and-providers): how the workspace ships a complete sign-in system you turn on rather than assemble — email+password to start, one-paste Google / magic-link (a button appears automatically when credentials are set), one account linking many providers with no duplicate users, the full role model (guest/user/architect plus buyer, vip_user, subscriber tiers, manager roles, finance, content_editor, admin) stored as a list so a user can hold several roles, first-user-becomes-architect, and 80+ available providers. Built on NextAuth (Auth.js).
- [Documentation — Static-First Rendering Economics](https://www.fractera.ai/en/documentation/static-first-rendering-economics): why the platform enforces static-first rendering and the honest price it costs — the five ways content reaches a page (SSG, time-based ISR, on-demand ISR, dynamic SSR, client fetch) mapped to database load, JavaScript dependence and server compute; time-based ISR as the default (the server sleeps when idle, and a page refreshes lazily on the first visit after its window — only requested pages regenerate, never the whole site on a timer), with optional on-demand revalidation for instant freshness; why the architect-only cockpit is allowed to stay dynamic (a single architect cannot create abusive load); and why Partial Prerendering is deliberately left to the developer. The cost optimized for is the business's monthly server bill, not the developer's tokens. Raw standard: https://www.fractera.ai/docs/static-first-rendering.md
- [News](https://www.fractera.ai/en/news): chronological, AI-searchable project updates — new framework starters, Agentic Engineering Infrastructure features, agent skills and MCP tools — each embedded into the on-server LightRAG vector memory the moment it ships. Featured stories: [AI Draft Settings](https://www.fractera.ai/en/news/ai-draft-settings-evolutionary-pipeline): the page (included with every Next.js-based starter) where you or any of the six AI agents draft a new skill, instruction or MCP connector and stage it safely before it reaches the real files. Drafts become "Next Step" entries on the Development Steps page; turning a draft into code is never automatic on creation (to protect the agent's context window and token budget). It is the first link in a seven-stage pipeline for evolving an Agentic Engineering Infrastructure, and the same depth is being brought to other frameworks via dedicated Agentic Engineering Infrastructure transports. — [Multilingual Content Architecture](https://www.fractera.ai/en/news/multilingual-content-architecture): how the platform rebuilt the way its site publishes multilingual content — one folder per document, per-key translation fallback (a new language can ship with a single translated field), zero hardcoded language branches in page code, and a new self-sufficient agent skill, create-multilingual-content-entry, shipped as part of the standard architecture. Why content optimization is now inseparable from SEO for both Google and AI (generative engine optimization). Raw standard: https://www.fractera.ai/docs/multilingual-content.md
- [Home](https://www.fractera.ai/): product overview, pricing and FAQ.
- [Real-world use cases](https://www.fractera.ai/en/cases): production automations teams have built — private team workspaces, lead-dispatch Kanban, an adaptive AI tutor, and an autonomous trend-scraping blog.

## Key diagrams (canonical images)
- ![Fractera Agentic Engineering Infrastructure architecture — multi-agent system with Hermes orchestration, LightRAG Knowledge Graph memory and five coding agents on a self-hosted VPS](https://www.fractera.ai/Fractera-Web-Architect.jpg) — the Agentic Engineering Infrastructure architecture, explained at https://www.fractera.ai/ai-workspace-architect
- ![Fractera Development Loop — one admin request flows through Hermes, a coding agent and LightRAG memory to tested, deployed, recorded code](https://www.fractera.ai/Fractera-Development-Loop.jpg) — the autonomous development loop, explained at https://www.fractera.ai/ai-development-loop
- ![Fractera AI Draft Settings flow — drafts (a terminal and to-dos) become Next Step entries on the Development Steps page, and an AI generation pass writes them into each agent's files: Claude Code, Codex, Gemini CLI, Qwen Code, Kimi Code and Hermes](https://www.fractera.ai/news/fractera-ai-draft-settings/fractera-ai-draft-settings.jpg) — the AI Draft Settings evolutionary pipeline, explained at https://www.fractera.ai/en/news/ai-draft-settings-evolutionary-pipeline
`

export function GET() {
  return new NextResponse(CONTENT, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
