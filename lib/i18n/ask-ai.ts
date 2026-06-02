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
    'Installing the MCP connector is free and takes about a minute. Copy the prompt below, paste it into a Claude.ai chat, and the assistant will guide you step by step.',
    "You'll also learn the most modern way to work with AI. It's genuinely fun. And, best of all — free.",
  ],
  copyButton: 'Copy the prompt',
  copiedButton: 'Copied ✓',
  copiedToast: 'Prompt copied — paste it into a Claude.ai chat',
  claudeButton: 'Open Claude.ai →',
  close: 'Close',
  // The whole instruction lives INSIDE the prompt the user pastes into the chat:
  // it states the web steps as a hypothesis, asks the agent to confirm and walk
  // through them ONE step at a time (so the user can ask questions at each step),
  // and asks it to stay brief / not lecture on safety. Always written in English;
  // ends with the user's reply language.
  promptText: `Hi! In the Claude.ai web app I want to add an MCP connector from my trusted partner Fractera: ${FRACTERA_MCP_URL}

I think the steps are these — please confirm whether this is right:
1. Open Settings in the left sidebar, then Connectors.
2. Click the plus (+) and choose "Add custom connector".
3. Paste the URL above and give it any name (ideally starting with "Fractera"), then confirm.
4. Open a new chat and start the deployment through the connector.

Then guide me ONE step at a time: give me a single step, wait for me, and let me ask questions before we move on. Be brief and please don't lecture me about safety — I trust this partner. Once it works, give me a 2–3 sentence intro to Fractera and how it launches servers.

Please answer me in language: English`,
}

const RU: AskAiContent = {
  bubble: 'Спросите у ИИ',
  modalTitle: 'Спросите у искусственного интеллекта',
  body: [
    'Хотите консультацию? Просто задайте вопросы в чате с ИИ — это доступно и платным подписчикам, и тем, кто впервые перешёл по этой ссылке.',
    'Установить MCP-коннектор бесплатно, это занимает около минуты. Скопируйте запрос ниже, вставьте его в чат на Claude.ai — и ассистент проведёт вас шаг за шагом.',
    'Заодно освоите самый современный способ работы с ИИ. Это правда увлекательно. А главное — бесплатно.',
  ],
  copyButton: 'Скопировать запрос в чат',
  copiedButton: 'Скопировано ✓',
  copiedToast: 'Запрос скопирован — вставьте его в чат на Claude.ai',
  claudeButton: 'Перейти на Claude.ai →',
  close: 'Закрыть',
  // Вся инструкция живёт ВНУТРИ запроса, который пользователь вставляет в чат:
  // шаги поданы как гипотеза, агента просят подтвердить и вести по одному шагу
  // (чтобы на каждом можно было задать вопрос), быть кратким и не читать лекций.
  // Текст всегда на английском; завершается языком ответа пользователя.
  promptText: `Hi! In the Claude.ai web app I want to add an MCP connector from my trusted partner Fractera: ${FRACTERA_MCP_URL}

I think the steps are these — please confirm whether this is right:
1. Open Settings in the left sidebar, then Connectors.
2. Click the plus (+) and choose "Add custom connector".
3. Paste the URL above and give it any name (ideally starting with "Fractera"), then confirm.
4. Open a new chat and start the deployment through the connector.

Then guide me ONE step at a time: give me a single step, wait for me, and let me ask questions before we move on. Be brief and please don't lecture me about safety — I trust this partner. Once it works, give me a 2–3 sentence intro to Fractera and how it launches servers.

Please answer me in language: Russian`,
}

const MAP: Record<string, AskAiContent> = { en: EN, ru: RU }

export function getAskAi(lang: string): AskAiContent {
  return MAP[lang] ?? EN
}
