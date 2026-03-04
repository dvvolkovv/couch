"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, MessageCircle, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";

interface ConsultationItem {
  conversationId: string;
  type: string;
  status: string;
  startedAt: string;
  completedAt?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/dashboard");
      return;
    }

    const fetchData = async () => {
      try {
        const [consultRes, bookingRes] = await Promise.allSettled([
          apiClient.get("/ai/consultations"),
          apiClient.get("/bookings"),
        ]);
        if (consultRes.status === "fulfilled") {
          const items = consultRes.value.data.data || consultRes.value.data;
          setConsultations(Array.isArray(items) ? items : []);
        }
        if (bookingRes.status === "fulfilled") {
          const items = bookingRes.value.data.data || bookingRes.value.data;
          setBookings(Array.isArray(items) ? items : []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-container px-4 py-8 md:px-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-container px-4 py-8 md:px-8">
      {/* User info */}
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-heading-4">
            {user?.firstName?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-heading-2 text-neutral-900">
            Привет, {user?.firstName || "пользователь"}!
          </h1>
          <p className="text-body-md text-neutral-600">{user?.email}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick actions */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="h-6 w-6 text-primary-600" />
            <h2 className="text-heading-4 text-neutral-900">ИИ-консультация</h2>
          </div>
          <p className="text-body-sm text-neutral-600 mb-4">
            Пройдите ИИ-консультацию для подбора специалиста по ценностям
          </p>
          <Button size="sm" asChild>
            <Link href="/consultation">
              Начать <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-6 w-6 text-primary-600" />
            <h2 className="text-heading-4 text-neutral-900">Каталог</h2>
          </div>
          <p className="text-body-sm text-neutral-600 mb-4">
            Просмотрите каталог верифицированных специалистов
          </p>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/catalog">Открыть каталог</Link>
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-6 w-6 text-primary-600" />
            <h2 className="text-heading-4 text-neutral-900">Мои записи</h2>
          </div>
          <p className="text-body-sm text-neutral-600 mb-4">
            {bookings.length > 0
              ? `У вас ${bookings.length} записей`
              : "У вас пока нет записей"}
          </p>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/bookings">Посмотреть</Link>
          </Button>
        </Card>
      </div>

      {/* Consultation history */}
      {consultations.length > 0 && (
        <div className="mt-8">
          <h2 className="text-heading-3 text-neutral-900 mb-4">История консультаций</h2>
          <div className="space-y-3">
            {consultations.slice(0, 5).map((c) => (
              <div
                key={c.conversationId}
                className="flex items-center justify-between rounded-lg border border-neutral-300 bg-white px-4 py-3"
              >
                <div>
                  <p className="text-body-sm font-medium text-neutral-900">
                    {c.type === "CLIENT_CONSULTATION" ? "Консультация клиента" : "Интервью специалиста"}
                  </p>
                  <p className="text-caption text-neutral-500">
                    {formatDate(c.startedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-caption font-medium ${
                    c.status === "COMPLETED" ? "text-success-600" : "text-warning-600"
                  }`}>
                    {c.status === "COMPLETED" ? "Завершена" : "Активна"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
