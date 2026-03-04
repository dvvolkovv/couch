import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Users,
  CalendarCheck,
  CheckCircle2,
  Shield,
  Lock,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Как работает Hearty",
  description:
    "Узнайте, как ИИ-консультант Hearty помогает найти психолога или коуча по совпадению ценностей за 3 простых шага.",
};

const steps = [
  {
    step: 1,
    icon: MessageCircle,
    title: "AI-консультация",
    description:
      "ИИ проводит 15-минутную беседу, задаёт вопросы о вашем запросе, жизненных ценностях и ожиданиях от работы со специалистом.",
    detail:
      "Наш ИИ-консультант не просто собирает информацию — он выстраивает диалог, помогает вам лучше понять свой запрос и выявляет ключевые ценности, которые важны именно для вас.",
  },
  {
    step: 2,
    icon: Users,
    title: "Матчинг по ценностям",
    description:
      "Алгоритм анализирует совпадение ценностных профилей клиента и специалистов и находит Top-5 наиболее подходящих.",
    detail:
      "Мы сравниваем ваш профиль ценностей с профилями всех специалистов в базе. Учитываются подход к работе, специализация, стиль коммуникации и ваши предпочтения по формату сессий.",
  },
  {
    step: 3,
    icon: CalendarCheck,
    title: "Выбор и запись",
    description:
      "Изучите профили рекомендованных специалистов и запишитесь на первую сессию в удобное для вас время.",
    detail:
      "В профиле каждого специалиста — видео-знакомство, подход, специализация и процент совпадения с вашими ценностями. Первая сессия обычно проходит в течение 48 часов после записи.",
  },
];

const benefits = [
  {
    icon: CheckCircle2,
    title: "65% клиентов остаются с первым специалистом",
    description:
      "Благодаря ценностному матчингу вы с высокой вероятностью найдёте своего специалиста с первого раза.",
    colorClass: "bg-success-100",
    iconColor: "text-success-600",
  },
  {
    icon: Lock,
    title: "Полная конфиденциальность",
    description:
      "Беседа с ИИ-консультантом анонимна. Ваши ответы используются только для подбора и не передаются третьим лицам.",
    colorClass: "bg-primary-100",
    iconColor: "text-primary-600",
  },
  {
    icon: Shield,
    title: "Бесплатно для клиентов",
    description:
      "Первая AI-консультация и базовый матчинг полностью бесплатны. Вы платите только специалисту за сессии.",
    colorClass: "bg-secondary-100",
    iconColor: "text-secondary-600",
  },
];

const faqs = [
  {
    question: "Сколько времени занимает AI-консультация?",
    answer:
      "В среднем 10–15 минут. Консультация проходит в формате диалога с ИИ-ассистентом: он задаёт вопросы, вы отвечаете в свободной форме. Можно пройти в любое удобное время.",
  },
  {
    question: "Как алгоритм подбирает специалистов?",
    answer:
      "Алгоритм строит ваш ценностный профиль на основе ответов и сравнивает его с профилями специалистов. Учитывается не только специализация, но и подход к работе, стиль коммуникации, ваши ожидания от терапии.",
  },
  {
    question: "Что, если первый специалист мне не подойдёт?",
    answer:
      "Это нормально. Вы можете вернуться к списку рекомендаций и выбрать другого специалиста из Top-5. Также вы можете пройти консультацию повторно — иногда запрос меняется.",
  },
  {
    question: "Мои данные в безопасности?",
    answer:
      "Да. Мы не передаём ваши личные данные специалистам без вашего согласия. Специалист видит только обезличенный запрос и процент совпадения ценностей.",
  },
  {
    question: "Есть ли приложение для смартфона?",
    answer:
      "Сайт полностью адаптирован для мобильных устройств. Мобильное приложение находится в разработке и появится в 2026 году.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-hero" aria-labelledby="hiw-hero-heading">
        <div className="mx-auto max-w-container px-4 py-16 md:px-8 md:py-24 text-center">
          <h1
            id="hiw-hero-heading"
            className="text-display-lg md:text-display-xl text-primary-900"
          >
            {"Как работает "}
            <span className="gradient-text">{"Hearty"}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-body-lg text-neutral-700">
            {"Мы используем ИИ, чтобы понять ваши ценности — и найти специалиста, с которым вы действительно сможете работать, а не просто ближайшего свободного."}
          </p>
          <div className="mt-8">
            <Button size="lg" className="text-btn-lg" asChild>
              <Link href="/consultation">
                {"Попробовать бесплатно"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 3 Steps */}
      <section className="py-16 md:py-24" aria-labelledby="steps-heading">
        <div className="mx-auto max-w-container px-4 md:px-8">
          <h2
            id="steps-heading"
            className="text-center text-heading-2 text-neutral-900"
          >
            {"3 шага до вашего специалиста"}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-body-lg text-neutral-600">
            {"Весь процесс занимает меньше суток — от первой беседы до записи на сессию"}
          </p>

          <div className="mt-16 space-y-12">
            {steps.map(({ step, icon: Icon, title, description, detail }, index) => (
              <div
                key={step}
                className={`flex flex-col gap-8 md:flex-row md:items-center ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Visual */}
                <div className="flex-1 flex justify-center">
                  <div className="relative w-64 h-64">
                    <div className="absolute inset-0 rounded-full bg-primary-50" />
                    <div className="absolute inset-8 rounded-full bg-primary-100" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-card">
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <div className="mt-3 text-display-md font-bold text-primary-200">
                          {`0${step}`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white text-btn-sm font-bold">
                      {step}
                    </span>
                    <span className="text-body-sm text-primary-600 font-semibold uppercase tracking-wide">
                      {"Шаг"} {step}
                    </span>
                  </div>
                  <h3 className="text-heading-3 text-neutral-900">{title}</h3>
                  <p className="mt-3 text-body-lg text-neutral-700">{description}</p>
                  <p className="mt-4 text-body-sm text-neutral-600 rounded-xl bg-neutral-100 p-4">
                    {detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section
        className="bg-primary-50 py-16 md:py-20"
        aria-labelledby="benefits-heading"
      >
        <div className="mx-auto max-w-container px-4 md:px-8">
          <h2
            id="benefits-heading"
            className="text-center text-heading-2 text-neutral-900"
          >
            {"Почему это работает"}
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
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

      {/* FAQ */}
      <section className="py-16 md:py-20" aria-labelledby="faq-heading">
        <div className="mx-auto max-w-container px-4 md:px-8">
          <h2
            id="faq-heading"
            className="text-center text-heading-2 text-neutral-900"
          >
            {"Часто задаваемые вопросы"}
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
        aria-labelledby="hiw-cta-heading"
      >
        <div className="mx-auto max-w-container px-4 text-center md:px-8">
          <h2 id="hiw-cta-heading" className="text-heading-2 text-white">
            {"Готовы начать?"}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-body-lg text-primary-100">
            {"Первая AI-консультация бесплатна. Это займёт 15 минут."}
          </p>
          <div className="mt-8">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary-700 hover:bg-primary-50 border-0"
              asChild
            >
              <Link href="/consultation">
                {"Начать бесплатный подбор"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
