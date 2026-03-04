import {
  PrismaClient,
  SpecialistType,
  VerificationStatus,
  UserRole,
  AuthProvider,
  BookingStatus,
  ReviewStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

interface SpecialistSeedData {
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  city: string;
  type: SpecialistType;
  experienceYears: number;
  education: string;
  approaches: string[];
  specializations: string[];
  workFormats: string[];
  sessionPrice: number;
  sessionDuration: number;
  bio: string;
  aiBio: string;
  averageRating: number;
  totalReviews: number;
  totalSessions: number;
}

interface ClientSeedData {
  email: string;
  firstName: string;
  lastName: string;
  city: string;
}

interface ReviewTemplate {
  rating: number;
  comment: string;
}

// ---------------------------------------------------------------------------
// Specialists seed data (15 specialists)
// ---------------------------------------------------------------------------

const specialistsData: SpecialistSeedData[] = [
  {
    // 1. Анна Соколова
    email: 'anna.sokolova@soulmate-demo.ru',
    firstName: 'Анна',
    lastName: 'Соколова',
    gender: 'female',
    city: 'Москва',
    type: SpecialistType.PSYCHOLOGIST,
    experienceYears: 8,
    education: 'МГУ им. Ломоносова, факультет психологии; сертификат КПТ; гештальт-терапия',
    approaches: ['КПТ', 'гештальт'],
    specializations: ['тревога', 'депрессия'],
    workFormats: ['online', 'offline'],
    sessionPrice: 4500,
    sessionDuration: 50,
    bio: 'Клинический психолог с 8-летним опытом. Работаю в КПТ и гештальт-подходах. Специализируюсь на тревожных расстройствах и депрессии. Создаю безопасное пространство для глубокой работы.',
    aiBio: 'Анна — клинический психолог, КПТ и гештальт. Помогает справляться с тревогой и депрессией. Тёплый, структурированный стиль работы.',
    averageRating: 4.9,
    totalReviews: 74,
    totalSessions: 380,
  },
  {
    // 2. Михаил Петров
    email: 'mikhail.petrov@soulmate-demo.ru',
    firstName: 'Михаил',
    lastName: 'Петров',
    gender: 'male',
    city: 'Москва',
    type: SpecialistType.PSYCHOLOGIST,
    experienceYears: 12,
    education: 'МГУ, психологический факультет; обучение психоанализу (МКПП)',
    approaches: ['психоанализ'],
    specializations: ['отношения', 'семья'],
    workFormats: ['online', 'offline'],
    sessionPrice: 6000,
    sessionDuration: 50,
    bio: 'Психолог с 12-летним стажем. Работаю в психоаналитическом подходе. Специализируюсь на отношениях, семейных конфликтах и динамике пар.',
    aiBio: 'Михаил — психолог, психоаналитический подход. Работает с отношениями и семьёй. Глубокая аналитическая работа.',
    averageRating: 4.7,
    totalReviews: 98,
    totalSessions: 560,
  },
  {
    // 3. Елена Васильева
    email: 'elena.vasilyeva@soulmate-demo.ru',
    firstName: 'Елена',
    lastName: 'Васильева',
    gender: 'female',
    city: 'Санкт-Петербург',
    type: SpecialistType.COACH,
    experienceYears: 5,
    education: 'НИУ ВШЭ, управление персоналом; ICF ACC коуч; mindfulness-инструктор',
    approaches: ['коучинг', 'mindfulness'],
    specializations: ['карьера', 'личностный рост'],
    workFormats: ['online', 'offline'],
    sessionPrice: 3500,
    sessionDuration: 60,
    bio: 'ICF-сертифицированный коуч. Помогаю профессионалам найти своё призвание, выстроить карьеру мечты и развить осознанность через практику mindfulness.',
    aiBio: 'Елена — ICF коуч, практикует mindfulness-подход. Специализируется на карьере и личностном росте. Практичный, поддерживающий стиль.',
    averageRating: 4.8,
    totalReviews: 42,
    totalSessions: 195,
  },
  {
    // 4. Дмитрий Козлов
    email: 'dmitry.kozlov@soulmate-demo.ru',
    firstName: 'Дмитрий',
    lastName: 'Козлов',
    gender: 'male',
    city: 'Москва',
    type: SpecialistType.PSYCHOTHERAPIST,
    experienceYears: 15,
    education: 'Первый МГМУ им. Сеченова, психиатрия; сертификат EMDR (EMDRIA); АСТ-терапевт',
    approaches: ['EMDR', 'АСТ'],
    specializations: ['травма', 'ПТСР'],
    workFormats: ['online', 'offline'],
    sessionPrice: 7000,
    sessionDuration: 50,
    bio: 'Психотерапевт с 15-летним опытом. EMDR-терапевт с международной сертификацией. Работаю с психологической травмой, ПТСР и последствиями тяжёлых жизненных событий.',
    aiBio: 'Дмитрий — психотерапевт, EMDR и АСТ. Работает с травмой и ПТСР. Глубокий профессионал с высочайшим рейтингом.',
    averageRating: 5.0,
    totalReviews: 120,
    totalSessions: 780,
  },
  {
    // 5. Ольга Новикова
    email: 'olga.novikova@soulmate-demo.ru',
    firstName: 'Ольга',
    lastName: 'Новикова',
    gender: 'female',
    city: 'Онлайн',
    type: SpecialistType.PSYCHOLOGIST,
    experienceYears: 6,
    education: 'РГПУ им. Герцена, психология; гештальт-институт (Санкт-Петербург)',
    approaches: ['гештальт'],
    specializations: ['самооценка', 'отношения'],
    workFormats: ['online'],
    sessionPrice: 4000,
    sessionDuration: 50,
    bio: 'Психолог, гештальт-терапевт. Работаю с темами самооценки, отношений с собой и другими. Помогаю осознать внутренние паттерны и найти опору внутри.',
    aiBio: 'Ольга — психолог, гештальт-подход. Работает с самооценкой и отношениями. Онлайн, тёплый и поддерживающий стиль.',
    averageRating: 4.6,
    totalReviews: 35,
    totalSessions: 162,
  },
  {
    // 6. Сергей Морозов
    email: 'sergei.morozov@soulmate-demo.ru',
    firstName: 'Сергей',
    lastName: 'Морозов',
    gender: 'male',
    city: 'Москва',
    type: SpecialistType.COACH,
    experienceYears: 7,
    education: 'Московская бизнес-школа; ICF ACC коуч; сертификат карьерного консультирования',
    approaches: ['коучинг'],
    specializations: ['карьера', 'выгорание'],
    workFormats: ['online', 'offline'],
    sessionPrice: 5000,
    sessionDuration: 60,
    bio: 'Коуч по карьере и профессиональному развитию. Специализируюсь на борьбе с выгоранием и карьерных переходах. Помогаю найти смысл в работе.',
    aiBio: 'Сергей — карьерный коуч. Работает с выгоранием и карьерными переходами. Практичный, результативный подход.',
    averageRating: 4.5,
    totalReviews: 28,
    totalSessions: 132,
  },
  {
    // 7. Татьяна Федорова
    email: 'tatiana.fedorova@soulmate-demo.ru',
    firstName: 'Татьяна',
    lastName: 'Федорова',
    gender: 'female',
    city: 'Екатеринбург',
    type: SpecialistType.PSYCHOLOGIST,
    experienceYears: 10,
    education: 'УрФУ, психология; сертификат КПТ; специализация по тревожным расстройствам',
    approaches: ['КПТ'],
    specializations: ['тревога', 'стресс'],
    workFormats: ['online', 'offline'],
    sessionPrice: 5500,
    sessionDuration: 50,
    bio: 'Психолог с 10-летним опытом работы с тревогой и стрессом. КПТ-специалист. Даю конкретные инструменты для управления тревожностью и снижения стресса.',
    aiBio: 'Татьяна — психолог, КПТ-специалист. Работает с тревогой и стрессом. Структурированный, доказательный подход.',
    averageRating: 4.8,
    totalReviews: 86,
    totalSessions: 440,
  },
  {
    // 8. Александр Волков
    email: 'alexander.volkov@soulmate-demo.ru',
    firstName: 'Александр',
    lastName: 'Волков',
    gender: 'male',
    city: 'Москва',
    type: SpecialistType.PSYCHOTHERAPIST,
    experienceYears: 20,
    education: 'Первый МГМУ им. Сеченова; психоанализ (МПО); системная семейная терапия',
    approaches: ['психоанализ', 'системная семейная терапия'],
    specializations: ['зависимости', 'семья'],
    workFormats: ['online', 'offline'],
    sessionPrice: 8000,
    sessionDuration: 50,
    bio: 'Психотерапевт с 20-летним стажем. Работаю с зависимостями и семейными системами. Психоаналитический и системный подход. Долгосрочная глубокая терапия.',
    aiBio: 'Александр — опытный психотерапевт. Психоанализ и системный подход. Работает с зависимостями и семьёй.',
    averageRating: 4.9,
    totalReviews: 145,
    totalSessions: 980,
  },
  {
    // 9. Наталья Лебедева
    email: 'natalia.lebedeva@soulmate-demo.ru',
    firstName: 'Наталья',
    lastName: 'Лебедева',
    gender: 'female',
    city: 'Онлайн',
    type: SpecialistType.PSYCHOLOGIST,
    experienceYears: 9,
    education: 'МГППУ, клиническая психология; АСТ-терапевт (ACT Institute); mindfulness-инструктор',
    approaches: ['АСТ', 'mindfulness'],
    specializations: ['депрессия', 'горе'],
    workFormats: ['online'],
    sessionPrice: 4500,
    sessionDuration: 50,
    bio: 'Клинический психолог, АСТ-терапевт. Работаю с депрессией, горем и утратой. Помогаю принять то, что нельзя изменить, и двигаться к ценной жизни.',
    aiBio: 'Наталья — психолог, АСТ и mindfulness. Работает с депрессией и горем. Онлайн, бережный и тёплый стиль.',
    averageRating: 4.7,
    totalReviews: 63,
    totalSessions: 310,
  },
  {
    // 10. Виктор Зайцев
    email: 'victor.zaitsev@soulmate-demo.ru',
    firstName: 'Виктор',
    lastName: 'Зайцев',
    gender: 'male',
    city: 'Новосибирск',
    type: SpecialistType.COACH,
    experienceYears: 4,
    education: 'НГУ, психология; ICF ACC коуч; сертификат позитивной психологии',
    approaches: ['коучинг'],
    specializations: ['личностный рост', 'самооценка'],
    workFormats: ['online'],
    sessionPrice: 3000,
    sessionDuration: 60,
    bio: 'Коуч по личностному развитию. Помогаю людям раскрыть потенциал, повысить самооценку и достичь целей. Практичный и поддерживающий подход.',
    aiBio: 'Виктор — коуч по личностному росту. Работает с самооценкой и целями. Доступный, практичный подход.',
    averageRating: 4.4,
    totalReviews: 18,
    totalSessions: 72,
  },
  {
    // 11. Ирина Семёнова
    email: 'irina.semenova@soulmate-demo.ru',
    firstName: 'Ирина',
    lastName: 'Семёнова',
    gender: 'female',
    city: 'Санкт-Петербург',
    type: SpecialistType.PSYCHOLOGIST,
    experienceYears: 11,
    education: 'СПбГУ, психология; нарративная практика (Dulwich Centre); обучение работе с утратой',
    approaches: ['нарративная терапия'],
    specializations: ['кризис идентичности', 'горе'],
    workFormats: ['online', 'offline'],
    sessionPrice: 5000,
    sessionDuration: 50,
    bio: 'Психолог, нарративный практик. Работаю с кризисами идентичности и тяжёлыми жизненными переходами. Помогаю найти новый смысл и историю о себе.',
    aiBio: 'Ирина — психолог, нарративная практика. Специализируется на кризисах идентичности и горе. Глубокий, человечный подход.',
    averageRating: 4.8,
    totalReviews: 79,
    totalSessions: 415,
  },
  {
    // 12. Павел Егоров
    email: 'pavel.egorov@soulmate-demo.ru',
    firstName: 'Павел',
    lastName: 'Егоров',
    gender: 'male',
    city: 'Москва',
    type: SpecialistType.PSYCHOTHERAPIST,
    experienceYears: 7,
    education: 'МГППУ, клиническая психология; сертификат EMDR (EMDRIA); специализация по травме',
    approaches: ['EMDR'],
    specializations: ['травма', 'ПТСР'],
    workFormats: ['online', 'offline'],
    sessionPrice: 6500,
    sessionDuration: 50,
    bio: 'Психотерапевт, EMDR-специалист. Работаю с психологической травмой и ПТСР. Доказательный подход, бережная работа с тяжёлыми переживаниями.',
    aiBio: 'Павел — психотерапевт, EMDR. Работает с травмой и ПТСР. Доказательный, профессиональный подход.',
    averageRating: 4.6,
    totalReviews: 54,
    totalSessions: 268,
  },
  {
    // 13. Мария Кузнецова
    email: 'maria.kuznetsova@soulmate-demo.ru',
    firstName: 'Мария',
    lastName: 'Кузнецова',
    gender: 'female',
    city: 'Москва',
    type: SpecialistType.PSYCHOLOGIST,
    experienceYears: 8,
    education: 'МГУ, психология; МКТ (метакогнитивная терапия); КПТ-специалист',
    approaches: ['МКТ', 'КПТ'],
    specializations: ['тревога', 'ОКР'],
    workFormats: ['online', 'offline'],
    sessionPrice: 4800,
    sessionDuration: 50,
    bio: 'Психолог, специалист по тревожным расстройствам и ОКР. Работаю в МКТ и КПТ-подходах. Конкретные техники и измеримые результаты.',
    aiBio: 'Мария — психолог, МКТ и КПТ. Специализируется на тревоге и ОКР. Структурированный, доказательный подход.',
    averageRating: 4.9,
    totalReviews: 91,
    totalSessions: 455,
  },
  {
    // 14. Алексей Попов
    email: 'alexei.popov@soulmate-demo.ru',
    firstName: 'Алексей',
    lastName: 'Попов',
    gender: 'male',
    city: 'Онлайн',
    type: SpecialistType.COACH,
    experienceYears: 5,
    education: 'НИУ ВШЭ, менеджмент; ICF ACC коуч; сертифицированный mindfulness-учитель (MBSR)',
    approaches: ['mindfulness', 'коучинг'],
    specializations: ['выгорание', 'стресс'],
    workFormats: ['online'],
    sessionPrice: 3800,
    sessionDuration: 60,
    bio: 'Коуч и mindfulness-практик. Помогаю справиться с выгоранием, снизить уровень стресса и вернуть ресурсное состояние. Только онлайн.',
    aiBio: 'Алексей — коуч, mindfulness-специалист. Работает с выгоранием и стрессом. Онлайн, доступный и практичный.',
    averageRating: 4.5,
    totalReviews: 31,
    totalSessions: 145,
  },
  {
    // 15. Светлана Орлова
    email: 'svetlana.orlova@soulmate-demo.ru',
    firstName: 'Светлана',
    lastName: 'Орлова',
    gender: 'female',
    city: 'Москва',
    type: SpecialistType.PSYCHOLOGIST,
    experienceYears: 14,
    education: 'МГУ, психология; гештальт-институт; системная семейная терапия (Институт системной терапии)',
    approaches: ['гештальт', 'системная семейная терапия'],
    specializations: ['отношения', 'семья'],
    workFormats: ['online', 'offline'],
    sessionPrice: 6000,
    sessionDuration: 50,
    bio: 'Психолог с 14-летним опытом. Специализируюсь на парных и семейных отношениях. Работаю в гештальт и системном подходах. Помогаю улучшить коммуникацию и разрешить конфликты.',
    aiBio: 'Светлана — психолог, гештальт и системная семейная терапия. Работает с отношениями и семьёй. Опытный, тёплый специалист.',
    averageRating: 4.9,
    totalReviews: 108,
    totalSessions: 670,
  },
];

// ---------------------------------------------------------------------------
// Client users seed data
// ---------------------------------------------------------------------------

const clientsData: ClientSeedData[] = [
  {
    email: 'test@example.com',
    firstName: 'Тест',
    lastName: 'Пользователь',
    city: 'Москва',
  },
  {
    email: 'client1@example.com',
    firstName: 'Алина',
    lastName: 'Клиентова',
    city: 'Москва',
  },
  {
    email: 'client2@example.com',
    firstName: 'Борис',
    lastName: 'Тестовый',
    city: 'Санкт-Петербург',
  },
];

// ---------------------------------------------------------------------------
// Review comment templates
// ---------------------------------------------------------------------------

const reviewTemplates: ReviewTemplate[] = [
  {
    rating: 5,
    comment:
      'Невероятно помогло. Специалист создал безопасное пространство, где я смог открыться. После нескольких сессий стало намного легче.',
  },
  {
    rating: 5,
    comment:
      'Профессионализм и эмпатия — идеальное сочетание. Рекомендую всем, кто ищет настоящей поддержки.',
  },
  {
    rating: 5,
    comment:
      'Работа с этим специалистом изменила мою жизнь. Понятные инструменты, поддержка между сессиями, реальный результат.',
  },
  {
    rating: 4,
    comment:
      'Очень грамотный специалист. Помог разобраться в сложной ситуации. Чуть больше гибкости в расписании — и было бы идеально.',
  },
  {
    rating: 5,
    comment:
      'Спустя 3 месяца работы я узнаю себя. Паника ушла, стало понятно, как жить дальше. Огромное спасибо.',
  },
  {
    rating: 4,
    comment:
      'Хороший специалист, глубокая работа. Иногда сессии кажутся слишком короткими — хочется продолжения.',
  },
  {
    rating: 5,
    comment:
      'Наконец-то нашла специалиста, с которым по-настоящему резонирую. Работа идёт в комфортном темпе, без давления.',
  },
  {
    rating: 5,
    comment:
      'Структурированный подход, конкретные техники, честная обратная связь. После месяца работы замечаю реальные изменения.',
  },
  {
    rating: 4,
    comment:
      'Профессионально и поддерживающе. Помог разобраться с паттернами, которые мешали годами.',
  },
  {
    rating: 5,
    comment:
      'Лучшее вложение в себя за последние годы. Специалист понял мой запрос с первой сессии и двигается именно туда, куда нужно.',
  },
  {
    rating: 5,
    comment:
      'Благодарна за работу. Помогли справиться с потерей, которую я не могла пережить несколько лет.',
  },
  {
    rating: 4,
    comment: 'Грамотно выстроенная работа. Вижу прогресс. Буду продолжать.',
  },
  {
    rating: 5,
    comment:
      'Очень компетентный и внимательный специалист. Не навязывает, но направляет. Именно то, что нужно.',
  },
  {
    rating: 5,
    comment:
      'За 2 месяца удалось сдвинуться с места, где я застрял на несколько лет. Спасибо за терпение и профессионализм.',
  },
  {
    rating: 4,
    comment:
      'Полезная работа, конкретные результаты. Специалист хорошо держит границы и не даёт уйти в пустые разговоры.',
  },
];

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('Starting database seed...');

  const passwordHash = await bcrypt.hash('TestPass123!', 10);

  // -------------------------------------------------------------------------
  // 1. Upsert client users
  // -------------------------------------------------------------------------
  const seededClients: Array<{ id: string; email: string }> = [];

  for (const clientData of clientsData) {
    const client = await prisma.user.upsert({
      where: { email: clientData.email },
      update: {
        firstName: clientData.firstName,
        lastName: clientData.lastName,
        city: clientData.city,
      },
      create: {
        email: clientData.email,
        passwordHash,
        role: UserRole.CLIENT,
        authProvider: AuthProvider.EMAIL,
        firstName: clientData.firstName,
        lastName: clientData.lastName,
        city: clientData.city,
        emailVerified: true,
        isActive: true,
        privacyAcceptedAt: new Date(),
        termsAcceptedAt: new Date(),
      },
    });
    seededClients.push({ id: client.id, email: client.email ?? clientData.email });
    console.log(`Upserted client: ${client.email}`);
  }

  // Use the first client as the primary reviewer
  const primaryClient = seededClients[0];

  // -------------------------------------------------------------------------
  // 2. Upsert specialists and their profiles, bookings, reviews
  // -------------------------------------------------------------------------
  let reviewTemplateIndex = 0;

  for (const data of specialistsData) {
    // Upsert specialist user
    const specialistUser = await prisma.user.upsert({
      where: { email: data.email },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        city: data.city,
      },
      create: {
        email: data.email,
        passwordHash,
        role: UserRole.SPECIALIST,
        authProvider: AuthProvider.EMAIL,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        city: data.city,
        emailVerified: true,
        isActive: true,
        privacyAcceptedAt: new Date(),
        termsAcceptedAt: new Date(),
      },
    });

    // Upsert specialist profile
    const profile = await prisma.specialistProfile.upsert({
      where: { userId: specialistUser.id },
      update: {
        type: data.type,
        verification: VerificationStatus.APPROVED,
        education: data.education,
        experienceYears: data.experienceYears,
        approaches: data.approaches,
        specializations: data.specializations,
        languages: ['ru'],
        bio: data.bio,
        aiBio: data.aiBio,
        sessionPrice: data.sessionPrice,
        sessionDuration: data.sessionDuration,
        workFormats: data.workFormats,
        averageRating: data.averageRating,
        totalReviews: data.totalReviews,
        totalSessions: data.totalSessions,
        verifiedAt: new Date('2024-01-15'),
        subscriptionPlan: 'professional',
        commissionRate: 0.2,
      },
      create: {
        userId: specialistUser.id,
        type: data.type,
        verification: VerificationStatus.APPROVED,
        education: data.education,
        experienceYears: data.experienceYears,
        approaches: data.approaches,
        specializations: data.specializations,
        languages: ['ru'],
        bio: data.bio,
        aiBio: data.aiBio,
        sessionPrice: data.sessionPrice,
        sessionDuration: data.sessionDuration,
        workFormats: data.workFormats,
        averageRating: data.averageRating,
        totalReviews: data.totalReviews,
        totalSessions: data.totalSessions,
        verifiedAt: new Date('2024-01-15'),
        subscriptionPlan: 'professional',
        commissionRate: 0.2,
      },
    });

    // Create 2 completed bookings + reviews per specialist
    for (let i = 0; i < 2; i++) {
      const daysAgo = 30 + i * 14; // stagger slots in the past
      const slotStart = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      slotStart.setHours(11 + i * 2, 0, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + data.sessionDuration * 60 * 1000);

      const commission = Math.round(data.sessionPrice * 0.2);
      const specialistPayout = data.sessionPrice - commission;

      // Find or create the booking (idempotent via slotStart exact match)
      let booking = await prisma.booking.findFirst({
        where: {
          clientId: primaryClient.id,
          specialistId: profile.id,
          slotStart,
        },
      });

      if (!booking) {
        booking = await prisma.booking.create({
          data: {
            clientId: primaryClient.id,
            specialistId: profile.id,
            slotStart,
            slotEnd,
            duration: data.sessionDuration,
            timezone: 'Europe/Moscow',
            status: BookingStatus.COMPLETED,
            format: data.workFormats[0],
            price: data.sessionPrice,
            commission,
            specialistPayout,
            matchScore: 0.85 + Math.random() * 0.14,
            matchSource: 'ai_matching',
          },
        });
      }

      // Upsert review for this booking
      const template = reviewTemplates[reviewTemplateIndex % reviewTemplates.length];
      reviewTemplateIndex++;

      await prisma.review.upsert({
        where: { bookingId: booking.id },
        update: {
          rating: template.rating,
          comment: template.comment,
          status: ReviewStatus.PUBLISHED,
        },
        create: {
          bookingId: booking.id,
          clientId: primaryClient.id,
          specialistId: profile.id,
          rating: template.rating,
          comment: template.comment,
          matchRating: 5,
          matchFeedback: 'Отличное совпадение, полностью удовлетворён подходом специалиста.',
          status: ReviewStatus.PUBLISHED,
          isAnonymous: true,
          sessionNumber: i + 1,
        },
      });
    }

    console.log(`Seeded specialist: ${data.firstName} ${data.lastName} (${data.type})`);
  }

  // -------------------------------------------------------------------------
  // 3. Add recurring schedule slots for the first specialist
  // -------------------------------------------------------------------------
  const firstSpecialist = await prisma.specialistProfile.findFirst({
    where: { user: { email: specialistsData[0].email } },
  });

  if (firstSpecialist) {
    const recurringSlots = [
      { dayOfWeek: 1, startTime: '10:00', endTime: '11:00' },
      { dayOfWeek: 1, startTime: '12:00', endTime: '13:00' },
      { dayOfWeek: 2, startTime: '10:00', endTime: '11:00' },
      { dayOfWeek: 3, startTime: '12:00', endTime: '13:00' },
      { dayOfWeek: 3, startTime: '17:00', endTime: '18:00' },
      { dayOfWeek: 4, startTime: '10:00', endTime: '11:00' },
      { dayOfWeek: 5, startTime: '12:00', endTime: '13:00' },
    ];

    for (const slot of recurringSlots) {
      const existing = await prisma.scheduleSlot.findFirst({
        where: {
          specialistId: firstSpecialist.id,
          isRecurring: true,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
        },
      });
      if (!existing) {
        await prisma.scheduleSlot.create({
          data: {
            specialistId: firstSpecialist.id,
            isRecurring: true,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isAvailable: true,
          },
        });
      }
    }
    console.log(
      `Added recurring schedule slots for ${specialistsData[0].firstName} ${specialistsData[0].lastName}`,
    );
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log('\nSeed completed successfully.');
  console.log('Test credentials (password: TestPass123!):');
  for (const c of clientsData) {
    console.log(`  Client:     ${c.email}`);
  }
  console.log(`  Specialists created: ${specialistsData.length}`);
  console.log(`  Reviews per specialist: 2`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
