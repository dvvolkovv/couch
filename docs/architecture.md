# SoulMate -- Системная архитектура

**Версия:** 1.0
**Дата:** 2026-03-03
**Автор:** Principal Software Architect
**Статус:** Approved for MVP

---

## 1. Технологический стек

### 1.1. Frontend

| Компонент | Выбор | Альтернативы | Обоснование |
|-----------|-------|-------------|-------------|
| Фреймворк | **Next.js 14 (App Router)** | Nuxt 3, Remix | SSR/SSG из коробки (критично для SEO лендингов и каталога специалистов), React-экосистема наиболее развита, большой пул разработчиков на российском рынке, API Routes для BFF-слоя |
| Язык | **TypeScript 5.x** | JavaScript | Строгая типизация, контракты API на уровне типов, снижение количества runtime-ошибок |
| State Management | **Zustand + TanStack Query** | Redux Toolkit, MobX | Zustand -- минималистичный для клиентского состояния (UI, чат), TanStack Query -- кеширование серверного состояния (профили, каталог). Не нужна тяжелая архитектура Redux |
| UI-библиотека | **shadcn/ui + Tailwind CSS** | Ant Design, MUI | shadcn/ui дает полный контроль над компонентами (копируются в проект), Tailwind -- utility-first CSS без оверхеда. Критично для уникального дизайна ценностных визуализаций |
| Чат-интерфейс | **Собственный на React** | Chatscope, Stream Chat | ИИ-чат -- ядро продукта, нужен полный контроль: стриминг ответов, кнопки-действия, карточки-резюме, радар-диаграммы внутри чата |
| Визуализация | **Recharts** | D3.js, Chart.js | Радар-диаграммы ценностного профиля, графики аналитики. Recharts -- декларативный, React-нативный |
| Форма/валидация | **React Hook Form + Zod** | Formik + Yup | RHF -- минимальные re-render, Zod -- TypeScript-first валидация, шарится с бэкендом |
| Календарь | **react-big-calendar** | FullCalendar | Открытый, кастомизируемый, для отображения расписания специалистов |

### 1.2. Backend

| Компонент | Выбор | Альтернативы | Обоснование |
|-----------|-------|-------------|-------------|
| Runtime | **Node.js 20 LTS** | Python (FastAPI), Go | TypeScript end-to-end (один язык front+back), отличная экосистема для real-time (WebSocket), достаточная производительность для MVP |
| Фреймворк | **NestJS 10** | Express, Fastify, Koa | Модульная архитектура, DI из коробки, декораторы для контроллеров, встроенная поддержка WebSocket, OpenAPI-генерация, Guards/Interceptors для auth/logging |
| API стиль | **REST (OpenAPI 3.1)** | GraphQL, gRPC | REST проще для MVP, лучше кешируется на CDN, OpenAPI дает автогенерацию клиента. GraphQL избыточен -- нет сложных вложенных запросов |
| Валидация | **Zod + class-validator** | Joi | Zod-схемы шарятся с фронтендом, class-validator интегрирован с NestJS pipes |
| ORM | **Prisma 5** | TypeORM, Drizzle, Sequelize | Типобезопасные запросы, автогенерация типов из схемы, миграции, отличный DX. Prisma хорошо работает с PostgreSQL |
| Job Queue | **BullMQ (Redis)** | Agenda, pg-boss | Отложенные задачи: отправка уведомлений, выплаты специалистам, модерация, генерация рекомендаций. BullMQ зрелый, поддерживает rate limiting и приоритеты |

### 1.3. База данных и хранение

