"use client";

import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start animate-fade-in">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-primary shadow-sm">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-white border border-neutral-200 px-4 py-3 shadow-chat">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-neutral-400 animate-pulse-dot" />
          <span className="h-2 w-2 rounded-full bg-neutral-400 animate-pulse-dot [animation-delay:0.2s]" />
          <span className="h-2 w-2 rounded-full bg-neutral-400 animate-pulse-dot [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  );
}
