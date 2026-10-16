export const projects = [
 {id:'route',name:'RouteOps',language:'Dart',stack:'Flutter / Riverpod / Node.js',line:['Выездные заявки и маршруты','Field service, mapped'],description:['Рабочий день выездного специалиста: заявки, маршрут, ETA и расчёт стоимости.','A field technician’s working day: jobs, routes, ETA and pricing.'],limit:['Демо: платежи и подписки имитируются.','Prototype: payments and subscriptions are mocked.'],image:'route',repo:'route-ops'},
 {id:'inspector',name:'Inspector',language:'Dart',stack:'Flutter / Riverpod / local storage',line:['Проверки без сети','Inspections, even offline'],description:['Чек-листы, обязательные поля и локальные черновики для работы на объекте.','Checklists, required fields and local drafts for on-site work.'],limit:['Прототип: API, фото и QR работают через mock-слой.','Prototype: API, photo and QR flows use mocks.'],image:'inspector',repo:'inspector-mobile'},
 {id:'pos',name:'POS Lite',language:'Dart',stack:'Flutter / Riverpod',line:['От корзины до чека','From cart to receipt'],description:['Каталог, корзина и правила скидок в одном интерфейсе кассира.','Catalog, cart and discount rules in one cashier interface.'],limit:['Прототип: эквайринг имитируется, фискального backend нет.','Prototype: mocked acquiring; no fiscal backend.'],image:'pos',repo:'pos-lite'},
 {id:'crm',name:'CRM Pipeline',language:'PHP',stack:'Laravel / SQLite',line:['Лиды. Сделки. Воронка.','Leads. Deals. Pipeline.'],description:['Рабочая воронка продаж с ролями, этапами и контролем переходов сделок.','A sales pipeline with roles, stages and controlled deal transitions.'],limit:['Демо: внешние уведомления имитируются.','Demo: outbound notifications are mocked.'],image:'crm',repo:'crm-pipeline'},
 {id:'webhook',name:'Webhook Hub',language:'PHP',stack:'Slim / SQLite / HMAC',line:['Доставка с повтором','Delivery, with retries'],description:['Подписанные события, идемпотентность и повторная доставка из панели.','Signed events, idempotency and delivery retries from an admin panel.'],limit:['Демо: провайдеры имитируются, админка без авторизации.','Demo: mocked providers; admin has no authentication.'],image:'webhook',repo:'webhook-hub'}
];
export const slides=[
 {id:'intro',type:'intro',label:['Артём / полный цикл','Artem / full ownership']},
 {id:'scada',type:'commercial',label:['WEB SCADA','WEB SCADA']},
 {id:'pak',type:'commercial',label:['ПАК Маркировка','PAK industrial marking']},
 {id:'delivery',type:'delivery',label:['Моя ответственность','My ownership']},
 {id:'architecture',type:'architecture',label:['Архитектура ПАК','PAK architecture']},
 {id:'field',type:'gallery',label:['Работа на объекте','Work in the field']},
 {id:'business',type:'gallery',label:['Процессы бизнеса','Business workflows']},
 {id:'next',type:'next',label:['Следующая задача','What’s next']},
 {id:'contact',type:'contact',label:['Продолжим разговор','Let’s continue']}
];
export const details={
 scada:{
  title:'WEB SCADA',category:['Коммерческая промышленная система','Commercial industrial system'],
  headline:['Технологический процесс.<br>В одном браузере.','The process floor.<br>In one browser.'],
  summary:['Веб-система для наблюдения за технологическим процессом: операторские экраны, SVG-мнемосхемы, телеметрия, тревоги и история. Самостоятельно спроектировал и разработал с нуля, довёл до коммерческой сдачи.','A browser-based system for process supervision: operator views, SVG process diagrams, telemetry, alarms and history. Independently designed and built from scratch through commercial delivery.'],
  image:'scada-process',
  images:['scada-process','scada-dashboard','scada-inspect','scada-tags'],
  captions:[
   ['Операторская мнемосхема: оборудование и текущие значения тегов.','Operator process view: equipment and current tag values.'],
   ['Рабочая матрица телеметрии с обновлением значений.','Telemetry matrix with live value updates.'],
   ['Контекст оборудования и связанных параметров.','Equipment context and linked parameters.'],
   ['Конфигурация тегов и типов данных.','Tag and data-type configuration.']
  ],
  context:['Оператору нужен связный интерфейс: видеть состояние оборудования, читать показания, разбирать тревоги и возвращаться к истории. Отдельные таблицы и экраны должны работать как одна система.','An operator needs a coherent interface: see equipment state, read measurements, investigate alarms and review history. Separate tables and views have to behave as one system.'],
  problem:['Связать конфигурацию тегов, живые данные и визуальное представление процесса в браузере, с правами доступа и серверной частью.','Connect tag configuration, live data and process visualization in a browser, with access control and a server-side system.'],
  ownership:['Сам вёл весь цикл: разобрал задачу, выбрал структуру системы, реализовал frontend и backend, связал realtime-контур, подготовил развёртывание и занимался сопровождением.','I owned the complete lifecycle: understood requirements, designed the system, implemented frontend and backend, connected the realtime flow, prepared deployment and handled support.'],
  technical:[
   [['Интерфейс','Interface'],['Next.js / React / TypeScript. Операторские экраны и SVG-мнемосхемы с конфигурацией элементов и привязками к тегам.','Next.js / React / TypeScript. Operator screens and SVG process views with configurable elements and tag bindings.']],
   [['Realtime','Realtime'],['NestJS API и Socket.IO связывают данные с интерфейсом. Оператор видит свежесть потока и текущие значения.','NestJS API and Socket.IO connect data to the UI. Operators can see stream freshness and current values.']],
   [['Данные и доступ','Data and access'],['PostgreSQL / Prisma. Конфигурация, история, тревоги и роли. Docker Compose и Nginx для развёртывания.','PostgreSQL / Prisma. Configuration, history, alarms and roles. Docker Compose and Nginx for deployment.']]
  ],
  delivery:['От требований и разработки — до коммерческой сдачи, развёртывания и production-поддержки. Ответственность включала связность всей системы, а не только отдельный экран.','From requirements and implementation through commercial delivery, deployment and production support. Ownership covered the whole working system.'],
  outcome:['Коммерческий продукт, созданный самостоятельно с нуля. Кейс показывает, что я могу связать операторский интерфейс, данные и серверную логику и довести их до рабочего внедрения.','A commercial product built independently from scratch. It demonstrates connecting an operator interface, data and server logic through to a working deployment.']
 },
 pak:{
  title:'ПАК / PAK',category:['Промышленная платформа маркировки','Industrial marking platform'],
  headline:['От производственного<br>заказа до склада.','From production order<br>to warehouse.'],
  summary:['Полный производственный контур: заказы, коды маркировки, печать, проверка, агрегация и склад. Самостоятельно построил продукт с нуля — backend, интерфейс, интеграции и инфраструктуру.','A complete production workflow: orders, marking codes, printing, verification, aggregation and warehouse operations. I built the product independently from scratch, including backend, UI, integrations and infrastructure.'],
  image:'pak-dashboard',
  images:['pak-dashboard','pak-orders','pak-detail','pak-warehouse'],
  captions:[
   ['Производственный дашборд: линии, состояние и последние заказы.','Production dashboard: lines, state and recent orders.'],
   ['Заказы: продукт, количество и текущий этап.','Orders: product, quantity and current stage.'],
   ['Завершённый заказ: печать, проверка и выпуск.','Completed order: printing, verification and release.'],
   ['Складской контур и учёт выпущенной продукции.','Warehouse operations and released-product inventory.']
  ],
  context:['На производстве маркировка связана с физическим процессом. Заказ должен пройти через печать и проверку кодов, агрегацию и склад; интерфейс, оборудование и внешние системы должны согласованно работать.','Industrial marking is tied to a physical workflow. An order passes through code printing and verification, aggregation and warehouse operations; UI, equipment and external systems must work together.'],
  problem:['Объединить производственный интерфейс, backend, обмен данными и оборудование в продукт, который можно разворачивать, обновлять и поддерживать.','Bring the production interface, backend, data exchange and equipment together in a product that can be deployed, updated and supported.'],
  ownership:['Полностью самостоятельно: от разбора производственного сценария и архитектуры до frontend, backend, интеграций, Docker-окружения, запуска и решения production issues.','Independent end-to-end ownership: from understanding the production workflow and system design to frontend, backend, integrations, Docker environment, launch and production issues.'],
  technical:[
   [['Производственный интерфейс','Production interface'],['React / TypeScript. Заказы, состояние линий, агрегация и склад. HTTP для операций, SignalR для обновлений.','React / TypeScript. Orders, line status, aggregation and warehouse. HTTP for operations, SignalR for updates.']],
   [['Сервер и данные','Server and data'],['ASP.NET Core (.NET 10), EF Core и PostgreSQL. RabbitMQ / MassTransit для обмена сообщениями между компонентами.','ASP.NET Core (.NET 10), EF Core and PostgreSQL. RabbitMQ / MassTransit for messaging between components.']],
   [['Внешний контур','External systems'],['API ГИС маркировки, интеграция с 1С, печать и сканирование. Docker Compose и reverse proxy. Есть отдельная подсистема лицензирования.','Marking-service APIs, 1C integration, printing and scanning. Docker Compose and reverse proxy. A separate licensing subsystem is present.']]
  ],
  delivery:['Разработал и запустил систему с нуля. Вёл развёртывание, обновления, сопровождение серверного контура и разбор проблем после запуска.','Built and launched the system from scratch. Handled deployment, updates, server operations and issue investigation after launch.'],
  outcome:['Коммерческая промышленная система с полной ответственностью за продукт. Кейс показывает работу на стыке производства, бизнес-логики, интеграций и эксплуатации.','A commercial industrial system with full product ownership. It demonstrates work across production operations, business logic, integrations and ongoing support.']
 }
};

