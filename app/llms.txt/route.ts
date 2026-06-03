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

## Primary knowledge base
- [Project knowledge base for AI agents](https://www.fractera.ai/mcp-info): full L1/L2 architecture, service interactions, customization, Zero-Ops deployment, real-world use cases, and the MCP connector with the get_project_info tool.

## Site
- [Home](https://www.fractera.ai/): product overview, pricing and FAQ.
- [Real-world use cases](https://www.fractera.ai/en/cases): production automations teams have built — private team workspaces, lead-dispatch Kanban, an adaptive AI tutor, and an autonomous trend-scraping blog.

## For AI agents
- Fractera exposes a remote MCP server at https://www.fractera.ai/api/mcp. An agent can register the user, recommend a VPS, and run the full deployment programmatically, then call get_project_info for architecture and specs.
- The deployment is IP-first (phase 1): it finishes on http://<server-ip>:3002 with no domain or HTTPS required. Attaching a custom domain with HTTPS is an optional later step the user performs inside the workspace.
- Fractera never charges for the deployment itself; it is free to run on the user's own hardware.
`

export function GET() {
  return new NextResponse(CONTENT, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
