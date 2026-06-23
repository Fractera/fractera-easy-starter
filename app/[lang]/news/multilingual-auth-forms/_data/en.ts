import type { NewsArticleBase } from '../../_lib/types'

const GRID_COL_1 = [
  'English', 'Français', 'Español', 'Português', 'Deutsch', 'Italiano', 'Nederlands',
  'Svenska', 'Norsk', 'Dansk', 'Suomi', 'Íslenska', 'Ελληνικά', 'Polski', 'Čeština',
  'Slovenčina', 'Magyar', 'Română', 'Hrvatski', 'Slovenščina', 'Eesti', 'Latviešu',
  'Lietuvių', 'Malti', 'Català', 'Galego', 'Cymraeg', 'Gaeilge',
]
const GRID_COL_2 = [
  'Euskara', 'Русский', 'Українська', 'Беларуская', 'Български', 'Српски', 'Bosanski',
  'Македонски', 'Shqip', 'Қазақша', 'Oʻzbekcha', 'Кыргызча', 'Тоҷикӣ', 'Türkmençe',
  'Azərbaycan', 'Հայերեն', 'ქართული', 'Монгол', 'العربية', 'Türkçe', 'עברית', 'فارسی',
  'Kurdî', 'Afrikaans', 'Kiswahili', 'Hausa', 'Yorùbá',
]
const GRID_COL_3 = [
  'Igbo', 'አማርኛ', 'isiZulu', 'isiXhosa', 'Kinyarwanda', 'Soomaali', '中文', '日本語',
  '한국어', 'हिन्दी', 'اردو', 'বাংলা', 'తెలుగు', 'मराठी', 'ಕನ್ನಡ', 'ગુજરાતી', 'മലയാളം',
  'தமிழ்', 'नेपाली', 'Tiếng Việt', 'ไทย', 'Bahasa Indonesia', 'Bahasa Melayu', 'Tagalog',
  'မြန်မာ', 'ខ្មែរ', 'ລາວ',
]

