import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { deleteDnsRecord } from '@/lib/cloudflare'
import { wipeServer } from '@/lib/wipe-script'

export const maxDuration = 120

// Server delete = wipe + DNS cleanup + DB status update.
//
// IMPORTANT: failures are surfaced, NOT swallowed. The previous version
// did `await sshDestroy(...).catch(() => {})` and unconditionally marked
// the row offline — so a half-deleted server vanished from the UI but
// stayed alive on the VPS, and the next redeploy stepped on its leftovers
// (the root cause of the 2-hour-frozen-at-57% bug). Now: if wipe fails,
// we keep the row visible so the user knows the action didn't complete
// and can retry via the Fractera MCP tool.
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { serverId } = await req.json()
  if (!serverId) {
    return NextResponse.json({ error: 'Missing serverId' }, { status: 400 })
  }

  const serverToken = await db.serverToken.findFirst({
    where: { id: serverId, userId: session.user.id },
  })

  if (!serverToken) {
    return NextResponse.json({ error: 'Server not found' }, { status: 404 })
  }

  const ip = serverToken.serverIp
  const login = 'root'
  const password = serverToken.serverPassword

  // 1. Wipe the VPS. If we don't have SSH credentials we cannot wipe —
  // proceed with DNS + DB cleanup so the row at least disappears.
  if (ip && password) {
    try {
      await wipeServer(ip, login, password)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      // Record the failure on the row so the user sees what happened.
      // Status stays as-is — not marked offline — so the entry remains
      // visible and the user can trigger an MCP-driven retry.
      await db.serverToken.update({
        where: { id: serverToken.id },
        data: { deployError: `WIPE_FAILED: ${errMsg}` },
      }).catch(() => {})
      return NextResponse.json({
        error: `Could not clean the server: ${errMsg}`,
        recovery: 'mcp',
      }, { status: 502 })
    }
  }

  // 2. DNS cleanup. Path-based servers (step 75+) have only 1 DNS record;
  // legacy 4th-level servers had 6 (root + auth + admin + data + lightrag + hermes).
  // We try all 6 with .catch — missing records are silently ignored.
  if (serverToken.subdomain) {
    const base = serverToken.subdomain.replace(/\.fractera\.ai$/, '')
    await Promise.all([
      deleteDnsRecord(serverToken.subdomain).catch(() => {}),
      deleteDnsRecord(`auth.${base}.fractera.ai`).catch(() => {}),
      deleteDnsRecord(`admin.${base}.fractera.ai`).catch(() => {}),
      deleteDnsRecord(`data.${base}.fractera.ai`).catch(() => {}),
      deleteDnsRecord(`lightrag.${base}.fractera.ai`).catch(() => {}),
      deleteDnsRecord(`hermes.${base}.fractera.ai`).catch(() => {}),
    ])
  }

  // 3. Mark server as offline (only reached if wipe succeeded above).
  await db.serverToken.update({
    where: { id: serverToken.id },
    data: { status: 'offline', deployError: null },
  })

  // 4. Cancel free (self-hosted) subscription when its server is deleted.
  // Paid subscriptions (monthly, annual, trial) are kept — the user paid for them
  // and may redeploy. Only the free plan has no value without an active server.
  await db.subscription.updateMany({
    where: {
      userId: session.user.id,
      planId: 'free',
      status: { not: 'cancelled' },
    },
    data: { status: 'cancelled' },
  })

  return NextResponse.json({ ok: true })
}
