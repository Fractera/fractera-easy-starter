import { NextRequest, NextResponse } from 'next/server'
import { failProgress, getProgress } from '@/lib/kv'

export async function POST(req: NextRequest) {
  const { session_id } = await req.json().catch(() => ({}))
  if (!session_id) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  const progress = await getProgress(session_id)
  if (!progress) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }
  if (progress.status === 'done') {
    return NextResponse.json({ error: 'Already completed' }, { status: 409 })
  }
  if (progress.status === 'error') {
    return NextResponse.json({ ok: true, status: 'already-cancelled' })
  }

  await failProgress(session_id, 'Cancelled by user')
  return NextResponse.json({ ok: true, status: 'cancelled' })
}
