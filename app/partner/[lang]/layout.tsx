import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { Providers } from '@/components/providers'
import { htmlFontClass } from '@/lib/fonts'
import { GoogleTagManager, GoogleTagManagerNoscript } from '@/components/google-tag-manager'

// Bare root layout for partner mirror pages (step 130, sub-step 2).
// Partner mirrors used to live on the partners.fractera.ai subdomain, detected via
// headers() in app/[lang]/layout.tsx — which forced the whole [lang] tree dynamic.
// The subdomain is removed: mirrors are now plain paths /partner/<lang>/<slug> on the
// main domain, so this zone owns its own <html lang> with NO host detection. No site
// header/footer/JSON-LD — the mirror page brings its own focused order flow + footer.
export const metadata: Metadata = {
  metadataBase: new URL('https://www.fractera.ai'),
}

export default async function PartnerLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  return (
    <html lang={lang} className={htmlFontClass}>
      <body className="min-h-full flex flex-col">
        {/* GTM noscript — immediately after <body>, per Google's install guide. */}
        <GoogleTagManagerNoscript />
        <Providers>
          {children}
          <GoogleTagManager />
          <Toaster position="top-center" theme="dark" />
        </Providers>
      </body>
    </html>
  )
}
