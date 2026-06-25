import { NextResponse } from 'next/server'
import { getSection, getSectionList } from '@/lib/project-info/content'
import { getArchitectSectionList, getArchitectSection, IMAGE_WIDE, ARCHITECT_URL } from '@/lib/architect-page/content'
import { getLoopSectionList, getLoopSection, IMAGE as LOOP_IMAGE, LOOP_URL } from '@/lib/development-loop/content'
import { SECTIONS as CARRIER_SECTIONS, CARRIER_URL } from '@/lib/next-aircraft-carrier/content'
import { SECTIONS as ECON_SECTIONS, ECON_URL } from '@/lib/token-economics/content'

// Full "llms-full.txt": the complete Fractera knowledge base in one plain-text
// file, for AI crawlers / agents that prefer a single fetch over following the
// links in /llms.txt. Generated from the SAME single sources as the three AI
// reference pages, so it never drifts:
//   - /mcp-info                 (lib/project-info/content.ts)
//   - /ai-workspace-architect   (lib/architect-page/content.ts)
//   - /ai-development-loop      (lib/development-loop/content.ts)
// Each block carries its canonical diagram image URL — those images are the
// semantic, promotion-critical assets AI models read. English is primary.
export const dynamic = 'force-static'

const INTRO = `# Fractera — full knowledge base

> Open Code (source-available), AI-native self-hosting platform. Deploy a complete AI coding
> workspace — 5 AI engines, an autonomous Hermes orchestrator, and private graph
> memory (LightRAG) — onto your own Ubuntu VPS in about 10 minutes. This file is
> the complete /mcp-info knowledge base plus the full /ai-workspace-architect and
> /ai-development-loop references (with their canonical diagrams) in one document:
> architecture, Zero-Ops deployment, customization, pricing, the full FAQ,
> real-world use cases, the workspace architecture, the development loop, the
> Next.js Aircraft Carrier (the pre-built 50,000-line parallel-routing framework),
> the token economics of the MCP-First / Zero-Agent paradigm, the interactive
> AI consultant, the authentication scheme (roles & providers), and the legal text.
> The same content is queryable section-by-section via the MCP connector at
> https://www.fractera.ai/api/mcp (get_project_info,
> get_ai_workspace_architect_info, get_ai_development_loop_info).
`

const CONSULTANT = `# The interactive AI consultant — one button on every page

Reference page (documentation): https://www.fractera.ai/en/documentation/one-button-workspace-ai-consultant

A deployed Fractera workspace ships a floating "AI consultant" button in the
bottom-right corner of every public page (mounted globally, not tied to any
optional layout feature). Clicking it opens a small chat where any visitor can
ask questions OR request actions in natural language; the agent answers and may
return clickable action buttons.

## The core boundary: brain on the server, action in the browser
A server-side tool can know what is possible, read config, converse and PROPOSE
an action, but it cannot reach into a live browser tab. So per-visitor view
actions (language, theme, width, navigation) are executed CLIENT-side by the
chat widget, while shared, workspace-wide changes stay server-side. This is why
"switch me to French" actually switches the page instantly, with no reload.

## Access tiers (public / user / owner), resolved server-side
Tiers nest: public is a guest (own view only), user is a signed-in end-user
(their own data, scoped to their identity), owner is the administrator (shared
config, global defaults, growing the project). The tier is decided on the
server from the session, never trusted from the browser.

## Client actions: server proposes, browser executes
Per-visitor tools (navigate / set locale / set theme / set width) return a small
deferred envelope { "__client_action__": true, tool, args } instead of acting.
The chat renders it as a button; clicking runs an ALLOWLISTED browser handler
after validating arguments (e.g. the language must be one the site is configured
for). The browser never executes an arbitrary instruction from the stream.

## Safe by construction
The public consultant runs as its OWN sandboxed agent process whose toolset is a
strict subset — owner tools are simply absent, so an anonymous visitor cannot
reach them. A runtime guard caps the process at tier "user" for defense in depth,
it binds to loopback (visitors talk only to the /api/consultant endpoint, which
holds the agent token server-side), and it uses its own API key so anonymous
traffic never drains the owner's quota.

## Sign-in escalation
If a request needs the visitor's identity (their own data) or a higher role, the
agent itself picks the right message — "sign in to access your personal
information" vs "this function isn't registered for your role" — and offers a
sign-in button that returns the visitor to where they were. Signing in just
establishes the real role/identity; an administrator is not blocked.

## Growing the toolset
New tools/skills are authored at <your-domain>/ai-draft-settings: describe a new
MCP server, skill or instruction in free form and pick who it is for (guest /
signed-in user / owner). A specialized agent turns the draft into a real tool.
The workspace also ships with source code, a terminal and local development, so
it can be extended without limit. The consultant grows as the toolset grows:
one small button fronting an evolving set of MCP tools, an orchestrator (Hermes)
and global graph memory (LightRAG).`

