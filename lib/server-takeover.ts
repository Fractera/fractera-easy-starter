import { db } from '@/lib/db'

// When a server is (re)deployed onto an IP, that box is wiped and taken over.
// Any OTHER ServerToken row still pointing at the same IP — possibly belonging
// to a previous owner — is now dead: its /opt/fractera install is gone and it
// will never ping again, yet nothing else marks it offline, so it lingers in
// that user's dashboard as a phantom "active" server.
//
// This removes those stale rows entirely (no offline "history" card — the
// previous owner should see nothing at all for an IP they no longer hold).
// Purchase history is preserved but detached (serverTokenId → null) so we never
// orphan-crash on the FK. `VpsReserve.provisioningServerTokenId` is a plain
// column (no FK), so deleting the token does not touch it.
//
// Best-effort by contract: callers wrap this so a cleanup failure never aborts
// a deploy.
export async function releaseServersOnIp(
  ip: string,
  exceptToken?: string,
): Promise<{ released: number }> {
  if (!ip) return { released: 0 }

  const stale = await db.serverToken.findMany({
    where: {
      serverIp: ip,
      ...(exceptToken ? { token: { not: exceptToken } } : {}),
    },
    select: { id: true },
  })
  if (stale.length === 0) return { released: 0 }

  const ids = stale.map((s) => s.id)
  await db.purchase.updateMany({
    where: { serverTokenId: { in: ids } },
    data: { serverTokenId: null },
  })
  await db.serverToken.deleteMany({ where: { id: { in: ids } } })

  return { released: ids.length }
}
