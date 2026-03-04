import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  User,
  FileText,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Shield,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Регистрация специалиста — SoulMate",
  description:
    "Зарегистрируйтесь как психолог или коуч на платформе SoulMate. Простая верификация и первые клиенты уже в первую неделю.",
};

const steps = [
  {
    step: 1,
    icon: User,
    title: "Основная информация",
    description: "Имя, фото, контактные данные",
    fields: [
      "Имя и фамилия",
      "Email и номер телефона",
      "Фото профиля",
      "Город и часовой пояс",
    ],
  },
  {
    step: 2,
    icon: FileText,
    title: "Профессиональная информация",
    description: "Специализация, подход и опыт",
    fields: [
      "Специализация (тревога, депрессия, отношения и др.)",
      "Терапевтический подход",
      "Стаж работы",
      "Описание для клиентов",
    ],
  },
  {
    step: 3,
    icon: Shield,
    title: "Документы и верификация",
    description: "Загрузите документы для проверки",
    fields: [
      "Диплом о психологическом/педагогическом образовании",
      "Сертификаты о прохождении курсов и супервизий",
      "Ссылка на профессиональный сайт или соцсети (по желанию)",
    ],
  },
];

export default function SpecialistRegisterPage() {
  return (
    <div className="mx-auto max-w-container px-4 py-8 md:px-8 md:py-16">
      {/* Back link */}
      <div className="mb-8">
        <Link
          href="/for-specialists"
          className="inline-flex items-center gap-2 text-body-sm text-neutral-600 hover:text-primary-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {"Вернуться на страницу для специалистов"}
        </Link>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-display-lg text-primary-900">
          {"Регистрация специалиста"}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-body-lg text-neutral-700">
          {"Три простых шага — и ваш профиль появится в системе подбора. Первые клиенты обычно приходят в течение недели."}
        </p>
      </div>

      {/* Steps */}
      <div className="mb-12">
        {/* Step indicators */}
        <div className="flex items-center justify-center mb-12">
          {steps.map(({ step }, idx) => (
            <div key={step} className="flex items-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-btn-sm font-bold ${
                step === 1
                  ? "bg-primary-600 text-white"
                  : "bg-neutral-200 text-neutral-500"
              }`}>
                {step}
              </div>
              {idx < steps.length - 1 && (
                <div className="mx-2 h-0.5 w-16 bg-neutral-300 md:w-24" />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 active - show form for step 1 */}
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map(({ step, icon: Icon, title, description, fields }) => (
            <div
              key={step}
              className={`rounded-xl border p-8 shadow-card transition-all ${
                step === 1
                  ? "border-primary-400 bg-primary-50 ring-2 ring-primary-200"
                  : "border-neutral-300 bg-white opacity-60"
              }`}
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
                step === 1 ? "bg-primary-100" : "bg-neutral-100"
              }`}>
                <Icon className={`h-6 w-6 ${step === 1 ? "text-primary-600" : "text-neutral-400"}`} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-caption font-semibold uppercase tracking-wide ${
                  step === 1 ? "text-primary-600" : "text-neutral-400"
                }`}>
                  {"Шаг"} {step}
                </span>
                {step === 1 && (
                  <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                    {"Текущий"}
                  </span>
                )}
              </div>
              <h3 className="text-heading-4 text-neutral-900">{title}</h3>
              <p className="mt-1 text-body-sm text-neutral-600 mb-4">{description}</p>
              <ul className="space-y-2">
                {fields.map((field) => (
                  <li key={field} className="flex items-start gap-2 text-body-sm text-neutral-700">
                    <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${
                      step === 1 ? "text-primary-500" : "text-neutral-300"
                    }`} />
                    {field}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Form area (Step 1) */}
      <div className="mx-auto max-w-lg rounded-xl border border-neutral-300 bg-white p-8 shadow-card">
        <h2 className="text-heading-4 text-neutral-900 mb-6">
          {"Шаг 1: Основная информация"}
        </h2>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-body-sm font-medium text-neutral-700 mb-1">
                {"Имя"}
              </label>
              <div className="h-10 rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-body-sm text-neutral-400">
                {"Иван"}
              </div>
            </div>
            <div>
              <label className="block text-body-sm font-medium text-neutral-700 mb-1">
                {"Фамилия"}
              </label>
              <div className="h-10 rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-body-sm text-neutral-400">
                {"Петров"}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-body-sm font-medium text-neutral-700 mb-1">
              {"Email"}
            </label>
            <div className="h-10 rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-body-sm text-neutral-400">
              {"ivan@example.com"}
            </div>
          </div>

          <div>
            <label className="block text-body-sm font-medium text-neutral-700 mb-1">
              {"Телефон"}
            </label>
            <div className="h-10 rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-body-sm text-neutral-400">
              {"+7 (999) 000-00-00"}
            </div>
          </div>

          <div className="rounded-lg bg-neutral-100 p-4 text-body-sm text-neutral-600">
            {"Форма регистрации находится в разработке. Оставьте заявку по адресу "}
            <a href="mailto:specialists@soulmate.ru" className="text-primary-700 hover:text-primary-800 font-medium">
              specialists@soulmate.ru
            </a>
            {" — мы свяжемся с вами в течение 24 часов."}
          </div>

          <Button size="lg" className="w-full" asChild>
            <Link href="mailto:specialists@soulmate.ru">
              {"Оставить заявку"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        <p className="mt-6 text-center text-body-sm text-neutral-600">
          {"Уже есть аккаунт?"}{" "}
          <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-700">
            {"Войти"}
          </Link>
        </p>
      </div>
    </div>
  );
}
