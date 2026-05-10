export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-20 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-sm text-white/40">Last updated: January 1, 2025</p>
        </div>

        <div className="flex flex-col gap-6 text-base text-white/70 leading-relaxed">
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Fractera, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">2. Description of Service</h2>
            <p>
              Fractera provides a platform for deploying and managing AI coding environments
              on your own server infrastructure. We facilitate subdomain registration and
              server setup, but you retain full ownership and control of your server.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">3. Account Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activities that occur under your account. You agree to notify us
              immediately of any unauthorized use of your account.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">4. Subscriptions and Payments</h2>
            <p>
              Some features of Fractera require a paid subscription. By subscribing, you agree
              to pay the fees set out at the time of purchase. Subscriptions are billed in advance
              on a monthly or annual basis and are non-refundable except as required by law.
              Payments are processed by Stripe.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">5. Acceptable Use</h2>
            <p>
              You agree not to use Fractera to violate any applicable laws, infringe intellectual
              property rights, transmit harmful or unlawful content, or interfere with the
              proper functioning of our services or servers.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">6. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Fractera shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages arising from
              your use of the service, including but not limited to loss of data or service
              interruptions.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">7. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account at any time for
              violations of these terms. You may terminate your account at any time by
              contacting us.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">8. Contact</h2>
            <p>
              For questions regarding these Terms of Service, contact us at{' '}
              <a href="mailto:legal@fractera.ai" className="text-white underline hover:no-underline">legal@fractera.ai</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
