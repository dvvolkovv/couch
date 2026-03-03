# SoulMate -- Детальный Sprint Backlog

**Версия:** 1.0
**Дата:** 2026-03-03
**Методология:** Scrum, спринты по 2 недели
**Оценка:** Story Points (SP), шкала Фибоначчи

---

## Sprint 0: Фундамент (03.03 - 16.03.2026)

**Цель:** Развернуть инфраструктуру, настроить CI/CD, создать каркас приложения. К концу спринта каждый разработчик может клонировать репо, запустить проект локально и задеплоить на staging.

**Velocity Target:** 20 SP

| ID | Задача | SP | Роль | Приоритет |
|----|--------|-----|------|-----------|
| S0-01 | Создать monorepo (Turborepo): apps/web, apps/api, apps/admin, packages/shared, packages/ui, packages/config | 3 | Tech Lead | P0 |
| S0-02 | Настроить TypeScript конфиг, ESLint, Prettier для всего monorepo | 2 | Tech Lead | P0 |
| S0-03 | Инициализировать Next.js 14 (App Router) в apps/web с базовой структурой | 2 | Frontend Lead | P0 |
| S0-04 | Инициализировать NestJS 10 в apps/api с модульной структурой (пустые модули) | 2 | Tech Lead | P0 |
| S0-05 | Настроить Prisma 5 с PostgreSQL, создать начальную миграцию (users, refresh_tokens) | 3 | Backend Dev | P0 |
| S0-06 | Docker Compose: PostgreSQL 16, Redis 7, MinIO (S3-совместимый) для локальной разработки | 2 | DevOps | P0 |
| S0-07 | Yandex Cloud: создать проект, VPC, Managed PostgreSQL, Managed Redis, Container Registry | 3 | DevOps | P0 |
| S0-08 | GitHub Actions: lint, type-check, build, push Docker-образов | 3 | DevOps | P0 |
| S0-09 | Yandex Managed Kubernetes: staging-кластер, base Kustomize-конфиги | 3 | DevOps | P0 |
| S0-10 | Настроить Sentry (frontend + backend), базовый Grafana + Prometheus | 2 | DevOps | P1 |
| S0-11 | Дизайн-система: настроить shadcn/ui + Tailwind CSS, импортировать палитру и типографику | 3 | Frontend Lead | P0 |
| S0-12 | Shared-пакет: Zod-схемы для User, базовые типы, константы | 2 | Tech Lead | P0 |

**Definition of Done Sprint 0:**
- [ ] `turbo run build` проходит без ошибок
- [ ] `docker-compose up` поднимает локальную среду за < 2 минут
- [ ] Push в main запускает CI pipeline и деплоит на staging
- [ ] Staging доступен по HTTPS (staging.soulmate.ru)
- [ ] Sentry ловит тестовую ошибку

**Deliverables:** Рабочий CI/CD pipeline, staging-среда, каркас monorepo

---

## Sprint 1: Аутентификация (17.03 - 30.03.2026)

**Цель:** Реализовать полный цикл регистрации и авторизации для клиентов. Пользователь может зарегистрироваться по email или телефону, войти, выйти, обновить токен.

**Velocity Target:** 30 SP
**User Stories:** US-1.1, US-1.2, US-1.4

| ID | Задача | SP | Роль | US |
|----|--------|-----|------|----|
| S1-01 | Backend: Auth модуль -- JWT (access 15min + refresh 7d httpOnly cookie) | 5 | Tech Lead | US-1.1 |
| S1-02 | Backend: POST /auth/register/email -- регистрация, валидация, хеширование пароля (bcrypt) | 3 | Backend Dev | US-1.1 |
| S1-03 | Backend: POST /auth/verify/email -- подтверждение email по токену | 2 | Backend Dev | US-1.1 |
| S1-04 | Backend: POST /auth/login/email -- вход по email/пароль | 2 | Backend Dev | US-1.1 |
| S1-05 | Backend: POST /auth/register/phone + POST /auth/verify/phone -- SMS OTP (SMS.ru интеграция) | 5 | Backend Dev | US-1.2 |
| S1-06 | Backend: POST /auth/refresh, POST /auth/logout | 2 | Tech Lead | - |
| S1-07 | Backend: Rate limiting (auth endpoints: 10 req/min) | 2 | Tech Lead | - |
| S1-08 | Backend: GET /users/me, PATCH /users/me -- базовый профиль клиента | 3 | Backend Dev | US-1.4 |
| S1-09 | Frontend: Страницы Register, Login -- формы с React Hook Form + Zod | 3 | Frontend Lead | US-1.1, US-1.2 |
| S1-10 | Frontend: Форма подтверждения SMS-кода (4-значный, таймер повторной отправки) | 2 | Frontend Dev | US-1.2 |
| S1-11 | Frontend: Страница заполнения профиля (имя, возраст, город, пол) | 2 | Frontend Dev | US-1.4 |
| S1-12 | Frontend: Zustand store для auth-состояния, interceptor для refresh token | 3 | Frontend Lead | - |
| S1-13 | Frontend: Layout приложения -- header, navigation, footer (по дизайн-системе) | 3 | Frontend Dev | - |
| S1-14 | Интеграция Unisender -- отправка email подтверждения | 2 | Backend Dev | US-1.1 |
| S1-15 | Prisma: миграции 001-002 (users, refresh_tokens, specialist_profiles, specialist_documents) | 2 | Backend Dev | - |

