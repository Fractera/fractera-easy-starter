// The project that lands in the app slot (:3000).
//
// (step 500) There is no longer a CHOICE. Every deployment clones the same
// starter — fractera-next-starter (FNS) — and nothing else is supported. The
// former catalog of 30+ "frameworks", their marketing pages, the header
// dropdown and the install-form selector are gone: they promised support we do
// not provide, which is exactly the misunderstanding this step removes.
//
// The deploy pipeline is untouched: lib/deploy.ts still takes `framework` and
// `repoUrl`, and still bakes FRACTERA_APP_FRAMEWORK / the slot repo into the
// server env. Both values are now constants resolved here.

export const SLOT_REPO_URL = 'https://github.com/Fractera/fractera-next-starter.git'

// Kept as the single id passed down to deploy.ts and bootstrap, so the shape of
// the deploy call stays byte-identical to the pre-step-500 default path.
export const SLOT_FRAMEWORK_ID = 'next'

// Always the same repo — the argument exists only so the two install routes read
// the same way they did before.
export function resolveSlotRepoUrl(): string {
  return SLOT_REPO_URL
}
