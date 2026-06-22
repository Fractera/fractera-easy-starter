import type { DocBase } from '../../_lib/types'

// English base document for /documentation/one-button-workspace.
// Optimized for sharp human readability and strict AI token context efficiency.
export const en: DocBase = {
  title: 'The AI Consultant Button: Unified Interface Architecture',
  description:
    'A technical breakdown of Fractera’s text-driven interface model. Learn how a single client-side widget coordinates the Hermes orchestration daemon and LightRAG memory to replace legacy navigation portals with direct execution loops.',
  summary:
    'An engineering specification detailing a minimal-friction interface that exposes local databases and Model Context Protocol (MCP) tool servers through a single, secure chat widget.',
  blocks: [
    {
      kind: 'p',
      text: 'Fractera prioritizes **interactive data conversation** as a core system feature. Traditional enterprise portals are inherently inefficient. They force users to navigate sprawling, multi-layered menus and wait for heavy page components to render just to locate a single data point or execute a routine update.',
    },
    {
      kind: 'p',
      text: 'Legacy interface complexity forces developers and end-users to **study application structures deeply** just to move data through step-by-step transaction pipelines. This design bottleneck introduces unnecessary operational drag. Our architecture removes this complexity by handling user actions through direct intent validation.',
    },
    {
      kind: 'p',
      text: 'The interface protocol detailed below simplifies user discovery across public, authenticated, and administrative layers. The objective is to restructure workspace navigation into a single input stream:',
    },
    {
      kind: 'list',
      items: [
        'Direct Layout Discovery: Anonymous visitors enter a route and query the system in natural language to locate relevant pages and indexing nodes immediately.',
        'View Component Control: Users adjust theme settings, toggle layout readability states, or update localized interface languages entirely through input intents.',
        'Authenticated Account Queries: Logged-in users query system records directly, pull invoice histories, or draft and dispatch transaction requests to backend targets.',
        'Administrative Architecture Mutations: Project administrators execute natural language commands to declare new backend services, spawning real-time workspace pages and tools.',
      ],
    },
    {
      kind: 'p',
      text: 'This specification focuses on the underlying integration layer—detailing how communication remains secured, sandboxed, and optimized across your local database configurations and Redis cache layers.',
    },
    {
      kind: 'quote',
      text: 'A unified chat widget exposing isolated Model Context Protocol (MCP) tool servers under the control of the Hermes orchestration engine and the LightRAG persistent knowledge base. The system evaluates and pairs these elements the moment an instruction hits the API endpoint.',
    },

    { kind: 'h2', text: 'Infrastructure Execution: Server vs. Client Boundaries' },
    {
      kind: 'p',
      text: 'The platform ships with a **minimal-but-sufficient client widget** that connects to your infrastructure endpoints immediately following deployment. This layout enables basic view-layer manipulation out of the box.',
    },
    {
      kind: 'p',
      text: 'System isolation relies on a strict execution rule: **the intelligence layer runs on the server, while action deployment is handled by the browser.** The server evaluates available tool schemas, references configuration states, and suggests layout mutations—but it cannot manipulate an open browser tab directly. Specific view configurations (language states, layout themes, navigation paths) execute inside the browser client, enabling immediate view updates without full page reloads.',
    },
    {
      kind: 'p',
      text: 'To maintain this boundary, a server-side routine updating a global configuration file changes only the on-disk repository baseline. Already-open browser tabs remain isolated because the server lacks a direct handle to active web views, and the client manages its layout state using local storage structures.',
    },

    { kind: 'h2', text: 'Hierarchical Access Tiering' },
    {
      kind: 'p',
      text: 'System security is enforced by nesting individual tool capabilities within three strict access groups: `public ⊆ user ⊆ owner`. Access levels are determined **server-side from the session state** and are never validated based on client-side requests.',
    },
    {
      kind: 'list',
      items: [
        'public: Guest access requiring no active session. Operations are restricted to local view-layer configurations, indexing queries, and page navigation.',
        'user: Authenticated customer sessions. Grants access to isolated personal records, transaction logs, and profile mutations linked to their specific identity.',
        'owner: System administrator. Grants full permissions to modify shared configuration states, update global defaults, and execute repository code generation.',
      ],
    },
    {
      kind: 'p',
      text: 'The following script illustrates how the endpoint determines access rights by reading server-side session cookies:',
    },
    {
      kind: 'code',
      text: `// lib/consultant/tier.ts (Architectural Overview)
async function resolveTier(req) {
  const session = await getSession(req)      // Read validated authentication session
  if (!session) return 'public'              // Anonymous guest baseline
  if (session.roles.includes('architect')) return 'owner'
  return 'user'                              // Authenticated standard account
}`,
    },

    { kind: 'h2', text: 'The Client Widget Entry Point' },
    {
      kind: 'p',
      text: 'The interface is mounted globally as a fixed, non-intrusive container in the viewport. The widget checks connection paths prior to rendering—if the background server daemon is offline, the interface element remains unrendered to prevent dead ui states.',
    },
    {
      kind: 'code',
      text: `// The widget audits background daemon availability prior to mounting
const { available, tier, keyConfigured } = await fetch('/api/consultant').then(r => r.json())
if (!available) return null                  // Daemon unreachable → suppress layout element
// Render active input node containing current verification context indicators`,
    },

    { kind: 'h2', text: 'Client Execution: Deferred Action Envelopes' },
    {
      kind: 'p',
      text: 'View mutations are structured as tools that the server **suggests** but the browser client **executes**. The server-side routing logic avoids direct file mutations, returning a light, deferred action payload that the client interface maps to native handlers.',
    },
    {
      kind: 'code',
      text: `// The server endpoint transmits a structured metadata block instead of direct code:
{ "__client_action__": true, "tool": "public_view_set_locale", "args": { "locale": "fr" } }

// The client engine routes incoming instructions through an absolute allowlist:
function runAction(action) {
  switch (action.tool) {
    case 'public_view_navigate_page': return router.push(action.args.to)
    case 'public_view_set_locale':    return router.replace(\`/\${action.args.locale}/...\`)
    case 'public_view_set_theme':     return setTheme(action.args.mode)
    case 'public_view_set_width':     return setWidth(action.args.width)
  }
}`,
    },
    {
      kind: 'p',
      text: 'This division forms a strict client-side security boundary. The browser rejects unlisted commands out of the streaming payload, parsing arguments exclusively through clear validation rules. The user’s interaction with the generated action element serves as the confirmation trigger, eliminating intrusive verification modals.',
    },

    { kind: 'h2', text: 'Public Process Sandboxing' },
    {
      kind: 'p',
      text: 'Public data access runs inside an **isolated background process**, completely decoupled from the administrative owner environment. Its tool definitions represent a minimal code subset that completely excludes administrative logic, preventing malicious access by omitting the underlying execution endpoints. A secondary environment restriction caps the process ceiling at the standard user level.',
    },
    {
      kind: 'code',
      text: `# Launch public-facing daemon under strict permission limits and isolated directory roots
HERMES_HOME=/root/.hermes-public  FRACTERA_AGENT_MAX_TIER=user  hermes dashboard --port 9129
# Configuration indexes restrict visibility strictly to public tool schemas`,
    },
    {
      kind: 'p',
      text: 'The daemon binds exclusively to local loopback ports. Incoming user requests pass through a shallow server-side endpoint that handles API token authentication securely, ensuring that anonymous traffic cannot exhaust developer keys or processing budgets.',
    },

    { kind: 'h2', text: 'Single Endpoint Turn Execution' },
    {
      kind: 'p',
      text: 'The interface maps all communications to a single backend endpoint: `/api/consultant`. This routing node evaluates incoming session tokens, relays text data to the sandbox process, and returns a clean, structured payload containing layout copy and any deferred action schemas.',
    },
    {
      kind: 'code',
      text: `// POST /api/consultant  → Single data-driven turn execution
{
  "text": "System locales are restricted to EN, DE, and FR. Selected language is unmapped — choose alternative:",
  "actions": [
    { "tool": "public_view_set_locale", "args": { "locale": "fr" }, "label": "Français" },
    { "tool": "public_view_set_locale", "args": { "locale": "de" }, "label": "Deutsch" }
  ]
}`,
    },

    { kind: 'h2', text: 'Authentication Escalation Protocols' },
    {
      kind: 'p',
      text: 'When a user intent demands an access tier higher than the current session permission, the system blocks execution without throwing generic failures. The orchestrator determines the required security target and updates the interface with targeted instructions alongside an authorization link:',
    },
    {
      kind: 'list',
      items: [
        'Private Data Scopes: Requests targeting specific user databases trigger a prompt to authenticate. Once logged in, the updated user session opens the appropriate personal data tools.',
        'Role Capacity Restrictions: Requests that are outside the scope of standard accounts inform the user that the operation requires elevated developer permissions or administrative access.',
      ],
    },
    {
      kind: 'p',
      text: 'Both events redirect users through standard authentication routes before returning them to their previous application state, allowing them to re-run the intent without losing execution context.',
    },

    { kind: 'h2', text: 'Expanding Capabilities via Natural Language' },
    {
      kind: 'p',
      text: 'Expanding system capabilities is a built-in architecture feature. To register new tool sets or functional skills, developers use the administrative control view at **[your-domain]/ai-draft-settings**. This interface processes free-form descriptions to generate fresh MCP servers, assigning exact access levels (public, user, or owner) during the initial design phase. A specialized background agent evaluates the request and builds the tool into the workspace.',
    },
    {
      kind: 'p',
      text: 'The draft layout captures all required operational configurations: the target **security tier**, whether the tool is **read-only or mutates backend state**, and a preview of its functional naming conventions, applying security schemas from the moment of creation.',
    },
    {
      kind: 'p',
      text: 'If further customization is required, engineers drop into the platform’s **integrated terminal environments** or manage extensions via **local development tools**. The infrastructure ships with complete source code to support custom scaling requirements.',
    },
    {
      kind: 'olist',
      items: [
        'Infrastructure Provisioning: Deploy the core package to instantly mount a working layout containing the active input widget.',
        'Intent Testing: Basic layout manipulation and page indexing lookups execute out of the box.',
        'Capability Drafting: Define custom tool sets inside the configuration panel, assign their access tiers, and let the agent compile them.',
        'Absolute Extension: Use the terminal or local text editors to modify core files. Your team retains full code ownership.',
      ],
    },

    { kind: 'h2', text: 'Functional Walkthrough: Locale Execution' },
    {
      kind: 'olist',
      items: [
        'The input container evaluates background connection states and renders the chat view upon user interaction.',
        'The backend endpoint parses current session cookies, identifies a public permission rating, and hands the input to the sandbox daemon.',
        'The daemon reads your project configuration files, checks available language definitions, and lists active locales.',
        'The system maps matching action payloads to the available language parameters, returning a deferred action envelope.',
        'The interface displays the resulting message block along with direct navigation options.',
        'The user triggers the target language option; the client verifies the parameters against its rules and executes a clean client-side path change.',
      ],
    },
    {
      kind: 'p',
      text: 'The entire sequence leverages native client-side routing. The backend infrastructure maintains data boundaries and suggests changes, while the browser engine executes the layout update.',
    },

    { kind: 'h2', text: 'Core Architecture Advantages' },
    {
      kind: 'list',
      items: [
        'Intent-Based Navigation: Users state explicit data goals, and background models locate the exact asset path, removing the need to memorize dense menu trees.',
        'Consolidated Interface Footprint: A single interface node hosts an expanding library of MCP tool connections, keeping visual layouts clean as backend complexity grows.',
        'Persistent Project Memory: LightRAG integrates graph-shaped long-term memory models directly into the workspace, ensuring the assistant’s context sharpens across tasks.',
        'Sovereign Source Isolation: The platform executes entirely on your own virtual hardware, eliminating dependencies on opaque third-party cloud providers.',
        'Isolated Security Baselines: Guest permissions cannot compromise administrative tool servers because the corresponding routes are physically absent from the public process.',
      ],
    },

    { kind: 'h2', text: 'Tool Capabilities mapped by Access Tier' },
    {
      kind: 'p',
      text: 'The input widget responds strictly through capabilities explicitly defined within your project manifests. Available operations depend entirely on current session validation states. This list scales dynamically as new MCP tool servers are registered.',
    },
    { kind: 'h3', text: 'Public Scope (Anonymous Guest Access)' },
    {
      kind: 'list',
      items: [
        'Theme Control: Toggle application layouts between light, dark, or system preferences within the active viewport.',
        'Locale Modification: Update the current interface text to match any pre-compiled language file.',
        'Layout Constraints: Modify view widths between narrow or wide tracking boundaries to improve readability.',
        'Asset Navigation: Execute instant client-side jumps to specific internal paths like product lists or pricing pages.',
        'Surface Indexing: Query the local directory structure to identify public application sections.',
      ],
    },
    { kind: 'h3', text: 'User Scope (Authenticated Personal Account Access)' },
    {
      kind: 'p',
      text: 'Following session validation, the engine exposes secure tools targeting your personal account database records, isolating queries from adjacent customer scopes. Attempting these actions from an anonymous state displays an authentication card. Enabled capabilities include: order tracking and transaction histories, invoice downloads, subscription state adjustments, and account log reviews.',
    },
    { kind: 'h3', text: 'Owner Scope (Administrative Infrastructure Access)' },
    {
      kind: 'p',
      text: 'Authenticated system administrators manage global configuration vectors, adjust platform defaults, declare new endpoint routes, and compile custom tool chains inside the configuration panel. The public-facing process completely excludes these capabilities, redirecting unauthenticated requests to your secure login views.',
    },
    {
      kind: 'list',
      items: [
        'Register Architecture Tasks: Append fresh database records to your system layout dashboard to trace route changes or declare new endpoints. Handled by tool `owner_arch_create_record`.',
        'Consolidate Build Chains: Move pending development logs into active build steps inside your control dashboard, resetting temporary task records. Handled by tool `owner_arch_send_to_steps`.',
        'Generate New MCP Servers: Draft custom agent capabilities inside the configuration panel, establishing their target access tiers and compiling them into production. Handled by tool `owner_draft_send_to_steps`.',
      ],
    },

    { kind: 'h2', text: 'Knowledge Storage Boundaries' },
    {
      kind: 'p',
      text: 'This reference document serves as a high-level overview of interface features. It targets basic system concepts and intentional security splits, keeping the technical copy lightweight.',
    },
    {
      kind: 'note',
      text: 'For detailed architectural inspection, query your workspace’s LightRAG vector graph directory. This long-term memory layer is accessed by prompting the Hermes daemon within your secure administrative dashboard, allowing you to pull exact system blueprints and repository layout traces on demand.',
    },
  ],
  faq: [
    {
      q: 'What specific operations can an unauthenticated visitor trigger through the chat widget?',
      a: 'Anonymous guest sessions are restricted to view-layer adjustments. They can alter interface layouts, switch localized text tracks, change page widths, and navigate public application routes. These operations run purely inside the client browser and generate zero modifications across your global database.',
    },
    {
      q: 'How does the interface widget verify which backend tools are safe to display?',
      a: 'The widget queries your capability registry managed within the administrative control panel. Each registered tool server maps to an explicit access level (public, user, or owner). If an intent requires elevated permissions, the orchestrator updates the chat view with an authentication link instead of executing the background logic.',
    },
    {
      q: 'Can a public user query alter shared configuration baselines or affect other live sessions?',
      a: 'No. View mutations remain isolated to the user’s local browser context. Global administrative tasks—such as updating default system themes or compiling new repository paths—are completely excluded from the public sandbox daemon, ensuring public interactions cannot cross secure boundaries.',
    },
  ],
}