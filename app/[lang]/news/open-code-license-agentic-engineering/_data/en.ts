import type { NewsArticleBase } from '../../_lib/types'

// English base article. Voice: light, human, for a reader who just wants to know
// "what is Fractera changing and why?". The RU override ships the full Russian
// version. SEO: open code license, agentic engineering, source-available.
export const en: NewsArticleBase = {
  title: 'Fractera Moves to Open Code: a License That Protects the Idea, Not the Walls',
  seoTitle: 'Fractera Goes Open Code — a Source-Available License for Agentic Engineering',
  subtitle:
    'We are leaving MIT for Open Code — a source-available license that stays free for individuals and small businesses, and asks only large corporations to license commercial use. The reason: tomorrow brings a breakthrough we have to protect.',
  description:
    'Fractera is moving its core from MIT to Open Code (the PolyForm Small Business license): free to copy, change and use commercially for everyone except large corporations. Here is why we are doing it, what changes for you (almost nothing), and what is coming next.',
  summary:
    'Why Fractera is switching from MIT to Open Code: free for individuals and small businesses, a commercial license only for large corporations — a deliberate move to protect the idea ahead of a major release.',
  keywords:
    'open code, source-available license, PolyForm Small Business, agentic engineering, self-hosted, MIT alternative, fair source, self-replicating agents',
  faq: [
    {
      q: 'Is Fractera still free for me?',
      a: 'Almost certainly yes. The core is free to copy, change and use commercially for individuals and small businesses — companies with fewer than 100 people and under one million dollars of annual revenue. If that describes you, nothing changes: fork it, ship products, run a business on it.',
    },
    {
      q: 'Who actually has to pay now?',
      a: 'Only large corporations above that size threshold. They need a separate commercial license to use the core for their company. Everyone else keeps the same freedoms they had under MIT.',
    },
    {
      q: 'Is this still open source?',
      a: 'The honest answer: it is source-available, which we call Open Code — every line stays public to read, audit, fork and self-host. It is not "open source" in the strict OSI sense, because OSI forbids any restriction on who may use the software, and we do restrict large corporations. We would rather be accurate than borrow a label we no longer fit.',
    },
    {
      q: 'Do the ready-made starters change too?',
      a: 'No. The starter templates (like the Next.js starter) stay under the permissive MIT license, so the door to building on Fractera stays as wide as ever. Only the core infrastructure moves to Open Code.',
    },
  ],
  blocks: [
    {
      kind: 'quote',
      text: 'A license cannot protect an idea — only a patent can do that, and a patent means publishing the idea to the world. So this is not about hiding anything. It is about who gets to profit from what comes next.',
    },
    {
      kind: 'p',
      text: 'Fractera is an [Agentic Engineering Infrastructure](/en): a self-hosted workspace where AI agents write, run and ship your software on your own server. Today we are changing one thing that sits underneath all of it — the license. We are leaving MIT and moving the core to what we call **Open Code**. The freedoms you are used to stay almost entirely intact; the one new boundary is aimed squarely at large corporations. This post explains the move plainly: what it is, what changes for you, and why we are doing it now.',
    },

    {
      kind: 'h2',
      text: 'Why an agentic engineering platform needs more than a permissive license',
    },
    {
      kind: 'p',
      text: 'MIT is the most generous license there is: do anything, no strings. That generosity was the right call while Fractera was finding its feet. But a permissive license has a known edge case — a large, well-funded company can take the entire project, wrap it in their own brand, and resell it at scale without giving anything back. For most projects that risk is theoretical. For what Fractera is about to ship, it is not.',
    },

    {
      kind: 'h2',
      text: 'From MIT to Open Code: protecting the idea, not the walls',
    },
    {
      kind: 'p',
      text: 'The new license is **PolyForm Small Business** — a clean, off-the-shelf, lawyer-drafted license. The principle is simple and human: you may copy, modify and use Fractera commercially for free, with a single exception — large corporations. The cut is made by company size, which is the closest thing there is to the everyday meaning of the word "corporation".',
    },
    {
      kind: 'h3',
      text: 'What changes for you — almost nothing',
    },
    {
      kind: 'p',
      text: 'If you are an individual, a freelancer, a startup or a small business — defined as fewer than 100 people **and** under one million dollars in annual revenue — you keep every freedom you had under MIT. Fork the code, change it, self-host it, build products for yourself or for clients, run a consulting business on top of it. Free, forever, no permission needed.',
    },
    {
      kind: 'h3',
      text: 'What changes for large corporations',
    },
    {
      kind: 'p',
      text: 'A company above that threshold now needs a separate commercial license to use the core for its own benefit. That is the whole boundary. It does not lock the code away — every line stays public and auditable — it simply asks the largest players to come to the table before they build a business on the work.',
    },
    {
      kind: 'callout',
      title: 'The boundary in one line',
      text: 'Free to copy, change and use commercially — for everyone except large corporations, who need a commercial license. The code stays fully open to read, audit and self-host.',
    },

    {
      kind: 'h2',
      text: 'Why we do not call it "open source"',
    },
    {
      kind: 'p',
      text: 'This matters, and we want to be straight about it. "Open source" is not just a vibe — it is a defined term, and its definition forbids discriminating against any person, group or field of use. Because Open Code does restrict large corporations, it is — by that strict definition — **not** open source; it is **source-available**. Calling it open source would be inaccurate, and the developer community rightly pushes back on projects that blur that line. So we use a precise, honest name instead: **Open Code**. Everything stays open to read, fork and self-host — with one clearly stated commercial boundary.',
    },

    {
      kind: 'h2',
      text: 'Choosing your enemy: the strategy behind the license',
    },
    {
      kind: 'quote',
      text: 'Understanding the competition defines the choice of marketing strategy. You cannot become big simply because you do something well. You can only become big by defeating someone. How big you become depends on how big an enemy you choose.',
      cite: 'Roma Armstrong, founder & CTO of Fractera',
    },
    {
      kind: 'p',
      text: 'That is the thinking behind this license. By keeping Fractera free for everyone except the giants, we draw a clear line about who we are building for — independent builders and small teams — and who has to play by different rules. It is a deliberate position, not an accident of paperwork.',
    },

    {
      kind: 'h2',
      text: 'What comes next: self-replicating coding agents',
    },
    {
      kind: 'p',
      text: 'Here is the part we will tell in full once the license is live. Tomorrow Fractera begins revealing the technology behind **self-replicating MCP coding agents** — an approach that pushes development speed up by several orders of magnitude, so that projects which used to take months can be built for a few percent of the effort. That is the breakthrough this license exists to protect. If you want to see where this is going, the foundations are already in the [multi-agent workspace architecture](/en/documentation/multi-agent-workspace-architecture) and the recent work on [safe static generation by an AI agent](/en/news/static-safe-app-config-by-ai).',
    },

    {
      kind: 'founder',
      text: 'This is exactly why I hope the community will understand me — I am trying to protect myself from that kind of activity. I am releasing this license and announcing it in this post so that, as soon as tomorrow, the new technical solutions coming to Fractera will let you build, for just a few percent of the effort, projects that used to take months. Stay in touch, and see you at near-light-speed development.',
    },

    {
      kind: 'docref',
      title: 'open-code-license.md — what Open Code is and why',
      summary:
        'The short reference for Fractera’s license model: Open Code (PolyForm Small Business) for the core, MIT for the starters, the small-business threshold, and the commercial-license contact for larger companies.',
      href: '/docs/open-code-license.md',
    },
    {
      kind: 'cta',
      text: 'Deploy your own Fractera workspace — Open Code, free for individuals and small businesses, yours on your own server.',
      href: 'https://www.fractera.ai/',
      label: 'Deploy with AI',
    },
  ],
}
