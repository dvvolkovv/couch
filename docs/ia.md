# SoulMate -- Информационная архитектура (IA)

**Версия:** 1.0
**Дата:** 2026-03-03
**Автор:** UI/UX Designer

---

## 1. Карта сайта (Sitemap)

### 1.1. Публичные страницы (неавторизованный пользователь)

```
soulmate.ru/
|
+-- /                           Главная страница / Лендинг
+-- /catalog                    Каталог специалистов (без % совпадения)
|   +-- /catalog/:id            Профиль специалиста (публичный)
|
+-- /how-it-works               Как это работает
+-- /for-specialists            Лендинг для специалистов
+-- /pricing                    Тарифы для специалистов
|
+-- /auth/
|   +-- /auth/register          Регистрация клиента
|   +-- /auth/login             Вход
|   +-- /auth/reset-password    Сброс пароля
|   +-- /auth/verify-email      Подтверждение email
|   +-- /auth/verify-phone      Подтверждение телефона (SMS-код)
|
+-- /specialist/register        Регистрация специалиста (3 шага)
|
+-- /about                      О компании
+-- /contacts                   Контакты
+-- /privacy                    Политика конфиденциальности
+-- /terms                      Условия использования
+-- /specialist-terms           Условия для специалистов
+-- /blog                       Блог (SEO-контент)
|   +-- /blog/:slug             Статья блога
```

### 1.2. Страницы клиента (авторизованный)

```
soulmate.ru/
|
+-- /consultation               ИИ-консультация (чат)
+-- /consultation/results       Результаты: ценностный профиль + Top-5
|
+-- /catalog                    Каталог специалистов (с % совпадения)
|   +-- /catalog/:id            Профиль специалиста (с совпадением)
|   +-- /catalog/:id/book       Бронирование сессии
|
+-- /dashboard                  Дашборд клиента
|   +-- /dashboard/sessions     Мои сессии (предстоящие, история)
|   +-- /dashboard/favorites    Избранные специалисты
|   +-- /dashboard/messages     Сообщения
|   +-- /dashboard/messages/:id Чат с конкретным специалистом
|
+-- /session/:id                Карточка сессии (детали, ссылка на звонок)
+-- /session/:id/review         Отзыв после сессии
+-- /session/:id/call           Видеозвонок (Phase 2)
|
+-- /profile                    Настройки профиля клиента
|   +-- /profile/personal       Личные данные
|   +-- /profile/notifications  Уведомления
|   +-- /profile/security       Безопасность (смена пароля, 2FA)
|   +-- /profile/subscription   Подписка Premium
|   +-- /profile/payments       Способы оплаты
|   +-- /profile/data           Мои данные (экспорт, удаление)
|
+-- /premium                    Страница Premium-подписки
|
+-- /notifications              Все уведомления
```

### 1.3. Страницы специалиста (авторизованный)

```
soulmate.ru/specialist/
|
+-- /specialist/interview           ИИ-интервью (чат)
+-- /specialist/interview/result    Ценностный портрет
|
+-- /specialist/dashboard           Дашборд специалиста
|   +-- /specialist/dashboard/today Расписание на сегодня
|
+-- /specialist/schedule            Управление расписанием
+-- /specialist/clients             Список клиентов
|   +-- /specialist/clients/:id     Карточка клиента
+-- /specialist/messages            Сообщения
|   +-- /specialist/messages/:id    Чат с клиентом
+-- /specialist/finances            Финансы и выплаты
|   +-- /specialist/finances/history Детализация
|   +-- /specialist/finances/payout Запрос выплаты
|
+-- /specialist/profile             Мой профиль (редактор)
|   +-- /specialist/profile/edit    Редактирование
|   +-- /specialist/profile/preview Предпросмотр
|   +-- /specialist/profile/portrait Ценностный портрет
|
+-- /specialist/subscription        Тарифный план
+-- /specialist/settings            Настройки
|   +-- /specialist/settings/personal    Личные данные
|   +-- /specialist/settings/notifications Уведомления
|   +-- /specialist/settings/security    Безопасность
|   +-- /specialist/settings/integrations Интеграции (Zoom, Google Meet, Calendar)
|
+-- /specialist/session/:id         Карточка сессии
+-- /specialist/session/:id/call    Видеозвонок (Phase 2)
+-- /specialist/notifications       Все уведомления
```

### 1.4. Администрирование

```
soulmate.ru/admin/
|
+-- /admin/dashboard                Дашборд с метриками
+-- /admin/specialists              Управление специалистами
|   +-- /admin/specialists/pending  Заявки на модерацию
|   +-- /admin/specialists/:id      Карточка специалиста
+-- /admin/clients                  Управление клиентами
+-- /admin/reviews                  Модерация отзывов
+-- /admin/sessions                 Сессии (мониторинг)
+-- /admin/finances                 Финансы
+-- /admin/crisis-alerts            Кризисные алерты
+-- /admin/tariffs                  Управление тарифами
+-- /admin/promos                   Промокоды
+-- /admin/reports                  Отчеты (экспорт CSV)
```

