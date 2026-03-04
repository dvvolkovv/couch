import type { Metadata } from "next";
import Link from "next/link";
import { User, CreditCard, Settings, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Настройки профиля — Hearty",
};

const sections = [
  {
    href: "/profile/personal",
    icon: User,
    title: "Личные данные",
    description: "Имя, фото, email, телефон",
  },
  {
    href: "/profile/subscription",
    icon: CreditCard,
    title: "Подписка",
    description: "Текущий план и управление подпиской",
  },
];

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-container px-4 py-8 md:px-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
          <Settings className="h-6 w-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-heading-2 text-neutral-900">{"Настройки"}</h1>
          <p className="text-body-sm text-neutral-600">{"Управление аккаунтом"}</p>
        </div>
      </div>

      <div className="max-w-xl space-y-3">
        {sections.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 rounded-xl border border-neutral-300 bg-white p-6 shadow-card hover:shadow-card-hover hover:border-primary-300 transition-all group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 shrink-0">
              <Icon className="h-5 w-5 text-primary-600" />
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
      </div>
    </div>
  );
}
