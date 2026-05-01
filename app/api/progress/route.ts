import { NextRequest, NextResponse } from 'next/server'
import { getProgress, appendStep, completeProgress, failProgress } from '@/lib/kv'

export async function GET(req: NextRequest) {
  const session_id = req.nextUrl.searchParams.get('session_id')
  if (!session_id) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  const progress = await getProgress(session_id)
  if (!progress) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  return NextResponse.json(progress)
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-install-secret')
  if (secret !== process.env.INSTALL_SCRIPT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { session_id, step, done, response } = body

  if (!session_id) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  if (done && response) {
    const subdomain = response?.subdomain ?? null
    if (subdomain) {
      await completeProgress(session_id, subdomain)
    } else {
      await failProgress(session_id, 'Domain registration failed')
    }
    return NextResponse.json({ ok: true })
  }

  if (step) {
    await appendStep(session_id, { ...step, ts: step.ts ?? Date.now() })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
}
