import type { DocBase } from '../../_lib/types'

// English base document for /documentation/content-engine-architecture.
// Simplified for clean human scannability and strict AI context-token optimization.
export const en: DocBase = {
  title: 'Content Engine Architecture: Eliminating Central Repositories',
  description:
    'The technical architecture behind Fractera’s self-contained content layout. Learn how isolated page folders eliminate central registries, slash AI agent token consumption, and double as a unified design system.',
  summary:
    'A decentralized page architecture designed to eliminate central file bottlenecks, reduce developer maintenance, and minimize AI token costs through fully isolated page folders.',
  keywords:
    'content engine, co-location architecture, token economy, AI agent tokens, design system, block catalog, Next.js app router, static-first, agentic engineering infrastructure',
  blocks: [
    {
      kind: 'callout',
      title: 'The Core Architecture Goal',
      text:
        'Traditional content management patterns require a central registry or shared global types file. This creates an architectural bottleneck—every new page requires modifying a shared central hub. Fractera completely isolates every page into a standalone folder. The system lists pages automatically at build time, ensuring that components never rot and files never spread across your repo.',
    },
    {
      kind: 'p',
      text:
        'This blueprint details the Content Engine running beneath Fractera’s public channels—including news, blogs, and documentation surfaces. The goal is structural simplification. By isolating data from routing logic, an AI agent or a developer can build, deploy, or completely delete the 100th page just as safely and cheaply as the very first.',
    },

    { kind: 'h2', text: 'The Core Architecture: Why Co-Location Matters' },
    {
      kind: 'p',
      text:
        'Standard web frameworks typically process three core content tasks across separate locations: holding raw data, rendering the layout view, and maintaining a master index list. Coupling these tasks to a single, global router script or a massive shared types file forces your development tools to parse unrelated system code just to change a line of text. Fractera enforces a strict folder-isolation rule: everything a specific page requires to compile safely lives strictly within its own dedicated directory.',
    },

    { kind: 'h2', text: 'The Structural Bottlenecks We Removed' },
    {
      kind: 'p',
      text:
        'By establishing isolated page folders, this engine cleanly resolves three classic scalability failures by construction:',
    },
    {
      kind: 'list',
      items: [
        'Monolithic Code Bloat: Pages never swell into unmanageable single-file blocks because individual documents possess distinct, dedicated folders.',
        'All-or-Nothing Translation: Multi-language locales function as shallow metadata overrides merged key-by-key, letting you ship localized fields without duplicating base layouts.',
        'Manual Index Rot: You never update a master index file by hand. The platform scans your system directories and auto-generates navigation indexes during your build loop.',
      ],
    },

    { kind: 'h2', text: 'Folder Architecture: Co-Located Directories' },
    {
      kind: 'p',
      text:
        'A main content collection (like a blog hub) uses a shallow, high-level router container containing individual post directories beneath it. Each document layout strictly divides its code into three functional folders, making the entire workspace predictable at a single glance:',
    },
    {
      kind: 'code',
      text:
`app/[lang]/blog/                  ← Main Content Hub (Shallow Router)
  page.tsx                         Thin router link — exports index view only
  _components/                     VIEW LAYER — Visual design configurations
    index.tsx                      Post-list layout layout
  _lib/                            FUNCTION LAYER — System logic & typing contracts
    post.ts                        Resolution and data helpers
    types.ts                       Explicit types matching the hub layout
  _data/                           DATA LAYER — Localized interface strings
    en.ts                          Base-language text configurations
    ru.ts                          Localized language override
    index.ts                       Public API access hook: getBlogUi(lang)
  _list.generated.ts               AUTOMATION LAYER — Generated automatically at build-time
  the-end-of-prompt-engineering/   ← Isolated Content Document (One Post = One Folder)
    page.tsx                       Thin file export link
    _components/index.tsx          Composition module: createContentPost({ ... })
    _data/                         Raw page content payload
      meta.ts                      Immutable markers: slug, dates, indexing tags
      en.ts                        Primary base language content block
      index.ts                     Data contract exporter: { meta, en, overrides }`,
    },
    {
      kind: 'p',
      text:
        'To provision a new page, you simply create a fresh folder. To wipe a page out, you delete its directory. This ensures that zero orphan files or dangling import paths remain scattered across your master repository.',
    },

    { kind: 'h2', text: 'Slashing Developer Deployment Time' },
    {
      kind: 'p',
      text:
        'With Fractera, setting up a content view is no longer a multi-file DevOps task. There are no centralized routing tables to update, no shared types modules to expand, and no indexes to write. You copy an adjacent folder layout, modify the internal markdown data files, and let the build compiler handle the indexing. Critical structural components—including SEO meta tags, breadcrumb trees, tables of contents, and schema markup—are applied automatically by our page factories.',
    },

    { kind: 'h2', text: 'Optimizing the AI Development Loop' },
    {
      kind: 'p',
      text:
        'The division of code between data, layout, and logic establishes a clear structural map. Need to modify page copy? Open `_data`. Adjust layout spacing? Open `_components`. Update functional parameters? Open `_lib`. Because file roles are determined entirely by their folder category, neither developers nor automated coding models waste time searching the directory tree.',
    },

    { kind: 'h2', text: 'The Ultimate Payoff: Total Token Efficiency' },
    {
      kind: 'p',
      text:
        'The operational cost of using an AI coding engine depends directly on how many lines of workspace code it must ingest to execute a safe edit. Fractera enforces clean boundaries around this context window, compounding your API savings as your application expands:',
    },
    {
      kind: 'list',
      items: [
        'Bounded Scope: Modifying a single view prompts the agent to open one isolated directory, keeping its working set localized and predictable.',
        'Zero Central Read Fees: Because discovery runs automatically at build time, agents never load and reconcile an escalating central routing database.',
        'Unified Design Semantics: A single, shared block vocabulary means your models never have to memorize duplicate, per-surface layouts or type variations.',
        'Targeted File Execution: The explicit data/logic separation cuts out directory crawling, allowing models to expend token budgets purely on logic execution.',
      ],
    },

    {
      kind: 'p',
      text:
        'Legacy codebases typically pull multiple interdependent files and global config hubs into an agent\'s context window just to modify a layout block—wasting thousands of lines of token input. Fractera limits file access strictly to a localized folder target. File modifications and input consumption drop to a near-flat line, ensuring your infrastructure architecture pays for itself across every future build.',
    },

    { kind: 'h2', text: 'A Structural Design System' },
    {
      kind: 'p',
      text:
        'Your page content is never handled as loose, unvalidated HTML markup. Instead, it is processed as an ordered array of strongly-typed structural components: headings, quotes, standard paragraphs, images, callouts, and multi-column grid containers. Every specific block maps back to a single global renderer engine inside your shared project directory. If you want to change your global layout appearance, you edit that single component block—propagating fast, safe visual updates across thousands of live pages simultaneously with zero manual refactoring.',
    },

    {
      kind: 'founder',
      text:
        'Strategy is about creating predictable execution states. We establish solid code foundations so that every architectural move we execute multiplies our long-term velocity while minimizing system maintenance overhead.',
    },

    {
      kind: 'docref',
      title: 'The Content Engine — Full Architectural Blueprint',
      summary:
        'The complete engineering standard detailing layout layer separation, component factory schemas, multi-locale data mapping parameters, and automated filesystem parsing protocols.',
      href: '/docs/content-engine-en.md',
      label: 'Download Complete Standard (PDF)',
      kicker: 'Technical Blueprint',
    },
  ],
  faq: [
    {
      q: 'How does this layout structure protect my AI token context window?',
      a: 'By restricting your agent’s execution bounds to co-located folders. To add or modify an application page, the AI model opens a single isolated directory instead of reading a vast, global library or modifying a centralized routing index. This prevents unnecessary repository parsing loops and drops your token overhead to an absolute minimum.',
    },
    {
      q: 'Why is this considered a unified design system rather than a flat template collection?',
      a: 'Because your data payloads are authored as structured, typed code blocks rather than raw text. Each block points back to a single shared renderer component. Modifying that single renderer layout updates the visual layout uniformly across thousands of distinct live staging pages without code mutations.',
    },
    {
      q: 'What happens to the framework compilation speed as I add hundreds of pages?',
      a: 'Velocity remains perfectly linear and fast. Every new document acts as a purely additive, self-contained folder that our directory scanner compiles at build time. No global registers are modified, language variations act as lightweight micro-overrides, and background server overhead never scales up with content growth.',
    },
  ],
}