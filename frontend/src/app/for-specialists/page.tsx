import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Users,
  Star,
  CalendarCheck,
  ArrowRight,
  UserCheck,
  BarChart3,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Для специалистов — психологов и коучей",
  description:
    "Получайте клиентов, которые подходят вашему подходу. Регистрируйтесь на SoulMate как психолог или коуч.",
};

const benefits = [
  {
    icon: Zap,
    title: "Ценностный матчинг",
    description:
      "Клиенты приходят к вам потому, что их ценности совпадают с вашим подходом — а не просто потому, что вы ближайший специалист.",
    colorClass: "bg-primary-100",
    iconColor: "text-primary-600",
  },
  {
    icon: UserCheck,
    title: "Готовые клиенты с проработанным запросом",
    description:
      "Перед записью каждый клиент проходит AI-консультацию. Вы получаете клиента, который уже понимает, чего хочет от терапии.",
    colorClass: "bg-success-100",
    iconColor: "text-success-600",
  },
  {
    icon: Star,
    title: "Личный профессиональный портрет",
    description:
      "ИИ формирует уникальный портрет вашего подхода на основе ваших ценностей, специализации и стиля работы — без длинных анкет.",
    colorClass: "bg-secondary-100",
    iconColor: "text-secondary-600",
  },
  {
    icon: CalendarCheck,
    title: "Удобное расписание",
    description:
      "Управляйте своим временем: настраивайте доступные слоты, форматы сессий (онлайн / очно), продолжительность и стоимость.",
    colorClass: "bg-warning-100",
    iconColor: "text-warning-600",
  },
];

const joinSteps = [
  {
    step: 1,
    title: "Зарегистрируйтесь",
    description:
      "Создайте аккаунт и заполните базовую информацию: образование, специализация, подход и стоимость сессии.",
  },
  {
    step: 2,
    title: "Пройдите верификацию",
    description:
      "Наша команда проверит ваши документы и квалификацию. Обычно это занимает 1–3 рабочих дня.",
  },
  {
    step: 3,
    title: "Начните принимать клиентов",
    description:
      "После верификации ваш профиль появится в системе матчинга. Первые клиенты появятся уже в первую неделю.",
  },
];

const stats = [
  { value: "87%", label: "специалистов получают первого клиента за неделю" },
  { value: "4.8", label: "средняя оценка качества клиентов от специалистов" },
  { value: "65%", label: "клиентов продолжают работу после первой сессии" },
];

export default function ForSpecialistsPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="bg-gradient-hero"
        aria-labelledby="specialists-hero-heading"
      >
        <div className="mx-auto max-w-container px-4 py-16 md:px-8 md:py-24">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-2 text-body-sm font-medium text-primary-700">
                <Users className="h-4 w-4" />
                {"Для психологов и коучей"}
              </div>
              <h1
                id="specialists-hero-heading"
                className="text-display-lg md:text-display-xl text-primary-900"
              >
                {"Получайте клиентов, которые "}
                <span className="gradient-text">{"подходят вашему подходу"}</span>
              </h1>
              <p className="mt-6 text-body-lg text-neutral-700 max-w-lg">
                {"SoulMate подбирает клиентов не по цене или рейтингу, а по совпадению ценностей. Вы работаете с теми, кому действительно нужен именно ваш подход."}
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button size="lg" className="text-btn-lg" asChild>
                  <Link href="/specialist/register">
                    {"Зарегистрироваться"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/pricing">{"Посмотреть тарифы"}</Link>
                </Button>
              </div>
            </div>

            {/* Stats visual */}
            <div className="hidden md:grid grid-cols-1 gap-4">
              {stats.map(({ value, label }) => (
                <div
                  key={label}
                  className="rounded-xl border border-neutral-300 bg-white p-6 shadow-card flex items-center gap-4"
                >
                  <span className="text-display-md gradient-text font-bold shrink-0">
                    {value}
                  </span>
                  <span className="text-body-md text-neutral-700">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-20" aria-labelledby="spec-benefits-heading">
        <div className="mx-auto max-w-container px-4 md:px-8">
          <h2
            id="spec-benefits-heading"
            className="text-center text-heading-2 text-neutral-900"
          >
            {"Почему специалисты выбирают SoulMate"}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-body-lg text-neutral-600">
            {"Меньше времени на маркетинг — больше времени на работу с клиентами"}
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {benefits.map(({ icon: Icon, title, description, colorClass, iconColor }) => (
              <div
                key={title}
                className="rounded-xl border border-neutral-300 bg-white p-8 shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl ${colorClass}`}>
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <h3 className="text-heading-4 text-neutral-900">{title}</h3>
                <p className="mt-3 text-body-sm text-neutral-700">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to join */}
      <section
        className="bg-primary-50 py-16 md:py-20"
        aria-labelledby="join-heading"
      >
        <div className="mx-auto max-w-container px-4 md:px-8">
          <h2
            id="join-heading"
            className="text-center text-heading-2 text-neutral-900"
          >
            {"Как начать работу"}
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {joinSteps.map(({ step, title, description }) => (
              <div
                key={step}
                className="relative rounded-xl border border-neutral-300 bg-white p-8 shadow-card"
              >
                <div className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white text-btn-sm font-bold">
                  {step}
                </div>
                <h3 className="text-heading-4 text-neutral-900 pr-10">{title}</h3>
                <p className="mt-3 text-body-sm text-neutral-700">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="py-16 md:py-20" aria-labelledby="spec-pricing-heading">
        <div className="mx-auto max-w-container px-4 md:px-8">
          <div className="rounded-2xl border border-primary-200 bg-primary-50 p-8 md:p-12 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-primary-500 mb-4" />
            <h2
              id="spec-pricing-heading"
              className="text-heading-2 text-neutral-900"
            >
              {"Тарифы для специалистов"}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-body-lg text-neutral-700">
              {"Начните бесплатно — тариф Старт позволяет принимать до 3 клиентов в месяц без оплаты. Для роста доступны тарифы Профессионал и Бизнес."}
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/pricing">{"Посмотреть все тарифы"}</Link>
              </Button>
              <Button size="lg" asChild>
                <Link href="/specialist/register">
                  {"Начать бесплатно"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="bg-gradient-primary py-16 md:py-20"
        aria-labelledby="spec-cta-heading"
      >
        <div className="mx-auto max-w-container px-4 text-center md:px-8">
          <h2 id="spec-cta-heading" className="text-heading-2 text-white">
            {"Присоединяйтесь к SoulMate"}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-body-lg text-primary-100">
            {"Более 500 специалистов уже работают с клиентами через нашу платформу"}
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            {[
              "Верификация документов",
              "Клиенты с готовым запросом",
              "Начало бесплатно",
            ].map((point) => (
              <div
                key={point}
                className="flex items-center gap-2 text-body-sm text-white"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-200" />
                {point}
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary-700 hover:bg-primary-50 border-0"
              asChild
            >
              <Link href="/specialist/register">
                {"Зарегистрироваться как специалист"}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
