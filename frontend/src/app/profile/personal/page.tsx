"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, User, Camera, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";

export default function ProfilePersonalPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setCity(user.city || "");
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    // Simulate save — in production this calls apiClient.patch("/users/me", ...)
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (isLoading) {
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
        <h1 className="text-heading-3 text-neutral-900 mb-3">{"Войдите в аккаунт"}</h1>
        <p className="text-body-md text-neutral-600 mb-6">
          {"Для редактирования профиля необходимо авторизоваться"}
        </p>
        <Button asChild>
          <Link href="/auth/login">{"Войти"}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-container px-4 py-8 md:px-8">
      <div className="mb-8">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-body-sm text-neutral-600 hover:text-primary-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {"Назад к настройкам"}
        </Link>
      </div>

      <h1 className="text-heading-2 text-neutral-900 mb-8">{"Личные данные"}</h1>

      <form onSubmit={handleSave} className="max-w-lg space-y-6">
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
            <p className="text-body-md font-medium text-neutral-900 mb-1">{"Фото профиля"}</p>
            <p className="text-caption text-neutral-500">{"JPG, PNG до 5 МБ"}</p>
          </div>
        </div>

        {/* Form fields */}
        <div className="rounded-xl border border-neutral-300 bg-white p-6 shadow-card space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-body-sm font-medium text-neutral-700 mb-1">
                {"Имя"}
              </label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Имя"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-body-sm font-medium text-neutral-700 mb-1">
                {"Фамилия"}
              </label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Фамилия"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-body-sm font-medium text-neutral-700 mb-1">
              {"Email"}
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-body-sm font-medium text-neutral-700 mb-1">
              {"Телефон"}
            </label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 (999) 000-00-00"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-body-sm font-medium text-neutral-700 mb-1">
              {"Город"}
            </label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Москва"
            />
          </div>

          {saved && (
            <div className="rounded-lg bg-success-50 border border-success-200 px-4 py-3 text-body-sm text-success-700">
              {"Изменения сохранены"}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </div>
      </form>
    </div>
  );
}
