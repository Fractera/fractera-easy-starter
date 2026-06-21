// Localized UI chrome for the Deployments hub (the /deployments index header +
// the breadcrumb/back labels reused by its child pages). Per rule 4а these wrapper
// labels are localized here, never hardcoded inline. Minimum en + ru; add a
// language by adding an entry.
//
// The hub's target LIST is NOT here — it is auto-generated from the co-located
// target folders (lib/parser-fs → _list.generated.ts) and localized per target in
// its own ./_data via lib/deployments/post. Adding/removing a target folder
// adds/removes its hub row automatically; nothing to edit here.

export type DeploymentsUi = {
  metaTitle: string
  metaDescription: string
  eyebrow: string
  indexTitle: string
  indexIntro: string
  breadcrumb: string
  backToHub: string
}

const UI: Record<string, DeploymentsUi> = {
  en: {
    metaTitle: 'Deployment Options | Fractera',
    metaDescription:
      'Where to run your Fractera Agentic Engineering Infrastructure: a production VPS, a one-command deploy through Claude Code MCP, or a private Apple Silicon appliance on your desk.',
    eyebrow: 'Fractera deployments',
    indexTitle: 'Agent Deployment Options',
    indexIntro:
      'One agentic engineering infrastructure, several places to run it. Pick the target that fits your data, your budget and your control needs — every option comes up the same way, fully owned by you.',
    breadcrumb: 'Deployments',
    backToHub: 'Back to all deployment options',
  },
  ru: {
    metaTitle: 'Варианты развёртывания | Fractera',
    metaDescription:
      'Где запустить вашу агентную инженерную инфраструктуру Fractera: продакшен-VPS, развёртывание одной командой через Claude Code MCP или приватное устройство Apple Silicon на столе.',
    eyebrow: 'Развёртывания Fractera',
    indexTitle: 'Варианты развёртывания агентов',
    indexIntro:
      'Одна агентная инженерная инфраструктура — несколько мест для запуска. Выбирайте цель под ваши данные, бюджет и требования к контролю: каждый вариант поднимается одинаково и остаётся полностью в вашей собственности.',
    breadcrumb: 'Развёртывания',
    backToHub: 'Ко всем вариантам развёртывания',
  },
}

export function getDeploymentsUi(lang: string): DeploymentsUi {
  return UI[lang] ?? UI.en
}
