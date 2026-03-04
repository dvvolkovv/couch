"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/lib/api-client";
import { formatDate, formatTime, formatPrice } from "@/lib/utils";
import type { Booking } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Ожидает оплаты",
  CONFIRMED: "Подтверждена",
  IN_PROGRESS: "В процессе",
  COMPLETED: "Завершена",
  CANCELLED_CLIENT: "Отменена",
  CANCELLED_SPECIALIST: "Отменена специалистом",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: "bg-warning-100 text-warning-700",
  CONFIRMED: "bg-success-100 text-success-700",
  IN_PROGRESS: "bg-primary-100 text-primary-700",
  COMPLETED: "bg-neutral-100 text-neutral-700",
  CANCELLED_CLIENT: "bg-error-100 text-error-700",
  CANCELLED_SPECIALIST: "bg-error-100 text-error-700",
};

export default function BookingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/bookings");
      return;
    }

    const fetchBookings = async () => {
      try {
        const { data } = await apiClient.get("/bookings");
        const items = data.data || data;
        setBookings(Array.isArray(items) ? items : []);
      } catch {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [isAuthenticated, authLoading, router]);

  const handleCancel = async (bookingId: string) => {
    try {
      await apiClient.patch(`/bookings/${bookingId}/cancel`, { reason: "client_request" });
      setBookings((prev) =>
        prev.map((b) =>
          b.bookingId === bookingId ? { ...b, status: "CANCELLED_CLIENT", canCancel: false } : b
        )
      );
    } catch {
      // ignore
    }
  };

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-container px-4 py-8 md:px-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-container px-4 py-8 md:px-8">
      <h1 className="text-heading-1 text-neutral-900 mb-8">Мои записи</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-4 text-heading-4 text-neutral-900">Записей пока нет</h3>
          <p className="mt-2 text-body-sm text-neutral-600">
            Пройдите ИИ-консультацию и запишитесь к подходящему специалисту
          </p>
          <Button className="mt-6" asChild>
            <Link href="/consultation">Начать консультацию</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.bookingId} className="p-4 md:p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {booking.specialist.firstName[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-heading-5 text-neutral-900">
                        {booking.specialist.firstName} {booking.specialist.lastName}
                      </h3>
                      <Badge className={STATUS_COLORS[booking.status] || "bg-neutral-100"}>
                        {STATUS_LABELS[booking.status] || booking.status}
                      </Badge>
                    </div>
                    <span className="text-heading-5 font-bold text-neutral-900">
                      {formatPrice(booking.price)}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-body-sm text-neutral-600">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {formatDate(booking.slotStart)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {formatTime(booking.slotStart)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Video className="h-4 w-4" />
                      {booking.format === "online" ? "Онлайн" : "Офлайн"}
                    </span>
                  </div>

                  {booking.videoLink && booking.status === "CONFIRMED" && (
                    <a
                      href={booking.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-body-sm text-primary-600 hover:text-primary-700"
                    >
                      Ссылка на сессию
                    </a>
                  )}

                  {booking.canCancel && (
                    <div className="mt-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCancel(booking.bookingId)}
                      >
                        <X className="mr-1 h-3 w-3" />
                        Отменить
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
