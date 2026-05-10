export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-20 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-white/40">Last updated: January 1, 2025</p>
        </div>

        <div className="flex flex-col gap-6 text-base text-white/70 leading-relaxed">
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">1. Introduction</h2>
            <p>
              Fractera (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you use our platform. Please read this policy carefully.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">2. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, such as your email address
              when you create an account or contact us. We also collect certain information
              automatically, including log data, device information, and usage data.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">3. How We Use Your Information</h2>
            <p>
              We use the information we collect to provide, maintain, and improve our services,
              process transactions, send you technical notices and support messages, and respond
              to your comments and questions.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">4. Data Storage and Security</h2>
            <p>
              Your data is stored on servers located in the European Union. We implement
              appropriate technical and organizational measures to protect your personal information
              against accidental or unlawful destruction, loss, alteration, or unauthorized access.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">5. Your Rights (GDPR)</h2>
            <p>
              If you are located in the European Economic Area, you have the right to access,
              correct, or delete your personal data, as well as the right to data portability
              and the right to object to processing. To exercise these rights, please contact us
              at <a href="mailto:privacy@fractera.ai" className="text-white underline hover:no-underline">privacy@fractera.ai</a>.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">6. Third-Party Services</h2>
            <p>
              We use third-party services including Stripe for payment processing and Cloudflare
              for infrastructure. These services have their own privacy policies governing
              the use of your information.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">7. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@fractera.ai" className="text-white underline hover:no-underline">privacy@fractera.ai</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
