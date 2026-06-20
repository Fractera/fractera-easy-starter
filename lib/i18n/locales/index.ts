import type { SiteContent, SiteMeta, CookieBannerContent, DashboardContent } from '../types'
import type { DeepPartial } from '@/lib/utils/deep-merge'
import { deepMerge } from '@/lib/utils/deep-merge'
import { en } from './en'
import { ru } from './ru'
import { meta as enMeta } from './en/meta'
import { meta as ruMeta } from './ru/meta'
import { cookie as enCookie } from './en/cookie'
import { cookie as ruCookie } from './ru/cookie'
import { dashboard as enDashboard } from './en/dashboard'
import { dashboard as ruDashboard } from './ru/dashboard'

// `en` is the required, fully-populated base for every shell shape below.
// Any other language is a DeepPartial — missing keys (including a whole new
// language with just one translated field) fall back to `en` per key, not
// per whole object. Arrays are always replaced wholesale (see deep-merge.ts).
const CONTENT: Record<string, DeepPartial<SiteContent>> = { en, ru }
const META: Record<string, DeepPartial<SiteMeta>> = { en: enMeta, ru: ruMeta }
const COOKIE: Record<string, DeepPartial<CookieBannerContent>> = { en: enCookie, ru: ruCookie }
const DASHBOARD: Record<string, DeepPartial<DashboardContent>> = { en: enDashboard, ru: ruDashboard }

export function getContent(lang: string): SiteContent {
  return deepMerge<SiteContent>(en, CONTENT[lang])
}

export function getMeta(lang: string): SiteMeta {
  return deepMerge<SiteMeta>(enMeta, META[lang])
}

export function getCookie(lang: string): CookieBannerContent {
  return deepMerge<CookieBannerContent>(enCookie, COOKIE[lang])
}

export function getDashboard(lang: string): DashboardContent {
  return deepMerge<DashboardContent>(enDashboard, DASHBOARD[lang])
}

export function getAllCookies(): Record<string, CookieBannerContent> {
  return Object.fromEntries(
    Object.keys(COOKIE).map(lang => [lang, getCookie(lang)]),
  )
}
