import { create } from "zustand";
import {
  ChatMessage,
  ConsultationPhase,
  ConsultationResult,
  ConsultationType,
} from "@/types";

interface ConsultationStore {
  conversationId: string | null;
  type: ConsultationType | null;
  status: "IDLE" | "ACTIVE" | "COMPLETED" | "PAUSED";
  phase: ConsultationPhase;
  messages: ChatMessage[];
  result: ConsultationResult | null;
  isAiTyping: boolean;
  streamingContent: string;
  quickReplies: string[];
  error: string | null;

  setConversation: (id: string, type: ConsultationType) => void;
  setPhase: (phase: ConsultationPhase) => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setAiTyping: (typing: boolean) => void;
  appendStreamToken: (token: string) => void;
  finalizeStream: (messageId: string, fullContent: string) => void;
  setQuickReplies: (replies: string[]) => void;
  setResult: (result: ConsultationResult) => void;
  setStatus: (status: "IDLE" | "ACTIVE" | "COMPLETED" | "PAUSED") => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  conversationId: null,
  type: null,
  status: "IDLE" as const,
  phase: "GREETING" as ConsultationPhase,
  messages: [],
  result: null,
  isAiTyping: false,
  streamingContent: "",
  quickReplies: [],
  error: null,
};

export const useConsultationStore = create<ConsultationStore>((set) => ({
  ...initialState,

  setConversation: (id, type) =>
    set({ conversationId: id, type, status: "ACTIVE" }),

  setPhase: (phase) => set({ phase }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
      quickReplies:
        message.metadata?.quickReplies || state.quickReplies,
    })),

  setMessages: (messages) => set({ messages }),

  setAiTyping: (typing) =>
    set({ isAiTyping: typing, streamingContent: typing ? "" : "" }),

  appendStreamToken: (token) =>
    set((state) => ({
      streamingContent: state.streamingContent + token,
    })),

  finalizeStream: (messageId, fullContent) =>
    set((state) => {
      const existingIndex = state.messages.findIndex(
        (m) => m.id === messageId
      );
      if (existingIndex >= 0) {
        const updated = [...state.messages];
        updated[existingIndex] = {
          ...updated[existingIndex],
          content: fullContent,
        };
        return {
          messages: updated,
          isAiTyping: false,
          streamingContent: "",
        };
      }
      return {
        messages: [
          ...state.messages,
          {
            id: messageId,
            role: "assistant",
            content: fullContent,
            phase: state.phase,
            metadata: null,
            createdAt: new Date().toISOString(),
          },
        ],
        isAiTyping: false,
        streamingContent: "",
      };
    }),

  setQuickReplies: (replies) => set({ quickReplies: replies }),

  setResult: (result) => set({ result, status: "COMPLETED" }),

  setStatus: (status) => set({ status }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
