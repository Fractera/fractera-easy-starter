export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-20 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Cookie Policy</h1>
          <p className="text-sm text-white/40">Last updated: January 1, 2025</p>
        </div>

        <div className="flex flex-col gap-6 text-base text-white/70 leading-relaxed">
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">1. What Are Cookies</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website.
              They help websites remember your preferences and improve your experience.
              Fractera uses cookies and similar tracking technologies to operate and improve
              our services.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">2. Types of Cookies We Use</h2>
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-base font-semibold text-white mb-1">Essential Cookies</h3>
                <p>
                  These cookies are necessary for the website to function. They include session
                  cookies for authentication and security. You cannot opt out of essential cookies.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-1">Functional Cookies</h3>
                <p>
                  These cookies remember your preferences (such as your selected plan or
                  language) to provide a more personalized experience.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-1">Analytics Cookies</h3>
                <p>
                  We may use analytics cookies to understand how visitors interact with our
                  platform. This information helps us improve our services.
                </p>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">3. Third-Party Cookies</h2>
            <p>
              Some cookies are placed by third-party services that appear on our pages,
              including Stripe (payment processing) and authentication providers.
              These cookies are governed by the respective third-party privacy policies.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">4. Managing Cookies</h2>
            <p>
              You can control and manage cookies through your browser settings. Note that
              disabling certain cookies may affect the functionality of our services.
              You can also manage your cookie preferences at any time by clicking
              &quot;Cookie Settings&quot; in the footer of any page.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">5. Contact</h2>
            <p>
              If you have questions about our use of cookies, please contact us at{' '}
              <a href="mailto:privacy@fractera.ai" className="text-white underline hover:no-underline">privacy@fractera.ai</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
