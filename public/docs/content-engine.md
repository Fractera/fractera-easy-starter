# Контент-движок — co-location, самодостаточность, дешевизна для ИИ

> Авторитетное «как это на самом деле работает» для контент-движка Fractera: единый
> универсальный механизм за каждой контент-поверхностью — **новости, блог,
> документация, страницы развёртывания** — и образец для любой новой (магазин,
> карточка товара, чейнджлог, глоссарий…). Английское зеркало:
> `CRUD-DOCS/workspace-standards/content-engine.md` в FNS. Узкий спутник:
> `multilingual-content.md` (рецепт i18n) ссылается сюда.

---

## 1. Зачем нужен этот движок

Контент-поверхность (статья, лендинг, карточка товара) — это всегда одни и те же три
задачи: **хранить данные**, **отрендерить их как полностью статическую страницу** и
**попасть в список**. Наивный путь связывает эти задачи через центральный «хребет» —
один глобальный реестр всех элементов, один динамический маршрут `[slug]`, один общий
«божественный» файл типов, который правит каждый автор. Этот хребет становится
бутылочным горлышком: каждый новый элемент его трогает, каждый рефакторинг им рискует,
каждый ИИ-агент обязан его загрузить, чтобы вообще что-то сделать.

Этот движок убирает хребет. Его единственное правило проектирования:

> **Всё, что нужно контент-поверхности, живёт внутри её собственной папки; всё общее
> живёт один раз в движке; ничего между ними.**

Конкретно это даёт четыре свойства:

- **Co-location** — один маршрут = одна папка. Страница, её вид, данные и хелперы лежат
  вместе. Чтобы изменить статью, открываешь одну директорию, а не пять.
- **Самодостаточность / удаляемость** — удали папку, и маршрут, его данные, строка в
  списке и хелперы исчезают разом, не оставив сирот в `lib/` или корне проекта.
  Добавление — зеркальная операция: положил папку — она появилась.
- **Авто-обнаружение** — список элементов генерируется из файловой системы на сборке
  (`parser-fs`), поэтому нет реестра, который нужно вести руками или читать.
- **Static-first** — нет динамического `[slug]`, нет клиентского роутинга, нет
  `force-dynamic`. Каждая страница — SSG/ISR и работает с выключённым JavaScript.

Движок масштабируется по двум осям, не трогая ни одного центрального файла: **больше
элементов существующего типа** (новая статья → новая папка) и **совершенно новый тип**
(магазин → новая папка-вкладка + одна строка в конфиге обнаружения). Раздел 7
проходит оба случая.

---

## 2. Три слоя (ментальная модель)

```
┌─ ОБОЛОЧКА МАРШРУТА ──────────────────────────────────────────────────────┐
│  app/[lang]/<tab>/page.tsx              тонкий: re-export из _components   │
│  app/[lang]/<tab>/<slug>/page.tsx       тонкий: re-export из _components   │
└───────────────────────────────────────────────────────────────────────────┘
            │ компонует                      │ авторится как
            ▼                                ▼
┌─ ПО ВКЛАДКЕ (внутри папки вкладки) ──────────────────────────────────────┐
│  _components/   ВИД        (index.tsx — React-композиция)                 │
│  _lib/          ФУНКЦИИ    (post.ts(x) resolve/list · types.ts контракты) │
│  _data/         ДАННЫЕ     (en.ts/ru.ts/meta.ts + index.ts публичный API)  │
│  _list.generated.ts  АВТО  (вывод parser-fs, gitignored)                  │
└───────────────────────────────────────────────────────────────────────────┘
            │ все вкладки переиспользуют, ни одна не дублирует
            ▼
┌─ ОБЩИЙ ДВИЖОК (один раз, не принадлежит ни одной вкладке) ───────────────┐
│  lib/content/blocks/{types,registry,inline}   neutral-каталог блоков      │
│  lib/content/resolve.ts                        резолвер с EN-fallback      │
│  lib/content/create-content-post.tsx           фабрика ПОСТА              │
│  lib/content/create-content-page.tsx           фабрика СТРАНИЦЫ           │
│  components/content-page/standard-content-page  шаблон страницы            │
│  components/content-page/post-body              рендерер блоков            │
│  lib/parser-fs.mjs                              генератор списков (build)  │
└───────────────────────────────────────────────────────────────────────────┘
```

**Строгое разделение — никогда не размывать:**

