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
  blocks: [
    {
      kind: 'callout',
      title: 'Industrial Performance, IP-First Real-Time Setup',
      text:
        'The underlying multi-agent stack installs directly onto your raw Ubuntu VPS and initializes immediately on plain HTTP at http://<your-ip>:3002. This is your master workspace cockpit. No DNS propagation delays, no SSL certificate issuance queues, and no DevOps friction. Binding a custom domain with Nginx automated HTTPS is an optional administrative step handled inside the panel later.',
    },
    {
      kind: 'p',
      text:
        'A dedicated virtual host is the default environment for the Fractera [platform for agentic engineering](/en). The system coordinates long-running infrastructure processes entirely on a machine you own outright: five concurrent development CLIs, the Hermes context orchestrator, a LightRAG knowledge graph, your live application layer, its SQLite WAL database, and isolated media storage. Your data remains anchored to your private disk, far away from third-party telemetry aggregators.',
    },

    { kind: 'h2', text: 'Sovereign Agent Hosting on Isolated Cloud Hardware' },
    { kind: 'h3', text: 'IP-First Orchestration: Active on Plain HTTP with Zero Wait Time' },
    {
      kind: 'p',
      text:
        'The provisioning sequence is strictly IP-first by design. Upon completion—typically taking less than ten minutes—your administrative cockpit is fully reachable at http://<your-ip>:3002 over a plain HTTP transport layer. Skipping immediate domain binding and SSL checks is a deliberate engineering choice to get your multi-agent team running instantly. When your production features are verified, you can attach a personalized domain and auto-generate Let’s Encrypt SSL chains directly from the UI (Admin → Personal Domain) as a separate, subsequent step.',
    },
    { kind: 'h3', text: 'Rent the Raw Hardware, Own Your Multi-Agent Stack' },
    {
      kind: 'p',
      text:
        'Any standard Ubuntu 24.04 VPS with root SSH privileges is fully compatible. Cost-effective infrastructure hosts like Contabo or Hetzner rent high-core environments for a few dollars a month. The automated installer configures the entire workspace as resilient, background-monitored PM2 processes on that hardware. The Open Code layer belongs strictly to your business entity: the source code, user data, and vector structures stay on your local storage blocks.',
    },

    { kind: 'h2', text: 'Anatomy of the Production Server Workspace' },
    { kind: 'h3', text: 'The Multi-Agent Execution Matrix + Hermes Orchestration' },
    {
      kind: 'p',
      text:
        'Claude Code, OpenAI Codex, Gemini CLI, Qwen Code, and Kimi Code boot concurrently within browser-isolated terminal wrappers on your host. They tap straight into your personal developer accounts, removing middleman API markups. Rather than letting agents run ungrounded file modifications, the Hermes task manager forces a deterministic loop—converting requests into strict, atomic MCP actions and verifying code syntax changes against your local compiler before deployment.',
    },
    { kind: 'h3', text: 'Private LightRAG Memory: Defeating Context Window Inflation' },
    {
      kind: 'p',
      text:
        'A persistent LightRAG vector graph server runs locally as the shared memory node of the VPS host. This architecture ensures that project constraints, code historical changes, and developer rules compound across sessions instead of wiping clean when a chat closes. Because the vector lookup engine resides alongside your local database, your system completely bypasses the token cost multiplication traps that destroy standard generative development workflows.',
    },

    {
      kind: 'quote',
      text:
        'A cloud machine rented for the cost of a few premium coffees, generating the sustained code output of a fully staffed DevOps and engineering squad—completely owned, isolated, and running entirely from your private disk storage.',
      cite: 'Fractera Core Infrastructure Team · June 2026',
    },

    {
      kind: 'p',
      text:
        'Ready to provision your private agent hosting substrate? Move to the deployment form below, paste your Ubuntu access parameters, and watch the multi-agent engine come up in real time, or inspect our deep [system architecture blueprints](/ai-workspace-architect) to audit the platform layout.',
    },
  ],
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