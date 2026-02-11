import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/user";
import { login as apiLogin, signup as apiSignup, logout as apiLogout } from "@/lib/api";

const STORAGE_KEY = "takunda-auth";

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,

      login: async (email: string, password: string) => {
        const result = await apiLogin(email, password);
        if (result) {
          set({ user: result.user, isLoggedIn: true });
          return true;
        }
        return false;
      },

      signup: async (email: string, password: string, name: string) => {
        const result = await apiSignup({ email, password, name });
        set({ user: result.user, isLoggedIn: true });
        return true;
      },

      logout: () => {
        apiLogout();
        set({ user: null, isLoggedIn: false });
      },
    }),
    { name: STORAGE_KEY }
  )
);
