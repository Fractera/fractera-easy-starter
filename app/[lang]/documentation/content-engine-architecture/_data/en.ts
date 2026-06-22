import type { DocBase } from '../../_lib/types'

// English base document for /documentation/content-engine-architecture. A mission
// piece about the content engine: what it is, the problem it solves, the time it
// saves, and — above all — the tokens it saves; plus its second gift, a design
// system you steer by structure. Ends with the founder note + the downloadable
// English standard. RU override lives in ./ru.ts.
export const en: DocBase = {
  title: 'The Content Engine: A Prelude to Sites That Build Themselves',
  description:
    'The architecture behind every Fractera content surface — news, blog, documentation, landing pages — built from one self-contained, auto-discovered, statically-rendered shape. Why it exists, the problem it removes, how it cuts development time, how it slashes the tokens an AI agent spends, and how the same block catalog doubles as a design system you change once and see everywhere.',
  summary:
    'One architecture behind every page: self-contained folders, auto-discovery, no registry — built to cut development time and, above all, the tokens an AI agent spends. Its second gift: a design system you change by structure, once, everywhere.',
  keywords:
    'content engine, co-location architecture, token economy, AI agent tokens, design system, block catalog, Next.js app router, static-first, agentic engineering infrastructure',
  blocks: [
    {
      kind: 'callout',
      title: 'A quiet, structural breakthrough',
      text:
        'Most "content systems" buy convenience today and pay for it forever — a central registry every author edits, a dynamic route that guesses, a shared types file everyone must touch. This engine pays once: every page is a self-contained folder, the list of pages builds itself, and nothing in the middle can rot. The payoff is measured not in features but in time and tokens.',
    },
    {
      kind: 'p',
      text:
        'This document is a prelude. It describes the engine that now sits under every content surface of our [Agentic Engineering Infrastructure](/en) — news, blog, documentation, the deployment pages — and, more importantly, the way of thinking it encodes. The goal was never "a nicer blog". The goal was a foundation on which an AI agent (or a person) can add the hundredth page as cheaply as the first, and on which a single change to a visual idea reaches a hundred pages at once.',
    },

    { kind: 'h2', text: 'What we built, and why' },
    {
      kind: 'p',
      text:
        'A content surface always does three jobs: hold data, render itself as a page, and appear in a list. The naive way couples those jobs to a central spine — one global registry, one dynamic `[slug]` route, one shared "god" types file. The spine is the bottleneck: every new item touches it, every refactor risks it, every agent must load it to do anything. We removed the spine. The rule is one sentence: everything a page needs lives inside its own folder; everything shared lives once in the engine; nothing in between.',
    },

    { kind: 'h2', text: 'The problem it solves' },
    {
      kind: 'p',
      text:
        'Three failures that only show up at scale, gone by construction. Ever-growing single-file blobs of content — gone, because each document is its own folder. All-or-nothing translation — gone, because a language is a partial override merged key by key over a base, so a page can ship in a new language with a single translated field. And the slow rot of a hand-maintained index — gone, because the list of pages is generated from the filesystem at build time, never written by hand.',
    },

    { kind: 'h2', text: 'Every page is a folder — here is the shape' },
    {
      kind: 'p',
      text:
        'A tab (a collection like the blog) is a folder with a thin router on top and post folders below. Three service folders carry the strict split — `_components` is the view, `_lib` is the functions and type contracts, `_data` is the data (including the localized UI strings) — and one generated file is the auto-built list. Every post repeats the exact same shape. Read the tree and the whole machine is visible at a glance:',
    },
    {
      kind: 'code',
      text:
`app/[lang]/blog/                      ← a content tab (router on top, posts below)
  page.tsx                            thin router — re-exports the index, nothing else
  _components/                        VIEW — how the tab looks
    index.tsx                         the post-list view
  _lib/                               FUNCTIONS — logic & type contracts
    post.ts                           resolve / list helpers (built on the shared engine)
    types.ts                          the tab's type contracts
  _data/                              DATA — localized UI strings (never hardcoded in the view)
    en.ts                            base-language chrome
    ru.ts                            language override
    index.ts                         public API: getBlogUi(lang)
  _list.generated.ts                  AUTO — built by parser-fs at build time (never edited)
  the-end-of-prompt-engineering/      ← one post = one co-located folder
    page.tsx                          thin re-export
    _components/index.tsx             composition: createContentPost({ … })
    _data/                            this post's content
      meta.ts                         non-translatable: slug, date, tags, image
      en.ts                           the full base document (+ optional ru.ts override)
      index.ts                        data = { meta, en, overrides: { ru } }`,
    },
    {
      kind: 'p',
      text:
        'Add a page by adding a folder; delete a page by deleting the folder, with zero orphans left behind anywhere in the project. The shared engine — the block catalog, the per-key language resolver, the page factories and the one page template — lives once, outside the tabs, and is reused by every one of them, never copied in.',
    },

    { kind: 'h2', text: 'Less time to ship' },
    {
      kind: 'p',
      text:
        'A new page is no longer a project. There is no registry to wire, no route to register, no shared type to extend, no list to update. You copy a neighbouring folder, replace the data, and the page is live and indexed. The boilerplate that every page would otherwise repeat — metadata, structured data, breadcrumbs, the table of contents, the SEO snippet — is produced once by the factory, so a new document is a few lines of composition plus its content. Authoring a page is writing data.',
    },

    { kind: 'h2', text: 'A development process tuned for agents' },
    {
      kind: 'p',
      text:
        'The strict split is a map. Need to change wording? It is in `_data`. Behaviour or types? `_lib`. Layout? `_components`. Because the location is implied by the kind of change, neither a person nor an agent has to explore the repository to find the right file. The shape is predictable, the moves are local, and the work never spreads across the codebase.',
    },

    { kind: 'h2', text: 'The real prize: token economy' },
    {
      kind: 'p',
      text:
        'This is the point. The cost of an AI coding agent is dominated by how much it must read into its context to act safely. This layout bounds that cost by construction — and the savings compound with every page you own:',
    },
    {
      kind: 'list',
      items: [
        'Editing one page loads one folder. The working set is small and predictable — not a sprawling shared library plus a registry the agent must read and keep consistent.',
        'No registry to read or maintain. Discovery happens at build time from the filesystem, so the single most expensive habit — loading and reconciling a central list — simply does not exist.',
        'One neutral block catalog. Read it once and you know the authoring vocabulary for every tab; there are no duplicate, per-tab type definitions to re-learn.',
        'The right file is named, not hunted. The _lib / _data / _components split removes exploration — the agent spends context on the task, not on the search for it.',
        'Delete is one folder, no orphan hunt. Removing content never forces a cross-repository trace for dangling imports.',
      ],
    },
    {
      kind: 'p',
      text:
        'Concretely and illustratively: a registry-based design pulls three to five files into context per edit and greps to find them — easily thousands of lines. Here a page edit touches one or two files in a known folder, and a brand-new page touches zero existing files. Files-touched-per-task and lines-loaded-per-task both collapse toward a constant. Multiply that by every future page and every future agent, and the architecture pays for itself many times over.',
    },

    { kind: 'h2', text: 'A second gift: a design system you steer by structure' },
    {
      kind: 'p',
      text:
        'Content here is not free-form HTML; it is a list of typed blocks — paragraph, heading, quote, list, figure, callout, the founder note, the download card, and their container layouts. Each block kind has exactly one renderer, living once in the shared catalog. That is what makes this a design system, not just a renderer: change how a block looks in that one place, and every page that uses the block changes with it — instantly, uniformly, even across hundreds of pages. You manage presentation by structure. Decide to restyle every quote, every callout, every two-column section, and you edit one renderer, not a hundred pages. A design system that is governed dynamically — by the structure of the blocks themselves — is the quiet second payoff of the same architecture that saves the tokens.',
    },

    {
      kind: 'founder',
      text:
        'Strategy, newly understood, is a way of increasing uncertainty. We fix what we already have, and we try to make the kind of moves that multiply the number of places we could end up. The meaning of strategy is the path itself — the search for the optimal goal while already in motion.',
    },

    {
      kind: 'docref',
      title: 'The Content Engine — full engineering standard',
      summary:
        'The complete standard, in English: the three layers, the mandatory-component trees, the source of every component (the block catalog, the resolver, both factories, the page template, the build-time list generator), the authoring recipes, and a worked example of scaling the engine to a brand-new surface — a shop with product cards.',
      href: '/docs/content-engine-en.md',
      label: 'Download the standard (EN)',
      kicker: 'Full engineering standard',
    },
  ],
  faq: [
    {
      q: 'How does this actually save tokens for an AI agent?',
      a: 'Because the working set for any task is bounded by co-location. To create or edit a page the agent opens one self-contained folder, not a sprawling library plus a central registry it must read and keep consistent. Auto-discovery removes the read-and-maintain-a-list cost, the neutral block catalog removes duplicate type definitions, and the strict _lib / _data / _components split makes the right file findable without exploration. A new page touches zero existing files.',
    },
    {
      q: 'Why is it a design system and not just a set of templates?',
      a: 'Because content is authored as typed blocks, and each block kind has a single renderer in the shared catalog. Changing that one renderer restyles every page that uses the block at once — even across hundreds of pages. You change presentation by structure, in one place, and it propagates everywhere; that is precisely what a dynamically-managed design system is.',
    },
    {
      q: 'What happens when I add the hundredth page, or the eighty-first language?',
      a: 'The hundredth page is exactly as cheap as the first: add a folder, the build-time generator picks it up, nothing central is edited. The eighty-first language is a single new override file with only the fields you have translated — everything else falls back to the base per key. Growth stays additive and local; nothing has to be rewritten.',
    },
    {
      q: 'Is it still static and fast?',
      a: 'Yes. There is no dynamic [slug] route and no client-side routing; discovery happens at build time and every page is statically rendered, working even with JavaScript turned off. The engine was designed static-first so the architecture that saves tokens also gives predictable SEO, cheap caching and reproducible builds.',
    },
  ],
}
