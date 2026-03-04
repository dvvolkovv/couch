"use client";

import { useState } from "react";
import { Settings, Bell, Shield, LogOut, Eye, Clock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";

function Toggle({ checked, onChange, label, description }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer">
      <div>
        <p className="text-body-sm font-medium text-neutral-900">{label}</p>
        {description && <p className="text-caption text-neutral-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-primary-600" : "bg-neutral-300"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5 ${
            checked ? "translate-x-5 ml-0.5" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}

export default function SpecialistSettingsPage() {
  const { isAuthenticated } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [emailNewClients, setEmailNewClients] = useState(true);
  const [emailBookings, setEmailBookings] = useState(true);
  const [emailMessages, setEmailMessages] = useState(true);
  const [emailMarketing, setEmailMarketing] = useState(false);
  const [pushNewClients, setPushNewClients] = useState(true);
  const [pushBookings, setPushBookings] = useState(true);
  const [pushMessages, setPushMessages] = useState(true);

  const [profileVisible, setProfileVisible] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [autoAcceptBookings, setAutoAcceptBookings] = useState(false);
  const [bookingBuffer, setBookingBuffer] = useState("15");

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <Settings className="mx-auto h-16 w-16 text-neutral-300 mb-6" />
        <h1 className="text-heading-3 text-neutral-900 mb-3">{"Войдите в аккаунт"}</h1>
        <p className="text-body-md text-neutral-600 mb-6">
          {"Для доступа к настройкам необходимо авторизоваться"}
        </p>
        <Button asChild>
          <Link href="/auth/login">{"Войти"}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-container px-4 py-8 md:px-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
          <Settings className="h-6 w-6 text-neutral-600" />
        </div>
        <h1 className="text-heading-2 text-neutral-900">{"Настройки"}</h1>
      </div>

      <div className="max-w-xl space-y-6">
        {/* Notifications */}
        <div className="rounded-xl border border-neutral-300 bg-white p-6 shadow-card space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="h-5 w-5 text-neutral-600" />
            <h2 className="text-heading-5 text-neutral-900">{"Уведомления"}</h2>
          </div>

          <div>
            <p className="text-body-sm font-medium text-neutral-700 mb-3">{"Email-уведомления"}</p>
            <div className="space-y-3">
              <Toggle checked={emailNewClients} onChange={setEmailNewClients} label="Новые клиенты" description="Запросы на консультацию и матчинг" />
              <Toggle checked={emailBookings} onChange={setEmailBookings} label="Записи" description="Бронирование, отмена, перенос" />
              <Toggle checked={emailMessages} onChange={setEmailMessages} label="Сообщения" description="Новые сообщения от клиентов" />
              <Toggle checked={emailMarketing} onChange={setEmailMarketing} label="Новости и акции" description="Обновления платформы и спецпредложения" />
            </div>
          </div>

          <div className="border-t border-neutral-200 pt-4">
            <p className="text-body-sm font-medium text-neutral-700 mb-3">{"Push-уведомления"}</p>
            <div className="space-y-3">
              <Toggle checked={pushNewClients} onChange={setPushNewClients} label="Новые клиенты" />
              <Toggle checked={pushBookings} onChange={setPushBookings} label="Записи и напоминания" />
              <Toggle checked={pushMessages} onChange={setPushMessages} label="Сообщения" />
            </div>
          </div>
        </div>

        {/* Profile visibility */}
        <div className="rounded-xl border border-neutral-300 bg-white p-6 shadow-card space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="h-5 w-5 text-neutral-600" />
            <h2 className="text-heading-5 text-neutral-900">{"Видимость профиля"}</h2>
          </div>
          <div className="space-y-3">
            <Toggle checked={profileVisible} onChange={setProfileVisible} label="Профиль виден в каталоге" description="Отключите, чтобы временно скрыть профиль" />
            <Toggle checked={showOnlineStatus} onChange={setShowOnlineStatus} label="Показывать статус онлайн" description="Клиенты увидят, когда вы в сети" />
          </div>
        </div>

        {/* Booking settings */}
        <div className="rounded-xl border border-neutral-300 bg-white p-6 shadow-card space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-5 w-5 text-neutral-600" />
            <h2 className="text-heading-5 text-neutral-900">{"Настройки записи"}</h2>
          </div>
          <div className="space-y-3">
            <Toggle checked={autoAcceptBookings} onChange={setAutoAcceptBookings} label="Автоматическое подтверждение" description="Записи подтверждаются автоматически без вашего участия" />
            <div>
              <label htmlFor="buffer" className="block text-body-sm font-medium text-neutral-900 mb-1">
                {"Перерыв между сессиями (мин)"}
              </label>
              <Input
                id="buffer"
                type="number"
                value={bookingBuffer}
                onChange={(e) => setBookingBuffer(e.target.value)}
                className="max-w-[120px]"
              />
              <p className="mt-1 text-caption text-neutral-500">{"Минимальный перерыв между записями"}</p>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-xl border border-neutral-300 bg-white p-6 shadow-card space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-5 w-5 text-neutral-600" />
            <h2 className="text-heading-5 text-neutral-900">{"Безопасность"}</h2>
          </div>
          <div className="space-y-3">
            <Button variant="secondary" className="w-full justify-start">
              {"Сменить пароль"}
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              {"Двухфакторная аутентификация"}
            </Button>
          </div>
        </div>

        {saved && (
          <div className="rounded-lg bg-success-50 border border-success-200 px-4 py-3 text-body-sm text-success-700">
            {"Настройки сохранены"}
          </div>
        )}

        <Button onClick={handleSave} className="w-full" disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Сохранение..." : "Сохранить настройки"}
        </Button>

        {/* Danger zone */}
        <div className="rounded-xl border border-error-200 bg-error-50 p-6">
          <h2 className="text-heading-5 text-error-900 mb-2">{"Опасная зона"}</h2>
          <p className="text-body-sm text-error-700 mb-4">
            {"Удаление аккаунта необратимо. Все данные будут удалены."}
          </p>
          <button
            className="flex items-center gap-2 text-body-sm font-medium text-error-600 hover:text-error-700 transition-colors"
            type="button"
          >
            <LogOut className="h-4 w-4" />
            {"Удалить аккаунт"}
          </button>
        </div>
      </div>
    </div>
  );
}
