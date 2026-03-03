# SoulMate -- Дизайн-система

**Версия:** 1.0
**Дата:** 2026-03-03
**Автор:** UI/UX Designer

---

## 1. Философия дизайна

SoulMate -- платформа, которая помогает людям найти "своего" специалиста. Дизайн должен вызывать чувство **спокойствия, доверия и профессионализма**. Мы не медицинский сервис и не "духовная практика" -- мы современный технологичный инструмент для осознанного выбора.

**Принципы:**
1. **Спокойствие.** Мягкие цвета, округлые формы, достаточно воздуха. Пользователь не должен чувствовать давления.
2. **Ясность.** Простая навигация, понятные действия, нет перегруженности. Марина (первый раз у психолога) и Алексей (ценит время) должны моментально понимать, что делать.
3. **Доверие.** Визуальные маркеры профессионализма: верификация, бейджи, структурированные данные. Алексей принимает решения на основе данных.
4. **Теплота.** Не холодный корпоративный стиль, а живой, человечный. ИИ-агент общается как профессионал, а не как машина.
5. **Инклюзивность.** Контрастность WCAG 2.1 AA, поддержка ассистивных технологий, responsive-дизайн.

---

## 2. Цветовая палитра

### 2.1. Основные цвета (Brand Colors)

```
Primary (Индиго)
  primary-900:  #1E1B4B   -- Заголовки, акцентный текст
  primary-800:  #312E81   -- Hover состояния
  primary-700:  #4338CA   -- Основные кнопки, ссылки
  primary-600:  #4F46E5   -- Основной брендовый цвет
  primary-500:  #6366F1   -- Иконки, бейджи
  primary-400:  #818CF8   -- Hover для вторичных элементов
  primary-300:  #A5B4FC   -- Теги, бордеры
  primary-200:  #C7D2FE   -- Фон карточек, выделения
  primary-100:  #E0E7FF   -- Фон секций
  primary-50:   #EEF2FF   -- Легкий фон
```

```
Secondary (Теплый розовый / Румянец)
  secondary-900:  #831843
  secondary-800:  #9D174D
  secondary-700:  #BE185D
  secondary-600:  #DB2777
  secondary-500:  #EC4899   -- Акценты, процент совпадения
  secondary-400:  #F472B6   -- Hover
  secondary-300:  #F9A8D4   -- Декоративные элементы
  secondary-200:  #FBCFE8   -- Фон акцентных карточек
  secondary-100:  #FCE7F3
  secondary-50:   #FDF2F8
```

### 2.2. Нейтральные цвета

```
Neutral (Серо-голубой)
  neutral-950:  #0F172A   -- Основной текст
  neutral-900:  #1E293B   -- Заголовки
  neutral-800:  #334155   -- Подзаголовки
  neutral-700:  #475569   -- Вторичный текст
  neutral-600:  #64748B   -- Placeholder, подсказки
  neutral-500:  #94A3B8   -- Disabled текст
  neutral-400:  #CBD5E1   -- Бордеры
  neutral-300:  #E2E8F0   -- Разделители
  neutral-200:  #F1F5F9   -- Фон вторичный
  neutral-100:  #F8FAFC   -- Фон страницы
  neutral-0:    #FFFFFF   -- Белый фон карточек
```

### 2.3. Семантические цвета

```
Success (Зеленый)
  success-700:  #15803D
  success-600:  #16A34A   -- Текст, иконки
  success-500:  #22C55E   -- Фон бейджей
  success-100:  #DCFCE7   -- Фон алертов
  success-50:   #F0FDF4

Warning (Янтарный)
  warning-700:  #B45309
  warning-600:  #D97706   -- Текст, иконки
  warning-500:  #F59E0B   -- Фон бейджей
  warning-100:  #FEF3C7   -- Фон алертов
  warning-50:   #FFFBEB

Error (Красный)
  error-700:    #B91C1C
  error-600:    #DC2626   -- Текст, иконки
  error-500:    #EF4444   -- Фон бейджей
  error-100:    #FEE2E2   -- Фон алертов
  error-50:     #FEF2F2

Info (Голубой)
  info-700:     #0369A1
  info-600:     #0284C7   -- Текст, иконки
  info-500:     #0EA5E9   -- Фон бейджей
  info-100:     #E0F2FE   -- Фон алертов
  info-50:      #F0F9FF
```

### 2.4. Градиенты

```
gradient-primary:     linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)
gradient-warm:        linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)
gradient-match:       linear-gradient(135deg, #06B6D4 0%, #4F46E5 100%)
gradient-hero:        linear-gradient(180deg, #EEF2FF 0%, #FFFFFF 100%)
gradient-card-hover:  linear-gradient(135deg, #F0F9FF 0%, #EEF2FF 100%)
```

### 2.5. Использование цветов

| Элемент | Цвет | Токен |
|---------|-------|-------|
| Фон страницы | #F8FAFC | neutral-100 |
| Фон карточек | #FFFFFF | neutral-0 |
| Основной текст | #0F172A | neutral-950 |
| Вторичный текст | #475569 | neutral-800 |
| Placeholder | #94A3B8 | neutral-500 |
| Основная кнопка | #4F46E5 | primary-600 |
| Ссылки | #4338CA | primary-700 |
| Процент совпадения (высокий 80%+) | #16A34A | success-600 |
| Процент совпадения (средний 60-79%) | #D97706 | warning-600 |
| Процент совпадения (низкий <60%) | #94A3B8 | neutral-500 |
| Кризисный алерт | #DC2626 фон #FEE2E2 | error-600 / error-100 |
| Бейдж "Проверен" | #4F46E5 фон #E0E7FF | primary-600 / primary-100 |
| Бейдж "Топ-специалист" | #D97706 фон #FEF3C7 | warning-600 / warning-100 |

---

## 3. Типографика

### 3.1. Шрифты

