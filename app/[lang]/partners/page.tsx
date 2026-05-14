export default async function PartnersPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: _lang } = await params

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-20 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight">Partner Program</h1>
          <p className="text-base text-white/50">
            Launch your own white-label Fractera platform. Keep 100% of all revenue.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="border border-white/10 rounded-2xl p-8 flex flex-col gap-4">
            <h2 className="text-xl font-bold">What you get</h2>
            <ul className="flex flex-col gap-2 text-white/70">
              <li className="flex gap-3"><span className="text-white">→</span> Full white-label deployment of Fractera on your infrastructure</li>
              <li className="flex gap-3"><span className="text-white">→</span> 100% of subscription revenue goes to you</li>
              <li className="flex gap-3"><span className="text-white">→</span> 100% of White Label purchase revenue goes to you</li>
              <li className="flex gap-3"><span className="text-white">→</span> You set your own pricing</li>
            </ul>
          </div>

          <div className="border border-white/10 rounded-2xl p-8 flex flex-col gap-4">
            <h2 className="text-xl font-bold">How to apply</h2>
            <ol className="flex flex-col gap-2 text-white/70 list-decimal list-inside">
              <li>Publish an article about Fractera on your platform</li>
              <li>
                Email{' '}
                <a href="mailto:admin@fractera.ai" className="text-white underline hover:no-underline">
                  admin@fractera.ai
                </a>{' '}
                with the link
              </li>
              <li>One-time deployment fee: <span className="text-white font-semibold">$500</span></li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  )
}
