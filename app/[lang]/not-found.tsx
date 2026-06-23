import { NotFoundContent } from '@/components/not-found-content'

// 404 for the localized surface (step 132). proxy.ts rewrites every unmatched path
// under /<lang>/, so this is where real 404 traffic lands — it renders inside the
// [lang] layout (which owns <html lang>), restoring the branded 404 lost when the
// root layout was made bare in step 130.
export default function LangNotFound() {
  return <NotFoundContent />
}
