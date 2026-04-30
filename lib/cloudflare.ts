const CLOUDFLARE_API = 'https://api.cloudflare.com/client/v4'

export async function createDnsRecord(ip: string, subdomain: string): Promise<void> {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID!
  const token = process.env.CLOUDFLARE_API_TOKEN!

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