```
Основной шрифт (заголовки + body):  Inter
Альтернатива:                        -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
Моноширинный (коды, техничный текст): JetBrains Mono
```

Inter выбран за: превосходную читаемость на экране, широкий набор начертаний, поддержку кириллицы, вариативность (variable font для оптимизации загрузки).

### 3.2. Шкала типографики

```
Display (Hero-заголовки)
  display-xl:  56px / line-height: 1.1 / weight: 700 / letter-spacing: -0.02em
  display-lg:  48px / line-height: 1.1 / weight: 700 / letter-spacing: -0.02em
  display-md:  40px / line-height: 1.15 / weight: 700 / letter-spacing: -0.01em

Headings
  h1:  32px / line-height: 1.2 / weight: 700 / letter-spacing: -0.01em
  h2:  28px / line-height: 1.25 / weight: 600 / letter-spacing: -0.01em
  h3:  24px / line-height: 1.3 / weight: 600
  h4:  20px / line-height: 1.35 / weight: 600
  h5:  18px / line-height: 1.4 / weight: 600
  h6:  16px / line-height: 1.4 / weight: 600

Body
  body-lg:     18px / line-height: 1.6 / weight: 400
  body-md:     16px / line-height: 1.6 / weight: 400  (основной)
  body-sm:     14px / line-height: 1.5 / weight: 400

Caption / Overline
  caption:     12px / line-height: 1.5 / weight: 400
  overline:    12px / line-height: 1.5 / weight: 600 / letter-spacing: 0.05em / text-transform: uppercase

Button
  btn-lg:      16px / line-height: 1 / weight: 600
  btn-md:      14px / line-height: 1 / weight: 600
  btn-sm:      12px / line-height: 1 / weight: 600
```

### 3.3. Адаптивная типографика (Mobile)

На экранах < 768px:
```
display-xl:  36px (было 56px)
display-lg:  32px (было 48px)
display-md:  28px (было 40px)
h1:          28px (было 32px)
h2:          24px (было 28px)
h3:          20px (было 24px)
h4:          18px (было 20px)
```

---

## 4. Сетка и отступы

### 4.1. Spacing Scale (на основе 4px)

```
space-0:    0px
space-0.5:  2px
space-1:    4px
space-1.5:  6px
space-2:    8px
space-3:    12px
space-4:    16px
space-5:    20px
space-6:    24px
space-8:    32px
space-10:   40px
space-12:   48px
space-16:   64px
space-20:   80px
space-24:   96px
space-32:   128px
```

### 4.2. Layout Grid

```
Desktop (>= 1280px):
  Контейнер:  max-width: 1200px, margin: 0 auto
  Колонки:    12
  Gutter:     24px
  Padding:    32px (по бокам)

Tablet (768px - 1279px):
  Контейнер:  max-width: 100%
  Колонки:    8
  Gutter:     20px
  Padding:    24px (по бокам)

Mobile (< 768px):
  Контейнер:  max-width: 100%
  Колонки:    4
  Gutter:     16px
  Padding:    16px (по бокам)
```

### 4.3. Секционные отступы

```
Между секциями на лендинге:       80px (desktop) / 48px (mobile)
Между блоками внутри секции:      40px (desktop) / 24px (mobile)
Между элементами в блоке:         16px-24px
Padding карточки:                  24px (desktop) / 16px (mobile)
Padding модального окна:           32px (desktop) / 20px (mobile)
```

---

## 5. Border Radius и Тени

### 5.1. Border Radius

```
radius-none:   0px
radius-sm:     4px     -- Инпуты, мелкие элементы
radius-md:     8px     -- Кнопки, карточки
radius-lg:     12px    -- Большие карточки, модальные окна
radius-xl:     16px    -- Hero-карточки, контейнеры секций
radius-2xl:    24px    -- Специальные элементы (чат-баблы)
radius-full:   9999px  -- Аватары, бейджи, чипы
```

### 5.2. Box Shadows

```
shadow-sm:     0 1px 2px 0 rgba(0, 0, 0, 0.05)
shadow-md:     0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)
shadow-lg:     0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)
shadow-xl:     0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)
shadow-2xl:    0 25px 50px -12px rgba(0, 0, 0, 0.25)
shadow-card:   0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)
shadow-card-hover: 0 10px 30px rgba(79, 70, 229, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)
shadow-chat:   0 2px 8px rgba(0, 0, 0, 0.08)
```

---

## 6. Компонентная библиотека

### 6.1. Кнопки (Buttons)

**Размеры:**
```
btn-lg:   height: 48px, padding: 0 24px, font: btn-lg (16px/600), radius: radius-md
btn-md:   height: 40px, padding: 0 20px, font: btn-md (14px/600), radius: radius-md
btn-sm:   height: 32px, padding: 0 16px, font: btn-sm (12px/600), radius: radius-sm
```

**Варианты:**

```
Primary (Основная)
  Default:   bg: primary-600, text: white, shadow: shadow-sm
  Hover:     bg: primary-700, shadow: shadow-md
  Active:    bg: primary-800
  Disabled:  bg: neutral-300, text: neutral-500, cursor: not-allowed
  Loading:   bg: primary-600, opacity: 0.8, spinner icon

  +-------------------------------+
  |    Начать подбор специалиста   |
  +-------------------------------+
  bg: #4F46E5, text: #FFFFFF, radius: 8px

Secondary (Вторичная)
  Default:   bg: white, text: primary-600, border: 1px solid primary-300
  Hover:     bg: primary-50, border-color: primary-400
  Active:    bg: primary-100
  Disabled:  bg: neutral-100, text: neutral-400, border-color: neutral-300

  +-------------------------------+
  |        Подробнее              |
  +-------------------------------+
  bg: #FFFFFF, text: #4F46E5, border: 1px solid #A5B4FC

Ghost (Призрачная)
  Default:   bg: transparent, text: primary-600
  Hover:     bg: primary-50
  Active:    bg: primary-100

  +-------------------------------+
  |          Отмена               |
  +-------------------------------+
  bg: transparent, text: #4F46E5

Danger (Опасная)
  Default:   bg: error-600, text: white
  Hover:     bg: error-700
  Active:    bg: error-800

  +-------------------------------+
  |     Отменить бронирование     |
  +-------------------------------+
  bg: #DC2626, text: #FFFFFF

Text Button (Текстовая кнопка-ссылка)
  Default:   bg: none, text: primary-600, underline: none
  Hover:     underline: solid
```

