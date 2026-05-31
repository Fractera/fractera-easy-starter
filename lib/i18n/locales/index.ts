import type { SiteContent, SiteMeta, CookieBannerContent, DashboardContent } from '../types'
import { en } from './en'
import { ru } from './ru'
import { meta as enMeta } from './en/meta'
import { meta as ruMeta } from './ru/meta'
import { cookie as enCookie } from './en/cookie'
import { cookie as ruCookie } from './ru/cookie'
import { dashboard as enDashboard } from './en/dashboard'
import { dashboard as ruDashboard } from './ru/dashboard'

const CONTENT: Record<string, SiteContent> = { en, ru }
const META: Record<string, SiteMeta> = { en: enMeta, ru: ruMeta }
const COOKIE: Record<string, CookieBannerContent> = { en: enCookie, ru: ruCookie }
const DASHBOARD: Record<string, DashboardContent> = { en: enDashboard, ru: ruDashboard }

export function getContent(lang: string): SiteContent {
  return CONTENT[lang] ?? CONTENT.en
}

export function getMeta(lang: string): SiteMeta {
  return META[lang] ?? META.en
}

export function getCookie(lang: string): CookieBannerContent {
  return COOKIE[lang] ?? COOKIE.en
}

export function getDashboard(lang: string): DashboardContent {
  return DASHBOARD[lang] ?? DASHBOARD.en
}

export function getAllCookies(): Record<string, CookieBannerContent> {
  return COOKIE
}