| Папка         | Хранит ТОЛЬКО          | Пример |
|---------------|------------------------|--------|
| `_components` | вид (React)            | `index.tsx`, компонующий фабрику |
| `_lib`        | функции + контракты типов | `post.ts` (resolve/list), `types.ts` |
| `_data`       | данные (вкл. локализованные UI-строки) | `en.ts`, `ru.ts`, `meta.ts`, `index.ts` |

Локализованные UI-строки — это **данные**, поэтому они живут в `_data` (`en.ts` +
`ru.ts` + `index.ts` с `getXUi(lang)`) — никогда в `_lib`. Контракты типов — это
**код**, поэтому они в `_lib/types.ts`. Общий движок — это **не** библиотека вкладки:
он переиспользуется каждой вкладкой и никогда не копируется в `_lib` вкладки.

---

## 3. Деревья архитектуры (обязательные компоненты)

Легенда: `[ОБЯЗ]` обязателен · `[опц.]` опционально · `[АВТО]` генерируется.

### 3.1 Вкладка-КОЛЛЕКЦИЯ — роутер сверху, посты ниже (`news`, `blog`, `documentation`)

```
app/[lang]/<tab>/
├── page.tsx                  [ОБЯЗ]  тонкий роутер: re-export Index + generateMetadata
├── _components/
│   └── index.tsx             [ОБЯЗ]  вид индекса (список постов) + generateMetadata; POSTS + <tab>List
├── _lib/
│   ├── post.ts(x)            [ОБЯЗ]  <tab>Post / <tab>ListItem / <tab>List (resolve + сортировка)
│   └── types.ts              [ОБЯЗ]  контракты: <Tab>Data, …Base/Meta/Override, <Tab>Ui
├── _data/                            UI-хром вкладки (ДАННЫЕ — никогда не хардкодить в _components)
│   ├── en.ts                 [ОБЯЗ]  базовый язык UI-хрома
│   ├── ru.ts                 [опц.]  языковой оверрайд
│   └── index.ts              [ОБЯЗ]  публичный API папки: get<Tab>Ui(lang)
├── _list.generated.ts        [АВТО]  parser-fs на build/dev; gitignored; руками не трогать
│
└── <slug>/                          ПОСТ (co-located маршрут)
    ├── page.tsx              [ОБЯЗ]  тонкий: re-export Entry + generateMetadata
    ├── _components/
    │   └── index.tsx         [ОБЯЗ]  composition: createContentPost({ … })
    └── _data/
        ├── meta.ts           [ОБЯЗ]  непереводимое: slug, date, readingMinutes, tags, author, ogImage
        ├── en.ts             [ОБЯЗ]  полный базовый документ: title/seoTitle/…/blocks/faq
        ├── ru.ts             [опц.]  языковой оверрайд (news локализован; blog/doc — EN-only)
        └── index.ts          [ОБЯЗ]  export const data = { meta, en, overrides:{ ru } }
```

### 3.2 Вкладка-КАРТА — хаб сверху, контент-страницы ниже (`deployments`)

```
app/[lang]/deployments/
├── page.tsx                  [ОБЯЗ]  тонкий роутер хаба
├── _components/index.tsx     [ОБЯЗ]  вид хаба (список целей) + generateMetadata; POSTS + deploymentList
├── _lib/
│   ├── post.ts               [ОБЯЗ]  deploymentContent / deploymentList; DeploymentData/Meta/Base
│   └── types.ts              [ОБЯЗ]  DeploymentsUi (контракт хрома)
├── _data/{en,ru,index}.ts    [ОБЯЗ]  UI-хром хаба + getDeploymentsUi(lang)
├── _list.generated.ts        [АВТО]
│
└── <slug>/  (local │ mcp │ vps)     КОНТЕНТ-СТРАНИЦА
    ├── page.tsx              [ОБЯЗ]  тонкий re-export
    ├── _components/index.tsx [ОБЯЗ]  createContentPage({ resolve, meta, chrome, sections? })
    └── _data/{meta,en,ru,index}.ts [ОБЯЗ]  контент страницы (как у поста)
```

### 3.3 Общий движок — вне вкладок, никогда не дублируется в `_lib` вкладки

```
lib/content/
├── blocks/{types,registry,inline}    neutral-каталог: Block, FaqPair + рендереры
├── resolve.ts                         resolveEntry (EN-fallback по ключу)
├── create-content-post.tsx            фабрика ПОСТА
├── create-content-page.tsx            фабрика СТРАНИЦЫ
├── types.ts                           LocalizedBody / LocalizedBodyOverride
└── page-ui.ts · post-body-ui.ts
components/content-page/
├── standard-content-page.tsx          шаблон страницы (хром + раскладка)
└── post-body.tsx                      рендерер блоков (тонкий диспетчер)
lib/{brand,author,seo,i18n}.ts · lib/parser-fs.mjs    общая инфра + генератор списков
```

