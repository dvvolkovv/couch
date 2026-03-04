import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Подписка — Hearty",
};

export default function ProfileSubscriptionPage() {
  return (
    <div className="mx-auto max-w-container px-4 py-8 md:px-8">
      <div className="mb-8">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-body-sm text-neutral-600 hover:text-primary-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {"Назад к настройкам"}
        </Link>
      </div>

      <h1 className="text-heading-2 text-neutral-900 mb-8">{"Подписка"}</h1>

      <div className="max-w-xl space-y-6">
        {/* Current plan */}
        <div className="rounded-xl border border-neutral-300 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-heading-4 text-neutral-900">{"Текущий план"}</h2>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-body-sm font-medium text-neutral-700">
              {"Бесплатный"}
            </span>
          </div>
          <ul className="space-y-2 mb-6">
            {[
              "1 AI-консультация в месяц",
              "Базовый подбор специалистов (Top-5)",
              "Просмотр каталога",
              "Запись на сессии",
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-body-sm text-neutral-700">
                <CheckCircle2 className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
                {feature}
              </li>
            ))}
          </ul>
          <p className="text-body-sm text-neutral-500">
            {"Обновляется: никогда (бесплатно навсегда)"}
          </p>
        </div>

        {/* Upgrade block */}
        <div className="rounded-xl border-2 border-primary-400 bg-primary-50 p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-heading-4 text-primary-900">{"Premium"}</h2>
            <span className="rounded-full bg-primary-600 px-3 py-1 text-body-sm font-medium text-white">
              {"990 руб/мес"}
            </span>
          </div>
          <ul className="space-y-2 mb-6">
            {[
              "Безлимитные AI-консультации",
              "Расширенный матчинг Top-10",
              "Приоритетная запись к специалистам",
              "Трекер прогресса сессий",
              "Персональный менеджер",
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-body-sm text-neutral-700">
                <CheckCircle2 className="h-4 w-4 text-primary-600 shrink-0 mt-0.5" />
                {feature}
              </li>
            ))}
          </ul>
          <Button className="w-full" asChild>
            <Link href="/premium">
              {"Подключить Premium"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="mt-3 text-center text-body-sm text-neutral-500">
            {"Первые 7 дней бесплатно. Отмена в любой момент."}
          </p>
        </div>
      </div>
    </div>
  );
}
