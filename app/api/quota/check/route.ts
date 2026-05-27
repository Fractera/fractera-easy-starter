import { NextRequest, NextResponse } from 'next/server'
import { checkDnsQuota } from '@/lib/cloudflare-quota'

// Called as the first step of bootstrap.sh.
// Returns the current Cloudflare DNS record count / plan / threshold status.
// Side-effect: if status is `warning` or `critical`, sends an alert email to
// admin@fractera.ai (idempotent — suppressed 4h via KV).
//
// Bootstrap behaviour:
//   status="ok"        → proceed silently
//   status="warning"   → proceed (email already sent)
//   status="critical"  → bootstrap aborts with a clear fail() message,
//                        no DNS create is attempted (would 81045 anyway)
//
// Auth: same `x-install-secret` header bootstraps use everywhere.
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-install-secret')
  if (secret !== process.env.INSTALL_SCRIPT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const blockedDomain = req.nextUrl.searchParams.get('blocked') ?? undefined

  try {
    const result = await checkDnsQuota(blockedDomain ?? undefined)
    return NextResponse.json(result)
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error('[quota/check] failed', errMsg)
    // Fail-open: if we cannot talk to Cloudflare, don't block bootstrap.
    // Worst case the deploy will hit the same 81045 at register step
    // and fail there with a clear message.
    return NextResponse.json({
      status: 'ok',
      count: -1,
      limit: -1,
      planTier: 'Unknown',
      zoneId: '',
      emailSent: null,
      error: errMsg,
      degraded: true,
    })
  }
}
