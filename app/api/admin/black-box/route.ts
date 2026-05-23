import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

const VALID_STATUSES = ['new', 'first_contact', 'negotiation', 'partner', 'lost'] as const
type Status = typeof VALID_STATUSES[number]

export async function GET(req: NextRequest) {
  const session = await auth()
  if (session?.user?.email !== 'admin@fractera.ai') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  const statusFilter = req.nextUrl.searchParams.get('status')?.trim() ?? ''

  const where: Record<string, unknown> = {}
  if (q) {
    where.OR = [
      { email: { contains: q, mode: 'insensitive' } },
      { company: { contains: q, mode: 'insensitive' } },
      { name: { contains: q, mode: 'insensitive' } },
    ]
  }
  if (statusFilter && (VALID_STATUSES as readonly string[]).includes(statusFilter)) {
    where.status = statusFilter
  }

  const rows = await db.blackBoxInquiry.findMany({
    where,
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      createdAt: true,
      email: true,
      name: true,
      company: true,
      area: true,
      country: true,
      companyDoes: true,
      aiTask: true,
      telegram: true,
      lang: true,
      status: true,
      history: {
        orderBy: { createdAt: 'desc' },
        select: { id: true, createdAt: true, status: true, note: true },
      },
    },
  })
  return NextResponse.json({ total: rows.length, rows })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (session?.user?.email !== 'admin@fractera.ai') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const body = await req.json().catch(() => ({})) as { id?: string; status?: string; note?: string }
  const { id, status, note } = body
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })

  // Status change writes both the new value on the row AND a history entry,
  // so the timeline is auditable. Note-only updates also create a history row
  // tagged with the current status — useful as a "log note" without changing state.
  const inquiry = await db.blackBoxInquiry.findUnique({ where: { id }, select: { status: true } })
  if (!inquiry) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const targetStatus = status && (VALID_STATUSES as readonly string[]).includes(status) ? status as Status : inquiry.status as Status
  const trimmedNote = typeof note === 'string' ? note.trim() : ''

  if (status && status !== inquiry.status) {
    await db.blackBoxInquiry.update({ where: { id }, data: { status: targetStatus } })
  }
  if (trimmedNote || (status && status !== inquiry.status)) {
    await db.blackBoxHistoryEntry.create({
      data: {
        inquiryId: id,
        status: targetStatus,
        note: trimmedNote || `Status changed to ${targetStatus}`,
      },
    })
  }

  return NextResponse.json({ ok: true })
}
