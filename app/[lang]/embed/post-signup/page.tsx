import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function EmbedPostSignupPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ ref?: string }>
}) {
  const { lang: langParam } = await params
  const { ref } = await searchParams
  const lang: 'en' | 'ru' = langParam === 'ru' ? 'ru' : 'en'

  const session = await auth()
  let attributed = false

  if (session?.user?.id && ref) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { referredByPartnerId: true },
    })

    if (user && !user.referredByPartnerId) {
      const partner = await db.partner.findUnique({
        where: { slug: ref },
        select: { id: true, status: true },
      })
      if (partner && partner.status === 'active') {
        await db.user.update({
          where: { id: session.user.id },
          data: { referredByPartnerId: partner.id },
        })
        attributed = true
      }
    }
  }

  const t = lang === 'ru' ? {
    title: session?.user
      ? 'Регистрация завершена'
      : 'Активация продолжается',
    body: session?.user
      ? 'Ваш аккаунт Fractera активирован. Откройте Dashboard на fractera.ai чтобы развернуть сервер или продолжить настройку.'
      : 'Нажмите на ссылку в письме, которое мы отправили — после клика вернётесь сюда и получите подтверждение.',
    cta: 'Открыть Dashboard',
  } : {
    title: session?.user
      ? 'Registration complete'
      : 'Activation pending',
    body: session?.user
      ? 'Your Fractera account is active. Open the Dashboard on fractera.ai to deploy a server or continue setup.'
      : 'Click the link in the email we sent — once you do, you will be brought back here with confirmation.',
    cta: 'Open Dashboard',
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 via-emerald-900/10 to-black/40 p-6">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-xl leading-none">✓</span>
            <h1 className="text-xl font-bold text-white leading-tight">{t.title}</h1>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">{t.body}</p>
          {session?.user && (
            <a
              href="https://fractera.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="self-start mt-2 inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-lg shadow-violet-500/30"
            >
              {t.cta} ↗
            </a>
          )}
        </div>
        {attributed && (
          <p className="text-xs text-violet-400/60 text-center">Referral attributed · {ref}</p>
        )}
        <p className="text-xs text-white/30 text-center">
          <a href="https://fractera.ai" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">Powered by Fractera</a>
        </p>
      </div>
    </main>
  )
}