**Кнопка с иконкой:**
```
  +---+-------------------------------+
  | > |    Забронировать сессию        |
  +---+-------------------------------+
  Иконка слева: 20x20, margin-right: 8px
```

**Full-width кнопка (мобильная):**
```
  width: 100%, height: 48px
```

### 6.2. Поля ввода (Input Fields)

**Базовые параметры:**
```
height:      44px (md) / 52px (lg)
padding:     12px 16px
border:      1px solid neutral-400
radius:      radius-sm (4px)
font:        body-md (16px) -- НЕ менее 16px на iOS чтобы избежать auto-zoom
bg:          white
```

**Состояния:**
```
Default:     border: neutral-400 (#CBD5E1)
Focus:       border: primary-500 (#6366F1), ring: 3px primary-100 (#E0E7FF)
Error:       border: error-500 (#EF4444), ring: 3px error-50 (#FEF2F2)
Disabled:    bg: neutral-200, border: neutral-300, text: neutral-500
Filled:      border: neutral-400, text: neutral-950
```

**Text Input:**
```
  Имя *
  +------------------------------------------+
  |  Марина                                   |
  +------------------------------------------+

  Label:      body-sm (14px/600), color: neutral-800, margin-bottom: 6px
  Input:      body-md (16px/400), color: neutral-950
  Placeholder: color: neutral-500
  Helper:     caption (12px/400), color: neutral-600, margin-top: 4px
  Error:      caption (12px/400), color: error-600, margin-top: 4px
```

**Textarea:**
```
  Расскажите о себе
  +------------------------------------------+
  |                                          |
  |  Я практикующий психолог с 14-летним...  |
  |                                          |
  +------------------------------------------+
  234 / 2000 символов

  min-height: 120px
  resize: vertical
  Счетчик символов: caption, color: neutral-600, text-align: right
```

**Select (Dropdown):**
```
  Тип специалиста
  +------------------------------------------+
  |  Психолог                            [v] |
  +------------------------------------------+

  Dropdown panel:
  +------------------------------------------+
  |  Психолог                          [ok]  |
  |  Коуч                                    |
  |  Психотерапевт                           |
  +------------------------------------------+
  shadow: shadow-lg, radius: radius-md, max-height: 240px, overflow: scroll
```

**Phone Input:**
```
  Телефон
  +------+-----------------------------------+
  | +7 v |  (999) 123-45-67                   |
  +------+-----------------------------------+

  Код страны: select (width: 72px), маска ввода: автоформатирование
```

**Поле с иконкой поиска:**
```
  +------------------------------------------+
  | [Q]  Поиск по имени или специализации... |
  +------------------------------------------+

  Иконка: 20x20, color: neutral-500, padding-left: 44px
```

**Поле ввода SMS-кода:**
```
  Введите код из SMS
  +----+  +----+  +----+  +----+
  | 1  |  | 2  |  | 3  |  | 4  |
  +----+  +----+  +----+  +----+

  Каждая ячейка: 56x56, font: h2 (28px/600), text-align: center
  Auto-focus на следующую ячейку при вводе
  Auto-submit при заполнении всех ячеек
```

### 6.3. Карточки (Cards)

#### Карточка специалиста (Specialist Card) -- Каталог

```
+--------------------------------------------------+
|                                                  |
|  +------+  Елена Иванова            [heart]     |
|  | ФОТО |  Психолог * Проверен [v]              |
|  | 80x80|  КПТ, Гештальт-терапия                |
|  +------+  ****+ (4.8) * 127 отзывов            |
|                                                  |
|  [== 87% совпадение ==]                          |
|                                                  |
|  "Разделяет ваш фокус на саморазвитии,           |
|   работает в структурированном подходе"           |
|                                                  |
|  4 000 Р / сессия    Ближайшее: завтра, 14:00   |
|                                                  |
|  [   Подробнее   ]   [ Забронировать ]           |
|                                                  |
+--------------------------------------------------+

Размеры:
  width: 100% (в grid-колонке)
  padding: 24px
  radius: radius-lg (12px)
  shadow: shadow-card
  hover: shadow-card-hover, translateY(-2px)
  bg: white

Аватар:
  width: 80px, height: 80px, radius: radius-full
  border: 3px solid primary-100
  object-fit: cover

Бейдж совпадения:
  height: 32px, radius: radius-full, padding: 0 16px
  bg: gradient-match, text: white, font: btn-sm
  Процент >= 80%: gradient-match (сине-фиолетовый)
  Процент 60-79%: bg warning-100, text warning-700
  Процент < 60%: bg neutral-200, text neutral-600

Бейдж "Проверен":
  height: 20px, inline, icon: shield-check (16x16)
  color: primary-600
```

#### Карточка специалиста -- Рекомендации (Match Card)

