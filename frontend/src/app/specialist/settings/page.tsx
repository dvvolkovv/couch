import type { Metadata } from "next";
import Link from "next/link";
import { Settings, Bell, Shield, LogOut, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Настройки — SoulMate",
};

const settingsSections = [
  {
    icon: Bell,
    title: "Уведомления",
    description: "Email и push-уведомления",
    href: "#",
  },
  {
    icon: Shield,
    title: "Безопасность",
    description: "Пароль и двухфакторная аутентификация",
    href: "#",
  },
];

export default function SpecialistSettingsPage() {
  return (
    <div className="mx-auto max-w-container px-4 py-8 md:px-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
          <Settings className="h-6 w-6 text-neutral-600" />
        </div>
        <h1 className="text-heading-2 text-neutral-900">{"Настройки"}</h1>
      </div>

      <div className="max-w-xl space-y-3">
        {settingsSections.map(({ icon: Icon, title, description, href }) => (
          <Link
            key={title}
            href={href}
            className="flex items-center gap-4 rounded-xl border border-neutral-300 bg-white p-6 shadow-card hover:shadow-card-hover hover:border-primary-300 transition-all group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 shrink-0">
              <Icon className="h-5 w-5 text-neutral-600" />
            </div>
            <div className="flex-1">
              <p className="text-body-md font-medium text-neutral-900 group-hover:text-primary-700 transition-colors">
                {title}
              </p>
              <p className="text-body-sm text-neutral-600">{description}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-neutral-400 group-hover:text-primary-500 transition-colors shrink-0" />
          </Link>
        ))}

        <div className="rounded-xl border border-neutral-300 bg-neutral-50 p-4 text-body-sm text-neutral-600">
          {"Настройки находятся в разработке"}
        </div>

        {/* Danger zone */}
        <div className="rounded-xl border border-error-200 bg-error-50 p-6">
          <h2 className="text-heading-5 text-error-900 mb-2">{"Опасная зона"}</h2>
          <p className="text-body-sm text-error-700 mb-4">
            {"Удаление аккаунта необратимо. Все данные будут удалены."}
          </p>
          <button
            className="flex items-center gap-2 text-body-sm font-medium text-error-600 hover:text-error-700 transition-colors"
            type="button"
          >
            <LogOut className="h-4 w-4" />
            {"Удалить аккаунт"}
          </button>
        </div>
      </div>
    </div>
  );
}
