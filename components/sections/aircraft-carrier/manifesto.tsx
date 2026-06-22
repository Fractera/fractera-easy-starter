'use client'

import { useHeroContent } from '@/lib/i18n/context'

// Founder's manifesto card ("Есть мнение, что это самый большой Next.js-стартер…"),
// extracted from the former monolithic AircraftCarrier section — SAME design
// (always-on pulsing violet shimmer border, signed, inline MCP link). Used as a
// standalone section on /framework/fractera-pro, placed directly BELOW the founder
// (Roma Armstrong) quote. Reads from useHeroContent().aircraftCarrier (needs
// ContentProvider).
export function AircraftCarrierManifesto() {
  const t = useHeroContent().aircraftCarrier
  return (
    <div
      className="rounded-2xl bg-violet-500/[0.04] px-6 py-7 md:px-8 md:py-9 flex flex-col gap-4"
      style={{ animation: 'shimmerBorder 3s ease-in-out infinite', border: '1px solid rgba(139,92,246,0.7)' }}
    >
      {t.manifesto.body.map((para, i) => (
        <p key={i} className="text-sm md:text-base text-white/85 leading-relaxed">
          {para}
        </p>
      ))}
      <p className="text-sm md:text-base text-white/85 leading-relaxed">
        {t.manifesto.mcpLine.pre}
        <a href="#mcp-section" className="font-medium text-violet-300 underline hover:text-violet-200 transition-colors">
          {t.manifesto.mcpLine.link}
        </a>
        {t.manifesto.mcpLine.post}
      </p>
      <p className="text-sm font-medium italic text-violet-200/80 leading-snug pt-1">
        {t.manifesto.signature}
      </p>
    </div>
  )
}
