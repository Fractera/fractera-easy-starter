import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const partner = await db.partner.findUnique({
    where: { userId: session.user.id },
    select: { slug: true, companyName: true, companyEmail: true },
  })
  if (!partner) return NextResponse.json({ error: 'Not a partner' }, { status: 403 })

  return NextResponse.json({ partner })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const partner = await db.partner.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!partner) return NextResponse.json({ error: 'Not a partner' }, { status: 403 })

  let body: { companyName?: unknown; companyEmail?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const data: { companyName?: string | null; companyEmail?: string | null } = {}

  if (typeof body.companyName === 'string') {
    const v = body.companyName.trim()
    if (v.length > 120) return NextResponse.json({ error: 'companyName max 120 chars' }, { status: 400 })
    data.companyName = v || null
  } else if (body.companyName === null) {
    data.companyName = null
  }

  if (typeof body.companyEmail === 'string') {
    const v = body.companyEmail.trim()
    if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      return NextResponse.json({ error: 'companyEmail must be a valid email' }, { status: 400 })
    }
    if (v.length > 120) return NextResponse.json({ error: 'companyEmail max 120 chars' }, { status: 400 })
    data.companyEmail = v || null
  } else if (body.companyEmail === null) {
    data.companyEmail = null
  }

  const updated = await db.partner.update({
    where: { id: partner.id },
    data,
    select: { slug: true, companyName: true, companyEmail: true },
  })

  return NextResponse.json({ partner: updated })
}
