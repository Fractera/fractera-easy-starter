import { NextResponse } from 'next/server'

// Served at /.well-known/oauth-protected-resource via next.config.ts rewrite.
// MCP spec requires this endpoint even for open (no-auth) servers — without it
// Claude.ai v3 fails with "Couldn't register with sign-in service" on connect.
// Empty authorization_servers signals: no authentication required.
export async function GET() {
  return NextResponse.json(
    {
      resource: 'https://www.fractera.ai/api/mcp',
      authorization_servers: [],
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    }
  )
}
