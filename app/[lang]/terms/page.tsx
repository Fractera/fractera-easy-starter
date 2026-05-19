export default async function TermsPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: _lang } = await params

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-20 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-sm text-white/40">Last updated: May 19, 2026</p>
        </div>

        <div className="flex flex-col gap-6 text-base text-white/70 leading-relaxed">

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Fractera, you agree to be bound by these Terms of Service
              (&quot;Terms&quot;) and our{' '}
              <a href="./privacy" className="text-white underline hover:no-underline">Privacy Policy</a>.
              If you do not agree to these Terms, please do not use our services.
              These Terms constitute a binding legal agreement between you and Fractera, Inc.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">2. About Fractera, Inc.</h2>
            <p>
              Fractera, Inc. is a corporation incorporated under the laws of the State of Delaware,
              United States (EIN: 35-2937218). We provide a platform for deploying and managing
              AI coding environments on your own server infrastructure.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">3. Description of Service</h2>
            <p>
              Fractera, Inc. provides a platform for deploying and managing AI coding environments
              on your own server infrastructure. We facilitate subdomain registration and server
              setup, but you retain full ownership and control of your server. We are not
              responsible for the content, security, or uptime of servers you provision.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">4. Account Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activities that occur under your account. You agree to notify us
              immediately at{' '}
              <a href="mailto:support@fractera.ai" className="text-white underline hover:no-underline">
                support@fractera.ai
              </a>{' '}
              of any unauthorized use of your account.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">5. Subscriptions and Payments</h2>
            <p>
              Some features of Fractera require a paid subscription. By subscribing, you agree
              to pay the fees set out at the time of purchase. Subscriptions are billed in advance
              on a monthly or annual basis. Most payments are processed by{' '}
              <strong className="text-white">Stripe</strong>; alternative local payment providers
              may be used depending on your country of residence and will be displayed at checkout.
            </p>
            <p>
              Cancellations and refunds are governed by our{' '}
              <a href="./refund" className="text-white underline hover:no-underline">Refund Policy</a>,
              which includes country-specific rights (EU 14-day withdrawal, Brazil 7-day regret,
              UK cancellation rights, and Australian consumer guarantees).
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">6. Acceptable Use</h2>
            <p>You agree not to use Fractera to:</p>
            <ul className="list-disc pl-5 flex flex-col gap-2">
              <li>Violate any applicable local, state, national, or international laws or regulations.</li>
              <li>Infringe intellectual property rights of Fractera, Inc. or third parties.</li>
              <li>Transmit harmful, unlawful, defamatory, or fraudulent content.</li>
              <li>Interfere with the proper functioning of our services or servers.</li>
              <li>Attempt to gain unauthorized access to our systems or other users&apos; accounts.</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">7. Intellectual Property</h2>
            <p>
              The Fractera platform, including its software, design, trademarks, and content,
              is owned by Fractera, Inc. and protected by intellectual property laws. Your
              subscription grants you a limited, non-exclusive, non-transferable license to
              use the platform for your internal business purposes.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Fractera, Inc. shall not be
              liable for any indirect, incidental, special, consequential, or punitive damages
              arising from your use of the service, including but not limited to loss of data,
              revenue, or service interruptions. Our total liability to you for any claim arising
              from these Terms shall not exceed the amount you paid us in the 12 months preceding
              the claim.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">9. Disclaimer of Warranties</h2>
            <p>
              The service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
              express or implied, including but not limited to implied warranties of merchantability,
              fitness for a particular purpose, and non-infringement.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">10. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account at any time for material
              violations of these Terms, with or without notice. You may terminate your account
              at any time by contacting{' '}
              <a href="mailto:support@fractera.ai" className="text-white underline hover:no-underline">
                support@fractera.ai
              </a>.
              Upon termination, your right to use the service ceases immediately.
            </p>
          </section>

          <section className="flex flex-col gap-3 border border-white/10 rounded-lg p-5">
            <h2 className="text-lg font-semibold text-white">11. Governing Law and Dispute Resolution</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of the
              State of <strong className="text-white">Delaware, United States</strong>,
              without regard to its conflict of law principles.
            </p>
            <p>
              Any dispute arising from these Terms shall first be subject to good-faith
              negotiation. If unresolved within 30 days, disputes shall be submitted to
              binding arbitration in Delaware under the rules of the American Arbitration
              Association (AAA), conducted in English.
            </p>
            <p>
              <strong className="text-white">EU / EEA residents:</strong> Nothing in this
              clause limits your rights under mandatory consumer protection laws of your
              country of residence, including your right to bring a claim before your local
              courts or consumer authority.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">12. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of
              material changes by email at least 14 days in advance. Continued use of the
              service after changes take effect constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">13. Contact</h2>
            <p>
              Fractera, Inc.<br />
              Incorporated in Delaware, United States<br />
              EIN: 35-2937218
            </p>
            <p>
              Legal inquiries:{' '}
              <a href="mailto:legal@fractera.ai" className="text-white underline hover:no-underline">
                legal@fractera.ai
              </a>
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
