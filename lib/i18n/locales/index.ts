import type { SiteContent, SiteMeta } from '../types'
import { en } from './en'
import { ru } from './ru'
import { meta as enMeta } from './en/meta'
import { meta as ruMeta } from './ru/meta'

const CONTENT: Record<string, SiteContent> = { en, ru }
const META: Record<string, SiteMeta> = { en: enMeta, ru: ruMeta }

export function getContent(lang: string): SiteContent {
  return CONTENT[lang] ?? CONTENT.en
}

export function getMeta(lang: string): SiteMeta {
  return META[lang] ?? META.en
}
