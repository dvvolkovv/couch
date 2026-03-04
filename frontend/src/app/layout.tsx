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

const siteUrl = "https://hearty.pro";

export const metadata: Metadata = {
  title: {
    default: "Hearty — Подбор психолога по ценностям",
    template: "%s | Hearty",
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
    "Hearty",
  ],
  authors: [{ name: "Hearty" }],
  creator: "Hearty",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: siteUrl,
    siteName: "Hearty",
    title: "Hearty — Подбор психолога по ценностям",
    description:
      "Найдите психолога или коуча по совпадению ценностей с помощью ИИ-консультанта. Бесплатная AI-консультация за 15 минут.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hearty — Подбор психолога по ценностям",
    description:
      "Найдите психолога или коуча по совпадению ценностей с помощью ИИ-консультанта.",
    creator: "@hearty_pro",
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
