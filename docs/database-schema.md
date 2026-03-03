# SoulMate -- Схема базы данных

**Версия:** 1.0
**Дата:** 2026-03-03
**СУБД:** PostgreSQL 16 + pgvector
**ORM:** Prisma 5

---

## 1. ER-диаграмма (высокоуровневая)

```
+------------------+       +-------------------+       +-------------------+
|      User        |       |   Specialist      |       |  ValueProfile     |
|------------------|       |   Profile         |       |-------------------|
| id (PK)          |<----->| id (PK)           |<----->| id (PK)           |
| email            |  1:1  | user_id (FK)      |  1:1  | owner_id (FK)     |
| phone            |       | specialization    |       | owner_type        |
| role             |       | experience_years  |       | values_json       |
| password_hash    |       | session_price     |       | embedding (vector)|
| ...              |       | verified          |       | ...               |
+--------+---------+       +-------------------+       +-------------------+
         |                          |
         | 1:N                      | 1:N
         v                          v
+------------------+       +-------------------+
|    Booking       |       |  ScheduleSlot     |
|------------------|       |-------------------|
| id (PK)          |       | id (PK)           |
| client_id (FK)   |       | specialist_id(FK) |
| specialist_id(FK)|       | day_of_week       |
| slot_start       |       | start_time        |
| slot_end         |       | end_time          |
| status           |       | is_recurring      |
| ...              |       +-------------------+
+--------+---------+
         |
         | 1:1
         v
+------------------+       +-------------------+
|    Payment       |       |     Review        |
|------------------|       |-------------------|
| id (PK)          |       | id (PK)           |
| booking_id (FK)  |       | booking_id (FK)   |
| amount           |       | client_id (FK)    |
| status           |       | specialist_id(FK) |
| provider_id      |       | rating            |
| ...              |       | match_rating      |
+------------------+       +-------------------+

+------------------+       +-------------------+
| AIConversation   |       |    Message        |
|------------------|       |-------------------|
| id (PK)          |<----->| id (PK)           |
| user_id (FK)     |  1:N  | conversation_id   |
| type             |       | role (user/ai)    |
| status           |       | content           |
| phase            |       | ...               |
+------------------+       +-------------------+

+------------------+       +-------------------+
|  Subscription    |       |  Notification     |
|------------------|       |-------------------|
| id (PK)          |       | id (PK)           |
| user_id (FK)     |       | user_id (FK)      |
| plan             |       | type              |
| status           |       | channel           |
| ...              |       | ...               |
+------------------+       +-------------------+
```

---

## 2. Prisma-схема

