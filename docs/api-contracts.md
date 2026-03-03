# SoulMate -- API-контракты

**Версия:** 1.0
**Дата:** 2026-03-03
**Базовый URL:** `https://api.soulmate.ru/v1`
**Формат:** REST, JSON
**Аутентификация:** Bearer JWT

---

## 1. Общие соглашения

### 1.1. Аутентификация

Все защищенные эндпоинты требуют заголовок:
```
Authorization: Bearer <access_token>
```

**Access token:** JWT, время жизни 15 минут.
**Refresh token:** httpOnly cookie `refresh_token`, время жизни 7 дней.

JWT payload:
```json
{
  "sub": "user_cuid",
  "role": "CLIENT | SPECIALIST | ADMIN",
  "email": "user@example.com",
  "iat": 1709470000,
  "exp": 1709470900
}
```

### 1.2. Пагинация

Курсорная пагинация для списков:
```
GET /specialists?cursor=<last_id>&limit=20
```

Ответ:
```json
{
  "data": [...],
  "pagination": {
    "cursor": "clxyz...",
    "hasMore": true,
    "total": 150
  }
}
```

### 1.3. Формат ошибок

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Описание ошибки на русском",
    "details": [
      { "field": "email", "message": "Некорректный формат email" }
    ]
  }
}
```

Коды ошибок:
| HTTP | Code | Описание |
|------|------|---------|
| 400 | VALIDATION_ERROR | Ошибка валидации |
| 401 | UNAUTHORIZED | Не авторизован |
| 403 | FORBIDDEN | Нет доступа |
| 404 | NOT_FOUND | Ресурс не найден |
| 409 | CONFLICT | Конфликт (дубликат, занятый слот) |
| 422 | UNPROCESSABLE | Бизнес-ошибка (недостаточно средств, лимит) |
| 429 | RATE_LIMITED | Превышен лимит запросов |
| 500 | INTERNAL_ERROR | Внутренняя ошибка |

### 1.4. Rate Limiting

| Группа эндпоинтов | Лимит | Окно |
|-------------------|-------|------|
| Auth (register, login, OTP) | 10 запросов | 1 минута |
| AI Chat (send message) | 30 сообщений | 1 минута |
| Каталог (read) | 100 запросов | 1 минута |
| Запись (write) | 30 запросов | 1 минута |
| Webhook (YooKassa) | 100 запросов | 1 минута |

Заголовки ответа:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1709470060
```

---

## 2. Auth -- Аутентификация и регистрация

### POST /auth/register/email

Регистрация по email и паролю.

**Request:**
```json
{
  "email": "marina@example.com",
  "password": "SecurePass123",
  "firstName": "Марина",
  "role": "CLIENT",
  "privacyAccepted": true,
  "termsAccepted": true
}
```

**Response 201:**
```json
{
  "data": {
    "userId": "clxyz123",
    "email": "marina@example.com",
    "emailVerified": false,
    "message": "Письмо с подтверждением отправлено на marina@example.com"
  }
}
```

**Ошибки:** 400 (валидация), 409 (email уже зарегистрирован)

---

### POST /auth/register/phone

Начать регистрацию по телефону (отправка SMS-кода).

**Request:**
```json
{
  "phone": "+79161234567",
  "role": "CLIENT"
}
```

**Response 200:**
```json
{
  "data": {
    "phone": "+79161234567",
    "codeSentAt": "2026-03-03T12:00:00Z",
    "retryAfter": 60
  }
}
```

**Ошибки:** 400, 409 (телефон зарегистрирован), 429 (слишком часто)

---

### POST /auth/verify/phone

Подтверждение SMS-кода и завершение регистрации/входа.

**Request:**
```json
{
  "phone": "+79161234567",
  "code": "1234"
}
```

**Response 200:**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "clxyz123",
      "phone": "+79161234567",
      "role": "CLIENT",
      "isNewUser": true
    }
  }
}
```

Set-Cookie: `refresh_token=...; HttpOnly; Secure; SameSite=Strict; Path=/auth; Max-Age=604800`

**Ошибки:** 400 (неверный код), 429 (превышено количество попыток)

---

### POST /auth/verify/email

Подтверждение email по токену из письма.

**Request:**
```json
{
  "token": "email_verification_token_abc123"
}
```

**Response 200:**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "clxyz123",
      "email": "marina@example.com",
      "emailVerified": true
    }
  }
}
```

---

### POST /auth/login/email

Вход по email и паролю.

**Request:**
```json
{
  "email": "marina@example.com",
  "password": "SecurePass123"
}
```

