'use client'

import { useState } from 'react'
import { LanguageSwitcher } from '@/components/language-switcher'

type Lang = 'en' | 'ru'
type DocKey = 'privacy' | 'terms' | 'cookies'

export function PartnerPageFooter({
  lang,
  companyName,
  companyEmail,
}: {
  lang: Lang
  companyName: string | null
  companyEmail: string | null
}) {
  const isRu = lang === 'ru'
  const [openDoc, setOpenDoc] = useState<DocKey | null>(null)

  const operator = companyName?.trim() || (isRu ? 'оператор партнёрской программы' : 'the partner program operator')
  const contact = companyEmail?.trim() || null

  const labels = isRu
    ? { privacy: 'Политика конфиденциальности', terms: 'Условия использования', cookies: 'Политика куки', poweredBy: 'Работает на', rights: 'Все права защищены.' }
    : { privacy: 'Privacy Policy', terms: 'Terms of Service', cookies: 'Cookie Policy', poweredBy: 'Powered by', rights: 'All rights reserved.' }

  const docs = buildDocs(lang, operator, contact)

  return (
    <>
      <footer className="border-t border-white/20 bg-black text-white">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-6">

          <div className="flex flex-col gap-1.5">
            <span className="text-lg font-bold tracking-tight">{operator}</span>
            {contact && (
              <a href={`mailto:${contact}`} className="text-sm text-white/50 hover:text-violet-400 transition-colors w-fit">{contact}</a>
            )}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white font-medium">
            <button type="button" onClick={() => setOpenDoc('privacy')} className="hover:text-violet-400 transition-colors text-left">{labels.privacy}</button>
            <button type="button" onClick={() => setOpenDoc('terms')} className="hover:text-violet-400 transition-colors text-left">{labels.terms}</button>
            <button type="button" onClick={() => setOpenDoc('cookies')} className="hover:text-violet-400 transition-colors text-left">{labels.cookies}</button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-white border-t border-white/20 pt-6">
            <span>© {new Date().getFullYear()} {operator}. {labels.rights}</span>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <span className="text-xs text-white/40">
                {labels.poweredBy}{' '}
                <a href={`https://fractera.ai/${lang}`} target="_blank" rel="noopener noreferrer" className="font-mono font-semibold hover:text-violet-400 transition-colors">Fractera</a>
              </span>
            </div>
          </div>

        </div>
      </footer>

      {openDoc && (
        <DocModal
          title={docs[openDoc].title}
          paragraphs={docs[openDoc].paragraphs}
          onClose={() => setOpenDoc(null)}
        />
      )}
    </>
  )
}

