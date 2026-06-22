# Multilingual Content — living standard

> 📐 **Part of the broader [Content Engine standard](./content-engine.md)** — the full
> co-location architecture (thin `page.tsx` + `_components`/`_lib`/`_data`, the neutral
> block catalog, auto-discovery, deletable-without-orphans, and scaling to any new
> surface like a shop). This file stays the focused **i18n recipe**; read the Content
> Engine doc for how the whole machine fits together.

> **This is a living standard for one job:** how a project stores and translates content (news, blog,
> documentation, any pages) so it **scales by construction** — to dozens of languages and thousands of
> pages, without rewriting what already exists and without hardcoded branches in the code. The document
> **grows with development**. Authored in Russian (the language of the authoritative intent); this is the
> English port shipped for download.
>
> **Why it lives in the standard architecture.** Every real project eventually outgrows a single language —
> especially in Europe, where being bilingual (often three or four languages) is not a "someday" feature but
> a condition of launch. So the multilingual-content approach is part of the **starter's standard** and is
> backed by the agent skill `create-multilingual-content-entry`: any agent in the project can create a
> multilingual document the right way, without reinventing the scheme.
>
> **Builds on** (folder `CRUD-DOCS/workspace-standards/`): `development-methodology.md` — the master
> methodology · `shell-component-architecture.md` — the route/page skeleton · `site-settings.md` — language
> selection. The agent's operational pipeline — `CLAUDE.md §6`.

---

## §0. Goal and angle

**Goal.** Store content so that **a new language = a new file**, not a rewrite; so **partial translation**
is first-class (a language can ship with a single translated field); and so the page code carries **no
language branching** (`if language == X`). This removes the three traps that break at scale: ever-growing
single-file blobs, all-or-nothing translations, and language hacks scattered across the code.

**Context — this is part of optimizing the site.** The content layer is the "site-update processor": the
way pages appear and live on your site. Convenient navigation and fast lookup are half the story; the other
half is that **any optimization today goes hand in hand with search optimization for Google AND for AI**
(GEO — generative engine optimization). So the scheme below accounts up front for: different languages =
different URLs with `hreflang`, a per-language SEO surface, and machine-readable indexes for AI crawlers.

**Layer.** product / starter (`CRUD-DOCS/…`) — ships to the customer with the clone; describes content
**inside the deployed workspace**.

---

## §1. Document = folder (per-document, per-language files)

Each content item is a **separate folder**, not a row in one ever-growing array:

```
lib/<domain>/entries/<slug>/
  meta.ts        # non-translatable fields: slug, date, tags, author, images
  en.ts          # the FULL base-language body (required): translatable fields + body + FAQ
  <lang>.ts      # a partial override: only what differs from the base
```

- **`en` is the required full base.** Any other language is a partial override; missing keys fall back to
  the base.
- **A new language = a new file** `<lang>.ts` in the same folder. Existing files are never touched.
- **A new document = a new folder** + one line in `registry.ts` (an explicit static import — the bundler
  needs resolvable paths, not an `fs` scan).

---

## §2. Translate "per key", not "all or nothing" (deep-merge)

The document resolver and the UI shell return a language as a **recursive merge of the base with the
override**, not "take the whole language OR fall back to the whole base". A missing key is taken from `en`
**per key**.

- **Iron rule:** **arrays are replaced wholesale, never merged element-wise.** A partial translation of a
  list almost always means "translate the whole list or inherit the base one", not mix languages in one.
- **Value for scale:** the 81st language can ship with **one translated field** — everything else renders
  correctly from the base, with no "translate everything or do not publish" block. Priority languages get a
  full translation; the long tail lives in base-fallback mode by default.

---

## §3. No language branching in page code

**Forbidden** in pages/components: `language === 'xx' ? X : Y`, `const isXx = lang === 'xx'`, a manual
locale map. Instead — three moves:

1. **A UI label** → a key in the translation dictionary (the i18n shell), not a string in JSX. A string
   with a link in the middle — split into `…Pre` / `…Link` / `…Post` so word order stays translatable.
2. **"A different block/component per language"** → a **discriminator field in the data** + a component
   registry. The page reads the value from the content and looks the component up. A new untranslated
   language inherits the base value via deep-merge (§2) automatically — no per-language branch.
3. **Date/number** → pass `lang` directly into `toLocaleDateString(lang, …)` (a bare ISO-639-1 code is a
   valid BCP-47 tag); do not map manually (this also removes a class of bugs where a RU page's date renders
   in English format).

**Regression guard.** Documentation alone will not hold the line as the page count and contributor count
(including AI agents) grow. Add a lint rule that catches comparison with a locale literal (`=== 'ru'` /
`=== 'en'`) in the page layer; legitimate server-side normalizations go in a shrinking allowlist.

---

## §4. Static generation and SEO/GEO

- At small volume — full static generation across every existing language (fast, correct). When
  (languages × documents) inflates the build, move to ISR **without losing static**: `dynamicParams = true`
  (on-the-fly render for languages outside the list — the resolver already gives base-fallback) +
  `revalidate = N` (cached after the first request). The parameter list covers only the **actually
  existing** language files, not every supported language.
- **Each language is its own URL** with correct `hreflang`/`alternates` and its own SEO surface (title /
  description / keywords / subtitle). The translation is presented from its own angle, not a word-for-word
  copy — so the engine sees distinct pages, not a duplicate.
- **Machine-readable indexes for AI** (`llms.txt` / `llms-full.txt`, sitemap) are updated together with
  publication — otherwise AI crawlers and search agents will not find the document. At large volume these
  indexes are generated from `registry.ts` rather than maintained by hand.
- **🔒 A page image ALWAYS goes to the snippet.** If a page/document (news / blog / content page) has its own
  main image, that image MUST appear in the social snippet (`og:image` + Twitter `summary_large_image`): pass it
  to `constructMetadata({ image })` rather than relying only on the global `cfg.images.ogImage`. Never leave the
  snippet without the page's image when one exists. Absolute URLs are provided by `metadataBase`; social crawlers
  (Telegram / Facebook / LinkedIn) ignore relative paths. To refresh the Telegram preview, send the URL to the
  `@WebpageBot` bot. (Added 2026-06-21.)

---

## §5. The `create-multilingual-content-entry` skill

So the approach is part of the architecture rather than "knowledge in someone's head", an agent skill
carries it. It is self-sufficient (works for any agent, with no Hermes and no memory) and does exactly one
thing: **create a multilingual document the right way** — the `entries/<slug>/` folder, the full `en` base,
partial overrides, the registry line, a check for the absence of language hacks. The canon lives at
`.agents/skills/create-multilingual-content-entry/SKILL.md` with copies in every agent folder
(self-sufficiency, methodology §0). Named per the naming standard (4–6 words, human-readable — see
`development-methodology.md`).

---

## §6. Relations

- **`development-methodology.md`** — the general discipline; this document = its application to the content
  layer.
- **`shell-component-architecture.md`** — how the page skeleton that renders the content is built.
- **`site-settings.md`** — where the project's language set is chosen (the rebuild trigger for static).
- **The skill** `create-multilingual-content-entry` — the agent's operational entry into this standard.

---

## Appendix A. Growth log

- **2026-06-20** — document created. §1–§4 fixed (document = folder, deep-merge fallback, no language
  branching, SEO/GEO + the ISR recipe). The `create-multilingual-content-entry` skill introduced (§5).
  Occasion — configuring multilingual support while optimizing the platform's content layer (the news story
  `multilingual-content-architecture`).
