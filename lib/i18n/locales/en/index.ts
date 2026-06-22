import type { SiteContent } from '../../types'
import { hero } from './hero'
import { loopShowcase } from './loop-showcase'
import { presentation } from './presentation'
import { problem } from './problem'
import { pricing } from './pricing'
import { connectFramework } from './connect-framework'
import { install } from './install'
import { features } from './features'
import { faqItems } from './faq'
import { sponsorship } from './sponsorship'
import { companyBrain } from './company-brain'
import { marketplace } from './marketplace'
import { frameworkFeedback } from './framework-feedback'
import { ultimateScale } from './ultimate-scale'
import { aircraftCarrier } from './aircraft-carrier'
import { siteHeader } from './site-header'

export const en: SiteContent = {
  ...hero,
  ultimateScale,
  aircraftCarrier,
  siteHeader,
  ...loopShowcase,
  ...presentation,
  ...problem,
  ...pricing,
  ...connectFramework,
  ...install,
  ...features,
  ...sponsorship,
  ...companyBrain,
  ...marketplace,
  ...frameworkFeedback,
  faqItems,
}
