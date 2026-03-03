"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Send, ArrowLeft, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatBubble } from "@/components/chat/chat-bubble";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { QuickReplies } from "@/components/chat/quick-replies";
import { ConsultationSummary } from "@/components/chat/consultation-summary";
import { ChatProgress } from "@/components/chat/chat-progress";
import { CrisisAlert } from "@/components/chat/crisis-alert";
import { useConsultationStore } from "@/store/consultation-store";
import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/lib/api-client";
import { formatTime } from "@/lib/utils";
import type { ChatMessage, ConsultationSummary as SummaryType } from "@/types";

export default function ConsultationPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
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
      router.push("/auth/register?redirect=/consultation");
      return;
    }
    if (!conversationId) {
      startConsultation();
    }
  }, [isAuthenticated, authLoading, conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  const startConsultation = async () => {
    try {
      const { data } = await apiClient.post("/ai/consultations", {
        type: "CLIENT_CONSULTATION",
      });
      const conv = data.data;
      setConversation(conv.conversationId, "CLIENT_CONSULTATION");
      if (conv.initialMessage) {
        addMessage(conv.initialMessage);
      }
    } catch {
      // Demo mode: simulate initial message
      setConversation("demo-conv-1", "CLIENT_CONSULTATION");
      addMessage({
        id: "msg-1",
        role: "assistant",
        content:
          "\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435! \u042F \u2014 \u0418\u0418-\u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u043D\u0442 SoulMate.\n\n\u042F \u043F\u043E\u043C\u043E\u0433\u0443 \u0440\u0430\u0437\u043E\u0431\u0440\u0430\u0442\u044C\u0441\u044F \u0432 \u0432\u0430\u0448\u0435\u043C \u0437\u0430\u043F\u0440\u043E\u0441\u0435 \u0438 \u043F\u043E\u0434\u043E\u0431\u0440\u0430\u0442\u044C \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0441\u0442\u0430, \u043A\u043E\u0442\u043E\u0440\u044B\u0439 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u043E \u0432\u0430\u043C \u043F\u043E\u0434\u0445\u043E\u0434\u0438\u0442. \u041D\u0430\u0448 \u0440\u0430\u0437\u0433\u043E\u0432\u043E\u0440 \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E \u043A\u043E\u043D\u0444\u0438\u0434\u0435\u043D\u0446\u0438\u0430\u043B\u0435\u043D.\n\n\u0420\u0430\u0441\u0441\u043A\u0430\u0436\u0438\u0442\u0435, \u0447\u0442\u043E \u043F\u0440\u0438\u0432\u0435\u043B\u043E \u0432\u0430\u0441 \u043A \u0440\u0435\u0448\u0435\u043D\u0438\u044E \u043E\u0431\u0440\u0430\u0442\u0438\u0442\u044C\u0441\u044F \u043A \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0441\u0442\u0443?",
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
      setAiTyping(true);

      try {
        // In production, this would go through WebSocket.
        // For now we call the REST API as a fallback.
        const { data } = await apiClient.post(
          `/ai/consultations/${conversationId}/messages`,
          { content: content.trim() }
        );

        const response = data.data;
        if (response.phase) setPhase(response.phase);
        if (response.message) addMessage(response.message);
        if (response.quickReplies) setQuickReplies(response.quickReplies);
        if (response.crisisDetected) setCrisisAlertOpen(true);
        if (response.summary) {
          setResult(response.summary);
          setStatus("COMPLETED");
        }
      } catch {
        // Demo: simulate AI response
        setTimeout(() => {
          simulateAiResponse(content);
        }, 1200);
      }
    },
    [conversationId, phase, isAiTyping, addMessage, setAiTyping, setPhase, setQuickReplies, setResult, setStatus]
  );

  const simulateAiResponse = (userInput: string) => {
    const phaseResponses: Record<string, { content: string; nextPhase?: string; quickReplies?: string[] }> = {
      GREETING: {
        content: `\u0421\u043F\u0430\u0441\u0438\u0431\u043E, \u0447\u0442\u043E \u043F\u043E\u0434\u0435\u043B\u0438\u043B\u0438\u0441\u044C. \u042D\u0442\u043E \u0432\u0430\u0436\u043D\u044B\u0439 \u0448\u0430\u0433 \u2014 \u043E\u0431\u0440\u0430\u0442\u0438\u0442\u044C \u0432\u043D\u0438\u043C\u0430\u043D\u0438\u0435 \u043D\u0430 \u0441\u0432\u043E\u0451 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435.\n\n\u041A\u0430\u043A \u0434\u0430\u0432\u043D\u043E \u0432\u044B \u0437\u0430\u043C\u0435\u0447\u0430\u0435\u0442\u0435 \u044D\u0442\u0438 \u0447\u0443\u0432\u0441\u0442\u0432\u0430?`,
        nextPhase: "REQUEST_EXPLORATION",
      },
      REQUEST_EXPLORATION: {
        content: `\u041F\u043E\u043D\u0438\u043C\u0430\u044E. \u0422\u0435\u043F\u0435\u0440\u044C \u044F \u0445\u043E\u0442\u0435\u043B \u0431\u044B \u043B\u0443\u0447\u0448\u0435 \u043F\u043E\u043D\u044F\u0442\u044C \u0432\u0430\u0448\u0438 \u0446\u0435\u043D\u043D\u043E\u0441\u0442\u0438, \u0447\u0442\u043E\u0431\u044B \u043F\u043E\u0434\u043E\u0431\u0440\u0430\u0442\u044C \u0438\u043C\u0435\u043D\u043D\u043E \u0432\u0430\u0448\u0435\u0433\u043E \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0441\u0442\u0430.\n\n\u0427\u0442\u043E \u0434\u043B\u044F \u0432\u0430\u0441 \u043E\u0437\u043D\u0430\u0447\u0430\u0435\u0442 \u0443\u0441\u043F\u0435\u0448\u043D\u0430\u044F \u0436\u0438\u0437\u043D\u044C?`,
        nextPhase: "VALUE_INTERVIEW",
      },
      VALUE_INTERVIEW: {
        content: `\u041E\u0442\u043B\u0438\u0447\u043D\u043E, \u0441\u043F\u0430\u0441\u0438\u0431\u043E \u0437\u0430 \u043E\u0442\u043A\u0440\u044B\u0442\u043E\u0441\u0442\u044C.\n\n\u0422\u0435\u043F\u0435\u0440\u044C \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0432\u043E\u043F\u0440\u043E\u0441\u043E\u0432 \u043E \u0444\u043E\u0440\u043C\u0430\u0442\u0435. \u041A\u0430\u043A\u043E\u0439 \u0444\u043E\u0440\u043C\u0430\u0442 \u0440\u0430\u0431\u043E\u0442\u044B \u0432\u0430\u043C \u0443\u0434\u043E\u0431\u043D\u0435\u0435?`,
        nextPhase: "PREFERENCES",
        quickReplies: ["\u041E\u043D\u043B\u0430\u0439\u043D", "\u041E\u0444\u043B\u0430\u0439\u043D", "\u0413\u0438\u0431\u0440\u0438\u0434"],
      },
      PREFERENCES: {
        content: `\u0421\u043F\u0430\u0441\u0438\u0431\u043E! \u0412\u043E\u0442 \u0447\u0442\u043E \u044F \u043F\u043E\u043D\u044F\u043B \u043E \u0432\u0430\u0448\u0435\u043C \u0437\u0430\u043F\u0440\u043E\u0441\u0435:`,
        nextPhase: "CONFIRMATION",
      },
    };

    const response = phaseResponses[phase] || phaseResponses["GREETING"];

    if (response.nextPhase) {
      setPhase(response.nextPhase as any);
    }

    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: response.content,
      phase: (response.nextPhase || phase) as any,
      metadata: response.quickReplies
        ? { quickReplies: response.quickReplies }
        : null,
      createdAt: new Date().toISOString(),
    };

    addMessage(aiMsg);
    if (response.quickReplies) setQuickReplies(response.quickReplies);
    setAiTyping(false);

    // If phase reached CONFIRMATION, show the summary
    if (response.nextPhase === "CONFIRMATION") {
      setTimeout(() => {
        setResult({
          requestSummary:
            "\u0412\u044B \u043F\u0435\u0440\u0435\u0436\u0438\u0432\u0430\u0435\u0442\u0435 \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E\u0435 \u0432\u044B\u0433\u043E\u0440\u0430\u043D\u0438\u0435 \u0438 \u0445\u043E\u0442\u0438\u0442\u0435 \u043F\u043E\u043D\u044F\u0442\u044C \u0435\u0433\u043E \u0433\u043B\u0443\u0431\u0438\u043D\u043D\u044B\u0435 \u043F\u0440\u0438\u0447\u0438\u043D\u044B. \u0412\u0430\u043C \u043D\u0443\u0436\u0435\u043D \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0441\u0442, \u043A\u043E\u0442\u043E\u0440\u044B\u0439 \u043F\u043E\u043C\u043E\u0436\u0435\u0442 \u0440\u0430\u0437\u043E\u0431\u0440\u0430\u0442\u044C\u0441\u044F \u0432 \u043F\u0440\u0438\u043E\u0440\u0438\u0442\u0435\u0442\u0430\u0445 \u0438 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u043C\u043E\u0442\u0438\u0432\u0430\u0446\u0438\u044E.",
          requestType: "therapy",
          recommendedSpecialistType: "PSYCHOLOGIST",
          valueProfile: {
            values: {
              career: 0.75,
              family: 0.6,
              freedom: 0.85,
              security: 0.4,
              development: 0.9,
              relationships: 0.65,
              health: 0.7,
              creativity: 0.55,
            },
            communicationStyle: {
              directive_vs_supportive: 0.3,
              analytical_vs_intuitive: 0.7,
              structured_vs_free: 0.6,
              past_vs_future: 0.5,
            },
            summary:
              "\u0412\u0430\u043C \u0432\u0430\u0436\u043D\u044B \u0441\u0432\u043E\u0431\u043E\u0434\u0430 \u0438 \u0440\u0430\u0437\u0432\u0438\u0442\u0438\u0435. \u0412\u044B \u043F\u0440\u0435\u0434\u043F\u043E\u0447\u0438\u0442\u0430\u0435\u0442\u0435 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u044E\u0449\u0438\u0439, \u043D\u043E \u0430\u043D\u0430\u043B\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u043F\u043E\u0434\u0445\u043E\u0434.",
          },
          preferences: {
            format: "online",
            priceRange: [2000, 4000],
            frequency: "weekly",
            preferredGender: null,
            preferredTime: "evening",
          },
        });
      }, 500);
    }
  };

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
      router.push("/consultation/results");
    } catch {
      // Demo mode
      router.push("/consultation/results");
    }
  };

  const currentStep =
    phase === "GREETING"
      ? 1
      : phase === "REQUEST_EXPLORATION"
        ? 2
        : phase === "VALUE_INTERVIEW"
          ? 3
          : phase === "PREFERENCES"
            ? 4
            : 5;

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
              aria-label="\u041D\u0430\u0437\u0430\u0434"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-heading-5 text-neutral-900">
                {"\u0418\u0418-\u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u0446\u0438\u044F"}
              </h1>
              <p className="text-caption text-neutral-600">
                {"\u0428\u0430\u0433 "}{currentStep}{" \u0438\u0437 5"}
              </p>
            </div>
          </div>
          {/* Mobile progress toggle */}
          <button
            className="md:hidden rounded-md p-2 text-neutral-600 hover:bg-neutral-200"
            onClick={() => setShowProgress(!showProgress)}
            aria-label="\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441"
          >
            <BarChart3 className="h-5 w-5" />
          </button>
        </div>
        {/* Mobile progress bar */}
        <div className="mt-3 md:hidden">
          <Progress value={(currentStep / 5) * 100} />
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

            {/* Quick replies */}
            {quickReplies.length > 0 && !isAiTyping && (
              <div className="flex justify-start pl-11">
                <QuickReplies
                  replies={quickReplies}
                  onSelect={sendMessage}
                  disabled={isAiTyping}
                />
              </div>
            )}

            {/* Summary card */}
            {result && status === "COMPLETED" && (
              <div className="max-w-lg mx-auto">
                <ConsultationSummary
                  summary={result as SummaryType}
                  onConfirm={handleConfirmSummary}
                  onEdit={() => {
                    setStatus("ACTIVE");
                    setPhase("VALUE_INTERVIEW");
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
                    placeholder={"\u0412\u0430\u0448 \u043E\u0442\u0432\u0435\u0442..."}
                    className="w-full resize-none rounded-xl border border-neutral-400 bg-white px-4 py-3 pr-12 text-body-md text-neutral-950 placeholder:text-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 max-h-32"
                    rows={1}
                    disabled={isAiTyping}
                    aria-label="\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435"
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "auto";
                      target.style.height =
                        Math.min(target.scrollHeight, 128) + "px";
                    }}
                  />
                </div>
                <Button
                  size="icon"
                  className="h-11 w-11 rounded-xl shrink-0"
                  onClick={() => sendMessage(inputValue)}
                  disabled={!inputValue.trim() || isAiTyping}
                  aria-label="\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop sidebar with progress */}
        <aside
          className={`w-80 shrink-0 border-l border-neutral-300 bg-white p-6 overflow-y-auto hidden md:block`}
        >
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

      {/* Crisis alert modal */}
      <CrisisAlert
        open={crisisAlertOpen}
        onSafe={() => setCrisisAlertOpen(false)}
      />
    </div>
  );
}
