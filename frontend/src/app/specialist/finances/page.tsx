"use client";

import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, CreditCard } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

interface Booking {
  bookingId: string;
  status: string;
  price?: number;
  slotStart?: string;
  client?: { id: string; firstName?: string; lastName?: string };
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function SpecialistFinancesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { router.push("/auth/login"); return; }
    if (user?.role !== "SPECIALIST") { router.push("/dashboard"); return; }

    Promise.all([
      apiClient.get("/bookings"),
      apiClient.get("/payments"),
    ])
      .then(([bRes, pRes]) => {
        setBookings(bRes.data?.data || []);
        setPayments(pRes.data?.data || pRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading, user, router]);

  if (authLoading || loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  const completedBookings = bookings.filter((b) => b.status === "COMPLETED");
  const totalEarned = completedBookings.reduce((sum, b) => sum + (b.price || 0), 0);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthEarned = completedBookings
    .filter((b) => b.slotStart && new Date(b.slotStart) >= monthStart)
    .reduce((sum, b) => sum + (b.price || 0), 0);

  const pendingBookings = bookings.filter((b) => b.status === "CONFIRMED");
  const pendingAmount = pendingBookings.reduce((sum, b) => sum + (b.price || 0), 0);

  const formatMoney = (n: number) => n > 0 ? `${n.toLocaleString("ru")} ₽` : "0 ₽";

  const stats = [
    { icon: DollarSign, label: "Заработано всего", value: formatMoney(totalEarned), colorClass: "bg-success-100", iconColor: "text-success-600" },
    { icon: TrendingUp, label: "За этот месяц", value: formatMoney(thisMonthEarned), colorClass: "bg-primary-100", iconColor: "text-primary-600" },
    { icon: CreditCard, label: "Предстоит получить", value: formatMoney(pendingAmount), colorClass: "bg-secondary-100", iconColor: "text-secondary-600" },
  ];

  return (
    <div className="mx-auto max-w-container px-4 py-8 md:px-8">
      <h1 className="text-heading-2 text-neutral-900 mb-8">Финансы</h1>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {stats.map(({ icon: Icon, label, value, colorClass, iconColor }) => (
          <div key={label} className="rounded-xl border border-neutral-300 bg-white p-6 shadow-card">
            <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${colorClass}`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <p className="text-heading-4 text-neutral-900 font-bold">{value}</p>
            <p className="text-body-sm text-neutral-600">{label}</p>
          </div>
        ))}
      </div>

      {completedBookings.length > 0 ? (
        <div className="rounded-xl border border-neutral-300 bg-white p-6">
          <h2 className="text-heading-5 text-neutral-900 mb-4">История завершённых сессий</h2>
          <div className="space-y-3">
            {completedBookings.slice(0, 20).map((b) => {
              const date = b.slotStart ? new Date(b.slotStart).toLocaleDateString("ru", {
                day: "numeric", month: "short", year: "numeric",
              }) : "—";
              return (
                <div key={b.bookingId} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                  <div>
                    <p className="text-body-sm text-neutral-900">{date}</p>
                    {b.client && (
                      <p className="text-caption text-neutral-500">
                        {b.client.firstName} {b.client.lastName || ""}
                      </p>
                    )}
                  </div>
                  <span className="text-body-sm font-medium text-success-700">
                    {b.price ? `+${b.price.toLocaleString("ru")} ₽` : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-300 bg-neutral-50 p-8 text-center">
          <p className="text-body-lg text-neutral-700 mb-2">История транзакций</p>
          <p className="text-body-sm text-neutral-600">
            Здесь появятся данные после завершения первой сессии
          </p>
        </div>
      )}
    </div>
  );
}
