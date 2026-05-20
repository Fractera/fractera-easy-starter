import { db } from '@/lib/db'
import { SignupForm } from './signup-form'

export const dynamic = 'force-dynamic'

export default async function EmbedSignupPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ ref?: string }>
}) {
  const { lang: langParam } = await params
  const { ref } = await searchParams
  const lang: 'en' | 'ru' = langParam === 'ru' ? 'ru' : 'en'

  let providerName: string | null = null
  let affiliateUrl: string | null = null
  let slug: string | null = null

  if (ref) {
    const partner = await db.partner.findUnique({
      where: { slug: ref },
      select: {
        slug: true,
        status: true,
        links: { where: { isDefault: true }, select: { providerName: true, affiliateUrl: true }, take: 1 },
      },
    })
    if (partner && partner.status === 'active') {
      slug = partner.slug
      providerName = partner.links[0]?.providerName ?? null
      affiliateUrl = partner.links[0]?.affiliateUrl ?? null
    }
  }

  const t = lang === 'ru' ? {
    title: 'Разверните Fractera AI-инфраструктуру',
    subtitle: 'Полный приватный AI-стек на вашем VPS. Введите email — пришлём ссылку для активации.',
    footer: 'Powered by Fractera',
  } : {
    title: 'Deploy your private AI infrastructure',
    subtitle: 'A full private AI stack on your own VPS. Enter your email — we will send you an activation link.',
    footer: 'Powered by Fractera',
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl md:text-3xl font-bold font-serif text-white leading-tight">{t.title}</h1>
          <p className="text-sm text-white/60 leading-relaxed">{t.subtitle}</p>
        </div>

        <SignupForm
          partnerSlug={slug}
          providerName={providerName}
          affiliateUrl={affiliateUrl}
          lang={lang}
        />

        <p className="text-xs text-white/30 text-center">
          <a href="https://fractera.ai" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">{t.footer}</a>
        </p>
      </div>
    </main>
  )
}
