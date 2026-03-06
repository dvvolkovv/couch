"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Calendar, Star, DollarSign } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/lib/api-client";

interface SpecialistProfile {
  rating: number | null;
  reviewCount: number;
  verification: string;
}

interface Booking {
  bookingId: string;
  status: string;
  clientId?: string;
  client?: { id: string };
  price?: number;
  slotStart?: string;
}

export default function SpecialistDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore();
  const [profile, setProfile] = useState<SpecialistProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { router.push("/auth/login?redirect=/specialist/dashboard"); return; }
    if (user?.role !== "SPECIALIST") { router.push("/dashboard"); return; }

    const fetchData = async () => {
      try {
        const [profRes, bookRes] = await Promise.all([
          apiClient.get("/specialists/me"),
          apiClient.get("/bookings"),
        ]);
        setProfile(profRes.data?.data || profRes.data);
        setBookings(bookRes.data?.data || []);
      } catch {
        // show zeros on error
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, authLoading, user, router]); // eslint-disable-line react-hooks/exhaustive-deps

  const completedBookings = bookings.filter((b) => b.status === "COMPLETED");
  const uniqueClients = new Set(
    bookings.map((b) => b.clientId || b.client?.id).filter(Boolean)
  ).size;
  const income = completedBookings.reduce((sum, b) => sum + (b.price || 0), 0);
  const rating = profile?.rating ? profile.rating.toFixed(1) : "—";
  const isVerified = profile?.verification === "APPROVED";

  const stats = [
    { icon: Users, label: "Клиентов", value: dataLoading ? "…" : String(uniqueClients), colorClass: "bg-primary-100", iconColor: "text-primary-600" },
    { icon: Calendar, label: "Сессий", value: dataLoading ? "…" : String(completedBookings.length), colorClass: "bg-success-100", iconColor: "text-success-600" },
    { icon: Star, label: "Рейтинг", value: dataLoading ? "…" : rating, colorClass: "bg-secondary-100", iconColor: "text-secondary-600" },
    { icon: DollarSign, label: "Доход", value: dataLoading ? "…" : income > 0 ? `${income.toLocaleString("ru")} ₽` : "0 ₽", colorClass: "bg-warning-100", iconColor: "text-warning-600" },
  ];

  if (authLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  const upcomingBookings = bookings.filter((b) =>
    ["CONFIRMED", "PENDING_PAYMENT"].includes(b.status)
  );

  return (
    <div className="mx-auto max-w-container px-4 py-8 md:px-8">
      <h1 className="text-heading-2 text-neutral-900 mb-8">Дашборд</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map(({ icon: Icon, label, value, colorClass, iconColor }) => (
          <div key={label} className="rounded-xl border border-neutral-300 bg-white p-6 shadow-card">
            <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${colorClass}`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <p className="text-heading-3 text-neutral-900 font-bold">{value}</p>
            <p className="text-body-sm text-neutral-600">{label}</p>
          </div>
        ))}
      </div>

      {!isVerified && !dataLoading && (
        <div className="rounded-xl border border-primary-200 bg-primary-50 p-8 text-center mb-6">
          <div className="text-3xl mb-3">🎤</div>
          <p className="text-body-lg text-neutral-900 font-semibold mb-2">Пройдите ИИ-интервью</p>
          <p className="text-body-sm text-neutral-600 mb-4">
            ИИ-интервью поможет создать ваш ценностный портрет для точного подбора клиентов. Займёт 20–40 минут.
          </p>
          <a
            href="/specialist/interview"
            className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-6 py-3 text-body-md font-semibold text-white hover:bg-primary-700 transition-colors"
          >
            Начать интервью
          </a>
        </div>
      )}

      {upcomingBookings.length > 0 && (
        <div className="rounded-xl border border-neutral-300 bg-white p-6 mb-6">
          <h2 className="text-heading-5 text-neutral-900 mb-4">Ближайшие сессии</h2>
          <div className="space-y-3">
            {upcomingBookings.slice(0, 5).map((b) => (
              <div key={b.bookingId} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                <span className="text-body-sm text-neutral-700">
                  {b.slotStart
                    ? new Date(b.slotStart).toLocaleString("ru", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                    : b.bookingId.slice(-8)}
                </span>
                <span className={`text-caption px-2 py-1 rounded-full ${b.status === "CONFIRMED" ? "bg-success-100 text-success-700" : "bg-warning-100 text-warning-700"}`}>
                  {b.status === "CONFIRMED" ? "Подтверждено" : "Ожидает оплаты"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!dataLoading && completedBookings.length === 0 && upcomingBookings.length === 0 && (
        <div className="rounded-xl border border-neutral-300 bg-neutral-50 p-8 text-center">
          <p className="text-body-lg text-neutral-700 mb-2">Пока нет сессий</p>
          <p className="text-body-sm text-neutral-600">Статистика появится после первой консультации</p>
        </div>
      )}
    </div>
  );
}
