# Stripe Redirect — Test Scenarios

Тестируем URL: `https://www.fractera.ai/?payment=success&stripe_session_id=<ID>`

Перед каждым тестом: попросить AI обновить `stripeCheckoutSessionId` и `status` в нужной записи `ServerToken` для `bolshiyanov@gmail.com`.

---

## Сценарии

| # | Название | status в DB | Ожидаемый результат |
|---|----------|-------------|---------------------|
| 1 | **Active** | `active` + subdomain | Сразу открывается дашборд, URL чистится до `/` |
| 2 | **Pending** | `pending` + deploySessionId | Сразу открывается дашборд (показывает прогресс) |
| 3 | **Provisioning** | `provisioning` + deploySessionId | Сразу открывается дашборд (прогресс-бар) |
| 4 | **Queued** | `queued`, без IP | Сразу открывается дашборд (ожидание назначения) |
| 5 | **Error SSH** | `error` + deployError SSH timeout | Сразу открывается дашборд (показывает ошибку) |
| 6 | **Error VPS** | `error` + deployError Contabo API | Сразу открывается дашборд (ошибка без IP) |
| 7 | **Recovery** | `pending` после ошибки, новый deploySessionId | Дашборд показывает новый деплой |
| 8 | **Offline** | `offline` | Спиннер "Connecting..." → таймаут → сообщение на email (offline исключён из запроса) |
| 9 | **Unknown** | нет записи с таким session_id | Спиннер "Connecting..." 60с → сообщение на email |
| 10 | **Active full** | `active` + subdomain с реальными ссылками | Дашборд открывается, ссылки кликабельны |
| 11 | **Bootstrap error** | `error` + deployError на шаге bootstrap | Дашборд показывает текст ошибки |

| 12 | **Подписка есть, сервер в ошибке** | `error` | Дашборд → оранжевая карточка + ссылка "Написать в поддержку" |
| 13 | **Подписка есть, pending без subdomain (isStale)** | `pending` + нет subdomain + 1 попытка | Дашборд → "Установка не завершена" + Remove + "Написать в поддержку" |
| 14 | **Admin redeploy → пользователь видит прогресс** | admin запускает redeploy → `pending` + `isRedeploy=true` | Дашборд → синяя плашка "Устраняем проблему" + прогресс-бар |
| 15 | **Успешный redeploy → email** | После redeploy bootstrap завершается → ping → `active` | Пользователь получает welcome email, дашборд показывает ссылки |

---

## Как запускать тест

1. Сказать AI: `"Установи для bolshiyanov@gmail.com статус <STATUS> и stripeCheckoutSessionId=cs_test_scenario_X"`
2. Открыть URL в браузере залогиненным как `bolshiyanov@gmail.com`
3. Проверить поведение из колонки «Ожидаемый результат»
4. Обновить страницу (F5) — поведение должно быть таким же (нет цикла)

---

## Базовый URL для тестов

```
https://www.fractera.ai/?payment=success&stripe_session_id=cs_test_scenario_X
```

Замени `X` на имя сценария из таблицы выше (например `active`, `error_ssh`, `offline`).