| Компонент | Выбор | Альтернативы | Обоснование |
|-----------|-------|-------------|-------------|
| Основная БД | **PostgreSQL 16** | MySQL, CockroachDB | JSONB для хранения ценностных профилей, pgvector для embeddings, full-text search для каталога, надежность, ACID-транзакции для платежей |
| Векторные индексы | **pgvector** | Pinecone, Qdrant, Milvus | Хранение embeddings ценностных профилей в той же БД. Для MVP объем данных (<100K профилей) позволяет обойтись без отдельного vector DB |
| Кеш | **Redis 7** | Memcached, KeyDB | Кеширование каталога, сессии пользователей, rate limiting, pub/sub для real-time нотификаций, хранение состояния ИИ-чата |
| Объектное хранилище | **S3-совместимое (Yandex Object Storage)** | MinIO | Фотографии, документы специалистов, видео-визитки. S3 API -- стандарт, легко мигрировать |
| Полнотекстовый поиск | **PostgreSQL FTS** (MVP), **Elasticsearch** (Phase 2) | MeiliSearch, Typesense | Для MVP хватит встроенного FTS PostgreSQL (каталог 600 специалистов). Elasticsearch подключаем при росте |

### 1.4. AI/ML

| Компонент | Выбор | Альтернативы | Обоснование |
|-----------|-------|-------------|-------------|
| LLM для чат-агентов | **Claude 3.5 Sonnet (Anthropic)** | GPT-4o, YandexGPT | Превосходное следование инструкциям, длинный контекст (200K), лучшая эмпатия в диалогах, constitutional AI (безопасность). Fallback: GPT-4o-mini для снижения стоимости |
| LLM fallback | **GPT-4o-mini (OpenAI)** | YandexGPT Pro | Запасной провайдер на случай недоступности Anthropic API. Более низкая стоимость для фазы 3 (поведенческая оптимизация) |
| Embeddings | **text-embedding-3-small (OpenAI)** | E5-large, Cohere embed | 1536-мерные embeddings для ценностных профилей. Высокое качество, низкая стоимость ($0.02/1M tokens) |
| Промежуточный слой | **LangChain.js** | LlamaIndex, собственный | Абстракция над LLM-провайдерами (легко переключиться), structured output parsing, memory management для многоходового диалога |
| Модерация контента | **OpenAI Moderation API + собственные правила** | Perspective API | Фильтрация токсичного контента в чатах. Собственные правила для кризисных маркеров |

### 1.5. Real-time коммуникации

| Компонент | Выбор | Альтернативы | Обоснование |
|-----------|-------|-------------|-------------|
| WebSocket | **Socket.IO (через NestJS Gateway)** | ws, Ably, Pusher | ИИ-чат со стримингом ответов, уведомления, обновление статусов. Socket.IO автоматический fallback на polling, rooms для изоляции |
| Видеозвонки (MVP) | **Zoom SDK + Google Meet API** | Jitsi, Daily.co | MVP: ссылки на внешние сервисы. Специалисты уже используют Zoom/Meet |
| Видеозвонки (Phase 2) | **Daily.co или LiveKit** | Jitsi, Twilio | Встроенный видеочат. Daily.co -- простой SDK, HIPAA-compliant. LiveKit -- open-source, можно self-host в РФ |

### 1.6. Платежи

| Компонент | Выбор | Альтернативы | Обоснование |
|-----------|-------|-------------|-------------|
| Платежный агрегатор | **ЮKassa (YooKassa)** | CloudPayments, Robokassa, Тинькофф Касса | Лидер рынка, все карты (Visa/MC/МИР), СБП, Apple Pay, рекуррентные платежи, Split-платежи (для маркетплейса), интеграция с онлайн-кассой (ФЗ-54), хорошая документация |
| Онлайн-касса | **Через ЮKassa (АТОЛ)** | OrangeData, МодульКасса | ЮKassa имеет встроенную интеграцию с АТОЛ для фискализации |
| Выплаты специалистам | **ЮKassa Payouts API** | Банковский API (Тинькофф) | Массовые выплаты на карты и счета. Единый провайдер для приема и выплат |

### 1.7. Инфраструктура

