"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  User,
  FileText,
  Shield,
} from "lucide-react";

const specializations = [
  "Тревога и панические атаки",
  "Депрессия",
  "Отношения и семья",
  "Самооценка и уверенность",
  "Карьера и профориентация",
  "Стресс и выгорание",
  "Зависимости",
  "Потеря и горе",
  "Личностный рост",
  "Психосоматика",
];

const approaches = [
  "КПТ (когнитивно-поведенческая терапия)",
  "Психоанализ",
  "Гештальт-терапия",
  "Системная семейная терапия",
  "Экзистенциальная терапия",
  "EMDR",
  "Арт-терапия",
  "Коучинг (ICF)",
  "Телесно-ориентированная терапия",
  "Схема-терапия",
];

const stepOneSchema = z.object({
  firstName: z.string().min(2, "Минимум 2 символа"),
  lastName: z.string().min(2, "Минимум 2 символа"),
  email: z.string().email("Некорректный email"),
  phone: z.string().min(10, "Введите номер телефона"),
  password: z.string().min(8, "Минимум 8 символов"),
  city: z.string().min(2, "Укажите город"),
});

const stepTwoSchema = z.object({
  type: z.enum(["PSYCHOLOGIST", "COACH", "PSYCHOTHERAPIST"], {
    required_error: "Выберите тип",
  }),
  experienceYears: z.coerce.number().min(1, "Укажите стаж").max(50),
  sessionPrice: z.coerce.number().min(500, "Минимум 500 руб").max(50000),
  sessionDuration: z.coerce.number().min(30).max(120),
  bio: z.string().min(50, "Минимум 50 символов").max(2000),
});

type StepOneForm = z.infer<typeof stepOneSchema>;
type StepTwoForm = z.infer<typeof stepTwoSchema>;

const stepsMeta = [
  { step: 1, icon: User, title: "Основная информация", description: "Имя, контакты, пароль" },
  { step: 2, icon: FileText, title: "Профессиональный профиль", description: "Специализация, подход, опыт" },
  { step: 3, icon: Shield, title: "Подтверждение", description: "Проверка данных и запуск" },
];

