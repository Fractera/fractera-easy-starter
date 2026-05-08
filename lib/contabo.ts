const AUTH_URL = 'https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token'
const API_URL = 'https://api.contabo.com'

async function getAccessToken(): Promise<string> {
  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'password',
      client_id: process.env.CONTABO_CLIENT_ID!,
      client_secret: process.env.CONTABO_CLIENT_SECRET!,
      username: process.env.CONTABO_API_USER!,
      password: process.env.CONTABO_API_PASSWORD!,
    }),
  })
  if (!res.ok) throw new Error(`Contabo auth failed: ${res.status}`)
  const data = await res.json()
  return data.access_token as string
}

// Returns Contabo instanceId (number)
export async function createInstance(rootPassword: string): Promise<number> {
  const token = await getAccessToken()

  const userData = Buffer.from(
    `#cloud-config\npassword: ${rootPassword}\nchpasswd:\n  expire: false\nssh_pwauth: true\n`
  ).toString('base64')

  const res = await fetch(`${API_URL}/v1/compute/instances`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-request-id': crypto.randomUUID(),
    },
    body: JSON.stringify({
      region: process.env.CONTABO_REGION ?? 'EU',
      productId: process.env.CONTABO_PRODUCT_ID ?? 'V45',
      imageId: process.env.CONTABO_IMAGE_ID,
      period: 1,
      userData,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Contabo createInstance failed: ${res.status} — ${body}`)
  }

  const data = await res.json()
  return data.data[0].instanceId as number
}

// Polls until VPS is running and has an IP. Returns IPv4 address.
export async function pollInstanceReady(instanceId: number, maxWaitMs = 240_000): Promise<string> {
  const token = await getAccessToken()
  const deadline = Date.now() + maxWaitMs
  const INTERVAL = 30_000

  while (Date.now() < deadline) {
    const res = await fetch(`${API_URL}/v1/compute/instances/${instanceId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-request-id': crypto.randomUUID(),
      },
    })

    if (res.ok) {
      const data = await res.json()
      const instance = data.data?.[0]
      const ip = instance?.ipConfig?.v4?.ip
      if (instance?.status === 'running' && ip) return ip as string
    }

    await new Promise(r => setTimeout(r, INTERVAL))
  }

  throw new Error(`Contabo instance ${instanceId} not ready within ${maxWaitMs / 1000}s`)
}
