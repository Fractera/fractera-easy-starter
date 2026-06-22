// Type contracts for the Framework tab (contracts/logic → _lib; the localized
// strings themselves are DATA and live in ../_data/{en,ru}.ts). FrameworkUi is the
// shape of the catalog's UI chrome — the index header + the breadcrumb/back labels
// reused by the child framework pages. Mirror of the Deployments hub chrome.
export type FrameworkUi = {
  metaTitle: string
  metaDescription: string
  eyebrow: string
  indexTitle: string
  indexIntro: string
  breadcrumb: string
  backToHub: string
}