| Компонент | Выбор | Альтернативы | Обоснование |
|-----------|-------|-------------|-------------|
| Облако | **Yandex Cloud** | Selectel, VK Cloud | ФЗ-152 (данные в РФ), Managed PostgreSQL, Managed Redis, Object Storage, Container Registry, Load Balancer, DDoS Protection. Наиболее полный набор managed-сервисов среди российских облаков |
| Оркестрация | **Yandex Managed Kubernetes** | Docker Compose (dev), Yandex Serverless Containers | Kubernetes для production: auto-scaling, rolling updates, health checks. Docker Compose для dev |
| CI/CD | **GitHub Actions + self-hosted runner в Yandex Cloud** | GitLab CI, Yandex Cloud CI | GitHub Actions -- наиболее популярен, self-hosted runner для доступа к Yandex Cloud |
| Мониторинг | **Grafana + Prometheus + Loki** | DataDog, Yandex Monitoring | Open-source стек, полный контроль. Prometheus для метрик, Loki для логов, Grafana для дашбордов |
| APM | **Sentry** | New Relic, Elastic APM | Трекинг ошибок frontend + backend, performance monitoring, source maps |
| CDN | **Yandex CDN** | Cloudflare (не РФ) | Статика, изображения, видео-визитки. Российские точки присутствия |

### 1.8. Уведомления

| Компонент | Выбор | Альтернативы | Обоснование |
|-----------|-------|-------------|-------------|
| Email | **Unisender** | SendPulse, Mailgun | Российский сервис, хорошая доставляемость в .ru, API для транзакционных писем, шаблоны |
| SMS | **SMS.ru** | SMSC, Twilio | Российский провайдер, надежная доставка, API, доступные тарифы. Для OTP-кодов и напоминаний |
| Push | **Firebase Cloud Messaging** (Phase 2) | OneSignal | FCM бесплатен, стандарт для мобильных push. Не нужен в MVP (нет мобильного приложения) |
| In-app | **WebSocket (Socket.IO)** | - | Real-time уведомления в веб-интерфейсе через существующее WebSocket-соединение |

---

## 2. Архитектура системы

### 2.1. Подход: Модульный монолит -> Микросервисы

**MVP (Phase 1): Модульный монолит.**
Единое NestJS-приложение с четким разделением на доменные модули. Каждый модуль имеет собственные контроллеры, сервисы и репозитории. Модули общаются через внутренние интерфейсы (DI), а не HTTP.

**Обоснование:**
- Команда 3-5 разработчиков -- микросервисы создадут оверхед без пользы
- Единая БД упрощает транзакции (бронирование + оплата)
- Быстрее разработка и деплой (один репозиторий, один деплой)
- NestJS-модули обеспечивают логическую изоляцию
- Модули можно вынести в микросервисы позже без переписывания бизнес-логики

**Phase 2-3: Выделение критичных сервисов:**
- AI Service (отдельный сервис для LLM-вызовов, свой scaling)
- Notification Service (асинхронный, свой scaling)
- Video Service (при встроенном видеочате)

### 2.2. Диаграмма системной архитектуры

