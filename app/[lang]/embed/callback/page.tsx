export default async function EmbedCallbackPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: langParam } = await params
  const lang: 'en' | 'ru' = langParam === 'ru' ? 'ru' : 'en'

  const t = lang === 'ru' ? {
    title: 'Активация завершена',
    body: 'Ваш Fractera-аккаунт активирован. Вернитесь во вкладку с виджетом — он обновится автоматически в течение нескольких секунд.',
    hint: 'Это окно можно закрыть.',
  } : {
    title: 'Activation complete',
    body: 'Your Fractera account is active. Go back to the tab where the widget is loaded — it will update automatically within a few seconds.',
    hint: 'You can close this window.',
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-md flex flex-col gap-5 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 via-emerald-900/10 to-black/40 p-6">
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 text-2xl leading-none">✓</span>
          <h1 className="text-xl font-bold text-white font-serif">{t.title}</h1>
        </div>
        <p className="text-sm text-white/70 leading-relaxed">{t.body}</p>
        <p className="text-xs text-white/50">{t.hint}</p>
      </div>
    </main>
  )
}
