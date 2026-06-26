import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { notFound } from 'next/navigation'
import { Providers } from '@/components/providers'
import { htmlFontClass } from '@/lib/fonts'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { CookieBanner } from '@/components/cookie-banner'
import { AnchorScrollFix } from '@/components/anchor-scroll-fix'
import { AskAiWidget } from '@/components/ask-ai-widget'
import { GoogleAnalytics } from '@/components/google-analytics'
import { GoogleTagManager, GoogleTagManagerNoscript } from '@/components/google-tag-manager'
import { SUPPORTED_LANGUAGES as SUPPORTED_LANGS, DEFAULT_LANGUAGE } from '@/config/translations/translations.config'
import { getMeta } from '@/lib/i18n/locales'
import { buildAlternates } from '@/lib/seo/alternates'
import { LEGAL } from '@/config/legal'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const m = getMeta(lang)
  // The default language lives at the bare root (https://www.fractera.ai/)
  // — proxy.ts rewrites '/' to '/<DEFAULT_LANGUAGE>' internally, so
  // both URLs serve the same HTML. Canonical + OG point at the root so
  // search engines treat them as one document instead of dupes.
  const isDefault = lang === DEFAULT_LANGUAGE
  const ogUrl = isDefault ? 'https://www.fractera.ai/' : `https://www.fractera.ai/${lang}`

  return {
    title: m.title,
    description: m.description,
    metadataBase: new URL('https://www.fractera.ai'),
    openGraph: {
      type: 'website',
      url: ogUrl,
      siteName: 'Fractera',
      title: m.ogTitle,
      description: m.ogDescription,
      images: [
        {
          url: '/fractera-snipet.png',
          width: 1200,
          height: 630,
          alt: m.ogTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: m.ogTitle,
      description: m.ogDescription,
      images: ['/fractera-snipet.png'],
    },
    icons: {
      icon: [
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: '/apple-touch-icon.png',
      other: [
        { rel: 'android-chrome-192', url: '/android-chrome-192x192.png' },
        { rel: 'android-chrome-512', url: '/android-chrome-512x512.png' },
      ],
    },
    keywords: m.keywords,
    robots: { index: true, follow: true },
    // Home-page alternates (subPath ''). Sub-pages override this with their own
    // generateMetadata + buildAlternates('/slug') so each is self-canonical —
    // without that override they would inherit canonical = the language root and
    // Google would fold them into the home page (the bug this fixes).
    alternates: buildAlternates(lang, ''),
  }
}

export function generateStaticParams() {
  return SUPPORTED_LANGS.map(lang => ({ lang }))
}

// All supported languages are enumerated above and prerendered at build.
// dynamicParams=false → an unlisted language 404s instead of spawning an on-demand
// function, so static [lang] pages compile to pure static (○) with no fallback
// lambda (and Vercel's Functions count drops). proxy.ts already redirects unknown /
// invented locales to a supported one, so an unlisted lang never reaches the route.
// (step 130)
export const dynamicParams = false

function buildOrganizationSchema(lang: string) {
  const m = getMeta(lang)
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://www.fractera.ai/#organization',
    name: 'Fractera',
    url: 'https://www.fractera.ai',
    logo: 'https://www.fractera.ai/fractera-logo.jpg',
    description: m.organizationDescription,
    email: 'admin@fractera.ai',
    // Legal identity (single source: config/legal.ts). addressCountry: 'US' is
    // the machine-readable proof that Fractera is a US-registered corporation;
    // taxID is the EIN. Mirrors the human-visible footer + legal pages.
    legalName: LEGAL.companyName,
    taxID: LEGAL.ein,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${LEGAL.companyAddressLine1} ${LEGAL.companyAddressLine2}`,
      addressLocality: LEGAL.companyCity,
      addressRegion: LEGAL.companyState,
      postalCode: LEGAL.companyZip,
      addressCountry: 'US',
    },
    founder: { '@id': 'https://www.fractera.ai/#roma-armstrong' },
    sameAs: [
      'https://www.fractera.ai',
      'https://github.com/Fractera/Agent-Engineering-Infrastructure',
    ],
  }
}

// Person entity for the founder. Canonical name is the target pseudonym
// (Roma Armstrong); the previous real name lives in alternateName so search
// engines merge both identities into ONE entity. sameAs lists every real
// profile — old (Bolshiyanov) and new (Armstrong) — which is the actual "glue"
// that consolidates the two names. Language-independent → a plain const.
const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': 'https://www.fractera.ai/#roma-armstrong',
  name: 'Roma Armstrong',
  alternateName: ['Roman Bolshiyanov', 'Roma Bolshiyanov'],
  jobTitle: 'Founder',
  url: 'https://www.fractera.ai',
  worksFor: { '@id': 'https://www.fractera.ai/#organization' },
  sameAs: [
    'https://www.linkedin.com/in/bolshiyanov/',
    'https://habr.com/ru/users/bolshiyanov/',
    'https://bolshiyanov.medium.com/',
    'https://dev.to/roma_armstrong',
    'https://hackernoon.com/u/roma_armstrong',
    'https://vc.ru/id300490',
    'https://forum.sdelaimebel.ru/profile/175447-bolshiyanov_99718/',
    'https://www.reddit.com/user/bolshiyanov/',
  ],
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Fractera',
  url: 'https://www.fractera.ai',
}

const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Fractera',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Linux (Ubuntu 24.04 VPS)',
  description: 'AI-native self-hosting platform — Deploy Hermes orchestrator, LightRAG memory, Claude Code, Codex, Gemini CLI on your own VPS in 10 minutes. Zero API fees. Free and Open Code (source-available).',
  url: 'https://www.fractera.ai',
  // Fractera is free — there are no paid tiers. The only money is the user's own
  // VPS (paid to their host) and optional, voluntary sponsorship ($1/$5/$20),
  // which is a donation, not a price for the software. So a single free Offer.
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    name: 'Fractera',
    description: 'Free and Open Code (source-available) — install the full Fractera AI stack on your own VPS. No tiers, no API fees; optional voluntary sponsorship only.',
  },
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!SUPPORTED_LANGS.includes(lang)) notFound()

  // [lang] is fully static: no headers()/cookies() here. Partner mirrors moved to
  // their own zone /partner/<lang>/<slug> (step 130, sub-step 2), so this layout no
  // longer needs host detection.
  const inner = (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationSchema(lang)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <SiteHeader />
      {children}
      <SiteFooter />
      <CookieBanner />
      <AskAiWidget lang={lang} />
      <GoogleAnalytics />
      <GoogleTagManager />
      <AnchorScrollFix />
      <Toaster position="top-center" theme="dark" />
    </>
  )

  return (
    <html lang={lang} className={htmlFontClass}>
      <body className="min-h-full flex flex-col">
        {/* GTM noscript — immediately after <body>, per Google's install guide. */}
        <GoogleTagManagerNoscript />
        <Providers>{inner}</Providers>
      </body>
    </html>
  )
}
