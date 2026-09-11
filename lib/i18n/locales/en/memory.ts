import type { MemoryPageContent } from '../../types'

// Страница «Память» — английская ветка словаря, полная база.
//
// Контент перенесён с корневой страницы службы памяти (memory.aifa.dev) по
// прямой просьбе владельца 2026-09-11. Переносится СОДЕРЖАНИЕ; структура,
// компоненты и токены дизайна той службы сюда не едут — у витрины свои.
export const memory: MemoryPageContent = {
  hero: {
    eyebrow: 'Fractera Memory Starter',
    title: 'The deterministic, multimodal, self-evolving memory engine for autonomous AI agents',
    lead:
      "An autonomous, self-hosted long-term memory engine and the cognitive core for AI agents. Built to work as the architect's personal command centre through Telegram and a unified REST API, it closes the gap between a volatile context window and real cognitive continuity.",
    body:
      'The engine ingests raw, unstructured real-world input — text, images, voice notes, whole PDF documents, video, precise spatial-temporal coordinates and dates — and turns it into an indexed knowledge graph and structured relational stores, without unnecessary model calls and without per-request token costs.',
    badges: ['Zero per-request fees', 'Zero vendor lock-in', 'Full privacy on your server'],
  },
  problem: {
    title: "The architect's operating system",
    lead:
      'Standard RAG pipelines and vector stores make agents lose critical context at every session reset, burn compute re-reading long logs, and never synthesise personal experience over time.',
    body:
      'Fractera Memory works as a black box engine: in go multimodal input and runtime context parameters, out come structured objects, synthesised data, verified conclusions or actionable reports. One architecture unifies four storage layers under a deterministic multi-level router.',
  },
  router: {
    title: 'How a request travels',
    lead: 'One entry point, one router, two very different costs behind it.',
    inbox: 'Incoming stream — text, geolocation, voice, images, PDF, video, dates',
    routerBox: 'Deterministic multi-level router',
    cheapBranch: 'Levels 1–3 · direct database and graph traversal',
    cheapCost: 'Zero tokens, no model, sub-10 ms',
    deepBranch: 'Levels 4–5 · vector search and deep reasoning',
    deepCost: 'A model turn: hypothesis chains and reports',
  },
  schema: {
    title: 'End-to-end schema adaptability',
    body:
      'No manual migrations, no static schema design. The engine adapts its schema on the fly — adding columns, and generating fully typed relational SQL tables whenever new structured entities and relationships appear.',
  },
  ladder: {
    title: 'Cost-first architecture: the cost ladder',
    lead:
      'Every request is resolved with the minimum compute that can answer it. A query escalates only when the cheaper, deterministic tiers fail to produce a complete answer.',
    head: { level: 'Level', how: 'Retrieval mechanism', cost: 'Cost and purpose', by: 'Opened by' },
    rows: [
      {
        level: 'Level 1',
        how: 'Direct SQL / key-value query, no model',
        cost: '$0 / 0 tokens. Sub-10 ms latency. Exact factual properties.',
        by: 'Engine router',
      },
      {
        level: 'Level 2',
        how: 'Single-pass model call without conversation history',
        cost: 'Minimal. Direct execution and simple parsing.',
        by: 'Engine router',
      },
      {
        level: 'Level 3',
        how: 'Knowledge graph traversal plus a context session',
        cost: 'Low. Context retrieved without generating model tokens.',
        by: 'Engine router',
      },
      {
        level: 'Level 4',
        how: 'Semantic vector store retrieval',
        cost: 'Higher. Fuzzy semantic search across historical context.',
        by: 'Caller — depth: deep',
      },
      {
        level: 'Level 5',
        how: 'Bounded recursive deep reasoning, up to 10 minutes',
        cost: 'Maximum. Multi-hypothesis research and unstated facts.',
        by: 'Caller — depth: extreme',
      },
    ],
    example:
      '«What is my passport number?» resolves instantly at level 1 for zero tokens. «Which of my contacts could have known this person?» escalates through levels 3–5 and comes back as a probabilistic reasoning chain.',
  },
  seo: {
    title: 'Fractera Memory — self-hosted memory engine for AI agents',
    description:
      'Self-hosted memory engine for AI agents: knowledge graph, vector and relational stores, built-in object storage, geospatial lat/lon radius recall, native voice, image, video and PDF input, zero-token deterministic reads and champion/challenger skill evolution. One REST API, open source.',
  },
}
