import { LEGAL } from '@/config/legal'
import { getLegal } from '@/lib/i18n/legal'

export default async function TermsPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const t = getLegal(lang).terms

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-20 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-sm text-white/40">{LEGAL.lastUpdated}</p>
        </div>

        <div className="flex flex-col gap-6 text-base text-white/70 leading-relaxed">

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">{t.s1.title}</h2>
            <p>
              {t.s1.p1.split('Privacy Policy')[0]}
              <a href="./privacy" className="text-white underline hover:no-underline">Privacy Policy</a>
              {t.s1.p1.split('Privacy Policy')[1]}
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">{t.s2.title}</h2>
            <p>{t.s2.p1} (EIN: {LEGAL.ein})</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">{t.s3.title}</h2>
            <p>{t.s3.p1}</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">{t.s4.title}</h2>
            <p>
              {t.s4.p1}{' '}
              <a href={`mailto:${LEGAL.emails.support}`} className="text-white underline hover:no-underline">{LEGAL.emails.support}</a>.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">{t.s5.title}</h2>
            <p>{t.s5.p1}</p>
            <p>
              {t.s5.p2.split('Refund Policy')[0]}
              <a href="./refund" className="text-white underline hover:no-underline">Refund Policy</a>
              {t.s5.p2.split('Refund Policy')[1]}
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">{t.s6.title}</h2>
            <p>{t.s6.intro}</p>
            <ul className="list-disc pl-5 flex flex-col gap-2">
              {t.s6.items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">{t.s7.title}</h2>
            <p>{t.s7.p1}</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">{t.s8.title}</h2>
            <p>{t.s8.p1}</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">{t.s9.title}</h2>
            <p>{t.s9.p1}</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">{t.s10.title}</h2>
            <p>
              {t.s10.p1}{' '}
              <a href={`mailto:${LEGAL.emails.support}`} className="text-white underline hover:no-underline">{LEGAL.emails.support}</a>.
            </p>
          </section>

          <section className="flex flex-col gap-3 border border-white/10 rounded-lg p-5">
            <h2 className="text-lg font-semibold text-white">{t.s11.title}</h2>
            <p>{t.s11.p1}</p>
            <p>{t.s11.p2}</p>
            <p><strong className="text-white">EU / EEA:</strong> {t.s11.p3}</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">{t.s12.title}</h2>
            <p>{t.s12.p1}</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">{t.s13.title}</h2>
            <p>
              {LEGAL.companyName}<br />
              {LEGAL.companyState}, {LEGAL.companyCountry}<br />
              EIN: {LEGAL.ein}
            </p>
            <p>
              <a href={`mailto:${LEGAL.emails.legal}`} className="text-white underline hover:no-underline">{LEGAL.emails.legal}</a>
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
