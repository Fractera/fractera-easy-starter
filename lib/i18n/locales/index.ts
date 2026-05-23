import type { SiteContent, SiteMeta, LightContent } from '../types'
import { en } from './en'
import { ru } from './ru'
import { meta as enMeta } from './en/meta'
import { meta as ruMeta } from './ru/meta'
import { light as enLight } from './en/light'
import { light as ruLight } from './ru/light'

const CONTENT: Record<string, SiteContent> = { en, ru }
const META: Record<string, SiteMeta> = { en: enMeta, ru: ruMeta }
const LIGHT: Record<string, LightContent> = { en: enLight, ru: ruLight }

export function getContent(lang: string): SiteContent {
  return CONTENT[lang] ?? CONTENT.en
}

export function getMeta(lang: string): SiteMeta {
  return META[lang] ?? META.en
}

export function getLight(lang: string): LightContent {
  return LIGHT[lang] ?? LIGHT.en
}
