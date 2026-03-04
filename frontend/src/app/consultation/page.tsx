"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { Send, ArrowLeft, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatBubble } from "@/components/chat/chat-bubble";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { QuickReplies } from "@/components/chat/quick-replies";
import { ConsultationSummary } from "@/components/chat/consultation-summary";
import { ChatProgress } from "@/components/chat/chat-progress";
import { CrisisAlert } from "@/components/chat/crisis-alert";
import { Progress } from "@/components/ui/progress";
import { useConsultationStore } from "@/store/consultation-store";
import { useAuthStore } from "@/store/auth-store";
import { apiClient, getAccessToken } from "@/lib/api-client";
import { formatTime } from "@/lib/utils";
import type { ChatMessage, ConsultationSummary as SummaryType } from "@/types";

const WS_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3200";

export default function ConsultationPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [showProgress, setShowProgress] = useState(false);
  const [crisisAlertOpen, setCrisisAlertOpen] = useState(false);

  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const {
    conversationId,
    phase,
    messages,
    isAiTyping,
    streamingContent,
    quickReplies,
    result,
    status,
    setConversation,
    addMessage,
    setAiTyping,
    setPhase,
    setQuickReplies,
    setResult,
    setStatus,
    appendStreamToken,
    finalizeStream,
    reset,
  } = useConsultationStore();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiTyping, streamingContent]);

  // Initialize consultation
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/consultation");
      return;
    }
    if (!conversationId) {
      startConsultation();
    }
  }, [isAuthenticated, authLoading, conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  // WebSocket connection
  useEffect(() => {
    if (!conversationId || conversationId.startsWith("demo")) return;

    const token = getAccessToken();
    if (!token) return;

    const socket = io(`${WS_URL}/ai-chat`, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_conversation", { conversationId });
    });

    socket.on("ai_stream_start", () => {
      setAiTyping(true);
    });

    socket.on("ai_stream_token", (data: { token: string }) => {
      appendStreamToken(data.token);
    });

    socket.on("ai_stream_end", (data: { messageId: string; fullContent: string }) => {
      finalizeStream(data.messageId, data.fullContent);
    });

    socket.on("phase_changed", (data: { phase: string }) => {
      setPhase(data.phase as any);
    });

    socket.on("summary_ready", (data: { summary: any }) => {
      setResult(data.summary);
      setStatus("COMPLETED");
    });

    socket.on("crisis_detected", () => {
      setCrisisAlertOpen(true);
    });

    socket.on("error", (data: { code: string; message: string }) => {
      console.error("WebSocket error:", data);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  const startConsultation = async () => {
    try {
      const { data } = await apiClient.post("/ai/consultations", {
        type: "CLIENT_CONSULTATION",
      });
      const conv = data.data || data;
      setConversation(conv.conversationId, "CLIENT_CONSULTATION");
      if (conv.initialMessage) {
        addMessage({
          ...conv.initialMessage,
          phase: conv.initialMessage.phase || "GREETING",
          metadata: null,
        });
      }
    } catch {
      // Fallback: create local conversation for demo
      setConversation("demo-conv-1", "CLIENT_CONSULTATION");
      addMessage({
        id: "msg-1",
        role: "assistant",
        content: "Здравствуйте! Я — ИИ-консультант SoulMate.\n\nЯ помогу разобраться в вашем запросе и подобрать специалиста, который действительно вам подходит. Наш разговор полностью конфиденциален.\n\nРасскажите, что привело вас к решению обратиться к специалисту?",
        phase: "GREETING",
        metadata: null,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isAiTyping) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: content.trim(),
        phase,
        metadata: null,
        createdAt: new Date().toISOString(),
      };

      addMessage(userMessage);
      setInputValue("");
      setQuickReplies([]);

      // Send via WebSocket if connected
      if (socketRef.current?.connected && conversationId && !conversationId.startsWith("demo")) {
        setAiTyping(true);
        socketRef.current.emit("send_message", {
          conversationId,
          content: content.trim(),
        });
      }
    },
    [conversationId, phase, isAiTyping, addMessage, setAiTyping, setQuickReplies],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleConfirmSummary = async () => {
    try {
      await apiClient.post(`/ai/consultations/${conversationId}/confirm`, {
        corrections: null,
      });
      router.push("/matching");
    } catch {
      router.push("/matching");
    }
  };

  const phaseSteps: Record<string, number> = {
    GREETING: 1,
    SITUATION_EXPLORATION: 2,
    VALUE_ASSESSMENT: 3,
    FORMAT_PREFERENCES: 4,
    SUMMARY: 5,
    CONFIRMATION: 6,
  };
  const currentStep = phaseSteps[phase] || 1;
  const totalSteps = 6;

  if (authLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-container">
      {/* Sub-header */}
      <div className="border-b border-neutral-300 bg-white px-4 py-3 md:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="text-neutral-600 hover:text-neutral-900 transition-colors"
              aria-label="Назад"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-heading-5 text-neutral-900">ИИ-консультация</h1>
              <p className="text-caption text-neutral-600">
                Шаг {currentStep} из {totalSteps}
              </p>
            </div>
          </div>
          <button
            className="md:hidden rounded-md p-2 text-neutral-600 hover:bg-neutral-200"
            onClick={() => setShowProgress(!showProgress)}
            aria-label="Показать прогресс"
          >
            <BarChart3 className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-3 md:hidden">
          <Progress value={(currentStep / totalSteps) * 100} />
        </div>
      </div>

      <div className="flex">
        {/* Chat area */}
        <div className="flex-1 flex flex-col h-[calc(100vh-11rem)] md:h-[calc(100vh-9rem)]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-4 scrollbar-hide">
            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                role={msg.role}
                content={msg.content}
                timestamp={formatTime(msg.createdAt)}
              />
            ))}

            {isAiTyping && streamingContent ? (
              <ChatBubble
                role="assistant"
                content={streamingContent}
                isStreaming
              />
            ) : isAiTyping ? (
              <TypingIndicator />
            ) : null}

            {quickReplies.length > 0 && !isAiTyping && (
              <div className="flex justify-start pl-11">
                <QuickReplies
                  replies={quickReplies}
                  onSelect={sendMessage}
                  disabled={isAiTyping}
                />
              </div>
            )}

            {result && status === "COMPLETED" && (
              <div className="max-w-lg mx-auto">
                <ConsultationSummary
                  summary={result as SummaryType}
                  onConfirm={handleConfirmSummary}
                  onEdit={() => {
                    setStatus("ACTIVE");
                    setPhase("VALUE_ASSESSMENT");
                  }}
                />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          {status !== "COMPLETED" && (
            <div className="border-t border-neutral-300 bg-white px-4 py-3 md:px-8">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ваш ответ..."
                    className="w-full resize-none rounded-xl border border-neutral-400 bg-white px-4 py-3 pr-12 text-body-md text-neutral-950 placeholder:text-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 max-h-32"
                    rows={1}
                    disabled={isAiTyping}
                    aria-label="Введите сообщение"
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "auto";
                      target.style.height = Math.min(target.scrollHeight, 128) + "px";
                    }}
                  />
                </div>
                <Button
                  size="icon"
                  className="h-11 w-11 rounded-xl shrink-0"
                  onClick={() => sendMessage(inputValue)}
                  disabled={!inputValue.trim() || isAiTyping}
                  aria-label="Отправить"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop sidebar with progress */}
        <aside className="w-80 shrink-0 border-l border-neutral-300 bg-white p-6 overflow-y-auto hidden md:block">
          <ChatProgress currentPhase={phase} />
        </aside>

        {/* Mobile progress panel */}
        {showProgress && (
          <div className="fixed inset-0 z-50 md:hidden" onClick={() => setShowProgress(false)}>
            <div className="absolute inset-0 bg-black/30" />
            <div
              className="absolute right-0 top-0 bottom-0 w-72 bg-white p-6 shadow-xl animate-slide-in-right"
              onClick={(e) => e.stopPropagation()}
            >
              <ChatProgress currentPhase={phase} />
            </div>
          </div>
        )}
      </div>

      <CrisisAlert
        open={crisisAlertOpen}
        onSafe={() => setCrisisAlertOpen(false)}
      />
    </div>
  );
}
