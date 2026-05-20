import { db } from '@/lib/db'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function PartnerMirrorPage({
  params,
}: {
  params: Promise<{ slug: string; rest?: string[] }>
}) {
  const { slug, rest = [] } = await params

  const partner = await db.partner.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      status: true,
      links: {
        where: { isDefault: true },
        select: { providerName: true, affiliateUrl: true },
        take: 1,
      },
    },
  })

  if (!partner || partner.status !== 'active') {
    notFound()
  }

  const defaultLink = partner.links[0] ?? null
  const pathLabel = rest.length > 0 ? '/' + rest.join('/') : '/'

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-2xl flex flex-col gap-6 text-center">
        <span className="self-center text-xs font-mono font-bold text-violet-400 uppercase tracking-widest border border-violet-500/30 bg-violet-500/[0.06] px-3 py-1 rounded-full">
          Partner mirror · placeholder
        </span>
        <h1 className="text-3xl md:text-4xl font-bold font-serif leading-tight">
          Welcome — <span className="text-violet-300 font-mono">{partner.slug}</span>
        </h1>
        <p className="text-base text-white/65 leading-relaxed">
          This is the personal mirror page for partner{' '}
          <strong className="text-white font-mono">{partner.slug}</strong>. The infra is live:
          DNS, certificates and host-based routing all work. Full mirrored content with
          affiliate-link substitution lands in the next development step.
        </p>

        {defaultLink && (
          <div className="flex flex-col gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-5 text-left">
            <p className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-widest">Configured default link</p>
            <p className="text-sm text-white">
              <strong>{defaultLink.providerName}</strong> →{' '}
              <a
                href={defaultLink.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-300 hover:text-emerald-200 font-mono break-all"
              >
                {defaultLink.affiliateUrl}
              </a>
            </p>
          </div>
        )}

        {!defaultLink && (
          <div className="flex flex-col gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-5">
            <p className="text-xs font-mono font-bold text-amber-300 uppercase tracking-widest">No affiliate link yet</p>
            <p className="text-sm text-white/75 leading-relaxed">
              Partner has not configured a default affiliate link in the Dashboard yet.
            </p>
          </div>
        )}

        <p className="text-xs text-white/30 font-mono">request path: {pathLabel}</p>

        <a
          href="https://fractera.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="self-center mt-2 inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
        >
          Visit Fractera.ai ↗
        </a>
      </div>
    </main>
  )
}
