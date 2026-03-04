"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { formatPrice } from "@/lib/utils";

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

interface DaySlots {
  date: string;
  times: TimeSlot[];
}

interface SlotData {
  specialistId: string;
  timezone: string;
  slots: DaySlots[];
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [slotData, setSlotData] = useState<SlotData | null>(null);
  const [specialist, setSpecialist] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [format, setFormat] = useState<"online" | "offline">("online");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/catalog/${params.id}/book`);
      return;
    }

    const fetchData = async () => {
      try {
        const [specRes, slotsRes] = await Promise.all([
          apiClient.get(`/specialists/${params.id}`),
          apiClient.get(`/bookings/slots/${params.id}`),
        ]);
        setSpecialist(specRes.data.data || specRes.data);
        setSlotData(slotsRes.data.data || slotsRes.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id, isAuthenticated, authLoading, router]);

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) return;
    setBooking(true);
    try {
      const slotStart = `${selectedDate}T${selectedTime}:00`;
      const { data } = await apiClient.post("/bookings", {
        specialistId: params.id,
        slotStart,
        format,
      });
      setBookingResult(data.data || data);
      setSuccess(true);
    } catch {
      // show error
    } finally {
      setBooking(false);
    }
  };

  const selectedDaySlots = slotData?.slots.find((d) => d.date === selectedDate);

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return new Intl.DateTimeFormat("ru-RU", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(date);
  };

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-container px-4 py-8 md:px-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (success && bookingResult) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-success-500" />
        <h1 className="mt-6 text-heading-2 text-neutral-900">Запись создана!</h1>
        <p className="mt-4 text-body-md text-neutral-600">
          Ваша запись к {specialist?.firstName} {specialist?.lastName} оформлена.
        </p>
        <div className="mt-6 rounded-lg bg-neutral-50 p-4 text-left">
          <p className="text-body-sm text-neutral-700">
            <span className="font-medium">Дата:</span> {selectedDate}
          </p>
          <p className="text-body-sm text-neutral-700">
            <span className="font-medium">Время:</span> {selectedTime}
          </p>
          <p className="text-body-sm text-neutral-700">
            <span className="font-medium">Формат:</span> {format === "online" ? "Онлайн" : "Офлайн"}
          </p>
          <p className="text-body-sm text-neutral-700">
            <span className="font-medium">Статус:</span> {bookingResult.status}
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-3">
          <Button asChild>
            <Link href="/bookings">Мои записи</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/dashboard">На главную</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-container px-4 py-8 md:px-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-body-sm text-neutral-600 hover:text-neutral-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад
      </button>

      <h1 className="text-heading-2 text-neutral-900 mb-2">
        Запись к {specialist?.firstName} {specialist?.lastName}
      </h1>
      <p className="text-body-md text-neutral-600 mb-8">
        Выберите удобную дату и время
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Date selection */}
        <div>
          <h2 className="text-heading-4 text-neutral-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-600" />
            Дата
          </h2>
          {slotData && slotData.slots.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {slotData.slots.map((day) => {
                const hasAvailable = day.times.some((t) => t.available);
                return (
                  <button
                    key={day.date}
                    onClick={() => {
                      setSelectedDate(day.date);
                      setSelectedTime(null);
                    }}
                    disabled={!hasAvailable}
                    className={`rounded-lg border p-3 text-center transition-colors ${
                      selectedDate === day.date
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : hasAvailable
                          ? "border-neutral-300 bg-white hover:border-primary-300"
                          : "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed"
                    }`}
                  >
                    <span className="text-body-sm font-medium block">
                      {formatDateLabel(day.date)}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-body-sm text-neutral-500">
              Нет доступных слотов на ближайшие дни
            </p>
          )}

          {/* Time slots */}
          {selectedDate && selectedDaySlots && (
            <div className="mt-6">
              <h3 className="text-heading-5 text-neutral-900 mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary-600" />
                Время
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {selectedDaySlots.times.map((slot) => (
                  <button
                    key={slot.start}
                    onClick={() => setSelectedTime(slot.start)}
                    disabled={!slot.available}
                    className={`rounded-lg border px-3 py-2 text-body-sm transition-colors ${
                      selectedTime === slot.start
                        ? "border-primary-500 bg-primary-50 text-primary-700 font-medium"
                        : slot.available
                          ? "border-neutral-300 bg-white hover:border-primary-300"
                          : "border-neutral-200 bg-neutral-100 text-neutral-400 line-through cursor-not-allowed"
                    }`}
                  >
                    {slot.start} — {slot.end}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking summary */}
        <div>
          <Card className="p-6 sticky top-24">
            <h2 className="text-heading-4 text-neutral-900 mb-4">Детали записи</h2>

            {specialist && (
              <div className="space-y-3 text-body-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Специалист</span>
                  <span className="font-medium text-neutral-900">
                    {specialist.firstName} {specialist.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Стоимость</span>
                  <span className="font-medium text-neutral-900">
                    {formatPrice(specialist.sessionPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Длительность</span>
                  <span className="font-medium text-neutral-900">
                    {specialist.sessionDuration} мин
                  </span>
                </div>
                {selectedDate && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Дата</span>
                    <span className="font-medium text-neutral-900">
                      {formatDateLabel(selectedDate)}
                    </span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Время</span>
                    <span className="font-medium text-neutral-900">{selectedTime}</span>
                  </div>
                )}
              </div>
            )}

            {/* Format selection */}
            <div className="mt-6">
              <p className="text-body-sm font-medium text-neutral-700 mb-2">Формат</p>
              <div className="flex gap-2">
                {(["online", "offline"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-body-sm transition-colors ${
                      format === f
                        ? "border-primary-500 bg-primary-50 text-primary-700 font-medium"
                        : "border-neutral-300 bg-white hover:border-primary-300"
                    }`}
                  >
                    {f === "online" ? "Онлайн" : "Офлайн"}
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full mt-6"
              disabled={!selectedDate || !selectedTime || booking}
              onClick={handleBook}
            >
              {booking ? "Оформление..." : "Записаться"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