```prisma
// prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgvector(map: "vector", schema: "public")]
}

// =========================================
// ПОЛЬЗОВАТЕЛИ
// =========================================

enum UserRole {
  CLIENT
  SPECIALIST
  ADMIN
}

enum AuthProvider {
  EMAIL
  PHONE
  GOOGLE
  VK
}

model User {
  id            String       @id @default(cuid())
  email         String?      @unique
  phone         String?      @unique
  passwordHash  String?      @map("password_hash")
  role          UserRole
  authProvider  AuthProvider  @default(EMAIL) @map("auth_provider")
  externalId    String?      @map("external_id") // OAuth provider ID

  // Базовый профиль
  firstName     String?      @map("first_name")
  lastName      String?      @map("last_name")
  age           Int?
  gender        String?      // male, female, other, prefer_not_to_say
  city          String?
  timezone      String       @default("Europe/Moscow")
  avatarUrl     String?      @map("avatar_url")
  locale        String       @default("ru")

  // Статусы
  emailVerified Boolean      @default(false) @map("email_verified")
  phoneVerified Boolean      @default(false) @map("phone_verified")
  isActive      Boolean      @default(true) @map("is_active")
  isBanned      Boolean      @default(false) @map("is_banned")
  totpSecret    String?      @map("totp_secret") // 2FA для специалистов

  // Согласия
  privacyAcceptedAt  DateTime? @map("privacy_accepted_at")
  termsAcceptedAt    DateTime? @map("terms_accepted_at")

  createdAt     DateTime     @default(now()) @map("created_at")
  updatedAt     DateTime     @updatedAt @map("updated_at")
  lastLoginAt   DateTime?    @map("last_login_at")

  // Связи
  specialistProfile   SpecialistProfile?
  valueProfile        ValueProfile?
  clientBookings      Booking[]           @relation("ClientBookings")
  clientReviews       Review[]            @relation("ClientReviews")
  aiConversations     AIConversation[]
  notifications       Notification[]
  clientSubscription  ClientSubscription?
  refreshTokens       RefreshToken[]
  matchingFeedback    MatchingFeedback[]
  directMessages      DirectMessage[]     @relation("SenderMessages")

  @@map("users")
}

model RefreshToken {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")
  revokedAt DateTime? @map("revoked_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("refresh_tokens")
}

// =========================================
// ПРОФИЛЬ СПЕЦИАЛИСТА
// =========================================

enum SpecialistType {
  PSYCHOLOGIST     // Психолог
  COACH            // Коуч
  PSYCHOTHERAPIST  // Психотерапевт
}

enum VerificationStatus {
  PENDING     // Ожидает проверки
  APPROVED    // Одобрен
  REJECTED    // Отклонен
  SUSPENDED   // Приостановлен
}

model SpecialistProfile {
  id               String             @id @default(cuid())
  userId           String             @unique @map("user_id")
  type             SpecialistType
  verification     VerificationStatus @default(PENDING)

  // Профессиональные данные
  education        String?            // Основное образование
  experienceYears  Int                @map("experience_years")
  approaches       String[]           // ["КПТ", "Гештальт", "Психоанализ"]
  specializations  String[]           // ["Тревожность", "Отношения", "Карьера"]
  languages        String[]           @default(["ru"]) // Языки работы
  bio              String?            // Текстовое описание (до 2000 символов)
  aiBio            String?            @map("ai_bio") // Описание, сгенерированное ИИ

  // Рабочие параметры
  sessionPrice     Int                @map("session_price")   // В рублях
  sessionDuration  Int                @default(50) @map("session_duration") // В минутах
  workFormats      String[]           @map("work_formats") // ["online", "offline", "hybrid"]
  preferredGender  String?            @map("preferred_gender") // Предпочтительный пол клиентов

  // Видеосервис
  videoProvider    String?            @map("video_provider") // "zoom", "google_meet", "platform"
  videoLink        String?            @map("video_link")     // Постоянная ссылка (если есть)

  // Медиа
  videoIntroUrl    String?            @map("video_intro_url")  // Видео-визитка
  videoIntroStatus String?            @map("video_intro_status") // pending, approved, rejected

  // Рейтинг (денормализованные данные для быстрого доступа)
  averageRating    Float              @default(0) @map("average_rating")
  totalReviews     Int                @default(0) @map("total_reviews")
  totalSessions    Int                @default(0) @map("total_sessions")

  // Подписка специалиста
  subscriptionPlan String             @default("basic") @map("subscription_plan") // basic, professional, expert
  commissionRate   Float              @default(0.20) @map("commission_rate") // 0.20 = 20%
  maxMonthlyClients Int?              @map("max_monthly_clients") // null = unlimited

  // Модерация
  verifiedAt       DateTime?          @map("verified_at")
  verifiedBy       String?            @map("verified_by") // Admin user ID
  rejectionReason  String?            @map("rejection_reason")

  createdAt        DateTime           @default(now()) @map("created_at")
  updatedAt        DateTime           @updatedAt @map("updated_at")

  // Связи
  user             User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  documents        SpecialistDocument[]
  scheduleSlots    ScheduleSlot[]
  bookings         Booking[]          @relation("SpecialistBookings")
  reviews          Review[]           @relation("SpecialistReviews")
  specialistSubscription SpecialistSubscription?
  payouts          Payout[]

  @@index([type])
  @@index([verification])
  @@index([sessionPrice])
  @@index([averageRating])
  @@index([type, verification, sessionPrice])
  @@map("specialist_profiles")
}

model SpecialistDocument {
  id              String   @id @default(cuid())
  specialistId    String   @map("specialist_id")
  type            String   // "diploma", "certificate", "license"
  fileName        String   @map("file_name")
  fileUrl         String   @map("file_url")
  fileSize        Int      @map("file_size") // В байтах
  mimeType        String   @map("mime_type")
  status          String   @default("pending") // pending, approved, rejected
  reviewComment   String?  @map("review_comment")

  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  specialist      SpecialistProfile @relation(fields: [specialistId], references: [id], onDelete: Cascade)

  @@index([specialistId])
  @@map("specialist_documents")
}

// =========================================
// ЦЕННОСТНЫЕ ПРОФИЛИ
// =========================================

enum ValueProfileOwnerType {
  CLIENT
  SPECIALIST
}

model ValueProfile {
  id          String                @id @default(cuid())
  userId      String                @unique @map("user_id")
  ownerType   ValueProfileOwnerType @map("owner_type")

  // Ценностные оси (0.0 - 1.0)
  // Хранятся как JSON для гибкости добавления новых осей
  values      Json                  // { "family": 0.8, "career": 0.6, ... }

  // Стиль коммуникации (0.0 - 1.0)
  communicationStyle Json           @map("communication_style")
  // { "directive_vs_supportive": 0.3,
  //   "analytical_vs_intuitive": 0.7,
  //   "structured_vs_free": 0.8,
  //   "past_vs_future": 0.6 }

  // Мировоззренческие установки
  worldview   Json?                 // { "pragmatic_vs_idealistic": 0.5, ... }

  // Для клиента: тип запроса и предпочтения
  requestType     String?           @map("request_type")    // therapy, coaching, crisis
  requestSummary  String?           @map("request_summary") // Краткое резюме запроса
  preferences     Json?             // { "format": "online", "price_range": [2000, 5000], ... }

  // Для специалиста: профессиональные ценности
  professionalValues Json?          @map("professional_values")
  // { "depth_vs_speed": 0.8,
  //   "evidence_vs_intuition": 0.6,
  //   "boundaries_strict_vs_flexible": 0.7 }

  // Embedding для векторного поиска (1536 dimensions, text-embedding-3-small)
  embedding   Unsupported("vector(1536)")?

  // Текстовое резюме для отображения
  summaryText String?               @map("summary_text")

  // Версионирование
  version     Int                   @default(1)
  conversationId String?            @map("conversation_id") // ИИ-разговор, породивший этот профиль

  createdAt   DateTime              @default(now()) @map("created_at")
  updatedAt   DateTime              @updatedAt @map("updated_at")

  user        User                  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([ownerType])
  @@map("value_profiles")
}

// =========================================
// ИИ-РАЗГОВОРЫ
// =========================================

enum ConversationType {
  CLIENT_CONSULTATION    // ИИ-консультация клиента
  SPECIALIST_INTERVIEW   // ИИ-интервью специалиста
  PROFILE_CORRECTION     // Корректировка профиля
}

enum ConversationStatus {
  ACTIVE       // В процессе
  COMPLETED    // Завершен, профиль сформирован
  ABANDONED    // Прерван пользователем
  CRISIS       // Обнаружено кризисное состояние
}

enum ConversationPhase {
  GREETING                 // Приветствие
  SITUATION_EXPLORATION    // Прояснение ситуации (клиент)
  VALUE_ASSESSMENT         // Ценностное интервью
  FORMAT_PREFERENCES       // Предпочтения по формату (клиент)
  PROFESSIONAL_BACKGROUND  // Профессиональный блок (специалист)
  WORK_STYLE               // Стиль работы (специалист)
  CASE_QUESTIONS           // Кейс-вопросы (специалист)
  SUMMARY                  // Резюме
  CONFIRMATION             // Подтверждение
}

model AIConversation {
  id           String             @id @default(cuid())
  userId       String             @map("user_id")
  type         ConversationType
  status       ConversationStatus @default(ACTIVE)
  phase        ConversationPhase  @default(GREETING)

  // Метаданные
  startedAt    DateTime           @default(now()) @map("started_at")
  completedAt  DateTime?          @map("completed_at")
  totalTokens  Int                @default(0) @map("total_tokens")
  llmModel     String?            @map("llm_model") // claude-3.5-sonnet, gpt-4o-mini
  costUsd      Float              @default(0) @map("cost_usd")

  // Промежуточное состояние (для восстановления сессии)
  stateJson    Json?              @map("state_json")

  // Результат
  extractedValues Json?           @map("extracted_values")
  crisisDetected  Boolean         @default(false) @map("crisis_detected")

  createdAt    DateTime           @default(now()) @map("created_at")
  updatedAt    DateTime           @updatedAt @map("updated_at")

  // Связи
  user         User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages     AIMessage[]

  @@index([userId])
  @@index([type, status])
  @@index([createdAt])
  @@map("ai_conversations")
}

model AIMessage {
  id              String         @id @default(cuid())
  conversationId  String         @map("conversation_id")
  role            String         // "user", "assistant", "system"
  content         String         // Текст сообщения (шифруется на уровне приложения)
  contentEncrypted Boolean       @default(true) @map("content_encrypted")

  // Метаданные
  phase           ConversationPhase?
  tokensUsed      Int            @default(0) @map("tokens_used")
  metadata        Json?          // Дополнительные данные (кнопки, карточки)

  createdAt       DateTime       @default(now()) @map("created_at")

  conversation    AIConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@index([conversationId, createdAt])
  @@map("ai_messages")
}

// =========================================
// РАСПИСАНИЕ
// =========================================

model ScheduleSlot {
  id            String            @id @default(cuid())
  specialistId  String            @map("specialist_id")

  // Повторяющийся слот
  isRecurring   Boolean           @default(true) @map("is_recurring")
  dayOfWeek     Int?              @map("day_of_week") // 0=ПН, 6=ВС (для recurring)
  startTime     String?           @map("start_time") // "09:00" (для recurring)
  endTime       String?           @map("end_time")   // "10:00" (для recurring)

  // Конкретный слот (для разовых или сгенерированных из recurring)
  slotDate      DateTime?         @map("slot_date") @db.Date // Конкретная дата
  slotStart     DateTime?         @map("slot_start") // Конкретное начало
  slotEnd       DateTime?         @map("slot_end")   // Конкретный конец

  isAvailable   Boolean           @default(true) @map("is_available")

  createdAt     DateTime          @default(now()) @map("created_at")
  updatedAt     DateTime          @updatedAt @map("updated_at")

  specialist    SpecialistProfile @relation(fields: [specialistId], references: [id], onDelete: Cascade)

  @@index([specialistId, slotDate])
  @@index([specialistId, dayOfWeek])
  @@index([specialistId, isAvailable, slotDate])
  @@map("schedule_slots")
}

// =========================================
// БРОНИРОВАНИЕ
// =========================================

enum BookingStatus {
  PENDING_PAYMENT   // Ожидает оплаты
  CONFIRMED         // Подтверждено и оплачено
  IN_PROGRESS       // Сессия идет
  COMPLETED         // Сессия завершена
  CANCELLED_CLIENT  // Отменено клиентом
  CANCELLED_SPEC    // Отменено специалистом
  NO_SHOW           // Неявка
  RESCHEDULED       // Перенесено
}

model Booking {
  id             String        @id @default(cuid())
  clientId       String        @map("client_id")
  specialistId   String        @map("specialist_id")

  // Время
  slotStart      DateTime      @map("slot_start")
  slotEnd        DateTime      @map("slot_end")
  duration       Int           // Минуты (50 по умолчанию)
  timezone       String        // Часовой пояс клиента

  // Статус
  status         BookingStatus @default(PENDING_PAYMENT)
  format         String        // "online", "offline"

  // Видеозвонок
  videoLink      String?       @map("video_link")
  videoProvider  String?       @map("video_provider")

  // Пакет (если входит в пакет)
  packageId      String?       @map("package_id")

  // Стоимость
  price          Int           // Цена для клиента в рублях
  commission     Int           // Комиссия платформы в рублях
  specialistPayout Int         @map("specialist_payout") // Выплата специалисту

  // Отмена
  cancelledAt    DateTime?     @map("cancelled_at")
  cancelReason   String?       @map("cancel_reason")
  refundAmount   Int?          @map("refund_amount")

  // Матчинг
  matchScore     Float?        @map("match_score") // Процент совпадения на момент бронирования
  matchSource    String?       @map("match_source") // "ai_recommendation", "catalog_browse", "repeat"

  createdAt      DateTime      @default(now()) @map("created_at")
  updatedAt      DateTime      @updatedAt @map("updated_at")

  // Связи
  client         User          @relation("ClientBookings", fields: [clientId], references: [id])
  specialist     SpecialistProfile @relation("SpecialistBookings", fields: [specialistId], references: [id])
  payment        Payment?
  review         Review?
  sessionPackage SessionPackage? @relation(fields: [packageId], references: [id])
  reminders      BookingReminder[]

  @@index([clientId, status])
  @@index([specialistId, status])
  @@index([slotStart])
  @@index([status, slotStart])
  @@map("bookings")
}

model BookingReminder {
  id          String   @id @default(cuid())
  bookingId   String   @map("booking_id")
  type        String   // "24h", "1h", "10min"
  channel     String   // "email", "sms", "push"
  sentAt      DateTime? @map("sent_at")
  scheduledAt DateTime @map("scheduled_at")

  booking     Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)

  @@index([scheduledAt, sentAt])
  @@map("booking_reminders")
}

// =========================================
// ПЛАТЕЖИ
// =========================================

enum PaymentStatus {
  PENDING        // Создан, ожидает оплаты
  PROCESSING     // В обработке
  SUCCEEDED      // Успешно
  CANCELLED      // Отменен
  REFUNDED       // Полный возврат
  PARTIAL_REFUND // Частичный возврат
  FAILED         // Ошибка
}

model Payment {
  id              String        @id @default(cuid())
  bookingId       String?       @unique @map("booking_id")
  userId          String        @map("user_id")

  // Суммы
  amount          Int           // Сумма в копейках
  currency        String        @default("RUB")
  refundedAmount  Int           @default(0) @map("refunded_amount") // В копейках

  // Статус
  status          PaymentStatus @default(PENDING)
  type            String        // "session", "package", "specialist_subscription", "client_subscription"

  // ЮKassa
  externalId      String?       @unique @map("external_id") // ID платежа в ЮKassa
  idempotencyKey  String        @unique @map("idempotency_key")
  paymentMethod   String?       @map("payment_method") // "bank_card", "sbp", "yoo_money"
  confirmationUrl String?       @map("confirmation_url") // URL для оплаты

  // Чек (ФЗ-54)
  receiptSent     Boolean       @default(false) @map("receipt_sent")
  receiptUrl      String?       @map("receipt_url")

  // Метаданные
  metadata        Json?
  errorCode       String?       @map("error_code")
  errorMessage    String?       @map("error_message")

  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")
  paidAt          DateTime?     @map("paid_at")

  // Связи
  booking         Booking?      @relation(fields: [bookingId], references: [id])

  @@index([userId])
  @@index([status])
  @@index([externalId])
  @@index([createdAt])
  @@map("payments")
}

model Payout {
  id              String            @id @default(cuid())
  specialistId    String            @map("specialist_id")

  amount          Int               // В копейках
  currency        String            @default("RUB")
  status          String            @default("pending") // pending, processing, succeeded, failed
  externalId      String?           @map("external_id") // ID в ЮKassa Payouts

  // Детали
  periodStart     DateTime          @map("period_start")
  periodEnd       DateTime          @map("period_end")
  sessionsCount   Int               @map("sessions_count")
  totalGross      Int               @map("total_gross")     // Брутто до комиссии
  totalCommission Int               @map("total_commission") // Комиссия
  payoutDetails   Json?             @map("payout_details")  // Список сессий

  // Реквизиты
  payoutMethod    String            @map("payout_method") // "bank_card", "bank_account"
  payoutTarget    String            @map("payout_target") // Номер карты/счета (маскированный)

  createdAt       DateTime          @default(now()) @map("created_at")
  processedAt     DateTime?         @map("processed_at")

  specialist      SpecialistProfile @relation(fields: [specialistId], references: [id])

  @@index([specialistId])
  @@index([status])
  @@index([createdAt])
  @@map("payouts")
}

// =========================================
// ПОДПИСКИ
// =========================================

model SpecialistSubscription {
  id             String            @id @default(cuid())
  specialistId   String            @unique @map("specialist_id")
  plan           String            // "basic", "professional", "expert"
  status         String            @default("active") // active, cancelled, expired, past_due
  priceMonthly   Int               @map("price_monthly") // В рублях

  // ЮKassa рекуррент
  externalSubscriptionId String?   @unique @map("external_subscription_id")
  paymentMethodId        String?   @map("payment_method_id") // Saved payment method

  currentPeriodStart DateTime      @map("current_period_start")
  currentPeriodEnd   DateTime      @map("current_period_end")
  cancelledAt        DateTime?     @map("cancelled_at")
  cancelAtPeriodEnd  Boolean       @default(false) @map("cancel_at_period_end")

  createdAt          DateTime      @default(now()) @map("created_at")
  updatedAt          DateTime      @updatedAt @map("updated_at")

  specialist         SpecialistProfile @relation(fields: [specialistId], references: [id])

  @@map("specialist_subscriptions")
}

model ClientSubscription {
  id             String   @id @default(cuid())
  userId         String   @unique @map("user_id")
  plan           String   // "free", "premium"
  status         String   @default("active") // active, cancelled, expired
  priceMonthly   Int      @map("price_monthly")

  externalSubscriptionId String? @unique @map("external_subscription_id")
  paymentMethodId        String? @map("payment_method_id")

  currentPeriodStart DateTime @map("current_period_start")
  currentPeriodEnd   DateTime @map("current_period_end")
  cancelledAt        DateTime? @map("cancelled_at")
  cancelAtPeriodEnd  Boolean  @default(false) @map("cancel_at_period_end")

  // Лимиты
  aiConsultationsUsed  Int    @default(0) @map("ai_consultations_used")
  aiConsultationsLimit Int    @default(1) @map("ai_consultations_limit") // 1 для free, unlimited для premium

  createdAt    DateTime      @default(now()) @map("created_at")
  updatedAt    DateTime      @updatedAt @map("updated_at")

  user         User          @relation(fields: [userId], references: [id])

  @@map("client_subscriptions")
}

// =========================================
// ПАКЕТЫ СЕССИЙ
// =========================================

model SessionPackage {
  id             String   @id @default(cuid())
  clientId       String   @map("client_id")
  specialistId   String   @map("specialist_id")

  totalSessions  Int      @map("total_sessions")  // 4 или 8
  usedSessions   Int      @default(0) @map("used_sessions")
  discountPercent Float   @map("discount_percent") // 0.05 или 0.10
  pricePerSession Int     @map("price_per_session") // Со скидкой
  totalPrice     Int      @map("total_price")

  status         String   @default("active") // active, exhausted, expired, refunded
  expiresAt      DateTime @map("expires_at") // 90 дней от покупки

  createdAt      DateTime @default(now()) @map("created_at")

  bookings       Booking[]

  @@index([clientId])
  @@index([specialistId])
  @@map("session_packages")
}

// =========================================
// ОТЗЫВЫ
// =========================================

enum ReviewStatus {
  PENDING      // На модерации
  PUBLISHED    // Опубликован
  REJECTED     // Отклонен
  EDIT_REQUESTED // Запрошена редакция
}

model Review {
  id              String       @id @default(cuid())
  bookingId       String       @unique @map("booking_id")
  clientId        String       @map("client_id")
  specialistId    String       @map("specialist_id")

  // Оценка
  rating          Int          // 1-5 звезд
  comment         String?      // Текстовый отзыв (до 1000 символов)

  // Оценка матчинга (не публикуется)
  matchRating     Int?         @map("match_rating") // 1-10, "насколько подошел специалист"
  matchFeedback   String?      @map("match_feedback") // Текстовая обратная связь

  // Модерация
  status          ReviewStatus @default(PENDING)
  moderatedBy     String?      @map("moderated_by") // Admin user ID
  moderatedAt     DateTime?    @map("moderated_at")
  moderationNote  String?      @map("moderation_note")

  // Флаги
  isAnonymous     Boolean      @default(true) @map("is_anonymous")
  sessionNumber   Int          @default(1) @map("session_number") // 1-я, 3-я сессия и т.д.

  createdAt       DateTime     @default(now()) @map("created_at")
  updatedAt       DateTime     @updatedAt @map("updated_at")

  // Связи
  booking         Booking      @relation(fields: [bookingId], references: [id])
  client          User         @relation("ClientReviews", fields: [clientId], references: [id])
  specialist      SpecialistProfile @relation("SpecialistReviews", fields: [specialistId], references: [id])

  @@index([specialistId, status])
  @@index([clientId])
  @@index([status])
  @@map("reviews")
}

// =========================================
// МАТЧИНГ
// =========================================

model MatchingResult {
  id             String   @id @default(cuid())
  clientId       String   @map("client_id")
  conversationId String?  @map("conversation_id") // ИИ-разговор, по итогам которого

  // Результаты (упорядоченный массив)
  results        Json     // [{ specialistId, score, explanation, breakdown }]
  totalCandidates Int     @map("total_candidates")
  generatedAt    DateTime @map("generated_at")
  generationTimeMs Int    @map("generation_time_ms")

  // Алгоритм
  algorithmVersion String @map("algorithm_version")

  createdAt      DateTime @default(now()) @map("created_at")

  @@index([clientId, createdAt])
  @@map("matching_results")
}

model MatchingFeedback {
  id              String   @id @default(cuid())
  userId          String   @map("user_id")
  matchingResultId String  @map("matching_result_id")
  specialistId    String   @map("specialist_id")

  action          String   // "selected", "rejected", "viewed"
  rejectReason    String?  @map("reject_reason") // "too_expensive", "wrong_specialization", "style_mismatch", "other"
  comment         String?

  createdAt       DateTime @default(now()) @map("created_at")

  user            User     @relation(fields: [userId], references: [id])

  @@index([matchingResultId])
  @@index([specialistId])
  @@map("matching_feedback")
}

// =========================================
// МЕССЕНДЖЕР (Phase 2, но схема готова)
// =========================================

model DirectMessageThread {
  id             String   @id @default(cuid())
  clientId       String   @map("client_id")
  specialistId   String   @map("specialist_id")
  bookingId      String?  @map("booking_id") // Привязка к бронированию

  lastMessageAt  DateTime? @map("last_message_at")
  isActive       Boolean  @default(true) @map("is_active")

  createdAt      DateTime @default(now()) @map("created_at")

  messages       DirectMessage[]

  @@unique([clientId, specialistId])
  @@index([clientId])
  @@index([specialistId])
  @@map("direct_message_threads")
}

model DirectMessage {
  id        String   @id @default(cuid())
  threadId  String   @map("thread_id")
  senderId  String   @map("sender_id")
  content   String
  fileUrl   String?  @map("file_url")
  fileName  String?  @map("file_name")
  readAt    DateTime? @map("read_at")

  createdAt DateTime @default(now()) @map("created_at")

  thread    DirectMessageThread @relation(fields: [threadId], references: [id], onDelete: Cascade)
  sender    User                @relation("SenderMessages", fields: [senderId], references: [id])

  @@index([threadId, createdAt])
  @@map("direct_messages")
}

// =========================================
// УВЕДОМЛЕНИЯ
// =========================================

model Notification {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  type      String   // "booking_confirmed", "booking_cancelled", "reminder_24h",
                     // "reminder_1h", "review_request", "payment_received",
                     // "verification_approved", "crisis_alert", "new_message"
  title     String
  body      String
  channel   String   // "email", "sms", "in_app", "push"
  status    String   @default("pending") // pending, sent, failed, read
  readAt    DateTime? @map("read_at")
  sentAt    DateTime? @map("sent_at")

  // Ссылка на объект
  entityType String? @map("entity_type") // "booking", "review", "payment"
  entityId   String? @map("entity_id")

  metadata   Json?

  createdAt  DateTime @default(now()) @map("created_at")

  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, readAt])
  @@index([status, channel])
  @@index([createdAt])
  @@map("notifications")
}

// =========================================
// ПРОМОКОДЫ
// =========================================

model PromoCode {
  id            String   @id @default(cuid())
  code          String   @unique
  type          String   // "percent", "fixed"
  value         Float    // Процент или сумма в рублях
  maxUses       Int?     @map("max_uses")
  usedCount     Int      @default(0) @map("used_count")
  validFrom     DateTime @map("valid_from")
  validUntil    DateTime @map("valid_until")
  applicableTo  String   // "session", "subscription", "all"
  isActive      Boolean  @default(true) @map("is_active")

  createdAt     DateTime @default(now()) @map("created_at")
  createdBy     String   @map("created_by") // Admin user ID

  @@index([code])
  @@index([validUntil, isActive])
  @@map("promo_codes")
}

// =========================================
// КРИЗИСНЫЕ АЛЕРТЫ
// =========================================

model CrisisAlert {
  id              String   @id @default(cuid())
  conversationId  String   @map("conversation_id")
  userId          String   @map("user_id") // Анонимизируется в лог
  severity        String   // "high", "critical"
  markers         String[] // Обнаруженные маркеры
  messageExcerpt  String?  @map("message_excerpt") // Анонимизированный фрагмент

  status          String   @default("new") // new, in_progress, resolved, false_positive
  assignedTo      String?  @map("assigned_to") // Admin user ID
  resolution      String?
  resolvedAt      DateTime? @map("resolved_at")

  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  @@index([status])
  @@index([createdAt])
  @@map("crisis_alerts")
}

// =========================================
// АНАЛИТИЧЕСКИЕ СОБЫТИЯ
// =========================================

model AnalyticsEvent {
  id        String   @id @default(cuid())
  userId    String?  @map("user_id")
  event     String   // "page_view", "consultation_started", "consultation_completed",
                     // "matching_generated", "specialist_viewed", "booking_created",
                     // "payment_completed", "review_submitted"
  properties Json?   // Произвольные свойства события
  sessionId  String? @map("session_id") // Сессия браузера
  userAgent  String? @map("user_agent")
  ipAddress  String? @map("ip_address") // Хешированный

  createdAt  DateTime @default(now()) @map("created_at")

  @@index([event, createdAt])
  @@index([userId, createdAt])
  @@map("analytics_events")
}
```

