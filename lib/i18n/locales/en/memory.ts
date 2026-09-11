import type { MemoryPageContent } from '../../types'

// Примеры запросов вынесены в константы, как в источнике: внутри них кавычки,
// переводы строк и обратные слэши, и в таком тексте легче всего потерять символ.
const CURL_REMEMBER = `curl -X POST https://memory.your-domain.com/v1/remember \\
  -H "Content-Type: application/json" -H "x-memory-key: YOUR_MEMORY_KEY" \\
  -d '{
    "who": "roman",
    "text": "Office lease note",
    "media": [{ "kind": "audio", "url": "https://.../note.oga" }],
    "scope": [{ "at": "2026-09-11", "lat": 40.4168, "lon": -3.7038, "radius_m": 500 }]
  }'`

const CURL_RADIUS = `curl -X POST https://memory.your-domain.com/v1/recall \\
  -H "Content-Type: application/json" -H "x-memory-key: YOUR_MEMORY_KEY" \\
  -d '{
    "who": "roman",
    "text": "What notes or files did I save within 500 meters of here?",
    "scope": [{ "lat": 40.4168, "lon": -3.7038, "radius_m": 500 }]
  }'`

const CURL_DEEP = `curl -X POST https://memory.your-domain.com/v1/recall \\
  -H "Content-Type: application/json" -H "x-memory-key: YOUR_MEMORY_KEY" \\
  -d '{
    "who": "roman",
    "text": "Summarize all my taxi expenses from last month into a table",
    "depth": "deep",
    "want_chain": true
  }'`

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
  comparison: {
    title: 'How it compares',
    lead:
      'Two comparisons: one against the categories of memory tooling, one against a ready-made assistant of a different philosophy.',
    feature: 'Capability',
    ours: 'Fractera Memory',
    tables: [
      {
        title: 'Against the categories',
        rivals: ['Standard RAG frameworks', 'MemGPT / Letta', 'Mem0 / Zep'],
        rows: [
          {
            feature: 'Storage architecture',
            ours: 'Hybrid: graph + vector + relational + object store',
            rivals: ['Vector DB only', 'Relational / text files', 'Vector plus a basic graph'],
          },
          {
            feature: 'Zero-token reads',
            ours: 'Yes — deterministic paths at levels 1–3',
            rivals: ['No', 'No', 'Partial'],
          },
          {
            feature: 'Native multimodality',
            ours: 'Built in: audio, video, PDF, images',
            rivals: ['Requires external parsers', 'Requires external parsers', 'Text focused'],
          },
          {
            feature: 'Spatial proximity indexing',
            ours: 'Native lat/lon radius search',
            rivals: ['Text matching only', 'Function calling only', 'Basic metadata'],
          },
          {
            feature: 'Skill evolution',
            ours: 'Champion / challenger A/B testing',
            rivals: ['None', 'Manual prompt edits', 'None'],
          },
          {
            feature: 'Self-hosted / open source',
            ours: '100% on-premise, single node',
            rivals: ['Varies', 'Yes', 'Freemium / cloud'],
          },
        ],
      },
      {
        title: 'Against a ready-made assistant',
        rivals: ['IVA Agent (smixs/iva-agent)'],
        rows: [
          {
            feature: 'System classification',
            ours: 'An autonomous memory engine behind an API, for any front-end',
            rivals: ['An end-to-end Telegram assistant tied to an Obsidian vault'],
          },
          {
            feature: 'Architecture',
            ours: 'A decoupled microservice; the Telegram bot is an optional client',
            rivals: ['A monolith: Telegram, userbot and vault manager in one codebase'],
          },
          {
            feature: 'Cost optimisation',
            ours: 'A five-tier deterministic router; instant zero-token reads',
            rivals: ['Every operation leans on model passes, BM25 and vector lookups'],
          },
          {
            feature: 'Data processing',
            ours: 'Dynamic SQL tables, structured artifacts, a knowledge graph',
            rivals: ['Markdown cards written to a folder for Obsidian to sync'],
          },
          {
            feature: 'Integrations',
            ours: 'Many front-ends at once over one REST API',
            rivals: ['Bound to one Telegram account and an Obsidian setup'],
          },
        ],
      },
    ],
  },
  api: {
    title: 'API quickstart',
    lead: 'One REST API, one key. Every example below runs against a live instance as it stands.',
    samples: [
      { title: 'Store a voice note with spatial coordinates', code: CURL_REMEMBER },
      { title: 'Recall everything within a radius', code: CURL_RADIUS },
      { title: 'Deep reasoning with the chain returned', code: CURL_DEEP },
    ],
  },
  install: {
    title: 'Installation',
    lead: 'There is exactly one thing to know about installing this.',
    body:
      'One run of the Fractera installer robot on your own server brings up every microservice of the platform, memory included — nginx, certificates and the access key are arranged for you. There is nothing to assemble by hand.',
  },
  principles: {
    title: 'Design principles',
    items: [
      {
        title: 'Complete data ownership',
        body: 'All data, graphs and media stay strictly on your machine. No telemetry, no hidden cloud dependency.',
      },
      {
        title: 'Fact attribution',
        body:
          'What a person stated is logged as fact (said); what the engine inferred is flagged as hypothesis (guess) and stored only with its evidence (basis).',
      },
      {
        title: 'Headless engine architecture',
        body:
          'Connect the official Telegram starter, or attach your own web chat, mobile app and automation pipelines over HTTP. The bundled console is a microservice of its own, and it is optional.',
      },
    ],
  },
  faq: {
    title: 'Questions and answers',
    lead: 'Short answers to what people ask before they integrate.',
    items: [
      {
        q: 'Does every request cost tokens?',
        a: 'No. The engine answers levels 1 to 3 without a model at all: a direct lookup, a graph traversal, a conclusion already folded back into the stores. A model turn is spent only when the cheap deterministic paths return nothing, and the answer reports depth_used so you can see what you paid for.',
      },
      {
        q: 'Can it answer questions about a place by coordinates, not by a word?',
        a: 'Yes. A scope entry carries lat, lon and an optional radius_m, and the coordinates are spatially indexed. You can ask what you know within 500 metres of a point, and knowledge recorded in Madrid never merges with knowledge recorded in London.',
      },
      {
        q: 'What can I send besides text?',
        a: 'Voice notes, images, video, PDF and HTML. The pipeline lives inside the engine: audio is transcribed, images are captioned and read by OCR, video has its track transcribed and its key frames captioned, PDFs are parsed with an OCR fallback. The original binary stays in the built-in object store and is referenced from answers by id.',
      },
      {
        q: 'What schema do I have to design first?',
        a: 'None. You send a sentence. The engine adds columns as new kinds of fact appear and generates typed relational tables when a kind grows into an entity. There are no migrations to write.',
      },
      {
        q: 'What happens after an expensive research run?',
        a: 'It folds the result back. The artifact goes to the object store, its summary into text, into the vector store and into the knowledge graph, and the relation tables are updated. The same question is then answered from the cheap levels, in fractions of a second.',
      },
      {
        q: 'How does it improve itself without breaking what works?',
        a: 'It writes a second version of the skill and runs it as a challenger in the shadow, on real traffic, while people keep being answered by the champion. Promotion needs an external verdict and no regression in cost: the engine is never allowed to grade its own work.',
      },
      {
        q: 'What can I connect to it?',
        a: 'Any HTTP client: a Telegram bot, a web chat, a mobile app, a scheduled job. The engine also ships with its own console, already connected, and that console is optional: nothing in the API path depends on it.',
      },
      {
        q: 'Where does my data live?',
        a: 'On your server, in your database, in your object store, behind a key you can revoke in one click. There is no metered API in the middle and no telemetry leaving the machine.',
      },
    ],
  },
  project: {
    label: 'The Fractera project on GitHub',
    body:
      'Fractera Memory is one microservice of the Fractera platform, the engineering infrastructure for autonomous agents. The whole project, this engine included, is open source.',
  },
  cta: {
    title: 'See how it is built',
    body:
      'Read the full design in the passport — the document written before the code and kept in step with it ever since.',
  },
  seo: {
    title: 'Fractera Memory — self-hosted memory engine for AI agents',
    description:
      'Self-hosted memory engine for AI agents: knowledge graph, vector and relational stores, built-in object storage, geospatial lat/lon radius recall, native voice, image, video and PDF input, zero-token deterministic reads and champion/challenger skill evolution. One REST API, open source.',
  },
}
