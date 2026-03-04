import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Тарифы для специалистов — SoulMate",
  description:
    "Выберите тарифный план для работы психолога или коуча на платформе SoulMate. Тариф Старт — бесплатно.",
};

const tiers = [
  {
    name: "Старт",
    price: "Бесплатно",
    priceDetail: "навсегда",
    description: "Идеально, чтобы познакомиться с платформой и первыми клиентами",
    highlight: false,
    cta: "Начать бесплатно",
    features: [
      "До 3 клиентов в месяц",
      "Базовый профиль специалиста",
      "Ценностный матчинг",
      "Онлайн-расписание",
      "Поддержка по email",
    ],
    missing: [
      "Приоритет в выдаче",
      "Расширенный профиль",
      "Аналитика",
      "Персональный менеджер",
    ],
  },
  {
    name: "Профессионал",
    price: "2 990",
    priceDetail: "руб/мес",
    description: "Для активно практикующих специалистов с растущей клиентской базой",
    highlight: true,
    badge: "Популярный",
    cta: "Выбрать Профессионал",
    features: [
      "До 20 клиентов в месяц",
      "Расширенный профиль специалиста",
      "Ценностный матчинг",
      "Приоритет в выдаче Top-5",
      "Онлайн-расписание",
      "Видео-знакомство в профиле",
      "Поддержка по email и чату",
    ],
    missing: [
      "Неограниченные клиенты",
      "Аналитика клиентской базы",
      "Персональный менеджер",
    ],
  },
  {
    name: "Бизнес",
    price: "5 990",
    priceDetail: "руб/мес",
    description: "Для специалистов с большим потоком клиентов и бизнес-целями",
    highlight: false,
    cta: "Выбрать Бизнес",
    features: [
      "Неограниченное количество клиентов",
      "Всё из тарифа Профессионал",
      "Аналитика клиентской базы",
      "Персональный менеджер",
      "Приоритетная техническая поддержка",
      "Расширенная статистика матчинга",
      "API-интеграция (по запросу)",
    ],
    missing: [],
  },
];

const faqs = [
  {
    question: "Могу ли я сменить тариф в любой момент?",
    answer:
      "Да. Вы можете перейти на более высокий тариф немедленно — он начнёт действовать сразу. При переходе на более низкий тариф изменение вступит в силу со следующего расчётного периода.",
  },
  {
    question: "Как работает оплата?",
    answer:
      "Оплата списывается ежемесячно с карты, привязанной к аккаунту. Мы поддерживаем карты российских банков (Visa, MasterCard, Мир). Квитанция об оплате приходит на электронную почту.",
  },
  {
    question: "Есть ли бесплатный пробный период?",
    answer:
      "Тариф Старт — это ваш бесплатный период без временных ограничений. Вы можете работать с первыми 3 клиентами бесплатно и принять решение об апгрейде, когда будете готовы.",
  },
  {
    question: "Как отменить подписку?",
    answer:
      "Отменить подписку можно в любой момент в личном кабинете в разделе «Тарифный план». Подписка будет действовать до конца оплаченного периода — деньги не возвращаются за неиспользованное время.",
  },
  {
    question: "Берёт ли SoulMate комиссию с платежей клиентов?",
    answer:
      "Да, SoulMate взимает комиссию 10% с каждого платежа клиента на тарифах Старт и Профессионал, и 7% на тарифе Бизнес. Комиссия покрывает обработку платежей и содержание платформы.",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-hero" aria-labelledby="pricing-hero-heading">
        <div className="mx-auto max-w-container px-4 py-16 md:px-8 md:py-24 text-center">
          <h1
            id="pricing-hero-heading"
            className="text-display-lg md:text-display-xl text-primary-900"
          >
            {"Тарифы для специалистов"}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-body-lg text-neutral-700">
            {"Начните бесплатно и масштабируйтесь по мере роста практики. Никаких скрытых платежей."}
          </p>
        </div>
      </section>

      {/* Pricing tiers */}
      <section className="py-16 md:py-20" aria-labelledby="tiers-heading">
        <div className="mx-auto max-w-container px-4 md:px-8">
          <h2 id="tiers-heading" className="sr-only">
            {"Тарифные планы"}
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            {tiers.map(({ name, price, priceDetail, description, highlight, badge, cta, features, missing }) => (
              <div
                key={name}
                className={`relative rounded-xl border p-8 shadow-card transition-shadow hover:shadow-card-hover ${
                  highlight
                    ? "border-primary-400 bg-primary-50 ring-2 ring-primary-400"
                    : "border-neutral-300 bg-white"
                }`}
              >
                {badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-600 px-3 py-1 text-body-sm font-semibold text-white">
                      <Zap className="h-3 w-3" />
                      {badge}
                    </span>
                  </div>
                )}

                <h3 className="text-heading-4 text-neutral-900">{name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-display-md font-bold text-neutral-900">
                    {price}
                  </span>
                  <span className="text-body-md text-neutral-600">{priceDetail}</span>
                </div>
                <p className="mt-3 text-body-sm text-neutral-700">{description}</p>

                <Button
                  size="lg"
                  variant={highlight ? "primary" : "secondary"}
                  className="mt-8 w-full"
                  asChild
                >
                  <Link href="/specialist/register">
                    {cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <div className="mt-8">
                  <p className="text-body-sm font-semibold text-neutral-900 mb-4">
                    {"Включено:"}
                  </p>
                  <ul className="space-y-3">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-body-sm text-neutral-700">
                        <CheckCircle2 className="h-4 w-4 text-success-500 shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                    {missing.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-body-sm text-neutral-400">
                        <span className="h-4 w-4 shrink-0 mt-0.5 flex items-center justify-center">
                          <span className="h-0.5 w-3 bg-neutral-300 block" />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        className="bg-primary-50 py-16 md:py-20"
        aria-labelledby="pricing-faq-heading"
      >
        <div className="mx-auto max-w-container px-4 md:px-8">
          <h2
            id="pricing-faq-heading"
            className="text-center text-heading-2 text-neutral-900"
          >
            {"Вопросы об оплате"}
          </h2>

          <div className="mx-auto mt-12 max-w-3xl space-y-4">
            {faqs.map(({ question, answer }) => (
              <details
                key={question}
                className="group rounded-xl border border-neutral-300 bg-white shadow-card"
              >
                <summary className="flex cursor-pointer items-center justify-between p-6 text-heading-5 text-neutral-900 hover:text-primary-700 transition-colors list-none">
                  {question}
                  <ChevronDown className="h-5 w-5 text-neutral-500 transition-transform group-open:rotate-180 shrink-0 ml-4" />
                </summary>
                <div className="px-6 pb-6 text-body-md text-neutral-700">
                  {answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="bg-gradient-primary py-16 md:py-20"
        aria-labelledby="pricing-cta-heading"
      >
        <div className="mx-auto max-w-container px-4 text-center md:px-8">
          <h2 id="pricing-cta-heading" className="text-heading-2 text-white">
            {"Начните работу сегодня"}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-body-lg text-primary-100">
            {"Зарегистрируйтесь бесплатно и получите первых клиентов уже в эту неделю"}
          </p>
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