**Acceptance Criteria:**
- Регистрация по email: отправляется письмо, после подтверждения -- авторизация
- Регистрация по телефону: SMS приходит < 60 сек, код валидируется
- Дублирование email/телефона возвращает 409
- Refresh token обновляет access token, logout инвалидирует refresh
- Профиль: имя обязательно, возраст 18+, данные сохраняются и возвращаются в GET /users/me

---

## Sprint 2: Профили специалистов и основа UI (31.03 - 13.04.2026)

**Цель:** Реализовать регистрацию специалиста (подача заявки, загрузка документов), настройку профиля и основной UI-каркас (лендинг, навигация).

**Velocity Target:** 32 SP
**User Stories:** US-3.1, US-3.4, US-3.6 (частично)

| ID | Задача | SP | Роль | US |
|----|--------|-----|------|----|
| S2-01 | Backend: POST /specialists/apply -- заявка + загрузка документов (S3 upload) | 5 | Backend Dev | US-3.1 |
| S2-02 | Backend: S3-клиент (Yandex Object Storage) -- upload, signed URLs, размер/тип валидация | 3 | Backend Dev | US-3.1 |
| S2-03 | Backend: GET /specialists/me, PATCH /specialists/me -- профиль специалиста | 3 | Backend Dev | US-3.4 |
| S2-04 | Backend: PATCH /users/me/avatar -- загрузка аватара (resize, S3) | 2 | Backend Dev | - |
| S2-05 | Backend: Базовая RBAC -- Guards для CLIENT, SPECIALIST, ADMIN ролей | 3 | Tech Lead | - |
| S2-06 | Frontend: Страница "Стать специалистом" -- многошаговая форма заявки | 5 | Frontend Lead | US-3.1 |
| S2-07 | Frontend: Drag-and-drop загрузка документов (PDF, JPG, PNG; < 10MB) | 3 | Frontend Dev | US-3.1 |
| S2-08 | Frontend: Личный кабинет специалиста -- редактирование профиля, специализации (теги), цены | 3 | Frontend Dev | US-3.4 |
| S2-09 | Frontend: Лендинг (главная страница) -- hero, value proposition, CTA "Начать подбор" и "Стать специалистом" | 5 | Frontend Lead | - |
| S2-10 | Frontend: Компоненты UI-библиотеки: Button, Input, Select, Card, Tag, Badge, Avatar, Modal | 3 | Frontend Dev | - |
| S2-11 | Prisma: миграции 003-004 (value_profiles + pgvector, ai_conversations, ai_messages) | 2 | Backend Dev | - |
| S2-12 | QA: Написать e2e тесты (Playwright) для auth-flow (регистрация, логин, профиль) | 3 | QA | - |

**Acceptance Criteria:**
- Специалист подает заявку с документами, статус "PENDING"
- Файлы загружаются в S3, URL сохраняется в БД
- Профиль специалиста редактируется: био, цена, специализации, подходы
- Лендинг отображается, CTA ведут на регистрацию
- RBAC: клиент не может зайти на страницу специалиста и наоборот

---

## Sprint 3: ИИ-консультация клиента -- Backend (14.04 - 27.04.2026)

**Цель:** Реализовать серверную часть ИИ-консультации: LLM-сервис, WebSocket-чат, управление фазами диалога, кризисное обнаружение.

**Velocity Target:** 38 SP
**User Stories:** US-2.1, US-2.2, US-2.3, US-2.4, US-2.6

