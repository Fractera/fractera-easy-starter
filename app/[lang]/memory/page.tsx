import type { Metadata } from 'next'
import { getContent } from '@/lib/i18n/locales'
import { buildAlternates } from '@/lib/seo/alternates'
import { BRAND } from '@/lib/brand'

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

// Карточка ряда — один вид на все четыре раздела, где она встречается.
// 🔒 Четыре копии этой разметки разошлись бы на первой правке: та, которой
// пользуются реже, осталась бы с прежним видом.
function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-white/10 p-4 transition-colors hover:border-violet-500/30">
      <div className="text-base font-medium">{title}</div>
      <p className="mt-2 text-sm leading-relaxed text-white/50">{body}</p>
    </div>
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

  const pageUrl = `${BRAND.siteUrl}/${lang}/memory`

  // 🔒 РАЗМЕТКА СТРОИТСЯ ИЗ ТЕХ ЖЕ СТРОК, ЧТО ВИДИТ ЧЕЛОВЕК. Вторая копия
  // вопросов «для поисковика» разошлась бы с видимой на первой правке, а
  // разметка, не совпадающая с текстом страницы, — это ровно то, за что
  // поисковик наказывает.
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: BRAND.name, item: `${BRAND.siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: m.seo.title, item: pageUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: m.faq.items.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ]

  return (
    <main className="min-h-screen bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
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

      {/* ПРОСТРАНСТВЕННО-ВРЕМЕННОЙ ОХВАТ */}
      <Section id="scope" title={m.scope.title} lead={m.scope.lead}>
        <div className="grid gap-3 md:grid-cols-3">
          {m.scope.items.map(item => (
            <Card key={item.title} title={item.title} body={item.body} />
          ))}
        </div>
      </Section>

      {/* АРТЕФАКТ ВМЕСТО АБЗАЦА */}
      <Section id="artifacts" title={m.artifacts.title} lead={m.artifacts.lead}>
        <ol className="ml-5 list-decimal space-y-2 text-sm leading-relaxed text-white/80">
          {m.artifacts.steps.map(step => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </Section>

      {/* ПЕТЛЯ ЗАПОМИНАНИЯ */}
      <Section id="memoization" title={m.memoization.title} lead={m.memoization.lead}>
        <ol className="space-y-3">
          {m.memoization.chain.map((step, i) => (
            <li key={step} className="flex items-start gap-3">
              <span
                aria-hidden
                className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-violet-500/40 text-xs text-violet-200"
              >
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed text-white/80">{step}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* ЭВОЛЮЦИЯ НАВЫКОВ */}
      <Section id="evolution" title={m.evolution.title} lead={m.evolution.lead}>
        <div className="grid gap-3 md:grid-cols-3">
          {m.evolution.items.map(item => (
            <Card key={item.title} title={item.title} body={item.body} />
          ))}
        </div>
      </Section>

      {/* ЧЕТЫРЕ ХРАНИЛИЩА */}
      <Section id="stores" title={m.stores.title} lead={m.stores.lead}>
        <div className="grid gap-3 md:grid-cols-2">
          {m.stores.items.map(item => (
            <Card key={item.title} title={item.title} body={item.body} />
          ))}
        </div>
      </Section>

      {/* МУЛЬТИМОДАЛЬНОСТЬ */}
      <Section id="media" title={m.media.title} lead={m.media.lead}>
        <div className="grid gap-3 md:grid-cols-2">
          {m.media.items.map(item => (
            <Card key={item.title} title={item.title} body={item.body} />
          ))}
        </div>
      </Section>

      {/* ВСТРОЕННЫЙ СТЕНД */}
      <Section id="bench" title={m.bench.title} lead={m.bench.lead}>
        <ul className="ml-5 list-disc space-y-2 text-sm leading-relaxed text-white/80">
          {m.bench.items.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-5 font-mono text-sm text-white/40">{m.bench.where}</p>
      </Section>

      {/* СРАВНЕНИЕ.
          🔒 Таблиц столько, сколько их в словаре, и колонок столько, сколько
          соперников у каждой: у первой три, у второй один. Перечисли я их в
          разметке — третья таблица потребовала бы правки вёрстки. */}
      <Section id="comparison" title={m.comparison.title} lead={m.comparison.lead}>
        <div className="flex flex-col gap-10">
          {m.comparison.tables.map(table => (
            <div key={table.title}>
              <div className="mb-3 text-base font-medium text-violet-200">{table.title}</div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[44rem] text-left text-sm">
                  <thead className="text-white/50">
                    <tr>
                      <th className="py-2 pr-4 font-medium">{m.comparison.feature}</th>
                      <th className="py-2 pr-4 font-medium text-white">{m.comparison.ours}</th>
                      {table.rivals.map(rival => (
                        <th key={rival} className="py-2 pr-4 font-medium">
                          {rival}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map(row => (
                      <tr key={row.feature} className="border-t border-white/10 align-top">
                        <td className="py-3 pr-4 font-medium">{row.feature}</td>
                        <td className="py-3 pr-4 text-white/90">{row.ours}</td>
                        {row.rivals.map((cell, i) => (
                          <td key={`${row.feature}-${table.rivals[i] ?? i}`} className="py-3 pr-4 text-white/45">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ПРИМЕРЫ API */}
      <Section id="api" title={m.api.title} lead={m.api.lead}>
        <div className="flex flex-col gap-6">
          {m.api.samples.map(sample => (
            <div key={sample.title}>
              <div className="mb-2 text-sm font-medium text-white/80">{sample.title}</div>
              <pre className="overflow-x-auto whitespace-pre rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-xs leading-relaxed text-white/70">
                {sample.code}
              </pre>
            </div>
          ))}
        </div>
      </Section>

      {/* УСТАНОВКА: одна мысль, ни одной команды.
          🛑 Команда на витрине устаревает молча — человек скопирует её через
          полгода и получит отказ. Установку делает робот, и об этом словами. */}
      <Section id="install" title={m.install.title} lead={m.install.lead}>
        <div className="rounded-lg border border-violet-500/40 bg-violet-500/10 p-5">
          <p className="max-w-3xl text-base leading-relaxed text-white/85">{m.install.body}</p>
        </div>
      </Section>

      {/* ПРИНЦИПЫ */}
      <Section id="principles" title={m.principles.title}>
        <div className="grid gap-3 md:grid-cols-3">
          {m.principles.items.map(item => (
            <Card key={item.title} title={item.title} body={item.body} />
          ))}
        </div>
      </Section>

      {/* ВОПРОСЫ И ОТВЕТЫ.
          🔒 Раскрывающиеся элементы — нативные <details>, а не своя реализация
          на состоянии: содержимое ответа лежит в разметке ВСЕГДА и читается
          машиной даже закрытым. Аккордеон на JavaScript прячет текст и от
          поисковика тоже. */}
      <Section id="faq" title={m.faq.title} lead={m.faq.lead}>
        <div className="divide-y divide-white/10 border-y border-white/10">
          {m.faq.items.map(item => (
            <details key={item.q} className="group py-3">
              <summary className="cursor-pointer list-none text-base font-medium marker:content-none">
                <span
                  aria-hidden
                  className="mr-2 inline-block text-violet-300 transition-transform group-open:rotate-90"
                >
                  ›
                </span>
                {item.q}
              </summary>
              <p className="mt-2 max-w-3xl pl-5 text-sm leading-relaxed text-white/60">{item.a}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* ПРОЕКТ — ЕДИНСТВЕННАЯ ВНЕШНЯЯ ССЫЛКА И ЕДИНСТВЕННАЯ КНОПКА СТРАНИЦЫ.
          Решение владельца 2026-09-11: «Оставить как ссылку на репозиторий».
          Адрес берётся из BRAND.repoUrl — одного источника, а не вписан руками
          в двадцать второй раз. */}
      <Section id="project" title={m.project.label}>
        <p className="max-w-3xl text-base leading-relaxed text-white/80">{m.project.body}</p>
        <a
          href={BRAND.repoUrl}
          target="_blank"
          rel="noopener"
          className="mt-5 inline-block rounded-lg border border-violet-500/40 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-100 transition-colors hover:bg-violet-500/20"
        >
          {m.project.label}
        </a>
      </Section>

      {/* ЗАВЕРШАЮЩИЙ ПРИЗЫВ.
          🛑 Кнопок здесь нет — решение владельца «Убрать кнопки совсем»:
          в оригинале они вели на /passport и /settings самой службы, а на
          витрине таких адресов не существует. Остаётся текст. */}
      <Section id="cta" title={m.cta.title}>
        <p className="max-w-3xl text-base leading-relaxed text-white/80">{m.cta.body}</p>
      </Section>
    </main>
  )
}
