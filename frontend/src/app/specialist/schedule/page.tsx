import type { Metadata } from "next";
import { Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Расписание — SoulMate",
};

export default function SpecialistSchedulePage() {
  return (
    <div className="mx-auto max-w-container px-4 py-8 md:px-8">
      <h1 className="text-heading-2 text-neutral-900 mb-8">{"Расписание"}</h1>

      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 mb-6">
          <Calendar className="h-10 w-10 text-neutral-400" />
        </div>
        <h2 className="text-heading-4 text-neutral-900 mb-2">
          {"Расписание пустое"}
        </h2>
        <p className="text-body-md text-neutral-600 max-w-sm">
          {"Управление расписанием будет доступно после верификации вашего профиля"}
        </p>
      </div>
    </div>
  );
}