---

## 2. Навигационная структура

### 2.1. Навигация для неавторизованного пользователя

#### Header (Desktop)

```
Левая часть:
  [Logo] SoulMate

Центр:
  Каталог              --> /catalog
  Как это работает      --> /how-it-works
  Для специалистов      --> /for-specialists

Правая часть:
  [Войти]              --> /auth/login
  [Начать подбор]      --> /auth/register (или /consultation если авторизован)
```

#### Mobile

```
Burger menu:
  Каталог
  Как это работает
  Для специалистов
  ---
  Войти
  Зарегистрироваться

Bottom nav: НЕ показывается для неавторизованных
```

### 2.2. Навигация для клиента

#### Header (Desktop)

```
Левая часть:
  [Logo] SoulMate

Центр:
  Каталог              --> /catalog
  Мои сессии           --> /dashboard/sessions
  Сообщения            --> /dashboard/messages

Правая часть:
  [bell](count)        --> /notifications (dropdown + /notifications)
  [avatar] Имя [v]     --> dropdown:
                           Мой профиль     --> /profile/personal
                           Избранное       --> /dashboard/favorites
                           Подписка        --> /profile/subscription
                           Настройки       --> /profile
                           ---
                           Выйти
```

#### Mobile Bottom Navigation

```
Вкладка 1: [home]     Главная    --> /dashboard
Вкладка 2: [search]   Каталог    --> /catalog
Вкладка 3: [chat]     Чат        --> /dashboard/messages
Вкладка 4: [calendar] Сессии     --> /dashboard/sessions
Вкладка 5: [user]     Профиль    --> /profile
```

### 2.3. Навигация для специалиста

#### Header (Desktop)

```
Левая часть:
  [Logo] SoulMate

Центр:
  Дашборд              --> /specialist/dashboard
  Расписание           --> /specialist/schedule
  Клиенты              --> /specialist/clients
  Сообщения            --> /specialist/messages

Правая часть:
  [bell](count)        --> dropdown
  [avatar] Имя [v]     --> dropdown:
                           Мой профиль     --> /specialist/profile
                           Финансы         --> /specialist/finances
                           Тарифный план   --> /specialist/subscription
                           Настройки       --> /specialist/settings
                           ---
                           Выйти
```

#### Mobile Bottom Navigation

```
Вкладка 1: [home]     Дашборд    --> /specialist/dashboard
Вкладка 2: [calendar] Расписание --> /specialist/schedule
Вкладка 3: [users]    Клиенты    --> /specialist/clients
Вкладка 4: [wallet]   Доход      --> /specialist/finances
Вкладка 5: [user]     Профиль    --> /specialist/profile
```

---

## 3. Иерархия контента

### 3.1. Профиль специалиста -- иерархия информации

Порядок отображения оптимизирован для задачи клиента: "Подходит ли мне этот специалист?"

```
Приоритет 1 (Above the fold):
  1. Фото, Имя, Тип, Верификация, Рейтинг
  2. Процент совпадения (если авторизован)
  3. Стоимость, формат, ближайшее доступное время

Приоритет 2 (Scrolling):
  4. Блок "Записаться" (календарь + кнопка)
  5. О специалисте (текст)
  6. Специализация (теги)
  7. Подходы (теги)
  8. Образование и опыт

Приоритет 3 (Deeper content):
  9. Ценностный портрет (радарная диаграмма + шкалы)
  10. Видео-визитка
  11. Отзывы

Обоснование:
  - Марина: сначала смотрит на совпадение и рейтинг,
    потом на стиль и подход, затем читает отзывы
  - Алексей: сначала оценивает данные (% совпадения, рейтинг),
    потом формат и стоимость, потом принимает решение
```

### 3.2. Карточка специалиста в каталоге -- иерархия

```
1. Фото + Имя + Верификация     (идентификация)
2. Тип + Специализация          (релевантность)
3. Рейтинг + Количество отзывов (социальное доказательство)
4. Процент совпадения           (ключевая метрика)
5. Цена + Формат                (практические ограничения)
6. Ближайшее доступное время    (срочность)
7. CTA-кнопки                   (действие)
```

### 3.3. Дашборд клиента -- иерархия

```
1. Приветствие (персонализация)
2. Ближайшая сессия + CTA "Войти в сессию"  (самое срочное)
3. Список предстоящих сессий                (планирование)
4. Ценностный профиль (мини)                (осведомленность)
5. Избранные специалисты                    (быстрый доступ)
6. CTA "Начать новый подбор"                (повторное вовлечение)
```

