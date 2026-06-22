import type { ComponentType } from 'react'
import type { SiteContent } from '@/lib/i18n/types'
import { ElonTrillion } from '@/components/sections/elon-trillion'
import { ImportSubstitution } from '@/components/sections/import-substitution'

// Maps the per-language `heroNarrativeVariant` discriminator (set in the locale
// content) to the section component that renders in the hero slot. Replaces the
// former `lang === 'ru' ? <ImportSubstitution /> : <ElonTrillion />` swap in the
// page: the page now reads `content.heroNarrativeVariant` and looks the component
// up here, so adding a new narrative variant for a new market is a data + registry
// change, never a per-language branch in JSX. Each section pulls its own copy from
// the i18n context, so no props flow through here.
// Partial: a variant may map to no component ('none' → nothing renders). The page
// guards with `{HeroNarrative && <HeroNarrative />}`.
export const HERO_NARRATIVE_REGISTRY: Partial<Record<SiteContent['heroNarrativeVariant'], ComponentType>> = {
  'elon-trillion': ElonTrillion,
  'import-substitution': ImportSubstitution,
}
