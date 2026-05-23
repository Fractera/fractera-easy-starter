import type { LightContent } from '@/lib/i18n/types'

export function LightDeploy({ content }: { content: LightContent }) {
  const { deploy } = content
  return (
    <section id="deploy" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-serif font-bold text-slate-900 text-2xl md:text-3xl">{deploy.h2}</h2>
        <p className="text-base text-slate-600 max-w-3xl">{deploy.description}</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-mono font-bold text-sky-700 uppercase tracking-widest">
            {deploy.providerLabel}
          </p>
          <div className="flex flex-col gap-2">
            {deploy.providers.map((p) => (
              <div
                key={p.name}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-base font-bold text-slate-900">{p.name}</span>
                  <span className="text-xs text-slate-600">{p.tagline}</span>
                </div>
                <span className="shrink-0 text-sm font-semibold text-sky-700">{p.price}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
          <button
            type="button"
            disabled
            className="self-start bg-sky-600/50 text-white font-bold px-6 py-3 rounded-xl text-base cursor-not-allowed"
          >
            {deploy.cta}
          </button>
          <p className="text-xs text-slate-500 italic">{deploy.ctaHint}</p>
        </div>
      </div>
    </section>
  )
}
