import type { SiteContent } from '../../types'

type PresentationPart = Pick<SiteContent,
  | 'dpHeader' | 'dpLeft' | 'dpRight'
  | 'platformsHeader' | 'platformCards'
>

export const presentation: PresentationPart = {
  dpHeader: {
    label: 'Production AI Development',
    h2: 'Production AI Coding: Hermes + LightRAG + 5 Platforms',
    description:
      'Production AI development happens entirely in your browser, from the first second. No VS Code. No local environment to configure. No database to spin up. No domain to wire. No deployment pipeline to debug. You open a tab — your server is already live, your domain is already registered, your database is already running, and five AI coding platforms wait for your first voice command. This is not just a tool for developers — this is the moment anyone with an idea can build, ship, and scale a real product without leaving the browser.',
  },

  dpLeft: {
    imageSrc: '/ai-chat.png',
    title: 'AI Coding in Browser',
    description:
      'Open a tab, speak your intent, watch code appear. No IDE, no local setup. Five AI platforms run directly in your browser — terminals included.',
  },

  dpRight: {
    imageSrc: '/ai-web.png',
    title: 'Live in Production. Instantly.',
    description:
      'Your server launches in seconds. One click deploys your changes live. No CI pipeline, no hosting configuration — just ship.',
  },

  platformsHeader: {
    label: 'AI Platforms',
    h2: 'Core AI Generation Engine: Five Platforms, One Environment',
    description:
      'No API keys. No local setup. All five coding platforms run on your server with full terminal access and persistent LightRAG memory.',
    disclaimer: '* The project runs on your own subscriptions to the AI platforms — Fractera does not charge any additional fees or commissions for their use. You are free to connect one, several, or all five platforms — at your own discretion.',
  },

  platformCards: [
    { title: 'Claude Code', subtitle: 'Writes, runs, and fixes code in your terminal. The gold standard for AI-assisted development workflows.',  company: 'Anthropic' },
    { title: 'Codex',       subtitle: 'Browser-native AI coding agent. Full project context, no terminal required.',                              company: 'OpenAI'    },
    { title: 'Gemini CLI',  subtitle: 'Long-context AI coding. Understands your entire project structure in one prompt.',                         company: 'Google'    },
    { title: 'Qwen Code',   subtitle: 'Open-source coding agent. No subscription lock-in — powerful and free.',                                  company: 'Alibaba'   },
    { title: 'Kimi Code',   subtitle: 'Context-first AI for large codebases. Excellent for refactoring and architecture work.',                   company: 'Moonshot'  },
    { title: 'LightRAG',    subtitle: 'Your company brain. Persistent vector memory shared across all five AI platforms.',                        company: 'Fractera'  },
  ],
}