const AUTHENTICATION = `# Authentication, roles & providers

Reference page (documentation): https://www.fractera.ai/en/documentation/authentication-roles-and-providers

Every deployed Fractera workspace ships a complete, production-shaped sign-in
system already wired in — you do not assemble it, you turn parts of it on. It is
built on NextAuth (Auth.js) running as a dedicated authentication service on its
own port, with JWT sessions carried in a signed cookie shared across the project's
subdomains. Under the hood it uses a database adapter together with the providers
so that modern sign-ins persist correctly.

## One account, many providers — no duplicates
You start with email + password. The moment you paste a provider's credentials in
the secure admin settings, its sign-in button appears automatically; remove the
credentials and it disappears — nothing to redeploy. Two providers are pre-wired:
Google OAuth and a magic-link (email) flow. A single identity can sign in through
several providers and remain ONE account: the system links each new provider to
the existing user (matched by email) instead of creating a duplicate.

## The required tables
Four tables back it: users (one row per person — email, display name, the role
list, sign-in method, verification and active/blocked status, and the user's image
such as a Google avatar, plus locale/timezone and a bio); accounts (one row per
external provider linked to a user — the link that enables one-account-many-
providers); sessions (present for completeness; sessions actually live in the
cookie); and verification_tokens (the single-use tokens behind magic-link sign-in).
The database activates on first use and self-migrates.

## Roles
Roles are stored as a LIST of strings, so one user can hold several at once. Three
are access tiers the platform enforces — guest, user, architect (the owner / top
tier). The rest are a ready business vocabulary: buyer, vip_user, subscriber_lite,
subscriber_standard, subscriber_max, manager, senior_manager, support_manager,
delivery_manager, finance, content_editor, admin. The very first person to sign in
becomes the architect automatically (through any provider), and the architect
cannot remove their own architect rights — only another architect can change
someone else's roles. From your own application layer you can read users and grant
or revoke roles, driving the permission model from your product code.

## Coverage and modes
The same identity covers every surface — the public site, the admin platform, each
coding agent, the LightRAG vector memory, the Hermes brain and the built-in web
chat — directly or through the reverse proxy. There are two modes: an open
onboarding mode on a bare IP, and a strict, role-gated secure mode once you attach
a custom domain with HTTPS (which also locks the host firewall to web ports only).

## Starting simple, and growing safely
The default email+password start has one honest limit: there is no built-in
lost-password recovery — fine for an early stage, and exactly why adding a
passwordless provider (Google or magic-link) early is recommended. Auth.js ships
80+ built-in providers (Google, GitHub, Apple, Microsoft Entra ID, Auth0, Okta,
Keycloak, Discord, Facebook, LinkedIn, Twitch, GitLab, Slack, Spotify, Reddit,
Yandex, VK, Kakao, Naver, LINE, Notion, Salesforce, Zoom and many more) and the
four-table schema scales to all of them without structural change. Rule of thumb:
add the providers you want early, while the codebase is small. If your app is
already large and in production with real customers, do NOT experiment with auth
on it — deploy a separate server, test new providers there, and have an AI agent
study how auth is wired in your specific project first; a botched change can leave
the app running but locked for sign-in.`

