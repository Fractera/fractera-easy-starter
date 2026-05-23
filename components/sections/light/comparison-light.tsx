import type { LightContent } from '@/lib/i18n/types'

function renderCell(v: boolean | string) {
  if (v === true) return <span className="text-emerald-600 font-bold text-lg">✓</span>
  if (v === false) return <span className="text-slate-300">—</span>
  return <span className="text-xs text-slate-700">{v}</span>
}

export function LightComparison({ content }: { content: LightContent }) {
  const { comparison } = content
  const columns = [comparison.productLabel, ...comparison.competitors]

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 items-start text-left md:items-center md:text-center">
        <p className="text-xs font-mono font-bold text-sky-700 uppercase tracking-widest">{comparison.label}</p>
        <h2 className="max-w-3xl font-serif font-bold leading-tight text-slate-900 text-2xl md:text-3xl lg:text-4xl">
          {comparison.h2}
        </h2>
        <p className="max-w-xl text-base text-slate-600">{comparison.description}</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500" />
              {columns.map((c, i) => (
                <th
                  key={c}
                  className={`text-center px-3 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap ${
                    i === 0 ? 'text-sky-700 bg-sky-50' : 'text-slate-500'
                  }`}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparison.rows.map((row, ri) => (
              <tr key={ri} className="border-b border-slate-100 last:border-b-0">
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{row.feature}</td>
                {row.values.map((v, vi) => (
                  <td key={vi} className={`text-center px-3 py-3 ${vi === 0 ? 'bg-sky-50/50' : ''}`}>
                    {renderCell(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