| ID | Задача | SP | Роль | US |
|----|--------|-----|------|----|
| S3-01 | Backend: LLM Service -- абстракция над Claude + GPT-4o-mini, retry, fallback, streaming | 8 | AI/ML Engineer | - |
| S3-02 | Backend: AI Chat Gateway (WebSocket, Socket.IO) -- подключение, rooms, аутентификация | 5 | Tech Lead | US-2.1 |
| S3-03 | Backend: Client Consultation Service -- state machine фаз (GREETING -> SITUATION -> VALUE -> FORMAT -> SUMMARY -> CONFIRMATION) | 8 | AI/ML Engineer | US-2.2, US-2.3, US-2.4 |
| S3-04 | Backend: System prompts -- базовый + по фазам (GREETING, SITUATION_EXPLORATION, VALUE_ASSESSMENT, FORMAT_PREFERENCES, SUMMARY) | 5 | AI/ML Engineer | US-2.2, US-2.3 |
| S3-05 | Backend: Crisis Detector -- keyword detection (realtime) + LLM analysis (в system prompt) | 5 | AI/ML Engineer | US-2.6 |
| S3-06 | Backend: POST /ai/consultations -- создание сессии, GET /ai/consultations/:id -- получение с историей | 3 | Backend Dev | US-2.1 |
| S3-07 | Backend: Шифрование сообщений (AES-256-GCM) для ai_messages.content | 3 | Backend Dev | - |
| S3-08 | Backend: Redis state management -- хранение промежуточного состояния чата | 3 | Tech Lead | - |
| S3-09 | Prisma: миграции для ai_conversations, ai_messages, crisis_alerts | 2 | Backend Dev | - |

**Acceptance Criteria:**
- WebSocket-соединение устанавливается, сообщения передаются в обе стороны
- ИИ отвечает с задержкой < 2 сек (first token), ответы стримятся
- Фазы переключаются корректно: GREETING (2-3 обмена) -> SITUATION (4-8) -> VALUE (5-8) -> FORMAT (2-4) -> SUMMARY
- При обнаружении кризисных ключевых слов -- CrisisAlert создается в БД
- Fallback на GPT-4o-mini работает при недоступности Claude

---

## Sprint 4: ИИ-консультация клиента -- Frontend + Извлечение ценностей (28.04 - 11.05.2026)

**Цель:** Реализовать чат-интерфейс ИИ-консультации, модуль извлечения ценностного профиля, резюме и подтверждение.

**Velocity Target:** 38 SP
**User Stories:** US-2.1, US-2.5, US-2.6

| ID | Задача | SP | Роль | US |
|----|--------|-----|------|----|
| S4-01 | Frontend: Чат-интерфейс -- стриминг ответов, индикатор набора, bubble-сообщения | 8 | Frontend Lead | US-2.1 |
| S4-02 | Frontend: Кнопки-действия в чате (быстрый выбор формата, бюджета, частоты) | 3 | Frontend Dev | US-2.4 |
| S4-03 | Frontend: Карточка-резюме в чате -- ценностный профиль, запрос, предпочтения | 5 | Frontend Lead | US-2.5 |
| S4-04 | Frontend: Визуализация ценностного профиля -- радар-диаграмма (Recharts) | 5 | Frontend Dev | US-2.5 |
| S4-05 | Frontend: Кризисный экран -- номера экстренной помощи, блокировка чата | 3 | Frontend Dev | US-2.6 |
| S4-06 | Frontend: Disclaimer при входе в ИИ-чат (конфиденциальность, ограничения) | 1 | Frontend Dev | - |
| S4-07 | Backend: Value Extraction Pipeline -- LLM structured output (JSON ценностного профиля) | 5 | AI/ML Engineer | - |
| S4-08 | Backend: Embedding Service -- text-embedding-3-small (OpenAI), генерация + сохранение в pgvector | 5 | AI/ML Engineer | - |
| S4-09 | Backend: POST /ai/consultations/:id/confirm -- подтверждение резюме, сохранение ValueProfile | 3 | Backend Dev | US-2.5 |
| S4-10 | Backend: GET /value-profile/me -- ценностный профиль пользователя | 2 | Backend Dev | - |
| S4-11 | QA: Тестирование ИИ-консультации -- 20 тестовых сценариев (разные профили, кризис) | 3 | QA + AI/ML | - |

**Acceptance Criteria:**
- Полный цикл: клиент проходит ИИ-консультацию (10-20 мин), видит резюме, подтверждает
- Ценностный профиль извлекается из диалога (10 осей + 4 стилевых измерения)
- Embedding генерируется и сохраняется в pgvector
- Радар-диаграмма отображает профиль
- Кризис: при обнаружении -- экран с номерами экстренной помощи
- Confidence extraction > 0.7 в 80% тестов

**Milestone M2 (AI Core) достигнут:** ИИ-консультация клиента работает end-to-end

