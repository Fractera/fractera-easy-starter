import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { sendWelcomeEmail } from '@/lib/email'

// One-shot helper for the admin to preview transactional email designs.
// Hit `/api/admin/test-email?email=foo@example.com` while signed in as the
// admin — the rendered welcome email lands in that inbox with sample data.
export async function GET(req: NextRequest) {
  const session = await auth()
  if (session?.user?.email !== 'admin@fractera.ai') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const to = req.nextUrl.searchParams.get('email')?.trim()
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 })
  }
  try {
    await sendWelcomeEmail(
      to,
      'happy-elk-42.fractera.ai',
      { ip: '109.199.105.213', password: 'demo-pass-Julia711' }
    )
    return NextResponse.json({ ok: true, sent: to })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
