// Single source of truth for Fractera News (EN only, curated — same precedent as
// blog and documentation). Chronological order, newest first. Blocks reuse the
// blog's BlogBlock type and the shared PostBody renderer. `ogImage` is required
// for social snippets; `heroImage` is optional — omit until the asset is ready.

import type { BlogBlock } from '@/lib/blog/posts'

// Per-language overrides. A locale may override just the SEO surface, or supply a
// fully translated page (subtitle + blocks + faq). `blocks`, when present, replaces
// the body entirely; otherwise `headings` (English H2 text -> localized label) does
// a light heading-only localization. Fall back to the base (EN) values for anything
// not provided.
export type NewsLocale = {
  seoTitle?: string
  title?: string
  subtitle?: string
  description?: string
  summary?: string
  keywords?: string
  headings?: Record<string, string>
  blocks?: BlogBlock[]
  faq?: { q: string; a: string }[]
}

export type NewsArticle = {
  slug: string
  title: string           // visible H1 / breadcrumb / index card
  seoTitle?: string       // <title> + og/twitter title — kept distinct from H1 on purpose
  subtitle?: string
  description: string      // SEO meta description
  summary: string         // one-liner shown in the flat index list
  keywords?: string        // meta keywords + JSON-LD keywords (comma-separated)
  date: string            // ISO date
  readingMinutes: number
  tags: string[]
  author?: { name: string; role: string }
  heroImage?: string      // path relative to /public — omit until asset delivered
  ogImage: string         // path relative to /public or absolute URL
  blocks: BlogBlock[]
  faq?: { q: string; a: string }[]
  i18n?: Record<string, NewsLocale>
}

// Resolve an article's user-facing strings for a given language, applying any
// i18n override and falling back to the base (EN) values. H2 block texts are
// swapped per the `headings` map so both the rendered headings and the
// data-driven table of contents localize together (and keep matching anchors).
export function resolveArticle(article: NewsArticle, lang: string) {
  const loc = article.i18n?.[lang]
  const title = loc?.title ?? article.title
  const blocks = loc?.blocks
    ?? (loc?.headings
      ? article.blocks.map(b =>
          b.kind === 'h2' && loc.headings?.[b.text]
            ? { ...b, text: loc.headings[b.text] }
            : b,
        )
      : article.blocks)
  return {
    title,
    seoTitle: loc?.seoTitle ?? article.seoTitle ?? title,
    subtitle: loc?.subtitle ?? article.subtitle,
    description: loc?.description ?? article.description,
    summary: loc?.summary ?? article.summary,
    keywords: loc?.keywords ?? article.keywords,
    blocks,
    faq: loc?.faq ?? article.faq,
  }
}

