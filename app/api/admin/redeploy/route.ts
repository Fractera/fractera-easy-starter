import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { deployToServer } from '@/lib/deploy'
import { initProgress } from '@/lib/kv'

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.email !== 'admin@fractera.ai') return null
  return session
}

export const maxDuration = 300

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { serverTokenId, serverIp, serverPassword } = body

  if (!serverTokenId) return NextResponse.json({ error: 'serverTokenId required' }, { status: 400 })

  const token = await db.serverToken.findUnique({ where: { id: serverTokenId } })
  if (!token) return NextResponse.json({ error: 'ServerToken not found' }, { status: 404 })

  const ip = serverIp || token.serverIp
  const password = serverPassword || token.serverPassword

  if (!ip || !password) return NextResponse.json({ error: 'No server credentials available' }, { status: 400 })

  // Если переданы новые креды — сохраняем их
  const deploySessionId = `sess-redeploy-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  await db.serverToken.update({
    where: { id: serverTokenId },
    data: {
      status: 'pending',
      deployError: null,
      deploySessionId,
      ...(serverIp ? { serverIp } : {}),
      ...(serverPassword ? { serverPassword } : {}),
    },
  })

  await initProgress(deploySessionId)

  // Запускаем асинхронно — не блокируем ответ
  deployToServer({
    ip,
    login: 'root',
    password,
    session_id: deploySessionId,
    platform: 'claude-code',
    serverToken: token.token,
  }).catch(async (err) => {
    console.error('[redeploy] error:', err)
    await db.serverToken.update({
      where: { id: serverTokenId },
      data: { status: 'error', deployError: String(err) },
    }).catch(() => {})
  })

  return NextResponse.json({ ok: true, deploySessionId })
}