---

## Sprint 5: ИИ-интервью специалиста + Алгоритм матчинга (12.05 - 25.05.2026)

**Цель:** Реализовать ИИ-интервью для специалистов и базовый алгоритм матчинга (уровни 1 и 2).

**Velocity Target:** 40 SP
**User Stories:** US-3.2, US-3.3, US-4.1 (частично)

| ID | Задача | SP | Роль | US |
|----|--------|-----|------|----|
| S5-01 | Backend: Specialist Interview Service -- state machine фаз (GREETING -> PROFESSIONAL -> CASE -> WORK_STYLE -> VALUE -> SUMMARY -> CONFIRM) | 8 | AI/ML Engineer | US-3.2 |
| S5-02 | Backend: System prompts для интервью специалиста (PROFESSIONAL_BACKGROUND, CASE_QUESTIONS, WORK_STYLE, VALUE_ASSESSMENT) | 5 | AI/ML Engineer | US-3.2 |
| S5-03 | Backend: Извлечение ценностного профиля специалиста (с доп. профессиональными измерениями) | 3 | AI/ML Engineer | US-3.2 |
| S5-04 | Backend: Генерация aiBio -- LLM создает публичное описание специалиста | 2 | AI/ML Engineer | - |
| S5-05 | Frontend: Чат-интерфейс ИИ-интервью для специалиста (переиспользование компонентов из Sprint 4) | 3 | Frontend Lead | US-3.2 |
| S5-06 | Frontend: Страница просмотра и подтверждения ценностного портрета специалиста | 3 | Frontend Dev | US-3.3 |
| S5-07 | Backend: Matching Service -- жесткие фильтры (SQL, уровень 1) | 5 | Backend Dev | US-4.1 |
| S5-08 | Backend: Matching Service -- ценностный матчинг (valueMatch, styleMatch, approachMatch, worldviewMatch, specializationRelevance) | 8 | AI/ML Engineer | US-4.1 |
| S5-09 | Backend: pgvector -- ANN-поиск ближайших специалистов (top-50 кандидатов) | 3 | AI/ML Engineer | US-4.1 |
| S5-10 | Prisma: миграции для matching_results, matching_feedback | 2 | Backend Dev | - |

**Acceptance Criteria:**
- Специалист проходит ИИ-интервью (20-40 мин), получает ценностный портрет
- Портрет включает 10 осей ценностей + 4 стилевых + 3 профессиональных измерения
- aiBio генерируется автоматически
- Алгоритм матчинга: на вход -- профиль клиента, на выход -- отсортированный список с match score
- Для тестовых данных (10 специалистов): адекватное ранжирование

---

## Sprint 6: Рекомендации и обратная связь (26.05 - 08.06.2026)

**Цель:** Реализовать генерацию рекомендаций Top-5, объяснения совпадения, обратную связь по рекомендациям.

**Velocity Target:** 38 SP
**User Stories:** US-4.1, US-4.2, US-4.3, US-4.4

| ID | Задача | SP | Роль | US |
|----|--------|-----|------|----|
| S6-01 | Backend: POST /matching/recommendations -- оркестрация: фильтрация -> ANN -> scoring -> top-5 -> объяснения | 5 | Backend Dev | US-4.1 |
| S6-02 | Backend: Explanation Service -- LLM генерирует human-readable объяснения для каждого из top-5 | 5 | AI/ML Engineer | US-4.2 |
| S6-03 | Backend: POST /matching/feedback -- сохранение обратной связи (selected, rejected, viewed) | 3 | Backend Dev | US-4.3 |
| S6-04 | Backend: GET /matching/score/:specialistId -- процент совпадения с конкретным специалистом | 2 | Backend Dev | US-4.4 |
| S6-05 | Frontend: Страница рекомендаций -- карточки Top-5 специалистов с match score | 5 | Frontend Lead | US-4.1 |
| S6-06 | Frontend: Раскрывающееся объяснение "Почему подходит?" с радар-диаграммой сравнения | 5 | Frontend Dev | US-4.2 |
| S6-07 | Frontend: Кнопка "Не подходит" с модалкой причины отклонения | 2 | Frontend Dev | US-4.3 |
| S6-08 | Frontend: Переход от ИИ-консультации к рекомендациям (flow: подтвердить резюме -> загрузка рекомендаций -> список) | 3 | Frontend Lead | US-4.1 |
| S6-09 | Backend: Оптимизация: время генерации рекомендаций < 5 сек (параллельные LLM-вызовы для объяснений) | 3 | AI/ML Engineer | - |
| S6-10 | Seed: 10 тестовых специалистов с ценностными профилями и embeddings для тестирования матчинга | 2 | Backend Dev | - |
| S6-11 | QA: E2E тест полного цикла: регистрация -> ИИ-консультация -> рекомендации | 3 | QA | - |

