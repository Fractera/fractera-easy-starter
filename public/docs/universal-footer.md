# Universal Footer — the self-configuring, multilingual footer (raw standard)

This is the document an AI agent reads to work with the footer correctly. It is English-only by
design (raw over-docs ship in one language) and grows with the platform.

## What it is

Every project ships one **universal footer** that fits a portfolio, a company page or a full app.
It is always present and configures itself almost entirely from data the app already has — you
rarely touch it. It is built multilingual: its labels exist in 82 languages, English as fallback.

## The sections

On most pages the footer has **two** horizontal sections; the **home page** adds a **third**.

1. **Footer pages (top).** Links to the pages the owner chose to surface in the footer. Pages opt
   in through their group manifest (`_data/group.ts`, the `footer` menu slot + an order), which an
   AI agent edits by voice over MCP — the links form and reorder automatically; no hand-wiring.
2. **Home-section navigation (home page only).** In-page navigation between the sections of the
   home page (e.g. SITE CONTENTS). It renders only on the home page on purpose: the home page
   carries the bulk of the content that benefits from in-page jumps, while other pages are more
   compact and do not need it. Empty section list → it renders nothing.
3. **Company block (bottom).** Pulled straight from the app config — no setup:
   - **company name + address** from App Settings;
   - **social links** (the icons appear once the profiles are set in App Settings);
   - a **theme toggle** — light / dark / system;
   - a **language switcher** — appears automatically only when more than one language is
     configured, with a searchable, region-grouped dropdown; hidden in single-language mode.

## What comes from where

- **From app config (automatic):** company name, address, social profiles — set them in
  Admin → Settings → App Settings and the footer reflects them.
- **By voice (the owner adds):** which pages appear in the footer and in what order — said to an
  AI agent; the agent edits the group manifests, never hand-writes links.
- **Built in (no action):** the theme toggle, the 82-language labels, and the language switcher
  (which simply appears when the language set has more than one entry).

## Where it lives (slot, co-located)

- `components/menu/footer/footer-menu.server.tsx` — the three-section footer (server component,
  reads group manifests at build, SSG-safe).
- `components/menu/footer/footer-home-sections.client.tsx` — the home-only in-page navigation.
- `components/menu/footer/footer-menu.i18n.ts` — the co-located section headings across all 82
  languages (English fallback); delete the footer folder and they go with it.

The footer is site furniture: always rendered, useful even before any group enables a footer page,
because the theme toggle and (in multilingual mode) the language switcher are always handy.
