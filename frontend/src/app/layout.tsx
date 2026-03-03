import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default:
      "SoulMate \u2014 \u041F\u043E\u0434\u0431\u043E\u0440 \u043F\u0441\u0438\u0445\u043E\u043B\u043E\u0433\u0430 \u043F\u043E \u0446\u0435\u043D\u043D\u043E\u0441\u0442\u044F\u043C",
    template:
      "%s | SoulMate",
  },
  description:
    "\u041D\u0430\u0439\u0434\u0438\u0442\u0435 \u043F\u0441\u0438\u0445\u043E\u043B\u043E\u0433\u0430 \u0438\u043B\u0438 \u043A\u043E\u0443\u0447\u0430 \u043F\u043E \u0441\u043E\u0432\u043F\u0430\u0434\u0435\u043D\u0438\u044E \u0446\u0435\u043D\u043D\u043E\u0441\u0442\u0435\u0439 \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E \u0418\u0418-\u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u043D\u0442\u0430",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4F46E5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="min-h-screen bg-neutral-50 font-sans antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <MobileBottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
