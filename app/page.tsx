import { Suspense } from 'react'
import { HeroSection } from '@/components/hero-section'

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-20 flex flex-col gap-20">
        <Suspense fallback={null}>
          <HeroSection />
        </Suspense>

        <p className="text-sm text-gray-700 text-center">
          Fractera is open source. fractera.ai handles subdomain registration only.
        </p>
      </div>
    </main>
  )
}
