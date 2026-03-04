import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Избранные специалисты — SoulMate",
};

export default function FavoritesPage() {
  return (
    <div className="mx-auto max-w-container px-4 py-8 md:px-8">
      <h1 className="text-heading-2 text-neutral-900 mb-8">
        {"Избранные специалисты"}
      </h1>

      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 mb-6">
          <Heart className="h-10 w-10 text-neutral-400" />
        </div>
        <h2 className="text-heading-4 text-neutral-900 mb-2">
          {"Вы ещё не добавили специалистов в избранное"}
        </h2>
        <p className="text-body-md text-neutral-600 mb-8 max-w-sm">
          {"Сохраняйте понравившихся специалистов, чтобы легко найти их позже"}
        </p>
        <Button asChild>
          <Link href="/catalog">{"Перейти в каталог"}</Link>
        </Button>
      </div>
    </div>
  );
}
