import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { CookieBanner } from '@/components/cookie-banner'
import { SUPPORTED_LANGS } from '@/proxy'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params

  return {
    title: 'Fractera — Open-Source Production AI Development Workspace',
    description:
      'Open-source. Your own server and live domain in seconds. Production AI development workspace with 5 platforms, database, agents, and LightRAG memory — ready to build.',
    metadataBase: new URL('https://fractera.ai'),
    openGraph: {
      type: 'website',
      url: `https://fractera.ai/${lang}`,
      siteName: 'Fractera',
      title: 'Fractera — Open-Source Production AI Development Workspace',
      description:
        'Open-source. Your own server and live domain in seconds. Production AI development workspace with 5 platforms, database, agents, and LightRAG memory — ready to build.',
      images: [
        {
          url: '/fractera-snipet.png',
          width: 1200,
          height: 630,
          alt: 'Fractera — Open-Source Production AI Development Workspace',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Fractera — Open-Source Production AI Development Workspace',
      description:
        'Open-source. Your own server and live domain in seconds. Production AI development workspace with 5 platforms, database, agents, and LightRAG memory — ready to build.',
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
    keywords: [
      'production coding AI',
      'Claude Code server',
      'Codex self-hosted',
      'Gemini CLI server',
      'LightRAG',
      'AI coding platform',
      'own server',
      'no API key',
      'fewer tokens',
      'self-hosted AI',
    ],
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      languages: Object.fromEntries(
        SUPPORTED_LANGS.map(l => [l, `https://fractera.ai/${l}`])
      ),
    },
  }
}

export function generateStaticParams() {
  return SUPPORTED_LANGS.map(lang => ({ lang }))
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Fractera',
  url: 'https://www.fractera.ai',
  logo: 'https://www.fractera.ai/fractera-logo.jpg',
  description:
    'Production AI Development Workspace. Ship features faster with fewer tokens using Claude Code, Codex, Gemini CLI, Qwen Code, and Kimi Code on your own server.',
  email: 'admin@fractera.ai',
  sameAs: ['https://www.fractera.ai'],
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Fractera',
  url: 'https://www.fractera.ai',
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <SiteHeader />
      {children}
      <SiteFooter />
      <CookieBanner />
      <Toaster position="top-center" theme="dark" />
    </>
  )
}
