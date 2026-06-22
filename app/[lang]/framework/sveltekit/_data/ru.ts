import type { FrameworkOverride } from '../../_lib/post'

// Russian override for /framework/sveltekit. Co-located content (не из глобальной
// локали). Обязательный root-анкор «Agentic Engineering Infrastructure» (термин не
// переводится) → /ru вплетён в лид.
export const ru: FrameworkOverride = {
  title: 'Архитектура SvelteKit для высокопроизводительных агентных бэкендов',
  seoTitle: 'SvelteKit инженерия агентов: self-hosted шаблон SvelteKit на вашем VPS',
  subtitle:
    'Разверните приложение SvelteKit на своём VPS за десять минут — высокопроизводительный Node-бэкенд с приватной базой данных, встроенной авторизацией и объектным хранилищем, под управлением ИИ-агентов через MCP.',
  description:
    'Self-hosted шаблон SvelteKit на инфраструктуре инженерии агентов Fractera: бэкенд SvelteKit как альтернатива облаку, приватная база данных SvelteKit и встроенная авторизация — без облачных аккаунтов, агенты под оркестрацией Hermes.',
  keywords:
    'sveltekit инженерия агентов, sveltekit self hosted boilerplate, sveltekit альтернатива облаку, приватная база данных sveltekit, sveltekit ssr node, инфраструктура инженерии агентов',
  listTitle: 'SvelteKit',
  listDescription:
    'Оптимизированный под агентов шаблон SvelteKit на инфраструктуре Fractera — Node SSR бэкенд, приватная база, авторизация и медиа встроены.',
  founderQuote:
    'Если вы вынуждены использовать много каналов, потому что ни один из них не даёт нужного для окупаемости количества клиентов, то это повод задуматься — а есть ли реальная потребность в вашем продукте?',
  blocks: [
    {
      kind: 'callout',
      title: 'SvelteKit как высокопроизводительный self-hosted бэкенд',
      text:
        'Вы разворачиваете приложение SvelteKit, которое поднимается как долгоживущий Node-процесс под PM2 — серверные эндпоинты, form actions и SSR работают на вашем VPS. За ним — приватная база данных, встроенная авторизация и объектное хранилище. Лёгкая сборка SvelteKit делает его быстрым бэкендом с малыми накладными расходами для агентных нагрузок.',
    },
    {
      kind: 'p',
      text:
        'SvelteKit — полноправный гражданин Fractera [Agentic Engineering Infrastructure](/ru). Стартер ложится на ваш VPS в один клик и работает как Node-процесс за обратным прокси, отдаётся по HTTP на вашем IP — или по HTTPS, как только вы привяжете домен. Ваш код и данные остаются на вашем сервере.',
    },

    { kind: 'h2', text: 'Бэкенд SvelteKit как альтернатива облаку' },
    {
      kind: 'p',
      text:
        'Self-hosting SvelteKit означает, что ваши серверные эндпоинты общаются с бэкендом, которым владеете вы: приватная база SvelteKit (SQLite WAL / Postgres), open-source авторизация (Google OAuth, magic-link) и объектное хранилище — без Clerk, без Supabase и без оплаты за каждый запрос. Fractera разворачивает рантайм, базу и обратный прокси автоматически.',
    },

    { kind: 'h2', text: 'Как это строит ИИ' },
    {
      kind: 'p',
      text:
        'Hermes оркеструет пять консольных агентов кода (Claude Code, Codex, Gemini CLI, Qwen Code, Kimi Code) по протоколу Model Context Protocol, а LightRAG держит контекст проекта в общем графе памяти. Агенты вспоминают ровно нужное вместо перечитывания всей кодовой базы — полная картина в [архитектуре системы](/ru/documentation/multi-agent-workspace-architecture).',
    },
  ],
  faq: [
    {
      q: 'Как SvelteKit работает на Fractera?',
      a: 'Как долгоживущий Node-процесс под PM2 (SSR + серверные эндпоинты + form actions), за обратным прокси Nginx. Сначала поднимается на вашем IP по HTTP; привяжете домен позже — HTTPS выпустится автоматически.',
    },
    {
      q: 'Где работают авторизация и база данных?',
      a: 'На вашем сервере. Стартер несёт open-source авторизацию (Google OAuth, magic-link) и приватную базу SvelteKit (SQLite WAL / Postgres) — бэкенд как альтернатива облаку, без Clerk, без Supabase, без оплаты за каждый запрос.',
    },
    {
      q: 'Как ИИ-агенты не жгут токены?',
      a: 'Они комбинируют готовые неизменяемые паттерны вместо повторной генерации boilerplate и вспоминают контекст из общей памяти LightRAG, а не перечитывают весь проект в каждой сессии.',
    },
  ],
}
