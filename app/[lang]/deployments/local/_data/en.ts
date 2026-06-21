import type { DeploymentsLocalBase } from './types'

// Base (required) English document, authored as blocks rendered by PostBody.
// Content is intentionally lean (this sub-step builds the reusable template, not
// final copy); the structure demonstrates every standard entity: callout, three
// H2 sections with two H3s each, a left-border quote, a deploy CTA, a document
// download (docref) and an FAQ.
export const en: DeploymentsLocalBase = {
  title: 'Local Agent Engineering: Edge Appliances for Private Data',
  seoTitle: 'Local Agent Engineering — The AI Company Brain on an Apple Silicon Appliance',
  subtitle:
    'One Apple Silicon appliance on your desk: a private LightRAG knowledge graph and a Hermes-orchestrated model team, running on premises with nothing leaving the building.',
  description:
    'Local agent engineering on a single Apple Silicon appliance — a Mac mini or Mac Studio that runs a private LightRAG knowledge graph and a Hermes-orchestrated team of subscription AI platforms, fully on premises.',
  keywords:
    'local agent engineering, apple silicon agent appliance, mac mini corporate brain private lightrag, knowledge graph, lightrag agent memory, lightrag persistent vector store, eliminate session amnesia tokens, edge ai appliance, on-prem ai server, hermes orchestration agent, nothing leaves the building',
  blocks: [
    {
      kind: 'callout',
      title: 'Did you know?',
      text:
        'The appliance runs around the clock on roughly the power of a household light bulb — about 30W — and never sends your knowledge graph or recordings to anyone else\'s cloud.',
    },
    {
      kind: 'p',
      text:
        'Local agent engineering means the compute, the data and the agents all sit in the same room as the people who use them. The same [Fractera](https://www.fractera.ai/) agent engineering infrastructure that deploys to a VPS comes up on a single Apple Silicon device, so you get a complete on-premises workspace rather than a bare workstation.',
    },

    { kind: 'h2', text: 'A private appliance on your own hardware' },
    { kind: 'h3', text: 'Apple Silicon, always on' },
    {
      kind: 'p',
      text:
        'The device is a Mac mini or Mac Studio that lives in your office and stays awake 24/7. No rack, no data center, no cloud account to renew — just a quiet box on a desk that hosts the whole stack.',
    },
    { kind: 'h3', text: 'Nothing leaves the building' },
    {
      kind: 'p',
      text:
        'Your documents, meetings and voice memos are ingested locally. Because the graph and every recording stay on the device, your institutional knowledge never leaves the premises and there are no Clerk, Supabase or Vercel dependencies in the loop.',
    },

    { kind: 'h2', text: 'Memory that keeps the thread' },
    { kind: 'h3', text: 'LightRAG as a shared knowledge graph' },
    {
      kind: 'p',
      text:
        'At the center is LightRAG — a Knowledge Graph RAG that is the shared long-term memory of the whole appliance. Every agent reads from and writes back to the same graph, so context compounds instead of resetting each session.',
    },
    { kind: 'h3', text: 'Lower token spend, no amnesia' },
    {
      kind: 'p',
      text:
        'Because the graph keeps the thread, an agent recalls exactly the right context instead of re-reading the whole project. That removes session amnesia and keeps token spend down even when you switch models mid-task.',
    },

    { kind: 'h2', text: 'A model team you orchestrate' },
    { kind: 'h3', text: 'Five subscription platforms' },
    {
      kind: 'p',
      text:
        'Claude Code, Codex, Gemini, Qwen and Kimi run on the appliance through your existing subscriptions — no per-token API bills for the heavy lifting. Hermes routes work between them and uses LightRAG as long-term memory.',
    },
    { kind: 'h3', text: 'Brief by voice, get results as links' },
    {
      kind: 'p',
      text:
        'You brief the appliance the way you would brief a colleague — by voice from Telegram — and results come back as a clean link you can open on a phone or put on the boardroom screen.',
    },

    {
      kind: 'quote',
      text:
        'One appliance, owned outright, doing the standing work of a small team — without forgetting and without leaking anything to someone else\'s cloud.',
      cite: 'Fractera product team',
    },

    {
      kind: 'cta',
      text: 'Choose your first deployment and bring your agent engineering infrastructure up today.',
      href: 'https://www.fractera.ai/en/deployments/mcp',
      label: 'Deploy with agent engineering infrastructure',
    },

    {
      kind: 'docref',
      title: 'Static-first rendering — the living standard',
      summary:
        'The full raw document on how Fractera pages are rendered statically and stay fast and AI-discoverable. Reference material while final copy for this page is written.',
      href: '/docs/static-first-rendering.md',
    },
  ],
  faq: [
    {
      q: 'What is local agent engineering on the AI Company Brain?',
      a: 'It is running a complete Fractera agent engineering infrastructure on a single Apple Silicon appliance (a Mac mini or Mac Studio) in your own office instead of on a remote VPS — a private LightRAG knowledge graph and a Hermes-orchestrated model team, all on premises.',
    },
    {
      q: 'Where is my company data stored, and does anything leave the building?',
      a: 'Everything stays on the device. Your documents, meetings and recordings are ingested into a private LightRAG knowledge graph that lives on the appliance and is never sent to anyone else\'s cloud.',
    },
    {
      q: 'How does the appliance reduce token cost and avoid session amnesia?',
      a: 'LightRAG is a shared Knowledge Graph RAG that every agent reads from and writes back to. Recalling exactly the right context instead of re-sending the whole project cuts token spend, and the graph keeps the thread when you switch models mid-task.',
    },
  ],
}
