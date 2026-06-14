import type { ReactNode } from 'react'

// Tiny dependency-free markdown rendering (bold, inline code, lists, paragraphs,
// horizontal rules) — the same approach used by /mcp-info, extracted here so the
// architecture page renders its section bodies without pulling react-markdown.

export function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  // bold | inline-code | [text](url)
  const re = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    if (m[1] !== undefined) {
      nodes.push(<strong key={`${keyPrefix}-b${i}`} className="font-semibold text-zinc-900">{m[1]}</strong>)
    } else if (m[2] !== undefined) {
      nodes.push(
        <code key={`${keyPrefix}-c${i}`} className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.85em]">{m[2]}</code>,
      )
    } else {
      const href = m[4]
      const external = /^https?:/.test(href)
      nodes.push(
        <a
          key={`${keyPrefix}-a${i}`}
          href={href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="font-medium text-violet-700 underline hover:text-violet-900"
        >
          {m[3]}
        </a>,
      )
    }
    last = re.lastIndex
    i++
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

type Block =
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'h'; level: 3 | 4 | 5; text: string }
  | { kind: 'hr' }

function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function parseBody(body: string): Block[] {
  const blocks: Block[] = []
  let list: { kind: 'ul' | 'ol'; items: string[] } | null = null
  let para: string[] = []
  const flushPara = () => { if (para.length) { blocks.push({ kind: 'p', text: para.join(' ') }); para = [] } }
  const flushList = () => { if (list) { blocks.push(list); list = null } }

  for (const raw of body.split('\n')) {
    const line = raw.trim()
    if (!line) { flushPara(); flushList(); continue }
    if (line === '---') { flushPara(); flushList(); blocks.push({ kind: 'hr' }); continue }
    const heading = line.match(/^(#{3,5})\s+(.*)/)
    if (heading) {
      flushPara(); flushList()
      blocks.push({ kind: 'h', level: heading[1].length as 3 | 4 | 5, text: heading[2] })
      continue
    }
    const bullet = line.match(/^-\s+(.*)/)
    const numbered = line.match(/^\d+\.\s+(.*)/)
    if (bullet) {
      flushPara()
      if (!list || list.kind !== 'ul') { flushList(); list = { kind: 'ul', items: [] } }
      list.items.push(bullet[1])
    } else if (numbered) {
      flushPara()
      if (!list || list.kind !== 'ol') { flushList(); list = { kind: 'ol', items: [] } }
      list.items.push(numbered[1])
    } else {
      flushList()
      para.push(line)
    }
  }
  flushPara(); flushList()
  return blocks
}

export function Body({ body, idp }: { body: string; idp: string }) {
  const blocks = parseBody(body)
  return (
    <div className="flex flex-col gap-3 text-sm leading-relaxed text-zinc-700">
      {blocks.map((b, i) => {
        if (b.kind === 'hr') return <hr key={`${idp}-hr${i}`} className="my-2 border-zinc-200" />
        if (b.kind === 'h') {
          const Tag = (`h${b.level}` as 'h3' | 'h4' | 'h5')
          const cls =
            b.level === 3
              ? 'mt-3 text-base font-semibold text-zinc-900'
              : b.level === 4
                ? 'mt-2 text-[0.95rem] font-semibold text-zinc-900'
                : 'mt-1 text-sm font-semibold text-zinc-700'
          return (
            <Tag key={`${idp}-h${i}`} id={slug(b.text)} className={`scroll-mt-6 ${cls}`}>
              {renderInline(b.text, `${idp}-h${i}`)}
            </Tag>
          )
        }
        if (b.kind === 'p') return <p key={`${idp}-p${i}`}>{renderInline(b.text, `${idp}-p${i}`)}</p>
        const cls = b.kind === 'ul' ? 'list-disc' : 'list-decimal'
        const Tag = b.kind === 'ul' ? 'ul' : 'ol'
        return (
          <Tag key={`${idp}-l${i}`} className={`${cls} space-y-1 pl-5`}>
            {b.items.map((it, j) => <li key={`${idp}-l${i}-${j}`}>{renderInline(it, `${idp}-l${i}-${j}`)}</li>)}
          </Tag>
        )
      })}
    </div>
  )
}
