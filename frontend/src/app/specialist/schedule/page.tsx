"use client";

import { useEffect, useState, useCallback } from "react";
import { Calendar, Clock, Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";

const daysOfWeek = [
  { key: 1, label: "Пн" },
  { key: 2, label: "Вт" },
  { key: 3, label: "Ср" },
  { key: 4, label: "Чт" },
  { key: 5, label: "Пт" },
  { key: 6, label: "Сб" },
  { key: 7, label: "Вс" },
];

const timeOptions = [
  "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
  "19:00", "20:00", "21:00", "22:00",
];

interface SlotRange {
  id: string;
  from: string;
  to: string;
}

type Schedule = Record<number, { enabled: boolean; slots: SlotRange[] }>;

function buildDefault(): Schedule {
  const s: Schedule = {};
  for (const d of daysOfWeek) {
    s[d.key] = { enabled: d.key <= 5, slots: [{ id: String(d.key), from: "10:00", to: "19:00" }] };
  }
  return s;
}

export default function SpecialistSchedulePage() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const [schedule, setSchedule] = useState<Schedule>(buildDefault());
  const [dataLoading, setDataLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const loadSchedule = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/schedule/me");
      const raw = data?.data || data;
      const recurring: { dayOfWeek: number; startTime: string; endTime: string }[] =
        raw?.recurringSlots || [];

      if (recurring.length === 0) {
        setDataLoading(false);
        return;
      }

      const built: Schedule = {};
      for (const d of daysOfWeek) {
        built[d.key] = { enabled: false, slots: [] };
      }

      recurring.forEach((s, i) => {
        const day = s.dayOfWeek;
        if (!built[day]) built[day] = { enabled: false, slots: [] };
        built[day].enabled = true;
        built[day].slots.push({ id: `${day}-${i}`, from: s.startTime, to: s.endTime });
      });

      setSchedule(built);
    } catch {
      // keep default on error
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) loadSchedule();
    else if (!isLoading) setDataLoading(false);
  }, [isAuthenticated, isLoading, loadSchedule]);

  if (isLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <Calendar className="mx-auto h-16 w-16 text-neutral-300 mb-6" />
        <h1 className="text-heading-3 text-neutral-900 mb-3">Войдите в аккаунт</h1>
        <Button asChild><Link href="/auth/login">Войти</Link></Button>
      </div>
    );
  }

  if (user?.role !== "SPECIALIST") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-body-md text-neutral-600">Раздел доступен только специалистам</p>
      </div>
    );
  }

  const toggleDay = (day: number) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
        slots:
          !prev[day].enabled && prev[day].slots.length === 0
            ? [{ id: Date.now().toString(), from: "10:00", to: "19:00" }]
            : prev[day].slots,
      },
    }));
  };

  const addSlot = (day: number) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, { id: Date.now().toString(), from: "10:00", to: "18:00" }],
      },
    }));
  };

  const removeSlot = (day: number, id: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], slots: prev[day].slots.filter((s) => s.id !== id) },
    }));
  };

  const updateSlot = (day: number, id: string, field: "from" | "to", value: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const recurringSlots: { dayOfWeek: number; startTime: string; endTime: string }[] = [];
      for (const d of daysOfWeek) {
        const day = schedule[d.key];
        if (day?.enabled) {
          for (const slot of day.slots) {
            recurringSlots.push({ dayOfWeek: d.key, startTime: slot.from, endTime: slot.to });
          }
        }
      }
      await apiClient.put("/schedule/me", { recurringSlots });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Не удалось сохранить расписание. Попробуйте ещё раз.");
    } finally {
      setSaving(false);
    }
  };

  const workingDays = daysOfWeek.filter((d) => schedule[d.key]?.enabled).length;

  return (
    <div className="mx-auto max-w-container px-4 py-8 md:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-heading-2 text-neutral-900">Расписание</h1>
          <p className="mt-1 text-body-sm text-neutral-600">
            Укажите дни и часы, когда вы принимаете клиентов
          </p>
        </div>
        <span className="hidden sm:block text-body-sm text-neutral-600">
          {workingDays} рабочих дней
        </span>
      </div>

      <div className="max-w-2xl space-y-3">
        {daysOfWeek.map(({ key, label }) => {
          const day = schedule[key];
          return (
            <div
              key={key}
              className={`rounded-xl border p-4 transition-all ${
                day.enabled
                  ? "border-primary-300 bg-white shadow-card"
                  : "border-neutral-200 bg-neutral-50"
              }`}
            >
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => toggleDay(key)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-btn-sm font-bold transition-all shrink-0 ${
                    day.enabled
                      ? "bg-primary-600 text-white"
                      : "bg-neutral-200 text-neutral-500 hover:bg-neutral-300"
                  }`}
                >
                  {label}
                </button>

                {day.enabled ? (
                  <div className="flex-1 space-y-2">
                    {day.slots.map((slot) => (
                      <div key={slot.id} className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-neutral-400 shrink-0" />
                        <select
                          value={slot.from}
                          onChange={(e) => updateSlot(key, slot.id, "from", e.target.value)}
                          className="rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-body-sm text-neutral-900 focus:border-primary-500 focus:outline-none"
                        >
                          {timeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <span className="text-neutral-400">—</span>
                        <select
                          value={slot.to}
                          onChange={(e) => updateSlot(key, slot.id, "to", e.target.value)}
                          className="rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-body-sm text-neutral-900 focus:border-primary-500 focus:outline-none"
                        >
                          {timeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        {day.slots.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSlot(key, slot.id)}
                            className="p-1 text-neutral-400 hover:text-error-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addSlot(key)}
                      className="flex items-center gap-1 text-caption font-medium text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Добавить слот
                    </button>
                  </div>
                ) : (
                  <p className="text-body-sm text-neutral-400">Выходной</p>
                )}
              </div>
            </div>
          );
        })}

        {saved && (
          <div className="rounded-lg bg-success-50 border border-success-200 px-4 py-3 text-body-sm text-success-700">
            Расписание сохранено
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-error-50 border border-error-200 px-4 py-3 text-body-sm text-error-700">
            {error}
          </div>
        )}

        <Button onClick={handleSave} className="w-full" disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Сохранение..." : "Сохранить расписание"}
        </Button>
      </div>
    </div>
  );
}
