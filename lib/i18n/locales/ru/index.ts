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
import { companyBrain } from './company-brain'

export const ru: SiteContent = {
  ...hero,
  ...loopShowcase,
  ...presentation,
  ...problem,
  ...pricing,
  ...install,
  ...features,
  ...sponsorship,
  ...companyBrain,
  faqItems,
}
