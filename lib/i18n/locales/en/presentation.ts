import type { SiteContent } from '../../types'

type PresentationPart = Pick<SiteContent,
  | 'dpHeader' | 'dpLeft' | 'dpRight'
  | 'platformsHeader' | 'platformCards'
>

export const presentation: PresentationPart = {
  dpHeader: {
    label: 'Production AI Development',
    h2: 'Ship From Your Browser. Live in Seconds.',
    description:
      'Production AI Development is the next era of vibe coding — and it runs entirely in your browser from the very first second. No Visual Studio Code. No local environment to configure. No database to spin up. No domain to wire. No deployment pipeline to debug. You open a tab, your server is already live, your domain is already registered, your database is already running — and five AI coding platforms are waiting for your first voice command. This is not a tool for developers. This is the moment when anyone with an idea can build, ship, and scale a real product without ever leaving their browser.',
  },

  dpLeft: {
    imageSrc: '/ai-chat.png',
    title: 'AI Coding in Your Browser',
    description:
      'Open a tab, speak your intent, watch code appear. No IDE, no local setup. Five AI platforms work directly in your browser — terminals included.',
  },

  dpRight: {
    imageSrc: '/ai-web.png',
    title: 'Live in Production. Instantly.',
    description:
      'Your server launches in seconds. One click deploys your changes live. No CI pipeline, no hosting configuration — just ship.',
  },

  platformsHeader: {
    label: 'AI Platforms',
    h2: 'Five AI Platforms. One Environment.',
    description:
      'No API keys. No local setup. All five coding platforms run on your server with full terminal access and persistent memory.',
  },

  platformCards: [
    { title: 'Claude Code', subtitle: 'Writes, runs, and fixes code in your terminal. The gold standard for AI-assisted development.',  company: 'Anthropic' },
    { title: 'Codex',       subtitle: 'Browser-native coding agent. Full project context, no terminal required.',                        company: 'OpenAI'    },
    { title: 'Gemini CLI',  subtitle: 'Long-context AI coding. Understands your entire project structure at once.',                      company: 'Google'    },
    { title: 'Qwen Code',   subtitle: 'Open-source coding agent. No subscription lock-in, powerful and free.',                          company: 'Alibaba'   },
    { title: 'Kimi Code',   subtitle: 'Context-first AI for large codebases. Excellent for refactoring and architecture.',               company: 'Moonshot'  },
    { title: 'LightRAG',    subtitle: 'Your company brain. Persistent vector memory shared across all five AI platforms.',               company: 'Fractera'  },
  ],
}
