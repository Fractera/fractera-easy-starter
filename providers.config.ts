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
    note: 'Most powerful free option. Requires credit card for verification (no charge). Setup is more involved — may show "Out of capacity", try different region.',
    url: 'https://www.oracle.com/cloud/free/',
    showInMain: true,
  },
  {
    id: 'digitalocean',
    name: 'DigitalOcean Droplet',
    price: '~$6/month',
    specs: '1 vCPU, 1GB RAM, 25GB SSD',
    note: 'Simple and reliable. Add 2GB swap recommended for 1GB RAM. Good if you already have a DigitalOcean account.',
    url: 'https://www.digitalocean.com/pricing/droplets',
    showInMain: true,
  },
  {
    id: 'hostinger',
    name: 'Hostinger VPS',
    price: '~€4-5/month',
    specs: '2 vCPU, 2GB RAM',
    note: 'Good price, user-friendly hPanel. Use standard VPS option (not managed OpenClaw).',
    url: 'https://www.hostinger.com/vps-hosting',
  },
  {
    id: 'gcp',
    name: 'Google Cloud e2-micro',
    price: '~$5-12/month',
    specs: '2 vCPU shared, 1GB RAM',
    note: 'Free tier (e2-micro) available in us-west1, us-central1, us-east1. Good if you already use Google services.',
    url: 'https://cloud.google.com/free/docs/free-cloud-features#compute',
  },
  {
    id: 'azure',
    name: 'Microsoft Azure B1s',
    price: '~$7-15/month',
    specs: '1 vCPU, 1GB RAM',
    note: 'Free tier available for first 12 months. Good if you already have an Azure account.',
    url: 'https://azure.microsoft.com/en-us/pricing/details/virtual-machines/linux/',
  },
]

export const MAIN_PROVIDERS = PROVIDERS.filter(p => p.showInMain)
export const EXTENDED_PROVIDERS = PROVIDERS
