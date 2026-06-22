// Founder (Roma Armstrong) quotes shown in the founder block on every framework
// page. Each framework page gets a DISTINCT quote, picked by its registry order in
// buildFrameworkData (quotes[order % length]). Bilingual (en + ru) so the EN page
// shows English and the RU page shows the Russian original. This is DATA → it lives
// in _data; _lib/post.ts consumes it. Add a quote = add an entry.
export type FounderQuote = { en: string; ru: string }

export const FRAMEWORK_FOUNDER_QUOTES: FounderQuote[] = [
  {
    ru: 'Недавно услышал от молодёжи выражение «плюсовой человек» — человек, который чаще всего бывает в плюсе. Аналоги: «на кусок хлеба с маслом всегда заработает», «далеко пойдёт, если не остановят», «как за каменной стеной», «выбрось его голого в Африке, а через год он будет встречать тебя у дверей собственной гостиницы в оазисе».',
    en: 'Recently I heard a phrase from young people — a “plus person”, someone who is more often than not in the black. The equivalents: “he’ll always earn his bread and butter”, “he’ll go far if no one stops him”, “safe as houses”, “throw him naked into Africa and in a year he’ll be greeting you at the door of his own hotel in an oasis”.',
  },
  {
    ru: 'Стартап может тестировать разные каналы привлечения, но только для того, чтобы выбрать один канал — с самой низкой стоимостью привлечения и достаточной ёмкостью для окупаемости.',
    en: 'A startup can test different acquisition channels, but only in order to pick one — the channel with the lowest acquisition cost and enough capacity to pay off.',
  },
  {
    ru: 'Если в разных каналах у вас получается разная стоимость привлечения, то в чём смысл использовать более дорогой канал, если вы ещё не находитесь в ситуации насыщения рынка?',
    en: 'If different channels give you different acquisition costs, what is the point of using the more expensive one while you are not yet in a market-saturation situation?',
  },
  {
    ru: 'Много используемых каналов на старте — это распыление ресурсов, которых вам и так не хватает.',
    en: 'Many channels at the start means scattering the resources you are already short of.',
  },
  {
    ru: 'Стань большой рыбой в маленьком пруду.',
    en: 'Become a big fish in a small pond.',
  },
  {
    ru: 'Если вы вынуждены использовать много каналов, потому что ни один из них не даёт нужного для окупаемости количества клиентов, то это повод задуматься — а есть ли реальная потребность в вашем продукте?',
    en: 'If you are forced to use many channels because none of them brings enough customers to break even, that is a reason to wonder — is there a real need for your product at all?',
  },
  {
    ru: 'Стартап — это путь роста, путь поиска новых целей, путь ошибок, но и путь достижений.',
    en: 'A startup is a path of growth, a path of seeking new goals, a path of mistakes — but also a path of achievements.',
  },
  {
    ru: 'Стартап — это всегда бизнес в условиях экстремальной неопределённости.',
    en: 'A startup is always a business under extreme uncertainty.',
  },
  {
    ru: 'Когда вы перестаёте быть стартапом, вы начинаете думать о стабильности, хотеть стабильности, поддерживать стабильность. Стабильность — это путь стагнации, стагнация — это первый шаг на пути к саморазрушению.',
    en: 'When you stop being a startup, you start thinking about stability, wanting stability, maintaining stability. Stability is the road to stagnation, and stagnation is the first step toward self-destruction.',
  },
  {
    ru: 'На могиле многих компаний можно написать: «Они перестали быть стартапами».',
    en: 'On the gravestone of many companies you could write: “They stopped being startups.”',
  },
  {
    ru: '90% объёма розничных продаж по-прежнему совершается в офлайне.',
    en: '90% of retail sales volume still happens offline.',
  },
  {
    ru: 'Залог успеха стартапа, ориентированного на продажи часто используемых розничных товаров (FMCG), — это не сайт и не реклама в соцсетях. Успех FMCG-стартапа — способность выстроить работающую схему офлайн-дистрибуции, в которой можно продавать сотни тысяч единиц товара в месяц. Это может быть сеть дистрибуторов, поп-ап магазинчиков или собственная/франшизная розничная сеть.',
    en: 'The key to a startup built on fast-moving consumer goods (FMCG) is not a website or social-media ads. The success of an FMCG startup is the ability to build a working offline-distribution scheme that can sell hundreds of thousands of units a month — a network of distributors, pop-up stores, or your own/franchised retail chain.',
  },
  {
    ru: 'Ключевой момент выстраивания такой сети — это правильное ценообразование, которое даёт возможность каждому партнёру откусывать в пищевой цепочке дистрибуции хороший кусок от рекомендованной розничной цены товара. Партнёры должны иметь возможность при прочих равных условиях зарабатывать на вашем товаре больше, чем на ваших конкурентах.',
    en: 'The crux of building such a network is the right pricing — one that lets every partner bite off a good piece of the recommended retail price along the distribution food chain. All else being equal, partners must be able to earn more on your product than on your competitors’.',
  },
  {
    ru: 'Цена сама по себе отпугивать не может — это просто число. Отпугнуть может: недостаток ценности, обещанной за эту цену; недостаток доверия к тому, кто продаёт; отсутствие «конфетно-букетного» периода из серии «что вы себе позволяете, мы с вами едва знакомы».',
    en: 'Price by itself cannot scare anyone off — it is just a number. What scares people off is: a lack of the value promised for that price; a lack of trust in the seller; and the absence of a courtship period — “how dare you, we barely know each other”.',
  },
  {
    ru: 'Если у вас не покупают по назначенной вами цене — проблема не в том, что цена высокая, а в том, что вы не сумели правильным образом её подать. Не надо торопиться снижать цену, лучше задуматься о том, что же вы на самом деле продаёте.',
    en: 'If people don’t buy at your price, the problem is not that the price is high — it is that you failed to present it well. Don’t rush to cut the price; better to ask yourself what you are really selling.',
  },
  {
    ru: 'Если вы общаетесь с командой проекта в одной комнате с другими инвесторами, то вы выбрали не ту комнату.',
    en: 'If you’re meeting the project’s team in the same room as other investors, you picked the wrong room.',
  },
  {
    ru: 'Если вы считаете себя умнее команды проекта, то вы выбрали не ту команду.',
    en: 'If you think you’re smarter than the project’s team, you picked the wrong team.',
  },
  {
    ru: 'Если команда проекта считает себя умнее вас, то вы всё равно выбрали не ту команду. Если команда проекта знает ответы на все ваши вопросы, то вы задаёте не те вопросы. Если вы знаете, что делать проекту, чтобы добиться успеха, то вы выбрали не тот проект.',
    en: 'If the team thinks it’s smarter than you, you still picked the wrong team. If the team has answers to all your questions, you’re asking the wrong questions. If you know what the project must do to succeed, you picked the wrong project.',
  },
  {
    ru: 'Зарабатывать деньги, делая добрые дела, лучше, чем просто зарабатывать деньги или просто делать добрые дела. Добрых дел будет больше, денег будет больше — что в этом плохого?',
    en: 'Making money by doing good is better than just making money or just doing good. More good gets done, more money is made — what’s wrong with that?',
  },
  {
    ru: '«Масштабность» интереснее, чем «масштабируемость».',
    en: '“Scale of ambition” is more interesting than “scalability”.',
  },
  {
    ru: 'Масштабируемость — это способность увеличиваться в размерах при добавлении ресурсов. Масштабировать можно почти всё что угодно. Можно взять интернет-магазин, торгующий сепульками, залить его деньгами и тем самым промасштабировать до размеров всероссийского сепулькария. Будет ли он при этом прибыльным — неизвестно, но масштаб будет ого-го.',
    en: 'Scalability is the ability to grow in size as you add resources. Almost anything can be scaled. Take an online shop selling sepulkas, pour money into it, and scale it up to a nationwide sepulkarium. Whether it turns a profit is anyone’s guess — but the scale will be enormous.',
  },
  {
    ru: 'Понимание экономики продаж определяет выбор идеи. Есть много хороших идей, которые не проходят по деньгам. Сначала нужно научиться считать, а потом выбирать идею, на которой можно заработать.',
    en: 'Understanding the economics of sales determines which idea you choose. There are many good ideas that don’t add up financially. First learn to count, then pick an idea you can actually earn on.',
  },
  {
    ru: 'Понимание конкуренции определяет выбор маркетинговой стратегии. Нельзя стать большим просто потому, что вы делаете что-то хорошо. Можно стать большим, только победив кого-то. Насколько большим вы станете, зависит от того, насколько большого врага вы выбрали.',
    en: 'Understanding competition determines your marketing strategy. You can’t become big just because you do something well. You become big only by beating someone. How big you get depends on how big an enemy you chose.',
  },
  {
    ru: 'Соотношение потерь между нападением и обороной — 3 к 1. Чтобы победить конкурента, вам надо либо иметь в 3 раза больше денег, либо стать в 3 раза лучше по одному, но важному для покупателя параметру.',
    en: 'The loss ratio between attack and defense is 3 to 1. To beat a competitor you need either three times the money, or to be three times better on one parameter that matters to the customer.',
  },
  {
    ru: 'Начинающие бизнес-ангелы часто кидаются в одну из двух крайностей. Они либо начинают слепо верить в свою чуйку, либо начинают передоверять принятие решений аналитикам. Оба варианта плохи.',
    en: 'Beginning angel investors often swing to one of two extremes: blindly trusting their gut, or over-delegating decisions to analysts. Both are bad.',
  },
  {
    ru: 'Общение между проектами и инвесторами — это вообще то, что доктор прописал: проекты учатся заинтересовывать реальных инвесторов, инвесторы учатся оценивать реальные проекты.',
    en: 'Conversation between projects and investors is exactly what the doctor ordered: projects learn to interest real investors, investors learn to evaluate real projects.',
  },
  {
    ru: 'Модель маркетплейсов с абонентской платой манит многих начинающих. Это действительно работающая модель для быстрого старта — поставил низкую абонентскую плату и уже начал набирать первых платящих продавцов. Но дальше эта модель заводит в тупик.',
    en: 'The subscription-fee marketplace model tempts many beginners. It really does work for a fast start — set a low subscription fee and you’ve already signed your first paying sellers. But beyond that, the model leads to a dead end.',
  },
  {
    ru: 'В общем, единственная модель тарификации для маркетплейса — это оплата, зависящая от активности пользователей, то есть потенциальных покупателей: клики, комиссия, лиды, что угодно. Если подкрепить это абонентской платой, которая бы покрывала ваши фиксы, — будет вообще замечательно.',
    en: 'In short, the only pricing model for a marketplace is payment tied to user activity — that is, to potential buyers: clicks, commission, leads, whatever. Back it with a subscription fee that covers your fixed costs and it’s perfect.',
  },
  {
    ru: 'Не ведитесь на простоту быстрого старта — не начинайте с абонентки. Изменить модель в дальнейшем, кстати, будет очень сложно — если не невозможно. Любая смена модели — это психологический удар по клиентам, они могут отвалиться и не вернуться, альтернативы есть почти всегда.',
    en: 'Don’t fall for the ease of a fast start — don’t begin with a subscription fee. Changing the model later, by the way, will be very hard — if not impossible. Any model change is a psychological blow to customers; they may walk away and not come back, and there are almost always alternatives.',
  },
  {
    ru: 'Всё, что мы думаем о нашем проекте до запуска, — обычно оказывается иллюзиями. Всё то, что мы делаем после него, — работает недостаточно хорошо. Успех может прийти только в результате непрекращаемых экспериментов. Эдисону потребовалось 10 000 опытов, чтобы усовершенствовать лампочку накаливания, 50 000 опытов — чтобы усовершенствовать щелочной аккумулятор. Мы ничем не лучше Эдисона.',
    en: 'Everything we think about our project before launch usually turns out to be an illusion. Everything we do after launch works not quite well enough. Success can come only from non-stop experiments. Edison needed 10,000 experiments to perfect the incandescent bulb, and 50,000 to perfect the alkaline battery. We are no better than Edison.',
  },
  {
    ru: 'Если вы заранее знаете результат эксперимента — это не эксперимент.',
    en: 'If you already know the result of an experiment, it’s not an experiment.',
  },
  {
    ru: 'Если вы ставите эксперимент, вне зависимости от результатов которого вы всё равно собираетесь делать то же, что и делали раньше, — это ненужный эксперимент.',
    en: 'If you run an experiment after which, no matter the result, you intend to do exactly what you did before — it’s a pointless experiment.',
  },
  {
    ru: 'Если вы не можете измерить результат эксперимента — это плохой эксперимент.',
    en: 'If you can’t measure the result of an experiment, it’s a bad experiment.',
  },
  {
    ru: 'Если у вас нет данных, с которыми можно сравнить результаты эксперимента, — сначала соберите эти данные.',
    en: 'If you have no data to compare the experiment’s results against — collect that data first.',
  },
  {
    ru: 'Если результаты эксперимента не могут повлиять на доходы или расходы — зачем такой эксперимент вообще нужен?',
    en: 'If an experiment’s results can’t affect revenue or costs — why run it at all?',
  },
  {
    ru: 'Как ни странно, но главная задача основателя — не руководить бизнесом, а им владеть. Титул «Founder & CEO» — это не орден на груди, а признание несовершенства.',
    en: 'Strangely enough, a founder’s main job is not to run the business but to own it. The title “Founder & CEO” is not a medal on your chest — it’s an admission of imperfection.',
  },
  {
    ru: 'Если вы крутитесь как белка в колесе, всё замкнуто на вас, а результаты вас не радуют — попробуйте понять, вы в состоянии «ещё не бизнес» или «уже не бизнес». И сделайте нужные выводы.',
    en: 'If you’re spinning like a hamster on a wheel, everything depends on you, and the results don’t please you — try to work out whether you’re in the “not yet a business” state or the “no longer a business” state. And draw the right conclusions.',
  },
]
