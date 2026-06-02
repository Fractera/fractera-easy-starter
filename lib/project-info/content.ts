// Single source of truth for the Fractera project reference ("/mcp-info").
//
// Consumed by BOTH:
//   1. the public page  app/mcp-info/page.tsx   (human + AI-crawler facing)
//   2. the MCP tool     get_project_info()      (lib/mcp-tools.ts) — lazy, per-section
//
// Token economy is the whole point: the tool returns the section LIST first
// (~ids+titles only), and a single section's markdown body on demand — never the
// whole document. Bodies are Markdown strings (the page renders them; the agent
// reads them as-is).
//
// Language: English is primary (the page meta is English, aimed at AI agents
// scanning the site). Russian duplicates exist for the most user-facing sections
// (`titleRu`/`bodyRu`); when a RU body is absent the EN body is used as fallback.
// Expandable by design — add sections / fill RU over time (rule 4а/4б).
//
// ⚠️ HARD BOUNDARY (commercial secret — super important). This content is public
// (page + MCP tool) and is the ONLY thing the agent answers from. It must NEVER
// describe HOW the Fractera Easy Starter / setup-and-billing service works
// internally (no SSH, wipe, bootstrap script, reserve pool, provisioning API,
// dashboard/email pipeline mechanics). Refer to it only in general, results-only
// terms ("an external Fractera service provisions and configures everything for
// you"). What IS fine to describe fully: the workspace that runs ON the user's
// server (all ai-workspace layers) and the fact it is open-source on GitHub; and
// the user-facing RESULTS/outcomes of the external service without internals.

import type { SiteContent } from '@/lib/i18n/types'
import { en } from '@/lib/i18n/locales/en'
import { ru } from '@/lib/i18n/locales/ru'

export type InfoLang = 'en' | 'ru'

export type InfoSection = {
  id: string
  title: string
  titleRu?: string
  body: string
  bodyRu?: string
}