```
+------------------------------------------------------------------+
|                        КЛИЕНТЫ                                    |
|  +------------------+  +------------------+  +------------------+ |
|  |  Веб-браузер     |  |  Мобильный       |  |  Админ-панель    | |
|  |  (Next.js SSR)   |  |  (Phase 2)       |  |  (Next.js)       | |
|  +--------+---------+  +--------+---------+  +--------+---------+ |
+-----------|----------------------|----------------------|---------+
            |                      |                      |
            v                      v                      v
+------------------------------------------------------------------+
|                    Yandex Cloud Load Balancer                     |
|                    (L7, TLS termination, DDoS)                   |
+------------------------------------------------------------------+
            |                                             |
            v                                             v
+-------------------------+                 +-------------------------+
|   FRONTEND (Next.js)    |                 |   CDN (Yandex CDN)     |
|   - SSR/SSG pages       |                 |   - Статика            |
|   - BFF API Routes      |                 |   - Изображения        |
|   - WebSocket client    |                 |   - Видео-визитки      |
+----------+--------------+                 +-------------------------+
           |
           | REST API + WebSocket
           v
+------------------------------------------------------------------+
|                   API GATEWAY / BFF Layer                          |
|              (Next.js API Routes / NestJS)                        |
|   - Rate Limiting    - JWT Validation    - Request Logging        |
+------------------------------------------------------------------+
           |
           v
+===================================================================+
|                     NestJS МОДУЛЬНЫЙ МОНОЛИТ                      |
|                                                                   |
|  +-------------+  +-------------+  +-------------+  +----------+ |
|  |   Auth      |  |   Users     |  |   AI Chat   |  | Matching | |
|  |   Module    |  |   Module    |  |   Module    |  | Module   | |
|  | - Register  |  | - Profiles  |  | - Client    |  | - Score  | |
|  | - Login     |  | - Settings  |  |   Consult   |  | - Rank   | |
|  | - OAuth     |  | - Documents |  | - Specialist|  | - Explain| |
|  | - SMS OTP   |  |             |  |   Interview |  |          | |
|  +-------------+  +-------------+  +------+------+  +----------+ |
|                                           |                       |
|  +-------------+  +-------------+  +------v------+  +----------+ |
|  |  Booking    |  |  Payment    |  |   Value     |  | Review   | |
|  |  Module     |  |  Module     |  |   Profile   |  | Module   | |
|  | - Slots     |  | - Charge    |  |   Module    |  | - CRUD   | |
|  | - Reserve   |  | - Payout    |  | - Extract   |  | - Moder  | |
|  | - Calendar  |  | - Refund    |  | - Store     |  |          | |
|  |             |  | - Subscribe |  | - Compare   |  |          | |
|  +-------------+  +-------------+  +-------------+  +----------+ |
|                                                                   |
|  +-------------+  +-------------+  +-------------+  +----------+ |
|  | Notification|  |  Catalog    |  |   Admin     |  | Analytics| |
|  |  Module     |  |  Module     |  |   Module    |  | Module   | |
|  | - Email     |  | - Search    |  | - Dashboard |  | - Events | |
|  | - SMS       |  | - Filter    |  | - Moderat.  |  | - Report | |
|  | - In-app    |  | - Sort      |  | - Promos    |  | - Export | |
|  +-------------+  +-------------+  +-------------+  +----------+ |
|                                                                   |
+===================================================================+
     |          |           |            |           |
     v          v           v            v           v
+--------+ +--------+ +---------+ +---------+ +----------+
|Postgres| | Redis  | | LLM API | | YooKassa| | S3       |
|  16    | |  7     | | Claude/ | | Payment | | Object   |
|+vector | | Cache  | | GPT-4o  | | Gateway | | Storage  |
|        | | Queue  | |         | |         | |          |
+--------+ +--------+ +---------+ +---------+ +----------+
                           |
                    +------+------+
                    |  OpenAI     |
                    |  Embeddings |
                    +-------------+

+-----------+  +----------+  +-----------+  +----------+
| Unisender |  | SMS.ru   |  | Zoom API  |  | Google   |
| (Email)   |  | (SMS)    |  |           |  | Meet API |
+-----------+  +----------+  +-----------+  +----------+
```

### 2.3. Потоки данных

#### Поток ИИ-консультации клиента

