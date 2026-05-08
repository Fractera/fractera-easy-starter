const AUTH_URL = 'https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token'
const API_URL = 'https://api.contabo.com'

// Static product catalog — no API endpoint exists for this, docs only.
// Last verified: May 2026. Source: POST /v1/compute/instances description in contabo-vps-api.json
const CONTABO_PRODUCTS = [
  { productId: 'V91',  vcpu: 4,  ramGb: 8,  diskGb: 75,   diskType: 'nvme' },
  { productId: 'V92',  vcpu: 4,  ramGb: 8,  diskGb: 150,  diskType: 'ssd'  },
  { productId: 'V93',  vcpu: 4,  ramGb: 8,  diskGb: 300,  diskType: 'ssd'  },
  { productId: 'V94',  vcpu: 6,  ramGb: 12, diskGb: 100,  diskType: 'nvme' },
  { productId: 'V95',  vcpu: 6,  ramGb: 12, diskGb: 200,  diskType: 'ssd'  },
  { productId: 'V96',  vcpu: 6,  ramGb: 12, diskGb: 400,  diskType: 'ssd'  },
  { productId: 'V97',  vcpu: 8,  ramGb: 24, diskGb: 200,  diskType: 'nvme' },
  { productId: 'V98',  vcpu: 8,  ramGb: 24, diskGb: 400,  diskType: 'ssd'  },
  { productId: 'V99',  vcpu: 8,  ramGb: 24, diskGb: 1000, diskType: 'ssd'  },
  { productId: 'V100', vcpu: 12, ramGb: 48, diskGb: 250,  diskType: 'nvme' },
] as const

type ProductFilter = { vcpu?: number; ramGb?: number; diskGb?: number; diskType?: 'nvme' | 'ssd' }

export function getProductId(filter: ProductFilter): string {
  const candidates = CONTABO_PRODUCTS.filter(p => {
    if (filter.vcpu && p.vcpu !== filter.vcpu) return false
    if (filter.ramGb && p.ramGb !== filter.ramGb) return false
    if (filter.diskGb && p.diskGb < filter.diskGb) return false
    if (filter.diskType && p.diskType !== filter.diskType) return false
    return true
  })
  if (!candidates.length) throw new Error(`No Contabo product for ${JSON.stringify(filter)}`)
  return [...candidates].sort((a, b) => a.diskGb - b.diskGb)[0].productId
}

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

async function getUbuntu24ImageId(token: string): Promise<string> {
  const res = await fetch(`${API_URL}/v1/compute/images?name=Ubuntu+24`, {
    headers: { Authorization: `Bearer ${token}`, 'x-request-id': crypto.randomUUID() },
  })
  if (!res.ok) throw new Error(`Contabo getImages failed: ${res.status}`)
  const data = await res.json()
  const image = data.data?.[0]
  if (!image) throw new Error('Ubuntu 24.04 image not found in Contabo')
  return image.imageId as string
}

// Returns Contabo instanceId.
// If CONTABO_MOCK=true — skips real API, returns fake id 99999.
export async function createInstance(rootPassword: string): Promise<number> {
  if (process.env.CONTABO_MOCK === 'true') {
    console.log('[contabo] MOCK mode — skipping real VPS creation')
    return 99999
  }

  const token = await getAccessToken()
  const userData = `#cloud-config\npassword: ${rootPassword}\nchpasswd:\n  expire: false\nssh_pwauth: true\n`

  const productId = process.env.CONTABO_PRODUCT_ID ?? getProductId({ vcpu: 4, diskType: 'nvme' })
  const imageId = process.env.CONTABO_IMAGE_ID ?? await getUbuntu24ImageId(token)

  const res = await fetch(`${API_URL}/v1/compute/instances`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-request-id': crypto.randomUUID(),
    },
    body: JSON.stringify({
      region: process.env.CONTABO_REGION ?? 'EU',
      productId,
      imageId,
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

// Polls until VPS is running and returns IPv4.
// If CONTABO_MOCK=true — waits 5s and returns FRACTERA_DEPLOY_IP.
export async function pollInstanceReady(instanceId: number, maxWaitMs = 240_000): Promise<string> {
  if (process.env.CONTABO_MOCK === 'true') {
    await new Promise(r => setTimeout(r, 5_000))
    const ip = process.env.FRACTERA_DEPLOY_IP
    if (!ip) throw new Error('CONTABO_MOCK=true but FRACTERA_DEPLOY_IP is not set')
    console.log(`[contabo] MOCK mode — returning test IP: ${ip}`)
    return ip
  }

  const token = await getAccessToken()
  const deadline = Date.now() + maxWaitMs
  const INTERVAL = 30_000

  while (Date.now() < deadline) {
    const res = await fetch(`${API_URL}/v1/compute/instances/${instanceId}`, {
      headers: { Authorization: `Bearer ${token}`, 'x-request-id': crypto.randomUUID() },
    })

    if (res.ok) {
      const data = await res.json()
      const instance = data.data?.[0]
      if (instance?.status === 'error') throw new Error(`Contabo instance ${instanceId} entered error state`)
      const ip = instance?.ipConfig?.v4?.ip
      if (instance?.status === 'running' && ip) return ip as string
    }

    await new Promise(r => setTimeout(r, INTERVAL))
  }

  throw new Error(`Contabo instance ${instanceId} not ready within ${maxWaitMs / 1000}s`)
}