**Инвариант удаляемости:** удаление любой папки `app/[lang]/<tab>/` не оставляет ни
одной ссылки — ничто в `lib/` или корне не импортирует *внутрь* вкладки. Общий движок
остаётся, потому что не принадлежит ни одной вкладке (удаление одной вкладки не может
осиротить то, чем пользуются все).

---

## 4. Общий движок — исходный код каждого компонента

### 4.1 `lib/parser-fs.mjs` — авто-обнаружение на сборке (без ручного реестра)

Один конфиг-управляемый генератор. Он сканирует папку каждой коллекции на папки-посты
(дочерняя директория без префикса `_`/`[`, у которой есть `_data/index.ts`) и пишет
статический `_list.generated.ts` (статические импорты + массив `POSTS`). Turbopack
требует статически разрешимых импортов, поэтому обнаружение происходит на **сборке**,
никогда в рантайме. Добавить вкладку = **одна строка** в `COLLECTIONS`.

```js
const COLLECTIONS = [
  { dir: 'app/[lang]/news',          type: 'NewsData',       typeModule: './_lib/post' },
  { dir: 'app/[lang]/documentation', type: 'DocData',        typeModule: './_lib/post' },
  { dir: 'app/[lang]/blog',          type: 'BlogData',       typeModule: './_lib/post' },
  { dir: 'app/[lang]/deployments',   type: 'DeploymentData', typeModule: './_lib/post' },
]

function findPostSlugs(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter(name => !name.startsWith('_') && !name.startsWith('[') && !name.startsWith('.'))
    .filter(name => statSync(join(dir, name)).isDirectory())
    .filter(name => existsSync(join(dir, name, '_data', 'index.ts')))
    .sort()
}

function generate({ dir, type, typeModule }) {
  const slugs = findPostSlugs(dir)
  const imports = slugs.map((slug, i) => `import { data as p${i} } from './${slug}/_data'`).join('\n')
  const arr = slugs.map((_, i) => `p${i}`).join(', ')
  const body = `// AUTO-GENERATED by lib/parser-fs.mjs — DO NOT EDIT.
import type { ${type} } from '${typeModule}'
${imports}

export const POSTS: ${type}[] = [${arr}]
`
  writeFileSync(join(dir, '_list.generated.ts'), body, 'utf8')
}
```

`typeModule: './_lib/post'` — **относительный** путь, потому что сгенерированный файл
лежит в корне вкладки. Ничто во вкладке не указывает наружу.

### 4.2 `lib/content/blocks/types.ts` — neutral-каталог блоков

Единственный источник истины для каждого вида блока, который может использовать любая
страница. У него **нет импортов** (лист графа импортов), поэтому любая вкладка зависит
от него, не связываясь ни с чем. Авторинг страницы = массив этих блоков; добавить новый
тип секции = член union здесь + рендерер в реестре. Контейнеры держат `children:
Block[]`, поэтому любой блок вкладывается в любую раскладку — запас расширяемости.

```ts
export type LeafBlock =
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
  | { kind: 'founder'; text: string }
  | { kind: 'docref'; title: string; summary: string; href: string; label?: string; kicker?: string }
  | { kind: 'callout'; title: string; text: string }
  | { kind: 'inquiry'; title?: string; text: string; label: string }

export type ContainerBlock =
  | { kind: 'columns'; children: Block[]; cols?: 2 | 3 }
  | { kind: 'group'; children: Block[] }

export type Block = LeafBlock | ContainerBlock
export type FaqPair = { q: string; a: string }
```

### 4.3 `lib/content/types.ts` — контракт локализованного тела

Общая форма для тела документа по языкам. Построена на neutral `Block`, поэтому
независима от языка и вкладки.

```ts
import type { Block, FaqPair } from './blocks/types'

export type LocalizedBody = {
  blocks: Block[]
  faq?: FaqPair[]
}

export type LocalizedBodyOverride = {
  headings?: Record<string, string>
  blocks?: Block[]
  faq?: FaqPair[]
}
```

### 4.4 `lib/content/resolve.ts` — резолвер с EN-fallback