```
Клиент                Next.js BFF           NestJS Backend         LLM API         PostgreSQL
  |                       |                       |                    |                |
  |-- Открыть чат ------->|                       |                    |                |
  |                       |-- POST /ai/client --->|                    |                |
  |                       |   /consultation/start |                    |                |
  |                       |                       |-- Создать сессию --|--------------->|
  |                       |                       |-- Сохранить в ---->|                |
  |                       |                       |   Redis (state)    |                |
  |                       |                       |<-- session_id -----|                |
  |                       |<-- WS: connected -----|                    |                |
  |<-- WS: приветствие ---|                       |                    |                |
  |                       |                       |                    |                |
  |-- WS: сообщение ----->|                       |                    |                |
  |                       |-- WS: user_message -->|                    |                |
  |                       |                       |-- Собрать контекст |                |
  |                       |                       |   + system prompt  |                |
  |                       |                       |-- Stream request ->|                |
  |                       |                       |<-- Stream tokens --|                |
  |                       |<-- WS: ai_stream -----|                    |                |
  |<-- Стриминг ответа ---|                       |                    |                |
  |                       |                       |-- Сохранить msg -->|--------------->|
  |                       |                       |                    |                |
  | ... (10-20 минут диалога, 15-25 обменов) ...  |                    |                |
  |                       |                       |                    |                |
  |                       |                       |-- Extract values ->|                |
  |                       |                       |<-- JSON profile ---|                |
  |                       |                       |-- Generate embed ->|                |
  |                       |                       |<-- embedding ------|                |
  |                       |                       |-- Save profile ----|--------------->|
  |                       |<-- WS: summary -------|                    |                |
  |<-- Карточка-резюме ---|                       |                    |                |
  |                       |                       |                    |                |
  |-- Подтвердить ------->|                       |                    |                |
  |                       |-- POST /matching ---->|                    |                |
  |                       |   /recommendations    |                    |                |
  |                       |                       |-- Vector search ---|--------------->|
  |                       |                       |<-- Top-N results --|                |
  |                       |                       |-- Generate explain |                |
  |                       |                       |   for each match ->|                |
  |                       |<-- recommendations ---|                    |                |
  |<-- Top-5 карточки ----|                       |                    |                |
```

#### Поток бронирования и оплаты

```
Клиент          Next.js          NestJS          PostgreSQL      YooKassa       Specialist
  |                |                |                |               |               |
  |-- Выбрать ---->|                |                |               |               |
  |   слот         |-- POST ------->|                |               |               |
  |                |   /bookings    |-- Check slot ->|               |               |
  |                |                |<-- available --|               |               |
  |                |                |-- Lock slot -->|               |               |
  |                |                |-- Create ----->|               |               |
  |                |                |   payment      |               |               |
  |                |                |-- Init pay ----|-------------->|               |
  |                |<-- pay URL ----|                |               |               |
  |<-- Redirect -->|                |                |               |               |
  |   to YooKassa  |                |                |               |               |
  |                |                |                |               |               |
  |-- Оплата ----->|... (YooKassa payment page) .....|               |               |
  |                |                |                |               |               |
  |                |                |<-- Webhook ----|---------------|               |
  |                |                |   payment.ok   |               |               |
  |                |                |-- Confirm ---->|               |               |
  |                |                |   booking      |               |               |
  |                |                |-- Notify ----->|----email/sms--|-------------->|
  |                |                |-- Notify ----->|----email/sms--|               |
  |<-- Confirm ----|<-- Confirm ----|                |               |               |
  |   page         |                |                |               |               |
```

---

## 3. Архитектура модулей NestJS

