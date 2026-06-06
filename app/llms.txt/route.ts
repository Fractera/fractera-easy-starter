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
- [Home](https://www.fractera.ai/): product overview, pricing and FAQ.
- [Real-world use cases](https://www.fractera.ai/en/cases): production automations teams have built — private team workspaces, lead-dispatch Kanban, an adaptive AI tutor, and an autonomous trend-scraping blog.
`

export function GET() {
  return new NextResponse(CONTENT, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
