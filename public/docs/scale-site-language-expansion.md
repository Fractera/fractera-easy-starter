# Scaling a site to a new language — the expansion tool

> The raw standard an AI agent reads to add a NEW language across an EXISTING site correctly.
> Companion document: `translate-pending-runner.md` (the non-blocking translation step that follows).

## The model in one picture

Adding a language to a site that **already has content** is not "translate the words." It is two
distinct jobs, handed off by a single flag:

```
  owner_content_add_site_language(hy)        owner_content_translate_pending(hy)
  ─────────────────────────────────          ──────────────────────────────────
  seed every page from the default     →     translate the strings, page by page
  language, RAISE the noindex flag           CLEAR the noindex flag
  (this document)                            (translate-pending-runner.md)
```

This document is the FIRST tool. It makes the site **structurally** multilingual — valid immediately,
search-safe immediately — and leaves the actual translation to a later, separate step.

## What the tool does, in order

1. **Precondition gate.** The language must already be in the app's set
   (`NEXT_PUBLIC_SUPPORTED_LANGUAGES`). Languages are build-time, so add it via App Settings (which
   rebuilds) *first*. If it is not in the set, the tool refuses — it never invents a language.
2. **Seed every section and post from the DEFAULT language.** For each group and each post it writes a
   new `_data/<lang>.ts` cloned from the site's default language (not English unless English is the
   default). The site is therefore complete and valid the instant the build finishes — **no
   machine-translation bill, nothing broken, no blank pages.**
3. **Rewrite every language-dependent link.** Any `/`<default>`/…` link in the body or anchors becomes
   `/<lang>/…`, so a new-language page never points back at the default language.
4. **Raise the Doorway guard.** Each seed is marked `needsTranslation: true`. The engine reads that and
   serves the page as `robots: noindex` — Google never indexes a cross-language duplicate. Crucially,
   `canonical` and `hreflang` stay **correct** the whole time (derived from the language set, not the
   data), so the page is a valid alternate the moment it is translated.
5. **Update all four menus.** Header, footer, left drawer, right drawer pick up the new language
   automatically, because the menu system derives entries from each group's manifest — which the tool
   patches.
6. **Open one translation step per language.** A tracked development step
   (`DEVELOPMENT-STEPS/NEW-STEPS/NN-translate-<lang>.md`) lists every page waiting for that language, so
   nothing is forgotten. You can add a per-language note (e.g. "focus on local law, link real statutes")
   that the runner honors — regional value, not just a word swap.

The tool is **idempotent**: running it twice never duplicates imports, languages or steps.

## Why translation is a separate step

The platform runs on a subscription with per-period limits, and translating a whole site is one of the
heaviest text jobs there is. Welding it onto the build could blow a budget and stall the main work. So
the line is clean: **structure first** (this tool, cheap, deterministic), **translation later** (the
runner, on a fresh budget, even with a different and cheaper model). The main plan is never blocked.

## In plain words

You say "add Armenian to the whole site." In one pass every section and post gets an Armenian version
showing your main language, the menus learn Armenian, the site is live and valid — and Google is told
not to index those pages yet, while still understanding they are the Armenian alternates. Then, whenever
you want, you run the translation step.

## How to call it

- **MCP:** `owner_content_add_site_language({ lang, dry_run? })` — `dry_run: true` previews the exact
  files; call without it to execute. Rebuild (`owner_deploy_rebuild_slot`) to publish the new routes.
- **Standalone (lone agent):**
  `node .agents/skills/expand-site-language/fan-out-site-language.mjs --out . --lang hy`

## Guarantees & limits

- A language is never added with wrong markup: hreflang + canonical + og:url are correct, links are
  rewritten, and an untranslated seed is `noindex` until translated. **Better not indexed than indexed
  as a duplicate.**
- The tool changes content only; it does not deploy. A rebuild publishes the new (noindex) routes.
- This is the only sanctioned way to add a language to existing content. The general content tools
  (compose, manage-collection, the group manifest editor) cannot add a per-page locale and will refuse
  or break the site — the agent is instructed to use this tool instead.
