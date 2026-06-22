'use client'

import { useState } from 'react'
import { useHeroContent } from '@/lib/i18n/context'
import { SlotLayoutPreview, type SlotName } from './slot-layout-preview'

// Interactive parallel-routing demo, extracted from the former monolithic
// AircraftCarrier section. A live preview + slot checklist (demo-only — no
// fetch/save); toggling slots animates the layout exactly like the admin
// "Parallel routes · setup" panel (header/footer locked, center cascades). Used as a
// standalone section on /framework/fractera-pro, placed directly above the deploy
// form. Reads its hint from useHeroContent().aircraftCarrier (needs ContentProvider).

const SLOT_LABELS: Record<SlotName, string> = {
  header: 'Header',
  footer: 'Footer',
  promoScreen: 'Promo Screen',
  left: 'Left',
  right: 'Right',
  centerHeader: 'Center Header',
  center: 'Center',
  centerFooter: 'Center Footer',
}

const LOCKED: SlotName[] = ['header', 'footer']
const LIST_ORDER: SlotName[] = ['header', 'promoScreen', 'left', 'right', 'centerHeader', 'center', 'centerFooter', 'footer']

export function AircraftCarrierDemo() {
  const t = useHeroContent().aircraftCarrier
  const [active, setActive] = useState<Set<SlotName>>(new Set(LIST_ORDER))
  const [hovered, setHovered] = useState<SlotName | null>(null)

  const toggle = (slot: SlotName) => {
    if (LOCKED.includes(slot)) return
    setActive(prev => {
      const next = new Set(prev)
      if (slot === 'center') {
        if (next.has('center')) {
          next.delete('center')
          next.delete('centerHeader')
          next.delete('centerFooter')
        } else {
          next.add('center')
          next.add('centerHeader')
          next.add('centerFooter')
        }
      } else if (next.has(slot)) {
        next.delete(slot)
      } else {
        next.add(slot)
      }
      return next
    })
  }

  return (
    <div id="aircraft-carrier" className="w-full max-w-4xl mx-auto flex flex-col gap-4 scroll-mt-24">
      <div className="rounded-2xl border border-white/15 bg-white/[0.02] p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:flex-[3]">
            <SlotLayoutPreview active={active} hovered={hovered} />
          </div>

          <div className="md:flex-1 flex flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/80 mb-2">Active slots</p>
            <div className="border-b border-white/15 mb-3" />
            <div className="flex flex-col gap-1">
              {LIST_ORDER.map(slot => {
                const locked = LOCKED.includes(slot)
                const disabledByCenter = (slot === 'centerHeader' || slot === 'centerFooter') && !active.has('center')
                const dim = locked || disabledByCenter
                return (
                  <label
                    key={slot}
                    className={`flex items-center gap-2 text-sm rounded-md px-2 py-1.5 transition-colors ${dim ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:bg-white/[0.06]'}`}
                    onMouseEnter={() => setHovered(slot)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <input
                      type="checkbox"
                      checked={active.has(slot)}
                      disabled={dim}
                      onChange={() => toggle(slot)}
                      className="accent-violet-500"
                    />
                    <span className="flex flex-col leading-tight flex-1">
                      <span className="text-white/90">{SLOT_LABELS[slot]}</span>
                      {locked && <span className="text-[10px] text-white/45">required</span>}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-xs md:text-sm font-medium text-amber-300/90 leading-snug">
          {t.demoHint}
        </p>
      </div>
    </div>
  )
}
