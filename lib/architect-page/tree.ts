// AI Workspace Architect — static port of the product's /ai-core entity tree
// (source: ai-workspace/app/lib/architecture/{tree,admin-node,hermes-node,
// docs-node,builders}.ts). This is the L1 marketing mirror: pure data, EN, no
// interactivity. Every label/description lives here so the texts are a single
// editable config (the page renders it fully expanded, with no [+] toggles).
//
// Kept faithful to the product tree, minus the product-only, interaction-only
// fields (addable / pending / declared / href / meta) and minus wording that
// referenced expand/add affordances that do not exist on a static page.

export type ArchKind =
  | 'layer'
  | 'service'
  | 'platform'
  | 'group'
  | 'skill'
  | 'mcp'
  | 'config'
  | 'note'

export type ArchNode = {
  id: string
  label: string
  /** Friendly name for the detail column header (defaults to label). */
  name?: string
  kind: ArchKind
  /** Port or port range, shown as a chip next to services. */
  port?: string
  description?: string
  children?: ArchNode[]
}

// --- small builders, ported from builders.ts (no addable/skills affordances) ---

function platform(id: string, label: string, doc: string): ArchNode {
  return {
    id,
    label,
    kind: 'platform',
    description:
      `${label}: a subscription AI coding platform driven through the bridge. ` +
      `Its primary instructions live in ${doc}; the rest is its skills and MCP servers.`,
    children: [
      {
        id: `${id}-doc`,
        label: doc,
        kind: 'config',
        description:
          `${doc} — the primary project-context file ${label} reads on every run. ` +
          'One place to set how this agent behaves in your repo.',
      },
      {
        id: `${id}-skills`,
        label: 'Skills',
        kind: 'group',
        description: `The skills ${label} loads.`,
      },
      {
        id: `${id}-mcp`,
        label: 'MCP',
        kind: 'group',
        description: `MCP servers available to ${label}.`,
      },
    ],
  }
}

function mcp(id: string, label: string): ArchNode {
  return { id, label, kind: 'mcp', description: `MCP server: ${label}.` }
}

// --- the six agents whose draft folders hang under the Documentation corpus ---
// (ported from lib/ai-draft/agents.ts; inlined so the L1 mirror has no product
// dependency — six folders, each with its instruction doc(s) + SKILLS/ + MCP/).
const DRAFT_AGENTS: { id: string; folder: string; label: string; docs: string }[] = [
  { id: 'hermes', folder: 'HERMES', label: 'Hermes', docs: 'SOUL.md · HERMES.md' },
  { id: 'claude-code', folder: 'CLAUDE-CODE', label: 'Claude Code', docs: 'CLAUDE.md' },
  { id: 'codex', folder: 'CODEX', label: 'Codex', docs: 'AGENTS.md' },
  { id: 'gemini-cli', folder: 'GEMINI-CLI', label: 'Gemini CLI', docs: 'GEMINI.md' },
  { id: 'qwen-code', folder: 'QWEN-CODE', label: 'Qwen Code', docs: 'QWEN.md' },
  { id: 'kimi-code', folder: 'KIMI-CODE', label: 'Kimi Code', docs: 'AGENTS.md' },
]

