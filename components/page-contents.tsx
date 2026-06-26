// "Page contents" — a numbered table of contents for the home page's OWN sections,
// scroll-to anchors with short (≤2-word) labels. Rendered on the SERVER (links in
// static HTML). Sits right under the hero, above the first content block. The ids
// match the section wrappers in app/[lang]/page.tsx. Localized en/ru, English fallback.

type Item = { label: string; id: string }

const HEADING: Record<string, string> = {
  en: 'Page contents',
  ru: 'Оглавление страницы',
}

const ITEMS: Record<string, Item[]> = {
  en: [
    { label: 'Top', id: 'hero' },
    { label: 'Problem', id: 'problem' },
    { label: 'AI loop', id: 'ai-loop' },
    { label: 'AI coding', id: 'ai-coding' },
    { label: 'Platforms', id: 'platforms' },
    { label: 'Features', id: 'features' },
    { label: 'Frameworks', id: 'connect-framework' },
    { label: 'Cases', id: 'cases' },
    { label: 'Sponsor', id: 'sponsors' },
    { label: 'FAQ', id: 'faq' },
  ],
  ru: [
    { label: 'Главная', id: 'hero' },
    { label: 'Проблема', id: 'problem' },
    { label: 'AI-цикл', id: 'ai-loop' },
    { label: 'AI-разработка', id: 'ai-coding' },
    { label: 'Платформы', id: 'platforms' },
    { label: 'Возможности', id: 'features' },
    { label: 'Фреймворки', id: 'connect-framework' },
    { label: 'Кейсы', id: 'cases' },
    { label: 'Поддержать', id: 'sponsors' },
    { label: 'Вопросы', id: 'faq' },
  ],
}

export function PageContents({ lang }: { lang: string }) {
  const heading = HEADING[lang] ?? HEADING.en
  const list = ITEMS[lang] ?? ITEMS.en
  if (list.length === 0) return null

  return (
    <nav aria-label="Page contents" className="w-full rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-violet-400/70">{heading}</p>
      <ol className="mt-3 flex flex-col gap-2">
        {list.map((item, i) => (
          <li key={item.id} className="flex gap-3 text-[15px] leading-snug">
            <span aria-hidden="true" className="select-none font-mono text-sm text-white/30">
              {String(i + 1).padStart(2, '0')}
            </span>
            <a href={`/${lang}#${item.id}`} className="text-white/65 transition-colors hover:text-violet-300">
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