---

## 3. Стратегия индексов

### 3.1. Основные индексы (уже определены в Prisma-схеме выше)

### 3.2. Дополнительные индексы (создаются через raw SQL миграции)

```sql
-- Векторный индекс для ценностных профилей (pgvector)
-- IVFFlat -- быстрее строится, подходит для <1M записей
CREATE INDEX idx_value_profiles_embedding
ON value_profiles
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Полнотекстовый поиск по каталогу специалистов
-- GIN-индекс для tsvector
ALTER TABLE specialist_profiles ADD COLUMN search_vector tsvector;

CREATE INDEX idx_specialist_search
ON specialist_profiles
USING GIN (search_vector);

-- Триггер для обновления search_vector
CREATE OR REPLACE FUNCTION update_specialist_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('russian', coalesce(NEW.bio, '')), 'A') ||
    setweight(to_tsvector('russian', coalesce(NEW.ai_bio, '')), 'B') ||
    setweight(to_tsvector('russian', array_to_string(NEW.specializations, ' ')), 'A') ||
    setweight(to_tsvector('russian', array_to_string(NEW.approaches, ' ')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_specialist_search_vector
BEFORE INSERT OR UPDATE ON specialist_profiles
FOR EACH ROW EXECUTE FUNCTION update_specialist_search_vector();

-- Частичный индекс: только активные специалисты для каталога
CREATE INDEX idx_active_specialists
ON specialist_profiles (type, session_price, average_rating)
WHERE verification = 'APPROVED';

-- Индекс для поиска свободных слотов
CREATE INDEX idx_available_slots
ON schedule_slots (specialist_id, slot_date, is_available)
WHERE is_available = true;

-- Составной индекс для платежей (для webhook-обработки)
CREATE INDEX idx_payments_external
ON payments (external_id, status);
```

