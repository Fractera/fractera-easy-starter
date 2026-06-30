import { AUTHOR } from '@/lib/author'
import type { NewsArticleMeta } from '../../_lib/types'

export const meta: NewsArticleMeta = {
  slug: 'optional-authorization-one-switch',
  date: '2026-06-30',
  readingMinutes: 6,
  tags: ['Agentic Engineering Platform', 'Authorization', 'Role-Based Access', 'No-Code', 'Agent Skills'],
  author: { name: AUTHOR.name, role: AUTHOR.role },
  // The shipped starter home page with the account control ("My account") in the
  // top-right of the header — the public login you switch on only when the app needs it.
  heroImage: '/news/app-shell-auth/account-button.png',
  ogImage: '/news/app-shell-auth/account-button.png',
}
