import type { Metadata } from "next";
import { DollarSign, TrendingUp, CreditCard } from "lucide-react";

export const metadata: Metadata = {
  title: "Финансы — Hearty",
};

const stats = [
  { icon: DollarSign, label: "Заработано всего", value: "0 руб", colorClass: "bg-success-100", iconColor: "text-success-600" },
  { icon: TrendingUp, label: "За этот месяц", value: "0 руб", colorClass: "bg-primary-100", iconColor: "text-primary-600" },
  { icon: CreditCard, label: "Ожидает выплаты", value: "0 руб", colorClass: "bg-secondary-100", iconColor: "text-secondary-600" },
];

export default function SpecialistFinancesPage() {
  return (
    <div className="mx-auto max-w-container px-4 py-8 md:px-8">
      <h1 className="text-heading-2 text-neutral-900 mb-8">{"Финансы"}</h1>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {stats.map(({ icon: Icon, label, value, colorClass, iconColor }) => (
          <div
            key={label}
            className="rounded-xl border border-neutral-300 bg-white p-6 shadow-card"
          >
            <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${colorClass}`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <p className="text-heading-4 text-neutral-900 font-bold">{value}</p>
            <p className="text-body-sm text-neutral-600">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-neutral-300 bg-neutral-50 p-8 text-center">
        <p className="text-body-lg text-neutral-700 mb-2">{"История транзакций"}</p>
        <p className="text-body-sm text-neutral-600">
          {"Здесь будет отображаться история платежей от клиентов и выплат"}
        </p>
      </div>
    </div>
  );
}
