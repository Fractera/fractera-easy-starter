import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serverToken = await db.serverToken.findFirst({
    where: {
      userId: session.user.id,
      status: { notIn: ['offline'] },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      subdomain: true,
      deploySessionId: true,
      createdAt: true,
    },
  })

  if (!serverToken) {
    return NextResponse.json({ server: null })
  }

  return NextResponse.json({ server: serverToken })
}
