import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, SearchX } from "lucide-react";

export const metadata: Metadata = {
  title: "Страница не найдена — SoulMate",
};

export default function NotFound() {
  return (
    <>
      <section
        className="flex flex-1 items-center justify-center bg-gradient-hero py-24 md:py-32"
        aria-labelledby="not-found-heading"
      >
        <div className="mx-auto max-w-container px-4 text-center md:px-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-100">
            <SearchX className="h-10 w-10 text-primary-600" />
          </div>

          <p className="text-display-lg font-bold gradient-text">{"404"}</p>

          <h1
            id="not-found-heading"
            className="mt-2 text-heading-2 text-neutral-900"
          >
            {"Страница не найдена"}
          </h1>

          <p className="mx-auto mt-4 max-w-md text-body-lg text-neutral-700">
            {"Возможно, страница была перемещена или удалена. Попробуйте вернуться на главную."}
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/">
                {"На главную"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/catalog">{"Каталог специалистов"}</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
