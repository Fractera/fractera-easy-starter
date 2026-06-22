import type { NewsUi } from '../_lib/types'

// English UI chrome for the News feature (rule 4а — localized data, never
// hardcoded inline). One file per language; a new language = a new file + a line
// in ./index.ts. Article title/H1/H2 and SEO metadata are localized separately via
// each article's own per-language override file; this is only the wrapper labels.
export const en: NewsUi = {
  metaTitle: 'News | Fractera',
  metaDescription:
    'Fractera news — every update to the project in chronological order: new framework starters, AI-workspace features, agent skills and MCP tools. Each update is embedded into the LightRAG vector knowledge base the moment it ships, so the whole changelog is fully AI-searchable from inside your workspace.',
  eyebrow: 'Fractera news',
  indexTitle: 'News',
  indexIntro:
    'Every current update to the project, in chronological order — new framework starters, AI-workspace features, agent skills and MCP tools. Each update is saved into the vector knowledge base at the same time it ships, which means the whole history is fully searchable with AI from inside your workspace.',
  breadcrumbNews: 'News',
  minRead: 'min read',
  tocHeading: 'In this article',
  faqHeading: 'Frequently asked questions',
  backToNews: 'Back to all news',
  titleSuffix: 'Fractera News',
}