---

## 4. Стратегия миграций

### 4.1. Подход

- **Инструмент:** Prisma Migrate
- **Правило:** Каждая миграция -- отдельный PR с описанием изменений
- **Backward compatibility:** Миграции должны быть совместимы с предыдущей версией приложения (для zero-downtime deploys)
- **Destructive changes:** Удаление колонок/таблиц -- через 2-шаговый процесс (deprecate -> remove)

### 4.2. Порядок создания таблиц (MVP)

```
Миграция 001: users, refresh_tokens
Миграция 002: specialist_profiles, specialist_documents
Миграция 003: value_profiles (+ pgvector extension)
Миграция 004: ai_conversations, ai_messages
Миграция 005: schedule_slots
Миграция 006: bookings, booking_reminders
Миграция 007: payments, payouts
Миграция 008: specialist_subscriptions, client_subscriptions
Миграция 009: reviews
Миграция 010: matching_results, matching_feedback
Миграция 011: notifications
Миграция 012: promo_codes, crisis_alerts, analytics_events
Миграция 013: Индексы (FTS, pgvector, частичные)
```

### 4.3. Seed-данные

```
seed.ts:
  1. Создать admin-пользователя
  2. Создать 10 тестовых специалистов с заполненными профилями и ценностными портретами
  3. Создать 5 тестовых клиентов с ценностными профилями
  4. Создать расписание для специалистов
  5. Создать несколько бронирований в разных статусах
  6. Создать промокод "LAUNCH" (-30%, 100 использований)
```

