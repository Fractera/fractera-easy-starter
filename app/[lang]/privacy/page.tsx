export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: _lang } = await params

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-20 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-white/40">Last updated: May 19, 2026</p>
        </div>

        <div className="flex flex-col gap-6 text-base text-white/70 leading-relaxed">

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">1. Introduction</h2>
            <p>
              Fractera, Inc. (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), a Delaware corporation,
              is committed to protecting your privacy. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you use our platform.
              Please read this policy carefully.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">2. Information We Collect</h2>
            <p>We collect the following categories of personal information:</p>
            <ul className="list-disc pl-5 flex flex-col gap-2">
              <li><strong className="text-white">Account data:</strong> email address, name, and authentication credentials when you create an account.</li>
              <li><strong className="text-white">Payment data:</strong> billing details processed by Stripe or other payment providers. We do not store full card numbers.</li>
              <li><strong className="text-white">Usage data:</strong> log data, IP address, device type, browser, pages visited, and feature usage.</li>
              <li><strong className="text-white">Server data:</strong> IP address and credentials of servers you provision through our platform (stored encrypted).</li>
              <li><strong className="text-white">Communications:</strong> messages you send to our support team.</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 flex flex-col gap-2">
              <li>Provide, operate, and improve our services.</li>
              <li>Process payments and manage subscriptions.</li>
              <li>Send transactional emails (account creation, billing receipts, password reset).</li>
              <li>Respond to support requests.</li>
              <li>Detect and prevent fraud or security incidents.</li>
              <li>Comply with legal obligations.</li>
            </ul>
            <p>We do not sell your personal data to third parties.</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">4. Data Storage and Security</h2>
            <p>
              Your account and subscription data is stored on servers located in the European Union
              (Neon managed PostgreSQL, EU region). We implement industry-standard technical and
              organizational measures including encryption at rest and in transit, access controls,
              and regular security reviews. Despite these measures, no system is completely secure.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">5. Data Sharing and Third-Party Services</h2>
            <p>We share your information only with the following categories of service providers:</p>
            <ul className="list-disc pl-5 flex flex-col gap-2">
              <li><strong className="text-white">Stripe</strong> — payment processing. <a href="https://stripe.com/privacy" className="text-white/60 underline hover:text-white" target="_blank" rel="noopener">Stripe Privacy Policy</a></li>
              <li><strong className="text-white">Cloudflare</strong> — DNS, CDN, and DDoS protection.</li>
              <li><strong className="text-white">Resend</strong> — transactional email delivery.</li>
              <li><strong className="text-white">Upstash</strong> — session caching (Redis).</li>
            </ul>
            <p>
              We may also disclose your information if required by law, court order, or to protect
              the rights and safety of Fractera, Inc. or others.
            </p>
          </section>

          {/* GDPR */}
          <section className="flex flex-col gap-3 border border-white/10 rounded-lg p-5">
            <h2 className="text-lg font-semibold text-white">6. EU / EEA Residents — GDPR Rights</h2>
            <p>
              If you are located in the European Union or European Economic Area, you have the
              following rights under the General Data Protection Regulation (GDPR):
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-2">
              <li><strong className="text-white">Access:</strong> request a copy of the personal data we hold about you.</li>
              <li><strong className="text-white">Rectification:</strong> request correction of inaccurate data.</li>
              <li><strong className="text-white">Erasure:</strong> request deletion of your data (&quot;right to be forgotten&quot;).</li>
              <li><strong className="text-white">Portability:</strong> receive your data in a machine-readable format.</li>
              <li><strong className="text-white">Object / Restrict:</strong> object to or restrict certain processing.</li>
            </ul>
            <p>
              Our legal basis for processing is performance of a contract (subscription services)
              and legitimate interests (security, fraud prevention). To exercise your rights,
              contact{' '}
              <a href="mailto:privacy@fractera.ai" className="text-white underline hover:no-underline">
                privacy@fractera.ai
              </a>.
              We will respond within 30 days.
            </p>
          </section>

          {/* CCPA */}
          <section className="flex flex-col gap-3 border border-white/10 rounded-lg p-5">
            <h2 className="text-lg font-semibold text-white">7. California Residents — CCPA Rights</h2>
            <p>
              If you are a California resident, the California Consumer Privacy Act (CCPA) grants
              you the following rights:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-2">
              <li><strong className="text-white">Know:</strong> request disclosure of what personal information we collect, use, disclose, and sell.</li>
              <li><strong className="text-white">Delete:</strong> request deletion of personal information we have collected from you.</li>
              <li><strong className="text-white">Opt-Out of Sale:</strong> we do not sell personal information. No opt-out is necessary.</li>
              <li><strong className="text-white">Non-Discrimination:</strong> we will not discriminate against you for exercising your CCPA rights.</li>
            </ul>
            <p>
              To submit a CCPA request, contact us at{' '}
              <a href="mailto:privacy@fractera.ai" className="text-white underline hover:no-underline">
                privacy@fractera.ai
              </a>{' '}
              or by mail at the address below. We will verify your identity before processing your request.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">8. Data Retention</h2>
            <p>
              We retain your personal data for as long as your account is active and for a
              reasonable period thereafter to comply with legal obligations, resolve disputes,
              and enforce our agreements. You may request deletion of your account and associated
              data at any time.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">9. Cookies</h2>
            <p>
              We use cookies and similar tracking technologies. Please see our{' '}
              <a href="./cookies" className="text-white underline hover:no-underline">Cookie Policy</a>{' '}
              for details.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material
              changes by email or by posting a notice on our platform. Continued use of the service
              after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">11. Contact</h2>
            <p>
              Fractera, Inc.<br />
              Incorporated in Delaware, United States<br />
              EIN: 35-2937218
            </p>
            <p>
              Privacy inquiries:{' '}
              <a href="mailto:privacy@fractera.ai" className="text-white underline hover:no-underline">
                privacy@fractera.ai
              </a>
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
