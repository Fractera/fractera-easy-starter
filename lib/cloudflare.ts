const CLOUDFLARE_API = 'https://api.cloudflare.com/client/v4'

export async function createDnsRecord(ip: string, subdomain: string): Promise<void> {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID!
  const token = process.env.CLOUDFLARE_API_TOKEN!

  // If record already exists — delete it first (idempotent upsert)
  const fullName = subdomain.endsWith('.fractera.ai') ? subdomain : `${subdomain}.fractera.ai`
  const listRes = await fetch(
    `${CLOUDFLARE_API}/zones/${zoneId}/dns_records?type=A&name=${encodeURIComponent(fullName)}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  )
  if (listRes.ok) {
    const list = await listRes.json()
    const existing = list.result?.[0]
    if (existing) {
      await fetch(`${CLOUDFLARE_API}/zones/${zoneId}/dns_records/${existing.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      }).catch(() => {})
    }
  }

  const res = await fetch(`${CLOUDFLARE_API}/zones/${zoneId}/dns_records`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'A',
      name: subdomain,
      content: ip,
      ttl: 60,
      proxied: false,
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`Cloudflare API error: ${JSON.stringify(err.errors)}`)
  }
}

export async function deleteDnsRecord(fullDomain: string): Promise<void> {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID!
  const token = process.env.CLOUDFLARE_API_TOKEN!

  // Find record ID by name
  const listRes = await fetch(
    `${CLOUDFLARE_API}/zones/${zoneId}/dns_records?type=A&name=${encodeURIComponent(fullDomain)}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  )
  if (!listRes.ok) {
    const err = await listRes.json()
    throw new Error(`Cloudflare list error: ${JSON.stringify(err.errors)}`)
  }
  const list = await listRes.json()
  const record = list.result?.[0]
  if (!record) return // already gone

  const delRes = await fetch(
    `${CLOUDFLARE_API}/zones/${zoneId}/dns_records/${record.id}`,
    { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }
  )
  if (!delRes.ok) {
    const err = await delRes.json()
    throw new Error(`Cloudflare delete error: ${JSON.stringify(err.errors)}`)
  }
}
