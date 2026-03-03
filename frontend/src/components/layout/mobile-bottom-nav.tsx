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
  { href: "/dashboard", icon: Home, label: "\u0413\u043B\u0430\u0432\u043D\u0430\u044F" },
  { href: "/catalog", icon: Search, label: "\u041A\u0430\u0442\u0430\u043B\u043E\u0433" },
  { href: "/dashboard/messages", icon: MessageCircle, label: "\u0427\u0430\u0442" },
  { href: "/dashboard/sessions", icon: Calendar, label: "\u0421\u0435\u0441\u0441\u0438\u0438" },
  { href: "/profile", icon: User, label: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C" },
];

const specialistTabs = [
  { href: "/specialist/dashboard", icon: LayoutDashboard, label: "\u0414\u0430\u0448\u0431\u043E\u0440\u0434" },
  { href: "/specialist/schedule", icon: Calendar, label: "\u0420\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435" },
  { href: "/specialist/clients", icon: Users, label: "\u041A\u043B\u0438\u0435\u043D\u0442\u044B" },
  { href: "/specialist/finances", icon: Wallet, label: "\u0414\u043E\u0445\u043E\u0434" },
  { href: "/specialist/profile", icon: User, label: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return null;

  const tabs = user?.role === "SPECIALIST" ? specialistTabs : clientTabs;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-300 bg-white md:hidden"
      aria-label="\u041D\u0438\u0436\u043D\u044F\u044F \u043D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F"
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
