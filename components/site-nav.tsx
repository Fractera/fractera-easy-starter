// Section navigation — scroll-to anchors for the home page's sections. Server-
// rendered (links in static HTML), placed at the bottom of the home feed. The list
// and ids match the footer's site contents (components/site-footer.tsx) so the two
// stay consistent. Localized en/ru, English fallback.

type NavItem = { label: string; id: string }

const HEADING: Record<string, string> = {
  en: 'Site navigation',
  ru: 'Навигация по сайту',
}

const SECTIONS: Record<string, NavItem[]> = {
  en: [
    { label: 'Top', id: 'hero' },
    { label: 'AI coding', id: 'ai-coding' },
    { label: 'AI platforms', id: 'platforms' },
    { label: 'Problem & solution', id: 'problem' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'MCP server', id: 'mcp-section' },
    { label: 'Features', id: 'features' },
    { label: 'Sponsor us', id: 'sponsors' },
    { label: 'FAQ', id: 'faq' },
    { label: 'Cases', id: 'cases' },
  ],
  ru: [
    { label: 'Главная', id: 'hero' },
    { label: 'AI-разработка', id: 'ai-coding' },
    { label: 'AI-платформы', id: 'platforms' },
    { label: 'Проблема и решение', id: 'problem' },
    { label: 'Тарифы', id: 'pricing' },
    { label: 'MCP-сервер', id: 'mcp-section' },
    { label: 'Возможности', id: 'features' },
    { label: 'Поддержать', id: 'sponsors' },
    { label: 'Вопросы и ответы', id: 'faq' },
    { label: 'Кейсы', id: 'cases' },
  ],
}

export function SiteNav({ lang }: { lang: string }) {
  const heading = HEADING[lang] ?? HEADING.en
  const list = SECTIONS[lang] ?? SECTIONS.en
  if (list.length === 0) return null

  return (
    <nav aria-label="Site navigation" className="w-full rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-violet-400/70">{heading}</p>
      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2.5 text-[15px] leading-snug">
        {list.map(item => (
          <li key={item.id}>
            <a href={`/${lang}#${item.id}`} className="text-white/65 transition-colors hover:text-violet-300">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
