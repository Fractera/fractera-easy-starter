// DEBUG endpoint — remove before launch
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendInstallLogEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '').trim()
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 })

  const serverToken = await db.serverToken.findUnique({
    where: { token },
    include: { user: true },
  })
  if (!serverToken?.user?.email) return NextResponse.json({ ok: true })

  const body = await req.json().catch(() => ({}))
  const { step = '', label = '', percent = 0, elapsed = '' } = body

  sendInstallLogEmail(serverToken.user.email, step, label, percent, elapsed).catch(console.error)

  return NextResponse.json({ ok: true })
}