const DRAFT_SETTINGS = `# AI Draft Settings — where a workspace learns new skills

Reference page (news): https://www.fractera.ai/en/news/ai-draft-settings-evolutionary-pipeline
Canonical diagram: ![Fractera AI Draft Settings flow — drafts (a terminal and to-dos) become Next Step entries on the Development Steps page, and an AI generation pass writes them into each agent's files: Claude Code, Codex, Gemini CLI, Qwen Code, Kimi Code and Hermes](https://www.fractera.ai/news/fractera-ai-draft-settings/fractera-ai-draft-settings.jpg)

Every Next.js-based Fractera starter ships an AI Draft Settings page: the control
room for the AI side of a project. A normal admin panel manages business data; this
page manages what the AI agents know and may do — each agent's instruction files, its
skills, and the MCP tools it can call. It is the first link in a planned seven-stage
pipeline for evolving a workspace's own intelligence.

## Two ways to use it — by hand or by agent
In the interface, a dual-panel layout lists the six agents (Claude Code, Codex,
Gemini CLI, Qwen Code, Kimi Code, Hermes) on the left; selecting one shows its real
instructions, skills and registered tools on the right, read-only, exactly as they
sit on disk. A draft layer on top is the scratchpad: you write the change you want
and save it as a pending draft. Agents can do the same programmatically — any agent
can call the built-in HTTP skill "propose-new-agent-skill-or-mcp"; Hermes reaches the
same place through the owner_draft_create_record tool on the ai-draft-bridge server
(port 3221). Every agent carries its own copy of the skill, so it works even if the
project runs a single agent and nothing else — no shared brain, no single point of
failure.

## From a wish to a working skill (and why it is never automatic)
Writing a wish is NOT the technical work — it is a brief kept for later, in free form
or structured (a small terminal, or a to-do-style tool). Each draft marks its parent
container with an orange "req" badge. When you or an agent send the draft into work,
the AI clears the note and creates a "Next Step" entry on the Development Steps page,
where the real build is scheduled and run at the right time by an agent or a person.
Turning a draft into code is deliberately never automatic on creation: doing so could
crowd the agent's active context window, lower code quality in the main process, or
burn token limits earlier than planned. The lifecycle is three moves: create a draft,
move it into the queue (it becomes a Next Step), then turn it into the real skill,
instruction or connector and ship it.

## From semi-automatic today to fully automatic
Today the loop is semi-automatic and fast: describe it, send it, an agent builds and
ships it, often within the same session. As the remaining pipeline stages arrive
(automatic testing, regression detection, visual diffs, usage data, a self-tuning
feedback loop), each needs less human help, until the full loop runs end to end with
nobody pressing a button. The page ships with every Next.js-based starter today;
dedicated Agentic Engineering Infrastructure transports bring the same depth (a built-in database,
authentication, file storage, the full five-agent stack and one MCP architecture) to
other frameworks — React, Vue, Angular, SvelteKit, Nuxt, Astro, Remix, Django, Flask,
FastAPI, Laravel, Rails, Phoenix, NestJS and more — announced in News as they go live.`

const MULTILINGUAL = `# Multilingual content architecture — publish in many languages by construction

Reference page (news): https://www.fractera.ai/en/news/multilingual-content-architecture
Raw living standard (download): https://www.fractera.ai/docs/multilingual-content.md

Fractera rebuilt how its own site — and every starter it ships — stores and translates
content (news, blog, documentation, any page copy) so it scales to dozens of languages
and thousands of pages without rewriting what exists and without hardcoded language
branches in code.

## Document = folder
Each content item is its own folder: a non-translatable meta file (slug, date, tags,
images), a FULL base-language file (en) that is required, and a PARTIAL override file per
extra language carrying only what differs. A new language = a new file dropped into the
folder; existing files are never touched. A new document = a new folder plus one line in
an explicit static-import registry (the bundler needs resolvable paths, not an fs scan).

## Translate per key, not all-or-nothing
The resolver and the i18n shell return a language as a recursive deep-merge of the base
with the override: a missing key falls back to English per key (not the whole object).
Arrays are replaced wholesale, never merged element-wise. The result: the 81st language
can ship with a single translated field and render correctly, English filling every gap.
Priority languages get a full translation; the long tail lives in base-fallback mode.

## No language branching in page code
Forbidden: language === 'xx' ? A : B and isXx = lang === 'xx' in the page layer. Instead:
a UI label is a key in the translation dictionary (a link-in-the-middle string is split
into Pre/Link/Post); a different component per language is chosen by a discriminator field
in the data plus a component registry; dates are passed straight to toLocaleDateString(lang)
(a bare ISO-639-1 code is a valid BCP-47 tag) — which also fixed a real bug where a Russian
page showed its date in English month names. A lint rule guards the line so the hack cannot
creep back as the site and its contributors (AI agents included) grow.

## SEO/GEO and static generation
Each language gets its own URL with hreflang and its own SEO surface (title, description,
keywords) written from its own angle, not a word-for-word copy, so engines see distinct
pages. AI discovery is a first-class channel: every update is reflected in machine-readable
indexes (llms.txt, llms-full.txt) and the sitemap. At small volume, full static generation
across existing languages; when languages x documents inflate the build, ISR without losing
static (dynamicParams = true for languages outside the list — the resolver already gives
base-fallback — plus revalidate = N).

## The create-multilingual-content-entry skill
The pattern ships as part of the starter's standard architecture, carried by a self-
sufficient agent skill, create-multilingual-content-entry: any agent (even a single one,
with no Hermes and no memory) can create a multilingual document the right way — the folder,
the full base, partial overrides, the registry line, and a check that no language hacks
slipped in. Especially relevant in Europe, where a project is rarely born in one language.

## Shipped in the starter
The starter ships this routing built in: it deploys bilingual by default (English + Spanish),
so the language switcher button is visible out of the box; leave a single language in the
NEXT_PUBLIC_SUPPORTED_LANGUAGES env and the button disappears and pages serve from the root
with no prefix. Service pages (Architecture, AI Core, …) always stay at the root, never
language-prefixed. Two self-sufficient agent skills ship with it — create-multilingual-content-entry
and install-language-switcher-dropdown (re-installs the language dropdown after you delete it) —
and both are readable in the AI Core page of the deployed workspace.`

