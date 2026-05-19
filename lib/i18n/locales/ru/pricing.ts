import type { SiteContent } from '../../types'

type PricingPart = Pick<SiteContent, 'pricingHeader' | 'planLabels' | 'serverSection'>

export const pricing: PricingPart = {
  pricingHeader: {
    label: 'Начать',
    h2: 'Разверните приватную AI-инфраструктуру: выберите стек',
    description: 'Деплой в один клик с включённым сервером или установка на собственный VPS — оба варианта дают полную среду Fractera.',
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
    h2: 'Проверенные Ubuntu 24.04 VPS-провайдеры для AI',
    description: 'Fractera устанавливается на любой VPS с Ubuntu 24.04, 4 ядрами и 6 ГБ RAM. Эти провайдеры проверены сообществом — выбирайте по региону и бюджету.',
    providers: [
      { name: 'Contabo',      tagline: 'Максимум ресурсов по минимальной цене. Популярен для AI-нагрузок.',            url: 'https://contabo.com' },
      { name: 'Netcup',       tagline: 'Немецкое качество, щедрые конфигурации и честная цена.',                       url: 'https://www.netcup.com' },
      { name: 'Hetzner',      tagline: 'Лучшее соотношение цены и производительности в Европе. NVMe SSD.',             url: 'https://www.hetzner.com' },
      { name: 'DigitalOcean', tagline: 'Удобен для разработчиков. Простая настройка, глобальные дата-центры.',         url: 'https://www.digitalocean.com' },
    ],
  },
}