export const SECTIONS: InfoSection[] = [
  {
    id: 'what-is-fractera',
    title: 'What is Fractera',
    titleRu: 'Что такое Fractera',
    body: `Fractera is an open-source platform that turns a bare Ubuntu VPS into a complete, self-hosted, AI-native development environment in about 10 minutes — with one click or a short chat.

On your own server you get: five AI coding platforms (Claude Code, Codex, Gemini CLI, Qwen Code, Kimi Code), the **Hermes** orchestrator, **LightRAG** persistent memory, authentication, a database, and file storage — all pre-wired. No Clerk, no Supabase, no Vercel. One bill (your VPS), one place, full ownership of code and data.

You can install the full stack, or pick only the components you need — down to a plain server with a database and sign-in and no AI at all.`,
    bodyRu: `Fractera — это open-source платформа, которая за ~10 минут превращает чистый Ubuntu VPS в полноценную, самостоятельно размещённую, AI-native среду разработки — в один клик или через короткий чат.

На вашем сервере вы получаете: пять платформ для AI-разработки (Claude Code, Codex, Gemini CLI, Qwen Code, Kimi Code), оркестратор **Hermes**, постоянную память **LightRAG**, авторизацию, базу данных и хранилище файлов — уже связанные между собой. Без Clerk, без Supabase, без Vercel. Один счёт (ваш VPS), одно место, полное владение кодом и данными.

Можно установить весь стек или выбрать только нужные компоненты — вплоть до обычного сервера с базой данных и входом, вообще без ИИ.`,
  },
  {
    id: 'how-it-works',
    title: 'How deployment works',
    titleRu: 'Как происходит развёртывание',
    body: `1. You provide a server (IP + root password) — or buy a VPS first (see "VPS & pricing").
2. You choose what to install — the full stack or only the components you need.
3. Fractera's automated setup service configures everything on your server for you: it installs the tools you selected and sets up the database, authentication, file storage, and web routing, then brings all services online. You never run any commands yourself.
4. In ~8–14 minutes the workspace is live. You get email notifications when setup starts and when it finishes.

The result is **IP-first**: when it finishes, your workspace is live on plain HTTP at \`http://<your-IP>:3002\` — that is the Admin workspace where you start coding. Attaching your own domain with HTTPS is an optional later step you do yourself, inside the workspace (Admin → Personal Domain).

Three ways to start: the one-click form on the website, a partner/embed widget, or by chatting with an AI agent through the Fractera MCP connector.`,
    bodyRu: `1. Вы указываете сервер (IP + root-пароль) — или сначала покупаете VPS (см. «VPS и стоимость»).
2. Вы выбираете, что установить — весь стек или только нужные компоненты.
3. Автоматический сервис настройки Fractera сам всё конфигурирует на вашем сервере: ставит выбранные инструменты, настраивает базу данных, авторизацию, хранилище файлов и веб-маршрутизацию, затем выводит все сервисы в онлайн. Вам не нужно вводить никакие команды.
4. За ~8–14 минут рабочее пространство готово. На почту приходят уведомления о старте и о завершении настройки.

Результат идёт **сначала по IP**: по завершении рабочее пространство доступно по обычному HTTP на \`http://<ваш-IP>:3002\` — это панель администратора, где вы начинаете работать. Привязка собственного домена с HTTPS — отдельный необязательный шаг, который вы делаете сами внутри панели (Admin → Personal Domain).

Три способа запуска: форма в один клик на сайте, партнёрский/встраиваемый виджет, либо беседа с AI-агентом через MCP-коннектор Fractera.`,
  },
  {
    id: 'components',
    title: 'Components you can choose',
    titleRu: 'Компоненты, которые можно выбрать',
    body: `You decide what gets installed (a lighter, cheaper server). Selectable components:

- **Claude Code** — Anthropic coding agent
- **Codex** — OpenAI Codex CLI
- **Gemini CLI** — Google coding agent
- **Qwen Code** — Alibaba Qwen coding agent
- **Kimi Code** — Moonshot Kimi coding agent
- **Memory** — LightRAG vector knowledge base
- **Brain** — Hermes orchestration agent

Always installed (the core, never optional): the web app, authentication, database, object/file storage, the admin panel, and the admin panel's own **system terminal**. Unchecking every box above gives you a plain server with a database and sign-in — no AI.

You are never locked in: any recommended or custom tool can be installed later from the terminal built into your admin panel.`,
    bodyRu: `Вы сами решаете, что устанавливать (легче и дешевле сервер). Выбираемые компоненты:

- **Claude Code** — агент разработки Anthropic
- **Codex** — CLI OpenAI Codex
- **Gemini CLI** — агент разработки Google
- **Qwen Code** — агент разработки Alibaba Qwen
- **Kimi Code** — агент разработки Moonshot Kimi
- **Память** — векторная база знаний LightRAG
- **Мозг** — оркестратор Hermes

Всегда устанавливается (ядро, не отключается): веб-приложение, авторизация, база данных, хранилище объектов/файлов, панель администратора и встроенный в неё **системный терминал**. Если снять все галочки выше — получите обычный сервер с базой данных и входом, без ИИ.

Вы ничем не связаны: любой рекомендованный или собственный инструмент можно доустановить позже из терминала, встроенного в панель администратора.`,
  },
  {
    id: 'coding-platforms',
    title: 'The five AI coding platforms',
    body: `Claude Code, Codex, Gemini CLI, Qwen Code, and Kimi Code — all preconfigured on your server, each driven through a WebSocket bridge.

Key principle: they run on your existing **subscriptions**, not pay-per-token API keys. Sign in to each platform once (standard browser-based login, like a local CLI). No API keys to manage, no per-token billing surprises. You can switch platforms mid-task without losing your project context — LightRAG keeps the thread.

"Bridge online" means the process is alive and the WebSocket handshake works; logging into each platform's subscription is a separate one-time step after that.`,
  },
  {
    id: 'memory',
    title: 'Memory (LightRAG)',
    body: `Memory is a persistent vector knowledge base (LightRAG by HKUDS) shared across all your coding platforms. Feed it your codebase, documents, and architectural decisions; the agents query it to stay grounded in your context.

Why it matters: without persistent memory, every AI session starts from scratch — tokens spent re-explaining "where is the navbar?" are tokens not spent on your feature. Memory compounds with every iteration, so tasks that take 10–20 back-and-forth messages in a vanilla chat often resolve in 2–3. It does not auto-learn — it stores only what agents explicitly push. Activating it needs an OpenAI API key (used economically — the embedding model is among the cheapest), set in Admin → Memory settings.`,
  },
  {
    id: 'brain',
    title: 'Brain (Hermes orchestrator)',
    body: `Brain is the Hermes Agent (by Nous Research) deployed and configured on your VPS — the thinking centre of the workspace. It coordinates the connected AI subscriptions through shared context and can run autonomous, multi-step pipelines where each loop refines the next ("let Claude do this and Codex do that" — in parallel).

There is no separate built-in chat UI: you talk to Brain from your phone via a Telegram bot (create one with @BotFather, paste the token in Admin → Brain settings), or directly in the admin panel.`,
  },
  {
    id: 'auth-architecture',
    title: 'How authentication blankets the whole layer',
    titleRu: 'Как авторизация покрывает весь слой',
    body: `Authentication is not a single login screen bolted on — it is a layer-wide gate. A dedicated Auth service is the **only** component that issues the session, and every other service and page checks that session before serving anything.

- **One session authority.** The Auth service (NextAuth) is the sole writer of the session cookie. Providers: email + password (bcrypt) and Google OAuth / magic link. Client code never calls the auth service directly — pages ask a single \`/api/me\` endpoint, which resolves the current session.
- **Per-service gate.** The user-facing app and the admin workspace each run a request gate ("proxy") that runs BEFORE any page or API handler: no valid session → redirect or 401. So hitting any of these services without a session gets you nothing.
- **Gate for the non-web services too.** The database/storage service, Memory, and Brain don't serve web pages, so in secure mode the web server (Nginx) enforces an auth check (\`auth_request\`) on each of their subdomains — every authenticated host requires a valid session, closing any side door.
- **Roles.** Each user has roles (default \`user\`). \`user\` can use the app; \`admin\` has full access to the admin workspace and the coding platforms. The **first person to register on a fresh server becomes the admin**; admins can promote others.
- **Modes.** In open/IP onboarding mode the gates are intentionally relaxed for friction-free first access; once you attach a domain (secure mode) the cookie becomes \`Secure\`, scoped to your domain, and every gate strictly enforces.`,
    bodyRu: `Авторизация — это не один прикрученный экран входа, а сквозной заслон на весь слой. Отдельный сервис авторизации — **единственный**, кто выдаёт сессию, и каждый остальной сервис и страница проверяют эту сессию, прежде чем что-либо отдать.

- **Единый источник сессии.** Сервис авторизации (NextAuth) — единственный, кто пишет cookie сессии. Провайдеры: e-mail + пароль (bcrypt) и Google OAuth / magic-link. Клиентский код никогда не обращается к сервису авторизации напрямую — страницы спрашивают единый эндпоинт \`/api/me\`, который разрешает текущую сессию.
- **Заслон на каждом сервисе.** Пользовательское приложение и панель администратора запускают проверку запроса («proxy») ДО любой страницы или обработчика API: нет валидной сессии → редирект или 401. Поэтому обращение к этим сервисам без сессии ничего не даёт.
- **Заслон и для не-веб-сервисов.** Сервис базы данных/хранилища, Память и Мозг не отдают веб-страницы, поэтому в защищённом режиме веб-сервер (Nginx) выполняет проверку авторизации (\`auth_request\`) на каждом их субдомене — каждый авторизованный хост требует валидной сессии, закрывая любые «боковые двери».
- **Роли.** У каждого пользователя есть роли (по умолчанию \`user\`). \`user\` может пользоваться приложением; \`admin\` имеет полный доступ к панели и платформам разработки. **Первый зарегистрировавшийся на чистом сервере становится администратором**; админы могут назначать других.
- **Режимы.** В открытом/IP-режиме онбординга заслоны намеренно ослаблены ради лёгкого первого входа; после привязки домена (защищённый режим) cookie становится \`Secure\`, привязывается к вашему домену, и все заслоны работают строго.`,
  },
  {
    id: 'database-and-storage',
    title: 'How the database and object storage live in the layer',
    titleRu: 'Как в слое живут база данных и объектное хранилище',
    body: `Both the database and the file/object storage run on your own server as part of the layer — there is no external Supabase, no S3 bill.

- **Database.** A single SQLite database file (\`app.db\`) holds the application data. The schema is defined in ONE place and applied automatically at startup, so the local and remote paths always agree — there are no migration files to juggle and no "run migration" button. A dedicated data service owns the database and exposes it over an authenticated HTTP API; the app talks to it through that service.
- **Object / file storage.** The same data service stores media and files on the server's local disk and handles image work (icon generation, thumbnails, crops). Uploaded media is served back through the app, never from a third-party bucket.
- **Ownership.** Because both live on your VPS, your records and files never leave your server. Back them up (export) and restore (import) whenever you like; pausing the project never deletes your data.`,
    bodyRu: `И база данных, и хранилище файлов/объектов работают на вашем сервере как часть слоя — нет внешнего Supabase, нет счёта за S3.

- **База данных.** Одна база SQLite (файл \`app.db\`) хранит данные приложения. Схема описана в ОДНОМ месте и применяется автоматически при старте, поэтому локальный и удалённый пути всегда согласованы — нет отдельных файлов миграций и нет кнопки «выполнить миграцию». Выделенный сервис данных владеет базой и отдаёт её через авторизованный HTTP-API; приложение работает с ней через этот сервис.
- **Объектное / файловое хранилище.** Тот же сервис данных хранит медиа и файлы на локальном диске сервера и выполняет работу с изображениями (генерация иконок, миниатюры, кадрирование). Загруженные медиа отдаются обратно через приложение, а не из стороннего бакета.
- **Владение.** Поскольку и то, и другое живёт на вашем VPS, ваши записи и файлы никогда не покидают сервер. Делайте резервную копию (экспорт) и восстановление (импорт) когда угодно; пауза проекта не удаляет данные.`,
  },
  {
    id: 'orchestration',
    title: 'How Brain (Hermes) drives the coding agents via MCP',
    titleRu: 'Как Мозг (Hermes) управляет агентами разработки через MCP',
    body: `Each of the five coding platforms runs on your server behind its own WebSocket bridge — a live process you can drive interactively. Brain (Hermes) sits above them as the orchestrator.

- **Delegation over MCP.** Brain reaches each coding agent through a per-platform MCP delegation tool (each platform gets its own MCP endpoint on its own port). Through these tools Brain can hand a task to Claude Code, Codex, Gemini CLI, Qwen, or Kimi — individually or several at once.
- **Parallel, multi-step work.** Because delegation is tool-based, Brain can run autonomous pipelines: split a job ("let Claude do this part and Codex do that part"), run them in parallel, collect results, and decide the next step — each loop refining the next.
- **Shared context.** The agents are not isolated silos: they share project context (and Memory, below), so switching an in-flight task from one agent to another does not lose the thread.
- **You talk to Brain, Brain talks to the agents.** There is no separate chat UI for each agent in normal use — you direct Brain (from the admin panel or a Telegram bot) and Brain coordinates the rest.`,
    bodyRu: `Каждая из пяти платформ разработки работает на вашем сервере за собственным WebSocket-мостом — это живой процесс, которым можно управлять интерактивно. Мозг (Hermes) стоит над ними как оркестратор.

- **Делегирование через MCP.** Мозг обращается к каждому агенту разработки через отдельный MCP-инструмент делегирования (у каждой платформы свой MCP-эндпоинт на своём порту). Через эти инструменты Мозг может передать задачу Claude Code, Codex, Gemini CLI, Qwen или Kimi — по отдельности или нескольким сразу.
- **Параллельная, многошаговая работа.** Поскольку делегирование построено на инструментах, Мозг может запускать автономные конвейеры: разбить задачу («пусть Claude сделает это, а Codex — то»), выполнить параллельно, собрать результаты и решить следующий шаг — каждый цикл уточняет следующий.
- **Общий контекст.** Агенты не изолированы: они разделяют контекст проекта (и Память, ниже), поэтому переключение незавершённой задачи с одного агента на другого не теряет нить.
- **Вы говорите Мозгу, Мозг — агентам.** В обычной работе нет отдельного чата для каждого агента — вы управляете Мозгом (из панели администратора или через Telegram-бот), а Мозг координирует остальных.`,
  },
  {
    id: 'memory-flow',
    title: 'How Memory accumulates knowledge and how Brain & agents use it',
    titleRu: 'Как Память накапливает знания и как Мозг и агенты с ней работают',
    body: `Memory (LightRAG) is the shared accumulator of the whole layer — one vector knowledge base that every agent reads from and writes to, so context compounds instead of resetting each session.

- **Shared accumulator.** There is a single Memory for the server. Whatever any agent stores there — your codebase, documents, architectural decisions, solved problems — becomes available to every other agent. Knowledge accrues over time rather than living in one chat's history.
- **How information gets in.** Memory does **not** auto-learn. Agents (and you) push content into it explicitly through an ingest endpoint; each write is tagged with the identity of the agent that made it. This keeps the store curated, not noisy.
- **How Brain and each agent use it.** When working a task, Brain and the coding agents **query** Memory to ground their answer in your accumulated context before acting — so an agent starts a session already knowing your project instead of asking "where is the navbar?". Brain in particular leans on Memory to coordinate: it pulls shared context, then delegates with that context in hand.
- **Practical effect.** Tasks that take 10–20 back-and-forth messages in a vanilla chat often resolve in 2–3, because the model arrives already grounded. Activating Memory requires an OpenAI API key (used economically — the embedding model is among the cheapest), set in the admin panel.`,
    bodyRu: `Память (LightRAG) — общий накопитель всего слоя: одна векторная база знаний, из которой каждый агент читает и в которую пишет, поэтому контекст накапливается, а не обнуляется каждую сессию.

- **Общий накопитель.** На сервере одна Память. Что бы любой агент туда ни записал — ваш код, документы, архитектурные решения, решённые задачи — становится доступным каждому другому агенту. Знания накапливаются со временем, а не живут в истории одного чата.
- **Как информация попадает внутрь.** Память **не** обучается сама. Агенты (и вы) явно добавляют контент через эндпоинт ingest; каждая запись помечается идентификатором агента, который её сделал. Это держит хранилище курируемым, а не зашумлённым.
- **Как Мозг и каждый агент её используют.** Работая над задачей, Мозг и агенты разработки **запрашивают** Память, чтобы опереться на накопленный контекст перед действием — поэтому агент начинает сессию, уже зная ваш проект, а не спрашивая «где навбар?». Особенно на Память опирается Мозг при координации: он подтягивает общий контекст и делегирует уже с ним.
- **Практический эффект.** Задачи, требующие 10–20 сообщений туда-обратно в обычном чате, часто решаются за 2–3, потому что модель приходит уже «в курсе». Активация Памяти требует ключа OpenAI API (расходуется экономно — модель эмбеддингов из самых дешёвых), задаётся в панели администратора.`,
  },
  {
    id: 'modes',
    title: 'Two modes: IP (open) and Secure (your domain + HTTPS)',
    titleRu: 'Два режима: по IP (открытый) и защищённый (свой домен + HTTPS)',
    body: `**IP / insecure mode** (the default right after deploy): the workspace is reachable at \`http://<IP>:port\` over plain HTTP, with open onboarding. This gets you into your workspace in seconds, with no DNS or certificate wait. Your browser will show a "Not secure" warning — that is normal until you attach a domain.

**Secure mode** (after you attach your own domain): everything runs on \`https://<your-domain>\` with a free Let's Encrypt certificate (auto-renewed), strict role-based sign-in, and a host firewall that closes all service ports except 80/443. For regions or compliance rules where Let's Encrypt is unavailable, you can upload your own certificate.

You switch from IP to Secure yourself, inside the workspace (Admin → Personal Domain), whenever you want — and you can switch back.`,
    bodyRu: `**Режим по IP / незащищённый** (по умолчанию сразу после развёртывания): рабочее пространство доступно по \`http://<IP>:порт\` по обычному HTTP, вход открытый. Это позволяет войти за секунды, без ожидания DNS и сертификата. Браузер покажет предупреждение «Небезопасно» — это нормально, пока не привязан домен.

**Защищённый режим** (после привязки своего домена): всё работает на \`https://<ваш-домен>\` с бесплатным сертификатом Let's Encrypt (автопродление), строгим ролевым входом и файрволом хоста, закрывающим все служебные порты кроме 80/443. Для регионов или требований комплаенса, где Let's Encrypt недоступен, можно загрузить собственный сертификат.

Переключение из IP в защищённый режим вы делаете сами, внутри панели (Admin → Personal Domain), когда захотите — и можете вернуться обратно.`,
  },
  {
    id: 'secure-transition',
    title: 'Connecting your domain: the IP → Secure transition in detail',
    titleRu: 'Подключение домена: переход IP → защищённый режим в деталях',
    body: `A fresh deploy is IP/insecure by default. Moving to secure mode is a guided wizard in Admin → Personal Domain, run entirely from your own server:

1. **DNS.** Point your domain's A-records — the apex plus the service subdomains (www, auth, admin, data, hermes, lightrag) — at the server IP. The wizard verifies they resolve.
2. **Certificate.** The admin app runs certbot on the server to issue a single Let's Encrypt certificate covering all those hostnames. Alternatively you **upload your own certificate** — a first-class path for regions where Let's Encrypt is unavailable or where compliance requires specific (e.g. national / GOST) certs.
3. **Activate.** The workspace switches every service into secure mode at once: the mode flag flips in all services, the session cookie becomes \`Secure\` and scoped to your domain, Nginx is rewritten for HTTPS, and a host firewall closes every inbound port except 80/443. A safety watch probes the new domain and auto-rolls-back to the previous settings if it doesn't come up — so a mistake degrades gracefully instead of bricking the server.

**How the coding-platform bridges connect.** In IP mode the browser talks to each platform's bridge directly over \`ws://<host>:<port>\`. In secure mode they move to path-based **wss** under the cert-covered admin host — \`wss://admin.<domain>/ws/...\` — so the interactive terminals keep working over TLS with no mixed-content blocking.

**Reversible.** A "switch back to IP / demo mode" option restores the previous configuration and reopens the service ports. Certificates auto-renew (~every 60 days); if a certificate nears expiry an early warning email is sent.`,
    bodyRu: `Свежее развёртывание по умолчанию идёт по IP/незащищённо. Переход в защищённый режим — пошаговый мастер в Admin → Personal Domain, выполняется целиком на вашем сервере:

1. **DNS.** Направьте A-записи домена — корень плюс служебные субдомены (www, auth, admin, data, hermes, lightrag) — на IP сервера. Мастер проверяет их разрешение.
2. **Сертификат.** Админ-приложение запускает certbot на сервере и выпускает один сертификат Let's Encrypt на все эти хосты. Либо вы **загружаете собственный сертификат** — это полноценный путь для регионов, где Let's Encrypt недоступен или где комплаенс требует особых (например, национальных / ГОСТ) сертификатов.
3. **Активация.** Рабочее пространство переводит все сервисы в защищённый режим разом: флаг режима переключается во всех сервисах, cookie сессии становится \`Secure\` и привязывается к вашему домену, Nginx переписывается под HTTPS, а файрвол хоста закрывает все входящие порты, кроме 80/443. Страхующая проверка опрашивает новый домен и автоматически откатывает на прежние настройки, если он не поднялся — ошибка деградирует мягко, а не «кирпичит» сервер.

**Как подключаются мосты к платформам разработки.** В IP-режиме браузер общается с мостом каждой платформы напрямую по \`ws://<host>:<порт>\`. В защищённом режиме они переходят на путь-ориентированный **wss** под админ-хостом с сертификатом — \`wss://admin.<домен>/ws/...\` — поэтому интерактивные терминалы продолжают работать по TLS без блокировки смешанного контента.

**Обратимо.** Опция «вернуться в режим IP / демо» восстанавливает прежнюю конфигурацию и снова открывает служебные порты. Сертификаты продлеваются автоматически (~каждые 60 дней); при приближении истечения приходит предупреждающее письмо.`,
  },
  {
    id: 'data-ownership',
    title: 'Data ownership & cloud exit',
    titleRu: 'Владение данными и уход от облака',
    body: `Everything your application needs — authentication, database, file storage, AI memory — lives on a server you own. No third party has access to your data. No dependency on someone else's uptime, pricing changes, or terms.

This is the cloud-exit promise: no Clerk subscription, no Supabase invoice, no Vercel bill that scales with traffic; one server, one bill. If you pause your business, your data does not disappear — back it up and restore when ready. Your application code lives on GitHub, so recovery is always possible, and the built-in AI assistants can help rebuild even when dependencies have aged. It also helps you meet regulatory or internal-policy requirements and avoid surprise bills.`,
    bodyRu: `Всё, что нужно вашему приложению — авторизация, база данных, хранилище файлов, память ИИ — находится на сервере, которым владеете вы. Ни у кого постороннего нет доступа к вашим данным. Нет зависимости от чужого аптайма, изменения цен или условий.

Это и есть уход от облака: без подписки Clerk, без счёта Supabase, без счёта Vercel, растущего с трафиком; один сервер, один счёт. Если вы поставите бизнес на паузу, данные не исчезнут — сделайте резервную копию и восстановите, когда будете готовы. Код приложения хранится на GitHub, поэтому восстановление всегда возможно, а встроенные AI-ассистенты помогут пересобрать проект даже при устаревших зависимостях. Это также помогает соответствовать требованиям регуляторов или внутренней политики и избегать непредвиденных счетов.`,
  },
  {
    id: 'admin-panel',
    title: 'The admin panel (Bridges) and its default functions',
    titleRu: 'Панель администратора (Bridges) и её функции по умолчанию',
    body: `The admin workspace — also called Bridges — is the control panel that runs on your server. It is where you actually drive everything, and it requires the admin role (the first person to register on a fresh server). By default it gives you:

- **A carousel of your installed coding platforms.** Click one to open its live interactive terminal; an always-present **system terminal** is the last card (see "The system terminal").
- **Brain and Memory canvases** (if those components are installed) — open the Hermes and LightRAG interfaces inline.
- **Settings menu:** Users (accounts and roles), Upload media, Database browser (view and edit tables directly), Environment variables, Personal Domain (the IP → secure wizard), Hermes / Memory settings (API keys), Export / Import data (a backup ZIP of database + storage), and Help.
- **Footer actions:** Deploy (rebuild the open app layer after changes), GitHub connect with one-click Pull / Push, Info (README), links to Skills and Product Loop, and the current build version.

Everything an agent or you build lives behind this panel, and every part of it is gated by authentication (see "How authentication blankets the whole layer").`,
    bodyRu: `Рабочее пространство администратора — оно же Bridges — это панель управления, работающая на вашем сервере. Именно отсюда вы всем управляете; нужна роль admin (первый зарегистрировавшийся на чистом сервере). По умолчанию она даёт:

- **Карусель установленных платформ разработки.** Клик открывает живой интерактивный терминал платформы; последняя карта — всегда присутствующий **системный терминал** (см. «Системный терминал»).
- **Холсты Мозга и Памяти** (если эти компоненты установлены) — открывают интерфейсы Hermes и LightRAG прямо внутри.
- **Меню настроек:** Пользователи (аккаунты и роли), Загрузка медиа, Браузер базы данных (просмотр и редактирование таблиц напрямую), Переменные окружения, Личный домен (мастер перехода IP → защищённый режим), настройки Hermes / Памяти (API-ключи), Экспорт / Импорт данных (резервный ZIP базы + хранилища) и Помощь.
- **Действия в подвале:** Deploy (пересборка открытого слоя приложения после изменений), подключение GitHub с Pull / Push в один клик, Info (README), ссылки на Навыки и Продуктовую петлю, текущая версия сборки.

Всё, что вы или агент создаёте, живёт за этой панелью, и каждая её часть закрыта авторизацией (см. «Как авторизация покрывает весь слой»).`,
  },
  {
    id: 'system-terminal',
    title: 'The system terminal',
    body: `The admin panel includes a system terminal — a plain project-level shell on the server, always present as the last card in the carousel. Unlike the AI platforms it can never be disabled, because it is part of the core.

Use it to install extra tooling, run one-off commands, link your Telegram bot to Brain, install your own copy of a coding agent, or anything else the server level needs. It opens at the project root where the services live.`,
  },
  {
    id: 'vps-and-pricing',
    title: 'VPS, specs & pricing',
    titleRu: 'VPS, требования и стоимость',
    body: `Fractera is free. There are **no plans and no tiers** — the platform is always free to use. The only money involved is the VPS you run it on (paid to your hosting provider, never to Fractera) and **optional, voluntary sponsorship** ($1 / $5 / $20 — see "Sponsorship & Fractera Pro").

For full AI-coding workloads the recommended minimum is **4–6 cores and 6–8 GB RAM**; storage depends on your project (75 GB is a solid baseline). Once active AI development wraps up, you can downgrade to ~2 cores / 4 GB RAM — often just a couple of euros per month. A plain server with no AI needs even less.

You bring your own VPS from any provider.`,
    bodyRu: `Fractera бесплатна. **Никаких тарифов и планов нет** — платформой всегда можно пользоваться бесплатно. Единственные деньги — это VPS, на котором вы её запускаете (платится вашему хостинг-провайдеру, а не Fractera), и **необязательная добровольная спонсорская поддержка** ($1 / $5 / $20 — см. «Спонсорство и Fractera Pro»).

Для полноценной AI-разработки рекомендуемый минимум — **4–6 ядер и 6–8 ГБ ОЗУ**; объём диска зависит от проекта (75 ГБ — хорошая база). После активной AI-разработки можно понизить до ~2 ядер / 4 ГБ ОЗУ — часто это пара евро в месяц. Обычному серверу без ИИ нужно ещё меньше.

Вы используете собственный VPS от любого провайдера.`,
  },
  {
    id: 'use-cases',
    title: 'Who it is for & use cases',
    titleRu: 'Для кого и сценарии применения',
    body: `- **Vibe-coders and solo founders** who want a production stack (auth, DB, storage, AI) without wiring ten cloud services together.
- **Experienced developers** who want to offload cloud-resource management and DevOps — deploy a plain server, sync it with a local IDE (e.g. VS Code) over GitHub, and treat their own VPS as a self-hosted alternative to Vercel.
- **Teams needing data sovereignty** — keep user data, auth, and database on infrastructure they control, to meet regulatory or internal-policy requirements.
- **Builders bringing an existing project** — connect a GitHub repo and continue AI-assisted development on the server.
- **People who want autonomous AI workflows** — let Hermes coordinate multiple agents on multi-step tasks.

The same server can be used purely as a self-hosted backend (database + object storage + optional auth) with no AI at all.`,
    bodyRu: `- **Vibe-кодеры и соло-фаундеры**, которым нужен производственный стек (авторизация, БД, хранилище, ИИ) без сшивания десятка облачных сервисов.
- **Опытные разработчики**, желающие снять с себя управление облачными ресурсами и DevOps — развернуть обычный сервер, синхронизировать его с локальной IDE (например, VS Code) через GitHub и использовать свой VPS как самостоятельную замену Vercel.
- **Команды, которым нужен суверенитет данных** — держать данные пользователей, авторизацию и базу на подконтрольной инфраструктуре, чтобы соответствовать требованиям регуляторов или внутренней политике.
- **Те, кто переносит существующий проект** — подключить GitHub-репозиторий и продолжить AI-разработку на сервере.
- **Те, кому нужны автономные AI-сценарии** — Hermes координирует несколько агентов на многошаговых задачах.

Этот же сервер можно использовать как чисто самостоятельный бэкенд (база данных + хранилище объектов + опциональная авторизация) вообще без ИИ.`,
  },
  {
    id: 'browser-first',
    title: 'Browser-first development & voice commands',
    titleRu: 'Разработка в браузере и голосовые команды',
    body: `Production AI development happens entirely in your browser, from the first second — no VS Code, no local environment to configure, no database to spin up, no deployment pipeline to debug. You open a tab and the server is already live, the domain registered, the database running, and the coding platforms wait for your first command.

- **Voice commands.** Issue coding commands and navigate content hands-free via microphone; agents respond to natural voice input in real time.
- **Instant production.** One click deploys your changes live — no CI pipeline, no hosting config.
- **Any device.** All computation runs on the VPS, so a laptop, tablet, or phone is enough.

This is what lets anyone with an idea — not only engineers — build, ship, and scale a real product without leaving the browser.`,
    bodyRu: `Продакшн-разработка с ИИ идёт целиком в браузере, с первой секунды — без VS Code, без локального окружения, без поднятия базы, без отладки пайплайна деплоя. Открываете вкладку — сервер уже работает, домен зарегистрирован, база запущена, а платформы разработки ждут вашей первой команды.

- **Голосовые команды.** Отдавайте команды на кодинг и навигацию голосом через микрофон; агенты реагируют на естественную речь в реальном времени.
- **Мгновенный продакшн.** Один клик публикует изменения вживую — без CI-пайплайна и настройки хостинга.
- **Любое устройство.** Все вычисления — на VPS, поэтому достаточно ноутбука, планшета или телефона.

Именно это позволяет любому человеку с идеей — не только инженеру — собрать, выпустить и масштабировать настоящий продукт, не покидая браузер.`,
  },
  {
    id: 'ownership-and-trust',
    title: 'What Fractera can and cannot do (ownership & trust)',
    titleRu: 'Что Fractera может и чего не может (владение и доверие)',
    body: `This is your software on your servers. Fractera helps install it — and nothing more.

- **Change your password after install.** Immediately after installation completes, change the password for access to your server.
- **No access, no control.** Fractera does not gain control over your code, and we have no access to your servers. There is no backdoor — the deployed product cannot push to our repositories (verified by a security audit).
- **Always recoverable, always portable.** Your code lives on GitHub and your data on your VPS; you can inspect it, back it up, export it, or walk away at any time. Nothing locks you in.`,
    bodyRu: `Это ваше ПО на ваших серверах. Fractera помогает его установить — и не более того.

- **Смените пароль после установки.** Сразу после завершения установки смените пароль доступа к вашему серверу.
- **Нет доступа, нет контроля.** Fractera не получает контроль над вашим кодом, и у нас нет доступа к вашим серверам. Бэкдора нет — развёрнутый продукт не может пушить в наши репозитории (подтверждено аудитом безопасности).
- **Всегда восстановимо и переносимо.** Код хранится на GitHub, данные — на вашем VPS; вы можете изучить их, сделать резервную копию, экспортировать или уйти в любой момент. Никакой привязки.`,
  },
  {
    id: 'features-overview',
    title: 'Included features (and what Pro adds)',
    titleRu: 'Включённые функции (и что добавляет Pro)',
    body: `Included for everyone:
- Hermes AI agents with self-learning memory
- Voice AI commands
- Built-in auth: Google OAuth, magic-link email, credentials, role management
- Database (SQLite, WAL mode) + object/file storage + media service
- One-click backups & restore (snapshot and re-upload to restore or clone)
- GitHub sync — push, pull, and deploy from the admin panel in one click
- All five coding platforms preconfigured; LightRAG memory initialized on first start
- Skills marketplace access

Advanced — Fractera Pro ($20 sponsors): production SEO, PWA and multi-language routing; element highlighting (click any UI element to capture its exact id — fewer tokens); up to 11 parallel routing slots with static SEO; ready-made page sections that cut token spend many times over. See "Fractera Pro".`,
    bodyRu: `Доступно всем:
- AI-агенты Hermes с самообучающейся памятью
- Голосовые команды
- Встроенная авторизация: Google OAuth, magic-link на почту, логин-пароль, роли
- База данных (SQLite, режим WAL) + объектное/файловое хранилище + медиа-сервис
- Резервные копии и восстановление в один клик (снимок и загрузка для восстановления или клонирования)
- Синхронизация с GitHub — push, pull и деплой из панели в один клик
- Все пять платформ разработки преднастроены; память LightRAG инициализируется при первом запуске
- Доступ к маркетплейсу навыков

Продвинутое — Fractera Pro (спонсоры $20): продакшн-SEO, PWA и мультиязычная маршрутизация; подсветка элементов (клик по элементу UI копирует его точный id — меньше токенов); до 11 слотов параллельной маршрутизации со статическим SEO; готовые секции страниц, многократно снижающие расход токенов. См. «Fractera Pro».`,
  },
  {
    id: 'market-opportunity',
    title: 'Why now — the opportunity',
    titleRu: 'Почему сейчас — возможность',
    body: `In early 2026 the largest untapped AI value was described as sitting inside businesses that have neither a website nor an API — the work currently handed to outsourcers (customer service, operations) that AI could do directly, framed as close to a trillion-dollar opportunity.

Fractera is built to let a single founder or a small team reach that opportunity: stand up real, owned software infrastructure fast, then let AI do both the building and the operating. The point is not "another dev tool" — it is letting anyone with an idea ship and run a real product, owning the whole stack.`,
    bodyRu: `В начале 2026 года крупнейшую незанятую ценность для ИИ описали так: она лежит внутри бизнесов, у которых нет ни сайта, ни API — это работа, которую сейчас отдают на аутсорс (клиентский сервис, операции) и которую ИИ мог бы делать напрямую; масштаб оценивают близко к триллиону долларов.

Fractera создана, чтобы один основатель или небольшая команда могли дотянуться до этой возможности: быстро поднять настоящую собственную программную инфраструктуру, а затем поручить ИИ и разработку, и эксплуатацию. Суть не в «ещё одном инструменте разработчика», а в том, чтобы любой человек с идеей мог выпустить и вести настоящий продукт, владея всем стеком целиком.`,
  },
  {
    id: 'company-brain-b2b',
    title: 'AI Company Brain (B2B appliance) — distinct from on-VPS Memory/Brain',
    titleRu: 'AI Company Brain (B2B-устройство) — отдельно от Памяти/Мозга на VPS',
    body: `Separate from the on-VPS "Memory" and "Brain" described above, Fractera offers a B2B **AI Company Brain**: a physical Apple Silicon appliance (Mac mini or Mac Studio) placed in your office and personally configured by the Fractera founder.

It combines a private LightRAG knowledge graph — ingesting meetings, documents, voice memos, emails and chat history into structured corporate memory — with a Hermes agent that acts on it and returns finished work as clean links (a document, a deck, a site), briefed by voice from Telegram. It runs 24/7 on your desk (~30W) and nothing leaves the building. Pricing is by agreement (each engagement scoped to the business); capacity is strictly limited. First step is a founder consultation — admin@fractera.ai.`,
    bodyRu: `Отдельно от «Памяти» и «Мозга» на VPS, описанных выше, Fractera предлагает B2B-решение **AI Company Brain**: физическое устройство на Apple Silicon (Mac mini или Mac Studio), которое ставится в вашем офисе и персонально настраивается основателем Fractera.

Оно объединяет приватный граф знаний LightRAG — поглощающий встречи, документы, голосовые заметки, письма и историю переписки в структурированную корпоративную память — с агентом Hermes, который действует на её основе и возвращает готовую работу ссылками (документ, презентация, сайт), с постановкой задач голосом из Telegram. Работает 24/7 на вашем столе (~30 Вт), и ничего не покидает здание. Цена — по договорённости (каждый проект оценивается индивидуально); мощность строго ограничена. Первый шаг — консультация с основателем: admin@fractera.ai.`,
  },
  {
    id: 'sovereignty-russia',
    title: 'Sovereignty & import substitution (Russia)',
    titleRu: 'Суверенность и импортозамещение (Россия)',
    body: `Country-specific note for Russia. The public side of your project is 100% under Russian jurisdiction: server, user data, domain and certificate stay in the Russian Federation.

- **User data in Russia (152-FZ).** Database, file storage and authentication run on your server in Russia; the infrastructure lets you meet the 152-FZ requirement to store citizens' personal data in-country.
- **Server in Russia.** Deploy with a Russian provider (e.g. Timeweb Cloud); the whole production perimeter stays under Russian jurisdiction, with no foreign clouds in the data path.
- **Domain & certificate by Russian law.** A .ru domain at a Russian registrar (e.g. reg.ru) and TLS are set up automatically; national / GOST certificates fit the sovereign-infrastructure logic (you can upload your own certificate).
- **Development is the developer's free choice.** You write code with any AI assistant and may work from abroad — that is the private side, outside the regulated personal-data perimeter. For those who want full sovereignty, Chinese models Qwen and Kimi are available without restrictions.

Responsibility boundary (honest): the infrastructure is sovereign; responsibility for processing specific personal data in production rests with the developer. Fractera "lets you comply", it is not a certification.`,
    bodyRu: `Страновая заметка для России. Публичная сторона вашего проекта на 100% под российской юрисдикцией: сервер, данные пользователей, домен и сертификат остаются на территории РФ.

- **Данные пользователей — в РФ (152-ФЗ).** База, файловое хранилище и авторизация работают на вашем сервере в России; инфраструктура позволяет соответствовать требованию 152-ФЗ о хранении персональных данных граждан внутри страны.
- **Сервер — в России.** Разворачивайтесь у российского провайдера (например, Timeweb Cloud); весь продакшн-контур остаётся под российской юрисдикцией, без иностранных облаков в цепочке обработки данных.
- **Домен и сертификат по российскому закону.** Домен .ru у российского регистратора (например, reg.ru) и TLS настраиваются автоматически; национальные / ГОСТ-сертификаты вписываются в логику суверенной инфраструктуры (можно загрузить собственный сертификат).
- **Разработка — свободный выбор разработчика.** Код вы пишете с любым AI-ассистентом и можете работать хоть из-за границы — это приватная сторона, вне регулируемого контура ПДн. Кому суверенность важна до конца — доступны китайские модели Qwen и Kimi без ограничений.

Граница ответственности (честно): инфраструктура суверенна; ответственность за обработку конкретных персональных данных в проде лежит на разработчике. Fractera «позволяет соответствовать», это не сертификация.`,
  },
  {
    id: 'open-source',
    title: 'Open source & what runs where',
    titleRu: 'Открытый код и что где работает',
    body: `The workspace that runs on your server is open and will be available as open source on GitHub — every layer of it: the web app, authentication, database/storage service, the coding-platform bridges, the memory (LightRAG) and orchestrator (Hermes) integrations. You own it and can inspect, extend, or self-host it entirely.

Provisioning, billing, and the automated setup/delivery are handled by an external Fractera service that we operate. It is what puts the open-source workspace onto your server and manages your account — you interact with its results (the deploy, the dashboard, the emails), not its internals.

So: the product on your server = open. The service that delivers and bills it = operated by Fractera. Your code and data always stay on your server.`,
    bodyRu: `Рабочее пространство, которое работает на вашем сервере, — открытое и будет доступно как open source на GitHub — все его слои: веб-приложение, авторизация, сервис базы данных/хранилища, мосты к платформам разработки, интеграции памяти (LightRAG) и оркестратора (Hermes). Вы им владеете и можете изучать, расширять или размещать его полностью самостоятельно.

Провижининг, биллинг и автоматическая настройка/доставка обеспечиваются внешним сервисом Fractera, который мы эксплуатируем. Именно он размещает открытое рабочее пространство на вашем сервере и управляет вашим аккаунтом — вы взаимодействуете с его результатами (развёртывание, панель, письма), а не с его внутренним устройством.

Итог: продукт на вашем сервере — открытый. Сервис, который его доставляет и тарифицирует, — эксплуатируется Fractera. Ваш код и данные всегда остаются на вашем сервере.`,
  },
  {
    id: 'marketplace',
    title: 'Skills & Product Loop (roadmap)',
    titleRu: 'Маркетплейс навыков и Продуктовая петля (планы)',
    body: `Two future products (planned, not fully built yet):

- **Skills** — packaged, reusable AI workflows. Package the workflows you have solved, sell them, share them free, or buy battle-tested recipes from other builders.
- **Product Loop** — the digitized end-to-end entrepreneurial journey (company registration → traffic → unit economics → scaling) as conditional, branching decision logic another founder can buy. Not a step-by-step manual but a living knowledge base of the decisions that worked.

**Pricing is set by the users** who create the skills or digitize their business — Fractera does not set prices. The project acts only as the observer/host: it provides the server capacity these services run on and takes a **20% commission**.`,
    bodyRu: `Два будущих продукта (в планах, ещё не готовы полностью):

- **Навыки (Skills)** — упакованные, переиспользуемые AI-процессы. Упакуйте отлаженные процессы, продавайте их, делитесь бесплатно или покупайте проверенные рецепты у других.
- **Продуктовая петля (Product Loop)** — оцифрованный сквозной путь предпринимателя (регистрация компании → трафик → юнит-экономика → масштабирование) как ветвящаяся условная логика решений, которую может купить другой основатель. Не пошаговая инструкция, а живая база знаний о сработавших решениях.

**Цены задают сами пользователи**, которые создают навыки или оцифровывают свой бизнес — Fractera цены не устанавливает. Проект выступает только наблюдателем/хостом: предоставляет серверные мощности, на которых работают эти услуги, и получает **комиссию 20%**.`,
  },
  {
    id: 'partner-program',
    title: 'Partner / referral program',
    body: `The Fractera Partner Program is simple and provider-agnostic: you recommend Fractera deployment, your readers buy a VPS from any host with an affiliate program, and the host pays you directly — Fractera is never in the middle.

You choose the provider (Hetzner, DigitalOcean, Vultr, Hostinger, Timeweb, Contabo, and many more run affiliate programs). The Fractera cabinet gives you a personal landing mirror, an embed widget for your blog, and an MCP link for AI agents — your links replace the defaults in the "where to buy a VPS" block. Direct programs can pay up to 30–40% of the first payment. Questions: admin@fractera.ai.`,
  },
  {
    id: 'regional-partners',
    title: 'Regional partners (official resellers)',
    titleRu: 'Региональные партнёры (официальные реселлеры)',
    body: `Separate from the affiliate Partner Program, Fractera is looking for **regional partners** who represent Fractera in their region on equal terms — promoting the business and receiving and fulfilling orders to install Fractera and the AI Company Brain locally.

- **Business requirements:** a registered legal entity operating 3+ years; a significant audience of partners or subscribers; strong SEO and external-link skills; business-development skills.
- **What we offer:** a page for your region carrying your own VPS + domain referral links; referral rewards split **30 / 70 (partner keeps 70%)**; official Fractera reseller status in your region.
- **Partner responsibilities:** promote your regional page in search by driving traffic via your own publications, pages and mailings — the more visitors, the more referral reward from VPS and domain sales.
- **What a "region" is:** either a whole country (when it is effectively one state/region) or a state/region within a country — so one country can have several regional representatives.
- **How to apply:** email admin@fractera.ai with the subject "Regional representation application". Full page: /en/regional-partners (or /ru/regional-partners).`,
    bodyRu: `Отдельно от партнёрской (реферальной) программы, Fractera ищет **региональных партнёров**, которые представляют Fractera в своём регионе на равных правах — продвигают бизнес, а также получают и исполняют заказы на установку Fractera и AI Company Brain на месте.

- **Требования к бизнесу:** зарегистрированное юрлицо со стажем 3+ года; значительная аудитория партнёров или подписчиков; высокие навыки SEO и работы с внешними ссылками; навыки business development.
- **Что мы предлагаем:** страницу для вашего региона с вашими реферальными ссылками на VPS и домен; деление вознаграждений **30 / 70 (партнёр получает 70%)**; статус официального реселлера Fractera в регионе.
- **Обязанности партнёра:** продвигать страницу региона в поиске, привлекая трафик через собственные публикации, страницы и рассылки — чем больше посетителей, тем больше реферальное вознаграждение от продаж VPS и домена.
- **Что такое «регион»:** либо целая страна (если по сути это один штат/регион), либо штат/регион внутри страны — поэтому в одной стране может быть несколько региональных представителей.
- **Как подать заявку:** письмо на admin@fractera.ai с темой «Заявка на региональное представительство». Полная страница: /ru/regional-partners (или /en/regional-partners).`,
  },
  {
    id: 'sponsorship',
    title: 'Sponsorship & Fractera Pro',
    titleRu: 'Спонсорство и Fractera Pro',
    body: `Fractera charges nothing — support is **entirely voluntary**. There are exactly three sponsorship amounts: **$1, $5, or $20 per month**. No other amounts are ever charged, and there are no hidden plans.

Each tier unlocks perks:
- **$1** — access to the private sponsor community (architecture details, debugging help, faster fixes).
- **$5** — also removes the "Powered by Fractera" branding from your site.
- **$20 — Fractera Pro:** the full, densest set of advanced pre-built capabilities (see "Fractera Pro"), plus direct access to the founder.

Even $1/month makes a real difference and unlocks the private channel.`,
    bodyRu: `Fractera ничего не взимает — поддержка **полностью добровольная**. Есть ровно три суммы спонсорства: **$1, $5 или $20 в месяц**. Никакие другие суммы не взимаются, скрытых тарифов нет.

Каждый уровень открывает перки:
- **$1** — доступ к закрытому сообществу спонсоров (детали архитектуры, помощь с отладкой, более быстрые фиксы).
- **$5** — дополнительно убирает брендинг «Powered by Fractera» с вашего сайта.
- **$20 — Fractera Pro:** полный, максимально плотный набор продвинутых преднастроенных возможностей (см. «Fractera Pro») плюс прямое общение с основателем.

Даже $1/мес реально помогает и открывает закрытый канал.`,
  },
  {
    id: 'fractera-pro',
    title: 'Fractera Pro',
    titleRu: 'Fractera Pro',
    body: `Fractera Pro is an advanced architecture built on deep, hard-won Next.js 16 expertise — it unlocks the full power of the framework.

Advanced capabilities like **parallel routing, search-engine optimization, and static generation** — with a focus on doing the work with **minimal calls to the server** — are exactly the things AI tools most often get wrong or wire up with serious mistakes. The reason is simple: there are almost no correct examples of these patterns on the internet, so a model has nothing reliable to imitate. The right configuration is found only through an enormous amount of testing to discover the patterns that actually work.

Pro gives you the **densest possible saturation** of these advanced features — and you **don't spend tokens** building them. They arrive as **pre-configured page templates and tools**, ready to use. Fractera Pro is available to **$20 sponsors**.`,
    bodyRu: `Fractera Pro — это продвинутая архитектура, основанная на максимально глубинной экспертизе в Next.js 16; она раскрывает всю мощь фреймворка.

Продвинутые возможности — **параллельная маршрутизация, поисковая оптимизация и статическая генерация** — с фокусом на работу с **минимальным обращением к серверу** — это как раз то, что искусственный интеллект чаще всего реализует с большими ошибками. Причина проста: в интернете почти нет правильных примеров этих паттернов, и модели нечему надёжно подражать. Верная настройка приходит только через огромное количество тестов для выявления работающих паттернов.

Pro даёт **максимально плотное насыщение** этими продвинутыми функциями — причём на их разработку **не понадобятся токены**. Они приходят как **преднастроенные шаблоны страниц и инструменты**, готовые к использованию. Fractera Pro доступен **спонсорам уровня $20**.`,
  },
  {
    id: 'system-anatomy',
    title: 'System anatomy — the services on your server',
    titleRu: 'Анатомия системы — сервисы на вашем сервере',
    body: `On your VPS the product runs as seven cooperating services (kept alive by a process manager) behind one web server (Nginx):

- **Shell app** — the main user-facing application and iframe host; this is the open layer where your product is built.
- **Auth** — the only service that issues the login session.
- **Admin / Bridges** — the control panel (carousel, settings, domain wizard, deploy) and the Memory (RAG) proxy.
- **Bridges** — the WebSocket bridges to the five coding platforms, and the always-on system terminal.
- **Data** — the SQLite database plus media / file storage.
- **Memory** — the LightRAG vector knowledge base.
- **Brain** — the Hermes orchestration agent.

Only ports 22/80/443 are public. The service ports are reached through Nginx in secure mode, or directly on the IP during onboarding. Nothing else is needed — no external Postgres/MySQL, no S3/MinIO, no Docker; the database is a file and storage is local disk, all on your server.`,
    bodyRu: `На вашем VPS продукт работает как семь взаимодействующих сервисов (под менеджером процессов) за одним веб-сервером (Nginx):

- **Shell-приложение** — основное пользовательское приложение и хост iframe; это открытый слой, где собирается ваш продукт.
- **Auth** — единственный сервис, выдающий сессию входа.
- **Admin / Bridges** — панель управления (карусель, настройки, мастер домена, деплой) и прокси к Памяти (RAG).
- **Bridges** — WebSocket-мосты к пяти платформам разработки и всегда доступный системный терминал.
- **Data** — база данных SQLite плюс медиа / файловое хранилище.
- **Memory** — векторная база знаний LightRAG.
- **Brain** — оркестратор Hermes.

Публичны только порты 22/80/443. К служебным портам обращаются через Nginx в защищённом режиме или напрямую по IP при онбординге. Больше ничего не нужно — нет внешних Postgres/MySQL, нет S3/MinIO, нет Docker; база — это файл, хранилище — локальный диск, всё на вашем сервере.`,
  },
  {
    id: 'open-vs-guarded',
    title: 'Open layer vs guarded layers',
    titleRu: 'Открытый слой и мягко-защищённые слои',
    body: `The product exists so AI agents can build YOUR app, so the layers have different access rules:

- **Open layer (the app):** where the in-VPS coding agents work freely — this is your product.
- **Guarded layers (auth, data, memory, bridges):** soft-protected from accidental agent edits; advanced users can still extend them — add an auth provider, a new data strategy, or tune the agent ↔ memory wiring.

The whole product on your server is open-source-ready. A security audit confirmed that a deployed server cannot push to Fractera's own repositories — your instance is isolated and yours.`,
    bodyRu: `Продукт существует, чтобы ИИ-агенты собирали ВАШЕ приложение, поэтому у слоёв разные правила доступа:

- **Открытый слой (приложение):** где агенты разработки на VPS работают свободно — это ваш продукт.
- **Мягко-защищённые слои (auth, data, memory, bridges):** защищены от случайных правок агентами; продвинутые пользователи всё же могут их расширять — добавить провайдера авторизации, новую стратегию данных или донастроить связку агент ↔ память.

Весь продукт на вашем сервере готов к open-source. Аудит безопасности подтвердил, что развёрнутый сервер не может пушить в собственные репозитории Fractera — ваш экземпляр изолирован и принадлежит вам.`,
  },
  {
    id: 'security-model',
    title: "Security model — why a raw port can't bypass secure mode",
    titleRu: 'Модель безопасности — почему голый порт не обходит защищённый режим',
    body: `In secure mode access is protected by two independent layers:

- **Per-process authentication.** The mode flag is per-service; in secure mode every service enforces login. The session cookie is Secure and scoped to your domain, so it is never sent to a bare-IP address — you cannot be logged in over the plain-IP path.
- **Host firewall.** Secure mode closes every inbound port except 80/443, so the service ports (database, Memory, Brain, etc.) are unreachable from the internet. Nginx on 443 becomes the only entrance, while the local reverse proxy to each service keeps working.

In onboarding (IP) mode the ports stay open on purpose for zero-friction first access; only secure mode locks down.`,
    bodyRu: `В защищённом режиме доступ защищён двумя независимыми слоями:

- **Авторизация на уровне каждого процесса.** Флаг режима — у каждого сервиса; в защищённом режиме каждый сервис требует вход. Cookie сессии — Secure и привязана к вашему домену, поэтому она никогда не отправляется на голый IP — войти по plain-IP нельзя.
- **Файрвол хоста.** Защищённый режим закрывает все входящие порты, кроме 80/443, поэтому служебные порты (база, Память, Мозг и т.д.) недоступны из интернета. Nginx на 443 становится единственным входом, а локальный reverse proxy к каждому сервису продолжает работать.

В режиме онбординга (IP) порты намеренно открыты ради лёгкого первого входа; блокировка включается только в защищённом режиме.`,
  },
  {
    id: 'branding-footer',
    title: '"Powered by Fractera" footer',
    titleRu: 'Футер «Powered by Fractera»',
    body: `By default the public pages of your site carry a small "Powered by Fractera" link — a crawlable back-link to the project. It is added at the web-server layer (not inside your app code), so it is consistent across your public pages.

Sponsors at the **$5 tier (white-label)** have it removed automatically and permanently — and if you rebuild your server, white-label status is reapplied so it stays removed.`,
    bodyRu: `По умолчанию публичные страницы вашего сайта несут небольшую ссылку «Powered by Fractera» — индексируемую обратную ссылку на проект. Она добавляется на уровне веб-сервера (не внутри кода приложения), поэтому единообразна на всех публичных страницах.

У спонсоров уровня **$5 (white-label)** она убирается автоматически и навсегда — и если вы пересоберёте сервер, статус white-label применяется заново, и она остаётся убранной.`,
  },
  {
    id: 'telegram-surface',
    title: 'Talking to the system — Telegram is the external surface',
    titleRu: 'Общение с системой — Telegram как внешняя поверхность',
    body: `For day-to-day use there is no separate built-in chat UI: you direct Brain (Hermes) from your phone via a Telegram bot (create one with @BotFather, paste the token in Admin → Brain settings), or directly from the admin panel. Any chat integration should be one Hermes supports out of the box; Telegram is the documented path.`,
    bodyRu: `Для повседневной работы отдельного встроенного чата нет: вы управляете Мозгом (Hermes) с телефона через Telegram-бот (создайте его у @BotFather, вставьте токен в Admin → настройки Brain) или прямо из панели администратора. Любая чат-интеграция должна быть из тех, что Hermes поддерживает «из коробки»; Telegram — задокументированный путь.`,
  },
  {
    id: 'emails-lifecycle',
    title: 'Emails you receive',
    titleRu: 'Письма, которые вы получаете',
    body: `At key moments Fractera emails you. (Your server reaches the Fractera service, which sends the mail — you never configure an email provider yourself.) Typical messages: installation started; installation progress; a recovery token (to re-engage via the MCP agent if anything breaks); your server is ready (with the links); domain activated (secure mode live); certificate-expiry warning; deploy failed (with recovery options); and subscription / sponsorship notices. Always use a real address you control.`,
    bodyRu: `В ключевые моменты Fractera присылает вам письма. (Ваш сервер обращается к сервису Fractera, который и отправляет письмо — вам не нужно настраивать почтового провайдера.) Типичные сообщения: установка началась; ход установки; recovery-токен (чтобы вернуться через MCP-агента, если что-то сломалось); сервер готов (со ссылками); домен активирован (защищённый режим включён); предупреждение об истечении сертификата; деплой не удался (с вариантами восстановления); уведомления о подписке / спонсорстве. Всегда указывайте реальный адрес, к которому у вас есть доступ.`,
  },
  {
    id: 'dashboard',
    title: 'Your dashboard',
    titleRu: 'Ваш личный кабинет',
    body: `You manage everything from your Fractera dashboard at fractera.ai/dashboard: your servers — each with direct links to its app and admin panel — and your subscription / sponsorship status. The links shown adapt to whether a server is on a bare IP (plain HTTP) or a real domain (HTTPS).`,
    bodyRu: `Вы управляете всем из личного кабинета Fractera на fractera.ai/dashboard: ваши серверы — у каждого прямые ссылки на приложение и панель администратора — и статус подписки / спонсорства. Показываемые ссылки зависят от того, на голом IP сервер (обычный HTTP) или на реальном домене (HTTPS).`,
  },
  {
    id: 'external-service',
    title: 'How Fractera (the service) connects to your server',
    titleRu: 'Как сервис Fractera взаимодействует с вашим сервером',
    body: `A clear split. The product runs on **your** server (open-source, all the layers above). An external Fractera service — operated by us — is what **provisions** it, **delivers** it and its updates, **sends** your emails, **powers** the dashboard and the MCP chat-deploy, and handles **billing / sponsorship**.

You interact only with the RESULTS of that service — the deploy, the dashboard, the emails, the MCP agent — and your code and data always stay on your server. (How that service is built internally is intentionally not part of this reference.)`,
    bodyRu: `Чёткое разделение. Продукт работает на **вашем** сервере (open-source, все слои выше). Внешний сервис Fractera — который мы эксплуатируем — это то, что его **провижинит**, **доставляет** его и обновления, **отправляет** ваши письма, **обеспечивает** работу кабинета и развёртывания через MCP-чат, а также занимается **биллингом / спонсорством**.

Вы взаимодействуете только с РЕЗУЛЬТАТАМИ этого сервиса — развёртывание, кабинет, письма, MCP-агент — а ваш код и данные всегда остаются на вашем сервере. (Как этот сервис устроен внутри — намеренно не часть этого справочника.)`,
  },
]