const AUTH_FORMS_I18N = `# Multilingual login & registration forms — the sign-in speaks the visitor's language

Reference page (news): https://www.fractera.ai/en/news/multilingual-auth-forms
Raw doc (download): https://www.fractera.ai/docs/multilingual-auth-forms.md

The login and registration forms shipped in every starter (rendered by the auth service,
the process on port 3001) are now localized into all 82 catalog languages. After you deploy,
you and your users see the form in your own language automatically — no setup.

## Automatic, by browser language
The form is a client component: on mount it reads the visitor's browser language
(navigator.language, reduced to its primary subtag, e.g. pt-BR to pt) and selects the matching
strings from a build-time dictionary (services/auth/lib/i18n/auth-strings.ts). Only the WORDS
are localized — the email/password input fields are unchanged. English is the fallback when a
browser asks for a language that is not present.

## Static, zero extra server load
Every language is compiled into the bundle ahead of time, so the /login and /register pages are
served as static HTML. There is no per-visitor request to detect a language and no runtime
generation — keeping server load minimal. The auth service is built once at full deploy
(bootstrap build_auth); the routine app deploy loop does not rebuild it.

## Trimming languages (planned)
By default all 82 languages are baked in, because at deploy time the admin's own language is
unknown — every language must be available for the first sign-up. A planned follow-up lets you
list the languages to keep in an environment variable; a build-time generator (the Turbopack-safe
parser-fs pattern) then emits a dictionary with only those languages plus English. Until it ships,
an agent can do the same today by editing auth-strings.ts directly (remove unwanted entries, keep
en) and rebuilding fractera-auth. The how-to doc loads into the workspace LightRAG so the Hermes
agent can act on it.`

const APP_CONFIG_NEWS = `# Safe static generation: App Config by an AI agent and in the settings

Reference page (news): https://www.fractera.ai/en/news/static-safe-app-config-by-ai
Documentation: https://www.fractera.ai/en/documentation/app-config-mcp-connector
Raw standard (download): https://www.fractera.ai/docs/app-config-automation.md

Every deployed Fractera app ships an App Settings screen (in the Admin area) that manages
everything the app says about itself — branding, SEO, OpenGraph, PWA, author, social profiles,
structured data (JSON-LD), the language set, and images — in one place. A change applies on the
next page load with no rebuild, while the pages stay static (the language set is the build-time
exception). The same settings can be changed without the panel by simply asking any of the six AI
agents in plain words (the App Config MCP connector, :3218); a project with a single lone agent
still has the full capability.

## Why this matters: the dynamic-rendering trap
Metadata is usually left for last, and that is when the expensive mistake happens. If a shared,
top-level layout reads per-request data (calling headers() or cookies() in the root layout),
Next.js renders EVERYTHING beneath it per request — the whole site silently leaves the cheap
static path and rebuilds on every visit, including every bot. Under a traffic spike that is how
projects run up eye-watering hosting bills (the best-documented case, the art app Cara, hit
roughly $96k on its serverless host over one viral weekend). An AI agent is especially prone to
adding that call because it is often the easiest path. Fractera guards the app skeleton — routing,
generateMetadata, language handling — so an agent cannot flip the site dynamic, and settings apply
through revalidation, never by forcing dynamic rendering.

## The full field set
Brand & identity (name, short name, description, site URL, support email, chat brand); App icons &
PWA (theme/background colors, display, orientation, start URL, scope, light/dark browser-bar
colors); Author (name, email, URL, job title, bio, Twitter/LinkedIn/Facebook); Social profiles
(Twitter, GitHub, LinkedIn, Facebook — Organization sameAs); SEO (indexing, title template, robots
index/follow, keywords, canonical base, sitemap URL, Google/Yandex verification); OpenGraph (type,
site name, locale, image width/height); Analytics (enable GA, GA measurement ID); Structured data
(WebSite, Organization, LocalBusiness); Local business / address (street, city, country, postal
code, phone, latitude, longitude, opening hours). Images are uploaded via the panel and come in
light/dark pairs (home illustration, loading, chatbot, author photo, and custom 404/500 error
pages) — the site shows the right one for the visitor's theme automatically.`