Весь механизм i18n в одном файле: базовый документ + опциональные оверрайды по языкам →
разрешённый документ. **Fallback по ключу** означает, что язык может перевести лишь часть
полей; остальные берутся из базы. `headings` позволяет языку заменить отдельный текст
`h2`, не пересылая весь массив `blocks`.

```ts
import type { LocalizedBody, LocalizedBodyOverride } from './types'

export function resolveLocalizedBody<TOverride extends LocalizedBodyOverride>(
  base: LocalizedBody, override: TOverride | undefined,
): LocalizedBody {
  const blocks = override?.blocks
    ?? (override?.headings
      ? base.blocks.map(b =>
          b.kind === 'h2' && override.headings?.[b.text]
            ? { ...b, text: override.headings[b.text] } : b)
      : base.blocks)
  return { blocks, faq: override?.faq ?? base.faq }
}

export function resolveFields<TBase, TOverride, TFields extends readonly (keyof TBase & keyof TOverride)[]>(
  base: TBase, override: TOverride | undefined, fields: TFields,
): Pick<TBase, TFields[number]> {
  const result = {} as Pick<TBase, TFields[number]>
  for (const field of fields) result[field] = (override?.[field] ?? base[field]) as never
  return result
}

export function resolveEntry<
  TBase extends LocalizedBody, TOverride extends LocalizedBodyOverride,
  TFields extends readonly (keyof TBase & keyof TOverride)[],
>(base: TBase, overridesByLang: Record<string, TOverride> | undefined, lang: string, fields: TFields):
  Pick<TBase, TFields[number]> & LocalizedBody {
  const override = overridesByLang?.[lang]
  return { ...resolveFields(base, override, fields), ...resolveLocalizedBody(base, override) }
}
```

### 4.5 `lib/content/create-content-post.tsx` — фабрика ПОСТА

Одна технология для каждого формата поста (news/blog/document). Пресет `format` несёт
единственные реальные отличия по типу — тип JSON-LD и вид автора — а всё остальное
рендерится через тот же `StandardContentPage`. Фабрика никогда не читает файл данных;
она принимает co-located `resolve(lang)`.

```ts
export type PostFormat = 'news' | 'blog' | 'document'

const JSONLD_TYPE: Record<PostFormat, 'NewsArticle' | 'BlogPosting' | 'TechArticle'> = {
  news: 'NewsArticle', blog: 'BlogPosting', document: 'TechArticle',
}
const AUTHOR_KIND: Record<PostFormat, 'person' | 'organization'> = {
  news: 'person', blog: 'organization', document: 'person',
}

export type ContentPost = {
  title: string; seoTitle?: string; subtitle?: string; description: string
  keywords?: string; tags: string[]; date: string; readingMinutes: number
  authorName?: string; blocks: Block[]; faq?: FaqPair[]
  ogImage?: string; heroImage?: string; hero?: ReactNode; inLanguage?: string
}

export type ContentPostConfig = {
  format: PostFormat
  subPath: string                                   // '/news/<slug>'
  resolve: (lang: string) => ContentPost            // co-located резолвер
  chrome: (lang: string, post: ContentPost) => { breadcrumbs: Breadcrumb[]; backHref: string; backLabel: string }
  titleSuffix: (lang: string) => string
  minLabel?: (lang: string) => string
}

export function createContentPost(config: ContentPostConfig) {
  // возвращает { generateMetadata, Page }
  // generateMetadata: title/description/keywords/alternates + OpenGraph + Twitter,
  //   og:image = явный ogImage ?? видимый heroImage (никогда пустой сниппет).
  // Page: эмитит JSON-LD [Article-по-формату, BreadcrumbList, FAQPage?] + байлайн
  //   (автор · дата · время чтения) и рендерит <StandardContentPage … />.
}
```

> Полный исходник: `lib/content/create-content-post.tsx`. Тело — ~200 строк чистого
> boilerplate (метаданные + JSON-LD + байлайн), который иначе повторял бы каждый пост;
> централизация — то, что превращает папку поста в ~10 строк `_components` + данные.

### 4.6 `lib/content/create-content-page.tsx` — фабрика СТРАНИЦЫ

Сиблинг фабрики поста, для **самостоятельных контент-страниц** (целей развёртывания).
Та же идея: дескриптор + chrome + meta → `{ generateMetadata, Page }`, рендер через
`StandardContentPage`. Добавляет два слота, нужных маркетинговой странице: `hero`-оверрайд
(напр. интерактивная карусель вместо статичной картинки) и слот `sections`, инжектируемый
прямо над FAQ.