```
src/
+-- main.ts
+-- app.module.ts
+-- common/                          # Общие утилиты
|   +-- decorators/                  # @CurrentUser, @Roles
|   +-- filters/                     # ExceptionFilter
|   +-- guards/                      # JwtAuthGuard, RolesGuard
|   +-- interceptors/                # LoggingInterceptor, TransformInterceptor
|   +-- pipes/                       # ZodValidationPipe
|   +-- types/                       # Общие типы
|
+-- modules/
|   +-- auth/                        # Аутентификация
|   |   +-- auth.module.ts
|   |   +-- auth.controller.ts
|   |   +-- auth.service.ts
|   |   +-- strategies/              # JWT, Local, OAuth (VK, Google)
|   |   +-- guards/
|   |   +-- dto/
|   |
|   +-- users/                       # Пользователи и профили
|   |   +-- users.module.ts
|   |   +-- users.controller.ts
|   |   +-- users.service.ts
|   |   +-- specialists.controller.ts
|   |   +-- specialists.service.ts
|   |   +-- dto/
|   |
|   +-- ai-chat/                     # ИИ-чат (консультации и интервью)
|   |   +-- ai-chat.module.ts
|   |   +-- ai-chat.gateway.ts       # WebSocket Gateway
|   |   +-- ai-chat.service.ts
|   |   +-- client-consultation.service.ts
|   |   +-- specialist-interview.service.ts
|   |   +-- llm/
|   |   |   +-- llm.service.ts       # Абстракция над LLM-провайдерами
|   |   |   +-- prompts/             # Системные промпты
|   |   |   +-- crisis-detector.ts
|   |   +-- dto/
|   |
|   +-- value-profile/               # Ценностные профили
|   |   +-- value-profile.module.ts
|   |   +-- value-profile.service.ts
|   |   +-- embedding.service.ts
|   |   +-- value-taxonomy.ts        # Константы осей ценностей
|   |
|   +-- matching/                    # Алгоритм матчинга
|   |   +-- matching.module.ts
|   |   +-- matching.controller.ts
|   |   +-- matching.service.ts
|   |   +-- scoring.service.ts
|   |   +-- explanation.service.ts
|   |
|   +-- catalog/                     # Каталог специалистов
|   |   +-- catalog.module.ts
|   |   +-- catalog.controller.ts
|   |   +-- catalog.service.ts
|   |   +-- search.service.ts
|   |
|   +-- booking/                     # Бронирование
|   |   +-- booking.module.ts
|   |   +-- booking.controller.ts
|   |   +-- booking.service.ts
|   |   +-- schedule.service.ts
|   |   +-- calendar-sync.service.ts
|   |
|   +-- payment/                     # Платежи
|   |   +-- payment.module.ts
|   |   +-- payment.controller.ts    # + webhook endpoint
|   |   +-- payment.service.ts
|   |   +-- payout.service.ts
|   |   +-- subscription.service.ts
|   |   +-- yookassa/
|   |       +-- yookassa.client.ts
|   |
|   +-- review/                      # Отзывы
|   |   +-- review.module.ts
|   |   +-- review.controller.ts
|   |   +-- review.service.ts
|   |
|   +-- notification/                # Уведомления
|   |   +-- notification.module.ts
|   |   +-- notification.service.ts
|   |   +-- channels/
|   |       +-- email.service.ts
|   |       +-- sms.service.ts
|   |       +-- in-app.service.ts
|   |
|   +-- admin/                       # Админ-панель
|   |   +-- admin.module.ts
|   |   +-- admin.controller.ts
|   |   +-- moderation.service.ts
|   |   +-- analytics.service.ts
|   |
|   +-- analytics/                   # Аналитика и метрики
|       +-- analytics.module.ts
|       +-- events.service.ts
|       +-- reports.service.ts
|
+-- prisma/
    +-- schema.prisma
    +-- migrations/
    +-- seed.ts
```

---

## 4. Безопасность

### 4.1. Аутентификация и авторизация

| Аспект | Реализация |
|--------|-----------|
| Аутентификация | JWT (access token 15 мин + refresh token 7 дней в httpOnly cookie) |
| OAuth | VK ID, Google OAuth 2.0 (через Passport.js strategies) |
| SMS OTP | 4-значный код, TTL 5 мин, rate limit 3 попытки / 5 мин |
| Роли | CLIENT, SPECIALIST, ADMIN (enum, хранится в JWT payload) |
| RBAC | NestJS Guards: @Roles('SPECIALIST') на эндпоинтах |
| 2FA | TOTP для специалистов (обязательно) и админов (Google Authenticator) |

