import type { SiteContent } from '../../types'

type CompanyBrainPart = Pick<SiteContent, 'companyBrain'>

export const companyBrain: CompanyBrainPart = {
  companyBrain: {
    label: 'Fractera AI Company Brain',
    h2: 'One Apple Silicon Appliance That Remembers Everything Your Team Has Ever Decided — And Acts On It',
    subhead:
      'For B2B leaders who watch their company knowledge walk out the door every time someone leaves, every time a new hire joins, every time a meeting recap gets lost. The AI Company Brain is a single Mac mini in your office that captures the operating memory of your business — decisions, processes, voices, projects — and lets a Hermes-powered agent act on it on demand.',
    imageAlt: 'Fractera AI Company Brain — Apple Silicon appliance with a knowledge brain logo, set against a team of employees with a VS marker',
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
    ctaTitle: 'Apply for a founder consultation',
    ctaBody:
      'Tell us about your business, the knowledge your team keeps losing, and what work you would hand to the Brain first if it were on your desk tomorrow. A short conversation with the Fractera founder is the first step — no commitment, no pitch deck, just a working session to see whether the AI Company Brain belongs in your office.',
    ctaButton: 'Email admin@fractera.ai',
  },
}