```ts
export type ContentPageContent = {
  title: string; seoTitle?: string; subtitle?: string
  description: string; keywords: string; blocks: Block[]; faq?: FaqPair[]
}
export type ContentPageChrome = { breadcrumbs: Breadcrumb[]; backHref: string; backLabel: string }

export type ContentPageConfig<C extends ContentPageContent> = {
  resolve: (lang: string) => C
  chrome: (lang: string, content: C) => ContentPageChrome
  meta: { subPath: string; ogImage: string; heroImage?: string; tags?: readonly string[] }
  jsonLdType?: 'Article' | 'NewsArticle'
  sections?: (lang: string) => ReactNode    // инжект НАД FAQ
  hero?: (lang: string) => ReactNode         // перекрывает meta.heroImage
}

export function createContentPage<C extends ContentPageContent>(config: ContentPageConfig<C>) {
  // возвращает { generateMetadata, Page }: та же дисциплина метаданных + JSON-LD,
  // что у фабрики поста, рендер <StandardContentPage … hero sections /> .
}
```

> Полный исходник: `lib/content/create-content-page.tsx`. **Это общий движок, а не
> приватный хелпер deployments** — любая контент-страница в любой вкладке импортирует
> его из `@/lib/content/create-content-page`, ровно как фабрику поста.

### 4.7 `components/content-page/standard-content-page.tsx` — шаблон

ОДИН шаблон, через который рендерится каждая страница. Он держит фиксированный стандарт
страницы, поэтому маршрут лишь подаёт данные: крошки → H1 максимального размера →
оглавление (из блоков `h2`, якоря совпадают с `PostBody`) → тело → слот `sections` →
спонсорство (запечено в каждую страницу) → FAQ (последняя контент-секция) → ссылка
«назад» (абсолютно последняя). Полностью серверный рендер; читается с выключённым JS.

```ts
export type StandardContentPageProps = {
  lang: string
  breadcrumbs: Breadcrumb[]               // последний элемент = текущая страница
  tags?: string[]
  title: string; subtitle?: string
  author?: { name: string; role: string; url?: string }
  metaLine?: ReactNode                    // оверрайд байлайна поста
  heroImage?: string; heroAlt?: string; hero?: ReactNode
  blocks: Block[]; faq?: FaqPair[]
  backHref: string; backLabel: string
  sections?: ReactNode                    // инжект над FAQ
}

export function StandardContentPage(props: StandardContentPageProps) { /* … раскладка … */ }
```

Оглавление выводится, а не авторится:

```ts
const toc = blocks
  .filter((b): b is { kind: 'h2'; text: string } => b.kind === 'h2')
  .map(b => ({ id: headingId(b.text), text: b.text.replace(/\*\*/g, '') }))
```

> Полный исходник: `components/content-page/standard-content-page.tsx` (~240 строк
> раскладки). Поскольку он общий, контракт нижнего порядка (спонсоры → FAQ → назад) не
> может «расползтись» по страницам.

### 4.8 `components/content-page/post-body.tsx` — рендерер блоков

Тонкий диспетчер над общим реестром блоков. Каждая контент-поверхность рендерит блоки
одинаково; новый вид блока добавляется в одном месте (реестр), а не на каждой странице.
`headingId` реэкспортируется, чтобы построитель оглавления и рендерер совпадали по якорям.

```ts
import type { Block } from '@/lib/content/blocks/types'
import { getPostBodyUi } from '@/lib/content/post-body-ui'
import { renderBlocks } from '@/lib/content/blocks/registry'

export { headingId } from '@/lib/content/blocks/inline'

export function PostBody({ blocks, lang = 'en' }: { blocks: Block[]; lang?: string }) {
  const ui = getPostBodyUi(lang)
  return <div className="flex flex-col gap-6">{renderBlocks(blocks, lang, ui)}</div>
}
```

---

## 5. Файлы по вкладке — исходный код каждого компонента

### 5.1 `_lib/post.ts` — функции вкладки (news)

Co-located хелперы превращают `_data` поста (meta + en + оверрайды) в нормализованный
`ContentPost`, который рендерит фабрика, и в компактный элемент списка для индекса.
Без центрального реестра: индекс читает авто-сгенерированный `POSTS`.

