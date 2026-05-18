import type { SiteContent } from '../../types'
import { hero } from './hero'
import { presentation } from './presentation'
import { problem } from './problem'
import { pricing } from './pricing'
import { install } from './install'
import { features } from './features'
import { faqItems } from './faq'

export const ru: SiteContent = {
  ...hero,
  ...presentation,
  ...problem,
  ...pricing,
  ...install,
  ...features,
  faqItems,
}
