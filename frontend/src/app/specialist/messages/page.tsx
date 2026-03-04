import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Сообщения — SoulMate",
};

export default function SpecialistMessagesPage() {
  return (
    <div className="mx-auto max-w-container px-4 py-8 md:px-8">
      <h1 className="text-heading-2 text-neutral-900 mb-8">{"Сообщения"}</h1>

      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 mb-6">
          <MessageCircle className="h-10 w-10 text-neutral-400" />
        </div>
        <h2 className="text-heading-4 text-neutral-900 mb-2">
          {"Нет сообщений"}
        </h2>
        <p className="text-body-md text-neutral-600 max-w-sm">
          {"Здесь будут отображаться ваши переписки с клиентами"}
        </p>
      </div>
    </div>
  );
}