```ts
import { resolveEntry } from '@/lib/content/resolve'
import type { NewsArticleBase, NewsArticleMeta, NewsArticleOverride } from './types'
import type { ContentPost } from '@/lib/content/create-content-post'

const FIELDS = ['title', 'seoTitle', 'subtitle', 'description', 'summary', 'keywords'] as const

export type NewsData = { meta: NewsArticleMeta; en: NewsArticleBase; overrides?: Record<string, NewsArticleOverride> }

const resolve = (d: NewsData, lang: string) => resolveEntry(d.en, d.overrides, lang, FIELDS)

export function newsPost(data: NewsData, lang: string): ContentPost { /* meta+resolved → ContentPost */ }
export function newsListItem(data: NewsData, lang: string) { /* {slug,date,readingMinutes,title,summary} */ }
export function newsList(posts: NewsData[], lang: string) {
  return posts.map(d => newsListItem(d, lang)).sort((x, y) => (x.date < y.date ? 1 : -1))
}
```

### 5.2 `_lib/types.ts` — контракты вкладки (news)

```ts
import type { LocalizedBody, LocalizedBodyOverride } from '@/lib/content/types'

export type NewsArticleMeta = { slug: string; date: string; readingMinutes: number; tags: string[]; author?: { name: string; role: string }; heroImage?: string; ogImage: string }
export type NewsArticleBase = LocalizedBody & { title: string; seoTitle?: string; subtitle?: string; description: string; summary: string; keywords?: string }
export type NewsArticleOverride = LocalizedBodyOverride & { title?: string; seoTitle?: string; subtitle?: string; description?: string; summary?: string; keywords?: string }

// UI-хром — это ДАННЫЕ (живут в ../_data); это только его КОНТРАКТ.
export type NewsUi = { metaTitle: string; metaDescription: string; eyebrow: string; indexTitle: string; indexIntro: string; breadcrumbNews: string; minRead: string; tocHeading: string; faqHeading: string; backToNews: string; titleSuffix: string }
```

### 5.3 `_data/` — данные вкладки

UI-хром (данные) как файлы по языкам + индекс-публичный API:

```ts
// _data/en.ts  — базовый язык
import type { NewsUi } from '../_lib/types'
export const en: NewsUi = { metaTitle: 'News | Fractera', /* … */ }

// _data/ru.ts  — языковой оверрайд (та же форма)
import type { NewsUi } from '../_lib/types'
export const ru: NewsUi = { metaTitle: 'Новости | Fractera', /* … */ }

// _data/index.ts — публичный API папки: getNewsUi(lang) с EN-fallback
import { en } from './en'; import { ru } from './ru'
import type { NewsUi } from '../_lib/types'
const UI: Record<string, NewsUi> = { en, ru }
export function getNewsUi(lang: string): NewsUi { return UI[lang] ?? UI.en }
```

`_data` поста (одна папка на пост):

```ts
// <slug>/_data/meta.ts  — непереводимое
export const meta: NewsArticleMeta = { slug: '…', date: '2026-06-22', readingMinutes: 6, tags: […], ogImage: '/…' }
// <slug>/_data/en.ts    — полный базовый документ (title/seo/…/blocks/faq)
export const en: NewsArticleBase = { title: '…', description: '…', summary: '…', blocks: [ … ], faq: [ … ] }
// <slug>/_data/ru.ts    — частичный оверрайд (только локализуемые поля)
export const ru: NewsArticleOverride = { title: '…', /* часть полей */ }
// <slug>/_data/index.ts — собираем объект data, который импортирует parser-fs
export const data: NewsData = { meta, en, overrides: { ru } }
```

### 5.4 `_components/index.tsx` — вид вкладки (пост)

Весь пост — только данные; entry лишь вплетает co-located резолвер в фабрику:

```ts
// _components/index.tsx:
const page = createContentPost({
  format: 'news',
  subPath: `/news/${data.meta.slug}`,
  resolve: lang => newsPost(data, lang),
  chrome: (lang, post) => ({ breadcrumbs: […], backHref: `/${lang}/news`, backLabel: getNewsUi(lang).backToNews }),
  titleSuffix: lang => getNewsUi(lang).titleSuffix,
})
export const generateMetadata = page.generateMetadata
export default page.Page
```

Тонкий файл маршрута всегда — те же две строки:

```ts
// <slug>/page.tsx
import Entry, { generateMetadata } from './_components'
export { generateMetadata }; export default Entry
```

---

## 6. Рецепты авторинга

**Добавить пост в существующую вкладку** — создать одну папку и ничего больше:

```
app/[lang]/news/<new-slug>/
  page.tsx                 (2-строчный re-export)
  _components/index.tsx    (createContentPost({ … }))
  _data/{meta,en,index}.ts (+ ru.ts, если локализован)
```

