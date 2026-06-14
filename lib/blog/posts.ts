// Single source of truth for the Fractera blog (EN only, curated — same precedent
// as /mcp-info, /ai-workspace-architect and /ai-development-loop). Posts are real
// data here; the /blog index and /blog/<slug> page read from this file, and the
// blog is intentionally English-only. Inline markup inside text fields supports
// **bold** and [label](url); blocks add headings, quotes, lists, figures and CTAs.

export type BlogAuthor = { name: string; role: string; avatar?: string }

export type BlogBlock =
  | { kind: 'p'; text: string }
  | { kind: 'h2'; text: string }
  | { kind: 'h3'; text: string }
  | { kind: 'quote'; text: string; cite?: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'olist'; items: string[] }
  | { kind: 'figure'; media: 'image' | 'video'; src: string; alt: string; caption?: string; href?: string }
  | { kind: 'cta'; text: string; href: string; label: string }
  | { kind: 'note'; text: string }

export type BlogPost = {
  slug: string
  title: string
  subtitle: string
  description: string
  excerpt: string
  date: string
  readingMinutes: number
  tags: string[]
  author: BlogAuthor
  heroVideo: string
  ogImage: string
  blocks: BlogBlock[]
}

const POSTS: BlogPost[] = [
  {
    slug: 'the-end-of-prompt-engineering',
    title: 'Prompt Engineering Is Over. The Head of Claude Code Just Named What Comes Next.',
    subtitle:
      'Boris Cherny, who leads Claude Code at Anthropic, says he no longer writes prompts — he writes loops. Here is why that single sentence is a tectonic shift, and how we built it into a production system.',
    description:
      'Boris Cherny, the lead of Claude Code at Anthropic, says he no longer writes prompts for Claude — he writes loops that prompt Claude. Inside the shift from prompt engineering to loop engineering, why verification is the whole game, and how Fractera runs the same agentic loop in production with multi-agent orchestration and LightRAG memory.',
    excerpt:
      'The lead of Claude Code at Anthropic says he stopped writing prompts and started writing loops. That one sentence ends the prompt-engineering era — and it is exactly the architecture we have spent a year building.',
    date: '2026-06-14',
    readingMinutes: 6,
    tags: ['AI engineering', 'Agentic workflows', 'Loop engineering'],
    author: { name: 'The Fractera Team', role: 'Fractera.ai' },
    heroVideo: '/blog-media/boris-chernoy-post-1.mp4',
    ogImage: 'https://www.fractera.ai/Fractera-Development-Loop.jpg',
    blocks: [
      {
        kind: 'p',
        text: 'A few days ago **Boris Cherny** — who leads engineering on **Claude Code**, Anthropic’s flagship coding agent — said something that quietly splits the history of working with AI into a *before* and an *after*.',
      },
      {
        kind: 'quote',
        text: 'I don’t write prompts for Claude anymore. I have loops running that prompt Claude and figure out what to do. My job is to write the loops.',
        cite: 'Boris Cherny · Claude Code, Anthropic',
      },
      {
        kind: 'p',
        text: 'Sit with that for a second. The person steering one of the most capable coding models on earth is telling you that **hand-driving the model no longer scales** — and that the real work has moved somewhere else entirely.',
      },
      { kind: 'h2', text: 'The bottleneck was always you' },
      {
        kind: 'p',
        text: 'For two years the industry has been obsessed with **prompt engineering**. We treated the model like a brilliant junior: hand it a task, wait for the answer, spot the mistakes, write another prompt to fix them. In that arrangement **you are the bottleneck** — the slow, human part in the middle of every iteration.',
      },
      {
        kind: 'p',
        text: 'It is micromanagement, and micromanagement does not scale. You burn hours holding context in your head and steering the model by hand, one correction at a time. Fast at the start, exhausting at depth, and impossible to run while you sleep.',
      },
      { kind: 'h2', text: 'What loop engineering actually is' },
      {
        kind: 'p',
        text: 'Loop engineering flips the relationship. Instead of asking the model questions, you **design the environment it runs inside** — a loop where it talks to itself, to your tools, and to the results, until the job is genuinely done.',
      },
      {
        kind: 'olist',
        items: [
          '**You set the goal**, not the steps — for example, "build this component and get test coverage above 95%."',
          '**The model acts** — it writes the code.',
          '**The environment checks it** — the compiler, the tests and the linters run automatically and hand the results straight back.',
          '**The model corrects itself** — it reads the failing logs, writes its own next prompt ("fix the segfault on line 42"), rewrites the code, and runs the check again.',
        ],
      },
      {
        kind: 'p',
        text: 'The loop closes and repeats until the success criterion is met. You never typed a follow-up. You built the track; the model ran the laps.',
      },
      { kind: 'h2', text: 'Verification is the whole game' },
      {
        kind: 'p',
        text: 'Here is the part most people miss. The hard part of a loop is **not** generating code — models are already excellent at that. The hard part is the **criterion that judges it**. A loop is only ever as good as its verifier.',
      },
      {
        kind: 'p',
        text: 'Give it strong, automated checks — real tests, static analysis, a compiler that has to pass — and the model converges on something that actually works. Give it a weak verifier and the very same loop will happily generate an infinite stream of confident, hallucinated garbage. **The skill of the future is designing the checks**, not the prompts.',
      },
      { kind: 'h2', text: 'Autonomy, not assistance' },
      {
        kind: 'p',
        text: 'Earlier tools — basic autocomplete, inline copilots — made you **faster at writing code**. A loop is a different species. It turns the model from a smart text editor into an **autonomous teammate** you delegate a whole task to: "go do this, come back when it is done."',
      },
      { kind: 'h2', text: 'The new technical debt' },
      {
        kind: 'p',
        text: 'It is not free, and two new costs arrive with the loops. The first is **comprehension debt** — when an agent writes and rewrites code hundreds of times behind the scenes, the human’s grasp of that code quietly erodes. The second is **token cost** — a loop can spend a lot of compute to chase down one stubborn bug. The engineer of the future has to treat **compute spend versus result quality** as a first-class design decision, not an afterthought.',
      },
      { kind: 'h2', text: 'How we built this outside Anthropic’s labs' },
      {
        kind: 'p',
        text: 'Cherny’s view is a glimpse from inside a closed lab. The obvious question is how you run that paradigm **in production, on infrastructure you own** — not only inside Anthropic. That is exactly the architecture we have spent the last year building.',
      },
      {
        kind: 'figure',
        media: 'image',
        src: 'https://www.fractera.ai/Fractera-Development-Loop.jpg',
        alt: 'Fractera Development Loop diagram — one admin request flows through Hermes, a coding agent and LightRAG memory to tested, deployed code',
        caption: 'The Fractera Development Loop — the same idea, wired into a whole workspace. [Read the full anatomy](/ai-development-loop).',
        href: '/ai-development-loop',
      },
      {
        kind: 'p',
        text: 'The diagram above is how the loop lives in the core of **Fractera**. We did not just recreate Cherny’s idea — we extended it from a single self-correcting model into a **production-ready, multi-agent loop**.',
      },
      {
        kind: 'list',
        items: [
          '**Orchestrator (Hermes).** It takes the high-level goal and picks the best agent for it — Claude Code, Codex, Gemini and more — instead of looping a single model forever.',
          '**Shared memory (LightRAG).** The classic failure of long AI loops is context loss over distance. A Knowledge Graph memory means the agent does not just patch the last error — it builds on everything it knows about the project, its architecture and its conventions.',
          '**A closed self-correction loop.** The system writes, deploys, tests, reads the logs, prompts itself, and rewrites — until the change passes. The same loop Cherny describes, running across a whole workspace you own.',
        ],
      },
      {
        kind: 'p',
        text: 'Boris Cherny is right: the skill that matters now is **designing systems where the AI talks to itself**. The era of the chat box is ending; the era of autonomous agents and looping architectures has already started.',
      },
      {
        kind: 'cta',
        text: 'Want the technical anatomy — the routes, the memory, and the build-and-correct cycle, in plain engineering language?',
        href: '/ai-development-loop',
        label: 'Read the anatomy of an autonomous AI loop',
      },
      {
        kind: 'p',
        text: 'So here is the real question. Have you started moving from prompts to loops yet — or are you still hunting for the magic words in a chat window?',
      },
      {
        kind: 'note',
        text: 'Source: a widely shared LinkedIn post by Guillermo Flor surfacing Boris Cherny’s remarks. The quote is reproduced as it circulated; the architecture and the analysis are Fractera’s own.',
      },
    ],
  },
]

export function getAllPosts(): BlogPost[] {
  return [...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find(p => p.slug === slug)
}

export function getPostSlugs(): string[] {
  return POSTS.map(p => p.slug)
}
