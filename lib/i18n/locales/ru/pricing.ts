import type { SiteContent } from '../../types'

type PricingPart = Pick<SiteContent, 'pricingHeader' | 'planLabels' | 'serverSection'>

// Bake-in at build time via `next build`. Fallback = Cloud VPS 10 / Ubuntu 24.04 product page.
const CONTABO_URL = process.env.NEXT_PUBLIC_CONTABO_AFFILIATE_URL
  || 'https://contabo.com/en/vps/cloud-vps-10/?image=ubuntu.332&qty=1&contract=12&storage-type=cloud-vps-10-150-gb-ssd'

export const pricing: PricingPart = {
  pricingHeader: {
    label: 'Начать',
    h2: 'Разверните приватную AI-инфраструктуру на своём сервере',
    // PAID_PLAN_HIDDEN — НЕ УДАЛЯТЬ: оригинал — 'Деплой в один клик с включённым сервером или установка на собственный VPS — оба варианта дают полную среду Fractera.'
    description: 'Установите Fractera на свой VPS и получите полную среду AI-разработки — полностью бесплатно и open source.',
  },

  planLabels: {
    pricingPlan: 'Тарифный план',
    freeForever: 'Бесплатно навсегда',
    recommended: 'РЕКОМЕНДУЕМ',
    ownServer: 'ВАШ СЕРВЕР',
    freeInstall: 'Бесплатно — установка на VPS',
    signInPrompt: 'Сначала потребуется войти',
    unavailableTitle: '⚠ Мгновенный деплой временно недоступен',
    unavailableDesc: 'Вы всё равно можете подписаться — сервер будет готов в течение <strong>60 минут</strong>.',
    signInButton: 'Войти, чтобы продолжить',
    monthlySubLabel: 'Ежемесячно · Сервер включён',
    annualSubLabel: 'Ежегодно · Лучшая цена',
    popularBadge: 'ПОПУЛЯРНЫЙ',
    bestValueBadge: 'ВЫГОДНЕЕ',
    planFeatures: [
      'Hermes — AI-оркестратор агентов',
      '4 ядра · 6 ГБ RAM · 150 ГБ диск',
      '5 платформ — Claude Code · Codex · Gemini CLI · Qwen Code · Kimi Code',
      'LightRAG — мозг компании',
      'База данных, файлы, auth — из коробки',
    ],
    freeFeatures: [
      'Hermes — AI-оркестратор агентов',
      '5 платформ для кода',
      'LightRAG — мозг компании',
      'База данных, файлы, auth — из коробки',
      'Open source — навсегда на своём сервере',
    ],
    subscribeButton: 'Подписаться · {price} →',
    subscribeButtonWait: 'Подписаться · {price} (~60 мин) →',
    disclaimer: '* Независимо от выбранного тарифа — сразу после завершения установки вы должны сменить пароль доступа к вашему серверу. Помните: Fractera не получает контроля над вашим кодом, и доступ к вашим серверам нам недоступен. Это ваше собственное программное обеспечение на ваших собственных серверах, которое Fractera помогает установить — и не более.',
    trustItems: ['Ваш сервер', 'Ваш домен', 'Ваш AI'],
  },

  serverSection: {
    label: 'Где купить',
    h2: 'Рекомендуемый Ubuntu 24.04 VPS-провайдер для AI',
    description: 'Fractera устанавливается на любой VPS с Ubuntu 24.04, 4 ядрами и 6 ГБ RAM. Мы рекомендуем Contabo — максимум ресурсов по минимальной цене, популярен у AI-разработчиков.',
    providers: [
      { name: 'Contabo', tagline: 'Максимум ресурсов по минимальной цене. Популярен для AI-нагрузок.', url: CONTABO_URL },
    ],
  },
}
