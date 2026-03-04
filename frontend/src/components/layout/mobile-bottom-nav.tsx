"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  MessageCircle,
  Calendar,
  User,
  LayoutDashboard,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const clientTabs = [
  { href: "/dashboard", icon: Home, label: "Главная" },
  { href: "/catalog", icon: Search, label: "Каталог" },
  { href: "/dashboard/messages", icon: MessageCircle, label: "Чат" },
  { href: "/dashboard/sessions", icon: Calendar, label: "Сессии" },
  { href: "/profile", icon: User, label: "Профиль" },
];

const specialistTabs = [
  { href: "/specialist/dashboard", icon: LayoutDashboard, label: "Дашборд" },
  { href: "/specialist/schedule", icon: Calendar, label: "Расписание" },
  { href: "/specialist/clients", icon: Users, label: "Клиенты" },
  { href: "/specialist/finances", icon: Wallet, label: "Доход" },
  { href: "/specialist/profile", icon: User, label: "Профиль" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return null;

  const tabs = user?.role === "SPECIALIST" ? specialistTabs : clientTabs;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-300 bg-white md:hidden"
      aria-label="Нижняя навигация"
    >
      <div className="flex items-center justify-around py-2 px-1 safe-area-pb">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-md transition-colors min-w-[56px]",
                isActive
                  ? "text-primary-600"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
