// Content for the floating "Ask the AI" widget (components/ask-ai-widget.tsx).
// EN + RU (other languages fall back to EN). The promptText is copied verbatim
// into a claude.ai chat by the user, so it is per-language.

export const FRACTERA_MCP_URL = 'https://www.fractera.ai/api/mcp'
export const CLAUDE_URL = 'https://claude.ai'

export type AskAiContent = {
  bubble: string
  modalTitle: string
  body: string[]
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
    "Installing the MCP connector is free. Copy the prompt below, paste it into the chat and follow the instructions — it takes no more than a minute.",
    "You'll also learn the most modern way to work with AI. It's genuinely fun. And, best of all — free.",
  ],
  copyButton: 'Copy the prompt',
  copiedButton: 'Copied ✓',
  copiedToast: 'Prompt copied — paste it into the chat on Claude.ai',
  claudeButton: 'Open Claude.ai →',
  close: 'Close',
  promptText: `Hi! I want to install an MCP server from my trusted partner Fractera. Here is its URL: ${FRACTERA_MCP_URL}

Walk me through exactly what I need to do to get it working, and then tell me about Fractera and how it launches servers.`,
}

const RU: AskAiContent = {
  bubble: 'Спросите у ИИ',
  modalTitle: 'Спросите у искусственного интеллекта',
  body: [
    'Хотите консультацию? Просто задайте вопросы в чате с ИИ — это доступно и платным подписчикам, и тем, кто впервые перешёл по этой ссылке.',
    'Установить MCP-коннектор бесплатно. Скопируйте запрос ниже, вставьте его в чат и следуйте инструкции — это займёт не больше минуты.',
    'Заодно освоите самый современный способ работы с ИИ. Это правда увлекательно. А главное — бесплатно.',
  ],
  copyButton: 'Скопировать запрос в чат',
  copiedButton: 'Скопировано ✓',
  copiedToast: 'Запрос скопирован — вставьте его в чат на Claude.ai',
  claudeButton: 'Перейти на Claude.ai →',
  close: 'Закрыть',
  promptText: `Привет! Я хочу установить MCP-сервер от моего доверенного партнёра Fractera. Вот его URL: ${FRACTERA_MCP_URL}

Расскажи, как мне действовать, чтобы всё заработало, а потом расскажи о компании Fractera и о том, как она запускает серверы.`,
}

const MAP: Record<string, AskAiContent> = { en: EN, ru: RU }

export function getAskAi(lang: string): AskAiContent {
  return MAP[lang] ?? EN
}