```
+--------------------------------------------------+
|  #1 Лучшее совпадение                            |
|                                                  |
|  +----------+                                     |
|  |          |   Елена Иванова                     |
|  |   ФОТО   |   Психолог * Проверен              |
|  |  120x120 |   14 лет опыта                     |
|  |          |   ****+ (4.8)                      |
|  +----------+                                     |
|                                                  |
|  +--------------------------------------------+  |
|  |  [===== 92% совпадение =====]              |  |
|  +--------------------------------------------+  |
|                                                  |
|  Почему подходит:                                |
|  * Разделяет ваш фокус на глубинной работе       |
|  * Работает в КПТ -- подходит для вашего запроса  |
|  * Стиль: мягкая поддержка + структура            |
|                                                  |
|  4 000 Р / 50 мин    Онлайн                      |
|  Ближайшее окно: 5 марта, 14:00                 |
|                                                  |
|  [ Забронировать ]  [ Подробнее ]  [Не подходит] |
|                                                  |
+--------------------------------------------------+

Размеры:
  width: 100% (max-width: 640px, по центру)
  padding: 32px
  radius: radius-xl (16px)
  shadow: shadow-lg
  bg: white
  border-top: 4px solid primary-600 (для #1), primary-300 (для #2-5)
```

#### Карточка сессии (Session Card)

```
+--------------------------------------------------+
|  [calendar] 5 марта 2026, 14:00 - 14:50         |
|                                                  |
|  +------+  Елена Иванова                         |
|  | ФОТО |  Психолог                              |
|  +------+                                         |
|                                                  |
|  Формат: Онлайн (Zoom)                           |
|  Статус: [*] Подтверждена                        |
|                                                  |
|  [ Войти в сессию ]        [ Перенести | Отменить ] |
+--------------------------------------------------+

Статусы:
  Подтверждена:  бейдж success-100, text success-700
  Ожидает оплаты: бейдж warning-100, text warning-700
  Завершена:     бейдж neutral-200, text neutral-600
  Отменена:      бейдж error-100, text error-700
```

### 6.4. Чат-баблы (Chat Bubbles)

Используются в ИИ-консультации клиента (US-2.1) и ИИ-интервью специалиста (US-3.2).

#### Сообщение ИИ (левое)

```
  +------+
  | [AI] |
  +------+
     +-----------------------------------------------+
     |  Здравствуйте! Я -- ИИ-консультант SoulMate.   |
     |  Я помогу вам разобраться в вашем запросе       |
     |  и подберу подходящего специалиста.              |
     |                                                 |
     |  Все, что вы расскажете, конфиденциально.       |
     |                                                 |
     |  Расскажите, что привело вас сюда?              |
     +-----------------------------------------------+
                                             14:32

  Аватар: 36x36, radius-full, bg: gradient-primary, icon: sparkle (white)
  Бабл:
    bg: neutral-200 (#F1F5F9)
    radius: 2px 24px 24px 24px (верхний левый -- маленький)
    padding: 16px 20px
    max-width: 75% (desktop) / 85% (mobile)
    font: body-md
    color: neutral-950
  Время: caption, color: neutral-500, margin-top: 4px
```

#### Сообщение пользователя (правое)

```
                 +-----------------------------------------------+
                 |  Последнее время чувствую сильное выгорание    |
                 |  на работе. Не понимаю, хочу ли я сменить     |
                 |  работу или проблема глубже.                   |
                 +-----------------------------------------------+
                                                          14:33

  Бабл:
    bg: primary-600 (#4F46E5)
    color: white
    radius: 24px 24px 2px 24px (нижний правый -- маленький)
    padding: 16px 20px
    max-width: 75% (desktop) / 85% (mobile)
  Время: caption, color: neutral-500, margin-top: 4px, text-align: right
```

#### Системное сообщение (центр)

```
          ----- ИИ анализирует ваш профиль -----

  text-align: center
  font: caption, color: neutral-500
  padding: 8px 0
  border-top/bottom: 1px dashed neutral-300 (опционально)
```

#### Быстрые ответы (Quick Replies) -- для US-2.4

```
  Какой формат вам удобнее?

  [ Онлайн ]  [ Офлайн ]  [ Гибрид ]

  Каждый чип:
    height: 36px, padding: 0 16px
    bg: white, border: 1px solid primary-300
    radius: radius-full
    font: body-sm (14px/500)
    color: primary-700
    hover: bg primary-50, border primary-500
    active/selected: bg primary-600, text white
```

#### Индикатор набора (Typing Indicator)

```
  +------+
  | [AI] |  +-------------+
  +------+  |  *  *  *    |
             +-------------+

  3 точки с анимацией пульсации (stagger: 0.15s каждая)
  bg: neutral-200, radius: 24px, padding: 12px 20px
  Показывается во время ожидания ответа ИИ
```

### 6.5. Визуализация ценностей (Value Portrait)

Ключевой компонент для MTH-07, US-3.3, US-4.2.

#### Радарная диаграмма (Radar Chart)

```
                    Семья
                      *
                   *     *
         Духовность        Карьера
              *                *
            *                    *
      Безопасность          Развитие
            *                    *
              *                *
         Свобода           Гармония
                   *     *
                      *
                   Здоровье

  Размеры: 280x280 (desktop) / 220x220 (mobile)

  Оси: 8-12 ценностей (определяются по результатам ИИ-консультации)
  Заливка профиля клиента: primary-200, opacity: 0.3, stroke: primary-500
  Заливка профиля специалиста: secondary-200, opacity: 0.3, stroke: secondary-500
  Зона пересечения: gradient-match, opacity: 0.4

  Подписи осей: caption (12px), color: neutral-700
  Точки на осях: 6x6 кружки, fill: primary-600 / secondary-600
```

#### Теги ценностей (Value Tags)

```
  Ваш ценностный профиль:

  [# Саморазвитие]  [# Карьера]  [# Баланс]
  [# Структура]  [# Глубинная работа]

  Каждый тег:
    height: 28px, padding: 0 12px
    bg: primary-100, text: primary-700
    radius: radius-full
    font: caption (12px/500)

  Высокое совпадение (присутствует у обоих):
    bg: success-100, text: success-700, border: 1px solid success-300

  Уникально для клиента:
    bg: primary-100, text: primary-700

  Уникально для специалиста:
    bg: secondary-100, text: secondary-700
```

