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

const siteUrl = "https://soulmate.ru";

export const metadata: Metadata = {
  title: {
    default: "SoulMate — Подбор психолога по ценностям",
    template: "%s | SoulMate",
  },
  description:
    "Найдите психолога или коуча по совпадению ценностей с помощью ИИ-консультанта. Бесплатная AI-консультация за 15 минут.",
  keywords: [
    "психолог онлайн",
    "коуч",
    "психотерапевт",
    "подбор психолога",
    "ИИ матчинг",
    "онлайн психология",
    "SoulMate",
  ],
  authors: [{ name: "SoulMate" }],
  creator: "SoulMate",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: siteUrl,
    siteName: "SoulMate",
    title: "SoulMate — Подбор психолога по ценностям",
    description:
      "Найдите психолога или коуча по совпадению ценностей с помощью ИИ-консультанта. Бесплатная AI-консультация за 15 минут.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SoulMate — Подбор психолога по ценностям",
    description:
      "Найдите психолога или коуча по совпадению ценностей с помощью ИИ-консультанта.",
    creator: "@soulmateapp",
  },
  robots: {
    index: true,
    follow: true,
  },
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
