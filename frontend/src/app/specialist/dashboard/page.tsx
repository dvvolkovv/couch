import type { Metadata } from "next";
import { Users, Calendar, Star, DollarSign } from "lucide-react";

export const metadata: Metadata = {
  title: "Дашборд специалиста — Hearty",
};

const stats = [
  {
    icon: Users,
    label: "Клиентов",
    value: "0",
    colorClass: "bg-primary-100",
    iconColor: "text-primary-600",
  },
  {
    icon: Calendar,
    label: "Сессий",
    value: "0",
    colorClass: "bg-success-100",
    iconColor: "text-success-600",
  },
  {
    icon: Star,
    label: "Рейтинг",
    value: "—",
    colorClass: "bg-secondary-100",
    iconColor: "text-secondary-600",
  },
  {
    icon: DollarSign,
    label: "Доход",
    value: "0 руб",
    colorClass: "bg-warning-100",
    iconColor: "text-warning-600",
  },
];

export default function SpecialistDashboardPage() {
  return (
    <div className="mx-auto max-w-container px-4 py-8 md:px-8">
      <h1 className="text-heading-2 text-neutral-900 mb-8">{"Дашборд"}</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map(({ icon: Icon, label, value, colorClass, iconColor }) => (
          <div
            key={label}
            className="rounded-xl border border-neutral-300 bg-white p-6 shadow-card"
          >
            <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${colorClass}`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <p className="text-heading-3 text-neutral-900 font-bold">{value}</p>
            <p className="text-body-sm text-neutral-600">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-primary-200 bg-primary-50 p-8 text-center mb-6">
        <div className="text-3xl mb-3">🎤</div>
        <p className="text-body-lg text-neutral-900 font-semibold mb-2">
          {"Пройдите ИИ-интервью"}
        </p>
        <p className="text-body-sm text-neutral-600 mb-4">
          {"ИИ-интервью поможет создать ваш ценностный портрет для точного подбора клиентов. Займёт 20–40 минут."}
        </p>
        <a
          href="/specialist/interview"
          className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-6 py-3 text-body-md font-semibold text-white hover:bg-primary-700 transition-colors"
        >
          Начать интервью
        </a>
      </div>

      <div className="rounded-xl border border-neutral-300 bg-neutral-50 p-8 text-center">
        <p className="text-body-lg text-neutral-700 mb-2">
          {"Ваш профиль ещё не активирован"}
        </p>
        <p className="text-body-sm text-neutral-600">
          {"После верификации документов здесь появится статистика и записи клиентов"}
        </p>
      </div>
    </div>
  );
}