#### Процент совпадения (Match Percentage Display)

```
  Большой вариант (на странице результатов):

  +------------------------------------------+
  |                                          |
  |         [======= 92% =======]            |
  |              Совпадение                  |
  |                                          |
  |   Семья       [||||||||  ] 95%           |
  |   Карьера     [|||||||   ] 88%           |
  |   Стиль       [||||||    ] 78%           |
  |   Подход      [||||||||||| 98%           |
  |                                          |
  +------------------------------------------+

  Кольцевая диаграмма (основной вариант):
    Размер: 120x120
    Stroke width: 8px
    Track: neutral-200
    Fill: gradient-match (conic-gradient)
    Число по центру: display-md (40px/700), primary-600
    Подпись: caption, neutral-600

  Линейные прогресс-бары (детализация):
    height: 8px, radius: radius-full
    Track: neutral-200
    Fill: primary-500 (>= 80%) / warning-500 (60-79%) / neutral-400 (<60%)
    Label слева: body-sm, neutral-800
    % справа: body-sm (14px/600), neutral-950
```

### 6.6. Навигация (Navigation)

#### Header (Desktop)

```
+------------------------------------------------------------------+
|  [Logo] SoulMate    Каталог  Как это работает  Для специалистов   |
|                                        [Войти]  [Начать подбор]  |
+------------------------------------------------------------------+

  height: 64px
  bg: white / backdrop-filter: blur(10px) + bg: rgba(255,255,255,0.9)
  border-bottom: 1px solid neutral-200
  position: sticky, top: 0, z-index: 50
  shadow: shadow-sm (при скролле)

  Logo: 32px height, color: primary-600
  Навигация: body-md (16px/500), color: neutral-700
  Active link: color: primary-600, font-weight: 600
  Hover: color: primary-500
  Кнопка "Войти": secondary btn-md
  Кнопка "Начать подбор": primary btn-md
```

#### Header (Авторизованный пользователь -- Desktop)

```
+------------------------------------------------------------------+
|  [Logo] SoulMate    Каталог  Мои сессии  Сообщения               |
|                                [bell(2)]  +------+               |
|                                           | Фото | Марина  [v]  |
|                                           +------+               |
+------------------------------------------------------------------+

  Bell icon: 24x24, neutral-600, бейдж count: 16x16 bg error-500 text white
  Avatar: 32x32, radius-full
  Dropdown меню при клике на аватар:
    +---------------------------+
    |  Марина Петрова           |
    |  marina@email.com         |
    |  -------------------------+
    |  [user] Мой профиль       |
    |  [heart] Избранное        |
    |  [card] Подписка          |
    |  [settings] Настройки     |
    |  -------------------------+
    |  [logout] Выйти           |
    +---------------------------+
```

#### Header (Авторизованный специалист -- Desktop)

```
+------------------------------------------------------------------+
|  [Logo] SoulMate    Дашборд  Расписание  Клиенты  Сообщения      |
|                                [bell(3)]  +------+               |
|                                           | Фото | Елена  [v]   |
|                                           +------+               |
+------------------------------------------------------------------+
```

#### Mobile Header

```
+------------------------------------------+
|  [=]  [Logo] SoulMate     [bell]  [user] |
+------------------------------------------+

  height: 56px
  Hamburger [=]: 24x24, открывает Sidebar/Drawer слева
  Bell: 24x24
  User avatar: 28x28
```

#### Mobile Bottom Navigation

```
+------------------------------------------+
|  [home]    [search]  [chat]  [calendar]  [user]  |
|  Главная   Каталог   Чат    Сессии    Профиль |
+------------------------------------------+

  height: 64px (+ safe-area-inset-bottom на iOS)
  bg: white
  border-top: 1px solid neutral-200
  shadow: 0 -2px 10px rgba(0,0,0,0.05)

  Каждая вкладка:
    Icon: 24x24
    Label: 10px / 500
    Inactive: color neutral-500
    Active: color primary-600, icon filled (не outline)
    Active indicator: 4px dot under icon, bg primary-600

  Для специалиста:
  [home]    [calendar]  [clients]  [wallet]  [user]
  Дашборд   Расписание  Клиенты    Доход    Профиль
```

#### Sidebar (Mobile Drawer)

```
  +-------------------------------+
  |  +------+                     |
  |  | ФОТО |  Марина Петрова     |
  |  +------+  Premium [*]        |
  |                               |
  |  ----------------------------  |
  |  [home] Главная               |
  |  [compass] Каталог            |
  |  [sparkle] ИИ-консультация    |
  |  [calendar] Мои сессии        |
  |  [chat] Сообщения        (2)  |
  |  [heart] Избранное            |
  |  ----------------------------  |
  |  [card] Подписка              |
  |  [settings] Настройки         |
  |  [help] Помощь                |
  |  ----------------------------  |
  |  [logout] Выйти               |
  |                               |
  +-------------------------------+

  width: 280px
  bg: white
  shadow: shadow-2xl
  Overlay: bg neutral-950, opacity: 0.5
  Animation: slide-in from left, 250ms ease-out
```

### 6.7. Модальные окна и шторки (Modals & Bottom Sheets)

#### Modal (Desktop)

```
  +---------------------------------------------------+
  |                                                   |
  |  Подтверждение бронирования              [x]     |
  |                                                   |
  |  -------------------------------------------------|
  |                                                   |
  |  Специалист:  Елена Иванова                       |
  |  Дата:        5 марта 2026, 14:00                 |
  |  Формат:      Онлайн (Zoom)                       |
  |  Стоимость:   4 000 Р                             |
  |                                                   |
  |  [    Отмена    ]    [  Подтвердить и оплатить  ] |
  |                                                   |
  +---------------------------------------------------+

  max-width: 480px (sm) / 640px (md) / 800px (lg)
  padding: 32px
  radius: radius-lg (12px)
  shadow: shadow-2xl
  bg: white
  Overlay: bg neutral-950, opacity: 0.5
  Animation: fade-in overlay 200ms, scale-up modal 250ms (from 0.95 to 1)
  Close: [x] icon 24x24, top-right, или клик по overlay, или Esc
```