### 3.4. Дашборд специалиста -- иерархия

```
1. Приветствие + тарифный план
2. Метрики-виджеты (сессии сегодня, за неделю, доход, рейтинг)
3. Расписание на сегодня + CTA "Войти в сессию"   (оперативное)
4. Новые запросы от клиентов + Принять/Отклонить   (лиды)
5. Финансы: баланс + последние транзакции           (мотивация)
```

---

## 4. Состояния страниц (Page States)

### 4.1. Общие состояния для каждой страницы

```
1. Loading (Загрузка)
   - Skeleton screens (повторяют структуру контента)
   - Spinner для модальных окон и inline-загрузок
   - Прогресс-бар для длительных операций

2. Empty (Пусто)
   - Иллюстрация/иконка
   - Заголовок: что здесь должно быть
   - Описание: что делать, чтобы заполнить
   - CTA: основное действие

3. Error (Ошибка)
   - Иконка ошибки
   - Заголовок: что пошло не так
   - Описание: как исправить
   - CTA: [Повторить] / [На главную]

4. Success (Успех)
   - Иконка успеха (галочка)
   - Заголовок: что произошло
   - Описание: что делать дальше
   - CTA: следующий шаг

5. Partial (Частичная загрузка)
   - Контент загружен, но не полностью
   - Кнопка "Загрузить еще" / infinite scroll
```

### 4.2. Конкретные состояния

```
Каталог:
  - Загрузка: skeleton карточек (6 штук)
  - Пустой (нет результатов): "По вашим критериям специалистов не найдено"
  - Мало результатов (< 5): предупреждение + предложение расширить фильтры
  - Стандартный: список + пагинация/infinite scroll

ИИ-консультация:
  - Ожидание ответа ИИ: typing indicator (3 точки)
  - Ошибка сети: toast + кнопка "Повторить"
  - Прервана: сохранение состояния + кнопка "Продолжить позже"

Дашборд клиента:
  - Нет сессий: "У вас пока нет сессий" + CTA "Начать подбор"
  - Нет профиля: "Пройдите ИИ-консультацию для подбора" + CTA
  - Ожидание сессии: карточка ближайшей сессии с таймером

Профиль специалиста:
  - Не верифицирован: бейдж "На проверке"
  - Нет свободных слотов: "Нет доступного времени" + кнопка "Уведомить меня"
  - Нет отзывов: "Отзывов пока нет"
```

---

## 5. Ролевая модель доступа

```
Роль              | Страницы                                    | Действия
----------------- | ------------------------------------------- | ---------
Гость             | Лендинг, Каталог (без %),                   | Просмотр,
(неавторизованный)| Профиль специалиста (без %), Регистрация,   | регистрация
                  | Вход, Блог, Статические страницы             |

Клиент            | Все публичные + Каталог (с %),               | Просмотр, ИИ-консультация,
                  | ИИ-консультация, Результаты,                 | бронирование, оплата,
                  | Бронирование, Дашборд, Профиль,              | отзывы, сообщения,
                  | Сессии, Сообщения, Уведомления               | отмена/перенос

Клиент Premium    | Все клиентские + неогранич. ИИ-консультации  | Все клиентские +
                  |                                              | приоритетное бронирование

Специалист        | Дашборд специалиста, Расписание,             | Управление профилем,
                  | Клиенты, Сообщения, Финансы,                 | расписанием, принятие
                  | Профиль, Тарифы, Настройки                   | клиентов, проведение
                  |                                              | сессий

Администратор     | Все + Админ-панель                           | Модерация, управление
                  |                                              | тарифами, мониторинг
```

---

## 6. URL-паттерны и роутинг

### 6.1. Правила URL

```
Формат: kebab-case, только латиница
Параметры: :id -- UUID (32 символа), :slug -- человекочитаемый
Пагинация: ?page=2&limit=10
Фильтры: ?type=psychologist&price_min=2000&price_max=4000&format=online
Сортировка: ?sort=match_desc / sort=rating_desc / sort=price_asc
Поиск: ?q=кпт+тревожность

Примеры:
  /catalog?type=psychologist&price_max=4000&sort=match_desc&page=1
  /catalog/a1b2c3d4-e5f6-7890-abcd-ef1234567890
  /blog/pochemu-sovpadenie-tsennostej-vazhno
```

### 6.2. Редиректы

```
Неавторизованный --> /consultation       ==> /auth/register?redirect=/consultation
Неавторизованный --> /dashboard           ==> /auth/login?redirect=/dashboard
Клиент           --> /specialist/*        ==> /dashboard (403 Forbidden)
Специалист       --> /consultation        ==> /specialist/dashboard (303)
Специалист       --> /dashboard           ==> /specialist/dashboard (303)
Авторизованный   --> /auth/register       ==> /dashboard или /specialist/dashboard
Авторизованный   --> /auth/login          ==> /dashboard или /specialist/dashboard
```

