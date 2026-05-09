import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { assignServerToQueued } from '@/lib/pool'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.email !== 'admin@fractera.ai') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { serverTokenId } = await req.json()
  if (!serverTokenId) return NextResponse.json({ error: 'serverTokenId required' }, { status: 400 })

  const serverToken = await db.serverToken.findUnique({
    where: { id: serverTokenId },
    include: { user: { select: { email: true } } },
  })
  if (!serverToken) return NextResponse.json({ error: 'ServerToken not found' }, { status: 404 })
  if (serverToken.status !== 'queued') return NextResponse.json({ error: 'ServerToken is not queued' }, { status: 400 })

  const { ip, subdomain } = await assignServerToQueued(serverTokenId)

  if (serverToken.user.email && subdomain) {
    await sendWelcomeEmail(serverToken.user.email, subdomain).catch(console.error)
  }

  return NextResponse.json({ ok: true, ip, subdomain })
}
