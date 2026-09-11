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
  blocks: [],
  faq: [],
}