`gen:lists` перегенерит `_list.generated.ts`; индекс подхватит. **Без реестра, без правки
списка.** Удаление папки убирает пост повсюду.

**Добавить самостоятельную страницу в карту-вкладку** — та же форма с `createContentPage`
и полным `_data/{meta,en,index}` (паттерн `local`/`mcp`/`vps` в deployments).

**Добавить новую вкладку** — раздел 7.

**Проверка (Windows):** `npm run gen:lists` → `npx tsc --noEmit` → `npx eslint <файлы>`.
Никогда `npm run build` на Windows; никогда динамический `[slug]`; никогда центральный
реестр.

---

## 7. Масштабирование на новую поверхность — пример: Магазин + Карточка товара

> Этот раздел — «шаблон мышления»: следуй ему, чтобы добавить **любой** новый тип
> контента. Витрина с карточками товаров — тот же движок с магазинно-формным `_lib` и
> одним новым блоком.

**1. Папка вкладки (зеркало вкладки-коллекции):**

```
app/[lang]/shop/
├── page.tsx                  тонкий роутер (re-export _components)
├── _components/index.tsx     сетка витрины: читает POSTS + shopList; карточки → товары
├── _lib/
│   ├── post.tsx              productCard(data) → ContentPost; shopListItem/shopList (цена/сорт)
│   └── types.ts              ShopData (sku, price, currency, gallery, specs, blocks…), ShopUi
├── _data/{en,ru,index.ts}    UI-хром витрины + getShopUi(lang)
├── _list.generated.ts        АВТО
└── <product-slug>/
    ├── page.tsx              тонкий re-export
    ├── _components/index.tsx createContentPage({ resolve, meta, chrome, sections: buyBox })
    └── _data/{meta,en,index.ts}  товар: meta (sku/price/ogImage), en (title/specs/blocks/faq)
```

**2. Одна строка в `lib/parser-fs.mjs`:**

```js
{ dir: 'app/[lang]/shop', type: 'ShopData', typeModule: './_lib/post' },
```

**3. Переиспользовано из общего движка — без изменений:** `createContentPage` (страница
товара), `StandardContentPage` (раскладка/SEO/JSON-LD), `PostBody` + реестр блоков,
`resolveEntry` (локализованная копия товара), `parser-fs` (список товаров),
`lib/brand`/`author`/`seo`. Индекс витрины переиспользует ту же форму «читай `POSTS`,
маппь в элементы списка, рендери», что и `/news`.

**4. Действительно специфичное для магазина — только аддитивно:**
- `_lib/types.ts`: `ShopData` (sku, price, currency, gallery, specs) — новый контракт,
  не трогает ничего другого.
- Блок `price`/`buy`, добавленный в neutral-каталог (`lib/content/blocks/types.ts` +
  рендерер в реестре) — теперь любая поверхность может его использовать; карточки товара
  используют. `buyBox` через слот `sections` для CTA «в корзину».
- JSON-LD товара: передать `jsonLdType` или расширить пресет фабрики записью `'Product'`
  — тот же паттерн, что добавление `'document'`.

Ничего центрального не переписывается; витрина чисто аддитивна и удаляется по отдельности.
Тот же рецепт даёт чейнджлог, глоссарий, доску вакансий — любую поверхность «список
документов + страница документа».

---

## 8. Почему эта архитектура выигрывает — масштаб и экономия токенов

> Этот раздел — отдельный **проход исследователя**: каждое утверждение ниже проверено по
> реальному репозиторию. Он доказывает два тезиса — движок масштабируется на новые типы
> контента при почти константной предельной цене, и он ограничивает токен-цену, которую
> ИИ-агент платит за правку. Пример магазина в §7 — прикладная форма того же аргумента.

### 8.1 Почему масштабируется: добавление типа контента чисто аддитивно

**Добавление нового поста** в существующую вкладку создаёт ровно одну папку —
`app/[lang]/news/<slug>/` — с `page.tsx` (4-строчный re-export, дословно как у любого
другого поста), `_components/index.tsx` и `_data/{meta,en,ru,index}.ts`. **Ноль
существующих файлов не правится.** Индекс узнаёт о посте не потому, что кто-то правит
список: `lib/parser-fs.mjs` сканирует директорию вкладки на сборке (`predev`/`prebuild`)
и эмитит `_list.generated.ts` — статический `import { data as p0 } from './<slug>/_data'`
на папку плюс массив `POSTS`. Файл помечен `AUTO-GENERATED … DO NOT EDIT` и в gitignore.
Обнаружение — это файловая система; реестр регенерируется, а не ведётся.