const HERMES_NODE: ArchNode = {
  id: 'hermes',
  label: 'Hermes — Company Brain',
  kind: 'group',
  description:
    'The brain plus the two ways a human reaches it. The agent orchestrates ' +
    'development across the platforms; the Web UI and Telegram are its front doors.',
  children: [
    {
      id: 'hermes-agent',
      label: 'Hermes Agent — Brain',
      kind: 'service',
      port: ':9119',
      description:
        'The orchestration agent. It reads its identity and memory at every ' +
        'wake-up and drives the five coding platforms through the bridges.',
      children: [
        {
          id: 'hermes-config',
          label: 'config.yaml — wiring',
          kind: 'config',
          description:
            'Says what Hermes can reach: model/provider, memory provider, plugins ' +
            'and the MCP servers. Wiring, not rules — where he can reach, not who he is.',
        },
        {
          id: 'hermes-soul',
          label: 'SOUL.md — identity',
          kind: 'config',
          description:
            'Personality file read on every turn. When present it replaces the ' +
            "default identity — this is where 'you are the brain of Fractera, you " +
            "orchestrate development' belongs.",
        },
        {
          id: 'hermes-skills',
          label: 'Skills',
          kind: 'group',
          description: 'The skills Hermes loads to act.',
          children: [
            { id: 'skill-delegate-task', label: 'delegate-task', kind: 'skill', description: 'Skill "delegate-task": hand a task to a coding platform.' },
            { id: 'skill-record-deployment', label: 'record-deployment', kind: 'skill', description: 'Skill "record-deployment": log a build to the Product Loop journal.' },
            { id: 'skill-choose-agent', label: 'choose-agent', kind: 'skill', description: 'Skill "choose-agent": decide which coding platform fits a task.' },
          ],
        },
        {
          id: 'hermes-mcp',
          label: 'MCP servers — 7 bridges',
          kind: 'group',
          description:
            'The bridges exposed to Hermes as callable tools over loopback JSON-RPC ' +
            '(ports 3210–3216). They show up at start-up — which is why Hermes sees ' +
            'his tools even before his memory or role.',
          children: [
            mcp('mcp-claude', 'claude-bridge :3210'),
            mcp('mcp-codex', 'codex-bridge :3211'),
            mcp('mcp-gemini', 'gemini-bridge :3212'),
            mcp('mcp-qwen', 'qwen-bridge :3213'),
            mcp('mcp-kimi', 'kimi-bridge :3214'),
            {
              id: 'mcp-deployments',
              label: 'deployments-bridge :3215',
              kind: 'mcp',
              description:
                'Product Loop journal + projects in app.db. Tools: record_deployment, ' +
                'list_deployments, update_deployment, describe_record, create_project, ' +
                'list_projects. No delete by design — history is never lost via MCP.',
            },
            {
              id: 'mcp-readiness',
              label: 'readiness-bridge :3216',
              kind: 'mcp',
              description:
                'One snapshot of all five coding agents before delegating: installed, ' +
                'logged_in, busy, last_worked. Tool: check_agents_readiness. Read-only ' +
                '— facts only; the choose-agent skill decides.',
            },
          ],
        },
      ],
    },
    {
      id: 'hermes-webui',
      label: 'Chat Web UI — fractera-hermes-webui',
      kind: 'service',
      port: ':9120',
      description:
        'The chat window inside your workspace where you talk to Hermes in plain ' +
        'language. You brief the brain like a teammate and it drives the five coding ' +
        'platforms for you — no commands to memorise.',
    },
    {
      id: 'hermes-telegram',
      label: 'Telegram — fractera-hermes-gateway',
      kind: 'service',
      description:
        'A gateway process that lets you reach the same brain from Telegram on your ' +
        'phone. Start, check on, or steer work away from the keyboard; the workspace ' +
        'keeps building while you are out.',
    },
  ],
}

const ADMIN_LAYER: ArchNode = {
  id: 'admin-layer',
  label: 'Admin layer',
  kind: 'group',
  description:
    'The cockpit (fractera-admin :3002) where the workspace is driven — the ' +
    'bridges to the coding agents, the operator tools, Hermes, and domain setup. ' +
    'Reached through auth; not part of the public app.',
  children: [
    {
      id: 'bridge',
      label: 'Bridges',
      kind: 'group',
      description:
        'Keeps the five coding platforms alive over WebSocket and exposes each as ' +
        'an MCP server (ports 3210–3214) Hermes can call. The system terminal lives ' +
        'here too.',
      children: [
        platform('claude', 'Claude Code', 'CLAUDE.md'),
        platform('codex', 'Codex', 'AGENTS.md'),
        platform('gemini', 'Gemini CLI', 'GEMINI.md'),
        platform('qwen', 'Qwen Code', 'QWEN.md'),
        platform('kimi', 'Kimi Code', 'AGENTS.md'),
        {
          id: 'system-terminal',
          label: 'System terminal',
          kind: 'note',
          description:
            'A bare zsh on /opt/fractera, always present as the last carousel card. ' +
            'Part of fractera-bridge and not removable.',
        },
      ],
    },
    {
      id: 'tools',
      label: 'Tools',
      kind: 'group',
      description: 'The footer tools of the workspace.',
      children: [
        { id: 'tool-deploy', label: 'Deploy', kind: 'config', description: 'Build loop: POST /api/deploy → async build → pm2 reload. How the AI ships code from the workspace to the live app.' },
        { id: 'tool-github', label: 'GitHub', kind: 'config', description: 'Connect a repo and pull/push from the workspace (a deploy token is used for private repositories).' },
        { id: 'tool-upload', label: 'Upload Image', kind: 'config', description: 'Send an image to the media service — used for product assets and PWA icon generation.' },
        { id: 'tool-skills', label: 'Skills', kind: 'config', description: 'Skills marketplace entry — where reusable agent skills will be browsed and added.' },
        { id: 'tool-product-loop', label: 'Product Loop', kind: 'config', description: 'The build journal — every deployment with agent, model, tokens and a star rating. Our difference from a generic host.' },
      ],
    },
    {
      id: 'memory',
      label: 'LightRAG — Company Memory',
      kind: 'group',
      port: ':9621',
      description:
        'Shared long-term memory for the WHOLE workspace — not just Hermes. fractera-rag ' +
        '(LightRAG :9621) holds the knowledge graph; every agent queries it the same way — ' +
        'Hermes and the five coding platforms (Claude Code, Codex, Gemini, Qwen, Kimi) — and ' +
        'writes back to it. That is why it sits here, beside the Bridges and Tools, not under ' +
        'any single agent. The lightrag-memory plugin prefetches relevant pieces and injects ' +
        'them as <brain_context>. Needs an embedding/LLM key or it stays wired but silent. Fed ' +
        'by the Documentation corpus.',
      children: [
        {
          id: 'memory-store',
          label: 'Company Memory store (LightRAG)',
          kind: 'config',
          description:
            'The knowledge-graph store fractera-rag keeps on disk — entities, relations and ' +
            'embeddings built from the Documentation corpus. Any agent recalls from it ' +
            'semantically; ingest a document once and every agent can use it.',
        },
      ],
    },
    HERMES_NODE,
    {
      id: 'domain',
      label: 'Domain settings',
      kind: 'group',
      description:
        'Attach your own domain and HTTPS — the optional step that turns IP mode ' +
        'into secure mode.',
      children: [
        {
          id: 'domain-connect',
          label: 'Domain connection',
          kind: 'config',
          description:
            'Point a custom domain at the server; the wizard validates DNS and stages ' +
            'the nginx config.',
        },
        {
          id: 'domain-cert',
          label: 'Certificate connection',
          kind: 'group',
          description: 'The HTTPS certificate for your domain.',
          children: [
            { id: 'cert-auto', label: 'Automatic certificate', kind: 'config', description: "Issued automatically on the server (Let's Encrypt / certbot) — no manual steps." },
            { id: 'cert-custom', label: 'Custom certificate', kind: 'config', description: 'Bring your own certificate when you manage TLS elsewhere.' },
          ],
        },
      ],
    },
  ],
}

