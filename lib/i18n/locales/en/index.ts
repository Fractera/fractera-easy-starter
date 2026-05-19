import type { SiteContent } from '../../types'
import { hero } from './hero'
import { presentation } from './presentation'
import { problem } from './problem'
import { pricing } from './pricing'
import { install } from './install'
import { features } from './features'
import { faqItems } from './faq'
import { sponsorship } from './sponsorship'

export const en: SiteContent = {
  ...hero,
  ...presentation,
  ...problem,
  ...pricing,
  ...install,
  ...features,
  ...sponsorship,
  faqItems,
}