// ── Landing-derived sections ────────────────────────────────────────────────
// A faithful copy of the marketing landing content (hero benefits, presentation,
// problems, pricing, features, Company Brain, the full FAQ, …) so /mcp-info is a
// COMPLETE knowledge base = landing copy + the architecture sections above.
// Built ONCE at module load from the static `en`/`ru` locale objects (no
// per-request work) and memoized in LANDING below — the page is force-static, so
// this is baked into the prerendered HTML at build time.

function landingSectionsFor(c: SiteContent): { id: string; title: string; body: string }[] {
  const bullet = (lines: string[]) => lines.map((l) => `- ${l}`).join('\n')
  const out: { id: string; title: string; body: string }[] = []

  out.push({
    id: 'overview',
    title: c.heroTitle,
    body: `${c.description}\n\n${bullet(c.featureItems.map((f) => `**${f.title}** — ${f.text}`))}`,
  })

  out.push({
    id: 'capabilities',
    title: c.heroBenefitsHeader.h2,
    body: c.heroBenefits.map((b) => `**${b.title}**\n\n${b.text}`).join('\n\n'),
  })

  if (c.loopShowcase?.slides?.length) {
    out.push({
      id: 'onboarding',
      title: c.loopShowcase.h2,
      body: `${c.loopShowcase.description}\n\n${c.loopShowcase.slides
        .map((s, i) => `${i + 1}. **${s.title}** — ${s.description}`)
        .join('\n')}`,
    })
  }

  out.push({
    id: 'workspace',
    title: c.dpHeader.h2,
    body:
      `${c.dpHeader.description}\n\n` +
      `**${c.dpLeft.title}** — ${c.dpLeft.description}\n\n` +
      `**${c.dpRight.title}** — ${c.dpRight.description}\n\n` +
      `${c.platformsHeader.description}\n\n` +
      `${bullet(c.platformCards.map((p) => `**${p.title}** (${p.company}) — ${p.subtitle}`))}\n\n` +
      `${c.platformsHeader.disclaimer}`,
  })

  out.push({
    id: 'problems-solutions',
    title: c.problemHeader.h2,
    body:
      `${c.problemHeader.description}\n\n` +
      c.problemItems
        .map((p) => `**${p.title}**\n\n${c.problemLabel}: ${p.problem}\n\n${c.solutionLabel}: ${p.solution}`)
        .join('\n\n'),
  })

  out.push({
    id: 'pricing-and-providers',
    title: c.pricingHeader.h2,
    body:
      `${c.pricingHeader.description}\n\n` +
      `**${c.planLabels.freeForever}** — ${c.planLabels.freeInstall}.\n\n` +
      `${bullet(c.planLabels.freeFeatures)}\n\n` +
      `**${c.serverSection.h2}.** ${c.serverSection.description}\n` +
      `${bullet(c.serverSection.providers.map((p) => `${p.name} — ${p.tagline} (${p.price})`))}\n\n` +
      `**${c.domainProviderSection.h2}.** ${c.domainProviderSection.description}\n` +
      `${bullet(c.domainProviderSection.providers.map((p) => `${p.name} — ${p.tagline} (${p.price})`))}`,
  })

  out.push({
    id: 'features-list',
    title: c.featuresHeader.h2,
    body:
      `${c.featuresHeader.description}\n\n` +
      bullet(c.featureList.map((f) => `**${f.title}** (${f.badge}) — ${f.description}`)),
  })

  const cb = c.companyBrain
  out.push({
    id: 'company-brain-full',
    title: cb.h2,
    body:
      `${cb.subhead}\n\n${cb.intro}\n\n` +
      `**${cb.pillarsTitle}**\n\n` +
      cb.pillars.map((p) => `**${p.title}**\n\n${p.text}`).join('\n\n') +
      `\n\n**${cb.pricingLabel}.** ${cb.pricingBody}\n\n` +
      `**${cb.limitedLabel}.** ${cb.limitedBody}\n\n` +
      `**${cb.assuranceTitle}.** ${cb.assuranceBody}\n\n` +
      `**${cb.ctaTitle}.** ${cb.ctaBody} (${cb.ctaButton})`,
  })

  // The full FAQ — every question with its answer, bullets, steps and trailing notes.
  out.push({
    id: 'faq',
    title: 'Frequently asked questions',
    body: c.faqItems
      .map((item) => {
        const parts: string[] = [`**${item.q}**`, ...item.a]
        if (item.bullets?.length) parts.push(bullet(item.bullets))
        if (item.steps?.length) parts.push(item.steps.map((s, i) => `${i + 1}. ${s}`).join('\n'))
        if (item.trail?.length) parts.push(...item.trail)
        return parts.join('\n\n')
      })
      .join('\n\n---\n\n'),
  })

  return out
}

// Memoized once at module load (static — baked into the prerendered page).
const LANDING: Record<InfoLang, { id: string; title: string; body: string }[]> = {
  en: landingSectionsFor(en),
  ru: landingSectionsFor(ru),
}

export function getSectionList(lang: InfoLang = 'en'): { id: string; title: string }[] {
  const curated = SECTIONS.map((s) => ({ id: s.id, title: lang === 'ru' ? (s.titleRu ?? s.title) : s.title }))
  const landing = LANDING[lang].map((s) => ({ id: s.id, title: s.title }))
  return [...curated, ...landing]
}

export function getSection(id: string, lang: InfoLang = 'en'): { id: string; title: string; body: string } | null {
  const s = SECTIONS.find((x) => x.id === id)
  if (s) {
    return lang === 'ru'
      ? { id: s.id, title: s.titleRu ?? s.title, body: s.bodyRu ?? s.body }
      : { id: s.id, title: s.title, body: s.body }
  }
  const l = LANDING[lang].find((x) => x.id === id)
  return l ?? null
}
