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
  scope: {
    title: 'Spatial-temporal context',
    lead: 'Time and coordinates are first-class indexes here, not flat text tags.',
    items: [
      {
        title: 'The strict boundary rule',
        body: 'An empty spatial-temporal scope means «location and time unknown» — never «everywhere and always».',
      },
      {
        title: 'Context isolation',
        body:
          '«Which taxi service do I usually use here?» asked in Madrid returns Madrid knowledge, and never collides with or overwrites the same question answered in London.',
      },
      {
        title: 'Radius search',
        body:
          'A built-in spatial index over lat, lon and radius_m answers proximity queries: notes, expenses and records near this point.',
      },
    ],
  },
  artifacts: {
    title: 'Knowledge becomes an object, not a paragraph',
    lead:
      "Asked to summarise complex data — last month's spending, a project's state — memory does not hand back a wall of text. It builds the thing you asked for:",
    steps: [
      'Instantiates a structured entity: a typed table with the columns the answer needs.',
      'Compiles, sorts and formats a clean Markdown artifact with its own Object ID.',
      'Returns a short executive summary next to the artifact, so the answer reads well and the detail stays referenceable.',
    ],
  },
  memoization: {
    title: 'The memoization loop',
    lead: 'Nothing expensive is paid for twice. Every high-cost chain is folded back down into the cheaper tiers.',
    chain: [
      'An expensive computation or research loop runs at level 4 or 5',
      'An artifact is created with its ID, alongside a concise conclusion',
      'The conclusion is indexed into the vector store, the knowledge graph and the tables',
      'Repeat questions are answered in 0.2 s at levels 1–3, for zero tokens',
    ],
  },
  evolution: {
    title: 'A self-evolving skill core with shadow A/B testing',
    lead:
      'When the engine detects repeated misses or a sub-optimal path, it writes a candidate skill and runs it as a challenger in the shadow — on real production traffic, while people keep being answered by the verified champion.',
    items: [
      {
        title: 'No self-evaluation',
        body:
          'The model is forbidden from scoring its own work. Verdicts come from outside — explicit architect feedback and strict compute-cost ratios.',
      },
      {
        title: 'Deterministic promotion',
        body:
          'A challenger is promoted to champion only when it wins on external quality metrics with no regression in speed or cost.',
      },
      {
        title: 'Versioning and safe rollback',
        body:
          'Every modification is a commit. One click reverts the instructions to the baseline version through Git, with no data loss.',
      },
    ],
  },
  stores: {
    title: 'Four unified storage tiers',
    lead: 'Four layers, one contract. The caller never learns which of them answered.',
    items: [
      { title: 'Relational store', body: 'Tabular structures, typed facts, exact entity properties.' },
      { title: 'Vector store', body: 'High-dimensional semantic embeddings for fuzzy similarity search.' },
      { title: 'Knowledge graph', body: 'Directional links between entities, people and events.' },
      { title: 'Object store', body: 'Local binary storage for raw attachments: PDF, images, audio, video.' },
    ],
  },
  media: {
    title: 'Native multimodality',
    lead: 'Not a preprocessor bolted on the side. The pipeline lives inside the engine.',
    items: [
      { title: 'Audio', body: 'Local speech-to-text transcription through a Whisper pipeline.' },
      { title: 'Images', body: 'Scene captioning through vision, plus OCR text extraction.' },
      { title: 'Video', body: 'Audio track extracted and transcribed, key frames processed by vision.' },
      { title: 'PDF and documents', body: 'Native text parsing, OCR fallback for scans, structural summarisation.' },
    ],
  },
  bench: {
    title: 'Testing and verification in the built-in playground',
    lead:
      'The engine ships with an interactive bench. It is not a demo page: it is where an integration is proven before it is written.',
    items: [
      'Execute direct API requests against the memory core with no front-end abstraction in the way.',
      'Inspect raw JSON payloads, execution timings and exact model token usage.',
      'Verify the request body before committing a line of client code.',
    ],
    where: '/{lang}/settings?section=memory-test',
  },
  seo: {
    title: 'Fractera Memory — self-hosted memory engine for AI agents',
    description:
      'Self-hosted memory engine for AI agents: knowledge graph, vector and relational stores, built-in object storage, geospatial lat/lon radius recall, native voice, image, video and PDF input, zero-token deterministic reads and champion/challenger skill evolution. One REST API, open source.',
  },
}
