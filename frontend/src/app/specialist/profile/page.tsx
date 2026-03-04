import type { Metadata } from "next";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Мой профиль — SoulMate",
};

export default function SpecialistProfilePage() {
  return (
    <div className="mx-auto max-w-container px-4 py-8 md:px-8">
      <h1 className="text-heading-2 text-neutral-900 mb-8">{"Мой профиль"}</h1>

      <div className="max-w-lg space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-6 rounded-xl border border-neutral-300 bg-white p-6 shadow-card">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 shrink-0">
            <User className="h-10 w-10 text-primary-400" />
          </div>
          <div>
            <p className="text-body-md font-medium text-neutral-900 mb-2">{"Фото профиля"}</p>
            <Button variant="secondary" size="sm">{"Загрузить фото"}</Button>
          </div>
        </div>

        {/* Form placeholder */}
        <div className="rounded-xl border border-neutral-300 bg-white p-6 shadow-card space-y-4">
          <h2 className="text-heading-5 text-neutral-900">{"Основная информация"}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-body-sm font-medium text-neutral-700 mb-1">{"Имя"}</label>
              <div className="h-10 rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-body-sm text-neutral-400">{"Имя"}</div>
            </div>
            <div>
              <label className="block text-body-sm font-medium text-neutral-700 mb-1">{"Фамилия"}</label>
              <div className="h-10 rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-body-sm text-neutral-400">{"Фамилия"}</div>
            </div>
          </div>
          <div>
            <label className="block text-body-sm font-medium text-neutral-700 mb-1">{"Специализация"}</label>
            <div className="h-10 rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-body-sm text-neutral-400">{"Психолог, коуч..."}</div>
          </div>
          <div>
            <label className="block text-body-sm font-medium text-neutral-700 mb-1">{"О себе"}</label>
            <div className="h-20 rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-body-sm text-neutral-400">{"Описание"}</div>
          </div>

          <div className="rounded-lg bg-neutral-100 p-4 text-body-sm text-neutral-600">
            {"Редактирование профиля находится в разработке"}
          </div>

          <Button className="w-full" disabled>{"Сохранить изменения"}</Button>
        </div>
      </div>
    </div>
  );
}
