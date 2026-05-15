import { NextRequest, NextResponse } from 'next/server'

const SECRET = process.env.INSTALL_SCRIPT_SECRET ?? ''

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-install-secret') ?? ''
  if (!SECRET || secret !== SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cert = process.env.CF_ORIGIN_CERT ?? ''
  const key  = process.env.CF_ORIGIN_KEY  ?? ''

  if (!cert || !key) {
    return NextResponse.json(
      { error: 'CF_ORIGIN_CERT / CF_ORIGIN_KEY not configured in Vercel env' },
      { status: 503 }
    )
  }

  return NextResponse.json({ cert, key })
}
