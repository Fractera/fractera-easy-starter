import type { NewsArticleBase } from '../../_lib/types'

export const en: NewsArticleBase = {
  title: 'Frozen archetypes: a whole page group in seconds, with no code generated',
  seoTitle: 'Frozen archetypes — add a page group without code generation',
  subtitle:
    'A new way the agentic engineering platform adds a news section, a blog or a documentation section — by thawing a frozen template instead of writing code. Pure file copy and label translation; zero code generation, identical across any AI model.',
  description:
    'Frozen archetypes let an AI agent add a whole page group (news, blog, documentation) by thawing a frozen template from a closed store — file copy plus token substitution, with no code generation. Faster, cheaper, and identical across any model.',
  summary:
    'Add a whole news, blog or documentation section by thawing a frozen template — file copy, not code generation. The same result from any AI model.',
  keywords:
    'frozen archetypes, agentic engineering, no code generation, page group, AI content architecture, MCP, self-hosted',
  blocks: [
    { kind: 'quote', text: 'Adding a news section used to mean an AI agent hand-writing thirty files. Now it is one call — and not a single line of code is generated.' },
    { kind: 'p', text: 'Building a group of pages — a news feed, a blog, a documentation section — is mechanical but large work. Until now an AI coding agent wrote every file by hand, which is slow, spends tokens, and drifts from the standard whenever the model improvises. The [Agentic Engineering Infrastructure](/en) replaces that with a **frozen archetype**: a ready-made "project in a box" that an agent thaws into your site with a few parameters.' },
    { kind: 'h2', text: 'What a frozen archetype is' },
    { kind: 'p', text: 'Think of it as a cookie cutter for a page group. The frozen archetype is an inert tree of template files with no fixed records — the specifics (which group, which languages, the label, how many examples) are **parameters**, not content. You say "I want a news section"; the agent presses the cutter with your parameters and out comes the working pages.' },
    { kind: 'p', text: 'It lives in a closed store on your own server, so nothing leaves your machine and every deployment already has it.' },
    { kind: 'h2', text: 'How thawing works — file copy, not code generation' },
    { kind: 'p', text: 'Thawing is deliberately dumb, and that is the point. The agent copies the template files into your project and fills in the blanks: it installs the shared content engine only if your site does not already have it, creates the section and a couple of example articles, and translates the section label ("News", "Новости", and so on) into each of your languages. The example articles inherit the ideal page structure — search-engine metadata, breadcrumbs, a table of contents, an FAQ — but use placeholder text and a placeholder image you replace later.' },
    { kind: 'list', items: [
      'No model writes code — it copies files and substitutes tokens.',
      'Any AI model (the built-in brain or any coding agent) produces an identical result.',
      'The pages are static and work with JavaScript switched off.',
    ] },
    { kind: 'callout', title: 'Good to know.', text: 'Because thawing is plain file copy, it is fast and cheap, and the same request gives the same pages whether your workspace runs one AI model or six. There is no clever generation step to go wrong.' },
    { kind: 'h2', text: 'When it fits, and when the agent refuses honestly' },
    { kind: 'p', text: 'One archetype does not serve every kind of site. Today there is one — a content collection — and it covers news, blogs and documentation. Ask for one of those and the agent thaws it. Ask for something it cannot serve well — a shop with a cart and checkout, a course with graded tests — and the agent tells you so honestly and offers to build a new archetype for it, instead of forcing a bad fit or inventing fragile code. This same idea — translating multilingual content the scalable way — is described in our note on [multilingual content architecture](/en/news/multilingual-content-architecture).' },
    { kind: 'docref', title: 'Frozen Archetypes — full documentation', summary: 'The complete mechanism: the closed store, the two layers, how a thaw runs step by step, and how to author a new archetype.', href: '/docs/frozen-archetypes.md' },
    { kind: 'h2', text: 'Why this matters for an agentic engineering workspace' },
    { kind: 'p', text: 'The whole promise of agentic engineering is that the boring, repeatable parts of building software become a single instruction. Frozen archetypes turn "add a section to my site" from a careful coding task into a request anyone can make — and the result is the same, every time, on your own server.' },
    { kind: 'founder', text: 'I want building a website to feel like talking, not like assembling furniture. A frozen archetype is one more place where you say what you want and it simply appears — correct, yours, and on your own machine.' },
  ],
  faq: [
    { q: 'Does an AI model write the code for the new pages?', a: 'No. Thawing is pure file copy plus filling in your parameters. No code is generated, which is why any model gives the same result.' },
    { q: 'What can I create today?', a: 'A content collection: a news section, a blog, or a documentation section. More archetypes (for other kinds of pages) are added over time.' },
    { q: 'What if I ask for something it cannot build?', a: 'The agent tells you honestly that this archetype does not fit and offers to author a new one — it will not force the wrong template or invent unreliable code.' },
    { q: 'Do the new pages work without JavaScript?', a: 'Yes. The pages are static and fully readable with JavaScript switched off, like the rest of the platform.' },
  ],
}
