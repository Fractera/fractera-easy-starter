// Site table-of-contents — a numbered list of the site's content sections, rendered
// on the SERVER so the links are in the static HTML (SEO). Mounted at the TOP and
// BOTTOM of the home page only (app/[lang]/page.tsx). The section list is manual /
// editable below; labels are localized (en/ru, English fallback).

type TocItem = { label: string; href: string }

const HEADING: Record<string, string> = {
  en: 'Contents',
  ru: 'Содержание сайта',
}

// Manual, editable section list. href is WITHOUT the language prefix — the active
// /<lang> is prefixed below. Labels per language, English fallback.
const SECTIONS: Record<string, TocItem[]> = {
  en: [
    { label: 'News', href: '/news' },
    { label: 'Blog', href: '/blog' },
    { label: 'Documentation', href: '/documentation' },
  ],
  ru: [
    { label: 'Новости', href: '/news' },
    { label: 'Блог', href: '/blog' },
    { label: 'Документация', href: '/documentation' },
  ],
}

export function SiteToc({ lang }: { lang: string }) {
  const heading = HEADING[lang] ?? HEADING.en
  const list = (SECTIONS[lang] ?? SECTIONS.en).map(s => ({ label: s.label, href: `/${lang}${s.href}` }))
  if (list.length === 0) return null

  return (
    <nav aria-label="Contents" className="w-full rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-violet-400/70">
        {heading} · {list.length}
      </p>
      <ol className="mt-3 flex flex-col gap-2">
        {list.map((item, i) => (
          <li key={item.href} className="flex gap-3 text-[15px] leading-snug">
            <span aria-hidden="true" className="select-none font-mono text-sm text-white/30">
              {String(i + 1).padStart(2, '0')}
            </span>
            <a href={item.href} className="text-white/65 transition-colors hover:text-violet-300">
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