**Acceptance Criteria:**
- Клиент после подтверждения резюме видит Top-5 специалистов за < 5 сек
- Для каждого -- 3-5 пунктов объяснения на понятном языке
- Радар-диаграмма сравнения клиент/специалист
- Обратная связь сохраняется, при отклонении можно запросить доп. рекомендации
- В каталоге рядом с каждым специалистом -- процент совпадения (для авторизованных клиентов с профилем)

**Milestone M3 (Matching Engine) достигнут**

---

## Sprint 7: Каталог специалистов + Расписание (09.06 - 22.06.2026)

**Цель:** Реализовать каталог специалистов с фильтрацией и поиском, настройку расписания, просмотр доступных слотов.

**Velocity Target:** 42 SP
**User Stories:** US-5.1, US-3.4 (расписание)

| ID | Задача | SP | Роль | US |
|----|--------|-----|------|----|
| S7-01 | Backend: GET /catalog/specialists -- фильтрация (тип, специализация, цена, формат, рейтинг), сортировка, курсорная пагинация | 5 | Backend Dev | - |
| S7-02 | Backend: Полнотекстовый поиск -- PostgreSQL FTS (tsvector, GIN-индекс, триггер) | 5 | Backend Dev | - |
| S7-03 | Backend: GET /catalog/specializations -- список специализаций и подходов с количеством | 2 | Backend Dev | - |
| S7-04 | Backend: GET /specialists/:id -- публичный профиль с matchScore (если авторизован) | 3 | Backend Dev | - |
| S7-05 | Backend: Schedule module -- PUT /schedule/me, GET /schedule/me (recurring + custom slots) | 5 | Backend Dev | US-3.4 |
| S7-06 | Backend: GET /bookings/slots/:specialistId -- доступные слоты на 14 дней с учетом часового пояса | 5 | Backend Dev | US-5.1 |
| S7-07 | Frontend: Страница каталога -- карточки специалистов, фильтры (sidebar), поиск, сортировка | 8 | Frontend Lead | - |
| S7-08 | Frontend: Страница публичного профиля специалиста -- фото, био, ценности, рейтинг, отзывы, matchScore | 5 | Frontend Dev | - |
| S7-09 | Frontend: Настройка расписания специалиста -- визуальный редактор недельного расписания | 5 | Frontend Dev | US-3.4 |
| S7-10 | Frontend: Виджет выбора слота -- календарь с доступными временами | 3 | Frontend Lead | US-5.1 |
| S7-11 | Prisma: миграции для schedule_slots, индексы FTS | 2 | Backend Dev | - |

**Acceptance Criteria:**
- Каталог отображает только верифицированных специалистов
- Фильтры работают: тип, специализация, цена (диапазон), формат, рейтинг
- Полнотекстовый поиск по био и специализациям
- Сортировка: по match score, рейтингу, цене (asc/desc), количеству отзывов
- Расписание: специалист задает повторяющиеся слоты + разовые, клиент видит свободные слоты
- Часовые пояса: слоты отображаются в поясе клиента

---

## Sprint 8: Бронирование + Оплата (23.06 - 06.07.2026)

**Цель:** Реализовать бронирование сессий и оплату через ЮKassa. Полный цикл: выбор слота -> бронирование -> оплата -> подтверждение.

**Velocity Target:** 42 SP
**User Stories:** US-5.2, US-5.3, US-6.1, US-6.3

