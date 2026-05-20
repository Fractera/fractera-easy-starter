import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Backend foundation only — wiring to the actual install pipeline lands in commit C.
// For now: validate the embed token, ensure the session is activated, and flip the
// status to 'installing' so the widget can move to its 'deploying' state.
export async function POST(req: Request) {
  let body: { token?: unknown; ip?: unknown; password?: unknown; subdomain?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const token = typeof body.token === 'string' ? body.token : ''
  const ip = typeof body.ip === 'string' ? body.ip.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  if (!ip || !password) return NextResponse.json({ error: 'Missing IP or password' }, { status: 400 })

  const session = await db.embedSession.findUnique({
    where: { token },
    select: { id: true, status: true, userId: true },
  })
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (session.status === 'pending') {
    return NextResponse.json({ error: 'Not activated yet' }, { status: 409 })
  }

  await db.embedSession.update({
    where: { id: session.id },
    data: { status: 'installing' },
  })

  // TODO (commit C): wire to existing install pipeline.
  // For now we just acknowledge the request — the widget will display the
  // 'deployment started, see email' state regardless. The real install backend
  // ingests credentials elsewhere (existing /api/install on the landing).
  return NextResponse.json({ ok: true, status: 'installing' })
}
