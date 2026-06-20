// Canonical block/content types shared by blog, news and documentation. Inline
// markup inside text fields supports **bold** and [label](url); blocks add
// headings, quotes, lists, figures, code (monospace schematics) and CTAs.

export type BlogAuthor = { name: string; role: string; avatar?: string }

export type BlogBlock =
  | { kind: 'p'; text: string }
  | { kind: 'h2'; text: string }
  | { kind: 'h3'; text: string }
  | { kind: 'quote'; text: string; cite?: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'olist'; items: string[] }
  | { kind: 'figure'; media: 'image' | 'video'; src: string; alt: string; caption?: string; href?: string }
  | { kind: 'code'; text: string }
  | { kind: 'cta'; text: string; href: string; label: string }
  | { kind: 'note'; text: string }
  | { kind: 'frameworks' }
  // Founder pull-quote in the homepage testimonial design (gradient-violet text +
  // author photo/name/role + social links). Author defaults to the site founder.
  | { kind: 'founder'; text: string }
  // Reference card to a full raw document with a download button (e.g. a living
  // pipeline standard shipped under /public/docs). title + one-line summary + file.
  | { kind: 'docref'; title: string; summary: string; href: string }
  // "Did you know" callout — icon + tinted panel for an aside fact (e.g. the page
  // auto-updates in real time as an AI agent edits it). title is the lead-in.
  | { kind: 'callout'; title: string; text: string }

export type FaqPair = { q: string; a: string }

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
  heroPoster?: string
  heroAspect?: string
  ogImage: string
  blocks: BlogBlock[]
  faq?: FaqPair[]
}
