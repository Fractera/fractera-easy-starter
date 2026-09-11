import type { Metadata } from 'next'
import { getContent } from '@/lib/i18n/locales'
import { buildAlternates } from '@/lib/seo/alternates'

// СТРАНИЦА «ПАМЯТЬ» НА ВИТРИНЕ (шаг 187).
//
// 🎯 Просьба владельца 2026-09-11: перенести сюда содержимое корневой страницы
// службы памяти (memory.aifa.dev) — «переносим контент, но не структуру».
//
// 🔒 ОТСЮДА ГЛАВНОЕ РЕШЕНИЕ ФАЙЛА: ни один компонент, примитив типографики или
// токен дизайна той службы сюда не импортируется. У неё свой DESIGN-CONFIG с
// зелёной палитрой (#16a34a) и свои переменные шкалы текста; витрина живёт на
// чёрном фоне с фиолетовым акцентом. Дословный перенос разметки притащил бы
// чужой слой дизайна и либо не отрисовался, либо связал витрину с чужим
// продуктом — тем самым, который клиент вправе стереть.
//
// 🔒 ВСЕ СЛОВА ПРИХОДЯТ ИЗ СЛОВАРЯ ВИТРИНЫ. В этом файле нет ни одной фразы и
// ни одного `lang === 'ru' ? … : …`: язык переключается веткой словаря, как на
// всех остальных страницах.
//
// 🔒 СТРАНИЦА СТАТИЧЕСКАЯ. Ни `force-dynamic`, ни `cookies()`, ни `headers()` —
// канон статики витрины (STATIC-FIRST.md). Языки пререндерит
// `generateStaticParams` общего layout.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const m = getContent(lang).memory

  return {
    title: m.seo.title,
    description: m.seo.description,
    alternates: buildAlternates(lang, '/memory'),
    openGraph: {
      title: m.seo.title,
      description: m.seo.description,
      type: 'website',
    },
  }
}

export default async function MemoryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const m = getContent(lang).memory

  return (
    <main className="min-h-screen bg-black text-white">
      {/* ПЕРВЫЙ ЭКРАН: надзаголовок → H1 → лид → тело → метки.
          H1 на странице ровно один, и он здесь.
          🛑 Кнопок действия нет — решение владельца 2026-09-11 «Убрать кнопки
          совсем»: в оригинале они ведут внутрь самой службы, а на витрине таких
          адресов не существует. */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-14">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
          {m.hero.eyebrow}
        </p>

        <h1 className="mt-5 max-w-4xl text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
          {m.hero.title}
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/70">{m.hero.lead}</p>

        <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/50">{m.hero.body}</p>

        <ul className="mt-8 flex flex-wrap gap-2">
          {m.hero.badges.map(badge => (
            <li
              key={badge}
              className="rounded-full border border-violet-500/30 bg-violet-500/5 px-3.5 py-1.5 text-sm text-violet-200"
            >
              {badge}
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
