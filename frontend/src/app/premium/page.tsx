import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  ArrowRight,
  Star,
  Users,
  Clock,
  Shield,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Premium для клиентов — SoulMate",
  description:
    "SoulMate Premium: неограниченные AI-консультации, расширенный матчинг Top-10, приоритетная запись и персональный менеджер. 990 руб/мес.",
};

const comparison = [
  {
    feature: "AI-консультации",
    free: "1 консультация",
    premium: "Неограниченно",
    icon: Zap,
  },
  {
    feature: "Матчинг специалистов",
    free: "Top-5",
    premium: "Top-10",
    icon: Users,
  },
  {
    feature: "Приоритетная запись",
    free: false,
    premium: true,
    icon: Clock,
  },
  {
    feature: "Персональный менеджер",
    free: false,
    premium: true,
    icon: Star,
  },
  {
    feature: "Конфиденциальность",
    free: true,
    premium: true,
    icon: Shield,
  },
];

const premiumBenefits = [
  {
    icon: Zap,
    title: "Неограниченные консультации",
    description:
      "Проходите AI-консультацию столько раз, сколько нужно. Ваш запрос меняется — алгоритм адаптирует рекомендации.",
    colorClass: "bg-primary-100",
    iconColor: "text-primary-600",
  },
  {
    icon: Users,
    title: "Расширенный матчинг Top-10",
    description:
      "Получайте больше вариантов — видите 10 лучших специалистов вместо 5. Больше выбора, выше шанс найти идеального.",
    colorClass: "bg-success-100",
    iconColor: "text-success-600",
  },
  {
    icon: Clock,
    title: "Приоритетная запись",
    description:
      "Ваши запросы на запись обрабатываются в первую очередь. Первая сессия — уже сегодня или завтра.",
    colorClass: "bg-secondary-100",
    iconColor: "text-secondary-600",
  },
  {
    icon: Star,
    title: "Персональный менеджер",
    description:
      "Личный менеджер поможет с выбором специалиста, ответит на вопросы и обеспечит поддержку на каждом этапе.",
    colorClass: "bg-warning-100",
    iconColor: "text-warning-600",
  },
];

export default function PremiumPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-hero" aria-labelledby="premium-hero-heading">
        <div className="mx-auto max-w-container px-4 py-16 md:px-8 md:py-24 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-2 text-body-sm font-medium text-primary-700">
            <Star className="h-4 w-4" />
            {"Premium для клиентов"}
          </div>
          <h1
            id="premium-hero-heading"
            className="text-display-lg md:text-display-xl text-primary-900"
          >
            {"Найдите специалиста "}
            <span className="gradient-text">{"быстрее и точнее"}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-body-lg text-neutral-700">
            {"Premium даёт вам больше возможностей для поиска и полную поддержку на пути к своему специалисту"}
          </p>
          <div className="mt-4 flex items-baseline justify-center gap-2">
            <span className="text-display-md font-bold gradient-text">{"990"}</span>
            <span className="text-body-lg text-neutral-600">{"руб/мес"}</span>
          </div>
        </div>
      </section>

      {/* Free vs Premium comparison */}
      <section className="py-16 md:py-20" aria-labelledby="comparison-heading">
        <div className="mx-auto max-w-container px-4 md:px-8">
          <h2
            id="comparison-heading"
            className="text-center text-heading-2 text-neutral-900"
          >
            {"Бесплатно vs Premium"}
          </h2>

          <div className="mx-auto mt-12 max-w-3xl">
            {/* Header row */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="col-span-1" />
              <div className="rounded-xl border border-neutral-300 bg-white p-4 text-center shadow-card">
                <p className="text-heading-5 text-neutral-700">{"Бесплатно"}</p>
                <p className="text-body-sm text-neutral-500">{"базовый доступ"}</p>
              </div>
              <div className="rounded-xl border-2 border-primary-400 bg-primary-50 p-4 text-center shadow-card ring-2 ring-primary-400 ring-offset-1">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="h-4 w-4 text-primary-600" />
                  <p className="text-heading-5 text-primary-700">{"Premium"}</p>
                </div>
                <p className="text-body-sm text-primary-600 font-semibold">{"990 руб/мес"}</p>
              </div>
            </div>

            {/* Feature rows */}
            <div className="space-y-2">
              {comparison.map(({ feature, free, premium, icon: Icon }) => (
                <div
                  key={feature}
                  className="grid grid-cols-3 gap-4 items-center"
                >
                  <div className="flex items-center gap-2 text-body-sm text-neutral-700">
                    <Icon className="h-4 w-4 text-neutral-400 shrink-0" />
                    {feature}
                  </div>
                  <div className="rounded-lg border border-neutral-200 bg-white px-3 py-3 text-center">
                    {typeof free === "boolean" ? (
                      free ? (
                        <CheckCircle2 className="h-5 w-5 text-success-500 mx-auto" />
                      ) : (
                        <span className="h-0.5 w-6 bg-neutral-300 block mx-auto" />
                      )
                    ) : (
                      <span className="text-body-sm text-neutral-600">{free}</span>
                    )}
                  </div>
                  <div className="rounded-lg border border-primary-300 bg-primary-50 px-3 py-3 text-center">
                    {typeof premium === "boolean" ? (
                      premium ? (
                        <CheckCircle2 className="h-5 w-5 text-primary-600 mx-auto" />
                      ) : (
                        <span className="h-0.5 w-6 bg-neutral-300 block mx-auto" />
                      )
                    ) : (
                      <span className="text-body-sm font-semibold text-primary-700">{premium}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button size="lg" className="text-btn-lg" asChild>
                <Link href="/profile/subscription">
                  {"Подключить Premium"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <p className="mt-3 text-body-sm text-neutral-500">
                {"Отмена в любой момент. Без скрытых платежей."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section
        className="bg-primary-50 py-16 md:py-20"
        aria-labelledby="premium-benefits-heading"
      >
        <div className="mx-auto max-w-container px-4 md:px-8">
          <h2
            id="premium-benefits-heading"
            className="text-center text-heading-2 text-neutral-900"
          >
            {"Что входит в Premium"}
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {premiumBenefits.map(({ icon: Icon, title, description, colorClass, iconColor }) => (
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

      {/* Pricing CTA */}
      <section
        className="bg-gradient-primary py-16 md:py-20"
        aria-labelledby="premium-cta-heading"
      >
        <div className="mx-auto max-w-container px-4 text-center md:px-8">
          <h2 id="premium-cta-heading" className="text-heading-2 text-white">
            {"Попробуйте Premium"}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-body-lg text-primary-100">
            {"Начните с бесплатной консультации — и подключите Premium, когда будете готовы расширить поиск"}
          </p>

          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-display-md font-bold text-white">{"990"}</span>
              <span className="text-body-lg text-primary-200">{"руб/мес"}</span>
            </div>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary-700 hover:bg-primary-50 border-0"
              asChild
            >
              <Link href="/profile/subscription">
                {"Подключить Premium"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="text-body-sm text-primary-200">
              {"Отмена подписки — в любой момент в личном кабинете"}
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
