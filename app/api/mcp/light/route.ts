import { NextRequest, NextResponse } from 'next/server'
import { MCP_TOOLS_LIGHT, handleToolCallLight } from '@/lib/mcp-tools-light'
import { MCP_SYSTEM_PROMPT_LIGHT } from '@/lib/mcp-prompt-light'

// retry_deploy SSHes into the customer's server (wipe + bootstrap-light upload),
// so this route needs the full serverless duration window.
export const maxDuration = 300

export async function GET(req: NextRequest) {
  const baseUrl = `https://${req.headers.get('host')}`

  const manifest = {
    schema_version: 'v1',
    name_for_human: 'Fractera Light Installer',
    name_for_model: 'fractera_light_installer',
    description_for_human: 'Install Fractera Light (private backend, no AI on the server) on your own VPS',
    description_for_model: MCP_SYSTEM_PROMPT_LIGHT,
    auth: { type: 'none' },
    api: {
      type: 'openapi',
      url: `${baseUrl}/api/mcp/light/openapi.json`,
    },
    tools: MCP_TOOLS_LIGHT,
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
      result: { tools: MCP_TOOLS_LIGHT },
    })
  }

  if (method === 'tools/call') {
    const { name, arguments: args } = params
    try {
      const result = await handleToolCallLight(name, args || {}, baseUrl)
      return NextResponse.json({
        jsonrpc: '2.0',
        id: body.id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        },
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[mcp-light] tool ${name} threw`, err)
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
        serverInfo: { name: 'fractera-light-installer', version: '1.0.0' },
      },
    })
  }

  return NextResponse.json({
    jsonrpc: '2.0',
    id: body.id,
    error: { code: -32601, message: 'Method not found' },
  })
}
