import { HeroSection } from '@/components/hero-section'
import { StepsCarousel } from '@/components/steps-carousel'

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-20 flex flex-col gap-20">
        <HeroSection />

        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-semibold text-gray-300">How to get started</h2>
          <StepsCarousel />
        </section>

        <p className="text-sm text-gray-700 text-center">
          Fractera is open source. fractera.ai handles subdomain registration only.
        </p>
      </div>
    </main>
  )
}
