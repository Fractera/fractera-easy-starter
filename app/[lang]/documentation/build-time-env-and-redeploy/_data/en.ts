import type { DocBase } from '../../_lib/types'

// English base document for /documentation/build-time-env-and-redeploy.
// Voice: a clear, engaging engineering explainer for a hybrid reader (a technical human
// AND an AI agent). The RU override (../_data/ru) ships the full Russian version.
// SEO key: "agentic engineering" / build-time configuration / production redeploy.
export const en: DocBase = {
  title: 'Build-Time Env Vars & Production Redeploy in Agentic Engineering | The Bake Contract',
  description:
    'Why a setting you saved can be missing from the running app, and the contract that fixes it: in agentic engineering a production redeploy must bake the slot’s own .env.local — languages, Stripe keys, any build-time variable — with no leakage from the build trigger.',
  summary:
    'A setting saved but not seen by the app is a whole class of bug. This explains build-time env vars, why a redeploy could silently drop them, and the slot-scoped “bake” contract that guarantees they survive.',
  keywords:
    'agentic engineering, build-time environment variables, production redeploy, next build env, NEXT_PUBLIC, slot-scoped build, static-first, self-hosted AI workspace',
  faq: [
    {
      q: 'Why was a value I saved missing from the app after a redeploy?',
      a: 'Because it was a build-time value. Things like NEXT_PUBLIC_* and the language set are frozen into the app when it is built, not read fresh on each request. If the rebuild reads the wrong environment file (or none), the value is baked as missing — and the build still reports success, so the failure is silent. The fix makes every rebuild read the app’s own .env.local.',
    },
    {
      q: 'What counts as a build-time variable?',
      a: 'Anything inlined at build: every NEXT_PUBLIC_* variable (it is inlined into the browser bundle) and anything read while pages are generated — the language set, a Stripe publishable key, feature flags, analytics IDs. They take effect only after a rebuild; changing the file afterwards does nothing until you rebuild.',
    },
    {
      q: 'Does this mean I should avoid build-time variables?',
      a: 'No. They are correct and fast — the value ships inside static HTML that works with JavaScript off. You just have to apply changes by a rebuild, and the rebuild has to read the right file. That is exactly what the bake contract guarantees.',
    },
    {
      q: 'Will a fresh deployment have this problem?',
      a: 'A brand-new server builds from a clean shell and is fine on day one. The trap only appeared on the owner’s later “change a setting → rebuild” path. With the contract in place, both the first build and every later change behave the same.',
    },
  ],
  blocks: [
    {
      kind: 'quote',
      text: 'You change a setting, the panel says “saved”, the build says “done” — and the app still shows the old value. Nothing errored. That silent gap is the bug this document closes.',
    },
    {
      kind: 'p',
      text: 'Fractera is an [Agentic Engineering Infrastructure](/en): a secure, self-hosted workspace where AI models write and run your application on your own server. This guide explains one reliability rule of that workspace — **how build-time configuration must survive a production redeploy** — so an agent (or you) can add a language, a payment key, or any custom variable and trust it actually reaches visitors. It is written for a technical human and an AI agent alike.',
    },
    {
      kind: 'h2',
      text: 'Two kinds of settings: read-now vs baked-in',
    },
    {
      kind: 'p',
      text: 'An app reads configuration in two very different ways, and confusing them is the whole problem:',
    },
    {
      kind: 'list',
      items: [
        '**Runtime values** — read fresh on every request by the running server. Change the file, restart, done.',
        '**Build-time values** — frozen into the app when it is *built*. Every `NEXT_PUBLIC_*` variable is inlined into the browser bundle, and anything read while pages are generated (the language set, a Stripe publishable key, a feature flag) is captured at `next build` time. Editing the file later changes nothing until a **rebuild**.',
      ],
    },
    {
      kind: 'callout',
      title: 'The one-line version',
      text: 'Build-time values only change by rebuilding — and the rebuild must read the app’s own settings file. If it reads the wrong one, your saved value is baked as “missing”, quietly.',
    },
    {
      kind: 'h2',
      text: 'The class of bug: a saved value the app never sees',
    },
    {
      kind: 'p',
      text: 'The first time this bit us, adding a language made the language switcher **disappear**. But the language set was never special — it was just the first build-time variable to expose the flaw. The exact same mechanism would silently drop a **Stripe key** (dead checkout), a **custom API URL**, or a **feature flag** (stuck off). One root cause, many future victims:',
    },
    {
      kind: 'code',
      text:
        'You save in the panel  ->  written to the app\'s .env.local        (correct)\n' +
        '        |\n' +
        '        v\n' +
        'A rebuild is triggered  ->  but the build reads the WRONG env file  (the flaw)\n' +
        '        |\n' +
        '        v\n' +
        'Build finishes "successfully"  ->  your value is baked as MISSING   (silent)\n' +
        '        |\n' +
        '        v\n' +
        'App ships: switcher gone / Stripe.js dead / flag off',
    },
    {
      kind: 'h2',
      text: 'Why it happened: one build process leaking into another',
    },
    {
      kind: 'p',
      text: 'The workspace has **two apps**: the Admin cockpit and your App slot. When you change a setting, the Admin app **spawns a build** for the slot. The environment loader Next uses sets a marker the first time it runs and then refuses to re-read settings files. The Admin process had already run that loader (on its own files, which do not contain your slot’s variables). When it spawned the slot build and handed down its whole environment, the child build inherited that “already loaded” marker and **skipped reading the slot’s own settings file entirely** — so every value declared there came back empty.',
    },
    {
      kind: 'callout',
      title: 'Why it hid for so long',
      text: 'A brand-new server builds from a clean shell with no such marker, so day-one deployments looked perfect. The bug only surfaced on the second and later changes — exactly the everyday “owner tweaks a setting” path.',
    },
    {
      kind: 'h2',
      text: 'The fix: the slot-scoped bake contract',
    },
    {
      kind: 'p',
      text: 'The rule is simple and general: **the app slot’s own settings file is authoritative for every key it declares, on every redeploy.** The build that produces the slot is given a clean, slot-scoped environment so nothing from the build trigger can shadow or suppress the slot’s values.',
    },
    {
      kind: 'code',
      text:
        'Slot build environment (the contract):\n' +
        '  1. drop the "already loaded" marker   -> the build reads the slot .env.local fresh\n' +
        '  2. drop every key the slot declares   -> no inherited copy can shadow the slot value\n' +
        '  3. keep everything else (PATH, HOME, externally-provisioned vars)\n' +
        '\n' +
        'Result: whatever the slot declares in its .env.local, the build bakes -- every time.',
    },
    {
      kind: 'p',
      text: 'Because the rule is about *any* declared key, it is general by construction: languages, Stripe keys and product ids, custom database or API URLs, analytics IDs and feature flags all behave the same. Fix the class once, and no future app trips over it.',
    },
    {
      kind: 'h2',
      text: 'What an agent does when a feature needs a build-time variable',
    },
    {
      kind: 'olist',
      items: [
        '**Write the value through the proper setter, never raw** — for app settings and languages use the validated setter (see the [App Config MCP connector](/en/documentation/app-config-mcp-connector)); for a brand-new variable, add it to the slot’s `.env.local` and document it.',
        '**Trigger a rebuild** — build-time values take effect only after `next build`. A restart alone re-reads an already-built bundle and will not help.',
        '**Say the cost honestly** — a rebuild is a few minutes; that is the price of build-time config, not a regression.',
        '**Never reach for `force-dynamic`** — making a public page dynamic to “reflect a value instantly” breaks the [static-first contract](/en/documentation/static-first-rendering-economics). Build-time values change by rebuild; instant text updates use on-demand revalidation — a different mechanism.',
      ],
    },
    {
      kind: 'h2',
      text: 'How to be sure it works',
    },
    {
      kind: 'p',
      text: 'The environment resolution is observable in under a second, so correctness can be proven before a real build: under the old behavior the slot’s keys resolve to empty; under the contract they resolve to the slot’s values. End-to-end, a triggered redeploy shows **zero “using default” warnings** in the build log and prerenders **all** declared languages — and the served default page contains the switcher.',
    },
    {
      kind: 'h2',
      text: 'The skill, in every agent of the workspace',
    },
    {
      kind: 'p',
      text: 'This contract is also packaged as a self-sufficient agent skill — **persist-env-var-with-rebuild** — duplicated into every coding agent (Claude Code, Codex, Gemini CLI, Qwen Code, Kimi Code) and the Hermes orchestrator. So whichever single agent your project runs — even one lone agent with no orchestrator and no memory — it knows to write a build-time variable through the proper setter and trigger a rebuild that bakes the slot’s own `.env.local`. The capability never depends on Hermes being present; it travels with each agent.',
    },
    {
      kind: 'callout',
      title: 'In one phrase',
      text: 'A setting you save is a setting the app will actually show: every production redeploy bakes the slot’s own configuration, with no silent leakage from the process that triggered the build.',
    },
    {
      kind: 'docref',
      title: 'build-time-env-and-redeploy.md — the complete technical reference',
      summary:
        'The full standard used by AI agents: the two kinds of settings, the root cause (the cross-process env marker), the slot-scoped bake contract, what to do when adding a build-time variable, worked examples, and the invariants.',
      href: '/docs/build-time-env-and-redeploy.md',
    },
    {
      kind: 'cta',
      text: 'Deploy a workspace where your AI agents change real configuration — and every redeploy bakes it correctly, on your own server.',
      href: 'https://www.fractera.ai/',
      label: 'Deploy with AI',
    },
    {
      kind: 'founder',
      text: 'Understanding the economics of sales is what decides which idea you pick. There are plenty of good ideas that simply don’t add up on the money. First learn to do the math — then choose an idea you can actually earn on.',
    },
  ],
}
