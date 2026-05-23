import type { LightContent } from '../../types'

export const light: LightContent = {
  hero: {
    h1: 'Self-hosted backend на VPS — ваш приватный Vercel + Supabase + Clerk + S3',
    description: 'Уходи с Vercel — заблокирован в РФ. Разверни собственный backend (авторизация, БД, хранилище, домен, HTTPS) на своём VPS за 10 минут. Open source, без AI, без слежки, доступен в РФ без VPN.',
    ctaPrimary: 'Развернуть за 10 минут',
    ctaSecondary: 'Как это работает',
  },

  benefitsHeader: {
    h2: 'Brand-ready backend на собственном сервере',
    description: 'Всё, что нужно для запуска приватного SaaS — преднастроено, brand-ready, на вашем VPS.',
  },

  benefits: [
    { h3: 'Преднастроенная авторизация: Google OAuth + Email magic link', text: 'NextAuth с Google + magic link из коробки. Аналог Clerk на собственном сервере, без внешних зависимостей.' },
    { h3: 'База данных SQLite / Postgres — без сторонних сервисов', text: 'Локальная SQLite (WAL) или Postgres на том же VPS. Без Neon, без Supabase, без оплаты за строки.' },
    { h3: 'Файловое хранилище на вашем VPS — без счетов за S3', text: 'Локальный диск + media-прокси. Ноль egress fees, ноль наценки AWS S3.' },
    { h3: 'Свой домен + автоматический HTTPS за минуты', text: 'Nginx + Let’s Encrypt преднастроены. Совместимо с Cloudflare, никаких ручных SSL.' },
    { h3: 'Готовая landing-страница «из коробки» — редактируйте под свой бренд', text: 'Один клик ребрендинг. Редактируемая Next.js страница, без шаблонной настройки, ship за час.' },
    { h3: 'Без AI, без телеметрии, без vendor lock-in', text: 'Open source. Нет агентов, нет LLM-трекинга, нет Mixpanel. Ваш код, ваши данные, ваш сервер.' },
  ],

  problem: {
    h2: 'Скрытые проблемы managed backend-платформ в РФ',
    description: 'Доступ без VPN, предсказуемые счета, полный контроль. Вот от чего вы уходите.',
    items: [
      { h3: 'Блокировки Роскомнадзора: Vercel и Netlify недоступны в РФ', text: 'РКН досудебно заблокировал vercel.app домены ещё в декабре 2023. Без VPN сайт не открывается. Свой сервер ≠ Vercel — никаких блокировок.' },
      { h3: 'Оплата зарубежных карт: невозможна с 2022 года', text: 'Санкции и отказы платёжных систем — прямые транзакции из РФ часто отклоняются, а сохранённые подписки перестают работать без предупреждения.' },
      { h3: 'Vendor lock-in: миграция с Amvera / ONREZA — это недели работы', text: 'Managed РФ-PaaS — это та же зависимость, только от другой компании. Self-hosted = миграция между провайдерами VPS за час.' },
      { h3: '152-ФЗ compliance: managed РФ-PaaS — это та же зависимость, только от ONREZA', text: 'Свой VPS в РФ = 152-ФЗ соблюдение по умолчанию. Полная гибкость выбора региона (Москва, Питер, любой регион).' },
    ],
  },

  howItWorks: {
    h2: 'От пустого VPS до production backend за 10 минут',
    description: 'Одна команда. Один VPS. Живой HTTPS за минуты.',
    steps: [
      { title: 'Возьмите любой Ubuntu 24.04 VPS', text: '$5–10/мес у Timeweb, Selectel, Beget, RuVDS (РФ) или Hetzner, Contabo (ЕС) — на ваш выбор.' },
      { title: 'Запустите bootstrap-light.sh', text: 'Одна команда. Мы настраиваем Nginx, SSL, базу данных, авторизацию, хранилище, дефолтную landing.' },
      { title: 'Привяжите домен', text: 'Добавьте DNS-запись. HTTPS автоматически через Let’s Encrypt.' },
      { title: 'Запускайте продукт', text: 'Редактируйте дефолтную landing или стройте свой SaaS поверх auth/БД/хранилища, которыми теперь владеете.' },
    ],
  },

  pricing: {
    h2: 'Self-hosted backend: бесплатно навсегда, open source',
    description: 'Платите только за VPS. Без per-seat fees, без сюрпризов по трафику, без vendor lock-in.',
    cardTitle: 'Fractera Light — бесплатный open-source backend-стек',
    cardSub: 'Self-hosted на вашем VPS, бесплатно навсегда.',
    features: [
      'Авторизация (Google OAuth + Email magic link)',
      'База данных (SQLite WAL или Postgres)',
      'Файловое хранилище на вашем VPS',
      'Свой домен + автоматический HTTPS',
      'Редактируемая landing-страница',
      'Open source — GPL/MIT, без vendor lock-in',
    ],
    cta: 'Начать — бесплатно',
  },

  vpsProviders: {
    h3: 'Проверенные Ubuntu 24.04 VPS-провайдеры (РФ + Европа)',
    description: 'Любой Ubuntu 24.04 VPS с 2+ ядрами и 2+ ГБ RAM подойдёт. Рекомендуемые бюджетные варианты ниже.',
  },

  comparison: {
    h2: 'Fractera Light vs Amvera vs ONREZA vs RelaxDev vs Vercel',
    description: 'Чем Fractera Light отличается от managed РФ-PaaS и зарубежных облаков.',
    note: 'Детальная сравнительная таблица — в следующей итерации (шаг 66).',
  },

  faq: {
    h2: 'Часто задаваемые вопросы о Fractera Light',
    items: [
      { q: 'Работает ли Fractera Light в РФ? Зависит ли от блокировок Роскомнадзора?', a: 'Да, полностью доступна. Fractera Light = ваш собственный сервер, не Vercel/Netlify. От блокировок РКН не зависит — vercel.app домены заблокированы, ваш домен — нет.' },
      { q: 'Чем Fractera Light отличается от Amvera / ONREZA / RelaxDev?', a: 'Amvera, ONREZA и RelaxDev — managed-only платформы. Вы зависите от их инфраструктуры. Fractera Light — open-source, self-hosted на вашем VPS любого провайдера. Без vendor lock-in.' },
      { q: 'Соответствует ли 152-ФЗ?', a: 'Да, при размещении на VPS в РФ — 152-ФЗ соблюдение по умолчанию. Полная гибкость выбора региона. Не привязаны к одному провайдеру РФ-PaaS.' },
      { q: 'Почему «без AI» — это фича?', a: 'Managed AI backends несут с собой телеметрию, LLM-трекинг и непредсказуемые расходы. Fractera Light — для команд, которым нужна предсказуемость и простота. AI всегда можно добавить сверху — он просто не идёт в комплекте.' },
    ],
  },

  ctaFooter: {
    h2: 'Уходи с Vercel за 10 минут — бесплатно навсегда, open-source',
    description: 'Покинь Vercel. Покинь Supabase. Владей своим backend. Разверни сейчас.',
    cta: 'Развернуть Fractera Light',
  },
}
