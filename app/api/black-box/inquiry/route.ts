import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { sendBlackBoxInquiryEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }) }

  const pick = (key: string) => typeof body[key] === 'string' ? (body[key] as string).trim() : undefined

  try {
    await sendBlackBoxInquiryEmail({
      email: session.user.email,
      name: pick('name'),
      company: pick('company'),
      area: pick('area'),
      country: pick('country'),
      companyDoes: pick('companyDoes'),
      aiTask: pick('aiTask'),
      telegram: pick('telegram'),
      lang: pick('lang'),
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[black-box/inquiry] email send failed', err)
    return NextResponse.json({ error: 'send failed' }, { status: 500 })
  }
}
