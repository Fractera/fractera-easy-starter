import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SUPPORTED_LANGUAGES as SUPPORTED_LANGS, DEFAULT_LANGUAGE } from '@/config/translations/translations.config'
import { getLight } from '@/lib/i18n/locales'
import { LightHero } from '@/components/sections/light/hero-light'
import { LightProblem } from '@/components/sections/light/problem-light'
import { LightHowItWorks } from '@/components/sections/light/how-it-works-light'
import { LightComparison } from '@/components/sections/light/comparison-light'
import { LightFaq } from '@/components/sections/light/faq-light'
import { LightCtaFooter } from '@/components/sections/light/cta-footer-light'

const META_EN = {
  title: 'Fractera Light — Self-Hosted Backend-as-a-Service in 10 Minutes',
  description: 'Stop paying the Vercel tax. Deploy a complete backend (auth, database, storage, custom domain, HTTPS) on your own $5 VPS in 10 minutes. Open source. No AI. No vendor lock-in.',
  keywords: [
    'self-hosted backend as a service',
    'self-hosted Vercel alternative',
    'self-hosted Supabase alternative',
    'Vercel tax',
    'leave Vercel',
    'cloud repatriation',
    'sovereign PaaS',
    'self-hosted backend without AI',
    'NIS2 GDPR self-hosted backend',
    'brand-ready backend stack',
    'open source PaaS',
    'Coolify alternative brand-ready',
  ],
}

const META_RU = {
  title: 'Fractera Light — self-hosted backend на VPS за 10 минут (open source)',
  description: 'Уходи с Vercel — заблокирован в РФ. Разверни собственный backend (авторизация, БД, хранилище, домен, HTTPS) на своём VPS за 10 минут. Open-source альтернатива Amvera, ONREZA, RelaxDev. Без AI, без vendor lock-in.',
  keywords: [
    'self-hosted backend на VPS',
    'аналог Vercel в России',
    'альтернатива Vercel свой сервер',
    'альтернатива Amvera',
    'альтернатива ONREZA',
    'Supabase на своём сервере',
    'self-hosted backend без AI',
    '152-ФЗ compliance self-hosted',
    'частное облако для разработчика',
    'уйти с Vercel',
    'open source PaaS Россия',
  ],
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const m = lang === 'ru' ? META_RU : META_EN
  const canonical = lang === DEFAULT_LANGUAGE
    ? 'https://www.fractera.ai/light'
    : `https://www.fractera.ai/${lang}/light`

  return {
    title: m.title,
    description: m.description,
    keywords: m.keywords,
    metadataBase: new URL('https://www.fractera.ai'),
    alternates: {
      canonical,
      languages: {
        'x-default': 'https://www.fractera.ai/light',
        [DEFAULT_LANGUAGE]: 'https://www.fractera.ai/light',
        ...Object.fromEntries(
          SUPPORTED_LANGS
            .filter(l => l !== DEFAULT_LANGUAGE)
            .map(l => [l, `https://www.fractera.ai/${l}/light`])
        ),
      },
    },
    openGraph: {
      type: 'website',
      url: canonical,
      siteName: 'Fractera',
      title: m.title,
      description: m.description,
    },
    twitter: { card: 'summary_large_image', title: m.title, description: m.description },
    robots: { index: true, follow: true },
  }
}

function buildJsonLd(lang: string) {
  const langPath = lang === DEFAULT_LANGUAGE ? '/light' : `/${lang}/light`
  const url = `https://www.fractera.ai${langPath}`
  const softwareApp = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Fractera Light',
    applicationCategory: 'DeveloperApplication',
    applicationSubCategory: 'Backend-as-a-Service',
    operatingSystem: 'Linux (Ubuntu 24.04 VPS)',
    description: 'Self-hosted backend-as-a-service: authentication, database, file storage, custom domain, HTTPS — deployed on your own VPS in 10 minutes. Open source, no AI, no vendor lock-in.',
    url,
    downloadUrl: 'https://github.com/Fractera/fractera-easy-starter',
    offers: [{
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      name: 'Fractera Light — Free Open Source',
      description: 'Self-hosted on your own VPS, free forever.',
    }],
    isPartOf: { '@type': 'SoftwareApplication', name: 'Fractera' },
  }
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.fractera.ai/' },
      { '@type': 'ListItem', position: 2, name: 'Fractera Light', item: url },
    ],
  }
  return { softwareApp, breadcrumb }
}

export default async function LightPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!SUPPORTED_LANGS.includes(lang)) notFound()

  const content = getLight(lang)
  const { softwareApp, breadcrumb } = buildJsonLd(lang)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApp) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <main className="max-w-5xl mx-auto px-6 py-16 flex flex-col gap-20">
        <LightHero content={content} />
        <LightProblem content={content} />
        <LightHowItWorks content={content} />
        <LightComparison content={content} />
        <LightFaq content={content} />
        <LightCtaFooter content={content} />
      </main>
    </>
  )
}
