"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  Menu,
  X,
  ChevronDown,
  User,
  Heart,
  Settings,
  LogOut,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

const publicNav = [
  { href: "/catalog", label: "Каталог" },
  { href: "/how-it-works", label: "Как это работает" },
  { href: "/for-specialists", label: "Для специалистов" },
];

const clientNav = [
  { href: "/catalog", label: "Каталог" },
  { href: "/dashboard/sessions", label: "Мои сессии" },
  { href: "/dashboard/messages", label: "Сообщения" },
];

const specialistNav = [
  { href: "/specialist/dashboard", label: "Дашборд" },
  { href: "/specialist/schedule", label: "Расписание" },
  { href: "/specialist/clients", label: "Клиенты" },
  { href: "/specialist/messages", label: "Сообщения" },
];

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = !isAuthenticated
    ? publicNav
    : user?.role === "SPECIALIST"
      ? specialistNav
      : clientNav;

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`
    : "";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-300 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-container items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-heading-5 font-bold text-primary-900"
          aria-label="SoulMate - Главная"
        >
          <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <span className="text-white text-btn-sm">SM</span>
          </div>
          <span className="hidden sm:inline">SoulMate</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Основная навигация">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-body-sm font-medium transition-colors hover:text-primary-700",
                pathname === item.href
                  ? "text-primary-700"
                  : "text-neutral-700"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <Link href="/notifications" aria-label="Уведомления">
                <Button variant="ghost" size="icon-sm" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-error-500 text-[10px] font-bold text-white flex items-center justify-center">
                    3
                  </span>
                </Button>
              </Link>

              {/* User menu */}
              <div className="relative hidden md:block">
                <button
                  className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-neutral-200 transition-colors"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <Avatar className="h-8 w-8">
                    {user?.avatarUrl && (
                      <AvatarImage src={user.avatarUrl} alt={user.firstName} />
                    )}
                    <AvatarFallback className="text-caption">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-body-sm font-medium text-neutral-900">
                    {user?.firstName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-neutral-600" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-lg border border-neutral-300 bg-white shadow-lg py-1">
                      {user?.role === "SPECIALIST" ? (
                        <>
                          <MenuLink
                            href="/specialist/profile"
                            icon={<User className="h-4 w-4" />}
                            label="Мой профиль"
                            onClick={() => setUserMenuOpen(false)}
                          />
                          <MenuLink
                            href="/specialist/finances"
                            icon={<CreditCard className="h-4 w-4" />}
                            label="Финансы"
                            onClick={() => setUserMenuOpen(false)}
                          />
                          <MenuLink
                            href="/specialist/subscription"
                            icon={<CreditCard className="h-4 w-4" />}
                            label="Тарифный план"
                            onClick={() => setUserMenuOpen(false)}
                          />
                          <MenuLink
                            href="/specialist/settings"
                            icon={<Settings className="h-4 w-4" />}
                            label="Настройки"
                            onClick={() => setUserMenuOpen(false)}
                          />
                        </>
                      ) : (
                        <>
                          <MenuLink
                            href="/profile/personal"
                            icon={<User className="h-4 w-4" />}
                            label="Мой профиль"
                            onClick={() => setUserMenuOpen(false)}
                          />
                          <MenuLink
                            href="/dashboard/favorites"
                            icon={<Heart className="h-4 w-4" />}
                            label="Избранное"
                            onClick={() => setUserMenuOpen(false)}
                          />
                          <MenuLink
                            href="/profile/subscription"
                            icon={<CreditCard className="h-4 w-4" />}
                            label="Подписка"
                            onClick={() => setUserMenuOpen(false)}
                          />
                          <MenuLink
                            href="/profile"
                            icon={<Settings className="h-4 w-4" />}
                            label="Настройки"
                            onClick={() => setUserMenuOpen(false)}
                          />
                        </>
                      )}
                      <div className="my-1 border-t border-neutral-300" />
                      <button
                        className="flex w-full items-center gap-3 px-4 py-2 text-body-sm text-error-600 hover:bg-error-50 transition-colors"
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        Выйти
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Войти</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/consultation">Начать подбор</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-neutral-200 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-300 bg-white animate-fade-in">
          <nav className="flex flex-col p-4 gap-1" aria-label="Мобильная навигация">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-3 rounded-md text-body-md font-medium transition-colors",
                  pathname === item.href
                    ? "bg-primary-50 text-primary-700"
                    : "text-neutral-700 hover:bg-neutral-200"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <>
                <div className="my-2 border-t border-neutral-300" />
                <Link
                  href="/auth/login"
                  className="px-4 py-3 rounded-md text-body-md font-medium text-neutral-700 hover:bg-neutral-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Войти
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-3 rounded-md text-body-md font-medium text-primary-700 hover:bg-primary-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Зарегистрироваться
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function MenuLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2 text-body-sm text-neutral-700 hover:bg-neutral-200 transition-colors"
      onClick={onClick}
    >
      {icon}
      {label}
    </Link>
  );
}