**Response 200:**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "clxyz123",
      "email": "marina@example.com",
      "role": "CLIENT",
      "firstName": "Марина"
    }
  }
}
```

**Ошибки:** 401 (неверные данные)

---

### POST /auth/login/phone

Начать вход по телефону (отправка SMS-кода). Далее POST /auth/verify/phone.

**Request:**
```json
{
  "phone": "+79161234567"
}
```

---

### POST /auth/oauth/google

OAuth-аутентификация через Google.

**Request:**
```json
{
  "idToken": "google_id_token..."
}
```

**Response 200:**
```json
{
  "data": {
    "accessToken": "eyJ...",
    "user": {
      "id": "clxyz123",
      "email": "marina@gmail.com",
      "firstName": "Марина",
      "role": "CLIENT",
      "isNewUser": false
    }
  }
}
```

---

### POST /auth/oauth/vk

OAuth-аутентификация через VK ID.

**Request:**
```json
{
  "code": "vk_auth_code...",
  "redirectUri": "https://soulmate.ru/auth/vk/callback"
}
```

---

### POST /auth/refresh

Обновление access token.

**Request:** Cookie `refresh_token` автоматически.

**Response 200:**
```json
{
  "data": {
    "accessToken": "eyJ_new_token..."
  }
}
```

---

### POST /auth/logout

Выход (инвалидация refresh token).

**Response 204:** No Content. Cookie refresh_token удаляется.

---

## 3. Users -- Пользователи и профили

### GET /users/me

Получение текущего пользователя. Требуется авторизация.

**Response 200:**
```json
{
  "data": {
    "id": "clxyz123",
    "email": "marina@example.com",
    "phone": "+79161234567",
    "role": "CLIENT",
    "firstName": "Марина",
    "lastName": "Иванова",
    "age": 29,
    "gender": "female",
    "city": "Москва",
    "timezone": "Europe/Moscow",
    "avatarUrl": "https://cdn.soulmate.ru/avatars/clxyz123.jpg",
    "emailVerified": true,
    "phoneVerified": true,
    "hasValueProfile": true,
    "subscription": {
      "plan": "free",
      "aiConsultationsUsed": 1,
      "aiConsultationsLimit": 1
    },
    "createdAt": "2026-03-01T10:00:00Z"
  }
}
```

---

### PATCH /users/me

Обновление профиля текущего пользователя.

**Request:**
```json
{
  "firstName": "Марина",
  "lastName": "Иванова",
  "age": 30,
  "city": "Москва",
  "timezone": "Europe/Moscow"
}
```

**Response 200:** Обновленный объект пользователя.

---

### PATCH /users/me/avatar

Загрузка/обновление аватара. Content-Type: multipart/form-data.

**Request:** Form field `avatar` (image/jpeg, image/png, max 5MB).

**Response 200:**
```json
{
  "data": {
    "avatarUrl": "https://cdn.soulmate.ru/avatars/clxyz123.jpg"
  }
}
```

---

### DELETE /users/me

Запрос на удаление аккаунта (soft delete, полное удаление через 30 дней).

**Response 200:**
```json
{
  "data": {
    "message": "Аккаунт будет удален через 30 дней. Для отмены свяжитесь с поддержкой.",
    "deleteAt": "2026-04-02T12:00:00Z"
  }
}
```

---

## 4. Specialists -- Профиль специалиста

### POST /specialists/apply

Подача заявки на регистрацию специалиста. Требуется авторизация (role=CLIENT, будет изменена на SPECIALIST).

**Request:** Content-Type: multipart/form-data

```
type: "PSYCHOLOGIST"
experienceYears: 14
education: "МГУ, факультет психологии"
approaches: ["КПТ", "Гештальт"]
specializations: ["Тревожность", "Выгорание"]
sessionPrice: 4000
sessionDuration: 50
workFormats: ["online"]
documents[]: (file) diploma.pdf
documents[]: (file) certificate.pdf
```

**Response 201:**
```json
{
  "data": {
    "specialistId": "clspec123",
    "status": "PENDING",
    "message": "Заявка принята. Документы будут проверены в течение 48 часов. Вы можете начать ИИ-интервью прямо сейчас.",
    "nextStep": "ai_interview"
  }
}
```

---

### GET /specialists/me

Получение профиля текущего специалиста. Требуется роль SPECIALIST.

**Response 200:**
```json
{
  "data": {
    "id": "clspec123",
    "userId": "clxyz123",
    "type": "PSYCHOLOGIST",
    "verification": "APPROVED",
    "education": "МГУ, факультет психологии",
    "experienceYears": 14,
    "approaches": ["КПТ", "Гештальт"],
    "specializations": ["Тревожность", "Выгорание"],
    "bio": "Более 14 лет опыта...",
    "aiBio": "Елена -- опытный психолог...",
    "sessionPrice": 4000,
    "sessionDuration": 50,
    "workFormats": ["online"],
    "videoProvider": "zoom",
    "averageRating": 4.8,
    "totalReviews": 42,
    "totalSessions": 156,
    "subscriptionPlan": "professional",
    "commissionRate": 0.12,
    "hasValueProfile": true,
    "balance": {
      "available": 25600,
      "pending": 8000
    },
    "createdAt": "2025-06-15T10:00:00Z"
  }
}
```

---

### PATCH /specialists/me

Обновление профиля специалиста.

**Request:**
```json
{
  "bio": "Обновленное описание...",
  "sessionPrice": 4500,
  "approaches": ["КПТ", "Гештальт", "EMDR"],
  "workFormats": ["online", "hybrid"],
  "videoProvider": "google_meet"
}
```

**Response 200:** Обновленный профиль.

---

### POST /specialists/me/video-intro

Загрузка видео-визитки. Content-Type: multipart/form-data.

**Request:** Form field `video` (video/mp4, max 100MB, max 90 sec).

**Response 202:**
```json
{
  "data": {
    "status": "processing",
    "message": "Видео загружено. После транскодирования и модерации оно появится в вашем профиле."
  }
}
```

---

### GET /specialists/:id

Получение публичного профиля специалиста. Без авторизации -- без matchScore.

**Response 200:**
```json
{
  "data": {
    "id": "clspec123",
    "firstName": "Елена",
    "lastName": "С.",
    "type": "PSYCHOLOGIST",
    "verified": true,
    "education": "МГУ, факультет психологии",
    "experienceYears": 14,
    "approaches": ["КПТ", "Гештальт"],
    "specializations": ["Тревожность", "Выгорание"],
    "bio": "Более 14 лет опыта...",
    "avatarUrl": "https://cdn.soulmate.ru/avatars/clspec123.jpg",
    "videoIntroUrl": "https://cdn.soulmate.ru/videos/clspec123.mp4",
    "sessionPrice": 4000,
    "sessionDuration": 50,
    "workFormats": ["online"],
    "averageRating": 4.8,
    "totalReviews": 42,
    "matchScore": 87,
    "matchExplanation": null,
    "nearestAvailableSlot": "2026-03-05T14:00:00+03:00",
    "valueProfile": {
      "summary": "Фокус на глубинной работе, поддерживающий стиль...",
      "topValues": ["Развитие", "Осознанность", "Баланс"]
    }
  }
}
```

---

## 5. Catalog -- Каталог специалистов

### GET /catalog/specialists

Поиск и фильтрация специалистов.

**Query Parameters:**
| Параметр | Тип | Описание |
|----------|-----|---------|
| type | string | PSYCHOLOGIST, COACH, PSYCHOTHERAPIST |
| specialization | string[] | Фильтр по специализации |
| approach | string[] | Фильтр по подходу |
| priceMin | int | Минимальная цена |
| priceMax | int | Максимальная цена |
| format | string | online, offline, hybrid |
| language | string | Язык (ru, en) |
| gender | string | male, female |
| ratingMin | float | Минимальный рейтинг |
| search | string | Полнотекстовый поиск |
| sortBy | string | match_score, rating, price_asc, price_desc, reviews |
| cursor | string | Курсор пагинации |
| limit | int | 1-50, default 20 |

**Response 200:**
```json
{
  "data": [
    {
      "id": "clspec123",
      "firstName": "Елена",
      "lastName": "С.",
      "type": "PSYCHOLOGIST",
      "verified": true,
      "avatarUrl": "...",
      "specializations": ["Тревожность", "Выгорание"],
      "approaches": ["КПТ", "Гештальт"],
      "sessionPrice": 4000,
      "workFormats": ["online"],
      "averageRating": 4.8,
      "totalReviews": 42,
      "matchScore": 87,
      "nearestAvailableSlot": "2026-03-05T14:00:00+03:00",
      "topValues": ["Развитие", "Осознанность"]
    }
  ],
  "pagination": {
    "cursor": "clspec456",
    "hasMore": true,
    "total": 150
  },
  "filters": {
    "availableTypes": ["PSYCHOLOGIST", "COACH", "PSYCHOTHERAPIST"],
    "availableSpecializations": ["Тревожность", "Отношения", "Карьера", "..."],
    "priceRange": { "min": 1500, "max": 8000 }
  }
}
```

---

### GET /catalog/specializations

Список доступных специализаций и подходов (для фильтров).

**Response 200:**
```json
{
  "data": {
    "specializations": [
      { "key": "anxiety", "label": "Тревожность", "count": 45 },
      { "key": "relationships", "label": "Отношения", "count": 38 }
    ],
    "approaches": [
      { "key": "cbt", "label": "КПТ", "count": 52 },
      { "key": "gestalt", "label": "Гештальт", "count": 31 }
    ]
  }
}
```

---

## 6. AI -- ИИ-консультация и интервью

### POST /ai/consultations

Создать новую ИИ-консультацию (для клиента) или интервью (для специалиста). Требуется авторизация.

**Request:**
```json
{
  "type": "CLIENT_CONSULTATION"
}
```
Допустимые типы: `CLIENT_CONSULTATION`, `SPECIALIST_INTERVIEW`, `PROFILE_CORRECTION`

**Response 201:**
```json
{
  "data": {
    "conversationId": "clconv123",
    "type": "CLIENT_CONSULTATION",
    "status": "ACTIVE",
    "phase": "GREETING",
    "wsUrl": "wss://api.soulmate.ru/ws/ai-chat?token=<session_token>",
    "initialMessage": {
      "id": "clmsg001",
      "role": "assistant",
      "content": "Здравствуйте! Я -- ИИ-консультант SoulMate. Я помогу вам разобраться в вашем запросе и подобрать подходящего специалиста...",
      "phase": "GREETING",
      "createdAt": "2026-03-03T12:00:00Z"
    }
  }
}
```

**Ошибки:** 422 (лимит консультаций исчерпан для free-пользователя)

---

### GET /ai/consultations/:id

Получить консультацию с историей сообщений.

**Response 200:**
```json
{
  "data": {
    "conversationId": "clconv123",
    "type": "CLIENT_CONSULTATION",
    "status": "COMPLETED",
    "phase": "CONFIRMATION",
    "startedAt": "2026-03-03T12:00:00Z",
    "completedAt": "2026-03-03T12:18:00Z",
    "messages": [
      {
        "id": "clmsg001",
        "role": "assistant",
        "content": "Здравствуйте...",
        "phase": "GREETING",
        "metadata": null,
        "createdAt": "2026-03-03T12:00:00Z"
      },
      {
        "id": "clmsg002",
        "role": "user",
        "content": "Здравствуйте, у меня проблема с выгоранием на работе...",
        "phase": "GREETING",
        "metadata": null,
        "createdAt": "2026-03-03T12:00:30Z"
      }
    ],
    "result": {
      "requestSummary": "Профессиональное выгорание, потеря мотивации, сложности с границами на работе",
      "requestType": "therapy",
      "recommendedSpecialistType": "PSYCHOLOGIST",
      "valueProfile": {
        "values": {
          "career": 0.75,
          "family": 0.60,
          "freedom": 0.85,
          "security": 0.40,
          "development": 0.90,
          "spirituality": 0.20,
          "relationships": 0.65,
          "health": 0.70,
          "creativity": 0.55,
          "justice": 0.45
        },
        "communicationStyle": {
          "directive_vs_supportive": 0.3,
          "analytical_vs_intuitive": 0.7,
          "structured_vs_free": 0.6,
          "past_vs_future": 0.5
        },
        "summary": "Вам важны свобода и развитие. Вы предпочитаете поддерживающий, но аналитический подход..."
      },
      "preferences": {
        "format": "online",
        "priceRange": [2000, 4000],
        "frequency": "weekly",
        "preferredGender": null,
        "preferredTime": "evening"
      }
    }
  }
}
```

---

### GET /ai/consultations

Список консультаций текущего пользователя.

**Response 200:**
```json
{
  "data": [
    {
      "conversationId": "clconv123",
      "type": "CLIENT_CONSULTATION",
      "status": "COMPLETED",
      "startedAt": "2026-03-03T12:00:00Z",
      "completedAt": "2026-03-03T12:18:00Z"
    }
  ]
}
```

---

### POST /ai/consultations/:id/confirm

Подтверждение результата консультации (переход к матчингу).

**Request:**
```json
{
  "corrections": null
}
```

Или с корректировками:
```json
{
  "corrections": {
    "requestSummary": "Уточненное описание...",
    "preferences": {
      "priceRange": [2000, 5000]
    }
  }
}
```

**Response 200:**
```json
{
  "data": {
    "confirmed": true,
    "nextStep": "matching",
    "matchingUrl": "/api/v1/matching/recommendations"
  }
}
```

---

## 7. Matching -- Матчинг и рекомендации

### POST /matching/recommendations

Генерация рекомендаций на основе ценностного профиля. Требуется завершенная ИИ-консультация.

**Request:**
```json
{
  "conversationId": "clconv123",
  "limit": 5
}
```

**Response 200:**
```json
{
  "data": {
    "matchingResultId": "clmatch123",
    "totalCandidates": 87,
    "generationTimeMs": 2340,
    "algorithmVersion": "v1.2",
    "recommendations": [
      {
        "rank": 1,
        "specialistId": "clspec456",
        "matchScore": 92,
        "specialist": {
          "firstName": "Анна",
          "lastName": "К.",
          "type": "PSYCHOLOGIST",
          "avatarUrl": "...",
          "sessionPrice": 3500,
          "averageRating": 4.9,
          "totalReviews": 28,
          "nearestAvailableSlot": "2026-03-04T16:00:00+03:00"
        },
        "explanation": {
          "summary": "Анна отлично подходит вам по нескольким причинам:",
          "points": [
            "Специализируется на профессиональном выгорании -- это ваш основной запрос",
            "Разделяет ваши ценности развития и свободы",
            "Использует структурированный подход КПТ, который соответствует вашему предпочтению",
            "Работает в поддерживающем стиле с аналитическим уклоном"
          ],
          "breakdown": {
            "valueMatch": 0.91,
            "communicationStyleMatch": 0.88,
            "approachMatch": 0.95,
            "worldviewMatch": 0.85,
            "specializationRelevance": 0.98
          }
        }
      },
      {
        "rank": 2,
        "specialistId": "clspec789",
        "matchScore": 87,
        "specialist": { "..." : "..." },
        "explanation": { "..." : "..." }
      }
    ]
  }
}
```

**Ошибки:** 404 (нет ценностного профиля), 422 (консультация не завершена), 422 (недостаточно специалистов)

---

### POST /matching/feedback

Обратная связь по рекомендации.

**Request:**
```json
{
  "matchingResultId": "clmatch123",
  "specialistId": "clspec789",
  "action": "rejected",
  "rejectReason": "too_expensive",
  "comment": "Хотелось бы найти специалиста в диапазоне до 3000 руб."
}
```

Допустимые action: `selected`, `rejected`, `viewed`.
Допустимые rejectReason: `too_expensive`, `wrong_specialization`, `style_mismatch`, `schedule_mismatch`, `other`.

**Response 200:**
```json
{
  "data": {
    "recorded": true,
    "message": "Спасибо за обратную связь. Она поможет улучшить подбор."
  }
}
```

---

### GET /matching/score/:specialistId

Получить процент совпадения с конкретным специалистом. Для каталога.

**Response 200:**
```json
{
  "data": {
    "specialistId": "clspec456",
    "matchScore": 87,
    "topReasons": [
      "Совпадение по ценностям развития и свободы",
      "Подходящий стиль коммуникации"
    ]
  }
}
```

**Ошибки:** 404 (нет ценностного профиля у клиента)

---

## 8. Bookings -- Бронирование

### GET /bookings/slots/:specialistId

Доступные слоты специалиста на ближайшие 14 дней.

**Query:** `from=2026-03-03&to=2026-03-17&timezone=Europe/Moscow`

**Response 200:**
```json
{
  "data": {
    "specialistId": "clspec456",
    "timezone": "Europe/Moscow",
    "slots": [
      {
        "date": "2026-03-04",
        "times": [
          { "start": "10:00", "end": "10:50", "available": true },
          { "start": "11:00", "end": "11:50", "available": true },
          { "start": "14:00", "end": "14:50", "available": false },
          { "start": "16:00", "end": "16:50", "available": true }
        ]
      },
      {
        "date": "2026-03-05",
        "times": [
          { "start": "10:00", "end": "10:50", "available": true }
        ]
      }
    ]
  }
}
```

---

### POST /bookings

Создать бронирование. Требуется авторизация (CLIENT).

**Request:**
```json
{
  "specialistId": "clspec456",
  "slotStart": "2026-03-04T16:00:00+03:00",
  "format": "online",
  "matchingResultId": "clmatch123",
  "promoCode": "LAUNCH"
}
```

**Response 201:**
```json
{
  "data": {
    "bookingId": "clbook123",
    "status": "PENDING_PAYMENT",
    "slotStart": "2026-03-04T16:00:00+03:00",
    "slotEnd": "2026-03-04T16:50:00+03:00",
    "duration": 50,
    "format": "online",
    "specialist": {
      "id": "clspec456",
      "firstName": "Анна",
      "lastName": "К."
    },
    "pricing": {
      "originalPrice": 3500,
      "discount": 1050,
      "promoCode": "LAUNCH",
      "finalPrice": 2450
    },
    "payment": {
      "paymentId": "clpay123",
      "confirmationUrl": "https://yoomoney.ru/checkout/payments/v2/contract?orderId=...",
      "expiresAt": "2026-03-03T12:30:00Z"
    },
    "expiresAt": "2026-03-03T12:30:00Z"
  }
}
```

**Ошибки:** 409 (слот уже занят), 422 (промокод недействителен)

---

### GET /bookings

Список бронирований текущего пользователя.

**Query:** `status=CONFIRMED&role=client&cursor=...&limit=20`

**Response 200:**
```json
{
  "data": [
    {
      "bookingId": "clbook123",
      "status": "CONFIRMED",
      "slotStart": "2026-03-04T16:00:00+03:00",
      "slotEnd": "2026-03-04T16:50:00+03:00",
      "format": "online",
      "videoLink": "https://zoom.us/j/123456789",
      "specialist": {
        "id": "clspec456",
        "firstName": "Анна",
        "lastName": "К.",
        "avatarUrl": "..."
      },
      "price": 3500,
      "matchScore": 92,
      "canCancel": true,
      "canReschedule": true,
      "hasReview": false
    }
  ],
  "pagination": { "cursor": null, "hasMore": false, "total": 1 }
}
```

---

### GET /bookings/:id

Детали бронирования.

**Response 200:** Полный объект бронирования (аналогично элементу списка + дополнительные поля: cancelPolicy, videoProvider, etc.)

---

### POST /bookings/:id/cancel

Отмена бронирования.

**Request:**
```json
{
  "reason": "schedule_conflict"
}
```

**Response 200:**
```json
{
  "data": {
    "bookingId": "clbook123",
    "status": "CANCELLED_CLIENT",
    "refund": {
      "amount": 3500,
      "percentage": 100,
      "message": "Полный возврат средств (отмена более чем за 24 часа)"
    }
  }
}
```

---

### POST /bookings/:id/reschedule

Перенос сессии.

**Request:**
```json
{
  "newSlotStart": "2026-03-06T14:00:00+03:00"
}
```

**Response 200:**
```json
{
  "data": {
    "bookingId": "clbook123",
    "status": "CONFIRMED",
    "slotStart": "2026-03-06T14:00:00+03:00",
    "slotEnd": "2026-03-06T14:50:00+03:00",
    "message": "Сессия перенесена. Оба участника получат уведомление."
  }
}
```

**Ошибки:** 409 (слот занят), 422 (перенос менее чем за 12 часов)

---

## 9. Schedule -- Расписание специалиста

### GET /schedule/me

Текущее расписание специалиста. Роль SPECIALIST.

**Response 200:**
```json
{
  "data": {
    "timezone": "Asia/Yekaterinburg",
    "recurringSlots": [
      { "id": "clslot1", "dayOfWeek": 0, "startTime": "09:00", "endTime": "10:00" },
      { "id": "clslot2", "dayOfWeek": 0, "startTime": "10:00", "endTime": "11:00" },
      { "id": "clslot3", "dayOfWeek": 2, "startTime": "14:00", "endTime": "15:00" }
    ],
    "customSlots": [
      { "id": "clslot4", "date": "2026-03-10", "startTime": "18:00", "endTime": "19:00" }
    ],
    "blockedDates": ["2026-03-15", "2026-03-16"]
  }
}
```

---

### PUT /schedule/me

Обновление расписания (полная замена).

**Request:**
```json
{
  "timezone": "Asia/Yekaterinburg",
  "recurringSlots": [
    { "dayOfWeek": 0, "startTime": "09:00", "endTime": "10:00" },
    { "dayOfWeek": 0, "startTime": "10:00", "endTime": "11:00" }
  ],
  "customSlots": [
    { "date": "2026-03-10", "startTime": "18:00", "endTime": "19:00" }
  ]
}
```

**Response 200:** Обновленное расписание.

---

## 10. Payments -- Платежи

### POST /payments/webhook/yookassa

Webhook от ЮKassa для уведомлений о статусе платежа. Без авторизации JWT, проверка подписи.

**Request (от ЮKassa):**
```json
{
  "type": "notification",
  "event": "payment.succeeded",
  "object": {
    "id": "yookassa_payment_id",
    "status": "succeeded",
    "amount": { "value": "3500.00", "currency": "RUB" },
    "payment_method": { "type": "bank_card", "id": "..." },
    "metadata": { "booking_id": "clbook123" }
  }
}
```

**Response 200:** `{ "status": "ok" }`

---

### GET /payments/history

История платежей текущего пользователя.

**Query:** `type=session&cursor=...&limit=20`

**Response 200:**
```json
{
  "data": [
    {
      "paymentId": "clpay123",
      "type": "session",
      "amount": 3500,
      "currency": "RUB",
      "status": "SUCCEEDED",
      "paymentMethod": "bank_card",
      "booking": {
        "id": "clbook123",
        "specialistName": "Анна К.",
        "date": "2026-03-04T16:00:00+03:00"
      },
      "receiptUrl": "https://online-kassa.ru/receipt/...",
      "paidAt": "2026-03-03T12:05:00Z"
    }
  ],
  "pagination": { "..." : "..." }
}
```

---

### GET /specialists/me/payouts

История выплат специалиста.

**Response 200:**
```json
{
  "data": {
    "balance": {
      "available": 25600,
      "pending": 8000,
      "totalEarned": 156000
    },
    "payouts": [
      {
        "payoutId": "clpout123",
        "amount": 12800,
        "status": "succeeded",
        "periodStart": "2026-02-24",
        "periodEnd": "2026-03-02",
        "sessionsCount": 4,
        "processedAt": "2026-03-03T06:00:00Z"
      }
    ]
  }
}
```

---

### POST /specialists/me/payouts/request

Запрос выплаты вне графика.

**Request:**
```json
{
  "amount": 15000,
  "method": "bank_card",
  "target": "2200 **** **** 1234"
}
```

**Response 202:**
```json
{
  "data": {
    "payoutId": "clpout456",
    "amount": 15000,
    "status": "processing",
    "estimatedAt": "2026-03-04T12:00:00Z"
  }
}
```

---

## 11. Subscriptions -- Подписки

### POST /subscriptions/specialist

Оформление подписки специалиста.

**Request:**
```json
{
  "plan": "professional"
}
```

**Response 200:**
```json
{
  "data": {
    "subscriptionId": "clsub123",
    "plan": "professional",
    "priceMonthly": 2990,
    "payment": {
      "confirmationUrl": "https://yoomoney.ru/checkout/..."
    }
  }
}
```

---

### POST /subscriptions/client

Оформление Premium-подписки клиента.

**Request:**
```json
{
  "plan": "premium"
}
```

---

### DELETE /subscriptions/specialist

Отмена подписки (действует до конца оплаченного периода).

**Response 200:**
```json
{
  "data": {
    "cancelledAt": "2026-03-03T12:00:00Z",
    "activeUntil": "2026-04-03T12:00:00Z",
    "message": "Подписка отменена. Доступ сохраняется до 03.04.2026."
  }
}
```

---

## 12. Reviews -- Отзывы

### POST /reviews

Создать отзыв (после завершенной сессии). Роль CLIENT.

**Request:**
```json
{
  "bookingId": "clbook123",
  "rating": 5,
  "comment": "Отличная сессия, Анна помогла разобраться в проблеме.",
  "matchRating": 9,
  "matchFeedback": "Специалист отлично подошел по подходу и ценностям."
}
```

**Response 201:**
```json
{
  "data": {
    "reviewId": "clrev123",
    "status": "PENDING",
    "message": "Спасибо! Ваш отзыв будет опубликован после модерации."
  }
}
```

**Ошибки:** 409 (отзыв уже оставлен), 422 (сессия не завершена)

---

### GET /reviews/specialist/:specialistId

Отзывы о специалисте (только опубликованные).

**Query:** `cursor=...&limit=10`

**Response 200:**
```json
{
  "data": [
    {
      "reviewId": "clrev123",
      "rating": 5,
      "comment": "Отличная сессия...",
      "isAnonymous": true,
      "createdAt": "2026-03-01T10:00:00Z"
    }
  ],
  "summary": {
    "averageRating": 4.8,
    "totalReviews": 42,
    "distribution": { "5": 30, "4": 8, "3": 3, "2": 1, "1": 0 }
  },
  "pagination": { "..." : "..." }
}
```

---

## 13. Notifications -- Уведомления

### GET /notifications

Список уведомлений текущего пользователя.

**Query:** `unreadOnly=true&cursor=...&limit=20`

**Response 200:**
```json
{
  "data": [
    {
      "id": "clnot123",
      "type": "booking_confirmed",
      "title": "Сессия подтверждена",
      "body": "Ваша сессия с Анной К. запланирована на 4 марта в 16:00",
      "channel": "in_app",
      "readAt": null,
      "entityType": "booking",
      "entityId": "clbook123",
      "createdAt": "2026-03-03T12:05:00Z"
    }
  ],
  "unreadCount": 3,
  "pagination": { "..." : "..." }
}
```

---

### PATCH /notifications/:id/read

Отметить уведомление прочитанным.

**Response 200:**
```json
{
  "data": { "id": "clnot123", "readAt": "2026-03-03T12:10:00Z" }
}
```

---

### PATCH /notifications/read-all

Отметить все уведомления прочитанными.

**Response 200:**
```json
{
  "data": { "updatedCount": 3 }
}
```

---

## 14. Admin -- Административные эндпоинты

Все эндпоинты требуют роль ADMIN.

### GET /admin/specialists/pending

Заявки специалистов на проверку.

**Query:** `status=PENDING&cursor=...&limit=20`

---

### POST /admin/specialists/:id/verify

Одобрение или отклонение заявки.

**Request:**
```json
{
  "action": "approve",
  "comment": "Документы проверены"
}
```

Или:
```json
{
  "action": "reject",
  "comment": "Диплом нечитаем, загрузите скан лучшего качества"
}
```

---

### GET /admin/reviews/pending

Отзывы на модерацию.

---

### POST /admin/reviews/:id/moderate

Модерация отзыва.

**Request:**
```json
{
  "action": "publish",
  "note": null
}
```

Допустимые action: `publish`, `reject`, `request_edit`.

---

### GET /admin/dashboard

Сводные метрики.

**Query:** `period=week&from=2026-02-24&to=2026-03-03`

**Response 200:**
```json
{
  "data": {
    "period": "week",
    "registrations": { "clients": 120, "specialists": 8 },
    "aiConsultations": { "started": 85, "completed": 62, "completionRate": 0.73 },
    "bookings": { "created": 45, "completed": 38, "cancelled": 5 },
    "revenue": { "gmv": 133000, "commission": 19950, "subscriptions": 8970 },
    "matching": { "averageScore": 84.2, "firstMatchRetention": 0.52 },
    "funnel": {
      "registration": 120,
      "aiConsultationStarted": 85,
      "aiConsultationCompleted": 62,
      "matchingGenerated": 58,
      "bookingCreated": 45,
      "paymentCompleted": 42,
      "sessionCompleted": 38
    }
  }
}
```

---

### GET /admin/crisis-alerts

Кризисные алерты.

**Query:** `status=new`

---

### POST /admin/crisis-alerts/:id/resolve

Закрытие кризисного алерта.

---

### POST /admin/promo-codes

Создание промокода.

**Request:**
```json
{
  "code": "LAUNCH",
  "type": "percent",
  "value": 30,
  "maxUses": 100,
  "validFrom": "2026-03-01T00:00:00Z",
  "validUntil": "2026-04-01T00:00:00Z",
  "applicableTo": "session"
}
```

---

## 15. Value Profile -- Ценностный профиль

### GET /value-profile/me

Получение ценностного профиля текущего пользователя.

**Response 200:**
```json
{
  "data": {
    "id": "clvp123",
    "ownerType": "CLIENT",
    "values": {
      "career": 0.75,
      "family": 0.60,
      "freedom": 0.85,
      "security": 0.40,
      "development": 0.90,
      "spirituality": 0.20,
      "relationships": 0.65,
      "health": 0.70,
      "creativity": 0.55,
      "justice": 0.45
    },
    "communicationStyle": {
      "directive_vs_supportive": 0.30,
      "analytical_vs_intuitive": 0.70,
      "structured_vs_free": 0.60,
      "past_vs_future": 0.50
    },
    "requestType": "therapy",
    "requestSummary": "Профессиональное выгорание...",
    "summaryText": "Вам важны свобода и развитие...",
    "version": 1,
    "updatedAt": "2026-03-03T12:18:00Z"
  }
}
```

---

### GET /value-profile/specialist/:specialistId

Публичный ценностный профиль специалиста (для сравнения).

---

## 16. WebSocket Events -- Real-time события

### Подключение

```
wss://api.soulmate.ru/ws?token=<access_token>
```

### События ИИ-чата

**Namespace:** `/ai-chat`

| Событие (Client -> Server) | Payload | Описание |
|---------------------------|---------|---------|
| `join_conversation` | `{ conversationId }` | Подключиться к разговору |
| `send_message` | `{ conversationId, content }` | Отправить сообщение |
| `typing` | `{ conversationId }` | Индикатор набора |

| Событие (Server -> Client) | Payload | Описание |
|---------------------------|---------|---------|
| `ai_stream_start` | `{ conversationId, messageId }` | Начало ответа ИИ |
| `ai_stream_token` | `{ conversationId, messageId, token }` | Токен стриминга |
| `ai_stream_end` | `{ conversationId, messageId, fullContent }` | Конец ответа ИИ |
| `phase_changed` | `{ conversationId, phase }` | Смена фазы разговора |
| `summary_ready` | `{ conversationId, summary }` | Резюме готово |
| `crisis_detected` | `{ conversationId, emergencyInfo }` | Кризис обнаружен |
| `action_buttons` | `{ conversationId, buttons[] }` | Кнопки-действия в чате |
| `error` | `{ code, message }` | Ошибка |

### Уведомления

**Namespace:** `/notifications`

| Событие (Server -> Client) | Payload | Описание |
|---------------------------|---------|---------|
| `new_notification` | `{ notification }` | Новое уведомление |
| `unread_count` | `{ count }` | Обновление счетчика непрочитанных |

### Мессенджер (Phase 2)

**Namespace:** `/messaging`

| Событие | Payload | Описание |
|---------|---------|---------|
| `new_message` (S->C) | `{ threadId, message }` | Новое сообщение |
| `send_message` (C->S) | `{ threadId, content, fileUrl? }` | Отправить сообщение |
| `typing` (both) | `{ threadId, userId }` | Набирает текст |
| `message_read` (C->S) | `{ threadId, messageId }` | Сообщение прочитано |
