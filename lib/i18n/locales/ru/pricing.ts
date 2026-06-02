import type { SiteContent } from '../../types'

type PricingPart = Pick<SiteContent, 'pricingHeader' | 'planLabels' | 'serverSection' | 'domainProviderSection'>

// Bake-in at build time via `next build`. RU-локаль — российские провайдеры
// (суверенный продакшн-периметр): VPS Timeweb Cloud + регистратор reg.ru.
const TIMEWEB_URL = process.env.NEXT_PUBLIC_TIMEWEB_AFFILIATE_URL
  || 'https://timeweb.cloud/services/vds-vps'

const REGRU_URL = process.env.NEXT_PUBLIC_REGRU_AFFILIATE_URL
  || 'https://www.reg.ru/domain/new/'

export const pricing: PricingPart = {
  pricingHeader: {
    label: 'Начать',
    h2: 'Разверните частную AI-инфраструктуру на российском VPS',
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
    label: 'Где купить сервер',
    h2: 'Рекомендуемый российский VPS-провайдер',
    description: 'Fractera устанавливается на любой VPS с Ubuntu 24.04, 4 ядрами и 6 ГБ RAM. Для российского контура рекомендуем Timeweb Cloud — сервер и данные остаются на территории РФ, что важно для соответствия 152-ФЗ.',
    providers: [
      { name: 'Timeweb Cloud', tagline: 'Российский VPS на Ubuntu 24.04. Сервер и данные — на территории РФ.', url: TIMEWEB_URL, price: 'от 1 782 ₽/мес' },
    ],
  },

  domainProviderSection: {
    label: 'Где купить домен',
    h2: 'Рекомендуемый российский регистратор доменов',
    description: 'Домен даёт серверу HTTPS, красивый адрес и снимает предупреждения браузера. Для российского контура рекомендуем reg.ru — домены .ru у российского регистратора и прямое управление DNS.',
    providers: [
      { name: 'reg.ru', tagline: 'Российский регистратор: домены .ru, прямое управление DNS.', url: REGRU_URL, price: 'от 169 ₽/год' },
    ],
  },
}
