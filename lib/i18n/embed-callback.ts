import type { DeepPartial } from '@/lib/utils/deep-merge'
import { deepMerge } from '@/lib/utils/deep-merge'

// Standalone copy for the embed activation-complete page. It renders outside the
// main ContentProvider shell, so it carries its own tiny locale map + getter —
// but follows the same per-key EN-fallback contract as the rest of the i18n shell
// (a new language can ship a single field and inherit the rest from `en`).
export type EmbedCallbackContent = {
  title: string
  body: string
  hint: string
}

const en: EmbedCallbackContent = {
  title: 'Activation complete',
  body: 'Your Fractera account is active. Go back to the tab where the widget is loaded — it will update automatically within a few seconds.',
  hint: 'You can close this window.',
}

const ru: DeepPartial<EmbedCallbackContent> = {
  title: 'Активация завершена',
  body: 'Ваш Fractera-аккаунт активирован. Вернитесь во вкладку с виджетом — он обновится автоматически в течение нескольких секунд.',
  hint: 'Это окно можно закрыть.',
}

const CONTENT: Record<string, DeepPartial<EmbedCallbackContent>> = { en, ru }

export function getEmbedCallback(lang: string): EmbedCallbackContent {
  return deepMerge<EmbedCallbackContent>(en, CONTENT[lang])
}
