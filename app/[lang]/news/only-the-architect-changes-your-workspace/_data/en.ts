import type { NewsArticleBase } from '../../_lib/types'

export const en: NewsArticleBase = {
  title: 'Only the Architect Changes Your Workspace',
  seoTitle:
    'Only the Architect Can Change Your Workspace — Secure-Mode Mutation Gate | Agentic Engineering Platform',
  subtitle:
    'A security hardening for our agentic engineering platform: in secure mode, every surface that can modify files or the database now checks your architect role — not merely whether someone is logged in, and not merely whether they hold a shared key. Being signed in is no longer permission to change the system.',
  description:
    'Fractera, the agentic engineering platform, now enforces an architect-only mutation gate at every transport surface — MCP tool bridges, the admin HTTP API, and the data service — instead of trusting a single central checkpoint. Any tool or endpoint that mutates the filesystem or the database requires the architect role; reads can stay broader. The tightening applies only to secure mode; the open onboarding mode stays fully open by design.',
  summary:
    'In secure mode, changing your self-hosted workspace now requires the architect role at every door — the MCP bridges, the admin API, and the data service each verify identity before a write, so a valid session or a shared secret is no longer enough on its own.',
  keywords:
    'agentic engineering platform, security, access control, architect role, mutation gate, secure mode, self-hosted, MCP bridge auth, least privilege, defense in depth',
  blocks: [
    {
      kind: 'quote',
      text: 'Being logged in is not the same as being allowed to change the system. Reading can be broad; writing is for the architect alone.',
      cite: 'Fractera product team',
    },
    {
      kind: 'p',
      text: 'When you deploy your own workspace on [Agentic Engineering Infrastructure](/en), a natural question follows quickly: who, exactly, is allowed to change it? Not just view it — **change** it: rewrite configuration, touch the database, redeploy the app. On the platform for agentic engineering the answer is now precise and enforced in secure mode: only **you**, the architect. This update closes the gap where simply holding a session, or holding a shared key, could have been mistaken for permission.',
    },
    {
      kind: 'callout',
      title: 'In plain words',
      text: 'Anyone you let read your site can keep reading it. But the moment something wants to *change* your workspace — edit settings, write to the database, trigger a rebuild — the system checks that the request is really coming from you, the owner. A stranger who somehow got a login, or a leaked key on its own, is not enough.',
    },
    {
      kind: 'h2',
      text: 'Logging In Is Not the Same as Permission',
    },
    {
      kind: 'p',
      text: 'Most systems check one thing before a sensitive action: are you logged in at all? That is too coarse. A workspace can have many kinds of members — a visitor, a customer, a subscriber — and none of them should be able to rewrite the site’s configuration just because they hold a valid session. So the gate no longer asks "is there a session?" It asks "is this the **architect**?" A shared secret is treated the same way: a key proves *what you hold*, not *who you are* — and for changing a system where a real human owner exists, we require the role, not merely the key.',
    },
    {
      kind: 'h2',
      text: 'The Same Rule at Every Door — Not One Central Guard',
    },
    {
      kind: 'p',
      text: 'A single central checkpoint is a single point of failure: bypass it, or run a project that does not include it, and the protection is gone. So the rule lives at every door independently. Three surfaces now enforce it:',
    },
    {
      kind: 'list',
      items: [
        'The AI tool bridges — the channels an agent uses to act — require a valid credential on every call; an anonymous request is refused.',
        'The admin interface that serves configuration, database and deployment operations verifies the architect role before any change, not just a logged-in session.',
        'The data service that stores products, media and records requires the architect role for every write, while ordinary reads can stay broader.',
      ],
    },
    {
      kind: 'p',
      text: 'Because the rule is duplicated into each surface rather than centralized, it survives even in a minimal setup — a workspace running a single AI agent with no central brain still enforces the same gate. This is the same self-sufficiency principle behind the [one-switch optional authorization](/en/news/optional-authorization-one-switch): a capability that matters must not depend on any one component being present.',
    },
    {
      kind: 'callout',
      title: 'Did you know?',
      text: 'This tightening applies only to secure mode — the state your workspace is in once it has a real domain and HTTPS. The fast open onboarding mode, where you first meet your workspace on a plain address, stays fully open by design, so nothing about getting started becomes harder.',
    },
    {
      kind: 'cta',
      text: 'Deploy your own secure AI workspace today — you stay the only one who can change it.',
      href: 'https://www.fractera.ai/',
      label: 'Deploy with AI',
    },
    {
      kind: 'founder',
      text: 'The wrong expert knows what you should do. The right expert knows what you should not do.',
    },
  ],
  faq: [
    {
      q: 'Does this make my workspace harder to set up?',
      a: 'No. The architect-only mutation gate applies only in secure mode — after you have attached your own domain and HTTPS. The fast onboarding mode, where you first reach your workspace on a plain address, remains fully open by design, so getting started is exactly as easy as before.',
    },
    {
      q: 'Why is a shared secret not enough to change the system?',
      a: 'A secret proves what a caller holds, not who they are, and secrets can leak. Where a real human owner exists, changing configuration, the database or deployments requires the architect role — an identity check — not merely possession of a key. Machine-to-machine paths that legitimately use a secret still work, but the human path is gated by role.',
    },
    {
      q: 'Can other users still read my site?',
      a: 'Yes. The gate distinguishes reading from changing. Reads can stay broad and tiered by who is asking; only mutations — anything that writes to files or the database — are restricted to the architect. That way visitors and customers keep the access they should have, while control over the system stays with you.',
    },
    {
      q: 'Why enforce this at several places instead of one central guard?',
      a: 'A single checkpoint is a single point of failure and would not exist in a minimal deployment that runs just one agent. By enforcing the same rule independently at the tool bridges, the admin API and the data service, the protection holds even in the smallest setup and cannot be sidestepped by reaching one surface directly.',
    },
  ],
}
