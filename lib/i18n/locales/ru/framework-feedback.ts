import type { SiteContent } from '../../types'

type FrameworkFeedbackPart = Pick<SiteContent, 'frameworkFeedback'>

// Russian copy for the framework-expert feedback card + drawer. `{framework}` is
// replaced at render with the page's framework name (e.g. "Next.js").
export const frameworkFeedback: FrameworkFeedbackPart = {
  frameworkFeedback: {
    card: {
      eyebrow: 'Обратная связь по фреймворку',
      title: 'Хорошо знаете {framework}? Поделитесь идеями',
      text: 'Если у вас есть экспертиза в {framework}, расскажите, как бы вы улучшили опыт развёртывания Fractera в связке с {framework}. Несколько слов о себе, ссылка на GitHub и ваше пожелание — этого достаточно.',
      label: 'Поделиться пожеланием',
    },
    drawer: {
      eyebrow: 'Обратная связь по фреймворку',
      title: 'Идеи по развёртыванию Fractera + {framework}',
      subtitle: 'Вы хорошо знаете {framework}? Расскажите о себе и поделитесь пожеланием — что улучшить в связке Fractera и {framework}. Обязателен только email.',
      nameLabel: 'Как вас зовут',
      githubLabel: 'Ссылка на ваш GitHub',
      githubPlaceholder: 'https://github.com/username',
      aboutLabel: 'Несколько слов о себе',
      aboutPlaceholder: 'Ваш опыт с {framework}, чем занимаетесь',
      wishLabel: 'Что вы хотели бы увидеть в проекте (по {framework})',
      wishPlaceholder: 'Ваше пожелание: что улучшить в развёртывании Fractera + {framework}',
      emailLabel: 'Email для связи',
      emailHint: 'Нужен ответ на другой email — выйдите из аккаунта и войдите с нужным.',
      spamLabel: 'Я понимаю, что ответ может попасть в папку «Спам».',
      submit: 'Отправить пожелание',
      submitting: 'Отправляем…',
      sendFailed: 'Не удалось отправить. Попробуйте ещё раз или напишите на admin@fractera.ai.',
      successTitle: 'Пожелание отправлено',
      successBody: 'Спасибо! Мы получили ваше пожелание по {framework} и учтём его при развитии проекта. Проверьте «Спам», если будем отвечать.',
      successClose: 'Понятно',
    },
  },
}
