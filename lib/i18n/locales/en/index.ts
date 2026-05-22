import type { SiteContent } from '../../types'
import { hero } from './hero'
import { loopShowcase } from './loop-showcase'
import { presentation } from './presentation'
import { problem } from './problem'
import { pricing } from './pricing'
import { install } from './install'
import { features } from './features'
import { faqItems } from './faq'
import { sponsorship } from './sponsorship'
import { blackBox } from './black-box'

export const en: SiteContent = {
  ...hero,
  ...loopShowcase,
  ...presentation,
  ...problem,
  ...pricing,
  ...install,
  ...features,
  ...sponsorship,
  ...blackBox,
  faqItems,
}
