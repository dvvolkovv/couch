"use client";

import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MessageRole } from "@/types";

interface ChatBubbleProps {
  role: MessageRole;
  content: string;
  timestamp?: string;
  isStreaming?: boolean;
}

export function ChatBubble({
  role,
  content,
  timestamp,
  isStreaming,
}: ChatBubbleProps) {
  const isAssistant = role === "assistant";
  const isSystem = role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <div className="rounded-full bg-neutral-200 px-4 py-1.5 text-caption text-neutral-600">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      {isAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-primary shadow-sm">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}

      <div className="max-w-[80%] md:max-w-[70%]">
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-body-md leading-relaxed shadow-chat",
            isAssistant
              ? "rounded-tl-sm bg-white text-neutral-900 border border-neutral-200"
              : "rounded-tr-sm bg-primary-600 text-white"
          )}
        >
          <div className="whitespace-pre-wrap break-words">{content}</div>
          {isStreaming && (
            <span className="inline-flex gap-1 ml-1">
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse-dot" />
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse-dot [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse-dot [animation-delay:0.4s]" />
            </span>
          )}
        </div>
        {timestamp && (
          <p
            className={cn(
              "mt-1 text-[11px] text-neutral-500",
              isAssistant ? "text-left" : "text-right"
            )}
          >
            {timestamp}
          </p>
        )}
      </div>

      {!isAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100">
          <User className="h-4 w-4 text-primary-700" />
        </div>
      )}
    </div>
  );
}