**Добавление целой новой вкладки** — та же форма уровнем выше: создать
`app/[lang]/<tab>/` с её `_lib/{post,types}`, `_data`, `_components` и папками постов,
затем добавить **одну строку** в массив `COLLECTIONS` в `lib/parser-fs.mjs`. Эта запись
`{ dir, type, typeModule }` — единственная правка вне новой папки.

Сравните с классическим антипаттерном, которого это избегает: центральный `posts.ts`,
куда дописывает каждый автор (точка мерж-конфликтов, lock-step связность), динамический
`[slug]/page.tsx` с рантайм-поиском и общий «божественный» `types.ts`, который правит
каждый автор. Здесь типы движка *импортируются*, а не расширяются: `news/_lib/types.ts`
компонует neutral `LocalizedBody`/`LocalizedBodyOverride`, а `blocks/types.ts` имеет
**ноль импортов** (намеренный лист графа). Новый язык — это новый файл `<lang>.ts`;
`resolveEntry` падает на EN по каждому полю, поэтому ни один существующий файл не трогается.

Венчающий инвариант — **«удаляемо без сирот»**: каждый хелпер вкладки co-located в её
`_lib`. Удали `app/[lang]/news/` — и маршрут, вид, данные и хелперы исчезают вместе;
`lib/content/` остаётся, потому что не принадлежит ни одной вкладке. Чистить нечего,
потому что центральной ссылки никогда не создавалось.

### 8.2 Почему экономит токены для ИИ-агентов

Контекстная цена агента определяется тем, *какие файлы он обязан загрузить, чтобы
действовать безопасно*. Эта раскладка ограничивает рабочий набор структурно.

- **Правка одного поста грузит одну папку.** Чтобы изменить статью, агент читает
  `app/[lang]/news/<slug>/_data/{en,meta}.ts` — маленький предсказуемый набор. Он не
  гриппит разросшийся `lib/` или центральный реестр в поисках «куда пост вписан», потому
  что вписывания нет: обнаружение делает `parser-fs` на сборке. Строгое разделение
  `_lib`/`_data`/`_components` ведёт по намерению, а не по разведке: *менять копию →
  `_data`; поведение/типы → `_lib`; вид → `_components`*. Нужный файл назван, а не найден.
- **Neutral-каталог убирает дублирование типов.** Все вкладки рендерятся через тот же
  union `Block` и тот же `StandardContentPage`. Агент, прочитавший `lib/content/blocks/
  types.ts` один раз, знает словарь авторинга для *каждой* вкладки. Добавить вид блока —
  две правки в одном месте.
- **Удаление — одна папка, без охоты на сирот.** Из-за инварианта удаляемости «убрать
  этот контент» = `rm -rf <папка>` — агенту не нужно грузить `lib/`, чтобы убедиться, что
  не осталось висячих импортов. Это устраняет самый дорогой класс задач агента:
  кросс-репо трассировку ссылок.

Порядок величины (иллюстративно, не измерено): реестр-дизайн вынуждает ~3–5 файлов на
правку поста (тело поста, центральный реестр, возможно общий файл типов, динамический
маршрут) плюс разведочные грепы — легко тысячи строк в контексте. Здесь правка поста
трогает **1–2 файла в известной папке**, а новый пост трогает **0 существующих файлов**.
И файлов-на-задачу, и строк-на-задачу схлопываются к O(1).

---

## 9. Чек-лист инвариантов (не нарушать)

- `page.tsx` всегда тонкий (re-export из `_components`); композиция — в `_components/index.tsx`.
- `_lib` = функции + контракты типов · `_data` = данные (вкл. локализованные UI-строки) · `_components` = вид.
- Общий движок (`lib/content`, `components/content-page`) переиспользуется, а не копируется в `_lib` вкладки.
- Типы блоков — из neutral `@/lib/content/blocks/types`; локальный псевдоним — в `_lib/types.ts` вкладки.
- Импорты внутри вкладки — относительные (`../_lib/post`, `../_data`); `parser-fs` `typeModule` = `./_lib/post`.
- `_list.generated.ts` — авто; руками не править, список руками не вести.
- Нет динамического `[slug]`, нет центрального реестра, нет `force-dynamic` — static-first, работает с выключённым JS.
- Удаляемость: удаление папки вкладки не оставляет ссылок в `lib/` или корне.
