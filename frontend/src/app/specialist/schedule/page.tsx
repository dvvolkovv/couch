"use client";

import { useState } from "react";
import { Calendar, Clock, Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";

const daysOfWeek = [
  { key: "mon", label: "Пн" },
  { key: "tue", label: "Вт" },
  { key: "wed", label: "Ср" },
  { key: "thu", label: "Чт" },
  { key: "fri", label: "Пт" },
  { key: "sat", label: "Сб" },
  { key: "sun", label: "Вс" },
];

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00",
];

interface SlotRange {
  id: string;
  from: string;
  to: string;
}

type Schedule = Record<string, { enabled: boolean; slots: SlotRange[] }>;

const defaultSchedule: Schedule = {
  mon: { enabled: true, slots: [{ id: "1", from: "09:00", to: "18:00" }] },
  tue: { enabled: true, slots: [{ id: "2", from: "09:00", to: "18:00" }] },
  wed: { enabled: true, slots: [{ id: "3", from: "09:00", to: "18:00" }] },
  thu: { enabled: true, slots: [{ id: "4", from: "09:00", to: "18:00" }] },
  fri: { enabled: true, slots: [{ id: "5", from: "09:00", to: "17:00" }] },
  sat: { enabled: false, slots: [] },
  sun: { enabled: false, slots: [] },
};

export default function SpecialistSchedulePage() {
  const { isAuthenticated } = useAuthStore();
  const [schedule, setSchedule] = useState<Schedule>(defaultSchedule);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <Calendar className="mx-auto h-16 w-16 text-neutral-300 mb-6" />
        <h1 className="text-heading-3 text-neutral-900 mb-3">{"Войдите в аккаунт"}</h1>
        <p className="text-body-md text-neutral-600 mb-6">
          {"Для управления расписанием необходимо авторизоваться"}
        </p>
        <Button asChild>
          <Link href="/auth/login">{"Войти"}</Link>
        </Button>
      </div>
    );
  }

  const toggleDay = (day: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
        slots: !prev[day].enabled && prev[day].slots.length === 0
          ? [{ id: Date.now().toString(), from: "09:00", to: "18:00" }]
          : prev[day].slots,
      },
    }));
  };

  const addSlot = (day: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [
          ...prev[day].slots,
          { id: Date.now().toString(), from: "10:00", to: "14:00" },
        ],
      },
    }));
  };

  const removeSlot = (day: string, slotId: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((s) => s.id !== slotId),
      },
    }));
  };

  const updateSlot = (day: string, slotId: string, field: "from" | "to", value: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map((s) =>
          s.id === slotId ? { ...s, [field]: value } : s
        ),
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const workingDays = Object.entries(schedule).filter(([, v]) => v.enabled).length;
  const totalSlots = Object.values(schedule).reduce(
    (acc, v) => acc + (v.enabled ? v.slots.length : 0),
    0
  );

  return (
    <div className="mx-auto max-w-container px-4 py-8 md:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-heading-2 text-neutral-900">{"Расписание"}</h1>
          <p className="mt-1 text-body-sm text-neutral-600">
            {"Укажите дни и часы, когда вы принимаете клиентов"}
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-body-sm text-neutral-600">
            {`${workingDays} рабочих дней, ${totalSlots} слотов`}
          </p>
        </div>
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
                {/* Day toggle */}
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
                          {timeSlots.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        <span className="text-neutral-400">{"—"}</span>
                        <select
                          value={slot.to}
                          onChange={(e) => updateSlot(key, slot.id, "to", e.target.value)}
                          className="rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-body-sm text-neutral-900 focus:border-primary-500 focus:outline-none"
                        >
                          {timeSlots.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
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
                      {"Добавить слот"}
                    </button>
                  </div>
                ) : (
                  <p className="text-body-sm text-neutral-400">{"Выходной"}</p>
                )}
              </div>
            </div>
          );
        })}

        {saved && (
          <div className="rounded-lg bg-success-50 border border-success-200 px-4 py-3 text-body-sm text-success-700">
            {"Расписание сохранено"}
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
