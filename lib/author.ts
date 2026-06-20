// Single source of truth for the founder/author identity, reused by the visible
// founder quote block (post-body) and the per-article JSON-LD author (Person).
// Canonical name is the pseudonym (Roma Armstrong); sameAs is the SEO "glue" that
// consolidates every real profile into ONE entity — the same set as the site-wide
// personSchema in app/[lang]/layout.tsx. Keep the two in sync when adding a profile.

export const AUTHOR = {
  name: 'Roma Armstrong',
  role: 'Founder at Fractera.ai',
  photo: '/roma_armstrong.jpg',
  url: 'https://www.fractera.ai',
  id: 'https://www.fractera.ai/#roma-armstrong',
} as const

export const AUTHOR_SAME_AS: string[] = [
  'https://www.linkedin.com/in/bolshiyanov/',
  'https://habr.com/ru/users/bolshiyanov/',
  'https://bolshiyanov.medium.com/',
  'https://dev.to/roma_armstrong',
  'https://hackernoon.com/u/roma_armstrong',
  'https://vc.ru/id300490',
  'https://forum.sdelaimebel.ru/profile/175447-bolshiyanov_99718/',
  'https://www.reddit.com/user/bolshiyanov/',
]

// A compact, labelled subset shown under the founder quote (rel="me author" so the
// visible links reinforce authorship the same way sameAs does in structured data).
export const AUTHOR_SOCIAL_LINKS: { label: string; href: string }[] = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/bolshiyanov/' },
  { label: 'Medium', href: 'https://bolshiyanov.medium.com/' },
  { label: 'dev.to', href: 'https://dev.to/roma_armstrong' },
  { label: 'HackerNoon', href: 'https://hackernoon.com/u/roma_armstrong' },
  { label: 'Habr', href: 'https://habr.com/ru/users/bolshiyanov/' },
  { label: 'Reddit', href: 'https://www.reddit.com/user/bolshiyanov/' },
]