### 4.2. Защита данных

| Аспект | Реализация |
|--------|-----------|
| TLS | TLS 1.3 обязательно, HSTS headers |
| Шифрование at rest | AES-256 для данных ИИ-консультаций (отдельный ключ шифрования через KMS Yandex Cloud) |
| PII | Персональные данные хешируются при логировании. Логи не содержат содержимого чатов |
| ФЗ-152 | Все данные хранятся в Yandex Cloud (Москва). Согласие на обработку ПД при регистрации |
| CORS | Whitelist доменов (soulmate.ru, admin.soulmate.ru) |
| Rate Limiting | Global: 100 req/min per IP. Auth endpoints: 10 req/min. AI chat: 30 msg/min per user |
| Helmet | HTTP security headers через @nestjs/helmet |
| CSRF | SameSite=Strict cookies + CSRF token для мутаций |
| SQL Injection | Prisma ORM (параметризованные запросы) |
| XSS | React автоэскейпинг + CSP headers |

### 4.3. Безопасность платежей

- Токенизация карт на стороне ЮKassa (PCI DSS compliance не требуется)
- Webhook-подпись верифицируется через HMAC
- Idempotency keys для предотвращения двойных списаний

---

## 5. Масштабируемость

### 5.1. Горизонтальное масштабирование

| Компонент | Стратегия |
|-----------|----------|
| Next.js | Horizontal Pod Autoscaler (HPA) по CPU. Stateless -- масштабируется линейно |
| NestJS | HPA по CPU и кастомным метрикам (queue length). Stateless (сессии в Redis) |
| PostgreSQL | Yandex Managed PostgreSQL с read replicas. Вертикальное масштабирование до 64 vCPU |
| Redis | Yandex Managed Redis cluster. Sentinel для HA |
| AI модуль | Отдельный Deployment с HPA по длине очереди LLM-запросов. Rate limiting к LLM API |

### 5.2. Кеширование

| Данные | Стратегия | TTL |
|--------|----------|-----|
| Каталог специалистов | Redis + CDN | 5 мин |
| Профиль специалиста | Redis | 10 мин, invalidate on update |
| Ценностные профили | Redis | 1 час |
| Результаты матчинга | Redis (per user) | 30 мин, invalidate on profile change |
| Расписание | Redis | 1 мин (высокая частота изменений) |
| Статика (фото, видео) | CDN | 24 часа |

### 5.3. Целевые SLA

| Метрика | Цель (MVP) | Цель (Phase 2) |
|---------|-----------|----------------|
| Uptime | 99.5% | 99.9% |
| API latency (p95) | < 500ms | < 200ms |
| AI response (first token) | < 2s | < 1s |
| Matching generation | < 5s | < 3s |
| Page load (LCP) | < 2.5s | < 1.5s |
| Concurrent AI sessions | 50 | 500 |
| Concurrent users | 500 | 5000 |

---

## 6. Среда разработки и DevOps

### 6.1. Репозиторий

**Monorepo (Turborepo):**
```
soulmate/
+-- apps/
|   +-- web/          # Next.js frontend
|   +-- api/          # NestJS backend
|   +-- admin/        # Admin panel (Next.js)
+-- packages/
|   +-- shared/       # Общие типы, Zod-схемы, константы
|   +-- ui/           # shadcn/ui компоненты (shared)
|   +-- config/       # ESLint, TSConfig, Prettier
+-- docker/
|   +-- docker-compose.yml
|   +-- Dockerfile.web
|   +-- Dockerfile.api
+-- k8s/
|   +-- base/
|   +-- overlays/
|       +-- staging/
|       +-- production/
+-- turbo.json
+-- package.json
```

### 6.2. CI/CD Pipeline

