import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendFrameworkFeedbackEmail } from '@/lib/email'

// Framework-expert feedback submit (callback card + drawer on /framework/<slug>).
// Distinct from /api/company-brain/inquiry: this captures a product-improvement wish
// from someone with framework expertise, tagged with WHICH framework it concerns.
// DB-first (best-effort) so an email-send failure doesn't lose the lead; the email
// is the primary channel and is clearly marked with the form identity + framework.
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }) }

  const pick = (key: string) => typeof body[key] === 'string' ? (body[key] as string).trim() || undefined : undefined

  const framework = pick('framework')
  if (!framework) {
    return NextResponse.json({ error: 'framework required' }, { status: 400 })
  }

  const payload = {
    email: session.user.email,
    framework,
    name: pick('name'),
    github: pick('github'),
    about: pick('about'),
    wish: pick('wish'),
    lang: pick('lang'),
  }

  let feedbackId: string | null = null
  try {
    const row = await db.frameworkFeedback.create({ data: payload })
    feedbackId = row.id
  } catch (err) {
    console.error('[framework-feedback] DB write failed', err)
  }

  try {
    await sendFrameworkFeedbackEmail(payload)
  } catch (err) {
    console.error('[framework-feedback] email send failed', err)
    if (!feedbackId) {
      return NextResponse.json({ error: 'send failed' }, { status: 500 })
    }
  }
  return NextResponse.json({ ok: true, feedbackId })
}
