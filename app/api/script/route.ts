import { NextRequest, NextResponse } from 'next/server'
import { generateInstallScript, Provider } from '@/lib/script-generator'

const VALID_PROVIDERS: Provider[] = ['hetzner', 'digitalocean', 'oracle', 'existing']

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const provider = searchParams.get('provider') as Provider
  const sessionId = searchParams.get('session_id')

  if (!provider || !VALID_PROVIDERS.includes(provider)) {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
  }

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  const secret = process.env.INSTALL_SCRIPT_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }
  const script = generateInstallScript(provider, sessionId, secret)

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'text/plain',
      'Content-Disposition': 'attachment; filename="install.sh"',
    },
  })
}
