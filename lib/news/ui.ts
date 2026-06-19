// Localized UI chrome for the News feature (index + article pages). Kept next to
// the news content (lib/news/articles.ts is the EN-only content source); these are
// the surrounding interface labels, localized per rule 4а — never hardcoded inline.
// Minimum en + ru; add a language by adding an entry. Article title/H1/H2 and the
// SEO metadata are localized separately via the article's own i18n overrides
// (resolveArticle); this file is only the wrapper labels.

export type NewsUi = {
  metaTitle: string
  metaDescription: string
  eyebrow: string
  indexTitle: string
  indexIntro: string
  breadcrumbNews: string
  minRead: string
  tocHeading: string
  faqHeading: string
  backToNews: string
}

const UI: Record<string, NewsUi> = {
  en: {
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
  },
  ru: {
    metaTitle: 'Новости | Fractera',
    metaDescription:
      'Новости Fractera — каждое обновление проекта в хронологическом порядке: новые стартеры фреймворков, возможности AI-workspace, навыки агентов и MCP-инструменты. Каждое обновление сразу попадает в векторную базу знаний LightRAG, поэтому всю историю изменений можно искать с помощью ИИ прямо из рабочего пространства.',
    eyebrow: 'Новости Fractera',
    indexTitle: 'Новости',
    indexIntro:
      'Каждое актуальное обновление проекта в хронологическом порядке — новые стартеры фреймворков, возможности AI-workspace, навыки агентов и MCP-инструменты. Каждое обновление одновременно сохраняется в векторную базу знаний, поэтому всю историю можно искать с помощью ИИ прямо из вашего рабочего пространства.',
    breadcrumbNews: 'Новости',
    minRead: 'мин чтения',
    tocHeading: 'Содержание',
    faqHeading: 'Частые вопросы',
    backToNews: 'Ко всем новостям',
  },
}

export function getNewsUi(lang: string): NewsUi {
  return UI[lang] ?? UI.en
}
