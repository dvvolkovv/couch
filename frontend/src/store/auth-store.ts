import { create } from "zustand";
import { User, UserRole } from "@/types";
import { apiClient, setAccessToken, getAccessToken } from "@/lib/api-client";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  loginPhone: (phone: string) => Promise<{ retryAfter: number }>;
  verifyPhone: (phone: string, code: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    role: UserRole;
  }) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setUser: (user: User) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initialize: async () => {
    const token = getAccessToken();
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    try {
      const { data } = await apiClient.get("/users/me");
      set({ user: data.data, isAuthenticated: true, isLoading: false });
    } catch {
      setAccessToken(null);
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  login: async (email, password) => {
    set({ error: null });
    try {
      const { data } = await apiClient.post("/auth/login/email", {
        email,
        password,
      });
      setAccessToken(data.data.accessToken);
      set({ user: data.data.user, isAuthenticated: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ||
        "\u041E\u0448\u0438\u0431\u043A\u0430 \u0432\u0445\u043E\u0434\u0430";
      set({ error: message });
      throw err;
    }
  },

  loginPhone: async (phone) => {
    set({ error: null });
    try {
      const { data } = await apiClient.post("/auth/login/phone", { phone });
      return { retryAfter: data.data.retryAfter };
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ||
        "\u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438 SMS";
      set({ error: message });
      throw err;
    }
  },

  verifyPhone: async (phone, code) => {
    set({ error: null });
    try {
      const { data } = await apiClient.post("/auth/verify/phone", {
        phone,
        code,
      });
      setAccessToken(data.data.accessToken);
      set({ user: data.data.user, isAuthenticated: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ||
        "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u043A\u043E\u0434";
      set({ error: message });
      throw err;
    }
  },

  register: async (registerData) => {
    set({ error: null });
    try {
      await apiClient.post("/auth/register/email", {
        ...registerData,
        privacyAccepted: true,
        termsAccepted: true,
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ||
        "\u041E\u0448\u0438\u0431\u043A\u0430 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0438";
      set({ error: message });
      throw err;
    }
  },

  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // ignore
    }
    setAccessToken(null);
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    try {
      const { data } = await apiClient.get("/users/me");
      set({ user: data.data, isAuthenticated: true });
    } catch {
      set({ isAuthenticated: false });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: true }),
}));
