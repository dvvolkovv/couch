"use client";

import { useEffect, useState, useCallback } from "react";
import { User, Camera, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/lib/api-client";

const allSpecializations = [
  "Тревога и панические атаки",
  "Депрессия",
  "Отношения и семья",
  "Самооценка и уверенность",
  "Карьера и профориентация",
  "Стресс и выгорание",
  "Зависимости",
  "Потеря и горе",
  "Личностный рост",
  "Психосоматика",
];

const allApproaches = [
  "КПТ (когнитивно-поведенческая терапия)",
  "Психоанализ",
  "Гештальт-терапия",
  "Системная семейная терапия",
  "Экзистенциальная терапия",
  "EMDR",
  "Арт-терапия",
  "Коучинг (ICF)",
  "Телесно-ориентированная терапия",
  "Схема-терапия",
];

export default function SpecialistProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [dataLoading, setDataLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [bio, setBio] = useState("");
  const [sessionPrice, setSessionPrice] = useState("3500");
  const [sessionDuration, setSessionDuration] = useState("60");
  const [experienceYears, setExperienceYears] = useState("1");
  const [education, setEducation] = useState("");
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [selectedApproaches, setSelectedApproaches] = useState<string[]>([]);

  const loadProfile = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/specialists/me");
      const p = data?.data || data;
      if (p) {
        setBio(p.bio || "");
        setSessionPrice(String(p.sessionPrice || 3500));
        setSessionDuration(String(p.sessionDuration || 60));
        setExperienceYears(String(p.experienceYears || 1));
        setEducation(p.education || "");
        setSelectedSpecs(p.specializations || []);
        setSelectedApproaches(p.approaches || []);
      }
    } catch {
      // keep defaults
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) loadProfile();
    else if (!isLoading) setDataLoading(false);
  }, [isAuthenticated, isLoading, loadProfile]);

  const toggleSpec = (s: string) => {
    setSelectedSpecs((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const toggleApproach = (a: string) => {
    setSelectedApproaches((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await apiClient.patch("/specialists/me", {
        bio,
        sessionPrice: Number(sessionPrice),
        sessionDuration: Number(sessionDuration),
        specializations: selectedSpecs,
        approaches: selectedApproaches,
        education,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Не удалось сохранить изменения. Попробуйте ещё раз.");
    } finally {
      setSaving(false);
    }
  };

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
        <User className="mx-auto h-16 w-16 text-neutral-300 mb-6" />
        <h1 className="text-heading-3 text-neutral-900 mb-3">Войдите в аккаунт</h1>
        <Button asChild><Link href="/auth/login">Войти</Link></Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-container px-4 py-8 md:px-8">
      <h1 className="text-heading-2 text-neutral-900 mb-8">Мой профиль</h1>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-6 rounded-xl border border-neutral-300 bg-white p-6 shadow-card">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <User className="h-10 w-10 text-primary-400" />
            )}
            <button
              type="button"
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white shadow-md hover:bg-primary-700 transition-colors"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div>
            <p className="text-body-md font-medium text-neutral-900 mb-1">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-caption text-neutral-500">Фото профиля — JPG, PNG до 5 МБ</p>
          </div>
        </div>

        {/* Профессиональная информация */}
        <div className="rounded-xl border border-neutral-300 bg-white p-6 shadow-card space-y-4">
          <h2 className="text-heading-5 text-neutral-900">Профессиональная информация</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="experienceYears" className="block text-body-sm font-medium text-neutral-700 mb-1">
                Стаж (лет)
              </label>
              <Input
                id="experienceYears"
                type="number"
                min="0"
                max="60"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="sessionPrice" className="block text-body-sm font-medium text-neutral-700 mb-1">
                Цена сессии (руб)
              </label>
              <Input
                id="sessionPrice"
                type="number"
                min="500"
                max="50000"
                value={sessionPrice}
                onChange={(e) => setSessionPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="sessionDuration" className="block text-body-sm font-medium text-neutral-700 mb-1">
                Длительность сессии (мин)
              </label>
              <select
                id="sessionDuration"
                value={sessionDuration}
                onChange={(e) => setSessionDuration(e.target.value)}
                className="w-full rounded-md border border-neutral-400 bg-white px-3 py-2 text-body-md text-neutral-950 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              >
                {[30, 45, 50, 60, 90, 120].map((d) => (
                  <option key={d} value={d}>{d} мин</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="education" className="block text-body-sm font-medium text-neutral-700 mb-1">
                Образование
              </label>
              <Input
                id="education"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="МГУ, факультет психологии, 2015"
              />
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block text-body-sm font-medium text-neutral-700 mb-1">
              О себе
            </label>
            <textarea
              id="bio"
              rows={5}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Расскажите о вашем опыте, подходе к работе и чем вы можете помочь клиентам..."
              className="w-full rounded-md border border-neutral-400 bg-white px-3 py-2 text-body-md text-neutral-950 placeholder:text-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>
        </div>

        {/* Специализации */}
        <div className="rounded-xl border border-neutral-300 bg-white p-6 shadow-card space-y-3">
          <h2 className="text-heading-5 text-neutral-900">Специализации</h2>
          <div className="flex flex-wrap gap-2">
            {allSpecializations.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSpec(s)}
                className={`rounded-full px-3 py-1.5 text-caption font-medium transition-all ${
                  selectedSpecs.includes(s)
                    ? "bg-primary-600 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Подходы */}
        <div className="rounded-xl border border-neutral-300 bg-white p-6 shadow-card space-y-3">
          <h2 className="text-heading-5 text-neutral-900">Подходы</h2>
          <div className="flex flex-wrap gap-2">
            {allApproaches.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleApproach(a)}
                className={`rounded-full px-3 py-1.5 text-caption font-medium transition-all ${
                  selectedApproaches.includes(a)
                    ? "bg-secondary-600 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {saved && (
          <div className="rounded-lg bg-success-50 border border-success-200 px-4 py-3 text-body-sm text-success-700">
            Изменения сохранены
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-error-50 border border-error-200 px-4 py-3 text-body-sm text-error-700">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Сохранение..." : "Сохранить изменения"}
        </Button>
      </form>
    </div>
  );
}
