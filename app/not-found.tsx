import { Toaster } from 'sonner'
import { Providers } from '@/components/providers'
import { htmlFontClass } from '@/lib/fonts'
import { NotFoundContent } from '@/components/not-found-content'

// GLOBAL 404 for unmatched URLs (step 132). Next.js routes every unmatched URL to the
// ROOT not-found (nested not-found files only fire on an explicit notFound()). Since
// step 130 made the root layout bare (no <html>), this root not-found renders its OWN
// complete <html lang="en"> document — otherwise unmatched paths fall back to Next's
// default unstyled 404 (the prod regression). The per-zone not-found files
// ([lang], (reference)) still serve explicit notFound() calls inside their own <html>.
export default function GlobalNotFound() {
  return (
    <html lang="en" className={htmlFontClass}>
      <body className="min-h-full flex flex-col">
        <Providers>
          <NotFoundContent />
          <Toaster position="top-center" theme="dark" />
        </Providers>
      </body>
    </html>
  )
}
