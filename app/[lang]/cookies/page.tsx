const COOKIES_CONTENT: Record<string, {
  title: string; updated: string
  s1: { title: string; p1: string }
  s2: {
    title: string
    essential: { title: string; p1: string }
    functional: { title: string; p1: string }
    analytics: { title: string; p1: string }
  }
  s3: { title: string; p1: string }
  s4: { title: string; p1: string }
  s5: { title: string; p1: string; email: string }
}> = {
  ru: {
    title: 'Политика куки',
    updated: 'Последнее обновление: 1 января 2025 г.',
    s1: {
      title: '1. Что такое куки',
      p1: 'Куки — это небольшие текстовые файлы, сохраняемые на вашем устройстве при посещении сайта. Они помогают сайтам запоминать ваши предпочтения и улучшать ваш опыт. Fractera использует куки и аналогичные технологии отслеживания для работы и улучшения наших сервисов.',
    },
    s2: {
      title: '2. Типы используемых куки',
      essential: {
        title: 'Обязательные куки',
        p1: 'Эти куки необходимы для работы сайта. Они включают сессионные куки для аутентификации и безопасности. Отказаться от обязательных куки невозможно.',
      },
      functional: {
        title: 'Функциональные куки',
        p1: 'Эти куки запоминают ваши предпочтения (например, выбранный тариф или язык), чтобы обеспечить более персонализированный опыт.',
      },
      analytics: {
        title: 'Аналитические куки',
        p1: 'Мы можем использовать аналитические куки, чтобы понять, как пользователи взаимодействуют с нашей платформой. Эта информация помогает нам улучшать наши сервисы.',
      },
    },
    s3: {
      title: '3. Куки третьих сторон',
      p1: 'Некоторые куки устанавливаются сторонними сервисами, присутствующими на наших страницах, включая Stripe (обработка платежей) и провайдеров аутентификации. Эти куки регулируются соответствующими политиками конфиденциальности третьих сторон.',
    },
    s4: {
      title: '4. Управление куки',
      p1: 'Вы можете управлять куки через настройки браузера. Обратите внимание, что отключение некоторых куки может повлиять на функциональность наших сервисов. Вы также можете в любое время изменить настройки куки, нажав «Настройки куки» в подвале любой страницы.',
    },
    s5: {
      title: '5. Контакт',
      p1: 'Если у вас есть вопросы об использовании нами куки, свяжитесь с нами по адресу',
      email: 'privacy@fractera.ai',
    },
  },
  en: {
    title: 'Cookie Policy',
    updated: 'Last updated: January 1, 2025',
    s1: {
      title: '1. What Are Cookies',
      p1: 'Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and improve your experience. Fractera uses cookies and similar tracking technologies to operate and improve our services.',
    },
    s2: {
      title: '2. Types of Cookies We Use',
      essential: {
        title: 'Essential Cookies',
        p1: 'These cookies are necessary for the website to function. They include session cookies for authentication and security. You cannot opt out of essential cookies.',
      },
      functional: {
        title: 'Functional Cookies',
        p1: 'These cookies remember your preferences (such as your selected plan or language) to provide a more personalized experience.',
      },
      analytics: {
        title: 'Analytics Cookies',
        p1: 'We may use analytics cookies to understand how visitors interact with our platform. This information helps us improve our services.',
      },
    },
    s3: {
      title: '3. Third-Party Cookies',
      p1: 'Some cookies are placed by third-party services that appear on our pages, including Stripe (payment processing) and authentication providers. These cookies are governed by the respective third-party privacy policies.',
    },
    s4: {
      title: '4. Managing Cookies',
      p1: 'You can control and manage cookies through your browser settings. Note that disabling certain cookies may affect the functionality of our services. You can also manage your cookie preferences at any time by clicking "Cookie Settings" in the footer of any page.',
    },
    s5: {
      title: '5. Contact',
      p1: 'If you have questions about our use of cookies, please contact us at',
      email: 'privacy@fractera.ai',
    },
  },
}

export default async function CookiesPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const t = COOKIES_CONTENT[lang] ?? COOKIES_CONTENT.en

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-20 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-sm text-white/40">{t.updated}</p>
        </div>

        <div className="flex flex-col gap-6 text-base text-white/70 leading-relaxed">
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">{t.s1.title}</h2>
            <p>{t.s1.p1}</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">{t.s2.title}</h2>
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-base font-semibold text-white mb-1">{t.s2.essential.title}</h3>
                <p>{t.s2.essential.p1}</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-1">{t.s2.functional.title}</h3>
                <p>{t.s2.functional.p1}</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-1">{t.s2.analytics.title}</h3>
                <p>{t.s2.analytics.p1}</p>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">{t.s3.title}</h2>
            <p>{t.s3.p1}</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">{t.s4.title}</h2>
            <p>{t.s4.p1}</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">{t.s5.title}</h2>
            <p>
              {t.s5.p1}{' '}
              <a href={`mailto:${t.s5.email}`} className="text-white underline hover:no-underline">
                {t.s5.email}
              </a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