const OPEN_CODE_NEWS = `# Fractera moves to Open Code — a source-available license

Reference page (news): https://www.fractera.ai/en/news/open-code-license-agentic-engineering
Raw doc (download): https://www.fractera.ai/docs/open-code-license.md

Fractera is moving its core (the Agent-Engineering-Infrastructure repository) from the MIT
license to Open Code — the PolyForm Small Business license. The principle: you may copy, modify
and use the software commercially for free, with one exception — large corporations. The cut is by
company size: free for individuals and small businesses (fewer than 100 people AND under 1,000,000
USD annual revenue); companies above that threshold need a separate commercial license
(admin@fractera.ai). The restriction is permanent and the code stays fully public to read, audit,
fork and self-host.

## Open Code is source-available, not OSI "open source"
The Open Source Definition forbids discriminating against any person, group or field of use.
Because Open Code restricts large corporations, it is — by that strict definition — not open
source; it is source-available. Fractera uses the accurate term "Open Code" rather than borrow a
label it no longer fits. The ready-made starters (e.g. fractera-next-starter) remain MIT, so the
funnel for forking and building stays wide; only the core infrastructure moves to Open Code. The
L1 Easy Starter service stays closed (never published).

## Why now
A permissive license lets a large, well-funded company take the whole project, rebrand it and
resell it at scale without giving anything back. Ahead of revealing the technology behind
self-replicating MCP coding agents — which pushes development speed up by several orders of
magnitude — Fractera draws a clear commercial boundary so the largest players license commercial
use, while independent builders and small teams keep every freedom they had under MIT.`

const FROZEN_ARCHETYPES_NEWS = `# Frozen archetypes — add a whole page group without code generation

Reference page (news): https://www.fractera.ai/en/news/frozen-archetypes-page-groups-without-code
Raw doc (download): https://www.fractera.ai/docs/frozen-archetypes.md

Adding a page group (a news section, a blog, a documentation section) used to mean an AI coding
agent writing about thirty files by hand — slow, token-heavy, and prone to drifting from the
standard. A frozen archetype replaces that with one call. It is a "project in a box, frozen": an
inert tree of template files with no fixed records, where the specifics (which group, which
languages, the label, how many examples) are parameters, not content. An agent thaws it into the
site with those parameters.

## Thawing is file copy, not code generation
Thawing is deliberately dumb. The agent copies the template files into the project and fills in the
blanks: it installs the shared content engine only if the slot lacks it (idempotent), creates the
section plus a couple of placeholder posts (Lorem body, placeholder image, but the full ideal page
structure — SEO metadata, breadcrumbs, table of contents, FAQ), and translates the single section
label into each configured language. No model writes code, so any model — the built-in brain or any
of the coding agents — produces an identical result in seconds, and the pages are static and work
with JavaScript off.

## The closed store and the two layers
The frozen archetype lives in a closed store on the user's own server (the data service), served
read-only. It has two layers: an engine layer (the shared content engine, installed only when the
slot has none — it belongs to no single tab) and a tab layer (the parameterized section itself,
which refuses to overwrite an existing tab). The engine is distilled from the platform's mature
content engine and decoupled from anything project-specific, with brand and domain read from
environment variables, so it is portable to any starter.

## Honest refusal — match a real capability or decline
One archetype does not serve everything. The manifest declares what it fits (news, blog,
documentation, announcements, changelog, guides) and what it does not serve (a cart/checkout, a
graded course with tests, an interactive app screen). The agent consults that manifest instead of
guessing; asked for something outside it, the agent says so honestly and offers to author a new
archetype — it will not force a bad fit or invent fragile code. Surfaces: the owner-tier
archetypes-bridge MCP (port 3223, owner_archetype_list_frozen + owner_archetype_thaw_content_group
with a confirm-first dry run) and the self-sufficient thaw-frozen-archetype skill, shipped to every
agent so it works on a lone agent with no orchestrator.`

