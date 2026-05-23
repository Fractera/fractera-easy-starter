import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendBlackBoxInquiryEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }) }

  const pick = (key: string) => typeof body[key] === 'string' ? (body[key] as string).trim() || undefined : undefined

  const payload = {
    email: session.user.email,
    name: pick('name'),
    company: pick('company'),
    area: pick('area'),
    country: pick('country'),
    companyDoes: pick('companyDoes'),
    aiTask: pick('aiTask'),
    telegram: pick('telegram'),
    lang: pick('lang'),
  }

  // Persist to CRM first so an email-send failure doesn't lose the lead.
  // Email is best-effort — if Resend has a hiccup the row is still in the DB
  // and the admin sees the inquiry in /admin/blackbox.
  let inquiryId: string | null = null
  try {
    const row = await db.blackBoxInquiry.create({ data: payload })
    inquiryId = row.id
  } catch (err) {
    console.error('[black-box/inquiry] DB write failed', err)
    // Fall through — still try to send the email; the admin will at least see
    // the inquiry in their inbox even if the CRM row didn't make it.
  }

  try {
    await sendBlackBoxInquiryEmail(payload)
  } catch (err) {
    console.error('[black-box/inquiry] email send failed', err)
    // If DB write also failed above, surface a 500 — neither channel got it.
    if (!inquiryId) {
      return NextResponse.json({ error: 'send failed' }, { status: 500 })
    }
  }
  return NextResponse.json({ ok: true, inquiryId })
}
