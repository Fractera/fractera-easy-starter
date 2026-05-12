import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { HeroSection } from '@/components/hero-section'

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'The same AI platforms — yet Fractera ships faster with fewer tokens. Why?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Regular vibe coding puts all the heavy lifting on the AI: design the architecture, write boilerplate, locate the right component, recall what was decided last session. Fractera eliminates that overhead: production-ready starters ship pre-configured, component highlighting jumps to source with one click, LightRAG keeps your full codebase in AI memory, and cross-platform orchestration means all five coding platforms share context.',
      },
    },
    {
      '@type': 'Question',
      name: 'What server specs do I need?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For full AI-coding workloads, the recommended minimum is 6 cores and 8 GB RAM. Storage depends on your project — 75 GB is a solid baseline. Once active AI development wraps up, you can downgrade to 2 cores / 4 GB RAM, typically costing €1–2 per month.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I switch from the paid plan to free self-hosting later?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — at any time. Keep your code synced to GitHub, export your database and file storage, provision a new server, import your data, point your custom domain to the new server, then cancel your subscription.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I bring my existing project into Fractera and continue AI-assisted development?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Connect your existing GitHub repository to your Fractera workspace and start coding with AI immediately. Depending on your project complexity, some initial migration steps may be needed — Fractera\'s built-in AI assistants can guide you through the process.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I deploy a finished project to Vercel instead of keeping it on my own server?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — once a project is complete and no longer needs active AI-assisted development, you can export it to Vercel. Important: moving to Vercel means leaving the Fractera environment behind. The AI coding workspace, terminal, LightRAG memory, and all five development platforms only run on your own server. A simple finished product is a good candidate; a product you\'re still actively building is not.',
      },
    },
    {
      '@type': 'Question',
      name: 'Pricing and plans — details',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Fractera is open-source — you can self-host at no cost. Fractera Pro adds advanced capabilities on your own server for $20/month or $149/year. The hosted plan includes the server, full Fractera Pro, and everything pre-configured for $25/month or $199/year.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I combine local development with the Fractera production platform?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — and for developers with an existing local setup, this is often the most natural workflow. After setting up your Fractera project, connect it to a GitHub repository and push the initial codebase. Pull the code to your local machine and develop as usual — your IDE, your preferred AI tools, hot reload. When ready to ship, push to GitHub, then return to your Fractera workspace, pull, and deploy. Your changes go live in production in minutes. In effect, your own server becomes a self-hosted alternative to Vercel: GitHub is the bridge between your local environment and production.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you have a referral program?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — we offer a referral program for content creators, bloggers, and anyone interested in building their own branded version of Fractera. Partners receive a complete white-label deployment including the landing page and deployment infrastructure. Deployment is a one-time $500 fee. We are also looking for regional distributors — partners who will drive growth and engagement of the referral program in their region or business niche. For participation inquiries, contact: admin@fractera.ai',
      },
    },
  ],
}

export default async function Home() {
  const session = await auth()
  if (session?.user?.email === 'admin@fractera.ai') {
    redirect('/admin')
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-5xl mx-auto px-6 py-20 flex flex-col gap-20">
          <Suspense fallback={null}>
            <HeroSection />
          </Suspense>

          <p className="text-sm text-white text-center">
            Fractera is open source. fractera.ai handles subdomain registration only.
          </p>
        </div>
      </main>
    </>
  )
}
