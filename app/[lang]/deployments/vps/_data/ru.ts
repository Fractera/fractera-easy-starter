import type { DeploymentBase } from '../../_lib/post'

// Base Russian document for /[lang]/deployments/vps (Production VPS target).
// IP-first reality: the deploy comes up on plain HTTP at http://<ip>:3002 — never
// promise HTTPS/a domain as the result of the deploy (that is an optional later step).
export const ru: DeploymentBase = {
  title: 'Выделенный сервер VPS: автоматическая инженерия агентов',
  seoTitle: 'Развертывание ИИ агентов на VPS: готовый стек на Ubuntu',
  subtitle:
    'Разверните готовую мультиагентную среду разработки на собственном Ubuntu VPS за 10 минут. Запустите команду моделей под управлением оркестратора Hermes и приватную память LightRAG на изолированном сервере с фиксированной оплатой.',
  description:
    'Хватит переплачивать за зарубежные SaaS-подписки. Инициализируйте промышленную инфраструктуру инженерии агентов на чистом сервере Ubuntu. Развертывание IP-first: ваш интерфейс доступен по протоколу HTTP на http://<ip>:3002 за 10 минут.',
  keywords:
    'agent engineering vps, production ready agent stack ubuntu, agent server setup contabo, ии сервер на vps, развернуть нейросеть локально 152 фз, сервер искусственного интеллекта, локальный искусственный интеллект для компании',
  listTitle: 'Выделенный сервер VPS',
  listDescription:
    'Разверните полный стек на Ubuntu VPS за десять минут — изолированная среда размещения агентов промышленного класса на оборудовании с фиксированной стоимостью.',
  blocks: [],
  faq: [],
}