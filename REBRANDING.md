# Ребрендинг: SoulMate → Hearty

**Домен:** hearty.pro
**Сервер:** 138.124.61.221
**Приоритет:** Высокий
**Статус:** В работе

---

## 1. DNS и инфраструктура

### DNS-записи (у регистратора hearty.pro)

| Тип | Имя | Значение |
|-----|-----|----------|
| A | `@` | `138.124.61.221` |
| A | `www` | `138.124.61.221` |

### Сервер (после DNS-пропагации)

- [ ] Создать nginx-конфиг `/etc/nginx/sites-available/hearty.pro`
- [ ] Настроить проксирование на бэкенд (порт 3200) и фронтенд (порт 3201)
- [ ] Выпустить SSL: `sudo certbot --nginx -d hearty.pro -d www.hearty.pro`
- [ ] Обновить `CORS_ORIGINS` в `backend/.env` — добавить `https://hearty.pro`

---

## 2. Фронтенд — замена бренда

### 2.1 Логотип и шапка

| Файл | Что заменить |
|------|-------------|
| `frontend/src/components/layout/header.tsx` | "SM" → "H", "SoulMate" → "Hearty", aria-label "SoulMate - Главная" → "Hearty - Главная" |
| `frontend/src/components/layout/footer.tsx` | "SM" → "H", "© 2026 SoulMate" → "© 2026 Hearty" |
| `frontend/src/app/icon.svg` | Заменить текст "SM" → "H" |

### 2.2 SEO и метаданные (layout.tsx)

| Поле | Было | Стало |
|------|------|-------|
| `title.default` | SoulMate — Подбор психолога по ценностям | Hearty — Подбор психолога по ценностям |
| `title.template` | %s \| SoulMate | %s \| Hearty |
| `keywords` | SoulMate | Hearty |
| `authors` | SoulMate | Hearty |
| `creator` | SoulMate | Hearty |
| `openGraph.siteName` | SoulMate | Hearty |
| `twitter.creator` | @soulmateapp | @hearty_pro |
| `siteUrl` | https://soulmate.ru | https://hearty.pro |

### 2.3 Заголовки страниц (metadata.title)

Заменить "SoulMate" → "Hearty" в metadata каждой страницы:

- `app/not-found.tsx`
- `app/notifications/page.tsx`
- `app/premium/page.tsx`
- `app/pricing/page.tsx`
- `app/terms/page.tsx`
- `app/privacy/page.tsx`
- `app/contacts/page.tsx`
- `app/about/page.tsx`
- `app/how-it-works/page.tsx`
- `app/auth/login/page.tsx`
- `app/dashboard/favorites/page.tsx`
- `app/dashboard/messages/page.tsx`
- `app/dashboard/sessions/page.tsx`
- `app/profile/subscription/page.tsx`
- `app/profile/page.tsx`
- `app/specialist/dashboard/page.tsx`
- `app/specialist/finances/page.tsx`
- `app/specialist/messages/page.tsx`
- `app/specialist/clients/page.tsx`
- `app/specialist/subscription/page.tsx`

### 2.4 Контент страниц

| Файл | Кол-во упоминаний | Что менять |
|------|-------------------|-----------|
| `app/about/page.tsx` | ~10 | "SoulMate" → "Hearty" во всех текстах |
| `app/terms/page.tsx` | ~18 | "SoulMate" → "Hearty", "soulmate.ru" → "hearty.pro" |
| `app/privacy/page.tsx` | ~5 | "SoulMate" → "Hearty", "soulmate.ru" → "hearty.pro" |
| `app/for-specialists/page.tsx` | ~5 | "SoulMate" → "Hearty" |
| `app/how-it-works/page.tsx` | ~3 | "SoulMate" → "Hearty" |
| `app/pricing/page.tsx` | ~3 | "SoulMate" → "Hearty" |
| `app/contacts/page.tsx` | ~3 | "SoulMate" → "Hearty" |
| `app/consultation/page.tsx` | ~1 | "ИИ-консультант SoulMate" → "ИИ-консультант Hearty" |
| `app/auth/login/page.tsx` | ~1 | "аккаунт SoulMate" → "аккаунт Hearty" |

### 2.5 Контакты и соцсети

| Было | Стало |
|------|-------|
| support@soulmate.ru | support@hearty.pro |
| specialists@soulmate.ru | specialists@hearty.pro |
| @soulmate_ru (Telegram) | @hearty_pro (Telegram) |
| vk.com/soulmaters | *(уточнить новый URL)* |

**Файлы:** `contacts/page.tsx`, `terms/page.tsx`, `privacy/page.tsx`

### 2.6 Конфиги

| Файл | Поле | Было | Стало |
|------|------|------|-------|
| `frontend/package.json` | name | soulmate-frontend | hearty-frontend |
| `frontend/next.config.js` | images.domains | cdn.soulmate.ru | cdn.hearty.pro |
| `backend/package.json` | name | soulmate-api | hearty-api |
| `backend/.env.example` | EMAIL_FROM | noreply@soulmate.ru | noreply@hearty.pro |

---

## 3. Бэкенд

- [ ] Обновить `EMAIL_FROM` в `.env` → `noreply@hearty.pro`
- [ ] Обновить `CORS_ORIGINS` в `.env` → добавить `https://hearty.pro`
- [ ] Проверить системные промпты (`backend/src/modules/ai/prompts/system-prompts.ts`) — заменить "SoulMate" → "Hearty" (упоминается в промптах AI-консультанта)

---

## 4. Чеклист перед запуском

- [ ] DNS A-записи настроены и пропагировались
- [ ] SSL-сертификат выпущен
- [ ] Nginx конфиг создан и протестирован
- [ ] Все файлы фронтенда обновлены (grep -r "SoulMate" — 0 результатов)
- [ ] Все файлы фронтенда обновлены (grep -r "soulmate" — 0 результатов, кроме git)
- [ ] Системные промпты бэкенда обновлены
- [ ] .env обновлён (CORS, EMAIL_FROM)
- [ ] Фронтенд пересобран и задеплоен
- [ ] Бэкенд перезапущен
- [ ] Проверить вход/регистрацию на hearty.pro
- [ ] Проверить AI-консультацию — бот представляется как Hearty
- [ ] Проверить все страницы визуально
