import type { SiteContent } from '../../types'

type BlackBoxPart = Pick<SiteContent, 'blackBox'>

export const blackBox: BlackBoxPart = {
  blackBox: {
    label: 'Fractera Black Box',
    h2: 'Your Private Hermes AI Agent on an Apple Silicon Appliance — Run by Voice from Telegram, Delivered as a Web Page',
    subhead:
      'For B2B leaders who want an AI executive assistant, not another chat window. Hermes lives on a Mac mini or Mac Studio in your office, you brief it from your phone, it ships finished work back as a link you can open on any screen.',
    imageAlt: 'Fractera Black Box — Mac mini AI appliance running the Hermes agent',
    intro:
      'Fractera Black Box is a Hermes-powered AI orchestrator, shipped as a physical Apple Silicon appliance (Mac mini or Mac Studio) and configured personally by the Fractera founder. Hermes is the agent at the centre: it understands intent, plans the work, delegates to the best specialist AI for each step, and ships back a finished result — an analysis, a deck, a website, an app, an email reply — as a link you open from any device. Nothing leaves your office. Nothing lives in someone else\'s cloud.',
    pillarsTitle: 'How it actually works in your day',
    pillars: [
      {
        title: 'Brief it from Telegram, by voice',
        text:
          'Open Telegram on your phone, hit record, speak the task: "analyze our Q3 cashflow", "find Series-A investors active in our sector", "parse the pricing pages of these 10 competitors", "reply to today\'s investor emails in my tone", "turn yesterday\'s voice memos into a strategy deck", "build a one-page site for the new product". Hermes hears you and gets to work.',
      },
      {
        title: 'Answers come back as a web page, not a wall of text',
        text:
          'Hermes ships every result as a clean URL — public or password-protected. Open it on your phone in the car, project it on the boardroom screen at the start of the meeting. This is the Iron Man moment: results, not chat scrollback. A deck is a real deck. A site is a real site. An analysis is a real document. You share the link, your team opens it.',
      },
      {
        title: 'Runs on demand or on schedule, 24/7 in your office',
        text:
          'Throw a single ad-hoc task at it, or set recurring jobs: "every Monday at 8 a.m., summarize last week\'s emails and highlight what needs my attention", "every quarter end, refresh the competitor pricing report", "every evening, draft replies to anything an investor sent today". The device works while you sleep — you wake up to finished links in Telegram.',
      },
      {
        title: 'Five AI platforms work behind the curtain',
        text:
          'Hermes routes each piece of work to the best available specialist — Claude Code for engineering, Codex for general agentic work, Gemini for long-context analysis, Qwen and Kimi for cost-effective bulk passes, and LightRAG as your company\'s persistent memory. You never touch them directly. You speak to Hermes; Hermes decides who does what.',
      },
    ],
    pricingLabel: 'Pricing & delivery',
    pricingBody:
      'By agreement — each Black Box engagement is scoped individually because each business is different. Every package includes: founder-led process audit, the Apple Silicon device (Mac mini or Mac Studio), full Hermes + LightRAG + five-platform pre-installation tuned to your business, hands-on training for you and your team, and 12 months of post-delivery support, updates and process refinement. Year two and beyond — by separate agreement.',
    limitedLabel: 'Strictly limited capacity',
    limitedBody:
      'A small number of partner businesses per quarter. The depth of personal involvement by the Fractera founder is the value — and that requires bandwidth. If the next slot is full, we will tell you a realistic date.',
    ctaTitle: 'Apply for a founder consultation',
    ctaBody:
      'Tell us about your business, the current AI stack you use (if any), and what work you would hand to Hermes first if it were on your desk tomorrow. A short conversation with the Fractera founder is the first step — no commitment, no pitch deck, just a working session to see whether Black Box belongs in your office.',
    ctaButton: 'Email admin@fractera.ai',
  },
}
