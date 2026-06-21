import type { BlogBlock } from '@/lib/blog/types'

export const en = {
  title: 'Authentication, Roles & Providers: One Account, Many Doors',
  description:
    'How Fractera ships a clean, scalable authentication scheme out of the box: start with email + password, then activate Google or magic-link by simply pasting credentials. One account can carry several roles and link several sign-in providers without duplicate users — and you can drive roles straight from your app layer.',
  summary:
    'A clean auth scheme you get for free: email+password to start, one-paste Google / magic-link, one account across many providers, and a full role model you can drive from your own app.',
  faq: [
    {
      q: 'Does Fractera support Google and email magic-link sign-in?',
      a: 'Yes — both ship built in. You start on email + password, then paste Google or Resend credentials in the secure admin settings and the matching sign-in button appears automatically. Under the hood Auth.js also supports 80+ other providers you can grow into.',
    },
    {
      q: 'Can one person sign in with several providers without creating duplicate accounts?',
      a: 'Yes. A single identity links multiple providers through the accounts table — sign up by email, later add Google, and both point to the same user record. No duplicate users, no tangled profiles.',
    },
    {
      q: 'Is a “guest” just an anonymous visitor?',
      a: 'No. A guest is a real, on-demand identity created the moment an unauthenticated visitor starts doing something worth saving — a cart, a chat. Their work is persisted in the database and attaches automatically to their real account when they sign up, with no data migration.',
    },
  ],
  blocks: [
    // ── Intro ────────────────────────────────────────────────────────────────
    {
      kind: 'p',
      text: 'Authentication is one of those things that quietly decides whether a project feels solid or fragile. We wanted it to feel **solid from the very first deploy** — and to grow with you, not against you. So every Fractera workspace ships with a complete, production-shaped sign-in system already wired in. You do not assemble it; you **turn parts of it on**.',
    },
    {
      kind: 'p',
      text: 'The result is genuinely pleasant to work with. You start with classic **email + password**. The moment you paste a set of provider credentials, a matching **sign-in button appears on its own**. Behind the scenes a single identity can sign in through several different providers and still be **one account** — no duplicate users, no tangled profiles. And because roles are first-class, you can shape who-can-do-what however your project needs.',
    },
    {
      kind: 'quote',
      text: 'One account. Many doors. You decide which doors exist, and you can open new ones by simply pasting a key.',
    },

    // ── Advantages for a project like ours ───────────────────────────────────
    { kind: 'h2', text: 'Why this matters for a project like yours' },
    {
      kind: 'p',
      text: 'If you are building a simple **landing page**, you may not want a sign-up button at all — and you do not have to place one. The scheme is happy to stay invisible. If instead you are building a **deep application**, authentication becomes a tool you actively use: from your own application layer you can call the provided endpoints to **read users, change their roles, grant or revoke access** — driving the permission model directly from your product code, exactly where your business logic lives.',
    },
    {
      kind: 'p',
      text: 'That flexibility — invisible for a landing, programmable for an app — is the whole point. The same foundation serves a one-page site and a multi-role platform.',
    },

    // ── Roles + examples ─────────────────────────────────────────────────────
    { kind: 'h2', text: 'The roles you get out of the box' },
    {
      kind: 'p',
      text: 'A user is not limited to a single role — roles are stored as a **list**, so one person can be, say, both a `manager` and `finance`. Three of these are **access tiers** the platform itself enforces (`guest`, `user`, `architect`); the rest are a ready **business vocabulary** you can assign as your product grows. Here is the full set, with examples of where each could shine:',
    },
    {
      kind: 'list',
      items: [
        '**guest** — a real, on-demand identity (not just an anonymous viewer): created the moment an unauthenticated visitor starts doing something worth saving — a cart, a chat — so their work persists and carries over when they sign up. See "Guest authentication" below.',
        '**user** — any signed-in person; the baseline for “my profile / my data”.',
        '**architect** — the owner who builds and publishes the project (the top tier; gates the admin workspace).',
        '**buyer** — a customer placing orders and using a cart in a shop.',
        '**vip_user** — a premium member with early access, perks, or higher limits.',
        '**subscriber_lite / subscriber_standard / subscriber_max** — tiered subscriptions, e.g. how much content or how many actions each plan unlocks.',
        '**manager** — handles the requests and conversations of their own customers.',
        '**senior_manager** — oversees a group of managers and their pipelines.',
        '**support_manager** — works the support queue and customer questions.',
        '**delivery_manager** — confirms shipments and tracks delivery status.',
        '**finance** — the accountant who confirms payments and reconciles invoices.',
        '**content_editor** — edits articles, pages, and catalogue content.',
        '**admin** — day-to-day operational administration short of full ownership.',
      ],
    },
    {
      kind: 'p',
      text: 'These are not just labels — they are the seed of real, role-specific experiences. On our **Next.js starter template** we are about to build an interactive **playground for every one of these roles**, so you can click through exactly what each role can see and do.',
    },
    {
      kind: 'cta',
      text: 'See the starter template in action — a live deployment where the per-role playgrounds will land:',
      href: 'https://aifa.dev',
      label: 'Open the live starter (aifa.dev)',
    },

    // ── Guest authentication ─────────────────────────────────────────────────
    { kind: 'h2', text: 'Guest authentication — keep a visitor’s work before they sign up' },
    {
      kind: 'p',
      text: 'Most pages need no identity at all. But picture a visitor who starts using your shop and drops a few items into the cart, or someone who writes a couple of messages to your chat / online consultant — and only **then** decides to sign up. You do not want their cart and their messages to vanish. The usual trick is to stash drafts in the browser, but that is fragile and awkward to carry into a real account.',
    },
    {
      kind: 'p',
      text: 'Guest authentication solves this elegantly. You **mark the pages** where it should kick in (the cart, the chat, a checkout step). When an unauthenticated visitor reaches one of those pages, the app **quietly creates a real guest identity** for them — no form, no password — and from that moment everything they do is saved in the database against that identity. When they later create a full account, all of it — the cart, the messages, the history — **attaches to their new account automatically**, with their email and settings layered on top. Nothing is lost, and there is no data migration.',
    },
    {
      kind: 'note',
      text: 'The key idea: a guest is a **real, persistent identity**, not a throwaway anonymous visitor. You simply flag the pages that should turn an anonymous visitor into a guest; visiting them triggers the guest sign-in under the hood, and the eventual sign-up promotes the very same record.',
    },

    // ── The technical picture (general) ──────────────────────────────────────
    { kind: 'h2', text: 'How it works — the general picture' },
    {
      kind: 'p',
      text: 'Under the hood, a dedicated **authentication service** runs alongside the rest of your workspace on its own port, built on **NextAuth (Auth.js)**. Sessions are carried in a signed cookie shared across your project’s subdomains, so signing in once works everywhere it should. To make modern sign-ins (Google, magic-link) persist properly, the service uses a small **database adapter** together with the providers — a standard, well-trodden combination.',
    },
    {
      kind: 'p',
      text: 'The same service quietly **covers every surface of your workspace**. Your public site stays fast and open where it should be, while administrative areas require the right role. The admin platform, each coding agent, the vector memory, the Hermes brain, and the built-in web chat are all gated through the same identity — directly or through the reverse proxy — so there is one source of truth for “who is this, and what may they do”. There are two modes: an open onboarding mode on a bare IP, and a strict, role-gated secure mode once you attach your own domain with HTTPS.',
    },
    { kind: 'h3', text: 'The database tables that make it work' },
    {
      kind: 'p',
      text: 'The system relies on four required tables, and the relationship between them is the clever part:',
    },
    {
      kind: 'list',
      items: [
        '**users** — one row per person. It stores the essentials and a bit more: email, display name, the role list, sign-in method, verification and active/blocked status — and notably the **user’s image** (for example a Google profile picture), plus locale and timezone preferences and a free-text bio.',
        '**accounts** — one row per **external provider linked to a user**. This is what lets a single account work with **one or several providers at the same time** without ever creating a duplicate person: sign up by email, later add Google, and the system links the new provider to the **same** user instead of making a second one.',
        '**sessions** — present for completeness (sessions actually travel in the signed cookie).',
        '**verification_tokens** — the single-use tokens behind magic-link / email sign-in.',
      ],
    },
    {
      kind: 'p',
      text: 'A few behaviours are worth knowing as the architect. The **database activates on first use** — the first request that needs identity opens it and ensures the tables exist. The **very first person to sign in becomes the architect** automatically (through any provider), and — importantly — **the architect cannot remove their own architect rights**; only another architect can change someone else’s roles. Roles themselves are always a **list of strings**, never a single value, so multi-role users are the norm, not a special case.',
    },
    {
      kind: 'p',
      text: 'Activating more sign-in methods is deliberately effortless. The two providers — **Google** and the **magic-link (email)** flow — are already wired under the hood. You provide each one’s credentials in the secure admin settings, and the corresponding **button appears automatically** on the sign-in page. Remove the credentials and the button disappears. Nothing to redeploy.',
    },

    // ── Login+password caveat ────────────────────────────────────────────────
    { kind: 'h2', text: 'Starting simple: email + password (and its one caveat)' },
    {
      kind: 'p',
      text: 'Your project starts you on a solution where you simply use **login and password**. It is the fastest way to get going. Its one honest limitation: there is currently **no technical flow to recover a lost password** — no “reset password” email. That is perfectly fine for an **early stage** of an application, and it is exactly why we recommend turning on a provider early: Google and magic-link are **passwordless and self-recovering** by nature, so a forgotten password stops being a dead end.',
    },

    // ── All providers ────────────────────────────────────────────────────────
    { kind: 'h2', text: 'Every sign-in method you can grow into' },
    {
      kind: 'p',
      text: 'The foundation (Auth.js) ships with **over 80 built-in providers**, and the schema scales to all of them without structural change — one account keeps linking new providers through the same tables. The complete built-in catalogue:',
    },
    {
      kind: 'p',
      text: '42 School, Apple, Asgardeo, Atlassian, Auth0, Authentik, Azure Active Directory, Azure Active Directory B2C, Azure DevOps, Battle.net, Beyond Identity, Bitbucket, Box, BoxyHQ SAML, Bungie, ClickUp, Cognito, Coinbase, Descope, Discord, Dribbble, Dropbox, DuendeIdentityServer6, EVE Online, FACEIT, Facebook, Figma, Foursquare, Freshbooks, FusionAuth, GitHub, GitLab, Google, HubSpot, Hugging Face, IdentityServer4, Instagram, Kakao, Keycloak, Kinde, LINE, LinkedIn, Logto, Mail.ru, Mailchimp, Mastodon, Mattermost, Medium, Microsoft Entra ID, Naver, Netlify, Notion, Okta, OneLogin, Osso, Osu!, Passage, Patreon, Pinterest, Pipedrive, Reddit, Salesforce, Slack, Spotify, Strava, TikTok, Todoist, Trakt, Twitch, Twitter, United Effects, VK, Webex, Wikimedia, WordPress.com, WorkOS, Yandex, ZITADEL, Zoho, Zoom — plus email/magic-link providers (Resend, Nodemailer, and others) and the built-in Credentials (email + password) flow.',
    },
    {
      kind: 'note',
      text: 'One of the most important rules: **add the providers you want early, while your application is still small.** Wiring identity into a young codebase is cheap and safe.',
    },

    // ── Production risk ──────────────────────────────────────────────────────
    { kind: 'h2', text: 'A word of caution for production apps' },
    {
      kind: 'p',
      text: 'If your application already has a **sizeable codebase, is running in production, and has real customers**, do not experiment with authentication directly on it. The safer path: **deploy a separate server**, bring up and test the new providers there, and only then ask the **AI agent inside your production application to carefully study how authentication is wired in your specific project** before changing anything.',
    },
    {
      kind: 'p',
      text: 'Why this matters: if you, as the architect, lose access during a change for any reason, your application keeps running on its app layer — but it could, in theory, end up **locked for sign-in**. That makes authentication experiments meaningfully risky for an unqualified developer. Respect that risk, and let an AI agent map the terrain first.',
    },

    // ── Footnote ─────────────────────────────────────────────────────────────
    { kind: 'h2', text: 'Want the full, exact picture?' },
    {
      kind: 'note',
      text: 'This page paints the scheme in broad strokes. For a complete, detailed investigation of how authentication is wired in your own project, ask your **Hermes agent connected to the LightRAG vector store** — or any AI agent you use in your project — to study it. The architecture is documented in depth for exactly that purpose; an agent can retrieve and explain every part on demand.',
    },
  ] satisfies BlogBlock[],
}
