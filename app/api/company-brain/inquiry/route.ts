import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendCompanyBrainInquiryEmail } from '@/lib/email'

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
  // DB model is still named blackBoxInquiry (table rename is a risky migration
  // that could drop existing leads — kept as-is; the product is "Company Brain"
  // everywhere the user sees it).
  let inquiryId: string | null = null
  try {
    const row = await db.blackBoxInquiry.create({ data: payload })
    inquiryId = row.id
  } catch (err) {
    console.error('[company-brain/inquiry] DB write failed', err)
  }

  try {
    await sendCompanyBrainInquiryEmail(payload)
  } catch (err) {
    console.error('[company-brain/inquiry] email send failed', err)
    if (!inquiryId) {
      return NextResponse.json({ error: 'send failed' }, { status: 500 })
    }
  }
  return NextResponse.json({ ok: true, inquiryId })
}
