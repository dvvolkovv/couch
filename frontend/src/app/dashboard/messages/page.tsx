"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { MessagesView } from "@/components/messages/messages-view";

function MessagesLoading() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
    </div>
  );
}

export default function ClientMessagesPage() {
  return (
    <Suspense fallback={<MessagesLoading />}>
      <MessagesView userRole="CLIENT" />
    </Suspense>
  );
}