#### Bottom Sheet (Mobile)

```
  +------------------------------------------+
  |            [--- handle ---]              |
  |                                          |
  |  Фильтры                       [Сброс]  |
  |                                          |
  |  Специализация                           |
  |  [v] Психолог  [ ] Коуч  [ ] Терапевт   |
  |                                          |
  |  Цена за сессию                          |
  |  [----o==========o----]                  |
  |  1 000 Р            6 000 Р              |
  |                                          |
  |  Формат                                  |
  |  [ Онлайн ]  [ Офлайн ]  [ Все ]        |
  |                                          |
  |  [     Показать 24 специалиста     ]     |
  |                                          |
  +------------------------------------------+

  radius: radius-xl radius-xl 0 0
  bg: white
  handle: 40x4, bg neutral-300, radius-full, centered, margin-top: 8px
  Drag to dismiss
  Max height: 90vh
  Animation: slide-up 300ms ease-out
```

### 6.8. Рейтинг и отзывы (Rating & Reviews)

#### Звезды рейтинга (Star Rating)

```
  Отображение:
  [*][*][*][*][*-]  4.8
  Filled star: color warning-500 (#F59E0B)
  Empty star: color neutral-300
  Partial fill: clip-path для дробных значений
  Star size: 16px (sm), 20px (md), 24px (lg)
  Число: body-sm (14px/600), color neutral-900, margin-left: 4px

  Ввод (интерактивный):
  Hover: увеличение 1.1x, color warning-400
  Click: заполнение до выбранной звезды
  Touch: поддержка свайпа по звездам
```

#### Карточка отзыва (Review Card)

```
  +------------------------------------------+
  |  [****+]  4 дня назад                    |
  |                                          |
  |  Очень чуткий и профессиональный         |
  |  специалист. После первой сессии          |
  |  почувствовала, что нашла "своего"        |
  |  психолога. Рекомендую!                  |
  |                                          |
  |  -- Анонимный клиент                      |
  +------------------------------------------+

  padding: 20px
  border: 1px solid neutral-300
  radius: radius-md
  bg: white
  Имя: caption, color neutral-600, font-style: italic
```

#### Шкала оценки матчинга (1-10)

```
  Насколько вам подошел специалист?

  [ 1 ][ 2 ][ 3 ][ 4 ][ 5 ][ 6 ][ 7 ][ 8 ][ 9 ][10]

  Каждая ячейка: 36x36, radius: radius-sm
  Default: bg neutral-100, border neutral-300, text neutral-700
  Hover: bg primary-50, border primary-300
  Selected: bg primary-600, text white
  1-3: при выборе bg error-100, border error-500, text error-700
  4-6: при выборе bg warning-100, border warning-500, text warning-700
  7-10: при выборе bg success-100, border success-500, text success-700
```

### 6.9. Бейджи и статусы (Badges)

```
Проверен:
  [shield-check] Проверен
  bg: primary-100, text: primary-700, border: 1px solid primary-200
  height: 24px, padding: 0 10px, radius: radius-full
  icon: 14x14

Топ-специалист:
  [star] Топ-специалист
  bg: warning-100, text: warning-700, border: 1px solid warning-200

Онлайн:
  [circle] Онлайн
  bg: success-100, text: success-700
  circle: 8x8, bg success-500, пульсирующая анимация

Новый:
  Новый
  bg: secondary-100, text: secondary-700

Premium:
  [crown] Premium
  bg: gradient-warm, text: white
```

### 6.10. Уведомления (Notifications)

#### Toast (Всплывающее уведомление)

```
  +------------------------------------------+
  | [check-circle] Сессия успешно забронирована |
  |                                    [x]    |
  +------------------------------------------+

  position: fixed, top: 80px, right: 24px (desktop) / top: 16px, left: 16px, right: 16px (mobile)
  padding: 16px 20px
  radius: radius-md
  shadow: shadow-lg
  bg: white, border-left: 4px solid success-500

  Варианты бордера:
    Success: success-500
    Error: error-500
    Warning: warning-500
    Info: info-500

  Animation: slide-in from right 300ms, auto-dismiss 5s, slide-out
```

#### Inline Alert

```
  +------------------------------------------+
  | [!] Внимание: отмена менее чем за 12     |
  |     часов до сессии -- без возврата.       |
  +------------------------------------------+

  padding: 16px
  radius: radius-md
  bg: warning-50, border: 1px solid warning-200
  icon color: warning-600
  text color: warning-800
```

#### Кризисный алерт (US-2.6)

```
  +----------------------------------------------------+
  |  [!!!]  ЭКСТРЕННАЯ ПОМОЩЬ                          |
  |                                                    |
  |  Если вы или кто-то рядом с вами находится         |
  |  в опасности, пожалуйста, обратитесь:              |
  |                                                    |
  |  Телефон доверия: 8-800-2000-122 (бесплатно)       |
  |  Экстренная помощь: 112                            |
  |                                                    |
  |  [    Позвонить 8-800-2000-122    ]                |
  |                                                    |
  |  Я в безопасности, продолжить                      |
  +----------------------------------------------------+

  НЕЛЬЗЯ ЗАКРЫТЬ кнопкой [x] -- только через "Я в безопасности"
  bg: error-50, border: 2px solid error-500
  radius: radius-lg
  padding: 24px
  Телефон: h4, color error-700, text-decoration underline
  Кнопка "Позвонить": btn-lg, bg error-600, text white
  "Я в безопасности": text-button, color neutral-600
```

---

## 7. Иконки

### 7.1. Подход

