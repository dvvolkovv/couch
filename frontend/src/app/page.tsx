import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { Footer } from "@/components/layout/footer";
import {
  MessageCircle,
  Users,
  CalendarCheck,
  Shield,
  Clock,
  Lock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-hero" aria-labelledby="hero-heading">
        <div className="mx-auto max-w-container px-4 py-16 md:px-8 md:py-24">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h1
                id="hero-heading"
                className="text-display-lg md:text-display-xl text-primary-900"
              >
                {"\u041D\u0430\u0439\u0434\u0438\u0442\u0435 \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0441\u0442\u0430, \u043A\u043E\u0442\u043E\u0440\u044B\u0439 "}
                <span className="gradient-text">
                  {"\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u043E"}
                </span>
                {" \u0432\u0430\u043C \u043F\u043E\u0434\u0445\u043E\u0434\u0438\u0442"}
              </h1>
              <p className="mt-6 text-body-lg text-neutral-700 max-w-lg">
                {"\u0418\u0418-\u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u043D\u0442 \u043F\u043E\u043C\u043E\u0436\u0435\u0442 \u0440\u0430\u0437\u043E\u0431\u0440\u0430\u0442\u044C\u0441\u044F \u0432 \u0432\u0430\u0448\u0435\u043C \u0437\u0430\u043F\u0440\u043E\u0441\u0435 \u0438 \u043F\u043E\u0434\u0431\u0435\u0440\u0451\u0442 \u043F\u0441\u0438\u0445\u043E\u043B\u043E\u0433\u0430 \u0438\u043B\u0438 \u043A\u043E\u0443\u0447\u0430 \u043F\u043E \u0441\u043E\u0432\u043F\u0430\u0434\u0435\u043D\u0438\u044E \u0446\u0435\u043D\u043D\u043E\u0441\u0442\u0435\u0439, \u0430 \u043D\u0435 \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u043E \u0446\u0435\u043D\u0435."}
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button size="lg" className="text-btn-lg" asChild>
                  <Link href="/consultation">
                    {"\u041D\u0430\u0447\u0430\u0442\u044C \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u044B\u0439 \u043F\u043E\u0434\u0431\u043E\u0440"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
              <div className="mt-6 flex items-center gap-6 text-body-sm text-neutral-600">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-primary-500" />
                  {"\u0411\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary-500" />
                  15 {"\u043C\u0438\u043D\u0443\u0442"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-primary-500" />
                  {"\u041A\u043E\u043D\u0444\u0438\u0434\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u043E"}
                </span>
              </div>
            </div>

            {/* Hero illustration placeholder */}
            <div className="hidden md:flex justify-center">
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 rounded-full bg-primary-100 opacity-50" />
                <div className="absolute inset-8 rounded-full bg-primary-200 opacity-40" />
                <div className="absolute inset-16 rounded-full bg-gradient-warm opacity-30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="flex justify-center -space-x-4">
                      <div className="h-16 w-16 rounded-full bg-primary-300 border-4 border-white flex items-center justify-center text-primary-900 font-bold">
                        K
                      </div>
                      <div className="h-16 w-16 rounded-full bg-secondary-300 border-4 border-white flex items-center justify-center text-secondary-900 font-bold">
                        C
                      </div>
                    </div>
                    <p className="mt-4 text-body-sm font-semibold text-primary-800">
                      92% {"\u0441\u043E\u0432\u043F\u0430\u0434\u0435\u043D\u0438\u0435"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        className="py-16 md:py-20"
        aria-labelledby="how-it-works-heading"
      >
        <div className="mx-auto max-w-container px-4 md:px-8">
          <h2
            id="how-it-works-heading"
            className="text-center text-heading-2 text-neutral-900"
          >
            {"\u041A\u0430\u043A \u044D\u0442\u043E \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442"}
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                step: 1,
                icon: MessageCircle,
                title: "\u0420\u0430\u0441\u0441\u043A\u0430\u0436\u0438\u0442\u0435 \u0418\u0418 \u043E \u0441\u0435\u0431\u0435",
                description:
                  "\u0418\u0418-\u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u043D\u0442 \u043F\u0440\u043E\u0432\u0435\u0434\u0451\u0442 15-\u043C\u0438\u043D\u0443\u0442\u043D\u0443\u044E \u0431\u0435\u0441\u0435\u0434\u0443 \u043E \u0432\u0430\u0448\u0435\u043C \u0437\u0430\u043F\u0440\u043E\u0441\u0435 \u0438 \u0446\u0435\u043D\u043D\u043E\u0441\u0442\u044F\u0445.",
              },
              {
                step: 2,
                icon: Users,
                title: "\u041F\u043E\u043B\u0443\u0447\u0438\u0442\u0435 \u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u0438",
                description:
                  "\u041C\u044B \u043F\u043E\u0434\u0431\u0435\u0440\u0451\u043C Top-5 \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0441\u0442\u043E\u0432 \u0441 \u043D\u0430\u0438\u0431\u043E\u043B\u044C\u0448\u0438\u043C \u043F\u0440\u043E\u0446\u0435\u043D\u0442\u043E\u043C \u0441\u043E\u0432\u043F\u0430\u0434\u0435\u043D\u0438\u044F \u0446\u0435\u043D\u043D\u043E\u0441\u0442\u0435\u0439.",
              },
              {
                step: 3,
                icon: CalendarCheck,
                title: "\u0417\u0430\u043F\u0438\u0448\u0438\u0442\u0435\u0441\u044C \u043D\u0430 \u0441\u0435\u0441\u0441\u0438\u044E",
                description:
                  "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0443\u0434\u043E\u0431\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F \u0438 \u0444\u043E\u0440\u043C\u0430\u0442. \u041E\u043F\u043B\u0430\u0442\u0438\u0442\u0435 \u043E\u043D\u043B\u0430\u0439\u043D \u0438 \u043D\u0430\u0447\u043D\u0438\u0442\u0435 \u0440\u0430\u0431\u043E\u0442\u0443.",
              },
            ].map(({ step, icon: Icon, title, description }) => (
              <div
                key={step}
                className="relative rounded-xl border border-neutral-300 bg-white p-8 shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <div className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white text-btn-sm">
                  {step}
                </div>
                <h3 className="text-heading-4 text-neutral-900">{title}</h3>
                <p className="mt-3 text-body-sm text-neutral-700">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value matching section */}
      <section
        className="bg-primary-50 py-16 md:py-20"
        aria-labelledby="value-matching-heading"
      >
        <div className="mx-auto max-w-container px-4 md:px-8">
          <h2
            id="value-matching-heading"
            className="text-center text-heading-2 text-neutral-900"
          >
            {"\u041F\u043E\u0447\u0435\u043C\u0443 \u0441\u043E\u0432\u043F\u0430\u0434\u0435\u043D\u0438\u0435 \u0446\u0435\u043D\u043D\u043E\u0441\u0442\u0435\u0439 \u0432\u0430\u0436\u043D\u043E"}
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {/* Stats placeholder -- would be radar chart illustration in production */}
            <div className="flex items-center justify-center rounded-xl bg-white p-8 shadow-card">
              <div className="text-center">
                <div className="relative mx-auto h-48 w-48">
                  <div className="absolute inset-0 rounded-full border-4 border-primary-200" />
                  <div className="absolute inset-4 rounded-full border-4 border-primary-300" />
                  <div className="absolute inset-8 rounded-full border-4 border-secondary-200" />
                  <div className="absolute inset-12 rounded-full border-4 border-secondary-300" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-display-md gradient-text">92%</span>
                  </div>
                </div>
                <p className="mt-4 text-body-sm text-neutral-600">
                  {"\u041F\u0440\u0438\u043C\u0435\u0440 \u043D\u0430\u043B\u043E\u0436\u0435\u043D\u0438\u044F \u0446\u0435\u043D\u043D\u043E\u0441\u0442\u043D\u044B\u0445 \u043F\u0440\u043E\u0444\u0438\u043B\u0435\u0439"}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success-100">
                  <CheckCircle2 className="h-6 w-6 text-success-600" />
                </div>
                <div>
                  <p className="text-heading-4 text-neutral-900">
                    65% {"\u043A\u043B\u0438\u0435\u043D\u0442\u043E\u0432 \u043E\u0441\u0442\u0430\u044E\u0442\u0441\u044F"}
                  </p>
                  <p className="mt-1 text-body-sm text-neutral-700">
                    {"\u0441 \u043F\u0435\u0440\u0432\u044B\u043C \u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u043E\u0432\u0430\u043D\u043D\u044B\u043C \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0441\u0442\u043E\u043C"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100">
                  <CheckCircle2 className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-heading-4 text-neutral-900">
                    {"\u0412 2 \u0440\u0430\u0437\u0430 \u043C\u0435\u043D\u044C\u0448\u0435 \u043E\u0442\u043A\u0430\u0437\u043E\u0432"}
                  </p>
                  <p className="mt-1 text-body-sm text-neutral-700">
                    {"\u043F\u043E\u0441\u043B\u0435 \u043F\u0435\u0440\u0432\u043E\u0439 \u0441\u0435\u0441\u0441\u0438\u0438 \u043F\u043E \u0441\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u044E \u0441 \u0430\u043D\u043A\u0435\u0442\u043D\u044B\u043C \u043F\u043E\u0434\u0431\u043E\u0440\u043E\u043C"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20" aria-labelledby="testimonials-heading">
        <div className="mx-auto max-w-container px-4 md:px-8">
          <h2
            id="testimonials-heading"
            className="text-center text-heading-2 text-neutral-900"
          >
            {"\u041E\u0442\u0437\u044B\u0432\u044B \u043A\u043B\u0438\u0435\u043D\u0442\u043E\u0432"}
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                rating: 5,
                text: "\u0412\u043F\u0435\u0440\u0432\u044B\u0435 \u043F\u043E\u0447\u0443\u0432\u0441\u0442\u0432\u043E\u0432\u0430\u043B\u0430, \u0447\u0442\u043E \u043C\u0435\u043D\u044F \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u043E \u043F\u043E\u043D\u044F\u043B\u0438",
                author: "\u041C\u0430\u0440\u0438\u043D\u0430, 29",
              },
              {
                rating: 4.5,
                text: "\u0418\u0418-\u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u043D\u0442 \u0437\u0430\u0434\u0430\u043B \u0432\u043E\u043F\u0440\u043E\u0441\u044B, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u044F \u0441\u0430\u043C \u0441\u0435\u0431\u0435 \u043D\u0435 \u0437\u0430\u0434\u0430\u0432\u0430\u043B",
                author: "\u0410\u043B\u0435\u043A\u0441\u0435\u0439, 37",
              },
              {
                rating: 5,
                text: "\u041D\u0430\u0448\u043B\u0430 \u0441\u0432\u043E\u0435\u0433\u043E \u043F\u0441\u0438\u0445\u043E\u043B\u043E\u0433\u0430 \u0441 \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u0440\u0430\u0437\u0430. 92% \u0441\u043E\u0432\u043F\u0430\u0434\u0435\u043D\u0438\u0435 \u2014 \u0438 \u044D\u0442\u043E \u0447\u0443\u0432\u0441\u0442\u0432\u0443\u0435\u0442\u0441\u044F!",
                author: "\u041E\u043B\u044C\u0433\u0430, 34",
              },
            ].map((testimonial, i) => (
              <blockquote
                key={i}
                className="rounded-xl border border-neutral-300 bg-white p-6 shadow-card"
              >
                <StarRating rating={testimonial.rating} size="sm" />
                <p className="mt-4 text-body-md text-neutral-800 italic">
                  &laquo;{testimonial.text}&raquo;
                </p>
                <footer className="mt-4 text-body-sm font-medium text-neutral-600">
                  &mdash; {testimonial.author}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for specialists */}
      <section
        className="bg-gradient-primary py-16 md:py-20"
        aria-labelledby="specialist-cta-heading"
      >
        <div className="mx-auto max-w-container px-4 text-center md:px-8">
          <h2
            id="specialist-cta-heading"
            className="text-heading-2 text-white"
          >
            {"\u0414\u043B\u044F \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0441\u0442\u043E\u0432"}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-body-lg text-primary-100">
            {"\u041F\u043E\u043B\u0443\u0447\u0430\u0439\u0442\u0435 \u043A\u043B\u0438\u0435\u043D\u0442\u043E\u0432, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u043F\u043E\u0434\u0445\u043E\u0434\u044F\u0442 \u0438\u043C\u0435\u043D\u043D\u043E \u0432\u0430\u0448\u0435\u043C\u0443 \u043F\u043E\u0434\u0445\u043E\u0434\u0443"}
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            {[
              "\u0426\u0435\u043D\u043D\u043E\u0441\u0442\u043D\u044B\u0439 \u043C\u0430\u0442\u0447\u0438\u043D\u0433 \u0432\u043C\u0435\u0441\u0442\u043E \u043A\u043E\u043D\u043A\u0443\u0440\u0435\u043D\u0446\u0438\u0438 \u043F\u043E \u0446\u0435\u043D\u0435",
              "\u041A\u043B\u0438\u0435\u043D\u0442\u044B \u043F\u0440\u0438\u0445\u043E\u0434\u044F\u0442 \u0441 \u043F\u0440\u043E\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u043D\u044B\u043C \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u043C",
              "\u0418\u0418 \u0441\u043E\u0437\u0434\u0430\u0451\u0442 \u0432\u0430\u0448 \u0443\u043D\u0438\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u043E\u0440\u0442\u0440\u0435\u0442",
            ].map((point, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-body-sm text-white"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-200" />
                {point}
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary-700 hover:bg-primary-50 border-0"
              asChild
            >
              <Link href="/specialist/register">
                {"\u0417\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u0442\u044C\u0441\u044F \u043A\u0430\u043A \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0441\u0442"}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
