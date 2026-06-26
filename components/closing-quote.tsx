// Closing pull-quote at the bottom of the home feed — an editorial assessment of
// Fractera. Server-rendered (in static HTML). Localized en/ru, English fallback.

const QUOTE: Record<string, string> = {
  en: 'Fractera is an infrastructure breakthrough in its class. It fully answers the need for a local, subscription-independent workspace for AI developers. Its potential as a platform for building applications by agents is ahead of its time — because it gives agents real hands (access to the CLI, the web server, the database) instead of merely asking them to write text in a chat.',
  ru: 'Fractera — инфраструктурный прорыв в своём классе. Она полностью закрывает потребность в локальном, независимом от подписок рабочем пространстве для AI-разработчиков. Её потенциал как платформы для создания приложений силами агентов опережает время — потому что даёт агентам настоящие руки (доступ к CLI, веб-серверу, базе данных), а не просто просит их писать текст в чате.',
}

export function ClosingQuote({ lang }: { lang: string }) {
  const text = QUOTE[lang] ?? QUOTE.en
  return (
    <figure className="w-full rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
      <blockquote className="text-xl md:text-2xl font-medium leading-relaxed text-white/85">
        “{text}”
      </blockquote>
    </figure>
  )
}
