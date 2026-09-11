import type { DeploymentBase } from '../../_lib/post'

// Base English document for /[lang]/deployments/vps (Production VPS target).
// IP-first reality: the deploy comes up on plain HTTP at http://<ip>:3002 — never
// promise HTTPS/a domain as the result of the deploy (that is an optional later step).
export const en: DeploymentBase = {
  title: 'Production VPS: Automated Agent Engineering Infrastructure',
  seoTitle: 'Agent Engineering VPS: Production-Ready Agent Stack on Ubuntu',
  subtitle:
    'Deploy a complete multi-agent production environment onto an Ubuntu VPS in ten minutes. Spin up a Hermes-orchestrated team and private LightRAG memory on your own cloud hardware for a flat monthly server bill.',
  description:
    'Stop paying inflated SaaS subscriptions. Initialize a production-grade agent engineering infrastructure on an isolated Ubuntu VPS. IP-first orchestration: live on plain HTTP at http://<ip>:3002 in 10 minutes flat.',
  keywords:
    'agent engineering vps, production ready agent stack ubuntu, agent server setup contabo, agent hosting, self-hosted ai vps, deploy ai agents to vps, ubuntu ai coding server, agentic engineering infrastructure, self hosted vercel alternative, ip-first deploy',
  listTitle: 'Production VPS Substrate',
  listDescription:
    'Deploy the full framework to an Ubuntu VPS in ten minutes — industrial agent hosting environments running on isolated cloud hardware for a flat fee.',
  founderQuote:
    'Building something new and uncharted is very hard. Every obvious thing has already been tried by thousands of other founders. And here we come back again to the thought that it is better for an idea to be “idiotic” than obvious.',
  blocks: [],
  faq: [
    {
      q: 'How long does the automated VPS setup take, and what is the access URL?',
      a: 'The full installation loop finishes in roughly ten minutes on a vanilla Ubuntu 24.04 host. Once complete, your master cockpit is live on plain HTTP at http://<your-ip>:3002. The initialization is IP-first by design, enabling instant workspace entry without waiting for DNS records or certificate handshakes.',
    },
    {
      q: 'Is a domain name or a pre-configured SSL certificate required to deploy?',
      a: 'No. The default deployment targeted by the installer operates purely over an IP address on standard HTTP port 3002. Binding custom subdomains, setting up Nginx reverse proxy routes, and activating HTTPS are optional administrative tasks handled by the developer from inside the live workspace (Admin → Personal Domain) whenever needed.',
    },
    {
      q: 'Which cloud VPS providers and operating system builds are officially supported?',
      a: 'Any virtual private host running a clean image of Ubuntu 24.04 LTS with root access is fully supported. Providers like Contabo, Hetzner, and similar unmanaged infrastructure services supply excellent high-spec machines for flat monthly fees. You supply the raw server access; Fractera automated scripts configure the entire agent engineering infrastructure.',
    },
  ],
}