| ID | Задача | SP | Роль | US |
|----|--------|-----|------|----|
| S8-01 | Backend: POST /bookings -- создание бронирования (lock slot, проверка доступности, расчет цены/комиссии) | 5 | Backend Dev | US-5.2 |
| S8-02 | Backend: ЮKassa интеграция -- создание платежа (bank_card), confirmation URL, idempotency | 8 | Backend Dev | US-6.1 |
| S8-03 | Backend: POST /payments/webhook/yookassa -- обработка webhook (payment.succeeded, payment.cancelled), верификация подписи | 5 | Backend Dev | US-6.1 |
| S8-04 | Backend: При успешной оплате -- подтверждение бронирования, генерация видеоссылки, уведомления | 3 | Backend Dev | US-5.2 |
| S8-05 | Backend: POST /bookings/:id/cancel -- отмена с расчетом возврата (24h/12h/менее) | 3 | Backend Dev | US-5.3 |
| S8-06 | Backend: POST /bookings/:id/reschedule -- перенос с проверкой 12h и доступности нового слота | 3 | Backend Dev | US-5.3 |
| S8-07 | Backend: Payout Service -- расчет выплат специалистам (баланс, история) | 3 | Backend Dev | US-6.3 |
| S8-08 | Frontend: Страница бронирования -- сводка (специалист, время, цена), кнопка "Оплатить" | 3 | Frontend Lead | US-5.2 |
| S8-09 | Frontend: Redirect на ЮKassa, обработка return URL (success/fail) | 2 | Frontend Dev | US-6.1 |
| S8-10 | Frontend: Страница "Мои бронирования" -- список с фильтром по статусу, кнопки отмены/переноса | 3 | Frontend Dev | US-5.2 |
| S8-11 | Frontend: Страница подтверждения бронирования (success) -- детали, ссылка на видео | 2 | Frontend Dev | US-5.2 |
| S8-12 | Prisma: миграции для bookings, booking_reminders, payments, payouts | 2 | Backend Dev | - |
| S8-13 | QA: Тестирование платежей (тестовый режим ЮKassa): успешная оплата, ошибка, возврат | 3 | QA | - |

**Acceptance Criteria:**
- Бронирование: клиент выбирает слот, переходит на оплату, после успешной оплаты -- CONFIRMED
- Конкурентный доступ: два клиента не могут забронировать один слот (lock)
- Отмена > 24h: возврат 100%, 12-24h: 50%, < 12h: 0%
- Webhook ЮKassa корректно обрабатывает все статусы
- Специалист видит свой баланс и историю сессий

**Milestone M4 (Booking + Payments) достигнут**

---

## Sprint 9: Уведомления + Отзывы + Интеграция видео (07.07 - 20.07.2026)

**Цель:** Уведомления (email, SMS, in-app), отзывы с модерацией, интеграция с Zoom/Google Meet, напоминания о сессиях.

**Velocity Target:** 40 SP
**User Stories:** US-5.4, US-5.6, US-7.1, US-7.2

| ID | Задача | SP | Роль | US |
|----|--------|-----|------|----|
| S9-01 | Backend: Notification Module -- единый сервис отправки (email, SMS, in-app) | 5 | Backend Dev | US-5.4 |
| S9-02 | Backend: BullMQ jobs -- напоминания о сессии (24h email, 1h in-app, 10min in-app + ссылка) | 5 | Backend Dev | US-5.4 |
| S9-03 | Backend: In-app нотификации через WebSocket (/notifications namespace) | 3 | Tech Lead | - |
| S9-04 | Backend: GET /notifications, PATCH /notifications/:id/read, PATCH /notifications/read-all | 2 | Backend Dev | - |
| S9-05 | Backend: Review Module -- POST /reviews, GET /reviews/specialist/:id, модерация | 5 | Backend Dev | US-7.1 |
| S9-06 | Backend: BullMQ job -- запрос отзыва через 24h после сессии | 2 | Backend Dev | US-7.1 |
| S9-07 | Backend: Match Rating -- отдельная оценка "насколько подошел" (1-10), учет в аналитике | 2 | Backend Dev | US-7.2 |
| S9-08 | Backend: Zoom API интеграция -- создание встречи при бронировании (если специалист использует Zoom) | 3 | Backend Dev | US-5.6 |
| S9-09 | Backend: Google Meet API -- генерация ссылки на встречу | 3 | Backend Dev | US-5.6 |
| S9-10 | Frontend: Колокольчик уведомлений в header, панель уведомлений (dropdown) | 3 | Frontend Dev | - |
| S9-11 | Frontend: Форма отзыва -- 5 звезд + текст + оценка матчинга (1-10) | 3 | Frontend Dev | US-7.1 |
| S9-12 | Frontend: Отзывы на странице профиля специалиста (список, средняя оценка, распределение) | 3 | Frontend Lead | US-7.1 |
| S9-13 | Prisma: миграции для reviews, notifications | 1 | Backend Dev | - |

**Acceptance Criteria:**
- Напоминания: email за 24h, in-app за 1h и 10min (с ссылкой на видео)
- Отзывы: клиент оставляет после сессии, модерация перед публикацией, анонимность
- Match rating: приватный, сохраняется для аналитики
- Zoom/Meet: ссылка создается автоматически при бронировании онлайн-сессии
- In-app уведомления приходят в реальном времени через WebSocket

---

## Sprint 10: Админ-панель + Подписки + Промокоды (21.07 - 03.08.2026)

