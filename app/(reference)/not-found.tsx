import { NotFoundContent } from '@/components/not-found-content'

// 404 for the EN-only root reference zone (step 132). Renders inside the (reference)
// layout's <html lang="en">. Shares the same branded body as the [lang] 404.
export default function ReferenceNotFound() {
  return <NotFoundContent />
}
