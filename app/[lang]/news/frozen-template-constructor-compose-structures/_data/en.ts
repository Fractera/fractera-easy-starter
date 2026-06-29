import type { NewsArticleBase } from '../../_lib/types'

export const en: NewsArticleBase = {
  title: 'The Frozen Template Constructor: whole structures, composed not generated',
  seoTitle: 'Frozen Template Constructor — compose structures, no code generation',
  subtitle:
    'A constructor, not a catalogue: the agentic engineering platform now adds a whole structure — a news feed, a blog, documentation — by composing it from a small basis of vetted frozen bricks. Zero code generation; the same result from any AI model.',
  description:
    'The Frozen Template Constructor composes a whole site structure from a small basis of proven frozen bricks by file copy plus token substitution — no code generation, identical across any model. It matches each request by an envelope and refuses honestly when nothing fits.',
  summary:
    'A constructor composes whole structures from a few vetted frozen bricks — no code generation, the same result from any AI model, and an honest refusal when a request does not fit.',
  keywords:
    'frozen template constructor, agentic engineering, no code generation, composition, envelope matching, MCP, self-hosted',
  blocks: [
    { kind: 'quote', text: 'A thousand templates is not a strategy. A small set of bricks and a few rules for composing them — that is.' },
    { kind: 'p', text: 'Last week we shipped a way to add a page group by thawing a frozen template. Using it taught us the real shape of the problem — and a cleaner answer. Adding a structure to a site has several independent dimensions: how deep the hierarchy is, where the data comes from, who may see it, which languages. A catalogue would need a finished template for every combination — hundreds of them. So instead of a catalogue, the [Agentic Engineering Infrastructure](/en) now uses a **constructor**.' },
    { kind: 'h2', text: 'A constructor, not a catalogue' },
    { kind: 'p', text: 'Think LEGO: a handful of well-made bricks compose into an enormous space of models. The constructor keeps a small basis of **vetted frozen bricks** and a few rules for assembling them. It **composes** a structure to order — and, crucially, it never generates code. Composition copies and wires proven pieces, so the built-in brain and every coding agent produce the identical result, fast and cheap.' },
    { kind: 'callout', title: 'The key promise.', text: 'No model writes code for your new structure. It is assembled from frozen, pre-tested bricks — which is exactly why the result is the same whether your workspace runs one AI model or six.' },
    { kind: 'h2', text: 'Two slots, and one rule that keeps it simple' },
    { kind: 'p', text: 'Every property of a structure lives in one of two slots: a **list provider** (where the items come from — files, or a database read at build time) or a **uniform aspect** (a rule applied identically at every level — languages, or who is allowed to see it). The two never interact. That single discipline is what stops the design from exploding: a role rule is the same rule whether the structure is one level deep or four, file-backed or database-backed.' },
    { kind: 'h2', text: 'It matches your request — or refuses honestly' },
    { kind: 'p', text: 'Each brick declares an **envelope** — its position on every axis (data source, depth, static or dynamic, roles, languages). A request matches a brick only if it fits on every axis. Ask for a news section and it composes one. Ask for something no brick serves — a live dashboard, a shopping cart, a deep database catalogue — and the agent tells you exactly which axis does not fit, then offers to build a new brick (once the shape is proven) or to use classic development. It never forces a bad fit and never invents fragile code. The same honest-matching idea powers our note on [multilingual content architecture](/en/news/multilingual-content-architecture).' },
    { kind: 'docref', title: 'The Frozen Template Constructor — full strategy', summary: 'The whole model: constructor vs catalogue, the two-slot law, the base grid, envelope matching, versioning, and how the basis grows by harvest.', href: '/docs/frozen-template-constructor.md' },
    { kind: 'h2', text: 'Now every section knows where it belongs in your menus' },
    { kind: 'p', text: 'A composed section no longer floats unattached. Each one now carries a small **manifest** describing how it should appear in your navigation — the top bar, the footer, and the left or right slide-out drawers some designs use. For each of those menus, two settings: whether the section shows there, and in what **order** among the other buttons. A fifth setting decides whether the button opens the section directly or **expands its pages as a dropdown**. By default a new section stays out of every menu — you switch it on deliberately.' },
    { kind: 'callout', title: 'Proven end to end, by conversation.', text: 'This is not a promise — it already works. Tell your workspace "put news and blog in the top menu, and documents in the right drawer as a dropdown of its pages," and that is exactly the arrangement you get. List every section, reorder a button, change which role may see one, switch its languages, even change its URL — each is a precise file edit, never generated code, and the same result from any AI model.' },
    { kind: 'h2', text: 'Grown one proven brick at a time' },
    { kind: 'p', text: 'The constructor does not pre-build every possible structure — that would be the same unscalability from the other end. The grid of possibilities is a map, not a build plan: a cell is frozen into a brick only once it has proven itself in real work and repeats. Today there is one reference brick (a flat, file-backed, multilingual list — news, blog, docs); the rest are on the roadmap, each built when it earns its place.' },
    { kind: 'founder', text: 'I want the boring, repeatable parts of building software to become a single sentence you say out loud — and the result to be correct, yours, and on your own machine. The constructor is that idea, made disciplined.' },
  ],
  faq: [
    { q: 'Does an AI model write the code for the new structure?', a: 'No. The constructor composes from frozen, pre-tested bricks by file copy plus filling in your parameters. No code is generated, so any model gives the same result.' },
    { q: 'What can I create today?', a: 'A flat, file-backed, multilingual list — a news section, a blog, or a documentation feed. More bricks (deeper trees, database-backed catalogues) are added as each proves itself.' },
    { q: 'What if I ask for something it cannot build?', a: 'The agent names the exact axis that does not fit and offers to build a new brick (once proven) or use classic development — it never forces the wrong brick or invents unreliable code.' },
    { q: 'Why a constructor instead of ready-made templates?', a: 'Because the space of structures has several independent dimensions; a finished template per combination would be hundreds. A few composable bricks cover the same space without the explosion.' },
    { q: 'Can I add a section to my top menu, or change its order?', a: 'Yes. Each section carries menu settings for the top bar, the footer, and the left and right drawers — each with an on/off and an order — plus a flag to expand its pages as a dropdown. Ask your workspace to enable a menu, reorder the button, or flip the dropdown; it edits the section manifest directly, with no code generated. A new section starts hidden from every menu until you turn it on.' },
  ],
}
