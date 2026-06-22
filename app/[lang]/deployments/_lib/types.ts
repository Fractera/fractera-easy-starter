// Type contracts for the Deployments tab (contracts/logic → _lib; the localized
// strings themselves are DATA and live in ../_data/{en,ru}.ts). DeploymentsUi is
// the shape of the hub's UI chrome — the index header + the breadcrumb/back labels
// reused by the child target pages.
export type DeploymentsUi = {
  metaTitle: string
  metaDescription: string
  eyebrow: string
  indexTitle: string
  indexIntro: string
  breadcrumb: string
  backToHub: string
}
