import type { NewsArticleBase } from '../../_lib/types'

export const en: NewsArticleBase = {
  title: 'Add Any Language to a Site You Already Built — Without Blocking Anything',
  seoTitle: 'Scale an Existing Site to Any Language: hreflang Done Right, Translation Never Blocks the Build',
  subtitle:
    'On our agentic engineering platform you can take a site that already exists in one or two languages and roll out a new one across every page in a single move — menus and all. The new pages are valid the instant the build finishes, the search-engine markup is correct from the first second, and the real translation happens later, on its own, whenever you choose.',
  description:
    'Fractera lets an AI agent add a whole new language to an existing multilingual site across every section and post in one move — seeded with your default language so the site is valid immediately, with correct hreflang and a Doorway-safe noindex on the untranslated pages. Translation is a separate, non-blocking step (one per language, nothing forgotten), so the main work never hits a subscription limit. The four menus translate themselves, and a built-in encoding check keeps a box from ever shipping instead of an accented letter.',
  summary:
    'Take an existing site and scale it to any language in one move: pages valid instantly, hreflang correct, untranslated copies kept out of the index, real translation done later in its own step — and the menus localize themselves.',
  keywords:
    'agentic engineering platform, add a language to an existing site, hreflang, alternate languages, multilingual SEO, non-blocking translation, doorway pages, noindex, internationalization, 82 languages, self-hosted, static-first',
  blocks: [
    {
      kind: 'p',
      text: 'A serious update for anyone who builds for more than one country. Fractera is an [Agentic Engineering Infrastructure](/en) — an agentic engineering platform where AI agents build and run your app on your own server. Until now, adding a brand-new language to a site that **already had content** was the awkward part: every section and every page needed its own copy, the search-engine markup had to stay perfect, and a full translation could eat a whole subscription budget in one sitting. Today that becomes a single, calm, non-blocking move.',
    },
    {
      kind: 'callout',
      title: 'In plain words',
      text: 'You tell the agent "add Armenian to the whole site." In one pass it gives every section and every page an Armenian version, wires it into all your menus, and your site is live and valid — right away. The pages start out showing your main language, marked so Google does not index them yet, and the real Armenian translation is done afterwards, on its own schedule, whenever you want.',
    },
    {
      kind: 'h2',
      text: 'Multilingual Is How You Earn Organic Reach — the Legal Way',
    },
    {
      kind: 'p',
      text: 'Speaking your reader\'s language is one of the cleanest, fully legitimate ways to grow your audience and your search presence. Google itself documents how to do it: give each language its own real URL and tell search engines, in the page markup, that these URLs are the **same content in different languages**. Done right, every language you add is a new, honest door into your site. Done wrong — duplicate pages with the wrong markup — and you get punished as a **doorway**. So the entire job is not just "translate the words"; it is "translate the words **and** keep the markup flawless." We treat that markup as a first-class part of the feature, not an afterthought.',
    },
    {
      kind: 'h2',
      text: 'What "Alternate Languages" Means, and How We Generate It for You',
    },
    {
      kind: 'p',
      text: 'When the same page exists in several languages, each version must carry a small piece of markup — the **alternate-language links**, known as `hreflang` — that says: "here I am in English, here in Spanish, here in Armenian, and here is the default for everyone else." It is the signal that lets Google show the Spanish version to a Spanish reader and, crucially, understand that your `/es/` and `/hy/` pages are **translations**, not duplicates competing with each other. Get it wrong and the same content under two languages looks like spam; get it right and it is pure, legitimate reach.',
    },
    {
      kind: 'callout',
      title: 'You never hand-write this',
      text: 'The platform builds the canonical link and the full set of alternate-language links automatically, from your configured set of languages. Add a language and every page in the site instantly advertises it correctly — self-referencing canonical, a reciprocal hreflang for every language, and an x-default. There is nothing for you to wire by hand and nothing to keep in sync.',
    },
    {
      kind: 'h2',
      text: 'A Non-Blocking Pipeline: the Site Is Whole Now, the Translation Comes Later',
    },
    {
      kind: 'p',
      text: 'Here is the idea that makes the whole thing comfortable. The moment you add a language, every page is **seeded with your default language\'s content** — so the site is complete and valid the instant the build finishes, with no machine-translation bill and nothing broken. Each freshly seeded page is quietly marked "needs translation," which tells the engine to keep it **out of the search index** until it is real — exactly the Doorway guard from the previous section. Then, whenever you choose, a second tool walks those pages and the real translation is written in. The day it is translated, the mark is cleared and the page becomes indexable on the next deploy.',
    },
    {
      kind: 'list',
      items: [
        '**Step one — expand:** the new language appears across every section and post, seeded and valid, pages held out of the index.',
        '**Step two — translate (separately):** a runner fills in the real text, clears the "needs translation" mark, and the page goes live to search the next time you deploy.',
        '**Nothing is half-broken in between** — a seeded page is a correct page in your default language, never a blank or an error.',
      ],
    },
    {
      kind: 'h2',
      text: 'Why We Split Translation Into Its Own Step: Limits, and Focus',
    },
    {
      kind: 'p',
      text: 'This separation is deliberate, and it is about respecting how you actually work. The platform runs on a subscription, which means every period has its limits — and translating a whole site is one of the heaviest text jobs there is. If translation were welded onto the main build, a big site could blow through a budget and stall the work. So we draw a clean line: first the **structure** is finished and deployed, then — at any later moment, on a fresh budget, even with a different and cheaper model — the architect picks up the translations. The main plan is never blocked by a translation hitting a ceiling. It is the same decoupling instinct behind our [static-safe app configuration by AI](/en/news/static-safe-app-config-by-ai): turn a heavy, recurring job into a clean, separate, repeatable move.',
    },
    {
      kind: 'h2',
      text: 'A Step Per Language, So No Translation Is Ever Forgotten',
    },
    {
      kind: 'p',
      text: 'When the expansion runs, it opens **one development step for each new language** — a real, tracked task that lists every page waiting for that language. This is the guarantee: nothing slips through, ever. You can open the service page **Development Steps** at any time and see exactly what is planned and what is left. And it is not read-only — you can **add a note to a specific translation**. Want the Spanish version to lean into Spanish law and link to the actual statutes? Write that note next to the Spanish step, and when the model generates that translation it will honor your instruction. That is how a translation step becomes a place to add **regional value**, not just swap words.',
    },
    {
      kind: 'h2',
      text: 'Your Four Menus Translate Themselves',
    },
    {
      kind: 'p',
      text: 'One detail people expect to be painful, and it simply is not. A site has four menus — the **header**, the **footer**, and the **left** and **right** drawers. You do not have to think about whether each one will have the new language: the moment you add a language, the matching menu entries are created across all four automatically, because the architecture derives them from each section. You scale the content; the navigation comes along for free. If you have followed our work on the [universal multilingual footer](/en/news/universal-multilingual-footer), this is the same principle, now applied end to end.',
    },
    {
      kind: 'h2',
      text: 'And a Box Never Ships Instead of an "ó": Built-In Encoding Integrity',
    },
    {
      kind: 'p',
      text: 'There is a quiet way multilingual text goes wrong: a lossy step — a voice dictation, a copy-paste, a bad transform — can drop an accented letter and leave a stray character in its place. The file still works, so it ships **silently**, and a visitor sees a little box where the "ó" in "Documentación" should be. Because we care that markup and text are both flawless, the platform now refuses these broken characters the moment any content tool tries to write one, and ships a project-wide scanner that sweeps **every language and every file** and reports exactly where a box is hiding — so it gets fixed by hand, with the right letter, before anyone ever sees it.',
    },
    {
      kind: 'p',
      text: 'Put it all together and the bottom line is simple: you **prototype your project in one or two languages**, and then scale it to the rest **safely** — pages valid immediately, translation on your own schedule, menus for free, and search-engine markup that Google rewards rather than penalizes. The internal structure is doing the heavy lifting, and it is doing it the legitimate way. For the wider story of how content is built this way, see our note on [multilingual content architecture](/en/news/multilingual-content-architecture).',
    },
    {
      kind: 'founder',
      text: 'Do not wait until they start competing with you. Start competing first.',
    },
    {
      kind: 'docref',
      title: 'scale-site-language-expansion.md — add a language across an existing site',
      summary: 'The full raw document an AI agent reads to do this correctly: seed every section and post from the default language, rewrite the language-dependent links, RAISE the noindex flag on the seeds (the Doorway guard), update the four menus, and open one translation step per language. English, and it grows with the platform.',
      href: '/docs/scale-site-language-expansion.md',
    },
    {
      kind: 'docref',
      title: 'translate-pending-runner.md — the non-blocking translation runner',
      summary: 'The companion document: how the runner walks the pages a previous expansion seeded, translates the strings into the frozen structure, CLEARS the noindex flag so the page becomes indexable after the next deploy, and never deploys on its own. Two tools, one flag handed off between them.',
      href: '/docs/translate-pending-runner.md',
    },
    {
      kind: 'cta',
      text: 'Deploy your own workspace, build in one language, and let an AI agent scale it to the world — safely, and the legitimate way.',
      href: 'https://www.fractera.ai/',
      label: 'Deploy with AI',
    },
  ],
  faq: [
    {
      q: 'What happens the moment I add a new language?',
      a: 'Every section and every page of your site gets a version in that language in one pass, seeded with your default language\'s text so the site is complete and valid the instant the build finishes — no machine-translation bill, nothing broken. The four menus get the new language automatically. The freshly seeded pages are kept out of the search index until they are really translated.',
    },
    {
      q: 'Will Google treat my seeded pages as duplicates and penalize me?',
      a: 'No. A seeded page that still shows your default language is marked "needs translation," which tells the engine to serve it as noindex — so Google never indexes a cross-language duplicate (the Doorway guard). The canonical and alternate-language (hreflang) markup stay correct the whole time, so the moment the page is translated it flips to indexable and counts as a proper alternate.',
    },
    {
      q: 'Why is translation a separate step instead of happening immediately?',
      a: 'Because the platform runs on a subscription with per-period limits, and translating a whole site is one of the heaviest text jobs there is. Splitting it off means the main build is never blocked: the structure is finished and deployed first, then the translations are done later — on a fresh budget, even with a different, cheaper model. The platform opens one tracked step per language so nothing is ever forgotten.',
    },
    {
      q: 'Can I influence how a specific language is translated?',
      a: 'Yes. Open the Development Steps service page, find the step for that language, and add a note — for example, "for Spanish, focus on Spanish law and link the real statutes." When the model generates that translation it honors your note, so a translation step becomes a place to add genuine regional value, not just a word swap.',
    },
  ],
}
