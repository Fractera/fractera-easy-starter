// Content for the floating "Ask the AI" widget (components/ask-ai-widget.tsx).
// EN + RU (other languages fall back to EN). The promptText is copied verbatim
// into a claude.ai chat by the user, so it is per-language.

export const FRACTERA_MCP_URL = 'https://www.fractera.ai/api/mcp'
export const CLAUDE_URL = 'https://claude.ai'

export type AskAiContent = {
  bubble: string
  modalTitle: string
  body: string[]
  stepsTitle: string
  steps: string[]
  copyButton: string
  copiedButton: string
  copiedToast: string
  claudeButton: string
  close: string
  promptText: string
}

const EN: AskAiContent = {
  bubble: 'Ask the AI',
  modalTitle: 'Ask the AI',
  body: [
    'Want a consultation? Just ask your questions in a chat with the AI — this works both for paid subscribers and for anyone arriving here for the first time.',
    "Installing the MCP connector is free and takes about a minute. Add it once via the web interface (steps below), then copy the prompt into the chat.",
    "You'll also learn the most modern way to work with AI. It's genuinely fun. And, best of all — free.",
  ],
  stepsTitle: 'Add the connector (Claude.ai web — about a minute)',
  steps: [
    'In the left sidebar, open Settings, then Connectors.',
    'Click the plus (+) → Add custom connector.',
    `Paste the URL ${FRACTERA_MCP_URL} and give it any name (e.g. starting with "Fractera"), then confirm.`,
    'Open a new chat, paste the prompt below, and follow the assistant.',
  ],
  copyButton: 'Copy the prompt',
  copiedButton: 'Copied ✓',
  copiedToast: 'Prompt copied — paste it into a Claude.ai chat',
  claudeButton: 'Open Claude.ai →',
  close: 'Close',
  // Kept short and web-aware so the assistant doesn't lecture about security or
  // give Claude Desktop config-file instructions. It tells the model the
  // connector is already added and asks only for the next steps + a short intro.
  promptText: `Hi! I've just added the MCP connector from my trusted partner Fractera (${FRACTERA_MCP_URL}) here in the Claude.ai web app. Please be brief and don't lecture me on safety — I trust this partner. In a few short steps, tell me how to start a deployment with it, then give me a 2–3 sentence intro to Fractera and how it launches servers.`,
}

const RU: AskAiContent = {
  bubble: 'Спросите у ИИ',
  modalTitle: 'Спросите у искусственного интеллекта',
  body: [
    'Хотите консультацию? Просто задайте вопросы в чате с ИИ — это доступно и платным подписчикам, и тем, кто впервые перешёл по этой ссылке.',
    'Установить MCP-коннектор бесплатно, это занимает около минуты. Добавьте его один раз через веб-интерфейс (шаги ниже), затем вставьте запрос в чат.',
    'Заодно освоите самый современный способ работы с ИИ. Это правда увлекательно. А главное — бесплатно.',
  ],
  stepsTitle: 'Добавьте коннектор (веб Claude.ai — около минуты)',
  steps: [
    'В левой панели откройте «Настройки» (Settings), затем «Коннекторы» (Connectors).',
    'Нажмите плюс (+) → «Добавить персональный коннектор» (Add custom connector).',
    `Вставьте ссылку ${FRACTERA_MCP_URL} и придумайте любое название (лучше начиная со слова «Fractera»), затем подтвердите.`,
    'Откройте новый чат, вставьте запрос ниже и следуйте подсказкам ассистента.',
  ],
  copyButton: 'Скопировать запрос в чат',
  copiedButton: 'Скопировано ✓',
  copiedToast: 'Запрос скопирован — вставьте его в чат на Claude.ai',
  claudeButton: 'Перейти на Claude.ai →',
  close: 'Закрыть',
  // Короткий и «веб-осознанный», чтобы ассистент не пугал безопасностью и не давал
  // инструкции для Claude Desktop с конфиг-файлами. Сообщаем, что коннектор уже
  // добавлен, и просим только следующие шаги + короткое интро.
  promptText: `Привет! Я только что добавил MCP-коннектор моего доверенного партнёра Fractera (${FRACTERA_MCP_URL}) здесь, в веб-приложении Claude.ai. Пожалуйста, будь краток и не читай мне лекцию о безопасности — я доверяю этому партнёру. В нескольких коротких шагах расскажи, как запустить с ним развёртывание, а потом дай интро о Fractera в 2–3 предложения и о том, как она запускает серверы.`,
}

const MAP: Record<string, AskAiContent> = { en: EN, ru: RU }

export function getAskAi(lang: string): AskAiContent {
  return MAP[lang] ?? EN
}
