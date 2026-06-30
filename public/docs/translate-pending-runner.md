# The non-blocking translation runner

> The raw standard an AI agent reads to translate the pages a previous expansion seeded.
> Companion document: `scale-site-language-expansion.md` (the expansion that runs first).

## Where this fits

The expansion tool made the site structurally multilingual and **raised** a `needsTranslation` flag on
every seeded page (so Google holds them out of the index). This runner is the SECOND tool: it walks
those pages, writes the real translation, and **clears** the flag. One flag, handed off between two
tools:

```
  expansion  → RAISE needsTranslation (page = default-language text, noindex)
  runner     → CLEAR needsTranslation (page = real translation, indexable on next deploy)
```

## The loop

The runner is **agent-driven** — the agent itself is the translator (a subscription LLM, no external
translation API). You call it in a loop, one page at a time:

1. **`op: next`** → the runner returns the next page still pending for this language: its current source
   (the default-language text) **plus the exact ordered list of block kinds** and the FAQ count.
2. **You translate the STRINGS only** — keep the block kinds in the same order, keep the same number of
   FAQ pairs, keep the root anchor `[Agentic Engineering Infrastructure](/<lang>)` and any `/<lang>/…`
   links. You do **not** add, remove or reorder blocks.
3. **`op: write`** → you hand back `{ fields, blocks, faq }`. The runner validates **structure parity**
   (same kinds, same order, same FAQ count — a mismatch is refused), writes the translation into
   `_data/<lang>.ts` **without** the `needsTranslation` flag, and ticks the page off in the translation
   step.

Repeat until `remaining: 0`.

## Why structure parity (and not free authoring)

Translating is a **safe subset** of authoring: only leaf strings change, never the structure. The
parity gate enforces that — so the runner can never drift into generating a different page (which is
what breaks a build). Free body authoring is a different, later capability; this runner deliberately
refuses it.

## Two guards you will meet

- **Structure parity:** add or reorder a block and the write is refused, naming the expected kinds.
- **Encoding integrity:** a translation carrying a broken/replacement character (a control byte, U+FFFD,
  or mojibake — the kind of corruption that renders as a box where an accented letter belonged) is
  refused. Fix the string with the correct letter and retry. (Project-wide, `npm run check:encoding` /
  `owner_content_scan_broken_characters` audits what already sits in the tree.)

## It does NOT deploy

The runner writes files and stops. When the translations are in, it tells you to **press Deploy in the
footer** to publish. Only after that rebuild do the translated pages flip from `noindex` to indexable —
with their canonical and hreflang already correct from the expansion step.

## Regional focus

Before you run a language, open its translation step on the Development Steps page and add a note — e.g.
"for Spanish, focus on Spanish law and link the real statutes." The runner surfaces the page; you, the
translator, honor the note. A translation step is a place to add genuine regional value.

## How to call it

- **MCP:** `owner_content_translate_pending({ lang })` → then
  `owner_content_translate_pending({ lang, op: 'write', tab, slug, translations: { fields, blocks, faq } })`.
- **Standalone (lone agent):**
  `node .agents/skills/expand-site-language/translate-content-page.mjs --out . --lang hy --op next`
  then `… --op write --tab news --slug sample-1 --data translations.json`.
