export default async function BlogPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Fractera', item: 'https://www.fractera.ai/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `https://www.fractera.ai/${lang}/blog` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <main className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-20 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
          <p className="text-base text-white/50">Articles, guides, and updates from the Fractera team.</p>
        </div>

        <div className="border border-white/10 rounded-2xl p-12 text-center flex flex-col gap-3">
          <p className="text-white/40 text-base">Coming soon</p>
          <p className="text-white/20 text-sm">The first articles are on their way.</p>
        </div>
      </div>
    </main>
    </>
  )
}