function DocModal({ title, paragraphs, onClose }: {
  title: string
  paragraphs: string[]
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg max-h-[80vh] overflow-y-auto bg-neutral-950 border border-white/15 rounded-2xl shadow-2xl p-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-base font-bold leading-none"
        >
          ×
        </button>
        <h2 className="text-xl font-bold text-white font-serif mb-4 pr-8">{title}</h2>
        <div className="flex flex-col gap-3">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-sm text-white/70 leading-relaxed">{p}</p>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Templated legal text. Only the operator name + contact email are substituted;
// the rest is the standard partner-page boilerplate.
function buildDocs(lang: Lang, operator: string, contact: string | null): Record<DocKey, { title: string; paragraphs: string[] }> {
  const contactLine = contact
    ? (lang === 'ru'
        ? `По всем вопросам, связанным с этим документом, обращайтесь: ${contact}.`
        : `For any questions regarding this document, contact: ${contact}.`)
    : (lang === 'ru'
        ? 'По всем вопросам, связанным с этим документом, обращайтесь к оператору этой страницы.'
        : 'For any questions regarding this document, contact the operator of this page.')

  if (lang === 'ru') {
    return {
      privacy: {
        title: 'Политика конфиденциальности',
        paragraphs: [
          `Эта страница управляется ${operator} в рамках партнёрской программы Fractera. При регистрации вы передаёте свой адрес электронной почты, который используется для отправки ссылки активации учётной записи и последующих уведомлений о развёртывании.`,
          'Учётные записи создаются и хранятся на серверах Fractera. ${operator} не получает доступа к вашему паролю и не хранит платёжные данные — оплата хостинга происходит напрямую на стороне выбранного вами VPS-провайдера.'.replace('${operator}', operator),
          'Мы не продаём и не передаём ваши персональные данные третьим лицам, за исключением случаев, предусмотренных законом. Переходы по партнёрским ссылкам могут фиксироваться провайдером хостинга для расчёта вознаграждения.',
          'Вы вправе запросить удаление вашей учётной записи и связанных данных в любой момент.',
          contactLine,
        ],
      },
      terms: {
        title: 'Условия использования',
        paragraphs: [
          `Используя эту страницу, вы соглашаетесь с настоящими условиями. Страница предоставлена ${operator} в рамках партнёрской программы Fractera и носит информационный характер.`,
          'Fractera — open-source платформа, устанавливаемая на ваш собственный VPS. Покупка VPS осуществляется напрямую у выбранного вами хостинг-провайдера; договор оказания услуг хостинга заключается между вами и этим провайдером.',
          `${operator} и Fractera не несут ответственности за доступность, качество или тарифы VPS-провайдеров, а также за любые споры между вами и провайдером.`,
          'Программное обеспечение Fractera предоставляется «как есть», без гарантий. Вы самостоятельно отвечаете за безопасность вашего сервера, включая смену паролей доступа после установки.',
          contactLine,
        ],
      },
      cookies: {
        title: 'Файлы cookie',
        paragraphs: [
          'Эта страница использует минимально необходимый набор файлов cookie. Технические cookie обеспечивают работу сессии и сохранение выбранного языка интерфейса.',
          'При регистрации через эту страницу в вашем браузере сохраняется служебный идентификатор, позволяющий продолжить процесс после подтверждения электронной почты.',
          'Мы не используем рекламные или трекинговые cookie сторонних рекламных сетей на этой странице. Переходы по партнёрским ссылкам обрабатываются на стороне соответствующего хостинг-провайдера согласно его собственной политике.',
          contactLine,
        ],
      },
    }
  }

  return {
    privacy: {
      title: 'Privacy Policy',
      paragraphs: [
        `This page is operated by ${operator} as part of the Fractera Partner Program. When you sign up, you provide your email address, which is used to send an account activation link and subsequent deployment notifications.`,
        `Accounts are created and stored on Fractera servers. ${operator} has no access to your password and does not store payment data — hosting payments happen directly with the VPS provider you choose.`,
        'We do not sell or share your personal data with third parties except as required by law. Clicks on affiliate links may be recorded by the hosting provider for commission calculation.',
        'You may request deletion of your account and associated data at any time.',
        contactLine,
      ],
    },
    terms: {
      title: 'Terms of Service',
      paragraphs: [
        `By using this page you agree to these terms. The page is provided by ${operator} as part of the Fractera Partner Program and is informational in nature.`,
        'Fractera is an open-source platform installed on your own VPS. Purchasing a VPS is done directly with the hosting provider you select; the hosting service contract is between you and that provider.',
        `${operator} and Fractera are not responsible for the availability, quality, or pricing of VPS providers, nor for any dispute between you and a provider.`,
        'The Fractera software is provided "as is", without warranties. You are responsible for the security of your server, including changing access passwords after installation.',
        contactLine,
      ],
    },
    cookies: {
      title: 'Cookie Policy',
      paragraphs: [
        'This page uses the minimal set of cookies required to function. Technical cookies keep your session working and remember your chosen interface language.',
        'When you sign up through this page, a service identifier is stored in your browser so the process can resume after you confirm your email.',
        'We do not use advertising or third-party tracking cookies on this page. Affiliate-link clicks are handled by the respective hosting provider under its own policy.',
        contactLine,
      ],
    },
  }
}
