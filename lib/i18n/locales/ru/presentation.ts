import type { SiteContent } from '../../types'

type PresentationPart = Pick<SiteContent,
  | 'dpHeader' | 'dpLeft' | 'dpRight'
  | 'platformsHeader' | 'platformCards'
>

export const presentation: PresentationPart = {
  dpHeader: {
    label: 'Production AI Development',
    h2: 'Production-grade RAG-архитектура: интеграция Hermes и LightRAG',
    description:
      'Разработка с ИИ происходит полностью в браузере — с первой секунды. Без VS Code. Без локальной среды. Без базы данных. Без домена. Без CI-pipeline. Вы открываете вкладку: сервер запущен, домен зарегистрирован, база работает, пять кодинг-платформ ждут первой команды. Это не просто инструмент для разработчиков — это момент, когда любой человек с идеей может создать, запустить и масштабировать реальный продукт, не выходя из браузера.',
  },

  dpLeft: {
    imageSrc: '/ai-chat.png',
    title: 'AI-разработка в браузере',
    description: 'Откройте вкладку, скажите что нужно — код появится. Без IDE, без настроек. Пять кодинг-платформ с терминалом — прямо в браузере.',
  },

  dpRight: {
    imageSrc: '/ai-web.png',
    title: 'В продакшн. Мгновенно.',
    description: 'Сервер запускается за секунды. Один клик — изменения в продакшн. Без CI, без настройки хостинга.',
  },

  platformsHeader: {
    label: 'AI Платформы',
    h2: 'Ядро AI-движка: пять агентных платформ, одна среда',
    description: 'Без API-ключей. Без настроек. Все пять платформ — на вашем сервере с терминалом и персистентной памятью LightRAG.',
    disclaimer: '* Проект работает на ваших собственных подписках к AI-платформам — Fractera не взимает никаких дополнительных платежей или комиссий за их использование. Вы вправе подключить одну, несколько или все пять платформ — на своё усмотрение.',
  },

  platformCards: [
    { title: 'Claude Code', subtitle: 'Пишет, запускает и исправляет код в терминале. Золотой стандарт AI-ассистированной разработки.',  company: 'Anthropic' },
    { title: 'Codex',       subtitle: 'Браузерный агент. Полный контекст проекта, без терминала.',                                        company: 'OpenAI'    },
    { title: 'Gemini CLI',  subtitle: 'Агент с длинным контекстом. Понимает всю структуру проекта в одном запросе.',                      company: 'Google'    },
    { title: 'Qwen Code',   subtitle: 'Open-source агент. Без подписки — мощный и бесплатный.',                                           company: 'Alibaba'   },
    { title: 'Kimi Code',   subtitle: 'Модель для больших кодовых баз. Рефакторинг и архитектура.',                                       company: 'Moonshot'  },
    { title: 'LightRAG',    subtitle: 'Мозг компании. Персистентная векторная память для всех пяти кодинг-платформ.',                     company: 'Fractera'  },
  ],
}
