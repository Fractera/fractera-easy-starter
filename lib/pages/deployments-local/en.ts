import type { DeploymentsLocalContent } from './types'

// Base (required) English document. The visual section (label..ctaButton) is the
// approved Company Brain copy moved off the homepage unchanged; SEO fields,
// details[] and faq[] are added on the move. Facts are grounded in CRUD-DOCS
// (LightRAG = shared Knowledge Graph RAG that keeps the thread across the five
// subscription platforms; no Clerk/Supabase/Vercel; full ownership of code/data).
export const en: DeploymentsLocalContent = {
  title: 'Local Agent Engineering: Edge Appliances for Private Data',
  seoTitle: 'Local Agent Engineering — The AI Company Brain on an Apple Silicon Appliance',
  description:
    'Local agent engineering on a single Apple Silicon appliance: a Mac mini or Mac Studio on your desk that runs a private LightRAG knowledge graph and a Hermes-orchestrated team of five subscription AI platforms — your corporate operating memory, on-premises, with nothing leaving the building.',
  summary:
    'A private, always-on agent engineering appliance: LightRAG memory plus a Hermes-orchestrated model team on Apple Silicon, configured by the Fractera founder for your business.',
  keywords:
    'local agent engineering, apple silicon agent appliance, mac mini corporate brain private lightrag, knowledge graph, lightrag agent memory, lightrag persistent vector store, eliminate session amnesia tokens, edge ai appliance, on-prem ai server, corporate operating memory, institutional knowledge graph, hermes orchestration agent, nothing leaves the building, no cloud api fees, b2b ai brain, founder consultation',

  label: 'Fractera AI Company Brain',
  h2: 'One Apple Silicon Appliance That Remembers Everything Your Team Has Ever Decided — And Acts On It',
  subhead:
    'For B2B leaders who watch their company knowledge walk out the door every time someone leaves, every time a new hire joins, every time a meeting recap gets lost. The AI Company Brain is a single Mac mini in your office that captures the operating memory of your business — decisions, processes, voices, projects — and lets a Hermes-powered agent act on it on demand.',
  imageAlt:
    'Fractera AI Company Brain — Apple Silicon appliance with a knowledge brain logo, set against a team of employees with a VS marker',
  intro:
    'Fractera AI Company Brain is a physical Apple Silicon device (Mac mini or Mac Studio), personally configured by the Fractera founder, that combines two things you cannot buy off the shelf: a private LightRAG knowledge graph that ingests your meetings, documents, voice memos, emails and Slack history into a structured corporate memory — and a Hermes orchestration agent that uses that memory to do real work for you. A single box that replaces what would otherwise be a small team — a junior analyst, a project manager, a research assistant, a knowledge-base curator — and does it without forgetting, without leaving, and without leaking a single document into someone else\'s cloud.',
  pillarsTitle: 'How the AI Company Brain replaces a small team',
  pillars: [
    {
      title: 'Captures the memory your team keeps losing',
      text:
        'LightRAG ingests every meeting recording, project doc, voice memo, customer email and decision log into a private knowledge graph. Names, dates, decisions, dependencies, "why we did it this way" — all linked, all queryable. When the founder asks "why did we kill that supplier last spring?" the Brain returns the meeting transcript, the email thread, and the deck — in seconds. No more Slack archaeology. No more "ask Anna, she remembers".',
    },
    {
      title: 'Acts on the memory — does not just store it',
      text:
        'Hermes uses the Brain as its long-term memory and routes work to five subscription-grade AI specialists (Claude Code, Codex, Gemini, Qwen, Kimi) running on the same device. Brief it by voice from Telegram: "draft this quarter\'s investor update using last quarter\'s deck and our latest cashflow", "answer this customer email in our usual tone", "build a one-pager for the new product using our 2024 brand guidelines". The Brain remembers your context; Hermes turns it into shipped work.',
    },
    {
      title: 'Returns finished work as a link, not a chat scrollback',
      text:
        'Every result comes back as a clean URL — a real document, a real deck, a real site, a real analysis. Open on your phone, project on the boardroom screen, forward to a teammate. This is the Iron Man moment: results, not prompt-engineering sessions. The Brain owns the institutional knowledge; Hermes owns the execution; you own the time saved.',
    },
    {
      title: 'Runs 24/7 on your desk — nothing leaves the building',
      text:
        'The device runs in your office on Apple Silicon, sips ~30W, and never sends your knowledge graph or recordings to anyone\'s cloud. Schedule recurring jobs ("every Monday at 8am summarize what the leadership team agreed last week and what needs my attention this week"), or fire one-off requests. The Brain is awake while you sleep — you wake up to finished links in Telegram.',
    },
  ],
  pricingLabel: 'Pricing & delivery',
  pricingBody:
    'By agreement — each AI Company Brain engagement is scoped individually because each business is different. Every package includes: founder-led memory audit (what knowledge your team is losing), the Apple Silicon device (Mac mini or Mac Studio), full LightRAG + Hermes + five-platform pre-installation tuned to your business, an initial ingestion of your existing meeting recordings / documents / Slack / email archive, hands-on training for you and your team, and 12 months of post-delivery support and process refinement. Year two and beyond — by separate agreement.',
  limitedLabel: 'Strictly limited capacity',
  limitedBody:
    'A small number of partner businesses per quarter. The depth of personal involvement by the Fractera founder is the value — and that requires bandwidth. If the next slot is full, we will tell you a realistic date.',
  assuranceTitle: 'Why we know this is exactly what you need',
  assuranceBody:
    'The AI Company Brain is the distilled life experience and business expertise of Fractera\'s founder. Dozens of personally shipped projects. Hundreds of allied companies. A thousand partners. And — most importantly — tens of thousands of hours of consulting, business development, and software engineering. Ready to amplify the memory and decision-making muscle of your business, and make it a sharper player in your niche. Just talk to us.',

  detailsTitle: 'Local agent engineering, in one box on your desk',
  details: [
    'The appliance is a single Apple Silicon machine — a Mac mini or a Mac Studio — that lives in your office and runs around the clock on roughly the power of a household light bulb. There is no rack, no data center, no cloud account to renew: local agent engineering means the compute, the data and the agents all sit in the same room as the people who use them. The same Fractera layer that deploys to a VPS deploys here, so the device comes up as a complete agent engineering infrastructure rather than a bare workstation.',
    'At the center is LightRAG — a Knowledge Graph RAG that is the shared long-term memory of the whole appliance, not a per-app cache. Every agent reads from and writes back to the same graph, so when you move a task between Claude Code, Codex, Gemini, Qwen and Kimi the thread is never lost and the model does not re-read your project from scratch. That is what removes session amnesia and keeps token spend down: the Brain recalls exactly the right context instead of re-sending everything. Because the graph and every recording stay on the device, none of this institutional knowledge leaves the building.',
    'It is built for B2B leaders who keep losing institutional knowledge to turnover, handovers and forgotten meeting recaps. You brief it the way you would brief a colleague — by voice from Telegram — and Hermes routes the work across the five subscription platforms that run on your existing logins, with no per-token API bills for the heavy lifting. Results come back as a link you can open on a phone or put on the boardroom screen. One appliance, owned outright, doing the standing work of a small team without forgetting and without leaking.',
  ],

  ctaTitle: 'Apply for a founder consultation',
  ctaBody:
    'Tell us about your business, the knowledge your team keeps losing, and what work you would hand to the Brain first if it were on your desk tomorrow. A short conversation with the Fractera founder is the first step — no commitment, no pitch deck, just a working session to see whether the AI Company Brain belongs in your office.',
  ctaButton: 'Email admin@fractera.ai',

  faq: [
    {
      q: 'What is local agent engineering on the AI Company Brain?',
      a: 'It is running a complete Fractera agent engineering infrastructure on a single Apple Silicon appliance (a Mac mini or Mac Studio) in your own office instead of on a remote VPS. The device hosts a private LightRAG knowledge graph and a Hermes orchestrator that drives five subscription AI coding platforms — so the compute, the data and the agents all stay on premises.',
    },
    {
      q: 'Where is my company data stored, and does anything leave the building?',
      a: 'Everything stays on the device. Your meetings, documents, voice memos and email archive are ingested into a private LightRAG knowledge graph that lives on the appliance, and the graph and recordings are never sent to anyone\'s cloud. There are no Clerk, Supabase or Vercel dependencies — you own the code and the data outright.',
    },
    {
      q: 'How does the Brain reduce token cost and avoid session amnesia?',
      a: 'LightRAG is a shared Knowledge Graph RAG that every agent reads from and writes back to. Recalling exactly the right context instead of re-sending the whole project cuts token spend, and because the graph keeps the thread you can switch between Claude Code, Codex, Gemini, Qwen and Kimi mid-task without the model re-reading everything from scratch.',
    },
    {
      q: 'How is the AI Company Brain priced and delivered?',
      a: 'By agreement — each engagement is scoped individually. A package includes a founder-led memory audit, the Apple Silicon device, full LightRAG + Hermes + five-platform pre-installation tuned to your business, an initial ingestion of your existing archive, hands-on training, and 12 months of support. Capacity is strictly limited per quarter because the founder is personally involved.',
    },
  ],
}
