import type { SiteContent } from '../../types'

type PresentationPart = Pick<SiteContent,
  | 'dpHeader' | 'dpLeft' | 'dpRight'
  | 'platformsHeader' | 'platformCards'
>

export const presentation: PresentationPart = {
  dpHeader: {
    label: 'Production AI Development',
    h2: 'Запуск из браузера. Live — за секунды.',
    description:
      'Production AI Development — следующий уровень разработки. Прямо в браузере, с первой секунды. Без VS Code. Без локальной среды. Без базы данных. Без домена. Без CI-pipeline. Вы открываете вкладку: сервер запущен, домен зарегистрирован, база работает, пять AI-платформ ждут первой команды. Это не инструмент для разработчиков. Это момент, когда любой человек с идеей может создать, запустить и масштабировать реальный продукт — не выходя из браузера.',
  },

  dpLeft: {
    imageSrc: '/ai-chat.png',
    title: 'AI-разработка в браузере',
    description: 'Откройте вкладку, скажите что нужно — код появится. Без IDE, без настроек. Пять AI-платформ с терминалом — прямо в браузере.',
  },

  dpRight: {
    imageSrc: '/ai-web.png',
    title: 'В продакшн. Мгновенно.',
    description: 'Сервер запускается за секунды. Один клик — изменения в продакшн. Без CI, без настройки хостинга.',
  },

  platformsHeader: {
    label: 'AI Платформы',
    h2: 'Пять AI Платформ. Одна среда.',
    description: 'Без API-ключей. Без настроек. Все пять платформ — на вашем сервере с терминалом и постоянной памятью.',
  },

  platformCards: [
    { title: 'Claude Code', subtitle: 'Пишет, запускает и исправляет код в терминале. Золотой стандарт AI-разработки.',    company: 'Anthropic' },
    { title: 'Codex',       subtitle: 'Браузерный AI-агент. Полный контекст проекта, без терминала.',                        company: 'OpenAI'    },
    { title: 'Gemini CLI',  subtitle: 'AI с длинным контекстом. Понимает всю структуру проекта сразу.',                      company: 'Google'    },
    { title: 'Qwen Code',   subtitle: 'Open-source агент. Без подписки — мощный и бесплатный.',                              company: 'Alibaba'   },
    { title: 'Kimi Code',   subtitle: 'AI для больших кодовых баз. Отлично для рефакторинга и архитектуры.',                 company: 'Moonshot'  },
    { title: 'LightRAG',    subtitle: 'Мозг компании. Постоянная векторная память для всех пяти AI-платформ.',               company: 'Fractera'  },
  ],
}
