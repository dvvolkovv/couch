"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

interface Booking {
  bookingId: string;
  status: string;
  slotStart?: string;
  slotEnd?: string;
  specialist?: {
    id: string;
    firstName: string;
    lastName?: string;
    type?: string;
    avatarUrl?: string;
  };
  price?: number;
  format?: string;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING_PAYMENT: { label: "Ожидает оплаты", color: "bg-warning-100 text-warning-700" },
  CONFIRMED: { label: "Подтверждено", color: "bg-success-100 text-success-700" },
  COMPLETED: { label: "Завершено", color: "bg-neutral-100 text-neutral-600" },
  CANCELLED_CLIENT: { label: "Отменено вами", color: "bg-error-100 text-error-700" },
  CANCELLED_SPECIALIST: { label: "Отменено специалистом", color: "bg-error-100 text-error-700" },
  CANCELLED_ADMIN: { label: "Отменено", color: "bg-error-100 text-error-700" },
};

const TAB_FILTERS: Record<string, string[]> = {
  upcoming: ["PENDING_PAYMENT", "CONFIRMED"],
  completed: ["COMPLETED"],
  cancelled: ["CANCELLED_CLIENT", "CANCELLED_SPECIALIST", "CANCELLED_ADMIN"],
};

export default function SessionsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { router.push("/auth/login?redirect=/dashboard/sessions"); return; }

    apiClient.get("/bookings")
      .then(({ data }) => setBookings(data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  const filtered = bookings.filter((b) => TAB_FILTERS[tab].includes(b.status));

  return (
    <div className="mx-auto max-w-container px-4 py-8 md:px-8">
      <h1 className="text-heading-2 text-neutral-900 mb-6">Мои сессии</h1>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-neutral-100 p-1 mb-6 w-fit">
        {(["upcoming", "completed", "cancelled"] as const).map((t) => {
          const labels = { upcoming: "Предстоящие", completed: "Завершённые", cancelled: "Отменённые" };
          const count = bookings.filter((b) => TAB_FILTERS[t].includes(b.status)).length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-body-sm font-medium transition-all ${
                tab === t ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {labels[t]} {count > 0 && <span className="ml-1 text-caption text-neutral-500">({count})</span>}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 mb-6">
            <Calendar className="h-10 w-10 text-neutral-400" />
          </div>
          <h2 className="text-heading-4 text-neutral-900 mb-2">
            {tab === "upcoming" ? "Нет предстоящих сессий" : tab === "completed" ? "Нет завершённых сессий" : "Нет отменённых сессий"}
          </h2>
          {tab === "upcoming" && (
            <>
              <p className="text-body-md text-neutral-600 mb-8 max-w-sm">
                Найдите подходящего специалиста и запишитесь на первую сессию
              </p>
              <Button asChild>
                <Link href="/catalog">Перейти в каталог</Link>
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => {
            const statusInfo = STATUS_LABEL[b.status] || { label: b.status, color: "bg-neutral-100 text-neutral-600" };
            const start = b.slotStart ? new Date(b.slotStart) : null;
            return (
              <div key={b.bookingId} className="rounded-xl border border-neutral-300 bg-white p-5 shadow-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 shrink-0">
                      {b.specialist?.avatarUrl ? (
                        <img src={b.specialist.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
                      ) : (
                        <span className="text-body-md font-semibold text-primary-600">
                          {b.specialist?.firstName?.[0] || "?"}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-body-md font-semibold text-neutral-900">
                        {b.specialist
                          ? `${b.specialist.firstName} ${b.specialist.lastName || ""}`.trim()
                          : "Специалист"}
                      </p>
                      {b.specialist?.type && (
                        <p className="text-caption text-neutral-500">{b.specialist.type}</p>
                      )}
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-caption font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>

                {start && (
                  <div className="mt-3 flex items-center gap-2 text-body-sm text-neutral-600">
                    <Clock className="h-4 w-4" />
                    {start.toLocaleString("ru", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}

                {b.price && (
                  <p className="mt-2 text-body-sm text-neutral-500">
                    {b.price.toLocaleString("ru")} ₽
                    {b.format && ` · ${b.format === "online" ? "Онлайн" : "Офлайн"}`}
                  </p>
                )}

                {b.status === "PENDING_PAYMENT" && (
                  <div className="mt-3">
                    <Button size="sm" className="w-full sm:w-auto">
                      Оплатить сессию
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