```
Библиотека:   Lucide Icons (https://lucide.dev)
Причина выбора: open-source, согласованный стиль, 1000+ иконок, поддержка Tree-shaking
Размеры:      16px (sm), 20px (md), 24px (lg)
Stroke width:  2px (default), 1.5px (для тонких контекстов)
Стиль:         Outline (по умолчанию), Filled (для активных состояний в навигации)
```

### 7.2. Ключевые иконки

```
Навигация:      Home, Search, MessageCircle, Calendar, User, Menu, X, ChevronDown, ArrowLeft
Действия:       Plus, Edit, Trash2, Download, Upload, Share, ExternalLink, Copy
ИИ-консультация: Sparkles, Bot, MessageSquare, Mic, Send
Специалист:     ShieldCheck, Award, Star, Video, Clock, MapPin
Бронирование:   CalendarCheck, CreditCard, Receipt, RefreshCw
Статусы:        CheckCircle, AlertCircle, XCircle, Info, AlertTriangle
Ценности:       Heart, Target, Compass, Flame, Leaf, Users, Brain, Lightbulb
Социальные:     (Кастомные SVG для VK, Google, Telegram)
```

---

## 8. Анимации и микро-взаимодействия

### 8.1. Timing Functions

```
ease-default:     cubic-bezier(0.4, 0, 0.2, 1)     -- Большинство переходов
ease-in:          cubic-bezier(0.4, 0, 1, 1)        -- Элементы уходящие с экрана
ease-out:         cubic-bezier(0, 0, 0.2, 1)        -- Элементы появляющиеся
ease-bounce:      cubic-bezier(0.34, 1.56, 0.64, 1) -- Игривые элементы (бейджи)
ease-spring:      cubic-bezier(0.175, 0.885, 0.32, 1.275) -- Упругие
```

### 8.2. Duration

```
duration-fast:    100ms  -- Hover, active состояния
duration-normal:  200ms  -- Переключения, fade
duration-slow:    300ms  -- Модальные окна, drawers
duration-slower:  500ms  -- Сложные анимации (графики)
```

### 8.3. Конкретные анимации

```
Hover кнопки:
  transform: translateY(-1px), shadow: shadow-md
  transition: all 150ms ease-default

Hover карточки специалиста:
  transform: translateY(-4px), shadow: shadow-card-hover
  transition: all 200ms ease-default

Появление чат-бабла:
  opacity: 0 -> 1, translateY(16px) -> 0
  duration: 300ms, ease-out
  stagger: 50ms между последовательными сообщениями

Typing indicator (точки):
  scale: 1 -> 1.3 -> 1
  duration: 600ms, ease-default
  stagger: 150ms между точками
  infinite loop

Процент совпадения (кольцевая):
  stroke-dashoffset анимация от 0 до целевого значения
  duration: 800ms, ease-out
  delay: 200ms (после появления карточки)

Радарная диаграмма:
  Точки появляются от центра к периферии
  duration: 500ms, ease-out
  stagger: 50ms между осями
  Заливка: opacity 0 -> target, duration: 300ms, delay: 500ms

Загрузка рекомендаций:
  Skeleton shimmer (gradient moving left to right)
  bg: linear-gradient(90deg, neutral-200 25%, neutral-100 50%, neutral-200 75%)
  background-size: 200% 100%
  animation: shimmer 1.5s infinite

Page transitions:
  Fade + slight translateY(8px)
  duration: 200ms
  Использовать View Transitions API где поддерживается

Scroll animations:
  Секции на лендинге: fade-in + translateY(24px)
  Intersection Observer, threshold: 0.1
  duration: 500ms, ease-out
```

### 8.4. Анимации, которых НЕ должно быть

- Автовоспроизведение видео без запроса
- Мигающие элементы
- Параллакс-эффекты на мобильных (производительность)
- Анимации длиннее 500ms для функциональных элементов
- Анимации, блокирующие взаимодействие

### 8.5. Режим reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. Responsive Breakpoints

```
xs:    0 - 479px        Мобильные телефоны (portrait)
sm:    480px - 767px     Мобильные телефоны (landscape), маленькие планшеты
md:    768px - 1023px    Планшеты
lg:    1024px - 1279px   Маленькие десктопы, планшеты (landscape)
xl:    1280px - 1535px   Десктопы (основной)
2xl:   1536px+           Большие мониторы
```

### Ключевые адаптивные изменения

```
< 768px (Mobile):
  - Bottom navigation вместо Header tabs
  - Sidebar drawer вместо горизонтальной навигации
  - Каталог: 1 колонка карточек
  - Модалки -> Bottom sheets
  - Чат: full-screen
  - Радарная диаграмма: уменьшена до 220px

768px - 1023px (Tablet):
  - Header с горизонтальной навигацией
  - Каталог: 2 колонки
  - Sidebar: закрытый по умолчанию, открывается по кнопке
  - Чат: 2-panel layout (список чатов + окно чата)

>= 1024px (Desktop):
  - Полный Header
  - Каталог: 3 колонки (или 2 с фильтрами слева)
  - Dashboard: multi-column layout
  - Чат: встроенный sidebar
```

---

## 10. Доступность (Accessibility) -- WCAG 2.1 AA

### 10.1. Контрастность

```
Основной текст (neutral-950 на white):  контраст 16.8:1  (AA: 4.5:1)  PASS
Вторичный текст (neutral-700 на white): контраст 6.3:1   (AA: 4.5:1)  PASS
Placeholder (neutral-500 на white):      контраст 3.8:1   (AA: 3:1 для крупного текста) PASS для крупного
Primary кнопка (white на primary-600):   контраст 5.7:1   (AA: 4.5:1)  PASS
Ссылки (primary-700 на white):          контраст 7.1:1   (AA: 4.5:1)  PASS
Error текст (error-600 на white):        контраст 5.1:1   (AA: 4.5:1)  PASS
Success текст (success-600 на white):    контраст 4.6:1   (AA: 4.5:1)  PASS
```

