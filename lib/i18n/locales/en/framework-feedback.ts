import type { SiteContent } from '../../types'

type FrameworkFeedbackPart = Pick<SiteContent, 'frameworkFeedback'>

// English copy for the framework-expert feedback card + drawer. `{framework}` is
// replaced at render with the page's framework name (e.g. "Next.js"). One set serves
// every /framework/<slug> page — no per-page authoring, no hardcoded lang ternary.
export const frameworkFeedback: FrameworkFeedbackPart = {
  frameworkFeedback: {
    card: {
      eyebrow: 'Framework feedback',
      title: 'Know {framework} well? Share your ideas',
      text: "If you have real expertise in {framework}, tell us how you'd improve the Fractera + {framework} deployment experience. A few words about yourself, a GitHub link, and your wish — that's all we need.",
      label: 'Share your wish',
    },
    drawer: {
      eyebrow: 'Framework feedback',
      title: 'Ideas for the Fractera + {framework} experience',
      subtitle: 'Know {framework} well? Tell us about yourself and share a wish — what would make the Fractera + {framework} deployment better. Only email is required.',
      nameLabel: 'Your name',
      githubLabel: 'Your GitHub link',
      githubPlaceholder: 'https://github.com/username',
      aboutLabel: 'A few words about yourself',
      aboutPlaceholder: 'Your experience with {framework}, what you build',
      wishLabel: "What you'd like to see in the project (for {framework})",
      wishPlaceholder: 'Your wish: what would improve the Fractera + {framework} deployment',
      emailLabel: 'Contact email',
      emailHint: 'Need a reply to a different email? Sign out and sign in with that address.',
      spamLabel: 'I understand the reply may land in the Spam folder.',
      submit: 'Send my wish',
      submitting: 'Sending…',
      sendFailed: 'Failed to send. Please try again or email admin@fractera.ai directly.',
      successTitle: 'Wish sent',
      successBody: "Thank you! We received your {framework} feedback and will factor it into the project's direction. Check the Spam folder if we reply.",
      successClose: 'Got it',
    },
  },
}
