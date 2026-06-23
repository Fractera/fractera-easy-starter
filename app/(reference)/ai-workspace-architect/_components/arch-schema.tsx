'use client'

import { useMemo, useState } from 'react'
import { ARCHITECTURE_TREE, type ArchNode } from '@/lib/architect-page/tree'

// Interactive reproduction of the product's /ai-core schema: a tree that
// expands/collapses at every level (left), a detail panel (right, hidden on
// phones), and a tag cloud at the bottom that jumps to any layer. Only the first
// two levels are open at launch — but EVERY node is rendered into the HTML
// (collapsed subtrees are display:none, not unmounted) and a screen-reader-only
// block lists every node + description, so crawlers index the whole tree.

const INDENT = 16

type Flat = { node: ArchNode; depth: number; ancestors: string[] }

function flatten(node: ArchNode, depth: number, ancestors: string[], out: Flat[]) {
  out.push({ node, depth, ancestors })
  node.children?.forEach(c => flatten(c, depth + 1, [...ancestors, node.id], out))
  return out
}

export function ArchSchema() {
  const flat = useMemo(() => flatten(ARCHITECTURE_TREE, 0, [], []), [])
  const ancestorsById = useMemo(() => {
    const m = new Map<string, string[]>()
    flat.forEach(f => m.set(f.node.id, f.ancestors))
    return m
  }, [flat])
  // Open the first two levels by default (depth 0 and 1).
  const defaultExpanded = useMemo(
    () => new Set(flat.filter(f => f.depth <= 1).map(f => f.node.id)),
    [flat],
  )
  const tags = useMemo(
    () => flat.filter(f => f.node.id !== ARCHITECTURE_TREE.id && !!f.node.children?.length),
    [flat],
  )

  const [expanded, setExpanded] = useState<Set<string>>(defaultExpanded)
  const [selected, setSelected] = useState<ArchNode>(ARCHITECTURE_TREE)

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  function onRow(node: ArchNode) {
    setSelected(node)
    if (node.children?.length) toggle(node.id)
  }
  function jump(node: ArchNode) {
    const anc = ancestorsById.get(node.id) ?? []
    setExpanded(prev => new Set([...prev, ...anc, node.id]))
    setSelected(node)
    requestAnimationFrame(() =>
      document.getElementById(`arch-node-${node.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    )
  }
  function reset() {
    setExpanded(new Set(defaultExpanded))
    setSelected(ARCHITECTURE_TREE)
    requestAnimationFrame(() =>
      document.getElementById('arch-node-l2')?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    )
  }

  function Rows({ node, depth }: { node: ArchNode; depth: number }) {
    const hasKids = !!node.children?.length
    const isOpen = expanded.has(node.id)
    const isSel = selected.id === node.id
    return (
      <>
        <div id={`arch-node-${node.id}`}>
          <button
            type="button"
            onClick={() => onRow(node)}
            style={{ paddingLeft: depth * INDENT + 8 }}
            className={`flex w-full items-center gap-2 py-0.5 pr-2 text-left text-[13px] leading-snug transition-colors hover:bg-zinc-100 ${
              isSel ? 'bg-zinc-100' : ''
            }`}
          >
            <span aria-hidden className="w-3 shrink-0 text-zinc-400">
              {hasKids ? (isOpen ? '▾' : '▸') : '·'}
            </span>
            <span className={hasKids ? 'font-medium text-zinc-900' : 'text-zinc-700'}>{node.label}</span>
            {node.port && (
              <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] text-zinc-500">{node.port}</span>
            )}
          </button>
        </div>
        {hasKids && (
          <div className={isOpen ? '' : 'hidden'}>
            {node.children!.map(c => (
              <Rows key={c.id} node={c} depth={depth + 1} />
            ))}
          </div>
        )}
      </>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto">
        <div className="flex min-w-[680px] overflow-hidden rounded-xl border border-zinc-200">
          {/* Left — interactive tree, first two levels open */}
          <div className="w-full border-zinc-200 bg-zinc-50/60 py-2 md:w-1/2 md:border-r">
            <Rows node={ARCHITECTURE_TREE} depth={0} />
          </div>
          {/* Right — detail for the selected node. Hidden on phones. */}
          <div className="hidden w-1/2 p-4 md:block">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-zinc-900">{selected.name ?? selected.label}</h3>
              {selected.port && (
                <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] text-zinc-500">{selected.port}</span>
              )}
            </div>
            {selected.description && (
              <p className="mt-2 text-[13px] leading-relaxed text-zinc-600">{selected.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tag cloud — every layer, jumps the tree open to it. Placed at the bottom. */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-100"
        >
          Reset
        </button>
        {tags.map(({ node }) => (
          <button
            key={node.id}
            type="button"
            onClick={() => jump(node)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              selected.id === node.id
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            {node.label}
          </button>
        ))}
      </div>

      {/* SEO — every node name + description in the HTML regardless of expand state. */}
      <div className="sr-only">
        {flat.map(({ node }) => (
          <p key={node.id}>{(node.name ?? node.label)}{node.description ? `: ${node.description}` : ''}</p>
        ))}
      </div>
    </div>
  )
}