const DOCS_NODE: ArchNode = {
  id: 'docs',
  label: 'Documentation — Company Memory corpus',
  kind: 'group',
  description:
    'The shared knowledge every agent references. Ingest these into Company ' +
    'Memory (LightRAG) and any agent can recall them semantically. One place to ' +
    "read, edit and register the project's living memory.",
  children: [
    {
      id: 'doc-glossary',
      label: 'GLOSSARY.md',
      kind: 'config',
      description:
        'Project terms — approved abbreviations / preferred phrasings so every agent ' +
        'reads them the same way (e.g. aws -> ai-workspace). A real file at the project ' +
        'root; agents read it directly as context.',
    },
    {
      id: 'doc-steps',
      label: 'DEVELOPMENT-STEPS',
      kind: 'group',
      description:
        'The work log — every step of how the app is built, kept as real markdown ' +
        'files an agent reads and writes.',
      children: [
        { id: 'doc-new-steps', label: 'NEW-STEPS', kind: 'group', description: 'Open steps — one file per active task (number, name, importance, description, to-do).' },
        { id: 'doc-completed-steps', label: 'COMPLETED-STEPS', kind: 'group', description: 'Finished steps — moved here with a completion date. Read-only history.' },
      ],
    },
    {
      id: 'doc-patterns',
      label: 'PATTERNS',
      kind: 'group',
      description:
        'The reuse library — reusable code patterns and deployment anti-patterns, kept ' +
        'as real markdown files an agent reads and writes.',
      children: [
        { id: 'doc-patterns-patterns', label: 'PATTERNS', kind: 'group', description: 'Reusable code patterns in a one-level tree by category (UI Elements, Sections, Brandbook).' },
        { id: 'doc-patterns-anti', label: 'ANTI-PATTERNS', kind: 'group', description: 'Deployment pitfalls — a flat list an agent reads before every deploy to avoid repeating them.' },
      ],
    },
    {
      id: 'doc-ai-draft',
      label: 'AI-DRAFT-SETTINGS',
      kind: 'group',
      description:
        "The draft layer — free-form wishes for the six agents' real instruction / skill / " +
        'MCP files, kept as real markdown an agent reads and applies later. The originals are ' +
        'never edited here; this is a mirror. One folder per agent, each with its instruction ' +
        'doc(s) + SKILLS/ + MCP/.',
      children: DRAFT_AGENTS.map((a): ArchNode => ({
        id: `doc-ai-draft-${a.id}`,
        label: a.folder,
        kind: 'group',
        description: `${a.label}: its draft folder — ${a.docs} (instruction) plus SKILLS/ and MCP/. Wishes that supplement or replace its real files.`,
        children: [
          { id: `doc-ai-draft-${a.id}-doc`, label: a.docs, kind: 'config', description: `Instruction draft for ${a.label}. Supplement or replace the real document; an agent applies the wishes later.` },
          { id: `doc-ai-draft-${a.id}-skills`, label: 'SKILLS', kind: 'group', description: "Draft skills. The agent's real skills show as read-only reference; a draft is laid over one or added as a new requested skill." },
          { id: `doc-ai-draft-${a.id}-mcp`, label: 'MCP', kind: 'group', description: "Draft MCP connectors. The agent's real bridges show as read-only reference; a draft supplements / replaces one or requests a new connector." },
        ],
      })),
    },
    {
      id: 'doc-about',
      label: 'About Fractera',
      kind: 'config',
      description:
        'One voluminous document describing absolutely everything about the project — ' +
        'written to be ingested whole into the vector store as the canonical ground truth ' +
        'for every agent.',
    },
    {
      id: 'doc-crud-docs',
      label: 'CRUD-DOCS',
      kind: 'group',
      description:
        'Your own knowledge-base documents — a real folder/file tree of any depth under ' +
        'CRUD-DOCS/ (company notes, technical processes, anything an agent should know). ' +
        'Create folders, upload .txt/.md/.doc/.docx, preview, delete — real files on disk. ' +
        'Activating one ingests it into Company Memory (LightRAG). These documents stay on ' +
        'the server and are NOT synced to GitHub.',
    },
  ],
}

