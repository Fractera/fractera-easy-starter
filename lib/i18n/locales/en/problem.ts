import type { SiteContent } from '../../types'

type ProblemPart = Pick<SiteContent,
  | 'problemHeader' | 'problemLabel' | 'solutionLabel' | 'problemItems'
>

export const problem: ProblemPart = {
  problemHeader: {
    label: 'Why it matters',
    h2: 'The problems Fractera was built to solve',
    description: 'Modern development stacks are fragile, expensive, and forgetful. Here is what that costs you in practice.',
  },

  problemLabel: 'The problem',
  solutionLabel: 'How Fractera solves it',

  problemItems: [
    {
      id: 'cloud-costs',
      title: 'Unpredictable Cloud Costs',
      problem: "Auth, storage, database, email — each service bills separately and scales with traffic. What starts as free becomes a paid tier, and that tier isn't a flat $20/month — it scales with your users and their load. Miss one payment and your live product goes dark. Partners who switched to Fractera share this exact story more often than you'd expect.",
      solution: "Fractera runs everything your business needs — authentication, databases, media storage — on one server. One subscription, one bill. Cost does not scale with your users. If you pause your business, your data does not disappear. Back it up, store it, and restore when you're ready.",
    },
    {
      id: 'ai-context',
      title: 'AI Loses Context Every Session',
      problem: "Without persistent memory, every AI session starts from scratch. Tokens spent on 'where is the navbar?', 'what was the architecture decision?', or 'remind me how auth works here' are tokens not spent on your actual feature. Tasks that should take 2 focused messages take 15 back-and-forth exchanges.",
      solution: "Fractera includes LightRAG — a persistent vector store that remembers your entire codebase, every architectural decision, and your project's domain knowledge. Every AI message arrives with full context. Switching between Claude Code, Gemini CLI, or Codex doesn't mean losing the thread of your project.",
    },
    {
      id: 'product-gap',
      title: 'Products Need More Than Code',
      problem: "SEO, routing, multi-language support, auth flows, media handling — these aren't optional extras. They're what separates a toy project from a shipped product. Most developers stop at the code. Most product managers stop before it. The gap between idea and live product stays wide, and every week it stays wide costs real money.",
      solution: "Fractera ships with production-ready starters that include auth, database, file storage, and advanced routing pre-configured. The AI skips months of scaffolding and goes straight to your feature from day one. Community skill libraries help non-technical founders discover new approaches and ship faster.",
    },
    {
      id: 'failure-points',
      title: 'Too Many Single Points of Failure',
      problem: "Ten services means ten billing cycles, ten dashboards, ten places something can go wrong. When one service quietly expires, you often don't know which one caused the white screen. By the time you figure it out, the reputation damage is done. Running multiple projects multiplies every one of these risks.",
      solution: "Everything your application needs lives on your server, not spread across a dozen cloud dashboards. Your code stays on GitHub — recovery is always possible, even if dependencies have aged. Built-in AI systems can help rebuild the project even when some packages are outdated.",
    },
    {
      id: 'hardware',
      title: "Your Hardware Shouldn't Be the Limit",
      problem: "Active AI development — global memory, autonomous agents, five coding platforms running in parallel — can push your machine hard. If you're doing anything else at the same time, performance drops fast. Not everyone can afford a dedicated high-spec computer just for AI workflows.",
      solution: "With Fractera, your device carries zero load. All computation runs on your server. You can scale it up whenever your project demands — more cores, more RAM, more throughput. Works on a laptop, tablet, or phone. No reason to upgrade your hardware until you actually need to.",
    },
  ],
}
