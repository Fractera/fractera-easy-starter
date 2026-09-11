// Central brand identity, sourced from environment variables so the whole
// content-page stack is white-label / portable: FES today, FNS (and any future
// starter) tomorrow. ONE module reads env; everything else imports these
// constants instead of hardcoding "Fractera" / the domain. This is the pattern
// being perfected here before porting to FNS.
//
// NEXT_PUBLIC_* so the values are inlined into both server and client bundles at
// build time (note: bake-in — changing the brand requires a rebuild, which is
// fine for a static marketing shell). Defaults preserve current FES behavior
// when the env vars are unset, so nothing breaks if they are not configured.

export const BRAND = {
  /** Product/marketing name, e.g. in titles and breadcrumbs. */
  name: process.env.NEXT_PUBLIC_BRAND_NAME?.trim() || 'Fractera',
  /** Legal entity name for structured data (Organization publisher). */
  legalName: process.env.NEXT_PUBLIC_BRAND_LEGAL_NAME?.trim() || 'Fractera, Inc.',
  /** Canonical site origin, no trailing slash. */
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://www.fractera.ai').replace(/\/+$/, ''),
  /** Logo path relative to the site origin. */
  logoPath: process.env.NEXT_PUBLIC_BRAND_LOGO_PATH?.trim() || '/fractera-logo.jpg',
  /**
   * The project's source repository.
   *
   * 🔒 ЗАВЕДЕНО ШАГОМ 187 (2026-09-11) КАК ЕДИНСТВЕННЫЙ ИСТОЧНИК. Адрес был
   * вписан руками в 13 файлов (21 вхождение), и когда репозиторий
   * переименовали — `Agent-…` → `Agentic-…` — ни одно из них не двинулось само.
   * Сегодня старое имя ещё отвечает `301`, то есть НИЧЕГО НЕ СЛОМАНО; но
   * переадресация живёт ровно до того дня, когда кто-нибудь заведёт репозиторий
   * со старым именем — и тогда `bootstrap.sh` клонирует чужой код молча.
   * Новый код берёт адрес отсюда; перевод старых мест — подшаг 187-8.
   */
  repoUrl: 'https://github.com/Fractera/Agentic-Engineering-Infrastructure',
} as const

/** Absolute logo URL (origin + path) for structured data / OpenGraph. */
export const brandLogoUrl = `${BRAND.siteUrl}${BRAND.logoPath}`
