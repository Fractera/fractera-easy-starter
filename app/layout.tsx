import "./globals.css";

// Bare pass-through root layout (step 130 — static-rendering refactor).
// It renders NO <html>/<body> and calls NO dynamic functions (headers()/cookies()),
// so it never opts the app into dynamic rendering. Each zone owns its own root
// layout with its own <html>: app/[lang] (lang from params), app/(reference)
// (lang="en"), app/admin (lang="en"). globals.css is imported here once so styles
// apply across every zone.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
