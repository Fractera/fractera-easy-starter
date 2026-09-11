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

// Секция страницы: разделитель сверху, заголовок, необязательный лид, тело.
// 🔒 Порядок задан здесь один раз и снаружи не переставляется, а любую часть
// можно не дать. Две секции, свёрстанные по отдельности, разъезжаются — это
// замер, оплаченный в панели дважды (шаг 28).
function Section({
  id,
  title,
  lead,
  children,
}: {
  id: string
  title: string
  lead?: string
  children?: React.ReactNode
}) {
  return (
    <section id={id} className="border-t border-white/10">
      <div className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h2>
        {lead ? <p className="mt-3 max-w-3xl text-base leading-relaxed text-white/60">{lead}</p> : null}
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </section>
  )
}

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

      {/* ЗАДАЧА И ЧЁРНЫЙ ЯЩИК */}
      <Section id="concept" title={m.problem.title} lead={m.problem.lead}>
        <p className="max-w-3xl text-base leading-relaxed text-white/80">{m.problem.body}</p>
      </Section>

      {/* ПУТЬ ЗАПРОСА.
          🔒 Схема собрана блоками, а не псевдографикой: ASCII-рисунок оригинала
          ломается на телефоне и не читается экранным диктором. Переезжает
          смысл — один вход, один роутер, две ветки с разной ценой. */}
      <Section id="router" title={m.router.title} lead={m.router.lead}>
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-white/10 px-4 py-3 text-center text-sm text-white/70">
            {m.router.inbox}
          </div>
          <div aria-hidden className="text-center text-white/30">
            ↓
          </div>
          <div className="rounded-lg border border-violet-500/40 bg-violet-500/10 px-4 py-3 text-center text-sm font-medium text-violet-100">
            {m.router.routerBox}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-white/10 p-4">
              <div className="text-sm font-medium">{m.router.cheapBranch}</div>
              <p className="mt-2 text-sm text-white/50">{m.router.cheapCost}</p>
            </div>
            <div className="rounded-lg border border-white/10 p-4">
              <div className="text-sm font-medium">{m.router.deepBranch}</div>
              <p className="mt-2 text-sm text-white/50">{m.router.deepCost}</p>
            </div>
          </div>
        </div>
      </Section>

      {/* СХЕМА, РАСТУЩАЯ САМА */}
      <Section id="schema" title={m.schema.title}>
        <p className="max-w-3xl text-base leading-relaxed text-white/80">{m.schema.body}</p>
      </Section>

      {/* ЛЕСТНИЦА ЦЕНЫ.
          🔒 Таблица прокручивается ВНУТРИ своего контейнера: широкое содержимое,
          растягивающее body, даёт горизонтальную прокрутку всей страницы. */}
      <Section id="ladder" title={m.ladder.title} lead={m.ladder.lead}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="text-white/50">
              <tr>
                <th className="py-2 pr-4 font-medium">{m.ladder.head.level}</th>
                <th className="py-2 pr-4 font-medium">{m.ladder.head.how}</th>
                <th className="py-2 pr-4 font-medium">{m.ladder.head.cost}</th>
                <th className="py-2 font-medium">{m.ladder.head.by}</th>
              </tr>
            </thead>
            <tbody>
              {m.ladder.rows.map(row => (
                <tr key={row.level} className="border-t border-white/10 align-top">
                  <td className="py-3 pr-4 font-medium whitespace-nowrap text-violet-200">{row.level}</td>
                  <td className="py-3 pr-4 text-white/80">{row.how}</td>
                  <td className="py-3 pr-4 text-white/80">{row.cost}</td>
                  <td className="py-3 text-white/50">{row.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 max-w-3xl text-sm italic leading-relaxed text-white/50">{m.ladder.example}</p>
      </Section>
    </main>
  )
}
