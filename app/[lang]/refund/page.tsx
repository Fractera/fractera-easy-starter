import { LEGAL } from '@/config/legal'

export default async function RefundPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: _lang } = await params

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-20 flex flex-col gap-8">

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Refund Policy</h1>
          <p className="text-sm text-white/40">Last updated: {LEGAL.lastUpdated}</p>
        </div>

        <div className="flex flex-col gap-6 text-base text-white/70 leading-relaxed">

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">1. Overview</h2>
            <p>
              Fractera offers subscription-based access to our AI infrastructure platform.
              This Refund Policy explains your rights regarding cancellations and refunds,
              including additional rights that may apply depending on your country of residence.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">2. Subscription Cancellation</h2>
            <p>
              You may cancel your subscription at any time from your account dashboard or by
              contacting us at{' '}
              <a href="mailto:{LEGAL.emails.support}" className="text-white underline hover:no-underline">
                {LEGAL.emails.support}
              </a>.
              Upon cancellation:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-2">
              <li>Your subscription remains active until the end of the current billing period.</li>
              <li>You will not be charged for subsequent billing cycles.</li>
              <li>Access to paid features ends when the billing period expires.</li>
              <li>Your server and data are not automatically deleted — you remain in control.</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">3. General Refund Policy</h2>
            <p>
              Subscription fees are generally non-refundable for the current billing period once
              the service has been activated. We do not issue partial refunds for unused time
              within an active billing cycle.
            </p>
            <p>
              Exceptions may be granted at our sole discretion in cases of:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-2">
              <li>Documented technical failure on our side that prevented service access for more than 72 hours.</li>
              <li>Duplicate charges caused by a billing error.</li>
              <li>Fraudulent charges — contact us and your payment provider immediately.</li>
            </ul>
            <p>
              To request a refund under an exception, email{' '}
              <a href="mailto:{LEGAL.emails.support}" className="text-white underline hover:no-underline">
                {LEGAL.emails.support}
              </a>{' '}
              within 14 days of the charge with your account email and a description of the issue.
            </p>
          </section>

          {/* EU / EEA */}
          <section className="flex flex-col gap-3 border border-white/10 rounded-lg p-5">
            <h2 className="text-lg font-semibold text-white">
              4. EU / EEA Residents — Right of Withdrawal
            </h2>
            <p>
              If you are located in the European Union or European Economic Area, you have the
              right to withdraw from your subscription within <strong className="text-white">14 days</strong> of
              purchase without giving any reason (cooling-off period under EU Directive 2011/83/EU).
            </p>
            <p>
              <strong className="text-white">Important:</strong> If you explicitly request that
              the service begins immediately upon purchase (e.g., your server is provisioned and
              you access the platform before the 14 days elapse), you acknowledge that you lose
              your right of withdrawal once the service has been fully performed, or you accept
              partial loss of this right proportional to services already delivered.
            </p>
            <p>
              To exercise your right of withdrawal, contact us at{' '}
              <a href="mailto:{LEGAL.emails.support}" className="text-white underline hover:no-underline">
                {LEGAL.emails.support}
              </a>{' '}
              with the subject line <em>"Right of Withdrawal"</em> before the 14-day period expires.
              Refunds will be issued within 14 days of receiving your withdrawal notice.
            </p>
          </section>

          {/* UK */}
          <section className="flex flex-col gap-3 border border-white/10 rounded-lg p-5">
            <h2 className="text-lg font-semibold text-white">5. UK Residents</h2>
            <p>
              Under the Consumer Rights Act 2015 and Consumer Contracts Regulations 2013,
              UK residents have a 14-day cancellation right for digital services purchased online,
              subject to the same conditions regarding early commencement of service described above.
              Contact{' '}
              <a href="mailto:{LEGAL.emails.support}" className="text-white underline hover:no-underline">
                {LEGAL.emails.support}
              </a>{' '}
              to exercise this right.
            </p>
          </section>

          {/* Brazil */}
          <section className="flex flex-col gap-3 border border-white/10 rounded-lg p-5">
            <h2 className="text-lg font-semibold text-white">6. Brazil Residents</h2>
            <p>
              Under the Brazilian Consumer Protection Code (Código de Defesa do Consumidor,
              Art. 49), consumers who purchase online have a <strong className="text-white">7-day</strong> right
              of regret (direito de arrependimento) from the date of purchase or receipt of service.
              You are entitled to a full refund if you exercise this right within the 7-day period.
            </p>
          </section>

          {/* Australia */}
          <section className="flex flex-col gap-3 border border-white/10 rounded-lg p-5">
            <h2 className="text-lg font-semibold text-white">7. Australia Residents</h2>
            <p>
              Under the Australian Consumer Law (ACL), you may be entitled to a refund if the
              service has a major failure, is not fit for purpose, or does not match our description.
              These consumer guarantees cannot be excluded by this policy.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">8. Payment Processors</h2>
            <p>
              Most payments are processed by <strong className="text-white">Stripe</strong>.
              Depending on your country of residence, payments may be processed by an alternative
              local payment provider. The applicable provider will be displayed at checkout.
              Refund processing times depend on your payment provider and may take 5–10 business days
              to appear on your statement.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">9. Contact</h2>
            <p>
              For refund requests or questions about this policy, contact us at{' '}
              <a href="mailto:{LEGAL.emails.support}" className="text-white underline hover:no-underline">
                {LEGAL.emails.support}
              </a>.
              We aim to respond within 2 business days.
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
