import { NextResponse } from 'next/server'

// MCP spec requires this endpoint even for open (no-auth) servers.
// Without it Claude.ai v3 fails with "Couldn't register with sign-in service"
// during connector setup. Returning an empty authorization_servers array
// signals to the MCP client that no authentication is required.
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