const ARTICLES: NewsArticle[] = [
  {
    slug: 'ai-draft-settings-evolutionary-pipeline',
    title: 'AI Draft Settings: The Instruction & Skill Staging Conveyor for AI Agents',
    seoTitle: 'AI Draft Settings: Staging Conveyor for Agent Prompts, Skills & MCP Tools',
    subtitle: 'It ships with every Next.js-based starter — a safe staging layer where people and AI agents draft, test, and store system instructions, skills, and MCP tools before they reach production',
    description:
      'Discover the AI Draft Settings staging conveyor in Fractera. A secure incubator where developers and MCP agents like Claude Code safely draft, test, and store system instructions, custom skills, and tool configurations before production deployment.',
    summary:
      'A plain-language tour of the AI Draft Settings page — where people and AI agents draft new capabilities together, included as standard with every Next.js-based starter.',
    keywords:
      'staging conveyor for agent prompts, custom system instructions, instruction skill staging conveyor, prompt staging incubator, Claude Code tool drafting, framework mcp configuration',
    date: '2026-06-19',
    readingMinutes: 6,
    tags: ['AI Draft Settings', 'Prompt Staging', 'Agent Skills', 'MCP Tools'],
    author: { name: 'Fractera Team', role: 'Product' },
    // Per-language overrides. RU is a FULL localization (its own SEO surface +
    // subtitle + translated body blocks + FAQ), deliberately framed around the
    // "песочница / инкубатор" angle rather than the EN "staging conveyor" wording,
    // so Google sees two distinct pages (no duplicate-content / cannibalization).
    i18n: {
      ru: {
        seoTitle: 'AI Draft Settings: Песочница системных промптов, инструкций и навыков ИИ',
        title: 'AI Draft Settings: Конвейер безопасной отладки инструкций и навыков для ИИ-агентов',
        description:
          'Обзор архитектуры AI Draft Settings во Fractera. Изолированная песочница, где разработчики и ИИ-агенты (Claude Code, Hermes) могут безопасно настраивать, тестировать и хранить системные инструкции, промпты и MCP-коннекторы до деплоя в продакшен.',
        summary:
          'Разбор страницы AI Draft Settings — изолированной песочницы, где люди и ИИ-агенты безопасно собирают и отлаживают системные промпты, навыки и MCP-коннекторы до отправки в продакшен.',
        keywords:
          'песочница системных промптов, отладка инструкций и навыков, кастомные системные промпты, раздувание контекстного окна, инкубатор навыков ИИ, настройка Claude Code MCP',
        subtitle: 'Входит в каждый стартер на базе Next.js — безопасный слой-песочница, где люди и ИИ-агенты собирают, тестируют и хранят системные инструкции, навыки и MCP-инструменты до отправки в продакшен',
        blocks: [
          {
            kind: 'p',
            text: 'Fractera добавляет новую страницу в каждое рабочее пространство — **AI Draft Settings**. Это место, где вы или один из ваших ИИ-агентов предлагаете новый навык, новую инструкцию или новый коннектор и держите его в виде безопасного черновика, прежде чем он коснётся боевой конфигурации. И это первый элемент чего-то большего: системы, которая со временем позволяет рабочему пространству наращивать собственный интеллект. Ниже — что делает страница, как ею пользуетесь вы и ваши агенты и куда всё это движется, простыми словами.',
          },
          {
            kind: 'h2',
            text: 'Диспетчерская для кастомных системных промптов и конфигураций MCP',
          },
          {
            kind: 'p',
            text: 'Воспринимайте её как диспетчерскую для ИИ-стороны вашего проекта. Обычная админ-панель управляет бизнес-данными — пользователями, заказами, контентом. Эта страница управляет другим: тем, что ваши ИИ-агенты знают и что им разрешено делать. Здесь вы видите и настраиваете инструкции каждого агента, его навыки и MCP-инструменты, которые он может вызывать. Ничто здесь не настраивает функции вашего приложения — это настраивает «умы» за ними.',
          },
          {
            kind: 'h3',
            text: 'Входит в каждый фреймворк на базе Next.js',
          },
          {
            kind: 'p',
            text: 'Сегодня страница AI Draft Settings входит в каждый стартер на базе Next.js, который разворачивает Fractera. Её не нужно устанавливать, включать или подключать — как только рабочее пространство поднимается, страница уже на месте и уже связана со всеми шестью ИИ-агентами. (Поддержка других семейств фреймворков на подходе — об этом ближе к концу.)',
          },
          {
            kind: 'list',
            items: [
              'Шесть агентов из коробки: Claude Code, Codex CLI, Gemini CLI, Qwen Code, Kimi Code и Hermes',
              'Живой просмотр реальных файлов инструкций и активных навыков каждого агента — прямо из проекта, в точности как сейчас',
              'Слой черновиков, где новые идеи безопасно ждут, прежде чем вступят в силу',
              'MCP-инструменты каждого агента — со списком и редактированием в полноценном редакторе кода',
              'Защищённая «зона риска» для осознанного удаления — с наглядным сравнением «до и после» и шагом подтверждения',
            ],
          },
          {
            kind: 'h2',
            text: 'Два режима сборки: Ручная инженерия промптов vs Автономные пулы агентов',
          },
          {
            kind: 'h3',
            text: 'Делаем сами, в интерфейсе',
          },
          {
            kind: 'p',
            text: 'Откройте страницу — увидите две панели. Слева — шесть агентов. Кликните по одному, и справа появятся его реальные инструкции, навыки и зарегистрированные инструменты — ровно так, как они лежат на диске. Эти панели намеренно только для чтения: это источник истины, а не черновик. Черновик — это слой поверх. Вы записываете нужное изменение — новый навык, правку инструкции, идею инструмента — и сохраняете. Черновик помечается как ожидающий и остаётся там, пока с ним что-то не сделают.',
          },
          {
            kind: 'figure',
            media: 'image',
            src: '/news/fractera-ai-draft-settings/fractera-ai-draft-settings-screenshot.png',
            alt: 'Страница AI Draft Settings в живом рабочем пространстве: слева дерево агентов, справа выбранный MCP-коннектор и его реальный исходник',
            caption: 'Страница AI Draft Settings в живом рабочем пространстве — слева каждый агент и его файлы, справа выбранный элемент и его реальный исходник. Сохранение пишет вашу версию в черновик; реального файла ничто не касается, пока агент не применит изменение.',
          },
          {
            kind: 'h3',
            text: 'Поручаем агенту',
          },
          {
            kind: 'p',
            text: 'Страница не только для людей. Любой из агентов тоже может ею пользоваться. Прямо посреди обычной рабочей сессии Claude Code (или любой другой) может вызвать встроенный навык — **`propose-new-agent-skill-or-mcp`** — описать задуманную возможность, и черновик сам появится на странице. Hermes делает то же самое через свой коннектор (**`owner_draft_create_record`** на сервере `ai-draft-bridge`, порт 3221). Самое важное: у каждого агента есть собственная копия этой способности. Она работает, даже если в проекте всего один агент и больше ничего — не нужен общий «мозг», нет единой точки отказа.',
          },
          {
            kind: 'h2',
            text: 'Безопасный менеджмент промптов: Защита от раздувания контекстного окна',
          },
          {
            kind: 'h3',
            text: 'Как это работает',
          },
          {
            kind: 'p',
            text: 'В какой-то момент вы — или один из ваших агентов — захотите изменить поведение агента: обновить инструкцию, добавить навык или подключить новый коннектор. Начать это может любая модель на платформе, потому что эти настройки скопированы каждому агенту. Так задумано: даже если всё ваше рабочее пространство — это один агент (скажем, только Codex или только Hermes), способность всё равно на месте. Ничто в ней не зависит от присутствия одного конкретного агента.',
          },
          {
            kind: 'p',
            text: 'Вы можете изложить желаемое простыми словами — просто запишите своё пожелание о том, как должен работать агент. Если хотите точнее, можно передать это структурно: через небольшой встроенный терминал или пошагово, с помощью инструмента вроде to-do-списка. Важно чётко понимать одно: запись пожелания — это **не** само техническое решение. Оно пока ничего не собирает. Это заметка — понятное ТЗ на будущее, для инструмента, который позже сгенерирует реальный навык.',
          },
          {
            kind: 'p',
            text: 'Каждый добавленный черновик помечает родительский контейнер как изменённый — рядом появляется небольшой оранжевый бейдж **req**, и сразу видно, что что-то ждёт. Когда придёт время, вы или агент можете отправить черновик в работу — нажав соответствующую кнопку или в результате логического шага. Тогда ИИ сначала очищает существующую заметку, а затем на странице **Development Steps** создаётся новая запись под названием **Next Step**. Все детали задачи переносятся в неё. Дальше — в зависимости от того, что ещё выполняется и что важнее, — реальную сборку в нужный момент запускает либо агент, либо человек.',
          },
          {
            kind: 'p',
            text: 'Обратите внимание, чего **не** происходит: черновик никогда не превращается в код автоматически в момент создания. Это сознательный выбор. Запуск сборки прямо тогда мог бы переполнить активное контекстное окно агента, снизить качество кода, который он генерирует в основном процессе, или — в худшем случае — вовсе сломать прогон, например исчерпав ваш бюджет токенов раньше запланированного. Поэтому передача в работу — всегда осознанный шаг, который делают, когда это уместно.',
          },
          {
            kind: 'p',
            text: 'Если коротко, жизненный цикл — три простых шага:',
          },
          {
            kind: 'olist',
            items: [
              '**Создать черновик** — записать нужный навык, инструкцию или коннектор.',
              '**Перевести в очередь** — когда будете готовы, отправить черновик дальше; он становится записью Next Step на странице Development Steps и ждёт своей очереди.',
              '**Превратить в реальную сущность** — агент (или вы) собирает настоящий навык, инструкцию или коннектор, и он выходит в работу.',
            ],
          },
          {
            kind: 'h2',
            text: 'Перенос валидированных черновиков в рабочую среду продакшена',
          },
          {
            kind: 'p',
            text: 'Сейчас цикл полуавтоматический — и уже быстрый. Вы описываете нужное на странице AI Draft Settings. Отправляете дальше. Агент берёт задачу, собирает её, и новая способность выходит в работу — часто в той же сессии. Вы задаёте направление; ИИ выполняет сборку.',
          },
          {
            kind: 'p',
            text: 'Это первая часть большего плана — семиступенчатого конвейера для наращивания навыков рабочего пространства. По мере того как мы добавляем остальное — автоматическое тестирование, отлов регрессий, визуальные диффы, данные об использовании и обратную связь, которая настраивает сама себя, — каждая ступень требует чуть меньше участия человека, чем предыдущая. Конечное состояние — цикл, который выполняется сам от начала до конца, во многом как [автономный цикл разработки Fractera](https://www.fractera.ai/ai-development-loop): возникает потребность, агент её планирует, собирает, проверяет, выпускает и фиксирует результат — и никто не нажимает кнопку.',
          },
          {
            kind: 'quote',
            text: 'Страница AI Draft Settings — там, где встречаются человеческое намерение и машинная способность. Сегодня ей нужен триггер. Завтра — уже нет.',
            cite: 'Продуктовая команда Fractera',
          },
          {
            kind: 'h2',
            text: 'Кросс-платформенная отладка: Готовые транспортные слои под любой стек',
          },
          {
            kind: 'p',
            text: 'Fractera начиналась с Next.js, но идея никогда не должна была на нём останавливаться. AI-native-разработка не должна принадлежать одному фреймворку. Поэтому мы переносим ту же связку — ту же глубину, что [у разработчиков на Next.js уже есть сегодня](https://www.fractera.ai/next-aircraft-carrier), — на каждый популярный веб-фреймворк и прикладной стек.',
          },
          {
            kind: 'p',
            text: 'Делаем мы это прямолинейно. Для каждого фреймворка мы собираем отдельный **ai-workspace transport**: готовый интеграционный слой, который подключает этот фреймворк к общим сервисам Fractera, чтобы вам не пришлось самим разбираться в «проводке». Вот полный набор стеков, которые мы берём на борт, — раскройте, чтобы увидеть все:',
          },
          {
            kind: 'frameworks',
          },
          {
            kind: 'h3',
            text: 'Что получает каждый фреймворк',
          },
          {
            kind: 'list',
            items: [
              '**Встроенная база данных** — локальный SQLite через сервис данных Fractera, со слоем данных, который ощущается родным для вашего фреймворка',
              '**Авторизация** — сессии и простая ролевая модель ([гость, пользователь, архитектор](https://www.fractera.ai/ru/documentation/authentication-roles-and-providers)), подогнанная под то, как ваш фреймворк уже работает с авторизацией',
              '**Файловое и медиа-хранилище** — локальное объектное хранилище, смонтированное на уровне фреймворка, с готовыми API загрузки и скачивания с первого дня',
              '**Полный стек ИИ-агентов** — все пять кодинг-агентов (Claude Code, Codex, Gemini CLI, Qwen Code, Kimi Code) плюс «мозг» Hermes, подключённые с первого деплоя',
              '**Единая MCP-архитектура** — одна и та же tool-first-модель независимо от стека; агенты вызывают инструменты, а не сырые API',
            ],
          },
          {
            kind: 'p',
            text: 'Мы выкатываем их по одному, и каждый новый стартер сначала анонсируется здесь, в Новостях.',
          },
          {
            kind: 'cta',
            text: 'Разверните своё первое AI-оптимизированное рабочее пространство уже сегодня — выберите фреймворк и начните.',
            href: 'https://www.fractera.ai/',
            label: 'Развернуть с ИИ',
          },
        ],
        faq: [
          {
            q: 'Что такое страница AI Draft Settings и что она делает?',
            a: 'AI Draft Settings — это страница рабочего пространства, входящая в стандартную поставку каждого стартера Fractera на базе Next.js. Это визуальная диспетчерская для ИИ-стороны вашего проекта: вы видите и редактируете файлы инструкций каждого агента, просматриваете его активные навыки и MCP-инструменты и предлагаете новые возможности через простую систему черновиков. Она объединяет всех шести ИИ-агентов (Claude Code, Codex, Gemini CLI, Qwen Code, Kimi Code и Hermes) в одном месте, с живыми панелями прямо из файлов проекта.',
          },
          {
            q: 'Как ИИ-агенты взаимодействуют с AI Draft Settings автоматически?',
            a: 'Любой из шести агентов может вызвать встроенный навык «propose-new-agent-skill-or-mcp» и создать черновик самостоятельно, без участия человека. Hermes добирается до того же места через свой коннектор (инструмент owner_draft_create_record на сервере ai-draft-bridge, порт 3221). У каждого агента есть собственная копия навыка, и он полностью самодостаточен — нет единой точки отказа и зависимости от того, что в этот же момент онлайн какой-то другой агент.',
          },
          {
            q: 'Превращение черновика в реальный навык происходит автоматически?',
            a: 'Нет — и это сделано намеренно. Создание черновика лишь записывает ТЗ; оно ничего не собирает. Когда вы или агент отправляете черновик дальше, заметка очищается и на странице Development Steps создаётся запись Next Step, где реальная работа планируется и запускается в нужный момент. Автозапуск сборки в момент создания черновика мог бы переполнить контекстное окно агента, ухудшить качество кода в основном процессе или досрочно исчерпать лимиты токенов — поэтому передача в работу всегда осознанный шаг.',
          },
          {
            q: 'Какие фреймворки поддерживает Fractera и какие на подходе?',
            a: 'Страница AI Draft Settings сегодня поставляется с каждым стартером на базе Next.js. Помимо этого Fractera строит отдельные ai-workspace-транспорты для всех основных веб-фреймворков и стеков, включая React, Vue, Angular, SvelteKit, Nuxt, Astro, Remix, Gatsby, TanStack Start, SolidStart, Qwik, Django, Flask, FastAPI, Laravel, Rails, Phoenix, NestJS, Fastify, Hono, .NET и Spring. Каждый даёт ту же встроенную базу данных, авторизацию, файловое хранилище и полный стек ИИ-агентов — и каждый новый стартер анонсируется здесь, в Новостях, по мере выхода.',
          },
        ],
      },
    },
    heroImage: '/news/fractera-ai-draft-settings/fractera-ai-draft-settings.jpg',
    ogImage: '/news/fractera-ai-draft-settings/fractera-ai-draft-settings-screenshot.png',
    blocks: [
      // ── Lead paragraph ───────────────────────────────────────────────────────
      {
        kind: 'p',
        text: 'Fractera is adding a new page to every workspace: **AI Draft Settings**. It is the place where you — or one of your AI agents — propose a new skill, a new instruction, or a new connector, and hold it safely as a draft before it ever touches your live setup. It is also the first piece of something bigger we are building: a system that lets a workspace grow its own intelligence over time. Below is what the page does, how you and your agents use it, and where it is headed — in plain words.',
      },
      // ── What is it ───────────────────────────────────────────────────────────
      {
        kind: 'h2',
        text: 'The Control Room for Custom System Instructions & MCP Definitions',
      },
      {
        kind: 'p',
        text: 'Think of it as the control room for the AI side of your project. A normal admin panel manages your business data — users, orders, content. This page manages something different: what your AI agents know and what they are allowed to do. On it you can see and shape each agent\'s instructions, the skills it carries, and the MCP tools it can call. Nothing here configures your app\'s features — it configures the minds behind them.',
      },
      {
        kind: 'h3',
        text: 'It comes with every Next.js-based framework',
      },
      {
        kind: 'p',
        text: 'Today the AI Draft Settings page is part of every Next.js-based starter Fractera deploys. You do not install it, switch it on, or wire it up — the moment your workspace comes online, the page is already there and already connected to all six AI agents. (Support for other framework families is on the way; there is more on that near the end.)',
      },
      {
        kind: 'list',
        items: [
          'Six agents ready out of the box: Claude Code, Codex CLI, Gemini CLI, Qwen Code, Kimi Code, and Hermes',
          'A live view of each agent\'s real instruction files and active skills, read straight from the project exactly as it is right now',
          'A draft layer where new ideas wait safely before they go live',
          'Each agent\'s MCP tools, listed and editable in a full code editor',
          'A guarded "danger zone" for removing things on purpose — with a clear before-and-after view and a confirmation step',
        ],
      },
      // ── Two ways to use it ───────────────────────────────────────────────────
      {
        kind: 'h2',
        text: 'Drafting Workflows: Manual Engineering vs Autonomous Agent Proposals',
      },
      {
        kind: 'h3',
        text: 'Doing it yourself, in the interface',
      },
      {
        kind: 'p',
        text: 'Open the page and you see two panels. On the left, the six agents. Click one and the right side fills in with that agent\'s real instructions, its skills, and its registered tools — exactly as they sit on disk. Those views are read-only on purpose: they are the source of truth, not a scratchpad. The scratchpad is the draft layer on top. You write down the change you want — a new skill, a tweak to an instruction, an idea for a tool — and save it. The draft is marked as waiting, and it stays there until something acts on it.',
      },
      {
        kind: 'figure',
        media: 'image',
        src: '/news/fractera-ai-draft-settings/fractera-ai-draft-settings-screenshot.png',
        alt: 'The AI Draft Settings page in a live workspace: the agents tree on the left, the selected MCP connector and its real source on the right',
        caption: 'The AI Draft Settings page in a live workspace — every agent and its files on the left, the selected item and its real source on the right. Saving stores your version on the draft; nothing touches the real file until an agent applies it.',
      },
      {
        kind: 'h3',
        text: 'Letting an agent do it',
      },
      {
        kind: 'p',
        text: 'The page is not just for people. Any of the agents can use it too. In the middle of a normal working session, Claude Code (or any of the others) can call a built-in skill — **`propose-new-agent-skill-or-mcp`** — describe the capability it has in mind, and the draft shows up on the page on its own. Hermes does the same thing through its own connector (**`owner_draft_create_record`** on the `ai-draft-bridge` server, port 3221). Here is the part that matters most: every agent carries its own copy of this ability. It keeps working even if your project runs just one agent and nothing else — no shared brain required, no single point that can fail.',
      },
      // ── How it works (lifecycle) ─────────────────────────────────────────────
      {
        kind: 'h2',
        text: 'Safe Prompt Management: Preventing Context Window Inflation',
      },
      {
        kind: 'h3',
        text: 'How it works',
      },
      {
        kind: 'p',
        text: 'At some point you — or one of your agents — will want to change how an agent behaves: update an instruction, add a new skill, or hook up a new connector. Any model on the platform can start this, because these settings are copied to every agent. That is on purpose: even if your whole workspace is a single agent — only Codex, say, or only Hermes — the ability is still there. Nothing about it depends on one particular agent being present.',
      },
      {
        kind: 'p',
        text: 'You can say what you want in plain words — just write down your wish for how the agent should work. If you would rather be precise, you can hand it over in a structured way instead: through a small built-in terminal, or step by step with a to-do-style tool. One thing is important to be clear about: writing the wish is **not** the actual technical work. It does not build anything yet. It is a note — a clear brief kept for later, for the tool that will eventually generate the real skill.',
      },
      {
        kind: 'p',
        text: 'Every draft you add marks its parent container as changed — a small orange **req** badge appears next to it, so it is obvious that something is waiting. Whenever the moment is right, you or an agent can send that draft into work, either by pressing the matching button or as the result of a logical step. When that happens, the AI first clears the existing note, and then a fresh entry called **Next Step** is created on the **Development Steps** page. All the details of the task move into that entry. From there — depending on what else is running and what matters most — either an agent or a person starts the real build at the right time.',
      },
      {
        kind: 'p',
        text: 'Notice what does **not** happen: the draft is never turned into code automatically the instant you create it. That is a deliberate choice. Kicking off a build right then could crowd the agent\'s active context window, drag down the quality of the code it is generating in the main process, or — in the worst case — break the run entirely, for example by burning through your token budget earlier than you planned. So the hand-off is always a conscious step, taken when it makes sense.',
      },
      {
        kind: 'p',
        text: 'In short, the lifecycle is three simple moves:',
      },
      {
        kind: 'olist',
        items: [
          '**Create a draft** — write down the skill, instruction, or connector you want.',
          '**Move it into the queue** — when you are ready, send the draft on; it becomes a Next Step on the Development Steps page and waits its turn.',
          '**Turn it into the real thing** — an agent (or you) builds the actual skill, instruction, or connector, and it goes live.',
        ],
      },
      // ── Evolving applications ────────────────────────────────────────────────
      {
        kind: 'h2',
        text: 'From Verified Draft to Live Execution Environment',
      },
      {
        kind: 'p',
        text: 'Right now the loop is semi-automatic, and it is already fast. You describe what you want on the AI Draft Settings page. You send it on. An agent picks it up, builds it, and the new ability ships — often inside the same session. You set the direction; the AI does the building.',
      },
      {
        kind: 'p',
        text: 'This is the first part of a larger plan — a seven-stage pipeline for growing a workspace\'s skills. As we add the rest — automatic testing, catching regressions, visual diffs, usage data, and a feedback loop that tunes itself — each stage needs a little less human help than the last. The end state is a loop that runs on its own from start to finish, much like [Fractera\'s autonomous development loop](https://www.fractera.ai/ai-development-loop): a need shows up, an agent plans it, builds it, checks it, ships it, and writes down what happened — with nobody pressing a button.',
      },
      {
        kind: 'quote',
        text: 'The AI Draft Settings page is where human intent and machine capability meet. Today it needs a trigger. Tomorrow it will not.',
        cite: 'Fractera product team',
      },
      // ── Multi-framework strategy ─────────────────────────────────────────────
      {
        kind: 'h2',
        text: 'Cross-Framework Staging: Pre-Configured Transports for Every Stack',
      },
      {
        kind: 'p',
        text: 'Fractera started on Next.js, but the idea was never meant to stop there. AI-native development should not belong to a single framework. So we are bringing the same setup — the same depth that [Next.js developers have today](https://www.fractera.ai/next-aircraft-carrier) — to every popular web framework and application stack.',
      },
      {
        kind: 'p',
        text: 'The way we do it is straightforward. For each framework, we build a dedicated **ai-workspace transport**: a ready-made integration layer that wires that framework into Fractera\'s shared services, so you never have to figure out the plumbing yourself. Here is the full set of stacks we are bringing on board — open it up to see them all:',
      },
      {
        kind: 'frameworks',
      },
      {
        kind: 'h3',
        text: 'What every framework gets',
      },
      {
        kind: 'list',
        items: [
          '**A built-in database** — local SQLite through Fractera\'s data service, with a data layer that feels native to your framework',
          '**Authentication** — sessions and a [simple role model (guest, user, architect)](https://www.fractera.ai/en/documentation/authentication-roles-and-providers), fitted to how your framework already handles auth',
          '**File and media storage** — local object storage mounted at the framework level, with upload and download APIs ready on day one',
          '**The full AI agent stack** — all five coding agents (Claude Code, Codex, Gemini CLI, Qwen Code, Kimi Code) plus the Hermes brain, connected from the first deploy',
          '**One MCP architecture** — the same tool-first model no matter the stack; agents call tools, not raw APIs',
        ],
      },
      {
        kind: 'p',
        text: 'We are rolling these out one at a time, and every new starter gets announced here in News first.',
      },
      {
        kind: 'cta',
        text: 'Deploy your first AI-optimized workspace today — choose your framework and get started.',
        href: 'https://www.fractera.ai/',
        label: 'Deploy with AI',
      },
    ],
    faq: [
      {
        q: 'What is the AI Draft Settings page and what does it do?',
        a: 'AI Draft Settings is a workspace page included as standard with every Next.js-based Fractera starter. It is a visual control room for the AI side of your project — you can see and edit each agent\'s instruction files, review its active skills and MCP tools, and propose new capabilities through a simple draft system. It connects all six AI agents (Claude Code, Codex, Gemini CLI, Qwen Code, Kimi Code, and Hermes) in one place, with live views read straight from the project files.',
      },
      {
        q: 'How do AI agents interact with AI Draft Settings automatically?',
        a: 'Any of the six agents can call a built-in skill, "propose-new-agent-skill-or-mcp", to create a draft on its own, with no human in the loop. Hermes reaches the same place through its own connector (the owner_draft_create_record tool on the ai-draft-bridge server, port 3221). Each agent carries its own copy of the skill and is fully self-sufficient, so there is no single point of failure and no dependency on any other agent being online at the same moment.',
      },
      {
        q: 'Does turning a draft into a real skill happen automatically?',
        a: 'No — and that is deliberate. Creating a draft only writes down a brief; it does not build anything. When you or an agent send the draft on, it clears the note and creates a Next Step entry on the Development Steps page, where the real work is scheduled and run at the right time. Auto-launching a build the instant a draft is created could crowd the agent\'s context window, hurt the quality of the code in the main process, or burn through token limits early, so the hand-off is always a conscious step.',
      },
      {
        q: 'Which frameworks does Fractera support, and which are coming?',
        a: 'The AI Draft Settings page ships today with every Next.js-based starter. Beyond that, Fractera is building dedicated AI-workspace transports for all major web frameworks and stacks, including React, Vue, Angular, SvelteKit, Nuxt, Astro, Remix, Gatsby, TanStack Start, SolidStart, Qwik, Django, Flask, FastAPI, Laravel, Rails, Phoenix, NestJS, Fastify, Hono, .NET, and Spring. Each one delivers the same built-in database, authentication, file storage, and full AI agent stack — and every new starter is announced here in News as it goes live.',
      },
    ],
  },
]

export function getAllArticles(): NewsArticle[] {
  return [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date))
}

export function getArticle(slug: string): NewsArticle | undefined {
  return ARTICLES.find(a => a.slug === slug)
}

export function getArticleSlugs(): string[] {
  return ARTICLES.map(a => a.slug)
}
