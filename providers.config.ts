export type Provider = {
  id: string
  name: string
  price: string
  specs: string
  note: string
  url: string
  recommended?: boolean
  showInMain?: boolean
}

export const PROVIDERS: Provider[] = [
  {
    id: 'hetzner',
    name: 'Hetzner CX11',
    price: '~€3.29/month',
    specs: '2 vCPU, 2GB RAM, 20GB SSD',
    note: 'Best price/performance. Reliable Linux VPS, EU/US locations. Takes ~5 minutes to create.',
    url: 'https://www.hetzner.com/cloud',
    recommended: true,
    showInMain: true,
  },
  {
    id: 'oracle',
    name: 'Oracle Cloud Always Free ARM',
    price: 'Free forever',
    specs: '4 ARM vCPUs, 24GB RAM',
    note: 'Most powerful free option. Requires credit card for verification (no charge). Setup is more involved.',
    url: 'https://www.oracle.com/cloud/free/',
    showInMain: true,
  },
  {
    id: 'digitalocean',
    name: 'DigitalOcean Droplet',
    price: '~$6/month',
    specs: '1 vCPU, 1GB RAM, 25GB SSD',
    note: 'Simple and reliable. Good if you already have a DigitalOcean account.',
    url: 'https://www.digitalocean.com/pricing/droplets',
    showInMain: true,
  },
  {
    id: 'hostinger',
    name: 'Hostinger VPS',
    price: '~€4-5/month',
    specs: '1-2 vCPU, 2-4GB RAM',
    note: 'Good price, user-friendly hPanel management.',
    url: 'https://www.hostinger.com/vps-hosting',
  },
  {
    id: 'fly',
    name: 'Fly.io',
    price: '~$5-8/month',
    specs: 'Shared CPU, 256MB-1GB RAM',
    note: 'Automatic HTTPS, easy scaling, no SSH needed for basic ops.',
    url: 'https://fly.io/docs/about/pricing/',
  },
  {
    id: 'gcp',
    name: 'Google Cloud (e2-micro)',
    price: '~$5-12/month',
    specs: '2 vCPU shared, 1GB RAM',
    note: 'Free tier available. Good if you already use Google services.',
    url: 'https://cloud.google.com/compute/docs/general-purpose-machines#e2_machine_types',
  },
]

export const MAIN_PROVIDERS = PROVIDERS.filter(p => p.showInMain)
export const EXTENDED_PROVIDERS = PROVIDERS
