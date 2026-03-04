import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  Lock,
  Zap,
  Heart,
  ArrowRight,
  Users,
  Target,
} from "lucide-react";

export const metadata: Metadata = {
  title: "О нас — Hearty",
  description:
    "Hearty — платформа для подбора психологов и коучей по совпадению ценностей с помощью искусственного интеллекта. Узнайте о нашей миссии и команде.",
};

const values = [
  {
    icon: Lock,
    title: "Конфиденциальность",
    description:
      "Всё, что вы рассказываете ИИ-консультанту, остаётся только между вами и системой. Мы никогда не передаём личные данные без вашего явного согласия.",
    colorClass: "bg-primary-100",
    iconColor: "text-primary-600",
  },
  {
    icon: Zap,
    title: "Эффективность",
    description:
      "Мы убеждены, что правильно подобранный специалист меняет ход терапии. Наша задача — сократить путь к этому специалисту от месяцев до дней.",
    colorClass: "bg-success-100",
    iconColor: "text-success-600",
  },
  {
    icon: Heart,
    title: "Честность",
    description:
      "Мы не скрываем, как работает алгоритм. Процент совпадения ценностей — реальная метрика, а не маркетинговый ход. Мы честны с клиентами и специалистами.",
    colorClass: "bg-secondary-100",
    iconColor: "text-secondary-600",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-hero" aria-labelledby="about-hero-heading">
        <div className="mx-auto max-w-container px-4 py-16 md:px-8 md:py-24 text-center">
          <h1
            id="about-hero-heading"
            className="text-display-lg md:text-display-xl text-primary-900"
          >
            {"О нас"}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-body-lg text-neutral-700">
            {"Hearty создан с одной целью — помочь людям найти специалиста, с которым они действительно смогут работать"}
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-20" aria-labelledby="mission-heading">
        <div className="mx-auto max-w-container px-4 md:px-8">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-2 text-body-sm font-medium text-primary-700">
                <Target className="h-4 w-4" />
                {"Наша миссия"}
              </div>
              <h2
                id="mission-heading"
                className="text-heading-2 text-neutral-900"
              >
                {"Эффективная психологическая помощь — "}
                <span className="gradient-text">{"для каждого"}</span>
              </h2>
              <p className="mt-6 text-body-lg text-neutral-700">
                {"Мы знаем, что найти «своего» психолога — это сложно. Большинство людей пробуют нескольких специалистов, прежде чем найти того, с кем можно работать. Это стоит времени, денег и эмоциональных сил."}
              </p>
              <p className="mt-4 text-body-md text-neutral-700">
                {"Hearty меняет это. Наш ИИ-консультант помогает понять ваш запрос и ценности — а затем находит специалиста, чей подход совпадает именно с вами. Не по рейтингу. Не по цене. По совпадению."}
              </p>
            </div>

            {/* Visual */}
            <div className="flex justify-center">
              <div className="relative w-72 h-72">
                <div className="absolute inset-0 rounded-full bg-primary-100 opacity-60" />
                <div className="absolute inset-8 rounded-full bg-primary-200 opacity-50" />
                <div className="absolute inset-16 rounded-full bg-gradient-warm opacity-40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Users className="mx-auto h-12 w-12 text-primary-600" />
                    <p className="mt-3 text-heading-3 font-bold gradient-text">
                      {"2025"}
                    </p>
                    <p className="text-body-sm text-primary-800 font-medium">
                      {"год основания"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section
        className="bg-primary-50 py-16 md:py-20"
        aria-labelledby="story-heading"
      >
        <div className="mx-auto max-w-container px-4 md:px-8">
          <h2
            id="story-heading"
            className="text-heading-2 text-neutral-900 mb-8"
          >
            {"История"}
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-neutral-300 bg-white p-8 shadow-card">
              <div className="text-heading-3 gradient-text font-bold mb-3">{"2025"}</div>
              <h3 className="text-heading-5 text-neutral-900 mb-3">{"Основание"}</h3>
              <p className="text-body-sm text-neutral-700">
                {"Команда психологов и разработчиков объединилась, чтобы решить проблему подбора специалистов. Первые прототипы алгоритма ценностного матчинга показали результаты, которые нас удивили самих."}
              </p>
            </div>

            <div className="rounded-xl border border-neutral-300 bg-white p-8 shadow-card">
              <div className="text-heading-3 gradient-text font-bold mb-3">{"2025"}</div>
              <h3 className="text-heading-5 text-neutral-900 mb-3">{"Первые клиенты"}</h3>
              <p className="text-body-sm text-neutral-700">
                {"Закрытое бета-тестирование с первыми 50 специалистами и 200 клиентами подтвердило гипотезу: 65% клиентов остаются с первым рекомендованным специалистом."}
              </p>
            </div>

            <div className="rounded-xl border border-neutral-300 bg-white p-8 shadow-card">
              <div className="text-heading-3 gradient-text font-bold mb-3">{"2026"}</div>
              <h3 className="text-heading-5 text-neutral-900 mb-3">{"Открытый запуск"}</h3>
              <p className="text-body-sm text-neutral-700">
                {"Платформа открылась для всех. Сегодня на Hearty работают более 500 верифицированных психологов и коучей, а тысячи клиентов нашли специалиста по совпадению ценностей."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-20" aria-labelledby="values-heading">
        <div className="mx-auto max-w-container px-4 md:px-8">
          <h2
            id="values-heading"
            className="text-center text-heading-2 text-neutral-900"
          >
            {"Наши ценности"}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-body-lg text-neutral-600">
            {"Принципы, которыми мы руководствуемся в разработке продукта и работе с пользователями"}
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {values.map(({ icon: Icon, title, description, colorClass, iconColor }) => (
              <div
                key={title}
                className="rounded-xl border border-neutral-300 bg-white p-8 shadow-card hover:shadow-card-hover transition-shadow text-center"
              >
                <div className={`mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${colorClass}`}>
                  <Icon className={`h-7 w-7 ${iconColor}`} />
                </div>
                <h3 className="text-heading-4 text-neutral-900">{title}</h3>
                <p className="mt-3 text-body-sm text-neutral-700">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team mention */}
      <section
        className="bg-neutral-100 py-16 md:py-20"
        aria-labelledby="team-heading"
      >
        <div className="mx-auto max-w-container px-4 md:px-8 text-center">
          <h2
            id="team-heading"
            className="text-heading-2 text-neutral-900"
          >
            {"Команда"}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-body-lg text-neutral-700">
            {"Над Hearty работает междисциплинарная команда: практикующие психологи, специалисты в области машинного обучения, UX-дизайнеры и разработчики. Мы объединились потому, что каждый из нас лично столкнулся с проблемой поиска «своего» специалиста."}
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-body-md text-neutral-600">
            {"Все наши решения проходят проверку у практикующих психологов в команде. Мы убеждаемся, что алгоритм работает в интересах клиента — а не только по формальным метрикам."}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section
        className="bg-gradient-primary py-16 md:py-20"
        aria-labelledby="about-cta-heading"
      >
        <div className="mx-auto max-w-container px-4 text-center md:px-8">
          <h2 id="about-cta-heading" className="text-heading-2 text-white">
            {"Попробуйте Hearty"}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-body-lg text-primary-100">
            {"Первая AI-консультация бесплатна и занимает 15 минут"}
          </p>
          <div className="mt-8">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary-700 hover:bg-primary-50 border-0"
              asChild
            >
              <Link href="/consultation">
                {"Начать бесплатный подбор"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
