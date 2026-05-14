import { NextRequest, NextResponse } from 'next/server'
import { failProgress, getProgress } from '@/lib/kv'
import { db } from '@/lib/db'

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

  const errMsg = 'Cancelled by user'
  await failProgress(session_id, errMsg)

  // Mirror the install error handler: mark token as error, return pool VPS to 'available'.
  const token = await db.serverToken.findFirst({ where: { deploySessionId: session_id } })
  if (token) {
    await db.serverToken.update({
      where: { id: token.id },
      data: { status: 'error', deployError: errMsg },
    })
    const poolServer = await db.vpsReserve.findFirst({
      where: { provisioningServerTokenId: token.id },
    })
    if (poolServer) {
      await db.vpsReserve.update({
        where: { id: poolServer.id },
        data: { status: 'available' },
      })
    }
  }

  return NextResponse.json({ ok: true, status: 'cancelled' })
}
