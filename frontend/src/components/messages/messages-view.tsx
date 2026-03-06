"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { Send, ArrowLeft, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth-store";
import { apiClient, getAccessToken } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { MessageThread, DirectMessage, ThreadDetail } from "@/types";

const WS_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3200");

interface MessagesViewProps {
  userRole: "CLIENT" | "SPECIALIST";
}

export function MessagesView({ userRole }: MessagesViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [threadDetail, setThreadDetail] = useState<ThreadDetail | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const selectedThreadRef = useRef<string | null>(null);

  // Keep ref in sync for use inside socket callbacks
  useEffect(() => {
    selectedThreadRef.current = selectedThread;
  }, [selectedThread]);

  // Auth guard
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      const redirect =
        userRole === "SPECIALIST"
          ? "/specialist/messages"
          : "/dashboard/messages";
      router.push(`/auth/login?redirect=${redirect}`);
    }
  }, [isAuthenticated, authLoading, router, userRole]);

  // Fetch threads
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchThreads();
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle threadId from URL
  useEffect(() => {
    const tid = searchParams.get("thread");
    if (tid && threads.length > 0) {
      selectThread(tid);
    }
  }, [searchParams, threads]); // eslint-disable-line react-hooks/exhaustive-deps

  // WebSocket connection
  useEffect(() => {
    if (!isAuthenticated) return;
    const token = getAccessToken();
    if (!token) return;

    const socket = io(`${WS_URL}/messages`, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      if (selectedThreadRef.current) {
        socket.emit("join_thread", { threadId: selectedThreadRef.current });
      }
    });

    socket.on(
      "new_message",
      (data: { threadId: string; message: DirectMessage }) => {
        const currentThread = selectedThreadRef.current;

        // Append message if this is the active thread
        if (data.threadId === currentThread) {
          setMessages((prev) => [...prev, data.message]);
        }

        // Update thread list
        setThreads((prev) => {
          const updated = prev.map((t) => {
            if (t.threadId === data.threadId) {
              return {
                ...t,
                lastMessage: {
                  id: data.message.id,
                  content: data.message.content,
                  senderId: data.message.senderId,
                  createdAt: data.message.createdAt,
                },
                lastMessageAt: data.message.createdAt,
                unreadCount:
                  data.threadId === currentThread
                    ? t.unreadCount
                    : t.unreadCount + 1,
              };
            }
            return t;
          });
          return updated.sort(
            (a, b) =>
              new Date(b.lastMessageAt).getTime() -
              new Date(a.lastMessageAt).getTime()
          );
        });
      }
    );

    socket.on(
      "typing",
      (data: { threadId: string; userId: string }) => {
        if (
          data.threadId === selectedThreadRef.current &&
          data.userId !== user?.id
        ) {
          setIsTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
        }
      }
    );

    socket.on(
      "messages_read",
      (data: { threadId: string; readBy: string }) => {
        if (data.threadId === selectedThreadRef.current) {
          setMessages((prev) =>
            prev.map((m) =>
              m.senderId === user?.id && !m.readAt
                ? { ...m, readAt: new Date().toISOString() }
                : m
            )
          );
        }
      }
    );

    socket.on("error", (data: { code: string; message: string }) => {
      console.error("Messages WebSocket error:", data);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchThreads = async () => {
    try {
      setLoadingThreads(true);
      const { data } = await apiClient.get("/messages/threads");
      setThreads(data.data || data || []);
    } catch (err) {
      console.error("Failed to fetch threads:", err);
    } finally {
      setLoadingThreads(false);
    }
  };

  const selectThread = async (threadId: string) => {
    setSelectedThread(threadId);
    setShowChat(true);
    setLoadingMessages(true);

    try {
      const { data } = await apiClient.get(
        `/messages/threads/${threadId}?page=1&limit=50`
      );
      const detail: ThreadDetail = data.data || data;
      setThreadDetail(detail);
      setMessages(detail.messages || []);

      // Join WebSocket room
      socketRef.current?.emit("join_thread", { threadId });

      // Mark as read
      await apiClient.patch(`/messages/threads/${threadId}/read`);
      socketRef.current?.emit("mark_read", { threadId });

      // Update unread count in thread list
      setThreads((prev) =>
        prev.map((t) =>
          t.threadId === threadId ? { ...t, unreadCount: 0 } : t
        )
      );
    } catch (err) {
      console.error("Failed to fetch thread:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || !selectedThread) return;

    const content = inputValue.trim();
    setInputValue("");

    // Send via WebSocket for real-time delivery
    if (socketRef.current?.connected) {
      socketRef.current.emit("send_message", {
        threadId: selectedThread,
        content,
      });
    } else {
      // Fallback to REST API
      try {
        const { data } = await apiClient.post(
          `/messages/threads/${selectedThread}`,
          { content }
        );
        const msg: DirectMessage = data.data || data;
        setMessages((prev) => [...prev, msg]);
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    }
  }, [inputValue, selectedThread]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (selectedThread && socketRef.current?.connected) {
      socketRef.current.emit("typing", { threadId: selectedThread });
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return "сейчас";
    if (diffMin < 60) return `${diffMin} мин`;
    if (diffHour < 24) return `${diffHour} ч`;
    if (diffDay < 7) return `${diffDay} дн`;
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    });
  };

  const formatMessageTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (
    participant: { firstName: string; lastName: string } | null
  ) => {
    if (!participant) return "?";
    return `${participant.firstName[0] || ""}${(participant.lastName || "")[0] || ""}`;
  };

  const getFullName = (
    participant: { firstName: string; lastName?: string } | null
  ) => {
    if (!participant) return "Пользователь";
    return `${participant.firstName} ${participant.lastName || ""}`.trim();
  };

  if (authLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const emptyLabel =
    userRole === "SPECIALIST" ? "клиентами" : "специалистами";

  return (
    <div className="mx-auto max-w-container h-[calc(100vh-4rem)]">
      <div className="flex h-full border-x border-neutral-200">
        {/* Thread List */}
        <div
          className={cn(
            "w-full md:w-80 lg:w-96 border-r border-neutral-200 flex flex-col",
            showChat ? "hidden md:flex" : "flex"
          )}
        >
          <div className="px-4 py-4 border-b border-neutral-200">
            <h1 className="text-heading-4 text-neutral-900">Сообщения</h1>
          </div>

          {loadingThreads ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
            </div>
          ) : threads.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 mb-4">
                <MessageCircle className="h-8 w-8 text-neutral-400" />
              </div>
              <p className="text-body-md text-neutral-600">Нет сообщений</p>
              <p className="text-body-sm text-neutral-500 mt-1">
                Здесь будут ваши переписки с {emptyLabel}
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto" role="list" aria-label="Список чатов">
              {threads.map((thread) => (
                <button
                  key={thread.threadId}
                  onClick={() => selectThread(thread.threadId)}
                  role="listitem"
                  aria-current={
                    selectedThread === thread.threadId ? "true" : undefined
                  }
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-left",
                    selectedThread === thread.threadId && "bg-primary-50"
                  )}
                >
                  <Avatar className="h-12 w-12 shrink-0">
                    {thread.participant?.avatarUrl && (
                      <AvatarImage
                        src={thread.participant.avatarUrl}
                        alt={getFullName(thread.participant)}
                      />
                    )}
                    <AvatarFallback className="text-body-sm">
                      {getInitials(thread.participant)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm font-medium text-neutral-900 truncate">
                        {getFullName(thread.participant)}
                      </span>
                      <span className="text-caption text-neutral-500 shrink-0 ml-2">
                        {thread.lastMessage
                          ? formatTimeAgo(thread.lastMessage.createdAt)
                          : ""}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-body-sm text-neutral-600 truncate">
                        {thread.lastMessage?.content || "Начните общение"}
                      </p>
                      {thread.unreadCount > 0 && (
                        <span
                          className="ml-2 h-5 min-w-[20px] rounded-full bg-primary-600 text-[11px] font-bold text-white flex items-center justify-center px-1.5 shrink-0"
                          aria-label={`${thread.unreadCount} непрочитанных`}
                        >
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div
          className={cn(
            "flex-1 flex flex-col",
            !showChat ? "hidden md:flex" : "flex"
          )}
        >
          {selectedThread && threadDetail ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 bg-white">
                <button
                  onClick={() => {
                    setShowChat(false);
                    setSelectedThread(null);
                  }}
                  className="md:hidden text-neutral-600 hover:text-neutral-900"
                  aria-label="Назад к списку чатов"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Avatar className="h-10 w-10">
                  {threadDetail.participant?.avatarUrl && (
                    <AvatarImage
                      src={threadDetail.participant.avatarUrl}
                      alt={getFullName(threadDetail.participant)}
                    />
                  )}
                  <AvatarFallback className="text-body-sm">
                    {getInitials(threadDetail.participant)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-body-md font-medium text-neutral-900">
                    {getFullName(threadDetail.participant)}
                  </h2>
                  {isTyping && (
                    <p className="text-caption text-primary-600">
                      печатает...
                    </p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-neutral-50"
                role="log"
                aria-label="История сообщений"
                aria-live="polite"
              >
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-center">
                    <p className="text-body-sm text-neutral-500">
                      Начните общение -- напишите первое сообщение
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.senderId === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex",
                          isMine ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[75%] rounded-2xl px-4 py-2.5",
                            isMine
                              ? "bg-primary-600 text-white rounded-br-md"
                              : "bg-white text-neutral-900 border border-neutral-200 rounded-bl-md"
                          )}
                        >
                          <p className="text-body-sm whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                          {msg.fileUrl && (
                            <a
                              href={msg.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                "text-body-sm underline mt-1 block",
                                isMine
                                  ? "text-white/80 hover:text-white"
                                  : "text-primary-600 hover:text-primary-700"
                              )}
                            >
                              {msg.fileName || "Файл"}
                            </a>
                          )}
                          <div
                            className={cn(
                              "flex items-center gap-1 mt-1",
                              isMine ? "justify-end" : "justify-start"
                            )}
                          >
                            <span
                              className={cn(
                                "text-[11px]",
                                isMine ? "text-white/70" : "text-neutral-400"
                              )}
                            >
                              {formatMessageTime(msg.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-neutral-200 bg-white px-4 py-3">
                <div className="flex items-end gap-3">
                  <textarea
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Введите сообщение..."
                    aria-label="Введите сообщение"
                    className="flex-1 resize-none rounded-xl border border-neutral-300 bg-white px-4 py-3 text-body-md text-neutral-950 placeholder:text-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 max-h-32"
                    rows={1}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "auto";
                      target.style.height =
                        Math.min(target.scrollHeight, 128) + "px";
                    }}
                  />
                  <Button
                    size="icon"
                    className="h-11 w-11 rounded-xl shrink-0"
                    onClick={sendMessage}
                    disabled={!inputValue.trim()}
                    aria-label="Отправить сообщение"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 mb-6">
                <MessageCircle className="h-10 w-10 text-neutral-400" />
              </div>
              <h2 className="text-heading-4 text-neutral-900 mb-2">
                Выберите чат
              </h2>
              <p className="text-body-md text-neutral-600 max-w-sm">
                Выберите собеседника из списка слева, чтобы начать переписку
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