const STATIC_FIRST = `# Static-first rendering — the economics of a near-zero server bill

Reference page (documentation): https://www.fractera.ai/en/documentation/static-first-rendering-economics
Raw living standard (download): https://www.fractera.ai/docs/static-first-rendering.md

Fractera enforces static-first rendering with unusual rigor because the cost it
optimizes for is the business's monthly server bill — compute and database load — not
the developer's token budget. Tokens are spent once, while building; compute is spent
forever, on every visitor. A project that renders dynamically by default scales its
server cost linearly with traffic, which is exactly where small businesses fail to close
their unit economics.

## The canon
Creating a dynamic page is forbidden unless it is absolutely necessary, and only after the
architect's double confirmation — better to build nothing than to make a page dynamic where
it could have been static. The foundation is no-JavaScript: the App Router ships complete
server HTML, so a static page works with JavaScript disabled. The real no-JS killer is
client-side routing or a client component that owns a route, not server rendering itself.

## Five ways content reaches a page (cheapest to most expensive per visitor)
1. Static (SSG): data fixed at build; appears on redeploy; zero DB per visit; no JS; lowest cost.
2. Time-based ISR (revalidate = N): the default. Lazy and traffic-bound — a page re-renders only when requested after its N-second window, and only that page; with no traffic the server sleeps. Self-correcting, needs no wiring.
3. On-demand ISR (revalidate = false + revalidateTag on write): optional refinement for a page that needs instant, zero-delay freshness — purge it from the write handler. Requires discipline (call it on every write) or the page freezes.
4. Dynamic SSR (force-dynamic): rendered fresh every request, a DB hit every time; high cost; architect-only.
5. Client fetch: a client island queries the API on every view; always live but needs JS and hits the DB per view; fine for private panels, poor for public lists.

## How time-based ISR behaves (the default)
A page with revalidate = N is generated once and served from cache. While nobody visits, the server
sleeps. When a visitor arrives after the window, they get the cached page instantly and that one page
is regenerated in the background; the next visitor sees the fresh version. Only requested pages
regenerate — there is no clock rebuilding the whole site, and unvisited pages cost nothing. The only
redundant cost is a constantly-visited page that rarely changes: it rebuilds once per window even when
unchanged, a small traffic-bounded price. For zero-delay freshness on a specific page, opt into
on-demand revalidation (revalidate = false + revalidateTag on the write handler).

## Why the architect layer stays dynamic
The service cockpit (Architecture, AI Core, Development Steps, …) runs dynamically on purpose. A
single architect, on pages only they can open, cannot create harmful load; that compute is bounded
and necessary. The rule protects the public surface, where many visitors — careless, curious or
malicious — turn every dynamic render into multiplied cost. Dynamic rendering is allowed exactly
where it cannot hurt the bill: behind architect-only access.

## PPR is left to the developer
Partial Prerendering (a static shell with a dynamic hole) is a precise tool for a developer who
knows which fragment must be live and wants to balance freshness against server cost by hand.
Fractera does not automate it — that judgment is the developer's.`

