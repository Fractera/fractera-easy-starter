import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { purchaseId } = await req.json().catch(() => ({})) as { purchaseId?: string }
  if (!purchaseId) return NextResponse.json({ error: 'Missing purchaseId' }, { status: 400 })

  const purchase = await db.purchase.findUnique({
    where: { id: purchaseId },
    include: { serverToken: { select: { token: true, subdomain: true, status: true } } },
  })

  if (!purchase || purchase.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (purchase.productType !== 'white_label') {
    return NextResponse.json({ error: 'Not a white label purchase' }, { status: 400 })
  }

  const server = purchase.serverToken
  if (!server?.subdomain || server.status === 'offline') {
    return NextResponse.json({ error: 'Server not available' }, { status: 400 })
  }

  try {
    const res = await fetch(`https://admin.${server.subdomain}/api/config/white-label`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${server.token}` },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) {
      const body = await res.text()
      return NextResponse.json({ error: `Server returned ${res.status}: ${body}` }, { status: 502 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 })
  }
}
