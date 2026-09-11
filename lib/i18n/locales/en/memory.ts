import type { MemoryPageContent } from '../../types'

// Страница «Память» — английская ветка словаря, полная база.
//
// Контент перенесён с корневой страницы службы памяти (memory.aifa.dev) по
// прямой просьбе владельца 2026-09-11. Переносится СОДЕРЖАНИЕ; структура,
// компоненты и токены дизайна той службы сюда не едут — у витрины свои.
export const memory: MemoryPageContent = {
  hero: {
    eyebrow: 'Fractera Memory Starter',
    title: 'The deterministic, multimodal, self-evolving memory engine for autonomous AI agents',
    lead:
      "An autonomous, self-hosted long-term memory engine and the cognitive core for AI agents. Built to work as the architect's personal command centre through Telegram and a unified REST API, it closes the gap between a volatile context window and real cognitive continuity.",
    body:
      'The engine ingests raw, unstructured real-world input — text, images, voice notes, whole PDF documents, video, precise spatial-temporal coordinates and dates — and turns it into an indexed knowledge graph and structured relational stores, without unnecessary model calls and without per-request token costs.',
    badges: ['Zero per-request fees', 'Zero vendor lock-in', 'Full privacy on your server'],
  },
  seo: {
    title: 'Fractera Memory — self-hosted memory engine for AI agents',
    description:
      'Self-hosted memory engine for AI agents: knowledge graph, vector and relational stores, built-in object storage, geospatial lat/lon radius recall, native voice, image, video and PDF input, zero-token deterministic reads and champion/challenger skill evolution. One REST API, open source.',
  },
}