export default function SpecialistRegisterPage() {
  const router = useRouter();
  const { register: registerUser, error: authError } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [selectedApproaches, setSelectedApproaches] = useState<string[]>([]);
  const [stepOneData, setStepOneData] = useState<StepOneForm | null>(null);
  const [success, setSuccess] = useState(false);

  const stepOne = useForm<StepOneForm>({
    resolver: zodResolver(stepOneSchema),
  });

  const stepTwo = useForm<StepTwoForm>({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: { sessionDuration: 60 },
  });

  const toggleSpec = (s: string) => {
    setSelectedSpecs((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const toggleApproach = (a: string) => {
    setSelectedApproaches((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  const onStepOneSubmit = (data: StepOneForm) => {
    setStepOneData(data);
    setCurrentStep(2);
  };

  const onStepTwoSubmit = async (data: StepTwoForm) => {
    if (selectedSpecs.length === 0) {
      setFormError("Выберите хотя бы одну специализацию");
      return;
    }
    if (selectedApproaches.length === 0) {
      setFormError("Выберите хотя бы один подход");
      return;
    }
    setFormError(null);
    setLoading(true);
    try {
      await registerUser({
        email: stepOneData!.email,
        password: stepOneData!.password,
        firstName: stepOneData!.firstName,
        role: "SPECIALIST",
      });
      setCurrentStep(3);
      setSuccess(true);
    } catch {
      setFormError(authError || "Ошибка регистрации. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success-100">
          <CheckCircle2 className="h-10 w-10 text-success-600" />
        </div>
        <h1 className="text-heading-2 text-neutral-900">{"Заявка отправлена!"}</h1>
        <p className="mt-4 text-body-md text-neutral-600">
          {"Мы получили вашу заявку на регистрацию. Проверьте почту — мы отправили письмо с подтверждением на "}
          <span className="font-medium">{stepOneData?.email}</span>.
        </p>
        <p className="mt-3 text-body-sm text-neutral-500">
          {"После подтверждения email наша команда проверит ваш профиль в течение 24 часов и свяжется с вами."}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/auth/login">{"Войти в аккаунт"}</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/">{"На главную"}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-container px-4 py-8 md:px-8 md:py-16">
      <div className="mb-8">
        <Link
          href="/for-specialists"
          className="inline-flex items-center gap-2 text-body-sm text-neutral-600 hover:text-primary-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {"Вернуться на страницу для специалистов"}
        </Link>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-display-lg text-primary-900">
          {"Регистрация специалиста"}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-body-lg text-neutral-700">
          {"Заполните форму — и ваш профиль появится в системе подбора. Первые клиенты обычно приходят в течение недели."}
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center mb-12">
        {stepsMeta.map(({ step }, idx) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-btn-sm font-bold ${
                step <= currentStep
                  ? "bg-primary-600 text-white"
                  : "bg-neutral-200 text-neutral-500"
              }`}
            >
              {step < currentStep ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                step
              )}
            </div>
            {idx < stepsMeta.length - 1 && (
              <div
                className={`mx-2 h-0.5 w-16 md:w-24 ${
                  step < currentStep ? "bg-primary-500" : "bg-neutral-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step labels */}
      <div className="grid grid-cols-3 gap-4 mb-12 text-center">
        {stepsMeta.map(({ step, title, description }) => (
          <div key={step}>
            <p className={`text-body-sm font-medium ${step <= currentStep ? "text-primary-700" : "text-neutral-400"}`}>
              {title}
            </p>
            <p className="text-caption text-neutral-500 hidden sm:block">{description}</p>
          </div>
        ))}
      </div>

      {/* Step 1: Basic info */}
      {currentStep === 1 && (
        <div className="mx-auto max-w-lg rounded-xl border border-neutral-300 bg-white p-8 shadow-card">
          <h2 className="text-heading-4 text-neutral-900 mb-6">
            {"Шаг 1: Основная информация"}
          </h2>

          <form onSubmit={stepOne.handleSubmit(onStepOneSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-body-sm font-medium text-neutral-700 mb-1">
                  {"Имя"}
                </label>
                <Input
                  id="firstName"
                  placeholder="Иван"
                  {...stepOne.register("firstName")}
                  error={stepOne.formState.errors.firstName?.message}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-body-sm font-medium text-neutral-700 mb-1">
                  {"Фамилия"}
                </label>
                <Input
                  id="lastName"
                  placeholder="Петров"
                  {...stepOne.register("lastName")}
                  error={stepOne.formState.errors.lastName?.message}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-body-sm font-medium text-neutral-700 mb-1">
                {"Email"}
              </label>
              <Input
                id="email"
                type="email"
                placeholder="ivan@example.com"
                {...stepOne.register("email")}
                error={stepOne.formState.errors.email?.message}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-body-sm font-medium text-neutral-700 mb-1">
                {"Телефон"}
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (999) 000-00-00"
                {...stepOne.register("phone")}
                error={stepOne.formState.errors.phone?.message}
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-body-sm font-medium text-neutral-700 mb-1">
                {"Город"}
              </label>
              <Input
                id="city"
                placeholder="Москва"
                {...stepOne.register("city")}
                error={stepOne.formState.errors.city?.message}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-body-sm font-medium text-neutral-700 mb-1">
                {"Пароль"}
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Минимум 8 символов"
                {...stepOne.register("password")}
                error={stepOne.formState.errors.password?.message}
              />
            </div>

            <Button type="submit" className="w-full">
              {"Далее"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          <p className="mt-6 text-center text-body-sm text-neutral-600">
            {"Уже есть аккаунт?"}{" "}
            <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-700">
              {"Войти"}
            </Link>
          </p>
        </div>
      )}

      {/* Step 2: Professional info */}
      {currentStep === 2 && (
        <div className="mx-auto max-w-2xl rounded-xl border border-neutral-300 bg-white p-8 shadow-card">
          <h2 className="text-heading-4 text-neutral-900 mb-6">
            {"Шаг 2: Профессиональный профиль"}
          </h2>

          <form onSubmit={stepTwo.handleSubmit(onStepTwoSubmit)} className="space-y-6">
            {(formError || authError) && (
              <div className="rounded-lg bg-error-50 border border-error-200 px-4 py-3 text-body-sm text-error-700">
                {formError || authError}
              </div>
            )}

            {/* Type */}
            <div>
              <label className="block text-body-sm font-medium text-neutral-700 mb-2">
                {"Тип специалиста"}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["PSYCHOLOGIST", "COACH", "PSYCHOTHERAPIST"] as const).map((t) => {
                  const labels = {
                    PSYCHOLOGIST: "Психолог",
                    COACH: "Коуч",
                    PSYCHOTHERAPIST: "Психотерапевт",
                  };
                  const val = stepTwo.watch("type");
                  return (
                    <label
                      key={t}
                      className={`flex cursor-pointer items-center justify-center rounded-lg border p-3 text-body-sm font-medium transition-all ${
                        val === t
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-neutral-300 text-neutral-700 hover:border-primary-300"
                      }`}
                    >
                      <input
                        type="radio"
                        value={t}
                        {...stepTwo.register("type")}
                        className="sr-only"
                      />
                      {labels[t]}
                    </label>
                  );
                })}
              </div>
              {stepTwo.formState.errors.type && (
                <p className="mt-1 text-caption text-error-600">{stepTwo.formState.errors.type.message}</p>
              )}
            </div>

            {/* Specializations */}
            <div>
              <label className="block text-body-sm font-medium text-neutral-700 mb-2">
                {"Специализации"}
                <span className="ml-1 text-neutral-500 font-normal">{"(выберите от 1 до 5)"}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {specializations.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpec(s)}
                    className={`rounded-full px-3 py-1.5 text-caption font-medium transition-all ${
                      selectedSpecs.includes(s)
                        ? "bg-primary-600 text-white"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Approaches */}
            <div>
              <label className="block text-body-sm font-medium text-neutral-700 mb-2">
                {"Подходы"}
                <span className="ml-1 text-neutral-500 font-normal">{"(выберите от 1 до 3)"}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {approaches.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleApproach(a)}
                    className={`rounded-full px-3 py-1.5 text-caption font-medium transition-all ${
                      selectedApproaches.includes(a)
                        ? "bg-secondary-600 text-white"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="experienceYears" className="block text-body-sm font-medium text-neutral-700 mb-1">
                  {"Стаж (лет)"}
                </label>
                <Input
                  id="experienceYears"
                  type="number"
                  placeholder="5"
                  {...stepTwo.register("experienceYears")}
                  error={stepTwo.formState.errors.experienceYears?.message}
                />
              </div>
              <div>
                <label htmlFor="sessionPrice" className="block text-body-sm font-medium text-neutral-700 mb-1">
                  {"Цена сессии (руб)"}
                </label>
                <Input
                  id="sessionPrice"
                  type="number"
                  placeholder="3500"
                  {...stepTwo.register("sessionPrice")}
                  error={stepTwo.formState.errors.sessionPrice?.message}
                />
              </div>
              <div>
                <label htmlFor="sessionDuration" className="block text-body-sm font-medium text-neutral-700 mb-1">
                  {"Длительность (мин)"}
                </label>
                <select
                  id="sessionDuration"
                  {...stepTwo.register("sessionDuration")}
                  className="flex h-10 w-full rounded-md border border-neutral-400 bg-white px-3 py-2 text-body-md text-neutral-950 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                >
                  <option value="30">30 мин</option>
                  <option value="45">45 мин</option>
                  <option value="60">60 мин</option>
                  <option value="90">90 мин</option>
                  <option value="120">120 мин</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-body-sm font-medium text-neutral-700 mb-1">
                {"О себе"}
                <span className="ml-1 text-neutral-500 font-normal">{"(для клиентов, от 50 символов)"}</span>
              </label>
              <textarea
                id="bio"
                rows={4}
                placeholder="Расскажите о вашем опыте, подходе к работе и чем вы можете помочь клиентам..."
                {...stepTwo.register("bio")}
                className="w-full rounded-md border border-neutral-400 bg-white px-3 py-2 text-body-md text-neutral-950 placeholder:text-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
              {stepTwo.formState.errors.bio && (
                <p className="mt-1 text-caption text-error-600">{stepTwo.formState.errors.bio.message}</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentStep(1)}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {"Назад"}
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Отправка..." : "Зарегистрироваться"}
                {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
              </Button>
            </div>

            <p className="text-caption text-neutral-500 text-center">
              {"Нажимая кнопку, вы соглашаетесь с "}
              <Link href="/privacy" className="text-primary-600 hover:underline">{"политикой конфиденциальности"}</Link>
              {" и "}
              <Link href="/terms" className="text-primary-600 hover:underline">{"условиями использования"}</Link>
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
