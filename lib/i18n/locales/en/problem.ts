import type { SiteContent } from '../../types'

type ProblemPart = Pick<SiteContent,
  | 'problemHeader' | 'problemLabel' | 'solutionLabel' | 'problemItems'
>

export const problem: ProblemPart = {
  problemHeader: {
    label: 'Why it matters',
    h2: 'The Hidden Costs of Fragmented AI Stacks',
    description: 'Modern AI development stacks are fragile, expensive, and forgetful. Here is what that costs you in practice.',
  },

  problemLabel: 'The problem',
  solutionLabel: 'How Fractera solves it',

  problemItems: [
    {
      id: 'cloud-costs',
      title: 'Unpredictable Cloud Costs',
      problem: 'Auth, storage, database, email — each service bills separately and scales with traffic. Free becomes paid, paid scales with load. Miss one payment and your live product goes dark.',
      solution: 'Fractera runs auth, databases, and storage on one server. One subscription, one bill. Cost does not scale with your users. Pause the business — your data stays safe.',
    },
    {
      id: 'ai-context',
      title: 'AI Loses Context Every Session',
      problem: 'Without persistent memory, every session starts from scratch. Tokens spent on "where is the navbar?" are tokens not spent on your feature. Two messages become fifteen.',
      solution: 'Fractera includes LightRAG — a persistent vector store that remembers your codebase and every architectural decision. Switch between Claude Code, Gemini CLI, or Codex without losing the thread.',
    },
    {
      id: 'failure-points',
      title: 'Too Many Single Points of Failure',
      problem: 'Ten services mean ten billing cycles, ten dashboards, ten places something can break. One service quietly expires — you do not know which one caused the white screen.',
      solution: 'Everything your application needs lives on one server. Code stays on GitHub — recovery is always possible. Built-in AI assistants can rebuild the project even with outdated packages.',
    },
    {
      id: 'hardware',
      title: 'Your Hardware Limits Your Output',
      problem: 'Persistent memory, autonomous agents, five platforms in parallel — it pushes your machine hard. Performance drops the moment you open another tab. Not everyone has a dedicated GPU workstation.',
      solution: 'With Fractera your device carries zero load. All computation runs on your VPS. Scale cores and RAM when needed. Works on a laptop, tablet, or phone.',
    },
    {
      id: 'data-ownership',
      title: 'Your Data on Their Servers',
      problem: 'Host on Vercel, store in Supabase, authenticate via Clerk — your business data sits on their infrastructure. One pricing change or one outage and your product goes down.',
      solution: 'Fractera moves auth, database, storage, and AI memory to a server you own. No third-party access to your data. No dependency on their uptime, their pricing, or their terms.',
    },
  ],
}