---

## 5. Решения по хранению данных

### 5.1. Шифрование чувствительных данных

| Данные | Метод |
|--------|-------|
| Содержимое ИИ-чатов (ai_messages.content) | AES-256-GCM, ключ через Yandex KMS. Шифрование/дешифрование на уровне приложения |
| Пароли (users.password_hash) | bcrypt, cost factor 12 |
| Refresh tokens | SHA-256 hash хранится в БД, сам токен только у клиента |
| IP-адреса в аналитике | SHA-256 hash (без возможности восстановления) |
| Номера карт/счетов в payouts | Маскирование (**** **** **** 1234) |

### 5.2. Retention-политика

| Данные | Срок хранения | Действие |
|--------|--------------|---------|
| Аналитические события | 12 месяцев | Архивация в cold storage, затем удаление |
| ИИ-чаты (messages) | 24 месяца | Архивация, шифрование |
| Финансовые данные | 5 лет (ФЗ-402) | Архивация |
| Пользовательские данные | До запроса удаления | Soft delete, полное удаление через 30 дней |
| Логи | 90 дней | Ротация |

### 5.3. Право на удаление (ФЗ-152)

При запросе на удаление аккаунта:
1. Анонимизация данных в аналитике (userId -> null)
2. Удаление ценностного профиля и embedding
3. Удаление содержимого чатов (оставить метаданные для аудита)
4. Soft delete User (is_active = false)
5. Через 30 дней -- полное удаление (hard delete cascade)
6. Финансовые записи сохраняются с анонимизированным user_id (требование ФЗ-402)
