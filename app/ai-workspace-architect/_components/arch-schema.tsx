import { ARCHITECTURE_TREE, type ArchNode } from '@/lib/architect-page/tree'

// Static, fully-expanded reproduction of the product's /ai-core schema. No
// interactivity: every node is rendered open (no [+] toggles), texts come from
// lib/architect-page/tree.ts. Two columns — the tree (always visible) and the
// detail list (hidden on phones, but kept in the DOM so AI scanners read it).

const INDENT = 16

function TreeRows({ node, depth }: { node: ArchNode; depth: number }) {
  return (
    <>
      <div
        className="flex items-center gap-2 py-0.5 text-[13px] leading-snug"
        style={{ paddingLeft: depth * INDENT }}
      >
        <span aria-hidden className="text-zinc-400">
          {node.children && node.children.length ? '▸' : '·'}
        </span>
        <span className={node.children?.length ? 'font-medium text-zinc-900' : 'text-zinc-700'}>
          {node.label}
        </span>
        {node.port && (
          <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] text-zinc-500">
            {node.port}
          </span>
        )}
      </div>
      {node.children?.map(child => (
        <TreeRows key={child.id} node={child} depth={depth + 1} />
      ))}
    </>
  )
}

function flatten(node: ArchNode, depth: number, out: { node: ArchNode; depth: number }[]) {
  out.push({ node, depth })
  node.children?.forEach(c => flatten(c, depth + 1, out))
  return out
}

export function ArchSchema() {
  const rows = flatten(ARCHITECTURE_TREE, 0, [])

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-[680px] overflow-hidden rounded-xl border border-zinc-200">
        {/* Left — the tree, fully expanded, always visible */}
        <div className="w-full border-zinc-200 bg-zinc-50/60 p-3 md:w-1/2 md:border-r">
          <TreeRows node={ARCHITECTURE_TREE} depth={0} />
        </div>
        {/* Right — every node's name + description. Hidden on phones (display:none
            keeps it in the DOM for crawlers); the requirement is to drop the right
            column on mobile only. */}
        <div className="hidden w-1/2 p-3 md:block">
          <dl className="flex flex-col gap-3">
            {rows.map(({ node, depth }) => (
              <div key={node.id} style={{ paddingLeft: Math.min(depth, 3) * 8 }}>
                <dt className="flex items-center gap-2 text-[13px] font-semibold text-zinc-900">
                  {node.name ?? node.label}
                  {node.port && (
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] text-zinc-500">
                      {node.port}
                    </span>
                  )}
                </dt>
                {node.description && (
                  <dd className="text-[12px] leading-relaxed text-zinc-600">{node.description}</dd>
                )}
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