// Root — drawn the way a request flows (everything behind nginx + the auth gate),
// then splitting into the app, data and admin layers. Nesting expresses "what a
// request passes through / what is gated by what", not which process runs in another.
export const ARCHITECTURE_TREE: ArchNode = {
  id: 'l2',
  label: 'Fractera workspace',
  kind: 'layer',
  description:
    'Your AI coding workspace, drawn the way a request flows: everything reachable ' +
    'sits behind nginx and the auth gate. This is the secure-mode lens — in IP mode ' +
    'there is no nginx gate and services are reached by port. Nesting shows what a ' +
    'request passes through / what is gated by what, not which process runs inside another.',
  children: [
    {
      id: 'nginx',
      label: 'nginx — front door',
      kind: 'service',
      port: ':80/:443',
      description:
        'The reverse proxy every visible request passes through in secure mode: it ' +
        'terminates TLS, routes the apex and the admin./auth./data./chat. subdomains, ' +
        'and runs the auth_request gate. In IP mode it is absent — you reach services ' +
        'by port directly.',
      children: [
        {
          id: 'auth',
          label: 'Authorization — fractera-auth',
          kind: 'service',
          port: ':3001',
          description:
            'The gate every protected request crosses (NextAuth: login, register, ' +
            'guest, roles). It covers the rest of the workspace — which is why it sits ' +
            'above the app, data and admin layers here. Logical coverage, not a process ' +
            'that runs them. In IP mode the gate is bypassed for onboarding.',
          children: [
            {
              id: 'app-layer',
              label: 'App layer',
              kind: 'group',
              description: 'The product itself — the public app the AI builds and ships.',
              children: [
                {
                  id: 'app',
                  label: 'fractera-app — App Shell',
                  kind: 'service',
                  port: ':3000',
                  description:
                    'The public-facing application at your domain root. Open layer — the ' +
                    'AI writes code here; safe to edit.',
                },
              ],
            },
            {
              id: 'data-layer',
              label: 'Data layer',
              kind: 'group',
              description:
                'Where the workspace keeps state. Powered by fractera-data (:3300), a ' +
                'token-authenticated service in front of SQLite and media.',
              children: [
                {
                  id: 'data-db',
                  label: 'Database — SQLite',
                  kind: 'group',
                  description:
                    'app.db + media.db. New tables are declared once in the SCHEMA and ' +
                    'appear in every environment automatically.',
                  children: [
                    { id: 'tbl-products', label: 'products', kind: 'config', description: 'Catalogue demo rows behind the Dashboard page.' },
                    { id: 'tbl-deployments', label: 'deployment_records', kind: 'config', description: 'Product Loop journal — every build with agent, model, tokens, step and rating (16 fields).' },
                    { id: 'tbl-projects', label: 'projects', kind: 'config', description: 'Named projects that deployments are grouped under (default-first).' },
                    { id: 'tbl-settings', label: 'site_settings', kind: 'config', description: 'Workspace settings — domain and certificate state.' },
                  ],
                },
                {
                  id: 'data-media',
                  label: 'Object Storage / Media',
                  kind: 'service',
                  description:
                    'The media side of fractera-data: uploads, thumbnails, image cropping ' +
                    'and PWA icon generation from one square image.',
                },
              ],
            },
            ADMIN_LAYER,
          ],
        },
      ],
    },
    DOCS_NODE,
  ],
}
