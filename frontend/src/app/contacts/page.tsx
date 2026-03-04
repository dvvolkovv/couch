import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import {
  Mail,
  Clock,
  MessageSquare,
  ExternalLink,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Контакты — Hearty",
  description:
    "Свяжитесь с командой Hearty. Email поддержки: support@hearty.pro. Ответим в течение 24 часов.",
};

const contacts = [
  {
    icon: Mail,
    title: "Поддержка клиентов",
    value: "support@hearty.pro",
    description: "Вопросы по подбору специалистов, работе сервиса, подписке",
    href: "mailto:support@hearty.pro",
    colorClass: "bg-primary-100",
    iconColor: "text-primary-600",
  },
  {
    icon: Mail,
    title: "Для специалистов",
    value: "specialists@hearty.pro",
    description: "Регистрация, верификация, тарифы и вопросы по работе на платформе",
    href: "mailto:specialists@hearty.pro",
    colorClass: "bg-success-100",
    iconColor: "text-success-600",
  },
  {
    icon: Clock,
    title: "Время работы",
    value: "Пн–Пт, 10:00–18:00 МСК",
    description: "Мы отвечаем в рабочие дни. На письма в выходные отвечаем в понедельник",
    colorClass: "bg-secondary-100",
    iconColor: "text-secondary-600",
  },
];

const socials = [
  { name: "Telegram", handle: "@hearty_pro", href: "https://t.me/hearty_pro" },
  { name: "ВКонтакте", handle: "vk.com/soulmaters", href: "https://vk.com/soulmaters" },
];

export default function ContactsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-hero" aria-labelledby="contacts-hero-heading">
        <div className="mx-auto max-w-container px-4 py-16 md:px-8 md:py-24 text-center">
          <h1
            id="contacts-hero-heading"
            className="text-display-lg md:text-display-xl text-primary-900"
          >
            {"Контакты"}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-body-lg text-neutral-700">
            {"Мы на связи. Ответим на ваш вопрос в течение 24 часов в рабочие дни."}
          </p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="py-16 md:py-20" aria-labelledby="contact-info-heading">
        <div className="mx-auto max-w-container px-4 md:px-8">
          <h2
            id="contact-info-heading"
            className="sr-only"
          >
            {"Контактная информация"}
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            {contacts.map(({ icon: Icon, title, value, description, href, colorClass, iconColor }) => (
              <div
                key={title}
                className="rounded-xl border border-neutral-300 bg-white p-8 shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl ${colorClass}`}>
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <h3 className="text-heading-5 text-neutral-900">{title}</h3>
                {href ? (
                  <a
                    href={href}
                    className="mt-2 block text-body-lg font-semibold text-primary-700 hover:text-primary-800 transition-colors"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="mt-2 text-body-lg font-semibold text-neutral-800">
                    {value}
                  </p>
                )}
                <p className="mt-3 text-body-sm text-neutral-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Response time note */}
      <section
        className="bg-primary-50 py-12 md:py-16"
        aria-labelledby="response-heading"
      >
        <div className="mx-auto max-w-container px-4 md:px-8">
          <div className="rounded-2xl border border-primary-200 bg-white p-8 md:p-12 text-center shadow-card">
            <MessageSquare className="mx-auto h-12 w-12 text-primary-500 mb-4" />
            <h2
              id="response-heading"
              className="text-heading-3 text-neutral-900"
            >
              {"Ответим в течение 24 часов"}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-body-lg text-neutral-700">
              {"Мы читаем каждое письмо и стараемся ответить как можно быстрее. Напишите нам — мы поможем разобраться в любом вопросе."}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-body-sm text-neutral-600 rounded-full bg-neutral-100 px-4 py-2">
              <Clock className="h-4 w-4 text-primary-500" />
              {"Среднее время ответа — 4 часа в рабочее время"}
            </div>
          </div>
        </div>
      </section>

      {/* Social media */}
      <section className="py-16 md:py-20" aria-labelledby="social-heading">
        <div className="mx-auto max-w-container px-4 md:px-8">
          <h2
            id="social-heading"
            className="text-heading-2 text-neutral-900 mb-8"
          >
            {"Мы в социальных сетях"}
          </h2>
          <p className="text-body-lg text-neutral-700 mb-8">
            {"Подписывайтесь, чтобы быть в курсе обновлений, новых специалистов и полезных материалов о психологии и личностном росте."}
          </p>

          <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
            {socials.map(({ name, handle, href }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-neutral-300 bg-white p-6 shadow-card hover:shadow-card-hover hover:border-primary-300 transition-all group"
              >
                <div>
                  <p className="text-heading-5 text-neutral-900 group-hover:text-primary-700 transition-colors">
                    {name}
                  </p>
                  <p className="mt-1 text-body-sm text-neutral-600">{handle}</p>
                </div>
                <ExternalLink className="h-5 w-5 text-neutral-400 group-hover:text-primary-500 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
