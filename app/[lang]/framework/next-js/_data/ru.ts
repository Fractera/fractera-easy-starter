import type { FrameworkOverride } from '../../_lib/post'

// Russian override for /[lang]/framework/next-js. SCAFFOLDING ONLY — partial
// override on top of the English base (blocks stay empty; the content/SEO pass is a
// separate sub-step). The founder quote is the placeholder dictated by the architect.
export const ru: FrameworkOverride = {
  title: 'Среда Next.js для корпоративной инженерии агентов',
  subtitle:
    'Стартер Next.js, оптимизированный под агентов. Контент и оптимизация — в отдельном под-шаге.',
  description:
    'Готовый под агентов стартер Next.js на инфраструктуре инженерии агентов Fractera: авторизация, база данных, медиа и маршрутизация подключены заранее.',
  keywords:
    'nextjs инженерия агентов, self hosted nextjs starter, приватная база данных nextjs, nextjs mcp агент',
  listTitle: 'Next.js',
  listDescription: 'Оптимизированный под агентов стартер Next.js на инфраструктуре Fractera.',
  founderQuote:
    'Быть увлечённым настолько, чтобы никто не мог догадаться — сумасшедший ты или гений.',
}
