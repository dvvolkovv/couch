"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/lib/api-client";
import type { Notification } from "@/types";

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/notifications");
      return;
    }
    fetchNotifications(1);
  }, [isAuthenticated, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchNotifications = async (p: number) => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(
        `/notifications?page=${p}&limit=20`
      );
      const result = data.data || data;
      if (p === 1) {
        setNotifications(result.data || []);
      } else {
        setNotifications((prev) => [...prev, ...(result.data || [])]);
      }
      setHasMore(result.pagination?.hasMore || false);
      setPage(p);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, readAt: new Date().toISOString() } : n
        )
      );
    } catch {
      // silently ignore
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.patch("/notifications/read-all");
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          readAt: n.readAt || new Date().toISOString(),
        }))
      );
    } catch {
      // silently ignore
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await apiClient.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // silently ignore
    }
  };

  const handleClick = async (n: Notification) => {
    if (!n.readAt) {
      await markAsRead(n.id);
    }
    if (n.entityType === "booking" && n.entityId) {
      router.push("/dashboard/sessions");
    } else if (n.entityType === "message" && n.entityId) {
      router.push("/dashboard/messages");
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return "только что";
    if (diffMin < 60) return `${diffMin} мин назад`;
    if (diffHour < 24) return `${diffHour} ч назад`;
    if (diffDay < 7) return `${diffDay} дн назад`;
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  };

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  if (authLoading || (loading && notifications.length === 0)) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-container px-4 py-8 md:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-heading-2 text-neutral-900">Уведомления</h1>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Прочитать все
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 mb-6">
            <Bell className="h-10 w-10 text-neutral-400" />
          </div>
          <h2 className="text-heading-4 text-neutral-900 mb-2">
            Уведомлений пока нет
          </h2>
          <p className="text-body-md text-neutral-600 max-w-sm">
            Здесь будут появляться уведомления о сессиях, сообщениях и
            обновлениях платформы
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              role="button"
              tabIndex={0}
              onClick={() => handleClick(n)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClick(n);
                }
              }}
              className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                n.readAt
                  ? "border-neutral-200 bg-white hover:bg-neutral-50"
                  : "border-primary-200 bg-primary-50/50 hover:bg-primary-50"
              }`}
            >
              <div
                className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                  n.readAt ? "bg-transparent" : "bg-primary-600"
                }`}
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-body-md font-medium text-neutral-900">
                    {n.title}
                  </h3>
                  <span className="text-caption text-neutral-500 shrink-0">
                    {formatTimeAgo(n.createdAt)}
                  </span>
                </div>
                <p className="text-body-sm text-neutral-600 mt-1">{n.body}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(n.id);
                }}
                className="p-1 rounded-md text-neutral-400 hover:text-error-500 hover:bg-error-50 transition-colors shrink-0"
                aria-label="Удалить уведомление"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fetchNotifications(page + 1)}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Загрузить ещё
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