export const en: NewsArticleBase = {
  title: 'Your Login and Registration Forms Now Speak 82 Languages — Automatically',
  seoTitle: 'Multilingual Login & Registration Forms: 82 Languages, Static, Zero Setup',
  subtitle:
    'A small but important update to the starter templates of our agentic engineering platform: the sign-in and sign-up forms now appear in the visitor\'s own language out of the box — no work on your side',
  description:
    'Fractera, the agentic engineering platform, now ships login and registration forms localized into all 82 languages. After you deploy, you and your users see the form in your native language automatically. The forms are fully static, so there is no extra load on your server and nothing to configure.',
  summary:
    'The login and registration forms in the starter now render in the visitor\'s own language across all 82 languages — automatic, static, and zero-setup.',
  keywords:
    'multilingual login form, localized registration form, 82 languages, static auth forms, agentic engineering platform, i18n authentication, native language sign-in',
  blocks: [
    {
      kind: 'founder',
      text: 'I want to keep this one simple. If you are building for clients in your region, the very first screen they meet should feel like home — and that screen is almost always the sign-in. So we made it speak their language by default. You deploy, and the registration and login forms are already in the right language, both for you and for the people you serve. Nothing to set up.',
    },
    {
      kind: 'p',
      text: 'Fractera is an [Agentic Engineering Infrastructure](/en) — an agentic engineering platform where AI agents build and run your project on your own server. No matter which region you work in, you should not have to stop and think about how to translate the sign-up form on your site so your customers can register comfortably in their own language. So we extended the starter templates to do it for you.',
    },
    {
      kind: 'p',
      text: 'Today\'s update is about the **registration page** — specifically the **login form** and the **registration (password) form**. From now on, no matter what country you are in, the moment your project is deployed you will see these forms in your own language. The same is true for the users of your site: if you turn on sign-in for them, they automatically see the form in their own language too.',
    },
    {
      kind: 'callout',
      title: 'Nothing required from you',
      text: 'It is all already done. The forms are fully static — every language is built in ahead of time — so there is no per-visitor request to detect a language and no extra load on your server. The form simply appears in the right language.',
    },
    {
      kind: 'h2',
      text: 'How it works',
    },
    {
      kind: 'p',
      text: 'The form reads the language of the visitor\'s browser and shows the matching words. Only the **words** are localized; the input fields themselves stay exactly as they were. Because every translation is baked in at build time, the page is served as plain static HTML — fast, light, and the same for everyone, with English as the natural fallback when a browser asks for something we have not translated.',
    },
    {
      kind: 'h2',
      text: 'All 82 languages, by default',
    },
    {
      kind: 'p',
      text: 'Out of the box, the forms ship with translations for the following languages:',
    },
    {
      kind: 'columns',
      cols: 3,
      children: [
        { kind: 'list', items: GRID_COL_1 },
        { kind: 'list', items: GRID_COL_2 },
        { kind: 'list', items: GRID_COL_3 },
      ],
    },
    {
      kind: 'callout',
      title: 'Coming next: trim to just the languages you need',
      text: 'Realistically, many of these languages you will never need. It does not slow down the finished page for your visitors — but it does add a few seconds your server spends building these forms. In a follow-up update you will be able to ask your Hermes agent to remove the languages you do not need and keep only the ones your users might actually use, to speed up the build. Hermes will read the document below — it will already be loaded into your own LightRAG knowledge base — and do the rest. That part is on the way; today every language simply works.',
    },
    {
      kind: 'docref',
      title: 'multilingual-auth-forms.md — how the localized forms work',
      summary: 'The raw document an AI agent reads to understand the localized login and registration forms: which words are localized, how the browser language is matched, why the forms stay static, and how language trimming will work once it ships. It loads into your workspace memory so your agent can act on it.',
      href: '/docs/multilingual-auth-forms.md',
    },
    {
      kind: 'cta',
      text: 'Deploy your own AI-optimized workspace — your sign-in is multilingual from the first minute.',
      href: 'https://www.fractera.ai/',
      label: 'Deploy with AI',
    },
    {
      kind: 'p',
      text: 'This is the same instinct that runs through the rest of the platform: a capability appears, and we fold it into the standard so you never have to rebuild it yourself — like the [multilingual content architecture](/en/news/multilingual-content-architecture) for your pages, or the [autonomous development loop](https://www.fractera.ai/ai-development-loop) that turns a request into shipped code.',
    },
    {
      kind: 'founder',
      text: 'The takeaway: building the technology is the easy part. First you have to work out what you are going to sell, who you are selling it to, and how much they are willing to pay for it. A form that greets every customer in their own language is a small thing — but it is exactly the kind of small thing that decides whether someone in your region trusts you enough to sign up. Good luck building your business.',
    },
  ],
  faq: [
    {
      q: 'Do I have to configure anything to get multilingual login and registration forms?',
      a: 'No. After you deploy, the login and registration forms are already localized into all 82 languages. The form shows the language of the visitor\'s browser automatically, with English as the fallback. There is nothing to set up.',
    },
    {
      q: 'Will multilingual forms slow down my site or my server?',
      a: 'No. The forms are fully static — every language is built in ahead of time, so there is no per-visitor language request and no extra runtime load. Only the words are localized; the input fields are unchanged.',
    },
    {
      q: 'Which languages are included?',
      a: 'All 82 languages in the platform catalog, from English, Spanish, French, German and Russian to Chinese, Japanese, Arabic, Hindi, Swahili and many more. English is always present as the fallback.',
    },
    {
      q: 'Can I remove languages I do not need?',
      a: 'That is coming in a follow-up update. You will be able to ask your Hermes agent to trim the unused languages and keep only the ones relevant to your users, which speeds up the build. The how-to document is loaded into your workspace memory so your agent can apply it. Today, every language simply works out of the box.',
    },
  ],
}
