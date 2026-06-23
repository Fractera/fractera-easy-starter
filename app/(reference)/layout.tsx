import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { Providers } from '@/components/providers'
import { htmlFontClass } from '@/lib/fonts'

// Root layout for the English-only root pages that live OUTSIDE the [lang] segment
// (step 130). These pages (mcp-info, ai-workspace-architect, ai-development-loop,
// token-economics, next-aircraft-carrier, debug) + the global not-found are served
// at a bare URL with no language prefix and are EN-only by design, so this zone
// owns a static <html lang="en">. The route group "(reference)" is invisible in the
// URL — paths are unchanged.
export const metadata: Metadata = {
  metadataBase: new URL('https://www.fractera.ai'),
}

export default function ReferenceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={htmlFontClass}>
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <Toaster position="top-center" theme="dark" />
        </Providers>
      </body>
    </html>
  )
}
