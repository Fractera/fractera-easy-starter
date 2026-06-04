// Content for the floating "Ask the AI" widget (components/ask-ai-widget.tsx).
// One tap opens Google Search "AI Mode" pre-filled with "Fractera ai", where the
// AI already has up-to-date info about Fractera and answers the user's questions
// directly — no setup, no copy/paste. EN + RU (others fall back to EN); strings
// via i18n (rule 4а).

// Google Search "AI Mode" deep link (udm=50) with our brand query pre-filled.
// Verified to open AI Mode; the AI answers in the user's Google locale. Space is
// sent as '+' (valid in a query string).
export const GOOGLE_AI_URL = 'https://www.google.com/search?q=Fractera+ai&udm=50'

export type AskAiContent = {
  bubble: string
}

const EN: AskAiContent = { bubble: 'Ask the AI' }
const RU: AskAiContent = { bubble: 'Спросите у ИИ' }

const MAP: Record<string, AskAiContent> = { en: EN, ru: RU }

export function getAskAi(lang: string): AskAiContent {
  return MAP[lang] ?? EN
}