**Цель:** Реализовать админ-панель (модерация, дашборд), подписки специалистов и клиентов, промокоды.

**Velocity Target:** 40 SP
**User Stories:** US-8.1, US-8.2, US-8.3, US-8.5, US-6.5

| ID | Задача | SP | Роль | US |
|----|--------|-----|------|----|
| S10-01 | Backend: Admin Module -- модерация заявок специалистов (approve/reject, уведомление) | 3 | Backend Dev | US-8.1 |
| S10-02 | Backend: Admin -- модерация отзывов (publish/reject/request_edit) | 2 | Backend Dev | US-8.2 |
| S10-03 | Backend: Admin Dashboard -- GET /admin/dashboard (метрики по периоду: регистрации, консультации, бронирования, GMV, воронка) | 5 | Backend Dev | US-8.3 |
| S10-04 | Backend: Crisis Alerts -- GET /admin/crisis-alerts, POST /admin/crisis-alerts/:id/resolve | 2 | Backend Dev | US-8.5 |
| S10-05 | Backend: Subscription Service -- POST /subscriptions/specialist, DELETE /subscriptions/specialist | 5 | Backend Dev | US-6.5 |
| S10-06 | Backend: ЮKassa рекуррентные платежи -- автопродление подписок | 3 | Backend Dev | US-6.5 |
| S10-07 | Backend: PromoCode -- CRUD, валидация при бронировании, учет использования | 3 | Backend Dev | - |
| S10-08 | Frontend (Admin): Инициализация apps/admin (Next.js), layout, навигация | 3 | Frontend Lead | - |
| S10-09 | Frontend (Admin): Список заявок специалистов, просмотр документов, кнопки approve/reject | 3 | Frontend Dev | US-8.1 |
| S10-10 | Frontend (Admin): Модерация отзывов -- очередь, действия | 2 | Frontend Dev | US-8.2 |
| S10-11 | Frontend (Admin): Дашборд -- графики по метрикам (Recharts) | 5 | Frontend Lead | US-8.3 |
| S10-12 | Frontend (Admin): Кризисные алерты -- список, статусы, действия | 2 | Frontend Dev | US-8.5 |
| S10-13 | Frontend: Страница тарифов специалиста (Базовый/Профессионал/Эксперт), оформление подписки | 3 | Frontend Dev | US-6.5 |
| S10-14 | Prisma: миграции для subscriptions, promo_codes | 1 | Backend Dev | - |

**Acceptance Criteria:**
- Админ видит заявки специалистов, может одобрить/отклонить с комментарием
- Одобренный специалист получает уведомление, профиль появляется в каталоге
- Отзывы проходят модерацию перед публикацией
- Дашборд: метрики по периоду (день/неделя/месяц), графики воронки
- Кризисные алерты: real-time уведомления администратору
- Подписки: оплата, автопродление, отмена, переключение тарифа
- Промокоды: создание, применение при бронировании

**Milestone M5 (Admin + Integration) достигнут**

---

## Sprint 11: QA, полировка, закрытая бета (04.08 - 17.08.2026)

**Цель:** Всестороннее тестирование, исправление багов, оптимизация производительности, запуск закрытой беты.

**Velocity Target:** 28 SP (фокус на качестве, не на новых фичах)

| ID | Задача | SP | Роль |
|----|--------|-----|------|
| S11-01 | QA: Полный регрессионный тест -- все User Stories (Must) | 5 | QA |
| S11-02 | QA: E2E тесты Playwright -- happy path всех основных потоков (клиент, специалист, админ) | 5 | QA + Frontend |
| S11-03 | Performance: Load-тест (k6/Artillery) -- 500 concurrent users, 50 AI-сессий | 3 | DevOps |
| S11-04 | Performance: Оптимизация узких мест (API latency, DB queries, кеширование) | 3 | Tech Lead |
| S11-05 | Security: Аудит OWASP Top 10 (XSS, CSRF, SQL injection, auth bypass) | 3 | Tech Lead |
| S11-06 | Security: Проверка ФЗ-152 чеклиста (хранение ПД, согласия, право на удаление) | 2 | Backend Dev |
| S11-07 | Bugfix: Исправление P0 и P1 багов из предыдущих спринтов | 5 | Все |
| S11-08 | UX: Полировка UI -- анимации, skeleton-загрузки, error states, empty states | 3 | Frontend Lead |
| S11-09 | DevOps: Production кластер K8s, backup PostgreSQL, мониторинг алерты | 3 | DevOps |
| S11-10 | Content: Юридические страницы (оферта, политика конфиденциальности, согласие ПД) | 2 | Product Owner |
| S11-11 | Operations: Seed 20-30 специалистов на production (ручной рекрутинг + ИИ-интервью) | 3 | Product Owner |
| S11-12 | Beta: Запуск закрытой беты -- 50-100 приглашенных клиентов, сбор обратной связи | 2 | Product Owner |

