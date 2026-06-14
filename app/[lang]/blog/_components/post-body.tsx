import type { ReactNode } from 'react'
import type { BlogBlock } from '@/lib/blog/posts'

// Dark-theme inline renderer for blog prose: **bold** and [label](url).
function inline(text: string, kp: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    if (m[1] !== undefined) {
      nodes.push(<strong key={`${kp}-b${i}`} className="font-semibold text-white">{m[1]}</strong>)
    } else {
      const href = m[3]
      const external = /^https?:/.test(href)
      nodes.push(
        <a
          key={`${kp}-a${i}`}
          href={href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="font-medium text-violet-400 underline decoration-violet-400/40 underline-offset-2 hover:text-violet-300"
        >
          {m[2]}
        </a>,
      )
    }
    last = re.lastIndex
    i++
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

export function PostBody({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((b, i) => {
        const k = `blk-${i}`
        switch (b.kind) {
          case 'h2':
            return (
              <h2 key={k} className="mt-6 text-2xl font-bold tracking-tight text-white md:text-xl">
                {inline(b.text, k)}
              </h2>
            )
          case 'h3':
            return (
              <h3 key={k} className="mt-4 text-lg font-semibold text-white">
                {inline(b.text, k)}
              </h3>
            )
          case 'p':
            return (
              <p key={k} className="text-[17px] leading-8 text-white/70 md:text-base">
                {inline(b.text, k)}
              </p>
            )
          case 'quote':
            return (
              <figure key={k} className="my-2 border-l-2 border-violet-500/60 bg-violet-500/[0.05] py-4 pl-6 pr-4">
                <blockquote className="text-xl font-medium leading-relaxed text-white md:text-lg">
                  “{inline(b.text, k)}”
                </blockquote>
                {b.cite && (
                  <figcaption className="mt-3 text-sm font-medium text-violet-300/80">{b.cite}</figcaption>
                )}
              </figure>
            )
          case 'list':
            return (
              <ul key={k} className="flex list-disc flex-col gap-3 pl-6 text-[17px] leading-8 text-white/70 marker:text-violet-400 md:text-base">
                {b.items.map((it, j) => <li key={`${k}-${j}`}>{inline(it, `${k}-${j}`)}</li>)}
              </ul>
            )
          case 'olist':
            return (
              <ol key={k} className="flex list-decimal flex-col gap-3 pl-6 text-[17px] leading-8 text-white/70 marker:font-semibold marker:text-violet-400 md:text-base">
                {b.items.map((it, j) => <li key={`${k}-${j}`} className="pl-1">{inline(it, `${k}-${j}`)}</li>)}
              </ol>
            )
          case 'figure':
            return (
              <figure key={k} className="my-4 flex flex-col gap-3">
                {b.href ? (
                  <a href={b.href} className="block overflow-hidden rounded-2xl border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.src} alt={b.alt} className="w-full" />
                  </a>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.src} alt={b.alt} className="w-full rounded-2xl border border-white/10" />
                )}
                {b.caption && (
                  <figcaption className="text-center text-sm text-white/40">{inline(b.caption, `${k}-cap`)}</figcaption>
                )}
              </figure>
            )
          case 'cta':
            return (
              <div key={k} className="my-4 flex flex-col gap-4 rounded-2xl border border-violet-500/30 bg-violet-500/[0.06] p-6">
                <p className="text-base font-medium text-white">{inline(b.text, k)}</p>
                <a
                  href={b.href}
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500"
                >
                  {b.label}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </a>
              </div>
            )
          case 'note':
            return (
              <p key={k} className="mt-2 border-t border-white/10 pt-6 text-sm italic leading-relaxed text-white/35">
                {inline(b.text, k)}
              </p>
            )
        }
      })}
    </div>
  )
}
