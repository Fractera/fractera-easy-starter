import { Server } from 'lucide-react'
import type { LightContent } from '@/lib/i18n/types'
import { InstallFormLight } from '@/components/install-form-light'

export function LightDeploy({ content }: { content: LightContent }) {
  const { deploy } = content
  return (
    <section id="deploy" className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 items-start text-left md:items-center md:text-center">
        <p className="text-xs font-mono font-bold text-sky-700 uppercase tracking-widest">{deploy.label}</p>
        <h2 className="max-w-3xl font-serif font-bold leading-tight text-slate-900 text-2xl md:text-3xl lg:text-4xl">
          {deploy.h2}
        </h2>
        <p className="max-w-xl text-base text-slate-600">{deploy.description}</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-5 max-w-2xl mx-auto w-full">
        <div className="flex items-start gap-3">
          <Server className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-700 leading-relaxed">{deploy.vpsHint}</p>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <InstallFormLight />
        </div>
      </div>
    </section>
  )
}
