// Localized UI chrome for the Deployments hub (the /deployments index + the
// breadcrumb label reused by its child pages). Per rule 4а these wrapper labels
// are localized here, never hardcoded inline. Minimum en + ru; add a language by
// adding an entry. The child pages' own H1/SEO copy is localized separately in
// their per-document content modules (e.g. lib/pages/deployments-local).

export type DeploymentOption = {
  href: string
  title: string
  description: string
  // Only live targets are clickable; the rest render as a non-link "soon" row
  // until their page ships in a later sub-step.
  ready?: boolean
}

export type DeploymentsUi = {
  metaTitle: string
  metaDescription: string
  eyebrow: string
  indexTitle: string
  indexIntro: string
  breadcrumb: string
  backToHub: string
  soon: string
  options: DeploymentOption[]
}

const UI: Record<string, DeploymentsUi> = {
  en: {
    metaTitle: 'Deployment Options | Fractera',
    metaDescription:
      'Where to run your Fractera agent engineering infrastructure: a production VPS, a one-command deploy through Claude Code MCP, a private Apple Silicon appliance on your desk, or the Next.js aircraft-carrier starter.',
    eyebrow: 'Fractera deployments',
    indexTitle: 'Agent Deployment Options',
    indexIntro:
      'One agent engineering infrastructure, several places to run it. Pick the target that fits your data, your budget and your control needs — every option comes up the same way, fully owned by you.',
    breadcrumb: 'Deployments',
    backToHub: 'Back to all deployment options',
    soon: 'Coming soon',
    options: [
      {
        href: '/deployments/vps',
        title: 'Production VPS',
        description:
          'Deploy the full stack to an Ubuntu VPS in about ten minutes — production-grade agent environments on hardware you rent for a few dollars a month.',
      },
      {
        href: '/deployments/mcp',
        title: 'Claude Code MCP',
        description:
          'Stand up and orchestrate the whole infrastructure straight from Claude Code over the Model Context Protocol — zero server management.',
      },
      {
        href: '/deployments/local',
        title: 'Local Apple Silicon appliance',
        description:
          'Run a private edge appliance on a Mac mini or Mac Studio in your own office — LightRAG memory and a model team on premises, nothing leaving the building.',
        ready: true,
      },
      {
        href: '/deployments/fractera-pro',
        title: 'Fractera Pro starter',
        description:
          'The Next.js aircraft carrier: a 50k-line, parallel-routing starter with auth, database, media and routing already engineered so agents skip the boilerplate.',
      },
    ],
  },
  ru: {
    metaTitle: 'Варианты развёртывания | Fractera',
    metaDescription:
      'Где запустить вашу агентную инженерную инфраструктуру Fractera: продакшен-VPS, развёртывание одной командой через Claude Code MCP, приватное устройство Apple Silicon на столе или Next.js-стартер «авианосец».',
    eyebrow: 'Развёртывания Fractera',
    indexTitle: 'Варианты развёртывания агентов',
    indexIntro:
      'Одна агентная инженерная инфраструктура — несколько мест для запуска. Выбирайте цель под ваши данные, бюджет и требования к контролю: каждый вариант поднимается одинаково и остаётся полностью в вашей собственности.',
    breadcrumb: 'Развёртывания',
    backToHub: 'Ко всем вариантам развёртывания',
    soon: 'Скоро',
    options: [
      {
        href: '/deployments/vps',
        title: 'Продакшен-VPS',
        description:
          'Разверните весь стек на Ubuntu-VPS примерно за десять минут — продакшен-окружения для агентов на железе за несколько долларов в месяц.',
      },
      {
        href: '/deployments/mcp',
        title: 'Claude Code MCP',
        description:
          'Поднимите и оркеструйте всю инфраструктуру прямо из Claude Code по Model Context Protocol — без управления сервером.',
      },
      {
        href: '/deployments/local',
        title: 'Локальное устройство Apple Silicon',
        description:
          'Запустите приватное edge-устройство на Mac mini или Mac Studio в своём офисе — память LightRAG и команда моделей на месте, ничего не покидает офис.',
        ready: true,
      },
      {
        href: '/deployments/fractera-pro',
        title: 'Стартер Fractera Pro',
        description:
          'Next.js-«авианосец»: стартер на 50k строк с параллельной маршрутизацией, где auth, база данных, медиа и роутинг уже спроектированы, чтобы агенты пропускали boilerplate.',
      },
    ],
  },
}

export function getDeploymentsUi(lang: string): DeploymentsUi {
  return UI[lang] ?? UI.en
}
