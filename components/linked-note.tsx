'use client'

import { useSearchParams } from 'next/navigation'

// Renders an optional note only when the page is opened with a `?id=` query param
// (a link came from an internal reference). Reading the query param on the CLIENT
// keeps the host page fully static — a server-side `searchParams` read would force
// the page to render dynamically on every request. Wrap in <Suspense> at the call
// site (Next requires it for useSearchParams in statically rendered pages). (step 130)
export function LinkedNote({ text, className }: { text: string; className?: string }) {
  const id = useSearchParams().get('id')
  if (!id) return null
  return <p className={className}>{text}</p>
}
