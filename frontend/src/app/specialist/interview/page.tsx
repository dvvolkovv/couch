"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { Send, ArrowLeft, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatBubble } from "@/components/chat/chat-bubble";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { Progress } from "@/components/ui/progress";
import { useConsultationStore } from "@/store/consultation-store";
import { useAuthStore } from "@/store/auth-store";
import { apiClient, getAccessToken } from "@/lib/api-client";
import { formatTime } from "@/lib/utils";
import type { ChatMessage } from "@/types";

const WS_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3200");

const PHASE_STEPS: Record<string, { step: number; label: string }> = {
  GREETING: { step: 1, label: "Знакомство" },
  PROFESSIONAL_BACKGROUND: { step: 2, label: "Профессиональный опыт" },
  CASE_QUESTIONS: { step: 3, label: "Работа с клиентами" },
  WORK_STYLE: { step: 4, label: "Стиль работы" },
  VALUE_ASSESSMENT: { step: 5, label: "Ценности и подходы" },
  SUMMARY: { step: 6, label: "Ваш портрет" },
  CONFIRMATION: { step: 7, label: "Подтверждение" },
};
const TOTAL_STEPS = 7;

export default function SpecialistInterviewPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [showProgress, setShowProgress] = useState(false);

  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore();
  const {
    conversationId,
    phase,
    messages,
    isAiTyping,
    streamingContent,
    status,
    setConversation,
    addMessage,
    setAiTyping,
    setPhase,
    setResult,
    setStatus,
    appendStreamToken,
    finalizeStream,
    reset,
  } = useConsultationStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiTyping, streamingContent]);

  // Guard: only specialists
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/specialist/interview");
      return;
    }
    if (user?.role !== "SPECIALIST") {
      router.push("/dashboard");
      return;
    }
    if (!conversationId) {
      startInterview();
    }
  }, [isAuthenticated, authLoading, conversationId, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // WebSocket
  useEffect(() => {
    if (!conversationId || conversationId.startsWith("demo")) return;
    const token = getAccessToken();
    if (!token) return;

    const socket = io(`${WS_URL}/ai-chat`, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => socket.emit("join_conversation", { conversationId }));
    socket.on("ai_stream_start", () => setAiTyping(true));
    socket.on("ai_stream_token", (data: { token: string }) => appendStreamToken(data.token));
    socket.on("ai_stream_end", (data: { messageId: string; fullContent: string }) =>
      finalizeStream(data.messageId, data.fullContent)
    );
    socket.on("phase_changed", (data: { phase: string }) => setPhase(data.phase as any));
    socket.on("summary_ready", (data: { summary: any }) => {
      setResult(data.summary);
      setStatus("COMPLETED");
    });
    socket.on("error", (data: { code: string; message: string }) =>
      console.error("WebSocket error:", data)
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  const startInterview = async () => {
    reset();
    try {
      const { data } = await apiClient.post("/ai/consultations", {
        type: "SPECIALIST_INTERVIEW",
      });
      const conv = data.data || data;
      setConversation(conv.conversationId, "SPECIALIST_INTERVIEW");
      if (conv.initialMessage) {
        addMessage({ ...conv.initialMessage, phase: conv.initialMessage.phase || "GREETING", metadata: null });
      }
    } catch {
      setConversation("demo-spec-1", "SPECIALIST_INTERVIEW");
      addMessage({
        id: "msg-1",
        role: "assistant",
        content: "Здравствуйте! Я — ИИ-интервьюер платформы Hearty.\n\nМне предстоит узнать о вашем профессиональном опыте, ценностях и подходах к работе. Это поможет создать ваш ценностный портрет для точного подбора клиентов.\n\nРасскажите немного о себе — кто вы по специальности и как давно работаете с клиентами?",
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
      if (socketRef.current?.connected && conversationId && !conversationId.startsWith("demo")) {
        setAiTyping(true);
        socketRef.current.emit("send_message", { conversationId, content: content.trim() });
      }
    },
    [conversationId, phase, isAiTyping, addMessage, setAiTyping]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleConfirm = async () => {
    try {
      await apiClient.post(`/ai/consultations/${conversationId}/confirm`, { corrections: null });
    } catch {
      // proceed anyway
    }
    router.push("/specialist/dashboard");
  };

  const currentPhaseInfo = PHASE_STEPS[phase] || PHASE_STEPS.GREETING;
  const progressPercent = (currentPhaseInfo.step / TOTAL_STEPS) * 100;

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
              onClick={() => router.push("/specialist/dashboard")}
              className="text-neutral-600 hover:text-neutral-900 transition-colors"
              aria-label="Назад"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-heading-5 text-neutral-900">ИИ-интервью специалиста</h1>
              <p className="text-caption text-neutral-600">
                {currentPhaseInfo.label} · Шаг {currentPhaseInfo.step} из {TOTAL_STEPS}
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
        <div className="mt-3">
          <Progress value={progressPercent} />
        </div>
      </div>

      <div className="flex">
        {/* Chat area */}
        <div className="flex-1 flex flex-col h-[calc(100vh-11rem)] md:h-[calc(100vh-9rem)]">
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
              <ChatBubble role="assistant" content={streamingContent} isStreaming />
            ) : isAiTyping ? (
              <TypingIndicator />
            ) : null}

            {status === "COMPLETED" && (
              <div className="max-w-lg mx-auto rounded-2xl border border-primary-200 bg-primary-50 p-6 text-center space-y-4">
                <div className="text-2xl">🎉</div>
                <h3 className="text-heading-4 text-neutral-900">Интервью завершено!</h3>
                <p className="text-body-md text-neutral-600">
                  Ваш ценностный портрет создан. Теперь платформа сможет подбирать подходящих клиентов.
                </p>
                <Button onClick={handleConfirm} className="w-full">
                  Перейти в кабинет специалиста
                </Button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

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

        {/* Desktop sidebar */}
        <aside className="w-72 shrink-0 border-l border-neutral-300 bg-white p-6 hidden md:block">
          <h3 className="text-heading-5 text-neutral-900 mb-4">Этапы интервью</h3>
          <div className="space-y-3">
            {Object.entries(PHASE_STEPS).map(([key, { step, label }]) => {
              const done = step < currentPhaseInfo.step;
              const active = key === phase;
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-caption font-semibold shrink-0 ${
                    done ? "bg-primary-600 text-white" : active ? "bg-primary-100 text-primary-700 ring-2 ring-primary-400" : "bg-neutral-200 text-neutral-500"
                  }`}>
                    {done ? "✓" : step}
                  </div>
                  <span className={`text-body-sm ${active ? "font-semibold text-neutral-900" : done ? "text-neutral-500" : "text-neutral-400"}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
