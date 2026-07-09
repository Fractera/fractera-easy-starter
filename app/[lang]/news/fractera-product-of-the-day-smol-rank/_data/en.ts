import type { NewsArticleBase } from '../../_lib/types'

export const en: NewsArticleBase = {
  title: 'Fractera Is Product of the Day: Top 2 Daily Winner on Smol Rank',
  seoTitle: 'Fractera Wins Product of the Day (Top 2 Daily Winner) on Smol Rank',
  subtitle:
    'A small, happy milestone: our one-click private AI stack landed the Top 2 Daily Winner badge on Smol Rank — thank you to everyone who upvoted',
  description:
    'Fractera, the agentic engineering platform, was ranked Top 2 Daily Winner and named Product of the Day on Smol Rank (launched 2026-07-08). A short thank-you note, the facts of the listing, and where to dig deeper into the platform that got there.',
  summary:
    'Fractera earned the "Top 2 Daily Winner" / Product of the Day badge on Smol Rank — a short celebratory note with the listing facts and links to go deeper.',
  keywords:
    'Fractera, agentic engineering platform, Product of the Day, Smol Rank, Top 2 Daily Winner, AI developer tools, one-click private AI stack, self-hosted AI workspace',
  blocks: [
    {
      kind: 'quote',
      text: 'Fractera is an [Agentic Engineering Infrastructure](/en) — an agentic engineering platform where AI agents build your software on your own server. Today it picked up a small badge we are genuinely happy about: **Product of the Day**.',
      cite: 'The Fractera team',
    },
    {
      kind: 'p',
      text: 'On **2026-07-08** Fractera launched on **[Smol Rank](https://smolrank.com/projects/fractera)** and closed the day as a **Top 2 Daily Winner** — earning the **"Smol Rank Top 2 Daily Winner"** badge and the **Product of the Day** rank. It is a small ranking, and that is exactly why it is nice: real people saw the project, tried it, and pushed it to the top of the board. Thank you.',
    },
    {
      kind: 'callout',
      title: 'Did you know?',
      text: 'This news post is not just an announcement — on a live Fractera workspace, every update in the news feed is embedded into the on-server LightRAG graph memory the moment it ships, so the platform can search and reason over its own history in real time.',
    },
    {
      kind: 'h2',
      text: 'What the Award Recognizes About an Agentic Engineering Platform',
    },
    {
      kind: 'p',
      text: 'The listing described Fractera in one line: **"One-Click Private AI Stack on your VPS. Deployed with a pre-built 50k-line Next.js Aircraft Carrier (or any repo) & Zero-Agent Design System."** That is the whole idea in a sentence — you point the platform at your own server, and a complete AI coding workspace comes up in minutes. The pre-built framework it ships is the [Next.js Aircraft Carrier](https://www.fractera.ai/next-aircraft-carrier): 50,000 lines of parallel routing, i18n and SEO that exist the moment you deploy, so an AI agent rotates ready-made sections instead of regenerating files.',
    },
    {
      kind: 'list',
      items: [
        '**Launched:** 2026-07-08 · **Platform:** Web · **Pricing:** Free.',
        '**Badge:** Smol Rank Top 2 Daily Winner — Product of the Day.',
        '**Categories:** Artificial Intelligence, Developer Tools.',
        '**Tech stack tags:** Hermes, NGINX, Next.js, Coding agent.',
        '**Community signal:** 5 upvotes on the day. Publisher: Iuliia Kovalchuk.',
      ],
    },
    {
      kind: 'h2',
      text: 'Where to Look Next If the Ranking Brought You Here',
    },
    {
      kind: 'p',
      text: 'If you found us through the ranking, welcome. The self-hosted AI workspace behind the badge is worth a closer look: see how a single request becomes tested, deployed, recorded code in the [autonomous development loop](https://www.fractera.ai/ai-development-loop), or read why we moved the core to [Open Code](https://www.fractera.ai/en/news/open-code-license-agentic-engineering) so you can copy, audit and self-host everything. The whole thing runs on your VPS — your code, your data, your database.',
    },
    {
      kind: 'docref',
      title: 'content-engine.md — the Zero-Agent Design System behind the listing',
      summary: 'The Smol Rank tagline calls out our "Zero-Agent Design System." This is the raw document behind it: one self-contained, auto-discovered, statically-rendered content shape that doubles as a design system you change once and see everywhere — the machinery an AI agent uses to build pages without regenerating code.',
      href: '/docs/content-engine-en.md',
    },
    {
      kind: 'cta',
      text: 'Deploy your own private AI coding workspace on your VPS — choose your framework and get started in minutes.',
      href: 'https://www.fractera.ai/',
      label: 'Deploy with AI',
    },
    {
      kind: 'founder',
      text: 'Awards are never the point — shipping is. But I will not pretend a "Product of the Day" badge does not put a smile on the whole team\'s face. What it really means to me is that someone outside our own heads looked at a private, self-hosted AI stack and thought: yes, this should exist. So thank you for the upvotes. Now back to building — the best version of Fractera is always the next deploy.',
    },
  ],
  faq: [
    {
      q: 'What award did Fractera win on Smol Rank?',
      a: 'Fractera was ranked Top 2 Daily Winner and named Product of the Day on Smol Rank, earning the "Smol Rank Top 2 Daily Winner" badge. It launched on the platform on 2026-07-08 (Web, free) in the Artificial Intelligence and Developer Tools categories, with 5 upvotes on the day.',
    },
    {
      q: 'What is Fractera in one sentence?',
      a: 'Fractera is an agentic engineering platform: a one-click private AI stack that deploys a complete AI coding workspace onto your own VPS, shipping a pre-built 50,000-line Next.js framework (the "Aircraft Carrier") and a Zero-Agent Design System so AI agents build your software without regenerating code.',
    },
    {
      q: 'Where can I try Fractera after seeing the ranking?',
      a: 'You can deploy your own workspace from the Fractera home page — it installs onto a Linux VPS you own and comes up in minutes. From there, explore the autonomous development loop, the Next.js Aircraft Carrier and the Open Code license to understand what runs on your server.',
    },
  ],
}
