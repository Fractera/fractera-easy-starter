import { NextRequest, NextResponse } from 'next/server'
import { MCP_TOOLS, handleToolCall } from '@/lib/mcp-tools'
import { MCP_SYSTEM_PROMPT } from '@/lib/mcp-prompt'

// retry_deploy SSHes into the customer's server (wipe + bootstrap upload),
// so this route needs the full serverless duration window.
export const maxDuration = 300

export async function GET(req: NextRequest) {
  const baseUrl = `https://${req.headers.get('host')}`

  const manifest = {
    schema_version: 'v1',
    name_for_human: 'Fractera Installer',
    name_for_model: 'fractera_installer',
    description_for_human: 'Install Fractera AI Workspace on your own server',
    description_for_model: MCP_SYSTEM_PROMPT,
    auth: { type: 'none' },
    api: {
      type: 'openapi',
      url: `${baseUrl}/api/mcp/openapi.json`,
    },
    tools: MCP_TOOLS,
  }

  return NextResponse.json(manifest)
}

export async function POST(req: NextRequest) {
  const baseUrl = `https://${req.headers.get('host')}`
  const body = await req.json()

  const { method, params } = body

  if (method === 'tools/list') {
    return NextResponse.json({
      jsonrpc: '2.0',
      id: body.id,
      result: { tools: MCP_TOOLS },
    })
  }

  if (method === 'tools/call') {
    const { name, arguments: args } = params
    try {
      const result = await handleToolCall(name, args || {}, baseUrl)
      return NextResponse.json({
        jsonrpc: '2.0',
        id: body.id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        },
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[mcp] tool ${name} threw`, err)
      return NextResponse.json({
        jsonrpc: '2.0',
        id: body.id,
        result: {
          content: [{ type: 'text', text: JSON.stringify({ status: 'error', message }, null, 2) }],
          isError: true,
        },
      })
    }
  }

  if (method === 'initialize') {
    return NextResponse.json({
      jsonrpc: '2.0',
      id: body.id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'fractera-installer', version: '1.0.0' },
        // The MCP-spec channel for delivering the server's system prompt to the
        // client/model. Without this, JSON-RPC clients (claude.ai connector,
        // Claude Desktop) never receive MCP_SYSTEM_PROMPT — they only see tool
        // descriptions — so the conversational flow (Q1–Q5, email-twice, the
        // no-https / no-double-register rules) was never enforced. The GET
        // manifest's `description_for_model` only reaches ChatGPT-plugin-style
        // clients, not the MCP connector. → this is why Q5 was skipped.
        instructions: MCP_SYSTEM_PROMPT,
      },
    })
  }

  return NextResponse.json({
    jsonrpc: '2.0',
    id: body.id,
    error: { code: -32601, message: 'Method not found' },
  })
}
