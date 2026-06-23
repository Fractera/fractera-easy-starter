import Link from 'next/link'

// Shared 404 body (step 132). Lives in a component so BOTH zone-level not-found
// files render the same branded page: app/[lang]/not-found.tsx (covers the localized
// surface — proxy.ts rewrites every unmatched path under /<lang>/, so this is where
// real 404 traffic lands) and app/(reference)/not-found.tsx (the EN-only root zone).
// After the static-rendering refactor the root layout is bare, so a root not-found
// would render without <html>; each zone owns its own <html>, hence per-zone 404.
// Two panes: left = white "oops" copy + home link; right = /public/404.jpg artwork
// (hidden below md). Fully static / no-JS.
export function NotFoundContent() {
  return (
    <main className="flex min-h-screen w-full">
      {/* Left — white pane with the message */}
      <div className="flex w-full flex-col justify-center gap-6 bg-white px-8 py-16 text-black md:w-1/2 md:px-16">
        <p className="font-mono text-sm font-bold uppercase tracking-widest text-black/50">Error 404</p>
        <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          Oops — something went wrong
        </h1>
        <p className="max-w-md text-base leading-relaxed text-black/70">
          The page you are looking for does not exist, was moved, or never did. Let&apos;s get you
          back on track.
        </p>
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-80"
        >
          Back to home
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </Link>
      </div>

      {/* Right — artwork. Hidden below md (tablet) so the image never scales down past
          its design size; its aspect ratio is preserved (object-contain, natural size). */}
      <div className="hidden items-center justify-center bg-black p-8 md:flex md:w-1/2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/404.jpg"
          alt="404 — page not found"
          className="max-h-screen w-auto max-w-full object-contain"
        />
      </div>
    </main>
  )
}