**Acceptance Criteria:**
- 0 открытых P0 (блокеров), < 5 открытых P1 (критических)
- Load test: API p95 < 500ms при 500 concurrent users
- Security audit: 0 критических и высоких уязвимостей
- 20-30 специалистов с ценностными профилями на production
- Бета-тестеры получили доступ и прислали первую обратную связь

**Milestone M6 (Beta Launch) достигнут: 04.08.2026**

---

## Sprint 12: Запуск MVP (18.08 - 31.08.2026)

**Цель:** Публичный запуск MVP. Исправление багов из беты, финальная подготовка, launch.

**Velocity Target:** 25 SP

| ID | Задача | SP | Роль |
|----|--------|-----|------|
| S12-01 | Bugfix: Исправление багов из закрытой беты | 5 | Все |
| S12-02 | AI Quality: Тюнинг промптов по фидбэку из беты (консультация + интервью) | 3 | AI/ML Engineer |
| S12-03 | AI Quality: Калибровка весов матчинга по реальным данным | 3 | AI/ML Engineer |
| S12-04 | SEO: Meta-теги, Open Graph, структурированные данные (Schema.org) для каталога | 2 | Frontend Lead |
| S12-05 | Analytics: Интеграция с Yandex Metrika / Google Analytics | 2 | Frontend Dev |
| S12-06 | Content: FAQ-страница, страница "Как это работает" | 2 | Frontend Dev |
| S12-07 | DevOps: CDN warmup, DNS production, финальная проверка мониторинга | 2 | DevOps |
| S12-08 | Operations: Рекрутинг -- довести до 50+ специалистов на платформе | 2 | Product Owner |
| S12-09 | Operations: On-call ротация, runbook для инцидентов | 1 | DevOps + Tech Lead |
| S12-10 | Launch: Переключение DNS, публичный доступ | 1 | DevOps |
| S12-11 | Launch: Post-launch мониторинг (первые 48 часов -- усиленное дежурство) | 2 | Все |
| S12-12 | Ретроспектива MVP -- что прошло хорошо, что улучшить для Phase 2 | 1 | PM |

**Acceptance Criteria:**
- Все Must-требования из PRD реализованы и работают
- 50+ специалистов на платформе
- Публичный доступ по soulmate.ru
- Мониторинг: все дашборды работают, алерты срабатывают
- 0 P0, < 3 P1 багов
- Промокод LAUNCH работает

**Milestone M7 (MVP Launch) достигнут: 18.08.2026**

---

## Сводная таблица

| Sprint | Даты | SP | Фокус | Milestone |
|--------|------|-----|-------|-----------|
| 0 | 03.03 - 16.03 | 20 | Инфраструктура, CI/CD, каркас | M0: Kickoff |
| 1 | 17.03 - 30.03 | 30 | Auth, регистрация, профиль клиента | - |
| 2 | 31.03 - 13.04 | 32 | Профиль специалиста, UI-каркас, лендинг | M1: Auth + Profiles |
| 3 | 14.04 - 27.04 | 38 | ИИ-консультация backend (LLM, WebSocket, фазы) | - |
| 4 | 28.04 - 11.05 | 38 | ИИ-консультация frontend, извлечение ценностей | M2: AI Core |
| 5 | 12.05 - 25.05 | 40 | ИИ-интервью специалиста, алгоритм матчинга | - |
| 6 | 26.05 - 08.06 | 38 | Рекомендации Top-5, объяснения, обратная связь | M3: Matching Engine |
| 7 | 09.06 - 22.06 | 42 | Каталог, поиск, расписание, слоты | - |
| 8 | 23.06 - 06.07 | 42 | Бронирование, оплата ЮKassa, возвраты | M4: Booking + Payments |
| 9 | 07.07 - 20.07 | 40 | Уведомления, отзывы, Zoom/Meet | - |
| 10 | 21.07 - 03.08 | 40 | Админ-панель, подписки, промокоды | M5: Admin + Integration |
| 11 | 04.08 - 17.08 | 28 | QA, безопасность, бета-запуск | M6: Beta Launch |
| 12 | 18.08 - 31.08 | 25 | Фикс багов, тюнинг AI, публичный запуск | M7: MVP Launch |
| **Итого** | **26 недель** | **433** | | |
