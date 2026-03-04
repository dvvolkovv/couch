import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Тарифный план — SoulMate",
};

export default function SpecialistSubscriptionPage() {
  return (
    <div className="mx-auto max-w-container px-4 py-8 md:px-8">
      <h1 className="text-heading-2 text-neutral-900 mb-8">{"Тарифный план"}</h1>

      <div className="max-w-xl space-y-6">
        {/* Current plan */}
        <div className="rounded-xl border border-neutral-300 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-heading-4 text-neutral-900">{"Текущий план"}</h2>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-body-sm font-medium text-neutral-700">
              {"Старт — Бесплатно"}
            </span>
          </div>
          <ul className="space-y-2 mb-4">
            {[
              "До 3 клиентов в месяц",
              "Базовый профиль специалиста",
              "Ценностный матчинг",
              "Онлайн-расписание",
              "Поддержка по email",
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-body-sm text-neutral-700">
                <CheckCircle2 className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
                {feature}
              </li>
            ))}
          </ul>
          <p className="text-body-sm text-neutral-500">{"Комиссия: 25% с каждой сессии"}</p>
        </div>

        {/* Upgrade */}
        <div className="rounded-xl border-2 border-primary-400 bg-primary-50 p-6 shadow-card">
          <h2 className="text-heading-4 text-primary-900 mb-2">{"Хотите больше клиентов?"}</h2>
          <p className="text-body-sm text-neutral-700 mb-4">
            {"Перейдите на тариф Профессионал или Бизнес и увеличьте поток клиентов"}
          </p>
          <Button className="w-full" asChild>
            <Link href="/pricing">
              {"Посмотреть все тарифы"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