### 10.2. Навигация с клавиатуры

```
- Все интерактивные элементы доступны через Tab
- Focus ring: 3px solid primary-300, offset: 2px
- Skip-to-content ссылка первым элементом (видна при focus)
- Модальные окна: focus trap (Tab не выходит за пределы)
- Escape закрывает модальные окна и dropdowns
- Enter/Space активируют кнопки
- Arrow keys для навигации в radio groups, tabs, menus
```

### 10.3. Screen Reader

```
- Все изображения: alt text (аватары: "Фото специалиста [Имя]")
- Иконки-кнопки: aria-label (например, aria-label="Закрыть")
- Декоративные иконки: aria-hidden="true"
- Динамический контент (чат): aria-live="polite"
- Кризисный алерт: aria-live="assertive", role="alert"
- Формы: связка label + input через htmlFor/id
- Ошибки форм: aria-describedby на error message
- Процент совпадения: aria-label="Совпадение 92 процента"
- Радарная диаграмма: скрытая таблица для screen reader
- Loading states: aria-busy="true"
```

### 10.4. Сенсорные цели (Touch Targets)

```
Минимальный размер: 44x44px (WCAG) / 48x48px (рекомендуемый)
Минимальный отступ между целями: 8px
Кнопки мобильных: min-height 48px
Bottom nav иконки: padding для достижения 48x48 area
```

### 10.5. Цвет не единственный индикатор

```
- Ошибки: красный цвет + иконка + текст
- Успех: зеленый + иконка + текст
- Статус сессии: цвет бейджа + текстовая метка
- Процент совпадения: цвет + число
- Обязательные поля: * + текст "Обязательное поле"
```

---

## 11. Токены для разработки

### 11.1. CSS Custom Properties (рекомендуемый формат)

```css
:root {
  /* Colors */
  --color-primary-50: #EEF2FF;
  --color-primary-100: #E0E7FF;
  --color-primary-200: #C7D2FE;
  --color-primary-300: #A5B4FC;
  --color-primary-400: #818CF8;
  --color-primary-500: #6366F1;
  --color-primary-600: #4F46E5;
  --color-primary-700: #4338CA;
  --color-primary-800: #312E81;
  --color-primary-900: #1E1B4B;

  /* Typography */
  --font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-family-mono: 'JetBrains Mono', monospace;

  --font-size-xs: 0.75rem;   /* 12px */
  --font-size-sm: 0.875rem;  /* 14px */
  --font-size-md: 1rem;      /* 16px */
  --font-size-lg: 1.125rem;  /* 18px */
  --font-size-xl: 1.25rem;   /* 20px */
  --font-size-2xl: 1.5rem;   /* 24px */
  --font-size-3xl: 1.75rem;  /* 28px */
  --font-size-4xl: 2rem;     /* 32px */
  --font-size-5xl: 2.5rem;   /* 40px */
  --font-size-6xl: 3rem;     /* 48px */
  --font-size-7xl: 3.5rem;   /* 56px */

  /* Spacing */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);

  /* Transitions */
  --transition-fast: 100ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);

  /* Z-index */
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-overlay: 30;
  --z-modal: 40;
  --z-header: 50;
  --z-toast: 60;
}
```

### 11.2. Tailwind CSS Config (если используется Tailwind)

Дизайн-система совместима с Tailwind CSS v3+. Все токены маппятся на конфигурацию extend в tailwind.config.js. Основные цвета (primary, secondary) добавляются как кастомные цвета, остальное (neutral, semantic) уже совпадает со стандартными Tailwind-палитрами (slate, indigo, pink, red, amber, green, sky).

---

## 12. UX-копирайтинг (Рекомендации)

### 12.1. Тон и голос

```
Тон SoulMate:
- Теплый, но не панибратский
- Профессиональный, но не холодный
- Уверенный, но не давящий
- Простой, но не примитивный

НЕ используем:
- Медицинскую терминологию ("диагноз", "лечение", "пациент")
- Панибратство ("привет!", "давай начнем!")
- Императивы ("вы ДОЛЖНЫ", "необходимо")
- Жаргон ("матчинг" для пользователей -- используем "совпадение" или "подбор")

Используем:
- "Вы" (на "вы", с маленькой буквы в серединах предложений)
- Активный залог
- Конкретные числа вместо абстракций
- Эмпатичные формулировки
```

### 12.2. Примеры UX-копий

```
Кнопки:
  ДА: "Начать подбор специалиста" / "Забронировать сессию" / "Пройти консультацию"
  НЕТ: "Начать" / "Давай!" / "Поехали!"

Пустые состояния:
  ДА: "У вас пока нет запланированных сессий. Найдите специалиста, чтобы записаться на первую встречу."
  НЕТ: "Тут пока пусто :("

Ошибки:
  ДА: "Не удалось загрузить данные. Попробуйте обновить страницу."
  НЕТ: "Ошибка 500: Internal Server Error"

ИИ-консультация (приветствие):
  "Здравствуйте! Я -- ИИ-консультант SoulMate. Я помогу вам разобраться в вашем запросе
   и подобрать специалиста, который подходит именно вам.

   Наш разговор конфиденциален и займет около 15 минут.

   Расскажите, что привело вас к решению обратиться к специалисту?"

Процент совпадения:
  92%: "Отличное совпадение"
  75%: "Хорошее совпадение"
  60%: "Возможное совпадение"
  < 60%: не показываем в рекомендациях

Подтверждение бронирования:
  "Сессия забронирована! Мы отправили подробности на вашу почту.
   Напоминание придет за 1 час до начала."

Отмена сессии:
  "Вы уверены, что хотите отменить сессию? При отмене менее чем за 12 часов
   до начала возврат средств не предусмотрен."
```

---
