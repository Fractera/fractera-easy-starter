import { NextRequest, NextResponse } from 'next/server'
import { sendDevToolsConsultEmail } from '@/lib/email'

// Consultation requests arriving from a user's OWN control panel (owner, 2026-08-14).
//
// WHY THERE IS NO SESSION CHECK HERE. The caller is the Fractera panel running
// on the user's VPS, server-to-server. It has no session with this site and
// never will: it is a different machine belonging to a different person. The
// first version of the button opened the user's mail client instead — the owner
// tried it and reported that the mail app simply does not open for everyone.
//
// WHAT GUARDS IT INSTEAD. The payload is tiny and fully validated, the address
// must look like an address, every field is length-capped, and one IP may send
// a handful of requests per hour. This is a contact form, not an endpoint that
// grants anything: the worst a flood achieves is noise in one mailbox, and the
// cap keeps even that small.
//
// It deliberately does NOT touch the frozen deploy infrastructure (rule: no
// changes to lib/deploy.ts, lib/bootstrap.sh and friends for side purposes) —
// it only reuses lib/email.ts, which is the shared, additive-safe layer.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_PER_HOUR = 5
const WINDOW_MS = 60 * 60 * 1000

// In-memory window. Deliberately not a database: a contact-form guard that
// resets on redeploy is fine, while a schema migration for it is not.
const seen = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const hits = (seen.get(ip) ?? []).filter(t => now - t < WINDOW_MS)
  hits.push(now)
  seen.set(ip, hits)
  if (seen.size > 5000) seen.clear() // crude ceiling — this map must never grow unbounded
  return hits.length > MAX_PER_HOUR
}

const clean = (v: unknown, max: number): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : undefined

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }) }

  const email = clean(body.email, 200)
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'email_required' }, { status: 400 })
  }

  try {
    await sendDevToolsConsultEmail({
      email,
      page: clean(body.page, 300),
      server: clean(body.server, 120),
      topic: clean(body.topic, 60),
    })
  } catch (err) {
    console.error('[consult/dev-tools] email send failed', err)
    // The panel shows its fallback (copy the letter / open the mail app) when
    // this is not ok, so an honest failure is more useful than a silent 200.
    return NextResponse.json({ error: 'send_failed' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
