import type { SiteContent } from '../../types'

export const ultimateScale: SiteContent['ultimateScale'] = {
  badge: 'INFINITE PRODUCTION SCALE',
  h2: 'Tens of Thousands of Pages. Connected Logic. Near-Zero Token Cost.',
  description:
    'In the end you get an application that scales to any level — tens, hundreds, a thousand pages, bound together by shared logic and functionality, with near-zero token spend on coding agents. The MCP infrastructure drives the function calls that update one page, several, or sometimes every page at once.',
  cta: { label: 'Get Your Zero-Overhead Infrastructure Now', href: '#pricing' },
  columns: [
    {
      title: 'A Pre-Built Project Skeleton',
      text: "You get a complete project skeleton that already contains almost every idea you could need later. Instead of building and wiring them up, the project simply switches them on when required. Like a Rubik's Cube — a strictly limited set of faces, a near-infinite set of combinations.",
      linkLabel: 'How the economics works →',
      href: '/token-economics',
    },
    {
      title: 'Generation by Hermes, Not Code Writing',
      text: "Instead of calling a coding agent like Claude Code or Codex for every feature, the platform generates through Hermes — which doesn't really write code, it picks the right combination. Like strict standards that combine every possible Rubik's Cube state with one mechanical move from A to B.",
      linkLabel: 'See parallel routing →',
      href: '#aircraft-carrier',
    },
    {
      title: 'The Fractera Design System',
      text: 'Design is one of the most expensive stages of development — Fractera removes it. A new font, a video background, a reused section? No code generation: apply a rule and the change goes live on one page, several, or all at once. Like a sequence of moves that builds all six sides of the cube at the same time.',
      linkLabel: 'See the design system →',
      href: '#design-system',
    },
  ],
  footnote:
    'In the app settings you can always switch to the standard code-generation mode — exactly one click — if you need a small, fully custom application.',
}