```
Push to main
     |
     v
GitHub Actions:
  1. Lint (ESLint + Prettier)
  2. Type Check (tsc --noEmit)
  3. Unit Tests (Vitest)
  4. Integration Tests (Testcontainers + PostgreSQL)
  5. Build (turbo run build)
  6. Docker Build & Push (Yandex Container Registry)
  7. Deploy to Staging (Kubernetes apply)
  8. E2E Tests (Playwright against staging)
  9. Manual Approval Gate
 10. Deploy to Production (Kubernetes rolling update)
```

### 6.3. Среды

| Среда | Назначение | Инфра |
|-------|-----------|-------|
| Local | Разработка | Docker Compose (PostgreSQL, Redis, MinIO) |
| Staging | QA, демо | Yandex Cloud, отдельный кластер K8s |
| Production | Продакшен | Yandex Cloud, HA-кластер K8s |

---

## 7. Мониторинг и наблюдаемость

### 7.1. Метрики (Prometheus)

- **Бизнес-метрики:** регистрации/час, ИИ-консультации/час, бронирования/час, GMV/день
- **Технические метрики:** request rate, error rate, latency percentiles, CPU/memory per pod
- **AI-метрики:** LLM latency, tokens consumed, cost per consultation, crisis detection rate
- **Кастомные:** matching quality score, consultation completion rate

### 7.2. Логирование (Loki)

- Structured JSON logs (pino)
- Уровни: error, warn, info, debug
- Корреляция через request-id / trace-id
- Данные чатов НЕ логируются (privacy)

### 7.3. Алерты

| Алерт | Условие | Канал |
|-------|---------|-------|
| API Error Rate > 5% | 5-мин окно | Telegram + PagerDuty |
| AI Service Down | Health check fail 3x | Telegram + PagerDuty |
| Payment Webhook Fail | Любой 5xx | Telegram (немедленно) |
| Crisis Detection | Любое срабатывание | Admin email + Telegram |
| DB Connection Pool > 80% | 1-мин окно | Telegram |
| Queue Depth > 1000 | 5-мин окно | Telegram |

---

## 8. Ключевые архитектурные решения (ADR)

### ADR-001: Модульный монолит для MVP

**Контекст:** Команда 3-5 разработчиков, срок MVP 3-4 месяца.
**Решение:** Модульный монолит на NestJS с четким разделением доменов.
**Следствие:** Быстрая разработка, простой деплой, возможность выделения модулей в микросервисы позже.

### ADR-002: PostgreSQL + pgvector вместо отдельного Vector DB

**Контекст:** Для ценностного матчинга нужны векторные операции (cosine similarity).
**Решение:** pgvector расширение для PostgreSQL.
**Следствие:** Нет отдельного инфра-компонента. При росте до 1M+ профилей -- мигрировать на Qdrant/Pinecone.

### ADR-003: Claude 3.5 Sonnet как основная LLM

**Контекст:** ИИ-агент должен вести эмпатичный, структурированный диалог 20-40 минут, распознавать кризисы.
**Решение:** Claude 3.5 Sonnet (лучшая эмпатия и следование инструкциям), GPT-4o-mini как fallback.
**Риск:** Санкционные ограничения на доступ к API из РФ. Митигация: proxy через нейтральную юрисдикцию, мониторинг доступности, готовность к миграции на YandexGPT.

### ADR-004: ЮKassa как единый платежный провайдер

**Контекст:** Нужен прием платежей (карты, СБП), выплаты специалистам, рекуррентные платежи, фискализация.
**Решение:** ЮKassa покрывает все требования одним провайдером.
**Следствие:** Vendor lock-in, но упрощение интеграции и поддержки.

### ADR-005: Yandex Cloud для хостинга

**Контекст:** ФЗ-152 требует хранения данных на территории РФ.
**Решение:** Yandex Cloud -- наиболее полный набор managed-сервисов среди российских облаков.
**Следствие:** Managed PostgreSQL, Redis, Kubernetes снижают операционную нагрузку.
