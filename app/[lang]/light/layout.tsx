// Light page layout — wraps children in a light-blue background.
// Parent layout (app/[lang]/layout.tsx) provides the dark SiteHeader,
// SiteFooter, CookieBanner — those stay unchanged. This layout only
// flips the page surface color.
export default function LightLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-sky-50 text-slate-900 min-h-screen">{children}</div>
}