### 6.3. Deep Linking

```
Приглашение от специалиста:  /catalog/:id?ref=specialist
Реферальная ссылка:          /?ref=:code
Возврат в чат:               /consultation?resume=true
Ссылка на сессию:            /session/:id
Ссылка из email-уведомления: /session/:id/call
```

---

## 7. Поиск и фильтрация

### 7.1. Каталог специалистов -- параметры фильтрации

```
Фильтр                  | Тип           | Значения                | Приоритет
------------------------ | ------------- | ----------------------- | ---------
Тип специалиста          | Checkbox      | Психолог, Коуч,         | Must
                         |               | Психотерапевт           |
Цена за сессию           | Range slider  | 1000 - 10000 (шаг 500)  | Must
Формат                   | Toggle group  | Онлайн, Офлайн, Все     | Must
Подход                   | Checkbox      | КПТ, Гештальт,          | Must
                         |               | Психоанализ и др. (12+) |
Рейтинг                  | Radio         | Любой, 4.0+, 4.5+, 4.8+ | Must
Пол                      | Toggle group  | Все, Ж, М               | Should
Видео-визитка            | Toggle        | Есть / нет              | Should
Статус                   | Toggle        | Онлайн сейчас           | Should
Верификация              | Toggle        | Только проверенные       | Should (default: on)
```

### 7.2. Сортировка

```
Вариант                  | Доступность
------------------------ | ---------------------------
По совпадению (убыв.)    | Только для авторизованных с профилем (default)
По рейтингу (убыв.)      | Всегда
По цене (возр.)          | Всегда
По цене (убыв.)          | Всегда
По отзывам (убыв.)       | Всегда
По ближайшему окну       | Всегда
```

### 7.3. Текстовый поиск

```
Поиск по:
  - Имя специалиста
  - Специализация (теги)
  - Подход (теги)
  - Текст описания

Поведение:
  - Debounce: 300ms
  - Минимум 2 символа
  - Подсветка совпадений в результатах
  - Автодополнение по популярным запросам (Phase 2)
```

---

## 8. Мобильная навигация: детальные паттерны

### 8.1. Жесты

```
Swipe left на карточке сессии --> показать кнопки [Перенести] [Отменить]
Swipe down на чате --> обновить сообщения (pull-to-refresh)
Swipe down на Bottom Sheet --> закрыть
Long press на сообщении --> контекстное меню [Копировать]
Pinch-to-zoom на фото специалиста --> увеличение
```

### 8.2. Back Navigation

```
Hardware back button / Swipe from edge (iOS):
  - Чат ИИ --> Подтверждение: "Прервать консультацию? Прогресс будет сохранен."
  - Бронирование (форма оплаты) --> Подтверждение: "Отменить бронирование?"
  - Все остальные --> стандартный back
```

### 8.3. Deep Navigation

```
Максимальная глубина навигации: 4 уровня

Пример:
  Главная --> Каталог --> Профиль специалиста --> Бронирование
  (1)        (2)        (3)                    (4)

Breadcrumbs на desktop:
  Главная > Каталог > Елена Иванова > Бронирование

На mobile: кнопка [<] с названием предыдущего экрана
```

---

## 9. Схема данных на страницах

### 9.1. Профиль специалиста -- данные для отображения

```
Обязательные (MVP):
  - id: UUID
  - name: string
  - type: enum (psychologist | coach | therapist)
  - photo_url: string
  - is_verified: boolean
  - rating: float (1-5)
  - reviews_count: integer
  - experience_years: integer
  - specializations: string[]
  - approaches: string[]
  - education: object[]
  - session_price: integer (рубли)
  - session_duration: integer (минуты)
  - format: enum (online | offline | hybrid)
  - city: string | null
  - about: string (до 2000 символов)
  - value_portrait: object (оси + числовые значения)
  - available_slots: object[] (дата + время)

Опциональные:
  - video_url: string | null
  - match_percentage: integer | null (только для авторизованных с профилем)
  - match_explanation: string[] | null
  - subscription_tier: enum (basic | pro | expert)
  - online_status: boolean
  - next_available_slot: datetime
```

### 9.2. Карточка сессии -- данные

```
  - id: UUID
  - specialist: object (id, name, photo, type)
  - client: object (id, name) -- только для специалиста
  - date: datetime
  - duration: integer (минуты)
  - format: enum (online | offline)
  - status: enum (pending | confirmed | in_progress | completed | cancelled)
  - price: integer
  - video_link: string | null
  - video_service: enum (zoom | google_meet | builtin)
  - can_cancel: boolean
  - can_reschedule: boolean
  - refund_percentage: integer (0 | 50 | 100)
```

---