const CONTENT_ENGINE = `# The content engine — self-contained pages, auto-discovery, token economy

Reference page (documentation): https://www.fractera.ai/en/documentation/content-engine-architecture
Raw engineering standard (download): https://www.fractera.ai/docs/content-engine-en.md

Every content surface on the site — news, blog, documentation, the deployment pages — is built
from one shape. A content surface always does three jobs: hold data, render itself as a page, and
appear in a list. The naive way couples those to a central spine — one global registry, one dynamic
[slug] route, one shared "god" types file — and the spine becomes the bottleneck every new item
touches and every agent must load. The engine removes the spine. The rule is one sentence:
everything a page needs lives inside its own folder; everything shared lives once in the engine;
nothing in between.

## Every page is a folder (co-location)
A tab (a collection like the blog) is a folder with a thin router on top and post folders below.
Three service folders carry a strict split — _components is the view, _lib is the functions and
type contracts, _data is the data (including the localized UI strings) — and one generated file is
the auto-built list. Each post repeats the same shape: a thin page.tsx, a _components composition,
and a _data folder (meta.ts + en.ts + an optional <lang>.ts override + index.ts). Add a page by
adding a folder; delete it by deleting the folder, with zero orphans left behind. The shared engine
— the typed-block catalog, the per-key language resolver, the page factories and the one page
template — lives once, outside the tabs, reused by every one of them, never copied in.

## Why it saves tokens (the point)
The cost of an AI coding agent is dominated by how much it must read into context to act safely.
Co-location bounds that: editing one page loads one folder; there is no registry to read or
maintain (discovery happens at build time from the filesystem); the neutral block catalog removes
duplicate per-tab type definitions; the strict _lib/_data/_components split makes the right file
findable without exploration; and deleting is one folder with no orphan hunt. A registry design
pulls 3–5 files into context per edit plus greps to find them; here a page edit touches 1–2 files
in a known folder and a new page touches zero existing files. The savings compound with every page
and every agent.

## A design system you steer by structure
Content is authored as typed blocks (paragraph, heading, quote, list, figure, callout, founder
note, download card, container layouts). Each block kind has exactly one renderer, living once in
the shared catalog — so changing how a block looks in that one place restyles every page that uses
it at once, even across hundreds of pages. Presentation is managed by structure, in one place, and
propagates everywhere. That dynamically-managed design system is the second payoff of the same
architecture that saves the tokens. The document is bilingual (EN/RU).`

const BUILD_TIME_ENV = `# Build-time environment variables & production redeploy — the bake contract

Reference page (documentation): https://www.fractera.ai/en/documentation/build-time-env-and-redeploy
Raw living standard (download): https://www.fractera.ai/docs/build-time-env-and-redeploy.md

A deployed app reads configuration two ways. Runtime values are read fresh on every
request. Build-time values are frozen into the app when it is built: every NEXT_PUBLIC_*
is inlined into the browser bundle, and anything read while pages are generated (the
language set, a Stripe publishable key, a feature flag, analytics IDs) is captured at
next build. Build-time values therefore change only by a rebuild — and the rebuild must
read the app slot's own .env.local. If it reads the wrong file, the saved value is baked
as missing while the build still reports success: a silent failure.

This was a whole class of bug, first seen as the language switcher disappearing after a
language was added — the same mechanism would have silently dropped Stripe keys, custom
API URLs or feature flags. Root cause: the workspace has two Next apps (the Admin cockpit
and the App slot); when the owner changes a setting, the Admin process spawns the slot
build and hands down its whole environment. Next's env loader sets a cross-process marker
(__NEXT_PROCESSED_ENV) on first run and then refuses to re-read .env files; the child
build inherited that marker and skipped loading the slot's own .env.local entirely, so
every declared value came back empty. A fresh wipe+bootstrap builds from a clean shell and
was fine on day one — the trap only bit on the owner's later change-a-setting path.

The fix is the slot-scoped bake contract: the slot's own .env.local is authoritative for
every key it declares, on every redeploy. The spawned build is given a clean, slot-scoped
environment — drop the marker so the loader reads the slot file fresh, drop every key the
slot declares so no inherited copy shadows it, keep everything else (PATH, HOME,
externally-provisioned vars). General by construction: languages, Stripe keys and product
ids, custom DB/API URLs, analytics and feature flags all behave the same. When a feature
needs a build-time variable: write it through the proper setter (never raw), trigger a
rebuild (a restart re-reads an already-built bundle and will not help), state the rebuild
cost honestly, and never reach for force-dynamic (build-time changes by rebuild; instant
text updates use on-demand revalidation — a different mechanism). The document is bilingual (EN/RU).`

