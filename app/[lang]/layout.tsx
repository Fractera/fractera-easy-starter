import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { CookieBanner } from '@/components/cookie-banner'
import { AnchorScrollFix } from '@/components/anchor-scroll-fix'
import { AskAiWidget } from '@/components/ask-ai-widget'
import { GoogleAnalytics } from '@/components/google-analytics'
import { SUPPORTED_LANGUAGES as SUPPORTED_LANGS, DEFAULT_LANGUAGE } from '@/config/translations/translations.config'
import { getMeta } from '@/lib/i18n/locales'

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
    alternates: {
      canonical: isDefault ? 'https://www.fractera.ai/' : `https://www.fractera.ai/${lang}`,
      languages: {
        // x-default and the default-language entry both point at the bare
        // root so Google understands `/` IS the English content (not a
        // 30x stub) and treats `/en` as an internal alias.
        'x-default': 'https://www.fractera.ai/',
        [DEFAULT_LANGUAGE]: 'https://www.fractera.ai/',
        ...Object.fromEntries(
          SUPPORTED_LANGS
            .filter(l => l !== DEFAULT_LANGUAGE)
            .map(l => [l, `https://www.fractera.ai/${l}`])
        ),
      },
    },
  }
}

export function generateStaticParams() {
  return SUPPORTED_LANGS.map(lang => ({ lang }))
}

function buildOrganizationSchema(lang: string) {
  const m = getMeta(lang)
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Fractera',
    url: 'https://www.fractera.ai',
    logo: 'https://www.fractera.ai/fractera-logo.jpg',
    description: m.organizationDescription,
    email: 'admin@fractera.ai',
    sameAs: [
      'https://www.fractera.ai',
      'https://github.com/Fractera/ai-workspace',
    ],
  }
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
  description: 'AI-native self-hosting platform — Deploy Hermes orchestrator, LightRAG memory, Claude Code, Codex, Gemini CLI on your own VPS in 10 minutes. Zero API fees.',
  url: 'https://www.fractera.ai',
  offers: [
    {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      name: 'Fractera Free',
      description: 'Free forever — BYO-install of the full Fractera AI stack on your own VPS, open source.',
    },
    {
      '@type': 'Offer',
      price: '20',
      priceCurrency: 'USD',
      priceSpecification: { '@type': 'UnitPriceSpecification', billingDuration: 'P1M' },
      name: 'Fractera Pro',
      description: 'Full Fractera stack on your VPS — includes Hermes orchestrator, all 5 AI coding platforms.',
    },
    {
      '@type': 'Offer',
      price: '25',
      priceCurrency: 'USD',
      priceSpecification: { '@type': 'UnitPriceSpecification', billingDuration: 'P1M' },
      name: 'Fractera Pro + Managed Server',
      description: 'Fractera Pro with a managed 4-core 6GB VPS included — zero infrastructure setup.',
    },
  ],
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

  // Partner subdomain (partners.fractera.ai) gets a bare layout: no Fractera
  // SiteHeader / SiteFooter / CookieBanner / JSON-LD. The partner page brings
  // its own footer. Detected server-side via the host header — a client-side
  // pathname check cannot work here because proxy.ts rewrites the partner
  // path internally, so usePathname() never sees a /partners/ segment.
  const headerStore = await headers()
  const host = (headerStore.get('host') ?? '').toLowerCase()
  const isPartnerHost = host.endsWith('partners.fractera.ai')

  if (isPartnerHost) {
    return (
      <>
        {children}
        <Toaster position="top-center" theme="dark" />
      </>
    )
  }

  return (
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
      <SiteHeader />
      {children}
      <SiteFooter />
      <CookieBanner />
      <AskAiWidget lang={lang} />
      <GoogleAnalytics />
      <AnchorScrollFix />
      <Toaster position="top-center" theme="dark" />
    </>
  )
}
