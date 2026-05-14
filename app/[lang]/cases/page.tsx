export default async function CasesPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: _lang } = await params

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-20 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight">Student Cases</h1>
          <p className="text-base text-white/50">Real projects built by Fractera users — shipped to production.</p>
        </div>

        <div className="border border-white/10 rounded-2xl p-12 text-center flex flex-col gap-3">
          <p className="text-white/40 text-base">Coming soon</p>
          <p className="text-white/20 text-sm">We are collecting the first case studies.</p>
        </div>
      </div>
    </main>
  )
}