const APP_CONFIG = `# App Config automation — the MCP connector for managing project configuration

Reference page (documentation): https://www.fractera.ai/en/documentation/app-config-mcp-connector
Raw living standard (download): https://www.fractera.ai/docs/app-config-automation.md

A deployed app carries owner-editable settings that brand it and control how it appears
to visitors, search engines and PWA installs: name, description, canonical URL, SEO,
OpenGraph, PWA/theme, author, social profiles, JSON-LD, local business — and the language
set. The automated MCP connector for managing project configuration lets any of the six AI
agents read and change these by plain request, instead of clicking the admin panel.

The settings live in a plain JSON file on disk (app/APP-CONFIG/app-config.json), deep-merged
over the code defaults on every render. A file is chosen over a database (opaque to agents,
needs a query layer) and over env vars (flat, and NEXT_PUBLIC_* bakes into the build so it
would need a rebuild): the file is transparent, holds nested structure, and applies without a
rebuild. The distinction that matters is substrate vs write path — the file is the substrate,
but every write goes through a validated setter (the app-settings-bridge MCP, port 3218),
never raw hand-editing: it validates against a field catalog, writes atomically (temp file +
rename), and triggers on-demand revalidation so the change shows on the next page load while
the public pages stay static. Languages are the one build-time exception (they feed static
page generation), so changing them needs a rebuild and the agent says so.

The capability is duplicated into all six agents (Claude, Codex, Gemini, Qwen, Kimi, Hermes)
as both a skill (manage-app-settings) and the MCP connector, so a project running a single
agent with no orchestrator still has it. The same change runs directly on one coding agent or
through the Hermes orchestrator; the write mechanics are identical, Hermes only adds multi-step
orchestration. Access is constrained in depth: writing configuration is architect-only and
checked at every layer; the connector binds to localhost and is never exposed to the internet;
every call carries a per-deploy Bearer secret; and a mutating tool confirms the change before
writing. The document is English (TechArticle), written for a hybrid human + AI reader.`

export function GET() {
  const lang = 'en' as const

  const projectBody = getSectionList(lang)
    .map(({ id }) => getSection(id, lang))
    .filter((s): s is NonNullable<typeof s> => s !== null)
    .map((s) => `## ${s.title}\n\n${s.body}`)
    .join('\n\n---\n\n')

  const architectBody = getArchitectSectionList()
    .map(({ id }) => getArchitectSection(id))
    .filter((s): s is NonNullable<typeof s> => s != null)
    .map((s) => `${'#'.repeat(s.level)} ${s.title}\n\n${s.body}`)
    .join('\n\n')

  const loopBody = getLoopSectionList()
    .map(({ id }) => getLoopSection(id))
    .filter((s): s is NonNullable<typeof s> => s != null)
    .map((s) => `${'#'.repeat(s.level)} ${s.title}\n\n${s.body}`)
    .join('\n\n')

  const architect = `# Agentic Engineering Infrastructure architecture

Reference page: ${ARCHITECT_URL}
Canonical diagram: ![Fractera Agentic Engineering Infrastructure architecture diagram — Hermes multi-agent orchestration, LightRAG memory and five coding agents](${IMAGE_WIDE})

${architectBody}`

  const loop = `# The Fractera development loop

Reference page: ${LOOP_URL}
Canonical diagram: ![Fractera Development Loop diagram — one admin request flows through Hermes, a coding agent and LightRAG memory to tested, deployed code](${LOOP_IMAGE})

${loopBody}`

  const carrierBody = CARRIER_SECTIONS
    .map((s) => `${'#'.repeat(s.level)} ${s.title}\n\n${s.body}`)
    .join('\n\n')

  const econBody = ECON_SECTIONS
    .map((s) => `${'#'.repeat(s.level)} ${s.title}\n\n${s.body}`)
    .join('\n\n')

  const carrier = `# The Next.js Aircraft Carrier — pre-built parallel routing

Reference page: ${CARRIER_URL}
Canonical diagram: ![Next.js parallel-routing layout — Header, Promo Screen, Left, Right, Center Header, Center, Center Footer and Footer slots with an active-slots checklist](https://www.fractera.ai/nextjs-parallel-routes.png)

${carrierBody}`

  const econ = `# Token economics — how Fractera saves tokens

Reference page: ${ECON_URL}

${econBody}`

  const body = `${projectBody}\n\n===\n\n${architect}\n\n===\n\n${loop}\n\n===\n\n${carrier}\n\n===\n\n${econ}\n\n===\n\n${CONSULTANT}\n\n===\n\n${AUTHENTICATION}\n\n===\n\n${DRAFT_SETTINGS}\n\n===\n\n${MULTILINGUAL}\n\n===\n\n${AUTH_FORMS_I18N}\n\n===\n\n${STATIC_FIRST}\n\n===\n\n${CONTENT_ENGINE}\n\n===\n\n${APP_CONFIG}\n\n===\n\n${BUILD_TIME_ENV}\n\n===\n\n${APP_CONFIG_NEWS}\n\n===\n\n${OPEN_CODE_NEWS}\n\n===\n\n${FROZEN_ARCHETYPES_NEWS}`

  return new NextResponse(`${INTRO}\n${body}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
