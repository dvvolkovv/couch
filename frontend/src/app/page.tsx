import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { Footer } from "@/components/layout/footer";
import {
  MessageCircle,
  Users,
  CalendarCheck,
  Shield,
  Clock,
  Lock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-hero" aria-labelledby="hero-heading">
        <div className="mx-auto max-w-container px-4 py-16 md:px-8 md:py-24">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h1
                id="hero-heading"
                className="text-display-lg md:text-display-xl text-primary-900"
              >
                {"Найдите специалиста, который "}
                <span className="gradient-text">
                  {"действительно"}
                </span>
                {" вам подходит"}
              </h1>
              <p className="mt-6 text-body-lg text-neutral-700 max-w-lg">
                {"ИИ-консультант поможет разобраться в вашем запросе и подберёт психолога или коуча по совпадению ценностей, а не только по цене."}
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button size="lg" className="text-btn-lg" asChild>
                  <Link href="/consultation">
                    {"Начать бесплатный подбор"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
              <div className="mt-6 flex items-center gap-6 text-body-sm text-neutral-600">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-primary-500" />
                  {"Бесплатно"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary-500" />
                  15 {"минут"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-primary-500" />
                  {"Конфиденциально"}
                </span>
              </div>
            </div>

            {/* Hero illustration placeholder */}
            <div className="hidden md:flex justify-center">
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 rounded-full bg-primary-100 opacity-50" />
                <div className="absolute inset-8 rounded-full bg-primary-200 opacity-40" />
                <div className="absolute inset-16 rounded-full bg-gradient-warm opacity-30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="flex justify-center -space-x-4">
                      <div className="h-16 w-16 rounded-full bg-primary-300 border-4 border-white flex items-center justify-center text-primary-900 font-bold">
                        K
                      </div>
                      <div className="h-16 w-16 rounded-full bg-secondary-300 border-4 border-white flex items-center justify-center text-secondary-900 font-bold">
                        C
                      </div>
                    </div>
                    <p className="mt-4 text-body-sm font-semibold text-primary-800">
                      92% {"совпадение"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        className="py-16 md:py-20"
        aria-labelledby="how-it-works-heading"
      >
        <div className="mx-auto max-w-container px-4 md:px-8">
          <h2
            id="how-it-works-heading"
            className="text-center text-heading-2 text-neutral-900"
          >
            {"Как это работает"}
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                step: 1,
                icon: MessageCircle,
                title: "Расскажите ИИ о себе",
                description:
                  "ИИ-консультант проведёт 15-минутную беседу о вашем запросе и ценностях.",
              },
              {
                step: 2,
                icon: Users,
                title: "Получите рекомендации",
                description:
                  "Мы подберём Top-5 специалистов с наибольшим процентом совпадения ценностей.",
              },
              {
                step: 3,
                icon: CalendarCheck,
                title: "Запишитесь на сессию",
                description:
                  "Выберите удобное время и формат. Оплатите онлайн и начните работу.",
              },
            ].map(({ step, icon: Icon, title, description }) => (
              <div
                key={step}
                className="relative rounded-xl border border-neutral-300 bg-white p-8 shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <div className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white text-btn-sm">
                  {step}
                </div>
                <h3 className="text-heading-4 text-neutral-900">{title}</h3>
                <p className="mt-3 text-body-sm text-neutral-700">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value matching section */}
      <section
        className="bg-primary-50 py-16 md:py-20"
        aria-labelledby="value-matching-heading"
      >
        <div className="mx-auto max-w-container px-4 md:px-8">
          <h2
            id="value-matching-heading"
            className="text-center text-heading-2 text-neutral-900"
          >
            {"Почему совпадение ценностей важно"}
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {/* Stats placeholder -- would be radar chart illustration in production */}
            <div className="flex items-center justify-center rounded-xl bg-white p-8 shadow-card">
              <div className="text-center">
                <div className="relative mx-auto h-48 w-48">
                  <div className="absolute inset-0 rounded-full border-4 border-primary-200" />
                  <div className="absolute inset-4 rounded-full border-4 border-primary-300" />
                  <div className="absolute inset-8 rounded-full border-4 border-secondary-200" />
                  <div className="absolute inset-12 rounded-full border-4 border-secondary-300" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-display-md gradient-text">92%</span>
                  </div>
                </div>
                <p className="mt-4 text-body-sm text-neutral-600">
                  {"Пример наложения ценностных профилей"}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success-100">
                  <CheckCircle2 className="h-6 w-6 text-success-600" />
                </div>
                <div>
                  <p className="text-heading-4 text-neutral-900">
                    65% {"клиентов остаются"}
                  </p>
                  <p className="mt-1 text-body-sm text-neutral-700">
                    {"с первым рекомендованным специалистом"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100">
                  <CheckCircle2 className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-heading-4 text-neutral-900">
                    {"В 2 раза меньше отказов"}
                  </p>
                  <p className="mt-1 text-body-sm text-neutral-700">
                    {"после первой сессии по сравнению с анкетным подбором"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20" aria-labelledby="testimonials-heading">
        <div className="mx-auto max-w-container px-4 md:px-8">
          <h2
            id="testimonials-heading"
            className="text-center text-heading-2 text-neutral-900"
          >
            {"Отзывы клиентов"}
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                rating: 5,
                text: "Впервые почувствовала, что меня действительно поняли",
                author: "Марина, 29",
              },
              {
                rating: 4.5,
                text: "ИИ-консультант задал вопросы, которые я сам себе не задавал",
                author: "Алексей, 37",
              },
              {
                rating: 5,
                text: "Нашла своего психолога с первого раза. 92% совпадение — и это чувствуется!",
                author: "Ольга, 34",
              },
            ].map((testimonial, i) => (
              <blockquote
                key={i}
                className="rounded-xl border border-neutral-300 bg-white p-6 shadow-card"
              >
                <StarRating rating={testimonial.rating} size="sm" />
                <p className="mt-4 text-body-md text-neutral-800 italic">
                  &laquo;{testimonial.text}&raquo;
                </p>
                <footer className="mt-4 text-body-sm font-medium text-neutral-600">
                  &mdash; {testimonial.author}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for specialists */}
      <section
        className="bg-gradient-primary py-16 md:py-20"
        aria-labelledby="specialist-cta-heading"
      >
        <div className="mx-auto max-w-container px-4 text-center md:px-8">
          <h2
            id="specialist-cta-heading"
            className="text-heading-2 text-white"
          >
            {"Для специалистов"}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-body-lg text-primary-100">
            {"Получайте клиентов, которые подходят именно вашему подходу"}
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            {[
              "Ценностный матчинг вместо конкуренции по цене",
              "Клиенты приходят с проработанным запросом",
              "ИИ создаёт ваш уникальный профессиональный портрет",
            ].map((point, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-body-sm text-white"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-200" />
                {point}
              </div>
            ))}
          </div>

          <div className="mt-10">
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
