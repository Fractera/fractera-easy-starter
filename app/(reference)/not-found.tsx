import Link from 'next/link'

// Root 404 page (catches every unmatched route). Renders standalone inside the root
// layout (no site header/footer — those live in app/[lang]/layout). Two panes:
//   left  — white background, black text, the standard "oops" copy + a link home;
//   right — the /public/404.jpg artwork.
// The image embeds its own typography, so its aspect ratio must never be distorted
// (object-contain, natural width). Below the tablet breakpoint (md) the right pane is
// hidden entirely and the left pane fills the screen. Fully static / no-JS.
export default function NotFound() {
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
