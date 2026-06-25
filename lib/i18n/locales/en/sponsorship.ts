import type { SiteContent } from '../../types'

type SponsorshipPart = Pick<SiteContent, 'sponsorship'>

export const sponsorship: SponsorshipPart = {
  sponsorship: {
    label: 'Support the project',
    h2: 'Support Open Code Agentic Engineering Projects',
    body: [
      'This project is built by one person. Many exciting features are still ahead — and your support keeps the lights on.',
      'If you have the means to help, your name will appear on the «Sponsors» tab of our project here and on GitHub.',
    ],
    tiers: [
      {
        id: 's1', amount: '$1', period: '/mo', sublabel: 'Coffee tier — every dollar counts',
        perks: [
          'Your email listed on the Sponsors page (here and on GitHub)',
          'A direct line to submit feature requests',
        ],
      },
      {
        id: 's5', amount: '$5', period: '/mo', sublabel: 'Supporter — fuel the roadmap', badge: 'POPULAR',
        perks: [
          'Access to the private sponsors-only Telegram group',
          'Instructions to remove the “Powered by Fractera” white-label badge',
        ],
      },
      {
        id: 's20', amount: '$20', period: '/mo', sublabel: 'Champion — featured on Sponsors page',
        perks: [
          'Personal one-on-one access to the founder',
          'Access to all VIP features and skills — Fractera Pro',
        ],
      },
    ],
    sponsorButton: 'Sponsor · {amount}{period} →',
    signInPrompt: 'Sign in first to become a sponsor',
    signInButton: 'Sign in to sponsor',
    thankYouTitle: 'Thank you for sponsoring Fractera 💛',
    thankYouBody: 'Your subscription is active. You can manage it any time from the Dashboard.',
    ourSponsorsLabel: 'Our sponsors',
    ourSponsorsLink: 'See everyone who supports Fractera →',
  },
}
